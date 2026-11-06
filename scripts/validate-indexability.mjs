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
// Local Audio: clean hub indexable and SSR-visible; parameterized states noindex with the clean canonical.
await assertPage('/lab/audio', { indexable: true, canonicalPath: '/lab/audio' });
await assertPage('/lab/audio?task=tts', { indexable: false, canonicalPath: '/lab/audio' });
{
  const { body } = await request('/lab/audio');
  assert(body.includes('ND-AUDIO-MUSIC-001') && body.includes('Voice Cloning') && body.includes('audio.cpp'), '/lab/audio must server-render its results and task discovery');
  const detail = body.match(/href="(\/lab\/benchmarks\/run-[^"]*nd-audio-music-001[^"]*)"/)?.[1];
  assert(detail, '/lab/audio must link to its audio result pages');
  const { body: result } = await request(detail);
  assert(result.includes('REAL-TIME FACTOR') && result.includes('RUNTIME LICENSE') && result.includes('MODEL LICENSE'), 'audio result pages must server-render audio metrics and both licenses');
  assert(!/<audio[\s>]/i.test(result), 'local-only artifacts must not render an audio player');
}
await assertPage('/datasets', { indexable: false, canonicalPath: '/datasets' });
await assertPage('/train', { indexable: false, canonicalPath: '/train' });
await assertPage('/cloud-generators', { indexable: false, canonicalPath: '/cloud-generators' });
await assertPage('/guides/ltx-video-cinematic-action', { indexable: false, canonicalPath: '/guides/ltx-video-cinematic-action' });
// Released from the evidence hold once their run times were tied to execution records.
for (const path of ['/guides/comfyui-complete-setup', '/guides/train-flux-lora']) {
  await assertPage(path, { indexable: true, canonicalPath: path });
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
