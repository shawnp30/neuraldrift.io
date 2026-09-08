// Usage: npm run evidence:run -- path/to/config.json
// One observed attempt per immutable record. Never overwrites legacy evidence.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { apiPrompt } from './workflow-api.mjs';

const configPath = process.argv[2];
if (!configPath) throw new Error('Supply execution config JSON; see docs/phase7.md.');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!/^\d{2}$/.test(config.workflowId) || !['STANDARD', 'OPTIMIZED'].includes(config.executionProfile)) throw new Error('Valid workflowId and STANDARD/OPTIMIZED executionProfile required.');
if (config.executionProfile === 'OPTIMIZED' && (!config.promptFile || !config.optimizationNotes)) throw new Error('OPTIMIZED requires an explicit API prompt and optimization notes.');
if (config.executionProfile === 'STANDARD' && config.promptFile) throw new Error('STANDARD uses the unchanged catalog graph. A supplied modified prompt must be OPTIMIZED.');
const endpoint = new URL(config.endpoint);
if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error('Supply a ComfyUI HTTP(S) endpoint without embedded credentials.');
const hardware = JSON.parse(fs.readFileSync('data/hardware-profiles.json', 'utf8')).find(p => p.id === config.hardwareProfileId);
if (!hardware) throw new Error('Register an observed hardware profile before running; see docs/phase7.md.');
const request = async (route, options = {}) => {
  const res = await fetch(new URL(route, endpoint), { ...options, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`ComfyUI ${route.split('?')[0]} HTTP ${res.status}: ${(await res.text()).slice(0, 4000)}`);
  return res;
};
// Do not record a failure against hardware that was never reached or verified.
const stats = await (await request('/system_stats')).json();
const device = stats.devices?.[config.deviceIndex ?? 0];
if (!device || !device.name.includes(hardware.name) || device.type !== 'cuda' || Math.abs(device.vram_total - hardware.vramBytes) > 128 * 1024 ** 2) throw new Error('Live ComfyUI device does not match the registered hardware profile. No workflow submitted.');
if (stats.devices.filter(d => d.type === 'cuda').length !== 1) throw new Error('Use a ComfyUI runtime exposing one selected CUDA device so hardware attribution is unambiguous.');
const queue = await (await request('/queue')).json();
if (queue.queue_running?.length || queue.queue_pending?.length) throw new Error('ComfyUI queue is busy; retry when idle.');
const bytes = fs.readFileSync(`public/workflows/${config.workflowId}.json`);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const id = `${config.workflowId}-${Date.now()}-${crypto.randomUUID()}`;
const record = {
  id, workflowId: config.workflowId, hardwareProfileId: hardware.id, workflowSha256: sha(bytes), promptSha256: null,
  testDate: new Date().toISOString(), executionProfile: config.executionProfile, outcome: 'FAILURE', failure: null,
  settings: {}, environment: stats.system, models: [], runtimeSeconds: null, artifact: null,
  evidenceUrl: `/workflow-executions/${id}/record.json`, optimizationNotes: config.optimizationNotes ?? null,
  comparisonManifest: null,
};
let stage = 'preflight';
const raw = { stats, baselinePrompt: null, prompt: null, submission: null, history: null };
const outputDir = `public/workflow-executions/${id}`;
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(`${outputDir}/workflow.json`, bytes, { flag: 'wx' });
try {
  const info = await (await request('/object_info')).json();
  const graph = JSON.parse(bytes);
  raw.baselinePrompt = graph.nodes ? apiPrompt(graph, info) : graph;
  raw.prompt = config.promptFile ? JSON.parse(fs.readFileSync(config.promptFile, 'utf8')) : raw.baselinePrompt;
  if (raw.prompt.prompt) raw.prompt = raw.prompt.prompt;
  record.promptSha256 = sha(JSON.stringify(raw.prompt));
  record.settings = { prompt: raw.prompt };
  // Capture all recognized model loader inputs. Unknown hashes stay null.
  const modelKeys = /^(ckpt_name|unet_name|vae_name|clip_name\d*|lora_name|control_net_name|model_name)$/;
  const filenames = [...new Set(Object.values(raw.prompt).flatMap(n => Object.entries(n.inputs ?? {}).filter(([k, v]) => modelKeys.test(k) && typeof v === 'string').map(([, v]) => v)))];
  for (const filename of filenames) {
    let hash = null;
    const file = config.modelFiles?.[filename];
    if (file) {
      if (!['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) throw new Error('Remote model hashes must be collected on the execution host; local files cannot establish remote model identity.');
      const h = crypto.createHash('sha256');
      for await (const chunk of fs.createReadStream(file)) h.update(chunk);
      hash = h.digest('hex');
    }
    record.models.push({ filename, sha256: hash });
  }
  // Comparability remains unavailable unless a fully verified manifest is collected.
  // The runner deliberately does not accept arbitrary comparison claims from config.
  stage = 'transport';
  const submitted = await fetch(new URL('/prompt', endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: raw.prompt, client_id: id }), signal: AbortSignal.timeout(30000) });
  raw.submission = await submitted.json();
  if (!submitted.ok || !raw.submission.prompt_id || Object.keys(raw.submission.node_errors ?? {}).length) {
    stage = 'preflight'; throw new Error(JSON.stringify(raw.submission));
  }
  const deadline = Date.now() + Math.min(config.timeoutSeconds ?? 600, 3600) * 1000;
  while (Date.now() < deadline) {
    const history = await (await request(`/history/${raw.submission.prompt_id}`)).json();
    const run = history[raw.submission.prompt_id];
    if (run) {
      raw.history = run;
      const messages = run.status?.messages ?? [];
      const failure = messages.find(([kind]) => kind === 'execution_error' || kind === 'execution_interrupted');
      if (failure) {
        record.failure = { stage: 'execution', type: failure[1].exception_type ?? failure[0], message: failure[1].exception_message ?? JSON.stringify(failure[1]) };
        break;
      }
      const success = messages.find(([kind]) => kind === 'execution_success');
      if (success && run.status?.completed) {
        const start = messages.find(([kind]) => kind === 'execution_start')?.[1].timestamp;
        record.runtimeSeconds = start ? (success[1].timestamp - start) / 1000 : null;
        const outputs = Object.values(run.outputs ?? {}).flatMap(o => Object.values(o).flat()).filter(o => o && typeof o === 'object' && typeof o.filename === 'string');
        if (!outputs.length) throw new Error('Execution completed without a downloadable output artifact; success not established.');
        for (const [index, output] of outputs.entries()) {
          const ext = path.extname(output.filename).replace(/[^.a-zA-Z0-9]/g, '') || '.bin';
          const fileName = `output-${index}${ext}`;
          const response = await request(`/view?${new URLSearchParams({ filename: output.filename, subfolder: output.subfolder ?? '', type: output.type ?? 'output' })}`);
          fs.writeFileSync(`${outputDir}/${fileName}`, Buffer.from(await response.arrayBuffer()), { flag: 'wx' });
          if (index === 0) record.artifact = `/workflow-executions/${id}/${fileName}`;
        }
        record.outcome = 'SUCCESS';
        break;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (record.outcome !== 'SUCCESS' && !record.failure) record.failure = { stage: 'transport', type: 'TIMEOUT', message: 'No terminal execution evidence before deadline. Runtime outcome is unknown; request may still be queued or running. Inspect the saved prompt ID before retrying.' };
} catch (error) {
  record.failure ??= { stage, type: error.cause?.code ?? error.name, message: error.message };
}
if (record.failure?.stage === 'transport') record.outcome = 'INDETERMINATE';
record.rawEvidence = `/workflow-executions/${id}/raw.json`;
fs.writeFileSync(`${outputDir}/raw.json`, JSON.stringify(raw, null, 2), { flag: 'wx' });
fs.writeFileSync(`${outputDir}/record.json`, JSON.stringify(record, null, 2), { flag: 'wx' });
// Exclusive lock prevents concurrent read/modify/write from losing evidence.
const lock = fs.openSync('data/workflow-executions.lock', 'wx');
try {
  const records = JSON.parse(fs.readFileSync('data/workflow-executions.json', 'utf8'));
  if (records.some(r => r.id === id)) throw new Error('Duplicate execution ID');
  records.push(record);
  fs.writeFileSync('data/workflow-executions.json.tmp', JSON.stringify(records, null, 2) + '\n');
  fs.renameSync('data/workflow-executions.json.tmp', 'data/workflow-executions.json');
} finally { fs.closeSync(lock); fs.unlinkSync('data/workflow-executions.lock'); }
console.log(JSON.stringify(record, null, 2));
if (record.outcome !== 'SUCCESS') process.exitCode = 1;
