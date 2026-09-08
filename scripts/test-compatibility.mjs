// scripts/test-compatibility.mjs
// Automated verification for NeuralDrift deterministic compatibility rules.

import assert from 'assert';
import { CATALOG } from '../lib/catalog.ts';
import { COMMON_GPUS, findGpuBySlug } from '../lib/hardware/gpuData.ts';
import { evaluateCompatibility, resolveHardwareTarget } from '../lib/hardware/compatibility.ts';

console.log('--- Running NeuralDrift Compatibility Unit Tests ---');

// 1. Exact Tested GPU Check (Workflow 01 on RTX 5080 16GB)
const wf01 = CATALOG.find(w => w.id === '01');
assert(wf01, 'Workflow 01 must exist in catalog');
const rtx5080 = findGpuBySlug('rtx-5080');
assert(rtx5080, 'RTX 5080 must exist in GPU dataset');

const resExact = evaluateCompatibility(wf01, { gpu: rtx5080, vramGb: 16 });
console.log('1. Exact GPU (RTX 5080 on 01):', resExact.state, resExact.confidence, resExact.badgeLabel);
assert.strictEqual(resExact.state, 'DIRECT_TESTED');
assert.strictEqual(resExact.confidence, 'HIGH');
assert(resExact.badgeLabel.includes('TESTED ON RTX 5080'));
assert.strictEqual(resExact.closestEvidence.isExactWorkflow, true);
assert(resExact.runtimeEvidence.runtimeSeconds > 0);

// 2. Same workflow + More VRAM (RTX 4090 24GB or generic 24GB on Workflow 01)
const rtx4090 = findGpuBySlug('rtx-4090');
assert(rtx4090, 'RTX 4090 must exist in GPU dataset');
const resMoreVram = evaluateCompatibility(wf01, { gpu: rtx4090, vramGb: 24 });
console.log('2. More VRAM (RTX 4090 24GB on 01):', resMoreVram.state, resMoreVram.confidence, resMoreVram.badgeLabel);
assert.strictEqual(resMoreVram.state, 'CLOSE_TESTED');
assert.strictEqual(resMoreVram.confidence, 'MEDIUM');
assert(resMoreVram.badgeLabel.includes('LIKELY COMPATIBLE'));
// CRITICAL: Ensure it is NOT falsely marked as DIRECT_TESTED!
assert.notStrictEqual(resMoreVram.state, 'DIRECT_TESTED', '4090 should not be labeled direct tested when only 5080 was tested');

// 3. Same workflow + Same VRAM Tier (RTX 4080 16GB on Workflow 01)
const rtx4080 = findGpuBySlug('rtx-4080');
const resSameVram = evaluateCompatibility(wf01, { gpu: rtx4080, vramGb: 16 });
console.log('3. Same VRAM Tier (RTX 4080 16GB on 01):', resSameVram.state, resSameVram.confidence);
assert.strictEqual(resSameVram.state, 'CLOSE_TESTED');
assert.strictEqual(resSameVram.confidence, 'MEDIUM');
assert.notStrictEqual(resSameVram.state, 'DIRECT_TESTED');

// 4. FALSE-POSITIVE PROTECTION: Less VRAM (Workflow 01 on 8GB VRAM / RTX 4060 8GB)
// Workflow 01 requires 12GB documented, tested on 16GB. User selects 8GB.
const rtx4060 = findGpuBySlug('rtx-4060');
const resLessVram = evaluateCompatibility(wf01, { gpu: rtx4060, vramGb: 8 });
console.log('4. Less VRAM (RTX 4060 8GB on 01 [needs 12GB]):', resLessVram.state, resLessVram.confidence, resLessVram.badgeLabel);
// MUST NOT be marked DIRECT_TESTED or CLOSE_TESTED!
assert.notStrictEqual(resLessVram.state, 'DIRECT_TESTED');
assert.notStrictEqual(resLessVram.state, 'CLOSE_TESTED');
assert.strictEqual(resLessVram.state, 'ESTIMATED');
assert.strictEqual(resLessVram.confidence, 'LOW');
assert(resLessVram.badgeLabel.includes('NEEDS 12GB+') || resLessVram.badgeTone === 'rose');
assert(resLessVram.recommendedAlternatives.length > 0, 'Should suggest alternatives for insufficient VRAM');

// 5. Workflow tested on 16GB with lower documented minimum (e.g. Workflow 04 [SD 1.5, 4GB doc]) on RTX 3060 12GB
const wf04 = CATALOG.find(w => w.id === '04');
assert(wf04, 'Workflow 04 must exist');
const rtx3060 = findGpuBySlug('rtx-3060-12gb');
const resSd15On12Gb = evaluateCompatibility(wf04, { gpu: rtx3060, vramGb: 12 });
console.log('5. Lower doc req (SD 1.5 4GB doc, tested on 16GB, selected 12GB):', resSd15On12Gb.state, resSd15On12Gb.confidence);
// Fits 12GB based on doc, but test was 16GB -> ESTIMATED, LOW confidence!
assert.strictEqual(resSd15On12Gb.state, 'ESTIMATED');
assert.strictEqual(resSd15On12Gb.confidence, 'LOW');
assert.notStrictEqual(resSd15On12Gb.state, 'DIRECT_TESTED');

// 6. Platform Blocker (Workflow 11, LTX Video with frontend subgraphs)
const wf11 = CATALOG.find(w => w.id === '11');
assert(wf11, 'Workflow 11 must exist');
const resBlocked = evaluateCompatibility(wf11, { gpu: rtx5080, vramGb: 16 });
console.log('6. Platform Blocker (Workflow 11):', resBlocked.state, resBlocked.badgeLabel);
assert.strictEqual(resBlocked.state, 'BLOCKED');
assert.strictEqual(resBlocked.badgeLabel, 'DEPENDENCY BLOCKED');
assert(resBlocked.reason.includes('frontend composite subgraphs'));

// 7. Large Model Hold (Workflow 02, Flux Schnell not installed)
const wf02 = CATALOG.find(w => w.id === '02');
assert(wf02, 'Workflow 02 must exist');
const resHold = evaluateCompatibility(wf02, { gpu: rtx5080, vramGb: 16 });
console.log('7. Large Model Hold (Workflow 02 on 16GB):', resHold.state, resHold.confidence);
assert.strictEqual(resHold.state, 'ESTIMATED');
assert.strictEqual(resHold.confidence, 'LOW');
assert(resHold.reason.includes('deferred'));

// 8. AMD Warning Verification
const rx7900 = findGpuBySlug('rx-7900-xtx');
const resAmd = evaluateCompatibility(wf01, { gpu: rx7900, vramGb: 24 });
console.log('8. AMD Warning Check:', resAmd.warnings);
assert(resAmd.warnings.some(w => w.includes('AMD GPU selected')));

// 9. Hardware Target Resolution (Slug vs VRAM tier)
const tGpu = resolveHardwareTarget('rtx-4070', null);
assert.strictEqual(tGpu.gpu.shortName, 'RTX 4070');
assert.strictEqual(tGpu.vramGb, 12);

const tVram = resolveHardwareTarget(null, 24);
assert.strictEqual(tVram.gpu, undefined);
assert.strictEqual(tVram.vramGb, 24);

console.log('\n--- ALL COMPATIBILITY UNIT TESTS PASSED WITH 100% PRECISION! ---');
