// Runtime validation for a local production server. Set ND_BASE_URL if the
// server is not on the default port. This deliberately checks rendered HTML,
// not just Next metadata source.
import assert from 'node:assert/strict';

const base = (process.env.ND_BASE_URL || 'http://127.0.0.1:3005').replace(/\/$/, '');
const canonicalOrigin = 'https://neuraldrift.io';

async function request(path) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  return { response, body: await response.text() };
}
function canonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match?.[1];
}
function robots(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  return match?.[1]?.toLowerCase() || '';
}
async function assertPage(path, { indexable, canonicalPath }) {
  const { response, body } = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  assert.equal(new URL(canonical(body)).href, new URL(`${canonicalOrigin}${canonicalPath}`).href, `${path} must have exactly the expected canonical`);
  assert.equal((body.match(/rel=["']canonical["']/gi) || []).length, 1, `${path} must emit exactly one canonical`);
  assert(/<title>[^<]+<\/title>/i.test(body), `${path} needs a title`);
  assert(/<meta[^>]+name=["']description["']/i.test(body), `${path} needs a description`);
  assert(/<main[\s>]/i.test(body), `${path} needs server-rendered primary content`);
  assert.equal(robots(body).includes('noindex'), !indexable, `${path} robots policy mismatch`);
}

for (const path of ['/', '/workflows', '/workflows/06', '/workflows/07', '/workflows/17', '/workflows/23', '/workflows/24', '/workflows/28', '/workflows/39', '/guides/installation', '/guides/gpu-errors', '/tutorials/animations-with-ipadapter-and-comfyui', '/tutorials/comfyui-full-course-from-scratch', '/lab']) {
  await assertPage(path, { indexable: true, canonicalPath: path });
}
for (const path of ['/workflows?search=8GB', '/workflows?search=sdxl', '/workflows?search=16gb', '/models?query=sentence-transformers']) {
  await assertPage(path, { indexable: false, canonicalPath: path.startsWith('/workflows') ? '/workflows' : '/models' });
}
await assertPage('/datasets', { indexable: false, canonicalPath: '/datasets' });
await assertPage('/train', { indexable: false, canonicalPath: '/train' });
await assertPage('/cloud-generators', { indexable: false, canonicalPath: '/cloud-generators' });
for (const path of ['/guides/comfyui-complete-setup', '/guides/ltx-video-cinematic-action', '/guides/train-flux-lora']) {
  await assertPage(path, { indexable: false, canonicalPath: path });
}

for (const [path, target] of [['/workflows/7', '/workflows/07'], ['/proof', '/proofs'], ['/proof/upload', '/proofs/upload'], ['/loras', '/lora-training'], ['/tools/prompt-generator', '/prompt-generator']]) {
  const { response } = await request(path);
  assert([301, 302, 307, 308].includes(response.status), `${path} must redirect`);
  assert.equal(response.headers.get('location'), target, `${path} must redirect in one hop to its canonical target`);
}

const { response: sitemapResponse, body: sitemap } = await request('/sitemap.xml');
assert.equal(sitemapResponse.status, 200, 'sitemap must return 200');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(urls.length > 0, 'sitemap must contain URLs');
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, canonicalOrigin, `sitemap URL origin mismatch: ${url}`);
  assert.equal(parsed.search, '', `sitemap must not contain query URL: ${url}`);
  const { response, body } = await request(parsed.pathname);
  assert.equal(response.status, 200, `sitemap URL must return 200: ${url}`);
  assert.equal(new URL(canonical(body)).href, new URL(url).href, `sitemap URL must self-canonicalize: ${url}`);
  assert(!robots(body).includes('noindex'), `noindex URL must not be in sitemap: ${url}`);
}

const missing = await request('/this-route-does-not-exist');
assert.equal(missing.response.status, 404, 'a missing route must return 404');
console.log(`Rendered indexability validation: PASS (${urls.length} sitemap URLs at ${base})`);
