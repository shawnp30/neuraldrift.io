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
const expectedContentSha = crypto.createHash('sha256').update(wavBytes.subarray(44)).digest('hex'); // data chunk only
assert.deepEqual(ref, { path: 'clip.wav', sha256: expectedSha, bytes: wavBytes.length, format: 'wav', storage: 'local_only', contentSha256: expectedContentSha });
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

// 11. Distribution statistics -------------------------------------------------------
const { distribution } = await import('../lib/benchmarks/stats.ts');
const d10 = distribution([10, 12, 11, 13, 50, 12, 11, 10, 12, 11]);
assert.equal(d10.n, 10);
assert.equal(d10.median, 11.5);
assert.equal(d10.max, 50, 'outliers stay in the distribution');
assert.equal(d10.p95, null, 'p95 is not reported for n < 20');
assert(d10.cv > 0.5 && d10.stdev > 10);
const d20 = distribution(Array.from({ length: 20 }, (_, i) => i + 1));
assert.equal(d20.p95, 19, 'nearest-rank p95 for n = 20');
assert.equal(distribution([]), null);
console.log('11. Distribution statistics (median, mean, stdev, CV, p95 only when n ≥ 20): PASS');

// 12. Warm-session record assembly ----------------------------------------------------
const { assembleAudioSessionRecord } = await import('../lib/benchmarks/audioRecord.ts');
const session002 = getWorkloadById('ND-AUDIO-MUSIC-002');
assert(session002 && session002.session.measuredIterations === 10 && session002.session.warmupIterations === 1);
assert.deepEqual(session002.audioSettings, music.audioSettings, 'ND-AUDIO-MUSIC-002 must reuse ND-AUDIO-MUSIC-001 settings exactly');
assert.equal(session002.prompt, music.prompt);
const miniSession = { ...session002, session: { warmupIterations: 1, measuredIterations: 3 } };
const sess = (iterations, failure = null) => ({ runtime: execution().runtime, failure, telemetry: null, processWallMs: 60000, startupAndLoadMs: 9000, startupAndLoadBasis: 'derived', generationSource: 'test', iterations, rawTrace: {} });
const its = [['warmup-01', true, 5000], ['iter-01', false, 9000], ['iter-02', false, 11000], ['iter-03', false, 10000]].map(([id, warmup, ms], index) => ({ id, index, warmup, generationMs: ms, outputPath: `${id}.wav` }));
const outputsFor = (obsFor) => new Map(its.map((it) => [it.id, { observation: obsFor(it.id), artifact: { ...base.artifact, path: `${it.id}.wav`, sha256: 'e'.repeat(64) } }]));
const sessRec = assembleAudioSessionRecord({ ...base, runId: 'run-test-session', workload: miniSession, session: sess(its), outputs: outputsFor(() => obs(good)) });
assert.equal(sessRec.outcome, 'PASS');
assert.equal(sessRec.sessionMetrics.measuredIterations, 3);
assert.equal(sessRec.sessionMetrics.generationMs.median, 10000, 'warm-up iterations are excluded from the statistics');
assert.equal(sessRec.sessionMetrics.distinctMeasuredOutputs, 1);
assert.equal(sessRec.outputMetrics.generationTimeMs, 10000);
assert.equal(sessRec.artifacts.length, 4, 'every iteration artifact, warm-up included, is recorded');
const oneBad = assembleAudioSessionRecord({ ...base, runId: 'run-test-session-bad', workload: miniSession, session: sess(its), outputs: outputsFor((id) => (id === 'iter-02' ? failCases.silent : obs(good))) });
assert.equal(oneBad.outcome, 'FAIL', 'one invalid iteration fails the whole session');
const incomplete = assembleAudioSessionRecord({ ...base, runId: 'run-test-session-short', workload: miniSession, session: sess(its.slice(0, 3)), outputs: outputsFor(() => obs(good)) });
assert.equal(incomplete.outcome, 'FAIL', 'fewer measured iterations than declared must not PASS');
console.log('12. Warm-session assembly: warm-up excluded, every output validated, incomplete sessions fail: PASS');

// 13. audio.cpp request options fail closed -----------------------------------------
const { audioCppRequestOptions, buildAudioCppRequestSequence, UnsupportedOptionError } = await import('../lib/benchmarks/adapters/audioCpp.ts');
assert.throws(() => audioCppRequestOptions({ ...music, audioSettings: { ...music.audioSettings, modelOptions: { shfit: 3 } } }, 'ace_step'), UnsupportedOptionError, 'a misspelled option must be refused, not silently ignored');
assert.throws(() => audioCppRequestOptions(music, 'some_unverified_family'), UnsupportedOptionError);
assert.equal(audioCppRequestOptions(music, 'ace_step', { audio_codes: '<|audio_code_1|>' }).audio_codes, '<|audio_code_1|>');
const seq = buildAudioCppRequestSequence(session002, 'ace_step');
assert.equal(seq.requests.length, 11);
assert.equal(seq.requests[0].id, 'warmup-01');
assert.equal(seq.requests[10].id, 'iter-10');
// audiocpp_cli reads model options for sequence items only from the nested "options" object
// (app/cli/request.cpp); top-level keys outside a fixed list are silently dropped.
for (const r of seq.requests) {
  assert.deepEqual(Object.keys(r).sort(), ['id', 'language', 'options', 'text'], 'sequence items carry only text/language/id at top level; every model option goes under "options"');
  assert.equal(r.text, music.prompt);
  for (const [k, v] of Object.entries({ seed: '42', duration_seconds: '30', shift: '3', bpm: '85', keyscale: 'C minor', thinking: 'true', route: 'text2music', lyrics: '[Instrumental]' })) {
    assert.equal(r.options[k], v, `pinned option ${k} must be nested under options`);
  }
}
const seq3 = buildAudioCppRequestSequence(getWorkloadById('ND-AUDIO-MUSIC-003'), 'ace_step', { audio_codes: '<|audio_code_1|>' });
assert.equal(seq3.requests[0].options.audio_codes, '<|audio_code_1|>', 'input-delivered audio codes are nested under options');
assert.equal(seq3.requests[0].options.thinking, 'false');
console.log('13. audio.cpp request options: allow-listed, misspellings refused, sequence options nested: PASS');

// 14. Telemetry parsing ---------------------------------------------------------------
const { parseGpuSampleLine, parseTreeSampleLine } = await import('../lib/benchmarks/telemetry.ts');
assert.deepEqual(parseGpuSampleLine('15392, 99, 70, 69, 282.24, 2970'), { memoryUsedBytes: 15392 * 1024 * 1024, utilizationPct: 99, memoryUtilizationPct: 70, temperatureC: 69, powerW: 282.24, smClockMHz: 2970 });
assert.equal(parseGpuSampleLine('[N/A], 3'), null);
assert.equal(parseGpuSampleLine('1000, 5, 1, 40, [N/A], 600').powerW, null, 'unavailable fields become null, never 0');
assert.deepEqual(parseTreeSampleLine('4102508544|1234,5678'), { workingSetBytes: 4102508544, pids: [1234, 5678] });
assert.equal(parseTreeSampleLine('garbage'), null);
console.log('14. Telemetry sample parsing (nulls for unavailable fields): PASS');

// 15. Errata keep recorded evidence intact -----------------------------------------------
const { ERRATA, effectiveValue, readField } = await import('../lib/benchmarks/errata.ts');
for (const e of ERRATA) {
  const rec = getAllBenchmarks().find((r) => r.id === e.recordId);
  assert(rec, `erratum references a missing record: ${e.recordId}`);
  assert.deepEqual(readField(rec, e.field), e.recordedValue, `erratum for ${e.recordId} must quote the stored value exactly (evidence is never rewritten)`);
  assert.equal(effectiveValue(rec, e.field).value, e.correctedValue);
  assert(e.issue.length > 40 && e.correctionMethod.length > 20);
}
console.log(`15. ${ERRATA.length} erratum/errata: recorded values untouched, corrections explicit: PASS`);

// 16. Constrained VRAM is its own configuration -------------------------------------------
const constrained = { ...passRec, executionConditions: { kind: 'constrained_vram', vramBallastBytes: 6 * 2 ** 30, freeVramBeforeRunBytes: 7e9, method: 'test' } };
assert.notEqual(calculateConfigFingerprint(constrained), passRec.configFingerprint, 'a VRAM ballast must enter the fingerprint');
assert(checkComparability(passRec, constrained).warnings.some((w) => w.includes('constrained VRAM')));
console.log('16. Constrained-VRAM runs fingerprinted and flagged in comparisons: PASS');

// 17. Session / errata / conditions rendering -------------------------------------------
const { SessionPanel, ConditionsPanel, ErrataPanel } = await import('../components/lab/SessionTelemetryPanels.tsx');
const sessHtml = html(createElement(SessionPanel, { session: sessRec.sessionMetrics }));
assert(sessHtml.includes('1 WARM-UP + 3 MEASURED') && sessHtml.includes('CV') && sessHtml.includes('n &lt; 20'));
assert(html(createElement(MetricsGrid, { run: sessRec })).includes('MEDIAN WARM GENERATION'));
assert(html(createElement(ConditionsPanel, { conditions: constrained.executionConditions })).includes('NOT A DIFFERENT GPU'));
if (ERRATA.length) assert(html(createElement(ErrataPanel, { errata: ERRATA })).includes('RECORDED EVIDENCE IS UNCHANGED'));
console.log('17. Session, constrained-VRAM and errata panels render: PASS');

// 18. Audio content identity and waveform comparison -------------------------------------
const { compareWaveforms, decodeWavMono, wavDataRange } = await import('../lib/benchmarks/audio.ts');
const plain = encodeWav([sine(1, 16000), sine(1, 16000)], 16000);
// Same audio with an extra metadata chunk before "data" (as writers add PEAK/LIST chunks).
const meta = new Uint8Array(plain.length + 16);
meta.set(plain.subarray(0, 36), 0);
meta.set(new TextEncoder().encode('LIST'), 36);
new DataView(meta.buffer).setUint32(40, 8, true);
meta.set(new TextEncoder().encode('INFOtest'), 44);
meta.set(plain.subarray(36), 52);
new DataView(meta.buffer).setUint32(4, meta.length - 8, true);
fs.writeFileSync(path.join(tmp, 'plain.wav'), plain);
fs.writeFileSync(path.join(tmp, 'meta.wav'), meta);
const refPlain = await buildArtifactRef(path.join(tmp, 'plain.wav'), tmp, 'wav');
const refMeta = await buildArtifactRef(path.join(tmp, 'meta.wav'), tmp, 'wav');
assert.notEqual(refPlain.sha256, refMeta.sha256, 'files differ');
assert.equal(refPlain.contentSha256, refMeta.contentSha256, 'identical audio payloads share a content hash despite different metadata');
assert.deepEqual(wavDataRange(meta), { offset: 60, size: plain.length - 44 });
const w = decodeWavMono(plain);
assert.equal(compareWaveforms(w, w).sampleCorrelation, 1);
assert.equal(compareWaveforms(w, { ...w, samples: w.samples.map((x) => -x) }).sampleCorrelation, -1);
const noise = { sampleRateHz: 16000, samples: Float32Array.from({ length: 16000 }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1) };
assert(Math.abs(compareWaveforms(w, noise).sampleCorrelation) < 0.2, 'unrelated signals correlate weakly');
const sessWithContent = assembleAudioSessionRecord({ ...base, runId: 'run-test-content', workload: miniSession, session: sess(its), outputs: new Map(its.map((it, i) => [it.id, { observation: obs(good), artifact: { ...base.artifact, sha256: String(i).repeat(64).slice(0, 64), contentSha256: 'c'.repeat(64) } }])) });
assert.equal(sessWithContent.sessionMetrics.distinctMeasuredOutputs, 1, 'distinct outputs count audio content, not file bytes');
console.log('18. Audio content hashes ignore metadata; waveform comparison; distinct audio counted by content: PASS');

// 19. Invalidated records stay visible but never enter statistics ------------------------
const { isInvalidated } = await import('../lib/benchmarks/errata.ts');
const { warmSessionRows, configurationRows } = await import('../lib/audio/comparison.ts');
const invalidated = ERRATA.filter((e) => e.invalidatesRecord).map((e) => e.recordId);
assert(invalidated.length > 0);
for (const id of invalidated) {
  assert(isInvalidated(id));
  assert(getAllBenchmarks().some((r) => r.id === id), 'invalidated records remain published');
}
const used = [
  ...groupAudioRuns('ND-AUDIO-MUSIC-001').flatMap((g) => g.runs),
  ...['ND-AUDIO-MUSIC-001', 'ND-AUDIO-MUSIC-002', 'ND-AUDIO-MUSIC-003'].flatMap((w) => configurationRows(w).flatMap((r) => r.runs)),
  ...['ND-AUDIO-MUSIC-002', 'ND-AUDIO-MUSIC-003'].flatMap((w) => warmSessionRows(w).map((r) => r.record)),
].map((r) => r.id);
assert(!used.some((id) => invalidated.includes(id)), 'invalidated records are excluded from every statistic and comparison');
assert(fs.readFileSync('scripts/run-benchmark.mjs', 'utf8').includes("ballastGib > 0 && process.platform === 'win32'"), 'the runner refuses VRAM ballasts on Windows, where WDDM demotes them');
console.log(`19. ${invalidated.length} invalidated records published but excluded from statistics; Windows ballast refused: PASS`);

fs.rmSync(tmp, { recursive: true, force: true });
console.log('\n--- ALL LOCAL AUDIO BENCHMARK TESTS PASSED (19/19) ---');
