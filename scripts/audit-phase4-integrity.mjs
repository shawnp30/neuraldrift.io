import fs from 'fs';
import path from 'path';

// 1. ARTIFACT REVIEW
const tests = JSON.parse(fs.readFileSync('data/workflow-tests.json', 'utf8'));
const testedIds = Object.keys(tests).filter(k => tests[k].status === 'completed');

console.log(`Checking ${testedIds.length} tested artifacts...`);
let artifactErrors = 0;
for (const id of testedIds) {
  const t = tests[id];
  const ext = t.outputKind === 'audio' ? 'mp3' : (t.outputKind === 'video' ? 'mp4' : 'png');
  const file = path.join('public/workflow-tests', `${id}-output.${ext}`);
  const rec = path.join('public/workflow-tests', `${id}-record.json`);

  if (!fs.existsSync(file)) {
    console.error(`Artifact missing: ${file}`);
    artifactErrors++;
  } else {
    const sz = fs.statSync(file).size;
    if (sz < 1000) {
      console.error(`Artifact too small (${sz} bytes): ${file}`);
      artifactErrors++;
    }
  }

  if (!fs.existsSync(rec)) {
    console.error(`Record missing: ${rec}`);
    artifactErrors++;
  } else {
    const rData = JSON.parse(fs.readFileSync(rec, 'utf8'));
    if (rData.workflowId !== id) {
      console.error(`ID mismatch in record ${rec}: ${rData.workflowId} vs ${id}`);
      artifactErrors++;
    }
  }
}
console.log(`Artifact check completed with ${artifactErrors} errors.`);

// 2. PROVENANCE HARDENING IN WORKFLOW FILES
console.log('\nChecking extra.neuraldrift provenance in 50 downloadable workflow files...');
let provenanceCount = 0;
for (let i = 1; i <= 50; i++) {
  const id = String(i).padStart(2, '0');
  const file = `public/workflows/${id}.json`;
  if (!fs.existsSync(file)) continue;
  const g = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (g.extra && g.extra.neuraldrift) {
    provenanceCount++;
  }
}
console.log(`Provenance found in ${provenanceCount} / 50 workflow files.`);

// 3. LICENSE AUDIT
const assets = JSON.parse(fs.readFileSync('data/workflow-assets.json', 'utf8'));
let upstreamWithLicense = 0;
for (const id of Object.keys(assets)) {
  const a = assets[id];
  if (a.source && a.source.startsWith('http')) {
    upstreamWithLicense++;
  }
}
console.log(`Upstream templates tracked: ${upstreamWithLicense} / 19.`);
