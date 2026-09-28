// lib/benchmarks/adapters/aceStepPython.ts
// Upstream ACE-Step 1.5 Python implementation, driven through scripts/acestep_reference_runner.py
// inside an existing ACE-Step installation's own virtual environment (the install is only read).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { AudioWorkloadDefinition, BenchmarkModelConfig, BenchmarkRuntimeConfig, FailureEvidence, FailureStage, LicenseInfo } from '../types';
import type { GenerativeRuntimeAdapter, GenerationExecutionResult, RuntimeProbeResult } from './interface';
import { runMonitoredProcess } from '../telemetry';

export const ACE_STEP_CODE_LICENSE: LicenseInfo = {
  id: 'MIT',
  commercialUse: 'COMMERCIAL_OK',
  sourceUrl: 'https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE',
  verifiedAt: '2026-09-27',
  notes: 'License of the ACE-Step 1.5 Python code used as the runtime. The model weights carry their own license.',
};

export interface AceStepPythonAdapterOptions {
  aceRoot: string;                // ACE-Step-1.5 checkout
  pythonExe: string;              // That checkout's virtual-environment interpreter
  runnerScript: string;           // scripts/acestep_reference_runner.py
  ditModel: string;               // e.g. "acestep-v15-turbo"
  lmModel: string;                // e.g. "acestep-5Hz-lm-1.7B"
  lmBackend: 'vllm' | 'pt';       // ACE-Step's own CUDA default is "vllm" (bundled nano-vllm)
  timeoutMs?: number;
}

interface RunnerResult {
  stage: string;
  success: boolean;
  python?: string;
  torch?: string;
  torchCuda?: string;
  aceStepVersion?: string;
  attention?: string | null;
  ditDtype?: string;
  lmBackend?: string;
  loadMs?: number;
  generateMs?: number;
  outputPath?: string;
  errorType?: string;
  error?: string;
  [key: string]: unknown;
}

export function parseRunnerResult(stdout: string): RunnerResult | null {
  const line = stdout.split(/\r?\n/).reverse().find((l) => l.startsWith('ND_RESULT_JSON '));
  return line ? (JSON.parse(line.slice('ND_RESULT_JSON '.length)) as RunnerResult) : null;
}

/** Maps the runner's reported stage onto a benchmark failure stage. */
export function failureStageFromRunner(stage: string): FailureStage {
  return stage === 'model_load' ? 'model_load' : stage === 'execution' ? 'execution' : 'preflight';
}

export class AceStepPythonAdapter implements GenerativeRuntimeAdapter {
  name = 'pytorch';
  constructor(private readonly opts: AceStepPythonAdapterOptions) {}

  gitRevision(): string | null {
    try {
      return execFileSync('git', ['-C', this.opts.aceRoot, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8', windowsHide: true, timeout: 15000 }).trim();
    } catch {
      return null;
    }
  }

  async probe(): Promise<RuntimeProbeResult> {
    const base = { runtime: 'pytorch', backend: 'cuda', models: [] };
    if (!fs.existsSync(this.opts.pythonExe)) return { ...base, available: false, runtimeVersion: 'unknown', error: `Interpreter not found: ${this.opts.pythonExe}` };
    try {
      const out = execFileSync(this.opts.pythonExe, ['-c', 'import importlib.metadata as m, torch; print(m.version("ace-step"), torch.__version__, torch.cuda.is_available())'], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
      const [version, , cuda] = out.trim().split(/\s+/);
      return { ...base, available: cuda === 'True', runtimeVersion: `ace-step ${version}`, error: cuda === 'True' ? undefined : 'torch.cuda.is_available() is False' };
    } catch (err) {
      return { ...base, available: false, runtimeVersion: 'unknown', error: err instanceof Error ? err.message : String(err) };
    }
  }

  async executeGeneration(model: BenchmarkModelConfig, workload: AudioWorkloadDefinition, outputDir: string): Promise<GenerationExecutionResult> {
    fs.mkdirSync(outputDir, { recursive: true });
    const s = workload.audioSettings;
    const request = {
      prompt: workload.prompt,
      ditModel: this.opts.ditModel,
      lmModel: this.opts.lmModel,
      lmBackend: this.opts.lmBackend,
      useFlashAttention: false,
      outputDir,
      settings: {
        route: s.route,
        lyrics: s.lyrics,
        language: s.language,
        durationSec: s.durationSec,
        seed: s.seed,
        inferenceSteps: s.inferenceSteps,
        guidanceScale: s.guidanceScale,
        ...s.modelOptions,
      },
    };
    const requestPath = path.join(outputDir, 'request.json');
    fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));

    const args = [this.opts.runnerScript, '--ace-root', this.opts.aceRoot, '--request', requestPath];
    const run = await runMonitoredProcess(this.opts.pythonExe, args, {
      cwd: this.opts.aceRoot,
      env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' },
      timeoutMs: this.opts.timeoutMs,
    });
    const reported = parseRunnerResult(run.stdout);
    const rawOutput = reported?.outputPath ? path.resolve(outputDir, reported.outputPath) : null;
    const outputPath = rawOutput && fs.existsSync(rawOutput) ? rawOutput : null;

    let failure: FailureEvidence | null = null;
    if (run.spawnError) failure = { stage: 'preflight', type: 'SPAWN_FAILED', message: run.spawnError };
    else if (!reported) failure = { stage: 'execution', type: run.exitCode === 0 ? 'NO_RESULT' : `EXIT_${run.exitCode}`, message: run.stderr.trim().split(/\r?\n/).slice(-6).join(' | ') || 'Runner produced no result line.' };
    else if (!reported.success) failure = { stage: failureStageFromRunner(reported.stage), type: reported.errorType ?? 'ERROR', message: reported.error ?? 'Unknown error' };
    else if (!outputPath) failure = { stage: 'execution', type: 'NO_OUTPUT', message: `Runner reported ${reported.outputPath ?? 'no path'} but no file exists.` };

    const runtime: BenchmarkRuntimeConfig = {
      runtime: 'pytorch',
      runtimeVersion: reported?.aceStepVersion ? `ace-step ${reported.aceStepVersion}` : 'unknown',
      backend: 'cuda',
      backendVersion: reported?.torch ? `torch ${reported.torch} (CUDA ${reported.torchCuda ?? 'unknown'})` : undefined,
      flags: {
        ...(this.gitRevision() ? { gitCommit: this.gitRevision() } : {}),
        ditModel: this.opts.ditModel,
        lmModel: this.opts.lmModel,
        lmBackend: reported?.lmBackend ?? this.opts.lmBackend,
      },
      precision: model.quantization.toLowerCase(),
      ...(reported?.attention ? { attentionBackend: reported.attention } : {}),
      license: ACE_STEP_CODE_LICENSE,
    };

    return {
      outputPath,
      runtime,
      failure,
      outputMetrics: {
        kind: 'audio',
        requestedDurationSec: s.durationSec,
        outputDurationSec: null,
        generationTimeMs: run.spawnError ? null : Number(run.wallMs.toFixed(1)),
        realTimeFactor: null,
        sampleRateHz: null, // Taken from the decoded file by the runner
        channels: null,
        peakVramBytes: run.peakVramBytes,
        vramBaselineBytes: run.vramBaselineBytes,
        peakRamBytes: run.peakProcessTreeRamBytes,
        gpuUtilizationPct: run.peakGpuUtilizationPct,
        telemetryMethod: run.method,
      },
      rawTrace: {
        command: [this.opts.pythonExe, ...args],
        request,
        exitCode: run.exitCode,
        runnerResult: reported,
        telemetrySamples: { gpu: run.gpuSamples, ram: run.ramSamples },
        stderrTail: run.stderr.split(/\r?\n/).slice(-200).join('\n'),
      },
    };
  }
}
