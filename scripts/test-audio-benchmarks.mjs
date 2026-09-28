// scripts/test-audio-benchmarks.mjs
// Local Audio AI benchmark tests: WAV decoding, audio artifact validation, content hashing,
// audio metrics, record assembly (PASS / FAIL / ERROR), adapter parsing, comparison, and Lab rendering.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { analyzeWav, encodeWav, AudioDecodeError } from '../lib/benchmarks/audio.ts';
import { validateBenchmarkOutput } from '../lib/benchmarks/validators.ts';
import { sha256File, hashFile, hashFileCached, inspectAudioArtifact, verifyWorkloadInputs, buildArtifactRef } from '../lib/benchmarks/artifacts.ts';
import { assembleAudioRecord, realTimeFactor } from '../lib/benchmarks/audioRecord.ts';
import { parseAudioCppMetrics, parseAudioCppVersion, buildAudioCppArgs } from '../lib/benchmarks/adapters/audioCpp.ts';
import { parseRunnerResult, failureStageFromRunner } from '../lib/benchmarks/adapters/aceStepPython.ts';
import { checkComparability, calculateConfigFingerprint } from '../lib/benchmarks/fingerprint.ts';
import { getWorkloadById } from '../lib/benchmarks/workloads.ts';
import { getAllBenchmarks } from '../lib/benchmarks/registry.ts';
import { servedArtifactUrls } from '../lib/benchmarks/publicArtifacts.ts';
import { gpuArchFromComputeCapability, hardwareIdFromGpuName, parseDriverCudaVersion } from '../lib/benchmarks/environment.ts';
import { groupAudioRuns, stat, knownLimitationsFor } from '../lib/audio/comparison.ts';
import { UPSTREAM_FAMILIES, upstreamFamiliesForTask, AUDIO_TASKS } from '../lib/audio/catalog.ts';
import { ACE_STEP_15_TURBO } from '../lib/audio/models.ts';
import { getMetricsView, MetricsGrid, MetricsSummary } from '../components/lab/BenchmarkMetrics.tsx';
import { ArtifactPanel, LicensePanel } from '../components/lab/EvidencePanels.tsx';

console.log('--- Running NeuralDrift Local Audio Benchmark Tests ---');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nd-audio-test-'));
const sine = (seconds, rate, amp = 0.5, freq = 440) => Float32Array.from({ length: Math.round(seconds * rate) }, (_, i) => amp * Math.sin((2 * Math.PI * freq * i) / rate));

// 1. WAV decoding -----------------------------------------------------------
const pcm = analyzeWav(encodeWav([sine(2, 48000), sine(2, 48000)], 48000, 'pcm16'));
assert.equal(pcm.sampleFormat, 'pcm');
assert.equal(pcm.bitsPerSample, 16);
assert.equal(pcm.sampleRateHz, 48000);
assert.equal(pcm.channels, 2);
assert.equal(pcm.durationSec, 2);
assert(Math.abs(pcm.rmsDbfs - 20 * Math.log10(0.5 / Math.SQRT2)) < 0.1, `sine RMS must be ≈ -9.03 dBFS, got ${pcm.rmsDbfs}`);
const flt = analyzeWav(encodeWav([sine(1, 44100, 0.25)], 44100, 'float32'));
assert.equal(flt.sampleFormat, 'float');
assert.equal(flt.channels, 1);
assert(Math.abs(flt.peakDbfs - 20 * Math.log10(0.25)) < 0.05);
const silent = analyzeWav(encodeWav([new Float32Array(48000)], 48000));
assert.equal(silent.rmsDbfs, -Infinity, 'digital silence must measure -Infinity dBFS');
assert.throws(() => analyzeWav(new TextEncoder().encode('not a wav file at all')), AudioDecodeError);
const truncated = encodeWav([sine(1, 8000)], 8000).slice(0, 44);
assert.throws(() => analyzeWav(truncated), AudioDecodeError, 'a header with no frames must not decode');
console.log('1. WAV decoding (PCM16, float32, silence, garbage, truncated): PASS');

// 2. Audio artifact validator -------------------------------------------------
const music = getWorkloadById('ND-AUDIO-MUSIC-001');
assert(music && music.category === 'creator_audio' && music.audioTask === 'music');
assert.equal(music.version, '1.0.0');
assert.equal(music.expectedResult.type, 'audio_artifact');
assert.equal(music.generationSettings, undefined, 'audio workloads must not carry text generation settings');
const obs = (analysis, extra = {}) => ({ path: 'x.wav', exists: true, analysis, ...extra });
const good = analyzeWav(encodeWav([sine(30, 48000), sine(30, 48000)], 48000));
assert.equal(validateBenchmarkOutput(music, '', { audioArtifact: obs(good) }).passed, true, 'a 30 s stereo 48 kHz non-silent WAV must pass');
const failCases = {
  'missing observation': undefined,
  'file missing': { path: 'gone.wav', exists: false },
  'undecodable': { path: 'bad.wav', exists: true, decodeError: 'Not a RIFF/WAVE file.' },
  'silent': obs(analyzeWav(encodeWav([new Float32Array(48000 * 30), new Float32Array(48000 * 30)], 48000))),
  'too short': obs(analyzeWav(encodeWav([sine(5, 48000), sine(5, 48000)], 48000))),
  'wrong sample rate': obs(analyzeWav(encodeWav([sine(30, 44100), sine(30, 44100)], 44100))),
  'mono': obs(analyzeWav(encodeWav([sine(30, 48000)], 48000))),
};
for (const [label, observation] of Object.entries(failCases)) {
  const report = validateBenchmarkOutput(music, '', { audioArtifact: observation });
  assert.equal(report.passed, false, `audio validation must FAIL when ${label}`);
  assert.equal(report.validator, 'audio_artifact');
}
console.log('2. Audio artifact validator (exists, decodes, duration, silence, format): PASS');

// 3. Artifact hashing ----------------------------------------------------------
const wavPath = path.join(tmp, 'clip.wav');
const wavBytes = encodeWav([sine(1, 16000)], 16000);
fs.writeFileSync(wavPath, wavBytes);
const expectedSha = crypto.createHash('sha256').update(wavBytes).digest('hex');
assert.equal(await sha256File(wavPath), expectedSha);
const ref = await buildArtifactRef(wavPath, tmp, 'wav');
assert.deepEqual(ref, { path: 'clip.wav', sha256: expectedSha, bytes: wavBytes.length, format: 'wav', storage: 'local_only' });
const cacheFile = path.join(tmp, 'cache.json');
const first = await hashFileCached(wavPath, tmp, cacheFile);
assert.equal(first.sha256, expectedSha);
fs.appendFileSync(wavPath, Buffer.from([1, 2, 3, 4]));
const after = await hashFileCached(wavPath, tmp, cacheFile);
assert.notEqual(after.sha256, expectedSha, 'a changed file must be re-hashed, never served from cache');
const inspected = await inspectAudioArtifact(path.join(tmp, 'nope.wav'));
assert.equal(inspected.exists, false);
const voice = path.join(tmp, 'voice.wav');
fs.writeFileSync(voice, wavBytes);
const declared = [{ role: 'reference_voice', path: 'voice.wav', sha256: expectedSha, bytes: wavBytes.length }];
assert.equal((await verifyWorkloadInputs(declared, tmp))[0].sha256, expectedSha);
fs.writeFileSync(voice, encodeWav([sine(1, 16000, 0.9)], 16000));
await assert.rejects(verifyWorkloadInputs(declared, tmp), /content changed/, 'an input whose content changed under the same filename must be refused');
console.log('3. Artifact/model/input content hashing and cache invalidation: PASS');

// 4. Audio metrics --------------------------------------------------------------
assert.equal(realTimeFactor(20000, 10), 2);
assert.equal(realTimeFactor(13513.1, 30), 0.4504);
assert.equal(realTimeFactor(null, 30), null);
assert.equal(realTimeFactor(1000, 0), null);
assert.deepEqual(stat([3, 1, 2]), { median: 2, min: 1, max: 3, n: 3 });
assert.deepEqual(stat([4, 1, null, 2, 3]), { median: 2.5, min: 1, max: 4, n: 4 });
assert.equal(stat([null, undefined]), null);
assert.equal(gpuArchFromComputeCapability('12.0'), 'Blackwell');
assert.equal(gpuArchFromComputeCapability('8.9'), 'Ada Lovelace');
assert.equal(hardwareIdFromGpuName('NVIDIA GeForce RTX 5080'), 'local-rtx-5080', 'derived hardware ID must match historical records');
assert.equal(parseDriverCudaVersion('| NVIDIA-SMI 616.92   KMD Version: 616.92   CUDA UMD Version: 13.4 |'), '13.4');
assert.equal(parseDriverCudaVersion('| NVIDIA-SMI 560.35   Driver Version: 560.35   CUDA Version: 12.6 |'), '12.6');
console.log('4. Audio metrics (RTF, medians) and environment parsing: PASS');

// 5. Record assembly: PASS / FAIL / ERROR ---------------------------------------
const hardware = { id: 'local-rtx-5080', gpuName: 'NVIDIA GeForce RTX 5080', gpuArch: 'Blackwell', gpuCount: 1, vramBytes: 17094934528, systemRamBytes: 68719476736, formFactor: 'desktop', isCloud: false };
const software = { os: 'win32 10.0.26200', driverVersion: '616.92', cudaVersion: '13.4', pythonVersion: null };
const model = { ...ACE_STEP_15_TURBO, files: [{ path: 'ACE-Step1.5-GGUF/turbo/ace-step-1.5-turbo-bf16.gguf', sha256: '93974239a29a1a821b3cc1b1ca7e1c6229b1a900a0e44a1a9770bb2271d2be5f', bytes: 10090398272 }] };
const execution = (overrides = {}) => ({
  outputPath: 'out.wav',
  runtime: { runtime: 'audio_cpp', runtimeVersion: '0.8.2-audio8-perf-hotfix', backend: 'cuda', precision: 'bf16', attentionBackend: 'ggml' },
  failure: null,
  outputMetrics: { kind: 'audio', requestedDurationSec: 30, outputDurationSec: null, generationTimeMs: 13513.1, realTimeFactor: null, sampleRateHz: 48000, channels: 2, peakVramBytes: 16e9, vramBaselineBytes: 3e9, peakRamBytes: 4.5e9, gpuUtilizationPct: 98 },
  rawTrace: {},
  ...overrides,
});
const base = { runId: 'run-test-1', timestamp: '2026-09-28T00:00:00.000Z', workload: music, model, hardware, software, artifact: { path: 'evidence-artifacts/run-test-1/output.wav', sha256: 'f'.repeat(64), bytes: 5760044, format: 'wav', storage: 'local_only' } };
const passRec = assembleAudioRecord({ ...base, execution: execution(), observation: obs(good) });
assert.equal(passRec.outcome, 'PASS');
assert.equal(passRec.failure, null);
assert.equal(passRec.outputMetrics.outputDurationSec, 30);
assert.equal(passRec.outputMetrics.realTimeFactor, 0.4504);
assert.equal(passRec.configFingerprint, calculateConfigFingerprint(passRec));
assert.equal(passRec.rawInferenceMetrics, null, 'audio records must not fabricate token metrics');
const failRec = assembleAudioRecord({ ...base, execution: execution(), observation: failCases.silent });
assert.equal(failRec.outcome, 'FAIL');
assert.equal(failRec.failure.stage, 'validation');
assert.equal(failRec.failure.type, 'ARTIFACT_INVALID');
const errRec = assembleAudioRecord({ ...base, artifact: null, observation: undefined, execution: execution({ outputPath: null, failure: { stage: 'model_load', type: 'EXIT_1', message: 'failed to load gguf' }, outputMetrics: { ...execution().outputMetrics, generationTimeMs: 2100 } }) });
assert.equal(errRec.outcome, 'ERROR');
assert.deepEqual(errRec.failure, { stage: 'model_load', type: 'EXIT_1', message: 'failed to load gguf' });
assert.equal(errRec.validation.passed, false);
assert.deepEqual(errRec.artifacts, []);
assert.equal(errRec.outputMetrics.realTimeFactor, null, 'no RTF without a decoded output');
console.log('5. Audio record assembly and structured failure evidence (PASS/FAIL/ERROR): PASS');

// 6. Adapter parsing ------------------------------------------------------------
const version = parseAudioCppVersion('audio.cpp 0.8.2-audio8-perf-hotfix\ngit: ac16661d 2026-09-24\nbuild: Release, msvc 19.44.35229.0, Windows AMD64\nbackends: cpu,cuda\n');
assert.deepEqual(version, { version: '0.8.2-audio8-perf-hotfix', gitCommit: 'ac16661d', gitDate: '2026-09-24', backends: ['cpu', 'cuda'] });
assert.equal(parseAudioCppVersion('something else'), null);
const metrics = parseAudioCppMetrics('family=ace_step\nmetrics.wall_ms=9429.42\nmetrics.rtf=0.314314\nmetrics.sample_rate=48000\nmetrics.channels=2\n');
assert.deepEqual(metrics, { wall_ms: '9429.42', rtf: '0.314314', sample_rate: '48000', channels: '2' });
const cli = buildAudioCppArgs(music, { family: 'ace_step', modelPath: 'models/turbo', backend: 'cuda', device: 0, outPath: 'o.wav' });
const pair = (flag) => cli[cli.indexOf(flag) + 1];
assert.equal(pair('--family'), 'ace_step');
assert.equal(pair('--task-route'), 'text2music');
assert.equal(pair('--seed'), '42');
assert.equal(pair('--duration-seconds'), '30');
assert.equal(pair('--num-inference-steps'), '8');
assert.equal(pair('--text'), music.prompt);
for (const opt of ['lyrics=[Instrumental]', 'shift=3', 'bpm=85', 'keyscale=C minor', 'infer_method=ode', 'lm_temperature=0.85']) {
  assert(cli.includes(opt), `audio.cpp args must pin ${opt}`);
}
assert(cli.includes('--metrics') && pair('--out') === 'o.wav');
assert.equal(parseRunnerResult('noise\nND_RESULT_JSON {"stage":"execution","success":true,"loadMs":1}\n').success, true);
assert.equal(parseRunnerResult('no result line'), null);
assert.equal(failureStageFromRunner('model_load'), 'model_load');
assert.equal(failureStageFromRunner('preflight'), 'preflight');
console.log('6. audio.cpp / ACE-Step adapter parsing and pinned CLI arguments: PASS');

// 7. Comparison -----------------------------------------------------------------
const pyRec = assembleAudioRecord({
  ...base,
  runId: 'run-test-py',
  model: { ...ACE_STEP_15_TURBO, files: [{ path: 'acestep-v15-turbo/model.safetensors', sha256: 'a'.repeat(64), bytes: 4.8e9 }] },
  execution: execution({ runtime: { runtime: 'pytorch', runtimeVersion: 'ace-step 1.5.0', backend: 'cuda', precision: 'bf16', attentionBackend: 'sdpa' } }),
  observation: obs(good),
});
const ab = checkComparability(passRec, pyRec);
assert.equal(ab.comparable, true);
assert.equal(ab.matchTier, 'different_runtime');
assert(ab.warnings.some((w) => w.includes('different weight files')), 'converted weights must be flagged');
assert(ab.warnings.some((w) => w.includes('attention backend')), 'attention backend difference must be flagged');
const grouped = groupAudioRuns('ND-AUDIO-MUSIC-001', [passRec, pyRec, { ...passRec, id: 'run-test-2', outputMetrics: { ...passRec.outputMetrics, generationTimeMs: 30888.6 } }]);
assert.equal(grouped.length, 2);
const cpp = grouped.find((g) => g.runtime === 'audio_cpp');
assert.equal(cpp.runs.length, 2);
assert.equal(cpp.stats.generationTimeMs.max, 30888.6, 'slow runs must stay in the statistics');
assert.equal(Object.keys(grouped[0]).includes('winner') || Object.keys(grouped[0]).includes('score'), false, 'no composite score or winner');
console.log('7. Cross-implementation comparability and per-runtime statistics (no winner): PASS');

// 8. Live audio evidence --------------------------------------------------------
const liveAudio = getAllBenchmarks().filter((r) => r.category === 'creator_audio');
for (const r of liveAudio) {
  assert.equal(r.outputMetrics?.kind, 'audio', `${r.id} must carry audio output metrics`);
  assert.equal(r.configFingerprint, calculateConfigFingerprint(r), `${r.id} fingerprint must recompute`);
  assert(r.model.files?.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)), `${r.id} model files must be content-hashed`);
  assert(r.model.license && r.runtime.license, `${r.id} must record runtime and model licenses separately`);
  assert.notEqual(r.model.license.sourceUrl, r.runtime.license.sourceUrl, 'runtime and model license must be distinct sources');
  for (const a of r.artifacts ?? []) {
    assert.match(a.sha256, /^[0-9a-f]{64}$/);
    assert(!a.path.match(/\.wav$/) || !fs.existsSync(path.join('public', a.path)), 'WAV artifacts must not be committed under public/ without explicit publication');
    const local = path.join(process.cwd(), a.path);
    if (fs.existsSync(local)) assert.equal(await sha256File(local), a.sha256, `${r.id} retained artifact must still match its recorded hash`);
    if (a.storage === 'public') assert(servedArtifactUrls(r).includes(a.publicUrl), `${r.id} published artifact must exist under public/`);
  }
  assert(fs.existsSync(path.join('public', r.rawEvidenceUrl)), `${r.id} raw evidence JSON must be published`);
}
console.log(`8. ${liveAudio.length} live audio records: schema, fingerprints, hashes, licenses, evidence files: PASS`);

// 9. Lab rendering --------------------------------------------------------------
const html = (el) => renderToStaticMarkup(el);
for (const r of getAllBenchmarks()) {
  const view = getMetricsView(r);
  assert(view, `${r.id} must have a metrics view`);
  const grid = html(createElement(MetricsGrid, { run: r }));
  assert(grid.includes(`data-metrics-kind="${view.kind}"`));
  if (r.workloadId === 'ND-LLM-001') assert(grid.includes('tok/s') && view.kind === 'raw_inference', 'LLM records keep token metrics');
  if (r.workloadId === 'ND-AGENT-001') assert(grid.includes('TOOL CALLS') && view.kind === 'workload', 'agent records keep tool metrics');
  if (r.category === 'creator_audio') assert(grid.includes('REAL-TIME FACTOR') && !grid.includes('tok/s'), 'audio records render audio metrics');
  assert(html(createElement(MetricsSummary, { run: r })).includes('Peak VRAM'));
}
const localOnly = html(createElement(ArtifactPanel, { artifacts: [base.artifact], playableUrls: [] }));
assert(!localOnly.includes('<audio'), 'a local-only artifact must never render a player');
assert(localOnly.includes('f'.repeat(64)), 'artifact hash must be shown');
const unserved = html(createElement(ArtifactPanel, { artifacts: [{ ...base.artifact, storage: 'public', publicUrl: '/audio/missing.wav' }], playableUrls: [] }));
assert(!unserved.includes('<audio'), 'a published URL whose file is not served must not render a player');
const served = html(createElement(ArtifactPanel, { artifacts: [{ ...base.artifact, storage: 'public', publicUrl: '/audio/ok.wav' }], playableUrls: ['/audio/ok.wav'] }));
assert(served.includes('<audio') && served.includes('src="/audio/ok.wav"'), 'a served artifact renders a player');
assert.deepEqual(servedArtifactUrls({ artifacts: [{ ...base.artifact, storage: 'public', publicUrl: '/definitely-not-here.wav' }] }), []);
const licenses = html(createElement(LicensePanel, { run: passRec.runtime.license ? passRec : { ...passRec, runtime: { ...passRec.runtime, license: { id: 'Apache-2.0', commercialUse: 'COMMERCIAL_OK', sourceUrl: 'https://example.invalid/runtime' } } } }));
assert(licenses.includes('RUNTIME LICENSE') && licenses.includes('MODEL LICENSE') && licenses.includes('not legal advice'));
assert(knownLimitationsFor(pyRec).some((l) => l.includes('nano-vllm')), 'Python reference records disclose the planner backend fallback');
console.log('9. Lab rendering: token/tool/audio views, no broken players, separate licenses: PASS');

// 10. Upstream discovery data -----------------------------------------------------
assert(UPSTREAM_FAMILIES.length >= 50);
for (const task of AUDIO_TASKS) assert(upstreamFamiliesForTask(task.id).length > 0, `task ${task.id} must list sourced families`);
assert(UPSTREAM_FAMILIES.every((f) => f.licenseInfo && f.licenseInfo.checked), 'every upstream family must carry a sourced license row');
assert.equal(UPSTREAM_FAMILIES.find((f) => f.family === 'ace_step').licenseInfo.commercialUse, 'COMMERCIAL_OK');
assert.equal(UPSTREAM_FAMILIES.find((f) => f.family === 'yue2').licenseInfo.commercialUse, 'NON_COMMERCIAL', 'non-commercial licenses must not be upgraded');
console.log('10. Task discovery data is sourced and license-labelled: PASS');

fs.rmSync(tmp, { recursive: true, force: true });
console.log('\n--- ALL LOCAL AUDIO BENCHMARK TESTS PASSED (10/10) ---');
