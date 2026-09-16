import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const base = process.env.ND_BASE_URL || 'http://127.0.0.1:3005';
const results = [];
async function check(route, status = 200) {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  results.push({ route, expected: status, actual: response.status, bytes: bytes.length });
  assert.equal(response.status, status, route);
  return { text: bytes.toString('utf8'), bytes, headers: response.headers };
}
try {
  for (const route of ['/', '/workflows', '/compatibility', '/hardware/rtx-5080', '/robots.txt', '/newsletter', '/newsletter/comfyui-035-local-video-audio-tools']) await check(route);
  const sitemapXml = (await check('/sitemap.xml')).text;
  assert(sitemapXml.includes('<loc>https://neuraldrift.io/newsletter</loc>'), 'sitemap must list the newsletter hub');
  assert(sitemapXml.includes('<loc>https://neuraldrift.io/newsletter/comfyui-035-local-video-audio-tools</loc>'), 'sitemap must list newsletter issue 1');
  assert(!/preview\.vercel\.app|localhost|127\.0\.0\.1/.test(sitemapXml), 'sitemap must not contain preview/localhost URLs');
  assert(!/<loc>https:\/\/neuraldrift\.io\/(api|admin|dashboard|auth)\//.test(sitemapXml), 'sitemap must not contain private/API routes');
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(sitemapUrls.length, new Set(sitemapUrls).size, 'sitemap must not contain duplicate URLs');
  await check('/workflows/999', 404);
  await check('/api/compatibility', 400);
  await check('/api/compatibility?workflow=999&gpu=rtx-5080', 404);
  await check('/api/compatibility?workflow=01&gpu=invalid', 400);
  const api = JSON.parse((await check('/api/compatibility?workflow=01&gpu=rtx-5080')).text);
  assert.equal(api.compatibility.state, 'DIRECT_TESTED');
  assert(api.compatibility.executionRecords.every(r => r.freshness === 'CURRENT'));
  assert(api.compatibility.selectedExecutionId);
  assert.equal(api.compatibility.crossGpuComparisons.length, 0);
  const hashes = JSON.parse(fs.readFileSync('data/workflow-hashes.json', 'utf8'));
  for (let i = 1; i <= 50; i++) {
    const id = String(i).padStart(2, '0');
    const detail = await check(`/workflows/${id}`);
    assert(detail.text.includes('Execution history'), `Missing history on ${id}`);
    const download = await check(`/workflows/${id}.json`);
    assert(Array.isArray(JSON.parse(download.text).nodes), `Invalid graph ${id}`);
    const canonicalDownload = download.text.replace(/\r\n/g, '\n');
    assert.equal(crypto.createHash('sha256').update(canonicalDownload, 'utf8').digest('hex'), hashes[id]);
  }
  const records = Object.values(JSON.parse(fs.readFileSync('data/workflow-tests.json', 'utf8')));
  for (const record of records) {
    const artifact = await check(record.preview);
    assert(artifact.bytes.length > 0);
    const saved = JSON.parse((await check(`/workflow-tests/${record.workflowId}-record.json`)).text);
    assert.equal(saved.workflowSha256, record.workflowSha256);
  }
  console.log(`PASS: ${results.length} route/content checks, including all 50 detail pages, all 50 exact-hash downloads, compatibility API and ${records.length} artifact/record pairs.`);
} finally {
  fs.writeFileSync('tmp/phase7-route-validation.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2));
}
