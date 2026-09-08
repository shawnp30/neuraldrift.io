import fs from 'fs';

const tests = JSON.parse(fs.readFileSync('data/workflow-tests.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('data/workflow-assets.json', 'utf8'));
const matrix = JSON.parse(fs.readFileSync('data/workflow-test-matrix.json', 'utf8'));
const descriptions = JSON.parse(fs.readFileSync('data/workflow-descriptions.json', 'utf8'));

const testedIds = [
  '01', '04', '21', '22', '23',
  '24', '25', '26', '28', '29',
  '30', '36', '37', '38', '39',
  '40', '41', '42', '43', '44',
  '45', '46', '47', '48', '49',
  '50'
];

const classifications = {
  '01': { classification: 'EXACT_MATCH', kind: 'pipeline', reason: 'Canonical Comfy-Org Flux.1 Dev text-to-image pipeline' },
  '04': { classification: 'EXACT_MATCH', kind: 'pipeline', reason: 'Canonical SD 1.5 text-to-image pipeline' },
  '21': { classification: 'EXACT_MATCH', kind: 'utility', reason: 'Model-based 4x spatial upscaling pipeline' },
  '22': { classification: 'MISMATCH', kind: 'utility', reason: 'Titled "4x Anime Upscale" but uses general RealESRGAN_x4plus photographic model; no anime model installed' },
  '23': { classification: 'EXACT_MATCH', kind: 'enhancement', reason: 'SDXL Image-to-Image with latent encode/denoise' },
  '24': { classification: 'PARTIAL_MATCH', kind: 'enhancement', reason: 'Image-to-image with artistic prompt; not specialized neural style transfer' },
  '25': { classification: 'PARTIAL_MATCH', kind: 'enhancement', reason: 'Image-to-image with high denoise from sketch input; does not use a sketch ControlNet' },
  '26': { classification: 'EXACT_MATCH', kind: 'enhancement', reason: 'SDXL inpainting pipeline with VAEEncodeForInpaint and mask support' },
  '28': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image configured with product studio prompt and lighting settings' },
  '29': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image configured with architectural visualization prompt' },
  '30': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard Flux.1 Dev pipeline configured with high-contrast editorial portrait prompt' },
  '36': { classification: 'EXACT_MATCH', kind: 'pipeline', reason: 'SDXL text-to-image configured with batch_size: 4 latent generation' },
  '37': { classification: 'EXACT_MATCH', kind: 'pipeline', reason: 'SDXL text-to-image configured with batch iteration' },
  '38': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with vector logo prompt; not a vector graphic generator' },
  '39': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with multi-angle character concept prompt' },
  '40': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard Flux.1 Dev pipeline with realistic person photography prompt' },
  '41': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with interior architecture prompt' },
  '42': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SD 1.5 text-to-image with 8-bit pixel art prompt preset' },
  '43': { classification: 'EXACT_MATCH', kind: 'audio', reason: 'Dedicated ACE Step 1.5 audio generation pipeline' },
  '44': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard Flux.1 Dev pipeline with culinary food macro prompt' },
  '45': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with sci-fi environment concept prompt' },
  '46': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with abstract fluid geometry prompt' },
  '47': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with surrealist landscape prompt' },
  '48': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with fantasy creature prompt' },
  '49': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard SDXL text-to-image with cyberpunk city prompt' },
  '50': { classification: 'PROMPT_PRESET', kind: 'preset', reason: 'Standard Flux.1 Dev pipeline with cinematic portrait prompt preset' }
};

const auditResults = [];
let exactCount = 0;
let presetCount = 0;
let partialCount = 0;
let mismatchCount = 0;

for (const id of testedIds) {
  const c = classifications[id];
  if (c.classification === 'EXACT_MATCH') exactCount++;
  else if (c.classification === 'PROMPT_PRESET') presetCount++;
  else if (c.classification === 'PARTIAL_MATCH') partialCount++;
  else if (c.classification === 'MISMATCH') mismatchCount++;

  const m = matrix[id] || {};
  auditResults.push({
    id,
    title: m.name,
    classification: c.classification,
    workflowKind: c.kind,
    reason: c.reason,
    testArtifact: `/workflow-tests/${id}-output.${id === '43' ? 'mp3' : 'png'}`
  });
}

console.log('=== SEMANTIC AUDIT SUMMARY ===');
console.log('EXACT_MATCH:', exactCount);
console.log('PROMPT_PRESET:', presetCount);
console.log('PARTIAL_MATCH:', partialCount);
console.log('MISMATCH:', mismatchCount);
console.log('Total Tested:', testedIds.length);

fs.writeFileSync('tmp/semantic-audit.json', JSON.stringify(auditResults, null, 2));
console.log('Saved tmp/semantic-audit.json');
