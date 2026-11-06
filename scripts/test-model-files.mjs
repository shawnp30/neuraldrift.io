// Deterministic coverage of lib/modelFiles.ts and its sitemap entries: every catalog
// model file gets a page, download sources appear only when verified, and only pages
// with a verified source are offered for indexing.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sitemap from '../app/sitemap.ts';
import { CATALOG, WORKFLOW_ASSETS } from '../lib/catalog.ts';
import { MODEL_FILES, isIndexableModelFile, getModelFile, getModelFileByName, modelFileSlug } from '../lib/modelFiles.ts';
import { SITE_URL } from '../lib/seo.ts';

console.log('--- Running NeuralDrift Model File Tests ---');

const aliases = JSON.parse(readFileSync('data/model-file-aliases.json', 'utf8'));
const verification = JSON.parse(readFileSync('data/model-file-verification.json', 'utf8'));

const slugs = MODEL_FILES.map((m) => m.slug);
assert.equal(new Set(slugs).size, slugs.length, 'model file slugs must be unique');
for (const model of MODEL_FILES) {
  assert.match(model.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug must be URL-safe: ${model.slug}`);
  assert.equal(getModelFile(model.slug), model);
}
console.log(`1. ${MODEL_FILES.length} unique, URL-safe slugs: PASS`);

const catalogFiles = new Set(CATALOG.flatMap((w) => WORKFLOW_ASSETS[w.id]?.models.map((m) => m.file) ?? []));
for (const file of catalogFiles) {
  if (/^diffusion_pytorch_model/.test(file)) assert.equal(getModelFileByName(file), undefined, 'generic diffusers file names must not get a page');
  else assert(getModelFileByName(file), `catalog model file has no page: ${file}`);
}
for (const model of MODEL_FILES) {
  assert(model.workflowIds.length > 0, `${model.file} must list the workflows that use it`);
  assert(model.loaderNodes.length > 0, `${model.file} must name the loader node found in the workflow JSON`);
  assert(model.dir.startsWith('ComfyUI/models/'), `${model.file} folder must be under ComfyUI/models/`);
}
console.log('2. Every catalog model file has a page with workflows, folder and loader node: PASS');

for (const model of MODEL_FILES) {
  const verified = verification.files[model.file];
  if (!verified) {
    assert.equal(model.source, null, `${model.file} must not show a source that was not verified`);
    assert.equal(model.status, 'unverified');
    continue;
  }
  assert(verified.sizeBytes > 0, `${model.file} verified size must be positive`);
  assert(/^https:\/\/(huggingface\.co|github\.com)\//.test(verified.downloadUrl), `${model.file} download must be an official host`);
  if (verified.sha256 !== null) assert.match(verified.sha256, /^[0-9a-f]{64}$/, `${model.file} sha256 must be 64 hex chars`);
  const alias = aliases[model.file];
  if (alias) {
    assert.equal(model.status, 'renamed');
    assert.equal(verified.path.split('/').pop(), alias.officialFile, `${model.file} must verify the alias's official file`);
  } else {
    assert.equal(model.status, 'verified');
    assert.equal(verified.path.split('/').pop(), model.file, `${model.file} verified path must be that exact file`);
  }
}
for (const file of Object.keys(aliases)) assert(verification.files[file], `alias ${file} must have a verified official file`);
console.log('3. Sources shown only when verified; renamed files point at their official name: PASS');

const urls = sitemap().map((e) => e.url);
assert(urls.includes(`${SITE_URL}/model-files`), 'model file hub must be in the sitemap');
for (const model of MODEL_FILES) {
  const url = `${SITE_URL}/model-files/${model.slug}`;
  if (isIndexableModelFile(model)) assert(urls.includes(url), `indexable model file missing from sitemap: ${model.file}`);
  else assert(!urls.includes(url), `unverified model file must not be in sitemap: ${model.file}`);
}
assert.equal(modelFileSlug('mm_sd_v15_v3.ckpt'), 'mm-sd-v15-v3-ckpt');
console.log(`4. Sitemap lists the hub and ${MODEL_FILES.filter(isIndexableModelFile).length} verified model files only: PASS`);

console.log('\n--- ALL MODEL FILE TESTS PASSED ---');
