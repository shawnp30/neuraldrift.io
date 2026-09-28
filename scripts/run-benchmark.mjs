// scripts/run-benchmark.mjs
// NeuralDrift Local AI Benchmark Runner.
// Executes real workloads against local runtimes, captures hardware telemetry,
// objectively validates outputs, and records immutable benchmark evidence.
//
// Text:  node --require ./scripts/register-ts.cjs scripts/run-benchmark.mjs --workload ND-LLM-001 --model <id> [--runtime-version <v>]
// Audio: node --require ./scripts/register-ts.cjs scripts/run-benchmark.mjs --workload ND-AUDIO-MUSIC-001 --target <id> [--no-register]
//        Targets (machine-specific paths) live in benchmark-targets.local.json; see scripts/benchmark-targets.example.json.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { LMStudioAdapter } from '../lib/benchmarks/adapters/lmStudio.ts';
import { AudioCppAdapter } from '../lib/benchmarks/adapters/audioCpp.ts';
import { AceStepPythonAdapter } from '../lib/benchmarks/adapters/aceStepPython.ts';
import { WORKLOAD_SUITE, getWorkloadById } from '../lib/benchmarks/workloads.ts';
import { validateBenchmarkOutput } from '../lib/benchmarks/validators.ts';
import { calculateConfigFingerprint, generateBenchmarkRunId } from '../lib/benchmarks/fingerprint.ts';
import { detectEnvironment } from '../lib/benchmarks/environment.ts';
import { readGpuSnapshot } from '../lib/benchmarks/telemetry.ts';
import { assembleAudioRecord, assembleAudioSessionRecord, BENCHMARK_SUITE_VERSION } from '../lib/benchmarks/audioRecord.ts';
import { buildArtifactRef, hashFileCached, inspectAudioArtifact, verifyWorkloadInputs } from '../lib/benchmarks/artifacts.ts';
import { AUDIO_MODELS } from '../lib/audio/models.ts';

// 1. Parse CLI Arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}
const hasFlag = (flag) => args.includes(flag);

const repoRoot = process.cwd();
const workloadId = getArg('--workload', 'ND-LLM-001');
const workload = getWorkloadById(workloadId);
if (!workload) {
  console.error(`Error: Unknown workload "${workloadId}". Available: ${WORKLOAD_SUITE.map((w) => w.id).join(', ')}`);
  process.exit(1);
}

// 2. Hardware & Environment Telemetry Capture (from the machine, never assumed)
const env = detectEnvironment({ formFactor: getArg('--form-factor', undefined) });
console.log('=== NEURALDRIFT LOCAL AI BENCHMARK RUNNER ===');
console.log(`Workload: ${workload.id} v${workload.version} (${workload.name})`);
console.log(`GPU:      ${env.hardware.gpuName} (${env.hardware.gpuArch}, CC ${env.gpuComputeCapability}), driver ${env.software.driverVersion}, CUDA ${env.software.cudaVersion ?? 'unknown'}`);
console.log('---------------------------------------------');

function saveEvidence(record, trace, { register }) {
  // Unregistered runs (warm-ups, diagnostics) stay local; only registered evidence is published.
  const evidenceDir = register ? path.join('public', 'benchmark-evidence', record.id) : path.join('evidence-artifacts', record.id);
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'record.json'), JSON.stringify(record, null, 2) + '\n');
  fs.writeFileSync(path.join(evidenceDir, 'trace.json'), JSON.stringify(trace, null, 2) + '\n');
  if (!register) {
    console.log(`[Saved] Unregistered evidence kept locally in ${evidenceDir} (--no-register)`);
    return;
  }
  const recordsPath = path.join('data', 'benchmark-records.json');
  const records = fs.existsSync(recordsPath) ? JSON.parse(fs.readFileSync(recordsPath, 'utf8')) : [];
  records.push(record);
  fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2) + '\n');
  console.log(`[Saved] Benchmark evidence saved to ${record.rawEvidenceUrl}`);
}

if (workload.category === 'creator_audio') await runAudio();
else await runText();

// ---------------------------------------------------------------------------
async function runAudio() {
  const targetId = getArg('--target', null);
  const targetsPath = path.join(repoRoot, 'benchmark-targets.local.json');
  if (!targetId || !fs.existsSync(targetsPath)) {
    console.error('Audio workloads need --target <id> and benchmark-targets.local.json (see scripts/benchmark-targets.example.json).');
    process.exit(1);
  }
  const target = JSON.parse(fs.readFileSync(targetsPath, 'utf8'))[targetId];
  if (!target) {
    console.error(`Unknown target "${targetId}".`);
    process.exit(1);
  }
  const modelBase = AUDIO_MODELS[target.modelKey];
  if (!modelBase) {
    console.error(`Unknown modelKey "${target.modelKey}" in target ${targetId}.`);
    process.exit(1);
  }

  const adapter = target.runtime === 'audio_cpp'
    ? new AudioCppAdapter({ binDir: target.binDir, modelPath: target.modelPath, family: target.family, backend: target.backend, device: target.device, loadOptions: target.loadOptions, sessionOptions: target.sessionOptions, timeoutMs: 30 * 60 * 1000 })
    : target.runtime === 'pytorch'
      ? new AceStepPythonAdapter({ aceRoot: target.aceRoot, pythonExe: target.pythonExe, runnerScript: path.join(repoRoot, 'scripts', 'acestep_reference_runner.py'), ditModel: target.ditModel, lmModel: target.lmModel, lmBackend: target.lmBackend, timeoutMs: 30 * 60 * 1000 })
      : null;
  if (!adapter) {
    console.error(`Unsupported runtime "${target.runtime}" in target ${targetId}.`);
    process.exit(1);
  }

  const probe = await adapter.probe();
  console.log(`[Probe] ${probe.runtime} ${probe.runtimeVersion}: ${probe.available ? 'available' : `UNAVAILABLE (${probe.error})`}`);

  console.log(`[Hashing] ${target.modelFiles.length} model file(s)...`);
  const hashCache = path.join(repoRoot, 'tmp', 'benchmark-hash-cache.json');
  const files = [];
  for (const file of target.modelFiles) files.push(await hashFileCached(file, target.modelFilesRoot, hashCache));
  const model = { ...modelBase, files };
  const inputs = await verifyWorkloadInputs(workload.inputs, repoRoot);

  const runId = generateBenchmarkRunId(workload.id, `${model.modelId}-${target.runtime}`, env.hardware.id.replace(/^local-/, ''));
  const artifactDir = path.join(repoRoot, 'evidence-artifacts', runId);
  // Inputs that deliver text (e.g. audio codes) are read only after their content hash was verified.
  const inputOptions = Object.fromEntries(
    inputs.filter((i) => i.optionKey).map((i) => [i.optionKey, fs.readFileSync(path.join(repoRoot, i.path), 'utf8').trim()])
  );
  const context = { inputOptions };

  // Optional VRAM ballast: a separate process holds VRAM for the whole run (constrained, not a smaller GPU).
  const ballastGib = Number(getArg('--vram-ballast-gib', '0'));
  let ballast = null;
  let executionConditions = null;
  if (ballastGib > 0 && process.platform === 'win32') {
    // Measured 2026-09-28: Windows (WDDM) demoted an 11.29 GiB ballast to 3.15 GiB of dedicated VRAM
    // while a benchmark ran, so a ballast cannot constrain VRAM here. Refuse rather than record a false condition.
    console.error('--vram-ballast-gib is not valid on Windows: WDDM demotes the ballast allocation to system memory under pressure, so the VRAM constraint would not hold.');
    process.exit(1);
  }
  if (ballastGib > 0) {
    ballast = await startVramBallast(ballastGib, getArg('--ballast-python', target.ballastPython));
    const free = env.hardware.vramBytes - (readGpuSnapshot()?.memoryUsedBytes ?? env.hardware.vramBytes);
    executionConditions = {
      kind: 'constrained_vram',
      vramBallastBytes: ballast.bytes,
      freeVramBeforeRunBytes: free,
      method: `A separate process (scripts/vram_ballast.py, torch CUDA allocation) held ${ballastGib} GiB of VRAM for the whole run. This constrains available VRAM on the same GPU; it does not reproduce a GPU with less memory (bandwidth, compute and driver behaviour are unchanged).`,
    };
    console.log(`[Ballast] holding ${(ballast.bytes / 2 ** 30).toFixed(2)} GiB; free VRAM before run ${(free / 2 ** 30).toFixed(2)} GiB`);
  }

  const variant = target.variant ?? (ballastGib > 0 ? `vram-ballast-${ballastGib}gib` : undefined);
  const common = { runId, workload, model, hardware: env.hardware, inputs, variant, executionConditions, limitations: target.limitations, notes: target.notes };
  const unavailable = { stage: 'preflight', type: 'RUNTIME_UNAVAILABLE', message: probe.error ?? 'Runtime probe failed.' };
  console.log(`[Executing] ${workload.id} via ${target.runtime} (target ${targetId}${variant ? `, variant ${variant}` : ''}) ...`);
  const timestamp = new Date().toISOString();

  let record;
  let trace;
  try {
    if (workload.session) {
      if (!adapter.executeSession) throw new Error(`${target.runtime} adapter has no session mode.`);
      const session = probe.available
        ? await adapter.executeSession(model, workload, artifactDir, context)
        : { runtime: { runtime: target.runtime, runtimeVersion: probe.runtimeVersion, backend: 'cuda' }, failure: unavailable, telemetry: null, processWallMs: null, startupAndLoadMs: null, startupAndLoadBasis: 'measured', generationSource: '', iterations: [], rawTrace: { probe } };
      const outputs = new Map();
      for (const it of session.iterations) {
        if (!it.outputPath) continue;
        outputs.set(it.id, { observation: await inspectAudioArtifact(it.outputPath), artifact: await buildArtifactRef(it.outputPath, repoRoot, workload.audioSettings.outputFormat) });
      }
      const python = session.rawTrace?.runnerResult?.python;
      record = assembleAudioSessionRecord({ ...common, timestamp, software: { ...env.software, ...(python ? { pythonVersion: python } : {}) }, session, outputs });
      trace = session.rawTrace;
    } else {
      const execution = probe.available
        ? await adapter.executeGeneration(model, workload, artifactDir, context)
        : {
            outputPath: null,
            runtime: { runtime: target.runtime, runtimeVersion: probe.runtimeVersion, backend: 'cuda' },
            failure: unavailable,
            telemetry: null,
            outputMetrics: { kind: 'audio', requestedDurationSec: workload.audioSettings.durationSec, outputDurationSec: null, generationTimeMs: null, realTimeFactor: null, sampleRateHz: null, channels: null, peakVramBytes: null, vramBaselineBytes: null, peakRamBytes: null, gpuUtilizationPct: null },
            rawTrace: { probe },
          };
      const observation = execution.outputPath ? await inspectAudioArtifact(execution.outputPath) : undefined;
      const artifact = execution.outputPath ? await buildArtifactRef(execution.outputPath, repoRoot, workload.audioSettings.outputFormat) : null;
      const python = execution.rawTrace?.runnerResult?.python;
      record = assembleAudioRecord({ ...common, timestamp, software: { ...env.software, ...(python ? { pythonVersion: python } : {}) }, execution, observation, artifact });
      trace = execution.rawTrace;
    }
  } finally {
    ballast?.stop();
  }

  const m = record.outputMetrics;
  const t = record.telemetry;
  console.log(`[Result] ${record.outcome} · validator ${record.validation.validator}: ${record.validation.details}`);
  if (record.failure) console.log(`[Failure] ${record.failure.stage}/${record.failure.type}: ${record.failure.message}`);
  console.log(`[Metrics] gen ${m.generationTimeMs} ms · output ${m.outputDurationSec} s · RTF ${m.realTimeFactor} · device VRAM peak ${m.peakVramBytes} B (baseline ${m.vramBaselineBytes}) · process VRAM peak ${t?.processVramPeakBytes ?? 'n/a'} B · shared GPU mem peak ${t?.processSharedGpuMemoryPeakBytes ?? 'n/a'} B · RAM ${m.peakRamBytes} B · GPU ${m.gpuUtilizationPct}% · ${t?.gpuPowerPeakW ?? '?'} W · ${t?.gpuTemperaturePeakC ?? '?'} °C`);
  if (record.sessionMetrics) {
    const s = record.sessionMetrics;
    console.log(`[Session] start-up+load ${s.startupAndLoadMs} ms · per-iteration ms: ${s.iterations.map((i) => `${i.warmup ? 'w' : ''}${i.generationMs}`).join(', ')} · distinct measured outputs ${s.distinctMeasuredOutputs}/${s.measuredIterations}`);
    console.log(`[Session] generation ${JSON.stringify(s.generationMs)}`);
  }
  console.log(`[Fingerprint] ${record.configFingerprint}`);
  for (const a of record.artifacts ?? []) console.log(`[Artifact] ${a.path} sha256=${a.sha256.slice(0, 16)}… (${a.bytes} bytes, local only)`);
  saveEvidence(record, trace, { register: !hasFlag('--no-register') });
  console.log('=== BENCHMARK EXECUTION COMPLETE ===\n');
}

async function startVramBallast(gib, pythonExe) {
  if (!pythonExe) throw new Error('--vram-ballast-gib needs --ballast-python or a target "ballastPython" interpreter with CUDA torch.');
  const child = spawn(pythonExe, [path.join(repoRoot, 'scripts', 'vram_ballast.py'), String(gib)], { windowsHide: true });
  const bytes = await new Promise((resolve, reject) => {
    let out = '';
    child.stdout.setEncoding('utf8').on('data', (d) => {
      out += d;
      const m = out.match(/READY (\d+)/);
      if (m) resolve(Number(m[1]));
    });
    child.on('exit', (code) => reject(new Error(`VRAM ballast exited (${code}) before allocating: ${out}`)));
  });
  await new Promise((r) => setTimeout(r, 2000)); // Let the allocation settle before the baseline sample
  return { bytes, stop: () => child.kill() };
}

// ---------------------------------------------------------------------------
async function runText() {
  const modelId = getArg('--model', 'qwen2.5.1-coder-7b-instruct');
  const endpoint = getArg('--endpoint', 'http://127.0.0.1:1234');

  const adapter = new LMStudioAdapter();
  const probe = await adapter.probe(endpoint);
  if (!probe.available) {
    console.error(`[Error] Runtime probe failed for lm_studio at ${endpoint}: ${probe.error}`);
    process.exit(1);
  }
  console.log(`[Connected] lm_studio is available with ${probe.models.length} installed models.`);

  const modelConfig = {
    provider: getArg('--provider', 'Unknown'),
    modelId,
    displayName: getArg('--display-name', modelId),
    parameterSize: getArg('--parameter-size', 'Unknown'),
    architecture: getArg('--architecture', 'Unknown'),
    quantization: getArg('--quantization', 'Unknown'),
  };
  const runtimeConfig = {
    runtime: 'lm_studio',
    runtimeVersion: getArg('--runtime-version', probe.runtimeVersion),
    backend: 'cuda',
    backendVersion: env.software.cudaVersion ? `CUDA ${env.software.cudaVersion}` : undefined,
    endpoint,
  };

  console.log(`[Executing] Running ${workload.paradigm.toUpperCase()} benchmark...`);
  const runId = generateBenchmarkRunId(workload.id, modelId, env.hardware.id.replace(/^local-/, ''));
  let rawOutput = '';
  let rawInferenceMetrics = null;
  let workloadMetrics = null;
  let rawTrace = null;
  let extraContext = {};
  // Device-wide VRAM in use after the run (other processes included); null when unavailable.
  const vramInUse = () => readGpuSnapshot()?.memoryUsedBytes ?? null;

  if (workload.paradigm === 'raw_inference') {
    const result = await adapter.executeRawInference(endpoint, modelConfig, workload);
    rawOutput = result.output;
    rawInferenceMetrics = { ...result.metrics, peakVramBytes: vramInUse() };
    rawTrace = result.rawResponse;
  } else {
    const result = await adapter.executeWorkload(endpoint, modelConfig, workload);
    rawOutput = result.finalOutput;
    workloadMetrics = { ...result.metrics, peakVramBytes: vramInUse() };
    rawTrace = result.rawTrace;
    extraContext = { toolCalls: result.toolCallsExecuted };
  }

  const validation = validateBenchmarkOutput(workload, rawOutput, extraContext);
  const outcome = validation.passed ? 'PASS' : 'FAIL';
  console.log(`[Result] Outcome: ${outcome} (Validator: ${validation.validator})`);

  const record = {
    id: runId,
    workloadId: workload.id,
    workloadVersion: workload.version,
    paradigm: workload.paradigm,
    category: workload.category,
    timestamp: new Date().toISOString(),
    benchmarkVersion: BENCHMARK_SUITE_VERSION,
    evidenceLevel: 'neuraldrift_benchmarked',
    outcome,
    model: modelConfig,
    runtime: runtimeConfig,
    hardware: env.hardware,
    software: env.software,
    configFingerprint: '',
    rawInferenceMetrics,
    workloadMetrics,
    failure: validation.passed ? null : { stage: 'validation', type: 'OUTPUT_INVALID', message: validation.details ?? 'Validation failed.' },
    validation,
    rawEvidenceUrl: `/benchmark-evidence/${runId}/record.json`,
    logsSummary: `Executed ${workload.id} on ${env.hardware.gpuName} via lm_studio.`,
  };
  record.configFingerprint = calculateConfigFingerprint(record);
  console.log(`[Fingerprint] ${record.configFingerprint}`);
  saveEvidence(record, rawTrace, { register: !hasFlag('--no-register') });
  console.log('=== BENCHMARK EXECUTION COMPLETE ===\n');
}

