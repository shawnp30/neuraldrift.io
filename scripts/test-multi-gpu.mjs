import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { EXECUTIONS, HARDWARE_PROFILES, WORKFLOW_HASHES, evidenceFreshness, selectExactExecution, comparableExecutions, coldStartSummary } from '../lib/hardware/executions.ts';
import { evaluateCompatibility } from '../lib/hardware/compatibility.ts';
import { CATALOG } from '../lib/catalog.ts';
import { findGpuBySlug } from '../lib/hardware/gpuData.ts';

for (const [id, hash] of Object.entries(WORKFLOW_HASHES)) {
  const workflow = fs.readFileSync(`public/workflows/${id}.json`, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(crypto.createHash('sha256').update(workflow, 'utf8').digest('hex'), hash);
}
assert.equal(Object.keys(WORKFLOW_HASHES).length, 50);
assert.equal(new Set(EXECUTIONS.map(r => r.id)).size, EXECUTIONS.length);
for (const record of EXECUTIONS) {
  assert(HARDWARE_PROFILES.some(p => p.id === record.hardwareProfileId));
  assert(fs.existsSync('public' + record.evidenceUrl));
  if (record.outcome === 'FAILURE') assert(record.failure?.message);
}
const original = EXECUTIONS.find(r => r.workflowId === '01');
assert(original);
const old = { ...original, id: 'old', executionProfile: 'STANDARD', testDate: '2026-01-01T00:00:00.000Z' };
const failed = { ...old, id: 'failure', testDate: '2026-02-01T00:00:00.000Z', outcome: 'FAILURE', artifact: null, failure: { stage: 'execution', type: 'OOM', message: 'Fixture only: CUDA out of memory' } };
const optimized = { ...old, id: 'optimized', executionProfile: 'OPTIMIZED', optimizationNotes: 'Fixture only: lower resolution', testDate: '2026-03-01T00:00:00.000Z' };
const exact = records => selectExactExecution('01', 'rtx-5080', records);
assert.equal(exact([old, failed]).id, 'failure');
assert.equal(exact([original, failed]).id, 'failure');
assert.equal(exact([failed, old]).id, 'failure');
assert.equal(exact([old, failed, optimized]).id, 'optimized');
assert.equal(exact([old, optimized]).id, 'old');
// A preflight failure never reached the GPU: it must not hide a success, but still shows when nothing else exists.
const preflight = { ...failed, id: 'preflight', testDate: '2026-04-01T00:00:00.000Z', failure: { stage: 'preflight', type: 'Error', message: 'Fixture only: Invalid image file: input.png' } };
const legacy = { ...old, id: 'legacy', executionProfile: 'UNCLASSIFIED' };
assert.equal(exact([legacy, preflight]).id, 'legacy');
assert.equal(exact([old, preflight]).id, 'old');
assert.equal(exact([legacy, failed, preflight]).id, 'failure');
assert.equal(exact([preflight]).id, 'preflight');
// Cold-start summaries use only verified STANDARD successes on the current workflow hash.
const check = { method: 'fixture', torchReservedBytes: 0, vramFreeBytes: 14e9 };
const run = (id, runtimeSeconds, peakBytes, extra = {}) => ({ ...old, id, runtimeSeconds, coldStart: true, coldStartCheck: check, cachedNodes: [], peakVram: { status: 'MEASURED', method: 'fixture', baselineBytes: 2e9, peakBytes, sampleCount: 10 }, ...extra });
const summary = coldStartSummary('01', original.hardwareProfileId, [
  run('r1', 30, 9e9), run('r2', 10, 12e9),
  run('r3', 20, 8e9, { testDate: '2026-05-01T00:00:00.000Z', environment: { comfyui_version: '9.9.9', pytorch_version: '2.0-fixture', ram_total: 64e9 }, models: [{ filename: 'fixture.safetensors', sha256: null }], settings: { prompt: { 3: { class_type: 'KSampler', inputs: { steps: 30, cfg: 6.5, sampler_name: 'euler', scheduler: 'karras', seed: 7, model: ['4', 0] } }, 5: { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 768, batch_size: 2 } } } } }),
  run('unverified', 1, 16e9, { coldStartCheck: undefined }), run('legacy-run', 1, 16e9, { executionProfile: 'UNCLASSIFIED' }),
  run('stale', 1, 16e9, { workflowSha256: '0'.repeat(64) }),
  run('cache-hit', 0.001, 16e9, { coldStart: false, cachedNodes: ['3', '4'] }), run('no-cache-evidence', 1, 16e9, { cachedNodes: undefined }), { ...failed, id: 'failed-run', coldStartCheck: check },
]);
assert.deepEqual([summary.runs, summary.medianSeconds, summary.minSeconds, summary.maxSeconds, summary.peakVramBytes], [3, 20, 10, 30, 12e9]);
assert.deepEqual([summary.steps, summary.cfg, summary.sampler, summary.scheduler, summary.seed, summary.width, summary.height, summary.batchSize, summary.latestTestDate], [30, 6.5, 'euler', 'karras', 7, 1024, 768, 2, '2026-05-01T00:00:00.000Z'], 'settings come from the latest run\'s submitted prompt');
assert.deepEqual([summary.comfyUI, summary.pytorch, summary.ramTotalBytes, summary.modelFiles], ['9.9.9', '2.0-fixture', 64e9, ['fixture.safetensors']], 'software and models come from the latest run');
assert.equal(coldStartSummary('01', original.hardwareProfileId, [run('unverified', 1, 1e9, { coldStartCheck: null })]), null);
assert.equal(exact([{ ...old, hardwareProfileId: 'unknown' }]), null);
assert.equal(exact([{ ...old, workflowSha256: '0'.repeat(64) }]), null);
assert.equal(evidenceFreshness({ ...old, workflowSha256: null }), 'UNKNOWN');
assert.equal(evidenceFreshness({ ...old, workflowSha256: '0'.repeat(64) }), 'STALE');
const target = { gpu: findGpuBySlug('rtx-5080'), vramGb: 16 };
const workflow = CATALOG.find(w => w.id === '01');
assert.equal(evaluateCompatibility(workflow, target, [old, failed]).state, 'TESTED_FAILURE');
assert.equal(evaluateCompatibility(workflow, target, [failed, optimized]).selectedExecutionId, 'optimized');
assert.notEqual(evaluateCompatibility(workflow, { vramGb: 16 }, [old]).state, 'DIRECT_TESTED');
assert.notEqual(evaluateCompatibility(workflow, target, [{ ...old, workflowSha256: '0'.repeat(64) }]).state, 'DIRECT_TESTED');
assert.notEqual(evaluateCompatibility(workflow, { gpu: findGpuBySlug('rx-7900-xtx'), vramGb: 24 }, [old]).state, 'CLOSE_TESTED');
const hardware = [...HARDWARE_PROFILES, { ...HARDWARE_PROFILES[0], id: 'fixture-secondary', gpuId: 'fixture-other-gpu' }];
const manifest = { promptSha256: 'a'.repeat(64), inputHashes: [], modelHashes: ['b'.repeat(64)], nodeVersions: { core: '1' }, software: { comfy: '1', torch: '1', python: '1', cuda: '1' }, precision: 'FP16', launchArgs: [], timingProtocol: 'cold-cache, execution_start to execution_success' };
const a = { ...old, promptSha256: manifest.promptSha256, models: [{ filename: 'fixture.safetensors', sha256: 'b'.repeat(64) }], comparisonManifest: manifest };
const b = { ...a, id: 'fixture-b', hardwareProfileId: 'fixture-secondary' };
assert(comparableExecutions(a, b, hardware));
for (const changed of [{ executionProfile: 'OPTIMIZED' }, { settings: { steps: 999 } }, { promptSha256: null }, { comparisonManifest: null }, { models: [{ filename: 'fixture.safetensors', sha256: null }] }, { outcome: 'FAILURE' }, { workflowSha256: 'c'.repeat(64) }, { comparisonManifest: { ...manifest, precision: 'FP8' } }]) assert(!comparableExecutions(a, { ...b, ...changed }, hardware));
assert(!comparableExecutions(original, { ...original, hardwareProfileId: 'fixture-secondary' }, hardware));
console.log('Multi-GPU checks passed: hashes, references, precedence, failures, stale evidence, platform boundaries and strict comparison eligibility. Fixtures were not persisted.');
