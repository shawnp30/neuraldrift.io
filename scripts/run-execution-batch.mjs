// Runs scripts/run-execution.mjs for many workflows, several times each, against one
// local ComfyUI. Every attempt is still its own immutable record; this only drives them.
//
// Usage: npm run evidence:batch -- path/to/base-config.json [--repeats 3] [--workflows 04,29] [--optimized] [--check-only]
// The base config is a run-execution config without workflowId/executionProfile.
// --optimized runs OPTIMIZED from data/optimized-prompts/<id>.json (npm run evidence:optimize)
// instead of STANDARD; workflows without a current optimized prompt are skipped.
// Default workflows: every workflow with a completed legacy test in data/workflow-tests.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { apiPrompt, savedOptimizedPrompt, savedSubgraphPrompt } from './workflow-api.mjs';

const runnerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'run-execution.mjs');

const args = process.argv.slice(2);
const basePath = args[0];
if (!basePath || basePath.startsWith('--')) throw new Error('Supply a base config JSON as the first argument; see docs/phase7.md.');
const flag = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? undefined : args[i + 1]; };
const repeats = Number(flag('repeats') ?? 3);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10) throw new Error('--repeats must be an integer from 1 to 10.');
const optimized = args.includes('--optimized');
const executionProfile = optimized ? 'OPTIMIZED' : 'STANDARD';

const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
if (base.workflowId || base.executionProfile) throw new Error('The base config must not set workflowId or executionProfile; the batch sets them.');
const legacyTests = JSON.parse(fs.readFileSync('data/workflow-tests.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('data/workflow-assets.json', 'utf8'));
const workflowIds = (flag('workflows')?.split(',') ?? Object.keys(legacyTests).filter((id) => legacyTests[id]?.status === 'completed')).sort();
for (const id of workflowIds) if (!/^\d{2}$/.test(id) || !assets[id]) throw new Error(`Unknown workflow ID: ${id}`);

// Convert each catalog graph exactly as the runner will, then check every dropdown value
// (model files, input images) against that node's own option list in the live ComfyUI.
// A missing download or input file is a setup gap, not a GPU result, so it is skipped
// instead of recorded. So is a subgraph workflow without a current frontend conversion, and in
// --optimized mode a workflow without a current optimized prompt.
// Other conversion errors are left for the runner to record.
const objectInfo = await (await fetch(new URL('/object_info', base.endpoint), { signal: AbortSignal.timeout(60000) })).json();
const comboOptions = (definition) => {
  const [type, options] = definition ?? [];
  if (Array.isArray(type)) return type;
  if (type === 'COMBO' && Array.isArray(options?.options)) return options.options;
  return null;
};
function setupGap(workflowId) {
  const graph = JSON.parse(fs.readFileSync(`public/workflows/${workflowId}.json`, 'utf8'));
  let prompt;
  if (optimized) {
    try { prompt = savedOptimizedPrompt(workflowId).prompt; } catch (error) { return error.message; }
  } else if (graph.definitions?.subgraphs?.length) {
    try { prompt = savedSubgraphPrompt(workflowId); } catch (error) { return error.message; }
  } else {
    try {
      prompt = apiPrompt(graph, objectInfo);
    } catch (error) {
      console.log(`NOTE ${workflowId}: graph conversion failed (${error.message}); the runner will record it as a preflight failure.`);
      return null;
    }
  }
  const missing = [];
  for (const node of Object.values(prompt)) {
    if (!objectInfo[node.class_type]) { missing.push(`node ${node.class_type}`); continue; }
    const schema = objectInfo[node.class_type].input;
    for (const [name, value] of Object.entries(node.inputs)) {
      const options = comboOptions(schema.required?.[name] ?? schema.optional?.[name]);
      if (options && typeof value === 'string' && !options.includes(value)) missing.push(`${node.class_type}.${name} = ${value}`);
    }
  }
  return missing.length ? `not available in this ComfyUI: ${missing.join(', ')}` : null;
}

const runnable = [];
for (const id of workflowIds) {
  const gap = setupGap(id);
  if (gap) console.log(`SKIP ${id}: ${gap}`);
  else runnable.push(id);
}
if (args.includes('--check-only')) {
  console.log(`\n${runnable.length} of ${workflowIds.length} workflows have every model and input file available:${runnable.join(', ') || 'none'}`);
  process.exit(0);
}
console.log(`\nRunning ${runnable.length} of ${workflowIds.length} workflows ${executionProfile}, ${repeats} time(s) each.\n`);

const gb = (bytes) => (bytes == null ? '—' : `${(bytes / 1e9).toFixed(2)} GB`);

// Idle reference: device-wide free memory with models unloaded and ComfyUI's worker idle for
// long enough to have applied /free. Each run must get back within 1.5 GiB of it to count as
// cold; a run whose predecessor's models are still resident is several GB short.
const stats = async () => (await (await fetch(new URL('/system_stats', base.endpoint), { signal: AbortSignal.timeout(30000) })).json()).devices?.[base.deviceIndex ?? 0];
await fetch(new URL('/free', base.endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unload_models: true, free_memory: true }), signal: AbortSignal.timeout(30000) });
let idleFree = null;
let idleSince = 0;
for (const deadline = Date.now() + 60000; Date.now() < deadline;) {
  const free = (await stats())?.vram_free;
  if (typeof free !== 'number') throw new Error('ComfyUI /system_stats reports no vram_free; cannot measure the idle reference.');
  if (idleFree === null || Math.abs(free - idleFree) > 64 * 1024 ** 2) { idleFree = free; idleSince = Date.now(); }
  else if (Date.now() - idleSince >= 10000) break;
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (Date.now() - idleSince < 10000) throw new Error('Free VRAM did not settle within 60 s; close other GPU applications and retry.');
const coldStartMinFreeBytes = idleFree - 1.5 * 1024 ** 3;
console.log(`Idle free VRAM ${gb(idleFree)}; a run counts as cold from ${gb(coldStartMinFreeBytes)} free.\n`);

const configDir = path.join('tmp', 'execution-batch');
fs.mkdirSync(configDir, { recursive: true });

function runOnce(workflowId, attempt) {
  const configPath = path.join(configDir, `${workflowId}-${attempt}.json`);
  const profileSettings = optimized
    ? { executionProfile, promptFile: `data/optimized-prompts/${workflowId}.json`, optimizationNotes: savedOptimizedPrompt(workflowId).optimizationNotes }
    : { executionProfile };
  fs.writeFileSync(configPath, JSON.stringify({ ...base, workflowId, ...profileSettings, coldStartMinFreeBytes }, null, 2));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [runnerPath, configPath], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', reject);
    child.on('exit', (code) => {
      const start = stdout.indexOf('{');
      if (start === -1) {
        // No record means the runner refused before submitting (hardware mismatch, busy queue).
        reject(new Error(`Runner stopped before recording workflow ${workflowId} (exit ${code}): ${stderr.trim().slice(0, 600)}`));
        return;
      }
      resolve(JSON.parse(stdout.slice(start)));
    });
  });
}

const results = [];
for (const id of runnable) {
  for (let attempt = 1; attempt <= repeats; attempt++) {
    const record = await runOnce(id, attempt);
    results.push(record);
    const vram = record.peakVram?.status === 'MEASURED' ? `peak ${gb(record.peakVram.peakBytes)} (baseline ${gb(record.peakVram.baselineBytes)})` : `VRAM ${record.peakVram?.status ?? 'not recorded'}`;
    console.log(`${id} #${attempt}  ${record.outcome.padEnd(13)} ${record.runtimeSeconds == null ? '' : `${record.runtimeSeconds.toFixed(3)} s  `}${vram}${record.coldStart ? '' : record.cachedNodes?.length ? `  [not cold: ${record.cachedNodes.length} node(s) reused from ComfyUI's cache]` : '  [models were not confirmed unloaded]'}${record.failure ? `  ${record.failure.type}: ${record.failure.message.slice(0, 160)}` : ''}`);
  }
}

const median = (values) => { const s = [...values].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
// Median and peak use only cold successes, matching what the site publishes.
console.log('\nWorkflow  successes  cold  median runtime  max peak VRAM');
for (const id of runnable) {
  const ok = results.filter((r) => r.workflowId === id && r.outcome === 'SUCCESS');
  const cold = ok.filter((r) => r.coldStart);
  const peaks = cold.map((r) => r.peakVram?.peakBytes).filter((b) => typeof b === 'number');
  console.log(`${id.padEnd(9)} ${`${ok.length}/${repeats}`.padEnd(10)} ${`${cold.length}`.padEnd(5)} ${cold.length ? `${median(cold.map((r) => r.runtimeSeconds)).toFixed(3)} s`.padEnd(15) : '—'.padEnd(15)} ${peaks.length ? gb(Math.max(...peaks)) : '—'}`);
}
if (results.some((r) => r.outcome !== 'SUCCESS')) process.exitCode = 1;
