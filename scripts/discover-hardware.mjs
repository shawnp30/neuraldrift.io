import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const checkedAt = new Date().toISOString();
const result = { checkedAt, local: [], endpoints: [], systemRamBytes: os.totalmem(), os: `${os.platform()} ${os.release()}`, secondaryBlocker: null };
try {
  const csv = execFileSync('nvidia-smi', ['--query-gpu=name,uuid,memory.total,driver_version', '--format=csv,noheader,nounits'], { encoding: 'utf8', windowsHide: true });
  result.local = csv.trim().split('\n').map(row => {
    const [name, uuid, memoryMiB, driver] = row.split(',').map(s => s.trim());
    return { name, uuid, memoryMiB: Number(memoryMiB), driver };
  });
} catch (error) { result.localError = error.message; }
if (!result.local.length && fs.existsSync('tmp/phase7-local-gpus.json')) { result.local = JSON.parse(fs.readFileSync('tmp/phase7-local-gpus.json', 'utf8').replace(/^\uFEFF/, '')); result.localSource = { path: 'tmp/phase7-local-gpus.json', capturedAt: fs.statSync('tmp/phase7-local-gpus.json').mtime.toISOString() }; }
const urls = process.argv.slice(2);
for (const endpoint of urls.length ? urls : ['http://127.0.0.1:8188', 'http://127.0.0.1:8191', 'http://127.0.0.1:8192']) {
  try {
    const response = await fetch(`${endpoint}/system_stats`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    result.endpoints.push({ endpoint, available: true, stats: await response.json() });
  } catch (error) { result.endpoints.push({ endpoint, available: false, error: error.cause?.code ?? error.message }); }
}
if (result.local.length < 2 && !result.endpoints.some(e => e.available && e.stats.devices?.some(d => !/RTX 5080/.test(d.name)))) result.secondaryBlocker = 'Only RTX 5080 detected locally. No responding secondary ComfyUI endpoint supplied or discovered at the known local ports. RTX 3080 laptop address and access are unknown; no secondary workflow attempted.';
fs.mkdirSync('tmp', { recursive: true });
fs.writeFileSync('tmp/phase7-hardware.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
