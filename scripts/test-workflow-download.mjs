import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pageSource = fs.readFileSync(path.resolve('app/workflows/[id]/page.tsx'), 'utf8');
const buttonSource = fs.readFileSync(path.resolve('components/workflows/DownloadButton.tsx'), 'utf8');

assert.match(pageSource, /<DownloadButton workflowId=\{workflow\.id\} workflowTitle=\{workflow\.title\} \/>/);
assert.doesNotMatch(pageSource, /<a href=\{downloadUrl\(workflow\)\}/);
assert.match(buttonSource, /onClick=\{handleDownload\}/);
assert.match(buttonSource, /handleWorkflowDownload/);
assert.match(buttonSource, /workflow_download/);
assert.match(buttonSource, /event\.preventDefault\(\)/);
assert.match(buttonSource, /window\.setTimeout/);
assert.doesNotMatch(buttonSource, /window\.location\.href/);

console.log('Workflow download wiring checks passed: route uses DownloadButton and the click handler prevents navigation before the single deferred download.');
