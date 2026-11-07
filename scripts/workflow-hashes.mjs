import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// The canonical workflow hash: SHA-256 of the file with LF line endings, so a Windows
// checkout (CRLF) and the repository (LF) give the same value. Execution records, this
// manifest and the compatibility API must all use it.
export function workflowSha256(id) {
  const workflow = fs.readFileSync(`public/workflows/${id}.json`, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(workflow, 'utf8').digest('hex');
}

export function workflowHashes() {
  return Object.fromEntries(Array.from({ length: 50 }, (_, i) => {
    const id = String(i + 1).padStart(2, '0');
    return [id, workflowSha256(id)];
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hashes = workflowHashes();
  if (process.argv.includes('--check')) {
    if (JSON.stringify(hashes) !== JSON.stringify(JSON.parse(fs.readFileSync('data/workflow-hashes.json', 'utf8')))) {
      throw new Error('Workflow files changed: run npm run evidence:hashes, then rebuild. Recorded execution hashes must not be changed.');
    }
  } else {
    fs.writeFileSync('data/workflow-hashes.json', JSON.stringify(hashes, null, 2) + '\n');
  }
}
