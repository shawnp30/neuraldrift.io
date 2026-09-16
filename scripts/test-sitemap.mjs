// Deterministic, server-free coverage of app/sitemap.ts: what's included, what's
// excluded, and that lastModified is only ever real data, never invented.
import assert from 'node:assert';
import sitemap from '../app/sitemap.ts';
import { CATALOG, WORKFLOW_TESTS } from '../lib/catalog.ts';
import { getGuides } from '../lib/guides.ts';
import { TUTORIALS } from '../lib/tutorials.ts';
import { NEWSLETTER_ISSUES } from '../lib/newsletterIssues.ts';
import { TRACKED_MODELS } from '../lib/emergingModels.ts';
import { SITE_URL } from '../lib/seo.ts';

console.log('--- Running NeuralDrift Sitemap Coverage Tests ---');

const entries = sitemap();
const urls = entries.map(e => e.url);

assert(urls.every(url => url.startsWith(SITE_URL)), 'every URL must be built from the canonical SITE_URL');
assert(!urls.some(url => /localhost|127\.0\.0\.1|vercel\.app/.test(url)), 'sitemap must never contain preview/local URLs');
console.log('1. Every URL is canonical (no preview/local hosts): PASS');

assert.equal(urls.length, new Set(urls).size, 'sitemap must not contain duplicate URLs');
console.log('2. No duplicate URLs: PASS');

const REQUIRED_PATHS = [
  '/', '/workflows', '/guides', '/compatibility', '/hardware', '/hardware/rtx-5080',
  '/gpu-guide', '/tools', '/tools/vram-calculator', '/tools/caption-generator', '/models',
  '/tutorials', '/lab',
  '/about', '/glossary', '/privacy', '/terms', '/optimizer', '/optimizer/fix-my-pc',
  '/prompt-generator', '/datasets', '/proofs', '/newsletter',
];
for (const path of REQUIRED_PATHS) {
  assert(urls.includes(`${SITE_URL}${path}`), `sitemap is missing required public page: ${path}`);
}
console.log(`3. All ${REQUIRED_PATHS.length} required canonical pages present: PASS`);

const FORBIDDEN_PREFIXES = ['/api/', '/admin/', '/dashboard', '/auth/', '/stash', '/optimizer/result', '/proofs/upload', '/train', '/workflows/create', '/tools/benchmark-lookup', '/gpu-guide/runpod', '/lora-training'];
for (const prefix of FORBIDDEN_PREFIXES) {
  assert(!urls.some(url => url.startsWith(`${SITE_URL}${prefix}`)), `sitemap must not include private/API/result route: ${prefix}`);
}
assert(!urls.includes(`${SITE_URL}/pricing`), 'sitemap must not include the non-functional pricing page');
assert(!urls.includes(`${SITE_URL}/guides/best-workflows-8gb`), 'sitemap must not include the placeholder guide stub');
assert(!urls.some(url => url.startsWith(`${SITE_URL}/models/`)), 'sitemap must not include mock-data model detail pages');
assert(!urls.includes(`${SITE_URL}/cloud-generators`), 'sitemap must not include pages without canonical metadata');
console.log('4. Private/API/result/placeholder routes excluded: PASS');

for (const workflow of CATALOG) assert(urls.includes(`${SITE_URL}/workflows/${workflow.id}`), `missing dynamic workflow entry ${workflow.id}`);
for (const guide of getGuides()) assert(urls.includes(`${SITE_URL}/guides/${guide.slug}`), `missing dynamic guide entry ${guide.slug}`);
for (const tutorial of TUTORIALS) assert(urls.includes(`${SITE_URL}/tutorials/${tutorial.slug}`), `missing dynamic tutorial entry ${tutorial.slug}`);
for (const issue of NEWSLETTER_ISSUES) assert(urls.includes(`${SITE_URL}/newsletter/${issue.slug}`), `missing newsletter issue entry ${issue.slug}`);
for (const model of TRACKED_MODELS) assert(urls.includes(`${SITE_URL}/lab/${model.slug}`), `missing tracked-model Lab entry ${model.slug}`);
console.log('5. All dynamic workflow, guide, tutorial, newsletter issue, and tracked-model entries present: PASS');

const byUrl = new Map(entries.map(e => [e.url, e]));
for (const workflow of CATALOG) {
  const entry = byUrl.get(`${SITE_URL}/workflows/${workflow.id}`);
  const testDate = WORKFLOW_TESTS[workflow.id]?.testDate;
  if (testDate) assert.equal(entry.lastModified, testDate, `workflow ${workflow.id} lastModified must be the real recorded testDate, not invented`);
  else assert.equal(entry.lastModified, undefined, `workflow ${workflow.id} has no real date evidence; lastModified must be omitted, not fabricated`);
}
for (const guide of getGuides()) {
  const entry = byUrl.get(`${SITE_URL}/guides/${guide.slug}`);
  if (guide.publishedAt) assert.equal(entry.lastModified, guide.publishedAt);
  else assert.equal(entry.lastModified, undefined, `guide ${guide.slug} has no publishedAt frontmatter; lastModified must be omitted`);
}
for (const tutorial of TUTORIALS) {
  const entry = byUrl.get(`${SITE_URL}/tutorials/${tutorial.slug}`);
  assert.equal(entry.lastModified, undefined, 'tutorials have no date source in lib/tutorials.ts; lastModified must be omitted, not guessed');
}
for (const path of REQUIRED_PATHS.filter(p => p !== '/')) {
  const entry = byUrl.get(`${SITE_URL}${path}`);
  assert.equal(entry.lastModified, undefined, `static page ${path} has no reliable modification data; lastModified must be omitted`);
}
console.log('6. lastModified is present only where real source data exists, and omitted everywhere else: PASS');

for (const issue of NEWSLETTER_ISSUES) {
  const entry = byUrl.get(`${SITE_URL}/newsletter/${issue.slug}`);
  assert.equal(entry.lastModified, issue.publishedAt);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(issue.publishedAt), `issue ${issue.slug} publishedAt must be a real ISO date`);
}
console.log('7. Newsletter issue lastModified matches authored publishedAt: PASS');

console.log('\n--- ALL SITEMAP TESTS PASSED ---');
