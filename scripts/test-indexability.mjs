// Source-level regression checks for the indexability policy. Runtime HTML and
// response checks live in validate-indexability.mjs because they require a
// running production build.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sitemap from '../app/sitemap.ts';
import { CATALOG } from '../lib/catalog.ts';
import { TUTORIALS } from '../lib/tutorials.ts';
import { getIndexableGuides, INDEXABILITY_HOLD_GUIDES } from '../lib/guides.ts';
import { SITE_URL } from '../lib/seo.ts';

const root = process.cwd();
const source = (path) => readFileSync(join(root, path), 'utf8');
const entries = sitemap();
const urls = entries.map((entry) => entry.url);

assert.equal(new Set(urls).size, urls.length, 'sitemap URLs must be unique');
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, SITE_URL, `sitemap origin must be canonical: ${url}`);
  assert.equal(parsed.search, '', `query/filter URL must not enter sitemap: ${url}`);
  assert.equal(parsed.hash, '', `fragment URL must not enter sitemap: ${url}`);
}

for (const path of ['/models', '/datasets', '/api/', '/admin/', '/auth/', '/dashboard', '/optimizer/result', '/proofs/upload']) {
  assert(!urls.some((url) => new URL(url).pathname === path || new URL(url).pathname.startsWith(path)), `non-indexable route must not be in sitemap: ${path}`);
}

for (const workflow of CATALOG) assert(urls.includes(`${SITE_URL}/workflows/${workflow.id}`), `missing workflow sitemap URL: ${workflow.id}`);
for (const guide of getIndexableGuides()) assert(urls.includes(`${SITE_URL}/guides/${guide.slug}`), `missing guide sitemap URL: ${guide.slug}`);
for (const slug of INDEXABILITY_HOLD_GUIDES) assert(!urls.includes(`${SITE_URL}/guides/${slug}`), `evidence-hold guide must not be in sitemap: ${slug}`);
for (const tutorial of TUTORIALS) assert(urls.includes(`${SITE_URL}/tutorials/${tutorial.slug}`), `missing tutorial sitemap URL: ${tutorial.slug}`);

const catalogSource = source('lib/catalog.ts');
assert(catalogSource.includes('longDescription:w.longDescription || description'), 'workflow detail pages must retain their workflow-specific long descriptions');
assert.notEqual(CATALOG.find((workflow) => workflow.id === '39')?.longDescription, CATALOG.find((workflow) => workflow.id === '39')?.description, 'workflow 39 must retain its distinct detail description');
assert(source('app/workflows/[id]/page.tsx').includes('permanentRedirect(`/workflows/0${params.id}`)'), 'one-digit workflow aliases must permanently redirect to the zero-padded canonical');

const rootLayout = source('app/layout.tsx');
assert(!rootLayout.includes('canonical: "https://neuraldrift.io/"'), 'root layout must not force the homepage canonical onto child routes');
const workflowsPage = source('app/workflows/page.tsx');
assert(workflowsPage.includes('legacySearch'), 'legacy workflow search URLs must remain usable');
assert(workflowsPage.includes('robots: { index: Object.keys(searchParams).length === 0, follow: true }'), 'parameterized workflow states must be noindex, follow');

for (const path of ['app/models/layout.tsx', 'app/datasets/layout.tsx', 'app/train/layout.tsx', 'app/cloud-generators/layout.tsx']) {
  const text = source(path);
  assert(text.includes('robots: { index: false, follow: true }'), `${path} must noindex live, client-fed discovery results`);
  assert(text.includes('pageMeta('), `${path} must declare its clean canonical URL`);
}
for (const path of ['app/tutorials/stable-diffusion-basics/layout.tsx', 'app/tutorials/monetizing-comfyui/layout.tsx']) {
  assert(source(path).includes('pageMeta('), `${path} must have a self canonical`);
}

const forbiddenLinks = ['/community/requests', '/monetization/featured', '/workflows/generate', '/guides/fix-out-of-memory', '/guides/ai_article_with_images'];
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}
for (const file of [...files(join(root, 'app')), ...files(join(root, 'components'))].filter((file) => /\.[jt]sx?$/.test(file))) {
  const text = readFileSync(file, 'utf8');
  for (const href of forbiddenLinks) assert(!text.includes(href), `stale internal link ${href} remains in ${file}`);
}

console.log(`Indexability source policy: PASS (${urls.length} sitemap URLs, ${CATALOG.length} workflows, ${getIndexableGuides().length} indexable guides, ${TUTORIALS.length} tutorials)`);
