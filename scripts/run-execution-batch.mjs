// Runs scripts/run-execution.mjs for many workflows, several times each, against one
// local ComfyUI. Every attempt is still its own immutable record; this only drives them.
//
// Usage: npm run evidence:batch -- path/to/base-config.json [--repeats 3] [--workflows 04,29] [--check-only]
// The base config is a run-execution config without workflowId/executionProfile.
// Default workflows: every workflow with a completed legacy test in data/workflow-tests.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const runnerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'run-execution.mjs');

const args = process.argv.slice(2);
const basePath = args[0];
if (!basePath || basePath.startsWith('--')) throw new Error('Supply a base config JSON as the first argument; see docs/phase7.md.');
const flag = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? undefined : args[i + 1]; };
const repeats = Number(flag('repeats') ?? 3);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10) throw new Error('--repeats must be an integer from 1 to 10.');

const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
if (base.workflowId || base.executionProfile) throw new Error('The base config must not set workflowId or executionProfile; the batch sets them.');
const legacyTests = JSON.parse(fs.readFileSync('data/workflow-tests.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('data/workflow-assets.json', 'utf8'));
const workflowIds = (flag('workflows')?.split(',') ?? Object.keys(legacyTests).filter((id) => legacyTests[id]?.status === 'completed')).sort();
for (const id of workflowIds) if (!/^\d{2}$/.test(id) || !assets[id]) throw new Error(`Unknown workflow ID: ${id}`);

// Every option string ComfyUI offers in its loader inputs, i.e. the installed model files.
const objectInfo = await (await fetch(new URL('/object_info', base.endpoint), { signal: AbortSignal.timeout(60000) })).json();
const installed = new Set();
const collect = (value) => {
  if (typeof value === 'string') installed.add(value.replace(/\\/g, '/').split('/').pop());
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
for (const node of Object.values(objectInfo)) collect(node.input);

const runnable = [];
for (const id of workflowIds) {
  const missing = assets[id].models.map((m) => m.file).filter((file) => !installed.has(file));
  if (missing.length) console.log(`SKIP ${id}: model file(s) not installed in this ComfyUI: ${missing.join(', ')}`);
  else runnable.push(id);
}
if (args.includes('--check-only')) {
  console.log(`\n${runnable.length} of ${workflowIds.length} workflows have every model file installed: ${runnable.join(', ') || 'none'}`);
  process.exit(0);
}
console.log(`\nRunning ${runnable.length} of ${workflowIds.length} workflows, ${repeats} time(s) each.\n`);

const configDir = path.join('tmp', 'execution-batch');
fs.mkdirSync(configDir, { recursive: true });

function runOnce(workflowId, attempt) {
  const configPath = path.join(configDir, `${workflowId}-${attempt}.json`);
  fs.writeFileSync(configPath, JSON.stringify({ ...base, workflowId, executionProfile: 'STANDARD' }, null, 2));
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

const gb = (bytes) => (bytes == null ? '—' : `${(bytes / 1e9).toFixed(2)} GB`);
const results = [];
for (const id of runnable) {
  for (let attempt = 1; attempt <= repeats; attempt++) {
    const record = await runOnce(id, attempt);
    results.push(record);
    const vram = record.peakVram?.status === 'MEASURED' ? `peak ${gb(record.peakVram.peakBytes)} (baseline ${gb(record.peakVram.baselineBytes)})` : `VRAM ${record.peakVram?.status ?? 'not recorded'}`;
    console.log(`${id} #${attempt}  ${record.outcome.padEnd(13)} ${record.runtimeSeconds == null ? '' : `${record.runtimeSeconds.toFixed(3)} s  `}${vram}${record.coldStart ? '' : '  [models were not confirmed unloaded]'}${record.failure ? `  ${record.failure.type}: ${record.failure.message.slice(0, 160)}` : ''}`);
  }
}

const median = (values) => { const s = [...values].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
console.log('\nWorkflow  successes  median runtime  max peak VRAM');
for (const id of runnable) {
  const ok = results.filter((r) => r.workflowId === id && r.outcome === 'SUCCESS');
  const peaks = ok.map((r) => r.peakVram?.peakBytes).filter((b) => typeof b === 'number');
  console.log(`${id.padEnd(9)} ${`${ok.length}/${repeats}`.padEnd(10)} ${ok.length ? `${median(ok.map((r) => r.runtimeSeconds)).toFixed(3)} s`.padEnd(15) : '—'.padEnd(15)} ${peaks.length ? gb(Math.max(...peaks)) : '—'}`);
}
if (results.some((r) => r.outcome !== 'SUCCESS')) process.exitCode = 1;
