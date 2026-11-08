// Converts catalog workflows that use subgraphs into API prompts with ComfyUI's own frontend
// (app.graphToPrompt), since scripts/workflow-api.mjs cannot expand subgraphs. Each result is
// saved to data/subgraph-prompts/<id>.json with the hash of the workflow file it came from;
// the runner refuses it once that file changes.
//
// Usage: npm run evidence:subgraphs -- [11 12 ...] [--endpoint http://127.0.0.1:8188] [--chrome path/to/chrome]
// Default: every catalog workflow with subgraphs.
//
// The page runs in a fresh temporary browser profile, so an open ComfyUI tab and its unsaved
// graph are never touched, and every non-GET request from it is blocked: nothing is queued and
// no settings or workflows are written to the server.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { workflowSha256 } from './workflow-hashes.mjs';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? undefined : args[i + 1]; };
const flagValues = new Set(['endpoint', 'chrome'].map(flag).filter(Boolean));
const endpoint = new URL(flag('endpoint') ?? 'http://127.0.0.1:8188');
const browserPath = flag('chrome') ?? process.env.CHROME_PATH ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => fs.existsSync(p));
if (!browserPath || !fs.existsSync(browserPath)) throw new Error('No Chrome or Edge found: pass --chrome or set CHROME_PATH.');

const graphOf = id => JSON.parse(fs.readFileSync(`public/workflows/${id}.json`, 'utf8'));
const requested = args.filter(a => !a.startsWith('--') && !flagValues.has(a));
const ids = requested.length ? requested : Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0'))
  .filter(id => fs.existsSync(`public/workflows/${id}.json`) && graphOf(id).definitions?.subgraphs?.length);
for (const id of ids) {
  if (!/^\d{2}$/.test(id) || !fs.existsSync(`public/workflows/${id}.json`)) throw new Error(`Unknown workflow ID: ${id}`);
  if (!graphOf(id).definitions?.subgraphs?.length) throw new Error(`Workflow ${id} has no subgraphs; scripts/workflow-api.mjs converts it.`);
}

const getJson = async route => {
  const res = await fetch(new URL(route, endpoint), { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`ComfyUI ${route} HTTP ${res.status}`);
  return res.json();
};
const objectInfo = await getJson('/object_info');
const comfyuiVersion = (await getJson('/system_stats')).system?.comfyui_version ?? null;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'neuraldrift-subgraph-convert-'));
const port = 9300 + Math.floor(Math.random() * 600);
const browser = spawn(browserPath, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu', 'about:blank',
], { stdio: 'ignore' });

let ws = null;
let seq = 0;
const pending = new Map();
const blocked = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
};

try {
  let target = null;
  for (let i = 0; i < 100 && !target; i++) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page') ?? null;
    } catch (error) {
      if (i === 99) throw new Error(`Browser DevTools endpoint did not start: ${error.message}`);
    }
    if (!target) await sleep(200);
  }
  if (!target) throw new Error('Browser opened no page.');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('DevTools connection failed')); });
  ws.onmessage = async ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      if (request.method === 'GET' || request.method === 'HEAD') await send('Fetch.continueRequest', { requestId });
      else {
        blocked.push(`${request.method} ${request.url}`);
        await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      }
    }
  };
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await send('Runtime.enable');
  await send('Page.navigate', { url: endpoint.href });

  for (const id of ids) {
    const graph = graphOf(id);
    // The frontend must have registered every node type the workflow uses before converting.
    const types = [...new Set([...graph.nodes, ...graph.definitions.subgraphs.flatMap(s => s.nodes)].map(n => n.type))].filter(t => objectInfo[t]);
    let ready = false;
    for (let i = 0; i < 240 && !ready; i++) {
      ready = await evaluate(`!!(window.app?.graph && typeof window.app.graphToPrompt === 'function' && ${JSON.stringify(types)}.every(t => window.LiteGraph?.registered_node_types?.[t]))`).catch(() => false);
      if (!ready) await sleep(500);
    }
    if (!ready) throw new Error(`ComfyUI frontend at ${endpoint.href} did not register the node types workflow ${id} uses.`);
    const converted = await evaluate(`(async () => {
      await app.loadGraphData(${JSON.stringify(graph)}, true, false, ${JSON.stringify(`neuraldrift-${id}`)});
      const result = await app.graphToPrompt();
      return { frontendVersion: window.__COMFYUI_FRONTEND_VERSION__ ?? null, prompt: result.output };
    })()`);
    const nodes = Object.entries(converted.prompt);
    if (!nodes.length) throw new Error(`Workflow ${id}: the frontend produced an empty prompt.`);
    for (const [nodeId, node] of nodes) {
      if (!objectInfo[node.class_type]) throw new Error(`Workflow ${id}: node ${nodeId} has type ${node.class_type}, which this ComfyUI does not provide.`);
      for (const [name, value] of Object.entries(node.inputs)) {
        if (Array.isArray(value) && typeof value[0] === 'string' && !converted.prompt[value[0]]) throw new Error(`Workflow ${id}: ${nodeId}.${name} links to missing node ${value[0]}.`);
      }
    }
    fs.mkdirSync('data/subgraph-prompts', { recursive: true });
    const record = { workflowId: id, workflowSha256: workflowSha256(id), comfyuiVersion, frontendVersion: converted.frontendVersion, prompt: converted.prompt };
    fs.writeFileSync(`data/subgraph-prompts/${id}.json`, JSON.stringify(record, null, 2) + '\n');
    console.log(`${id}: ${nodes.length} nodes (ComfyUI ${comfyuiVersion}, frontend ${converted.frontendVersion}) -> data/subgraph-prompts/${id}.json`);
  }
  if (blocked.length) console.log(`Blocked ${blocked.length} write request(s) from the page:\n  ${[...new Set(blocked)].join('\n  ')}`);
} finally {
  ws?.close();
  browser.kill();
  await new Promise(resolve => browser.exitCode !== null ? resolve() : browser.once('exit', resolve));
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
