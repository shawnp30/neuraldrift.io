import fs from 'node:fs';
import crypto from 'node:crypto';

export function workflowHashes() {
  return Object.fromEntries(Array.from({ length: 50 }, (_, i) => {
    const id = String(i + 1).padStart(2, '0');
    const workflow = fs.readFileSync(`public/workflows/${id}.json`, 'utf8').replace(/\r\n/g, '\n');
    return [id, crypto.createHash('sha256').update(workflow, 'utf8').digest('hex')];
  }));
}
const hashes = workflowHashes();
if (process.argv.includes('--check')) {
  if (JSON.stringify(hashes) !== JSON.stringify(JSON.parse(fs.readFileSync('data/workflow-hashes.json', 'utf8')))) {
    throw new Error('Workflow files changed: run npm run evidence:hashes, then rebuild. Recorded execution hashes must not be changed.');
  }
} else {
  fs.writeFileSync('data/workflow-hashes.json', JSON.stringify(hashes, null, 2) + '\n');
}
