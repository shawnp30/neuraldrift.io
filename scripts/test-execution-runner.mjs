// Synthetic ComfyUI server and isolated temporary catalog. Never writes production evidence.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const root = process.cwd();
fs.mkdirSync('tmp', { recursive: true });
const fixture = fs.mkdtempSync(path.join(root, 'tmp', 'phase7-runner-fixture-'));
for (const dir of ['data', 'public/workflows']) fs.mkdirSync(path.join(fixture, dir), { recursive: true });
const profile = { id: 'fixture-only', name: 'Fixture GPU', gpuId: 'fixture-only', vramBytes: 16 * 1024 ** 3 };
fs.writeFileSync(path.join(fixture, 'data/hardware-profiles.json'), JSON.stringify([profile]));
fs.writeFileSync(path.join(fixture, 'data/workflow-executions.json'), '[]');
fs.writeFileSync(path.join(fixture, 'public/workflows/01.json'), JSON.stringify({ nodes: [{ id: 1, type: 'FixtureSave', widgets_values: ['fixture'] }], links: [] }));
let mode = 'success', submitted = 0;
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const send = x => res.end(JSON.stringify(x));
  if (req.url === '/system_stats') return send({ devices: [{ name: mode === 'mismatch' ? 'Different GPU' : 'Fixture GPU', type: 'cuda', vram_total: 16 * 1024 ** 3 }], system: { os: 'fixture', ram_total: 32 * 1024 ** 3 } });
  if (req.url === '/queue') return send({ queue_running: [], queue_pending: [] });
  if (req.url === '/object_info') return send({ FixtureSave: { input: { required: { text: ['STRING', {}] } } } });
  if (req.url === '/prompt') {
    submitted++;
    for await (const chunk of req) { void chunk; }
    if (mode === 'preflight') { res.statusCode = 400; return send({ error: 'fixture validation error', node_errors: { 1: 'fixture only' } }); }
    return send({ prompt_id: `fixture-${submitted}`, node_errors: {} });
  }
  if (req.url.startsWith('/history/')) {
    const prompt = req.url.split('/').at(-1);
    if (mode === 'timeout') return send({});
    const messages = mode === 'error' ? [['execution_error', { exception_type: 'FixtureOOM', exception_message: 'Synthetic test failure only' }]] : [['execution_start', { timestamp: 1000 }], ['execution_success', { timestamp: 2500 }]];
    return send({ [prompt]: { status: { completed: true, messages }, outputs: { 1: { images: [{ filename: 'fixture.png', type: 'output' }] } } } });
  }
  if (req.url.startsWith('/view?')) { res.setHeader('Content-Type', 'image/png'); return res.end(Buffer.from('fixture artifact')); }
  res.statusCode = 404; send({ error: 'unknown fixture route' });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const endpoint = `http://127.0.0.1:${server.address().port}`;
const records = () => JSON.parse(fs.readFileSync(path.join(fixture, 'data/workflow-executions.json'), 'utf8'));
async function run(executionProfile = 'STANDARD') {
  const config = { workflowId: '01', hardwareProfileId: 'fixture-only', endpoint, executionProfile, timeoutSeconds: 0.01 };
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
  console.log('Runner integration passed: STANDARD success, exact execution failure, validation failure, timeout, hardware mismatch, OPTIMIZED success, append-only records and saved artifacts. All synthetic records isolated in ' + fixture);
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
