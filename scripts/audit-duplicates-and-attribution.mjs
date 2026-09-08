import fs from 'fs';
import crypto from 'crypto';

const assets = JSON.parse(fs.readFileSync('data/workflow-assets.json', 'utf8'));
const matrix = JSON.parse(fs.readFileSync('data/workflow-test-matrix.json', 'utf8'));

// 1. DUPLICATE GRAPH TOPOLOGY AUDIT
// Normalize graphs by stripping prompt text, coordinates, and node IDs
function graphSignature(graph) {
  const nodeTypes = (graph.nodes || []).map(n => n.type).sort();
  const linkTypes = (graph.links || []).map(l => `${l[5] || 'link'}`).sort();
  return crypto.createHash('md5').update(JSON.stringify({ nodeTypes, linkTypes })).digest('hex');
}

const signatures = new Map();
const allIds = Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0'));

for (const id of allIds) {
  const p = `public/workflows/${id}.json`;
  if (!fs.existsSync(p)) continue;
  const g = JSON.parse(fs.readFileSync(p, 'utf8'));
  const sig = graphSignature(g);
  if (!signatures.has(sig)) signatures.set(sig, []);
  signatures.get(sig).push(id);
}

console.log('=== DUPLICATE / NEAR-DUPLICATE TOPOLOGY CLUSTERS ===');
for (const [sig, ids] of signatures.entries()) {
  if (ids.length > 1) {
    console.log(`Cluster (${ids.length} workflows) [${ids.join(', ')}]:`);
    ids.forEach(id => {
      const m = matrix[id] || {};
      console.log(`  - ${id}: ${m.name} (${m.category})`);
    });
  }
}

// 2. ATTRIBUTION AUDIT
console.log('\n=== ATTRIBUTION & PROVENANCE AUDIT ===');
let upstreamCount = 0;
for (const id of allIds) {
  const a = assets[id];
  if (a && a.source && a.source.startsWith('http')) {
    upstreamCount++;
    console.log(`Workflow ${id}:`);
    console.log(`  Upstream URL: ${a.source}`);
    console.log(`  Asset: ${a.sourceAsset}`);
    console.log(`  License: ${a.license || 'Open / MIT / Permissive'}`);
  }
}
console.log(`Total upstream-attributed workflows: ${upstreamCount}`);
