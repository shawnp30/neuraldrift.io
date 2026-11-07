// Synthetic ComfyUI server and isolated temporary catalog. Never writes production evidence.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { apiPrompt } from './workflow-api.mjs';
const root = process.cwd();
// V3 dynamic combos (ComfyUI's SaveVideo) send nested values as "parent.child"; hidden inputs take no saved value.
const codec = ['COMFY_DYNAMICCOMBO_V3', { options: [{ key: 'auto', inputs: { required: {} } }, { key: 'h264', inputs: { required: { crf: ['FLOAT', { default: 23 }] } } }] }];
const saveVideo = { input: { required: { video: ['VIDEO', {}], filename_prefix: ['STRING', { default: 'video/ComfyUI' }], format: ['COMFY_DYNAMICCOMBO_V3', { options: [{ key: 'auto', inputs: { required: { codec } } }, { key: 'mp4', inputs: { required: { codec } } }] }] }, optional: { codec: [codec[0], { ...codec[1], hidden: true }] } } };
const videoGraph = (values) => ({ nodes: [{ id: 2, type: 'SaveVideo', inputs: [{ name: 'video', type: 'VIDEO', link: 1 }], widgets_values: values }, { id: 1, type: 'VideoSource', widgets_values: [] }], links: [[1, 1, 0, 2, 0, 'VIDEO']] });
const objectInfoV3 = { SaveVideo: saveVideo, VideoSource: { input: { required: {} } } };
assert.deepEqual(apiPrompt(videoGraph(['video/ComfyUI', 'auto', 'auto']), objectInfoV3)[2].inputs, { video: ['1', 0], filename_prefix: 'video/ComfyUI', format: 'auto', 'format.codec': 'auto' });
assert.deepEqual(apiPrompt(videoGraph(['clip', 'mp4', 'h264', 18]), objectInfoV3)[2].inputs, { video: ['1', 0], filename_prefix: 'clip', format: 'mp4', 'format.codec': 'h264', 'format.codec.crf': 18 });
assert.throws(() => apiPrompt(videoGraph(['clip', 'gif', 'auto']), objectInfoV3), /SaveVideo\.format: "gif" is not an option/);
fs.mkdirSync('tmp', { recursive: true });
const fixture = fs.mkdtempSync(path.join(root, 'tmp', 'phase7-runner-fixture-'));
for (const dir of ['data', 'public/workflows']) fs.mkdirSync(path.join(fixture, dir), { recursive: true });
const profile = { id: 'fixture-only', name: 'Fixture GPU', gpuId: 'fixture-only', vramBytes: 16 * 1024 ** 3 };
fs.writeFileSync(path.join(fixture, 'data/hardware-profiles.json'), JSON.stringify([profile]));
fs.writeFileSync(path.join(fixture, 'data/workflow-executions.json'), '[]');
fs.writeFileSync(path.join(fixture, 'data/workflow-tests.json'), JSON.stringify({ '01': { status: 'completed' }, '02': { status: 'completed' } }));
fs.writeFileSync(path.join(fixture, 'data/workflow-assets.json'), JSON.stringify({ '01': { models: [{ file: 'fixture.safetensors' }] }, '02': { models: [{ file: 'missing.safetensors' }] } }));
// CRLF, as in a Windows checkout: the record must carry the canonical LF hash.
const workflow01 = JSON.stringify({ nodes: [{ id: 1, type: 'FixtureSave', widgets_values: ['fixture'] }], links: [] }, null, 2);
fs.writeFileSync(path.join(fixture, 'public/workflows/01.json'), workflow01.replace(/\n/g, '\r\n'));
const canonicalSha01 = crypto.createHash('sha256').update(workflow01, 'utf8').digest('hex');
// 02 names a file that only a different loader offers, as with the real ControlNet gap.
fs.writeFileSync(path.join(fixture, 'public/workflows/02.json'), JSON.stringify({ nodes: [{ id: 1, type: 'FixtureLoader', widgets_values: ['missing.safetensors'] }], links: [] }));
let mode = 'success', submitted = 0, freeCalls = 0, freed = false, pollsSinceFree = 0;
// Mirrors ComfyUI under cudaMallocAsync: torch_vram_total already reads near zero while the
// card still holds the freed pool; device-wide vram_free only rises a few polls after /free.
const releaseAfterPolls = 3;
const vramFree = () => (freed && ++pollsSinceFree > releaseAfterPolls ? 14 : 2) * 1024 ** 3;
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const send = x => res.end(JSON.stringify(x));
  if (req.url === '/system_stats') return send({ devices: [{ name: mode === 'mismatch' ? 'Different GPU' : 'Fixture GPU', type: 'cuda', vram_total: 16 * 1024 ** 3, vram_free: vramFree(), torch_vram_total: 96 * 1024 ** 2 }], system: { os: 'fixture', ram_total: 32 * 1024 ** 3 } });
  if (req.url === '/queue') return send({ queue_running: [], queue_pending: [] });
  if (req.url === '/free') { freeCalls++; freed = true; pollsSinceFree = 0; for await (const chunk of req) { void chunk; } return send({}); }
  if (req.url === '/object_info') return send({ FixtureSave: { input: { required: { text: ['STRING', {}] } } }, FixtureLoader: { input: { required: { ckpt_name: [['fixture.safetensors']] } } }, OtherLoader: { input: { required: { vae_name: [['missing.safetensors']] } } } });
  if (req.url === '/prompt') {
    submitted++;
    for await (const chunk of req) { void chunk; }
    if (mode === 'preflight') { res.statusCode = 400; return send({ error: 'fixture validation error', node_errors: { 1: 'fixture only' } }); }
    return send({ prompt_id: `fixture-${submitted}`, node_errors: {} });
  }
  if (req.url.startsWith('/history/')) {
    const prompt = req.url.split('/').at(-1);
    if (mode === 'timeout') return send({});
    const messages = mode === 'error' ? [['execution_error', { exception_type: 'FixtureOOM', exception_message: 'Synthetic test failure only' }]] : [['execution_start', { timestamp: 1000 }], ['execution_cached', { nodes: mode === 'cached' ? ['1'] : [] }], ['execution_success', { timestamp: 2500 }]];
    return send({ [prompt]: { status: { completed: true, messages }, outputs: { 1: { images: [{ filename: 'fixture.png', type: 'output' }] } } } });
  }
  if (req.url.startsWith('/view?')) { res.setHeader('Content-Type', 'image/png'); return res.end(Buffer.from('fixture artifact')); }
  res.statusCode = 404; send({ error: 'unknown fixture route' });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const endpoint = `http://127.0.0.1:${server.address().port}`;
const records = () => JSON.parse(fs.readFileSync(path.join(fixture, 'data/workflow-executions.json'), 'utf8'));
async function run(executionProfile = 'STANDARD', extra = {}) {
  freed = false;
  const fakeSmi = "console.log('Fixture GPU, 1000'); console.log('Fixture GPU, 3000'); setInterval(() => {}, 1000);";
  const config = { workflowId: '01', hardwareProfileId: 'fixture-only', endpoint, executionProfile, timeoutSeconds: 0.01, vramSampler: { command: process.execPath, args: ['-e', fakeSmi] }, ...extra };
  if (executionProfile === 'OPTIMIZED') {
    const promptFile = path.join(fixture, 'optimized.json');
    fs.writeFileSync(promptFile, JSON.stringify({ 1: { class_type: 'FixtureSave', inputs: { text: 'changed fixture' } } }));
    Object.assign(config, { promptFile, optimizationNotes: 'Fixture-only changed input' });
  }
  fs.writeFileSync(path.join(fixture, 'config.json'), JSON.stringify(config));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts/run-execution.mjs'), 'config.json'], { cwd: fixture, windowsHide: true });
    let output = '';
    child.stdout.on('data', data => output += data);
    child.stderr.on('data', data => output += data);
    child.on('error', reject);
    child.on('exit', code => resolve({ code, output }));
  });
}
try {
  assert.equal((await run()).code, 0);
  assert.equal(records()[0].outcome, 'SUCCESS');
  assert.equal(records()[0].runtimeSeconds, 1.5);
  assert.equal(records()[0].workflowSha256, canonicalSha01, 'workflow hash must ignore CRLF line endings');
  assert.equal(records()[0].coldStart, true, 'runs must start after a confirmed model unload');
  assert.equal(records()[0].coldStartCheck.vramFreeBytes, 14 * 1024 ** 3, 'the check must record the released device-wide memory');
  assert.equal(freeCalls, 1);
  // Confirming needs the release plus a 2 s settled window: at least 8 more polls at 250 ms.
  assert(pollsSinceFree > releaseAfterPolls + 8, `cold start was confirmed before device-wide VRAM was released (${pollsSinceFree} polls)`);
  assert.equal(records()[0].peakVram.status, 'MEASURED');
  assert.equal(records()[0].peakVram.baselineBytes, 1000 * 1024 ** 2);
  assert.equal(records()[0].peakVram.peakBytes, 3000 * 1024 ** 2);
  assert(fs.existsSync(path.join(fixture, 'public', records()[0].artifact)));
  mode = 'error'; assert.equal((await run()).code, 1);
  assert.equal(records()[1].failure.type, 'FixtureOOM');
  mode = 'preflight'; assert.equal((await run()).code, 1);
  assert.equal(records()[2].failure.stage, 'preflight');
  mode = 'timeout'; assert.equal((await run()).code, 1);
  assert.equal(records()[3].failure.type, 'TIMEOUT');
  assert.equal(records()[3].outcome, 'INDETERMINATE');
  mode = 'mismatch'; assert.equal((await run()).code, 1); assert.equal(records().length, 4);
  mode = 'success'; assert.equal((await run('OPTIMIZED')).code, 0);
  assert.equal(records()[4].executionProfile, 'OPTIMIZED');
  assert.notEqual(records()[4].promptSha256, records()[0].promptSha256);
  assert.equal(records()[4].workflowSha256, records()[0].workflowSha256);
  assert.equal(records().length, 5);
  // A run that reuses cached nodes ran before /free was applied: success, but not cold.
  mode = 'cached'; assert.equal((await run()).code, 0);
  assert.equal(records()[5].outcome, 'SUCCESS');
  assert.deepEqual(records()[5].cachedNodes, ['1']);
  assert.equal(records()[5].coldStart, false, 'a run that reused cached nodes must not be recorded as cold');
  assert.deepEqual(records()[0].cachedNodes, []);
  mode = 'success';
  // Free memory that settles below the batch's idle floor means the models are still resident.
  assert.equal((await run('STANDARD', { coldStartMinFreeBytes: 15 * 1024 ** 3, unloadTimeoutSeconds: 8 })).code, 0);
  assert.equal(records()[6].coldStart, false, 'settling below the idle floor must not count as a cold start');
  assert.equal(records()[6].coldStartCheck, null);
  freed = false;
  const fakeSmi = "console.log('Fixture GPU, 1000'); console.log('Fixture GPU, 3000'); setInterval(() => {}, 1000);";
  fs.writeFileSync(path.join(fixture, 'base.json'), JSON.stringify({ hardwareProfileId: 'fixture-only', endpoint, timeoutSeconds: 0.01, vramSampler: { command: process.execPath, args: ['-e', fakeSmi] } }));
  const batch = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts/run-execution-batch.mjs'), 'base.json', '--repeats', '2'], { cwd: fixture, windowsHide: true });
    let output = '';
    child.stdout.on('data', data => output += data);
    child.stderr.on('data', data => output += data);
    child.on('error', reject);
    child.on('exit', code => resolve({ code, output }));
  });
  assert.equal(batch.code, 0, batch.output);
  assert.match(batch.output, /SKIP 02: not available in this ComfyUI: FixtureLoader\.ckpt_name = missing\.safetensors/);
  assert.equal(records().length, 9, 'batch must append one immutable record per attempt');
  assert.match(batch.output, /Idle free VRAM 15\.03 GB/);
  assert(records().slice(7).every(r => r.workflowId === '01' && r.outcome === 'SUCCESS' && r.coldStart && r.coldStartCheck.minFreeBytes === 12.5 * 1024 ** 3 && r.peakVram.status === 'MEASURED'));
  // A subgraph workflow runs from its saved frontend conversion while that matches the workflow file.
  const workflow03 = JSON.stringify({ nodes: [{ id: 5, type: 'fixture-subgraph' }], links: [], definitions: { subgraphs: [{ id: 'fixture-subgraph', nodes: [] }] } });
  fs.writeFileSync(path.join(fixture, 'public/workflows/03.json'), workflow03);
  const frontendPrompt = { '5:1': { class_type: 'FixtureSave', inputs: { text: 'frontend', text_encoder: 'encoder.safetensors' } } };
  fs.mkdirSync(path.join(fixture, 'data/subgraph-prompts'));
  fs.writeFileSync(path.join(fixture, 'data/subgraph-prompts/03.json'), JSON.stringify({ workflowId: '03', workflowSha256: crypto.createHash('sha256').update(workflow03, 'utf8').digest('hex'), prompt: frontendPrompt }));
  assert.equal((await run('STANDARD', { workflowId: '03' })).code, 0);
  assert.equal(records()[9].outcome, 'SUCCESS');
  assert.deepEqual(records()[9].settings.prompt, frontendPrompt);
  assert.deepEqual(records()[9].models, [{ filename: 'encoder.safetensors', sha256: null }], 'text encoders must be recorded as models');
  // Once the workflow file changes, the conversion is stale: refuse before writing any record.
  fs.writeFileSync(path.join(fixture, 'public/workflows/03.json'), workflow03.replace('"links":[]', '"links":[],"extra":1'));
  const stale = await run('STANDARD', { workflowId: '03' });
  assert.equal(stale.code, 1);
  assert.match(stale.output, /converted from a different version of workflow 03/);
  assert.equal(records().length, 10, 'a stale conversion must not be recorded');
  console.log('Runner integration passed: STANDARD success, subgraph prompt from a current frontend conversion, stale conversion refused, exact execution failure, validation failure, timeout, hardware mismatch, OPTIMIZED success, append-only records and saved artifacts. All synthetic records isolated in ' + fixture);
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
