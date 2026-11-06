// lib/benchmarks/adapters/audioCpp.ts
// audio.cpp (github.com/0xShug0/audio.cpp) adapter: runs audiocpp_cli as a monitored process,
// either once per run or as a warm session of repeated requests in one loaded model.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { AudioWorkloadDefinition, BenchmarkModelConfig, BenchmarkRuntimeConfig, FailureEvidence, LicenseInfo } from '../types';
import type { GenerativeRuntimeAdapter, GenerationContext, GenerationExecutionResult, GenerationSessionResult, RuntimeProbeResult } from './interface';
import { runMonitoredProcess, type MonitoredProcessResult } from '../telemetry';

export const AUDIO_CPP_LICENSE: LicenseInfo = {
  id: 'Apache-2.0',
  commercialUse: 'COMMERCIAL_OK',
  sourceUrl: 'https://github.com/0xShug0/audio.cpp/blob/main/LICENSE',
  verifiedAt: '2026-09-27',
  notes: 'Copyright 2026 ShugoAI LLC. Covers the audio.cpp engine only; each model has its own license.',
};

// audiocpp_cli silently ignores request keys it does not know (verified 2026-09-28: an unknown key
// ran with exit 0), so a misspelled setting would never be applied. Only keys read by the family's
// request parser are accepted. Source: src/models/ace_step/request_parser.cpp at commit ac16661d.
export const AUDIO_CPP_REQUEST_OPTIONS: Record<string, ReadonlySet<string>> = {
  ace_step: new Set([
    'audio_code_string', 'audio_codes', 'audio_cover_strength', 'bpm', 'cfg_interval_end', 'cfg_interval_start',
    'chunk_mask_mode', 'complete_track_classes', 'cover_noise_strength', 'dcw_enabled', 'dcw_high_scaler', 'dcw_mode',
    'dcw_scaler', 'dcw_wavelet', 'duration_seconds', 'flow_edit_morph', 'guidance_scale', 'infer_method', 'instruction',
    'keyscale', 'lm_cfg_scale', 'lm_repetition_penalty', 'lm_temperature', 'lm_top_k', 'lm_top_p', 'lyrics',
    'negative_prompt', 'noise_file', 'num_inference_steps', 'repaint_crossfade_frames', 'repaint_injection_ratio',
    'repaint_mode', 'repaint_strength', 'repainting_end', 'repainting_start', 'retake_seed', 'retake_variance',
    'rewrite_caption', 'route', 'sampler_mode', 'seed', 'shift', 'thinking', 'timesignature', 'timesteps', 'track_name',
    'use_adg', 'use_cot_caption', 'use_cot_language', 'use_cot_metas', 'velocity_ema_factor', 'velocity_norm_threshold',
  ]),
};

export class UnsupportedOptionError extends Error {}

export interface AudioCppVersionInfo {
  version: string;
  gitCommit: string | null;
  gitDate: string | null;
  backends: string[];
}

/** Parses `audiocpp_cli --version`. */
export function parseAudioCppVersion(text: string): AudioCppVersionInfo | null {
  const version = text.match(/^audio\.cpp\s+(\S+)/m)?.[1];
  if (!version) return null;
  const git = text.match(/^git:\s*(\S+)(?:\s+(\S+))?/m);
  const backends = text.match(/^backends:\s*(.+)$/m)?.[1].split(',').map((b) => b.trim()).filter(Boolean) ?? [];
  return { version, gitCommit: git?.[1] ?? null, gitDate: git?.[2] ?? null, backends };
}

/** Parses the `metrics.<key>=<value>` lines printed by `--metrics`. */
export function parseAudioCppMetrics(stdout: string): Record<string, string> {
  const metrics: Record<string, string> = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^metrics\.([\w.]+)=(.*)$/);
    if (m) metrics[m[1]] = m[2].trim();
  }
  return metrics;
}

/** Parses per-request `metrics[<id>].<key>=<value>` lines from a request-sequence session. */
export function parseAudioCppSessionMetrics(stdout: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^metrics\[([^\]]+)\]\.([\w.]+)=(.*)$/);
    if (m) (out[m[1]] ??= {})[m[2]] = m[3].trim();
  }
  return out;
}

/** All model request options for a workload, validated against the family's parser. */
export function audioCppRequestOptions(
  workload: AudioWorkloadDefinition,
  family: string,
  inputOptions: Record<string, string> = {}
): Record<string, string | number | boolean> {
  const s = workload.audioSettings;
  const options: Record<string, string | number | boolean> = {
    ...(s.lyrics != null ? { lyrics: s.lyrics } : {}),
    ...(s.modelOptions ?? {}),
    ...inputOptions,
  };
  const known = AUDIO_CPP_REQUEST_OPTIONS[family];
  if (!known) throw new UnsupportedOptionError(`No verified request-option list for audio.cpp family "${family}".`);
  const unknown = Object.keys(options).filter((k) => !known.has(k));
  if (unknown.length) throw new UnsupportedOptionError(`audio.cpp ${family} does not read request option(s): ${unknown.join(', ')}. They would be silently ignored.`);
  return options;
}

type AudioCppCliOptions = { family: string; modelPath: string; backend: string; device?: number; loadOptions?: Record<string, string>; sessionOptions?: Record<string, string>; inputOptions?: Record<string, string> };

function sharedArgs(options: AudioCppCliOptions): string[] {
  const args = ['--task', 'gen', '--family', options.family, '--model', options.modelPath, '--backend', options.backend, '--mode', 'offline'];
  if (options.device != null) args.push('--device', String(options.device));
  for (const [key, value] of Object.entries(options.loadOptions ?? {})) args.push('--load-option', `${key}=${value}`);
  for (const [key, value] of Object.entries(options.sessionOptions ?? {})) args.push('--session-option', `${key}=${value}`);
  return args;
}

/** Builds the exact CLI arguments for one audio generation. Exported for tests. */
export function buildAudioCppArgs(workload: AudioWorkloadDefinition, options: AudioCppCliOptions & { outPath: string }): string[] {
  const s = workload.audioSettings;
  const args = [...sharedArgs(options), '--text', workload.prompt, '--duration-seconds', String(s.durationSec)];
  if (s.route) args.push('--task-route', s.route);
  if (s.language) args.push('--language', s.language);
  if (s.seed != null) args.push('--seed', String(s.seed));
  if (s.inferenceSteps != null) args.push('--num-inference-steps', String(s.inferenceSteps));
  if (s.guidanceScale != null) args.push('--guidance-scale', String(s.guidanceScale));
  const requestOptions = audioCppRequestOptions(workload, options.family, options.inputOptions);
  for (const [key, value] of Object.entries(requestOptions).sort(([a], [b]) => a.localeCompare(b))) {
    args.push('--request-option', `${key}=${value}`);
  }
  args.push('--metrics', '--out', options.outPath);
  return args;
}

export function sessionRequestIds(workload: AudioWorkloadDefinition): { id: string; warmup: boolean }[] {
  const session = workload.session ?? { warmupIterations: 0, measuredIterations: 1 };
  return [
    ...Array.from({ length: session.warmupIterations }, (_, i) => ({ id: `warmup-${String(i + 1).padStart(2, '0')}`, warmup: true })),
    ...Array.from({ length: session.measuredIterations }, (_, i) => ({ id: `iter-${String(i + 1).padStart(2, '0')}`, warmup: false })),
  ];
}

/**
 * Builds a --request-sequence document: identical requests, one per session iteration.
 * audiocpp_cli maps only a fixed set of top-level item keys (app/cli/request.cpp at ac16661d); every
 * model request option must sit in the item's "options" object or it is silently dropped. All
 * options therefore go in "options" (string values, as with --request-option), none at top level.
 */
export function buildAudioCppRequestSequence(workload: AudioWorkloadDefinition, family: string, inputOptions: Record<string, string> = {}) {
  const s = workload.audioSettings;
  const options: Record<string, string> = {
    ...(s.route ? { route: s.route } : {}),
    duration_seconds: String(s.durationSec),
    ...(s.seed != null ? { seed: String(s.seed) } : {}),
    ...(s.inferenceSteps != null ? { num_inference_steps: String(s.inferenceSteps) } : {}),
    ...(s.guidanceScale != null ? { guidance_scale: String(s.guidanceScale) } : {}),
    ...Object.fromEntries(Object.entries(audioCppRequestOptions(workload, family, inputOptions)).map(([k, v]) => [k, String(v)])),
  };
  const base = { text: workload.prompt, ...(s.language ? { language: s.language } : {}), options };
  return { requests: sessionRequestIds(workload).map(({ id }) => ({ id, ...base })) };
}

export interface AudioCppAdapterOptions {
  binDir: string;                 // Folder containing audiocpp_cli(.exe)
  modelPath: string;              // Model package directory or GGUF path
  family: string;                 // audio.cpp model family, e.g. "ace_step"
  backend: 'cuda' | 'cpu' | 'vulkan';
  device?: number;
  loadOptions?: Record<string, string>;
  sessionOptions?: Record<string, string>;
  timeoutMs?: number;
}

const tail = (text: string, lines: number) => text.split(/\r?\n/).slice(-lines).join('\n');

export class AudioCppAdapter implements GenerativeRuntimeAdapter {
  name = 'audio_cpp';
  constructor(private readonly opts: AudioCppAdapterOptions) {}

  private get cli(): string {
    return path.join(this.opts.binDir, process.platform === 'win32' ? 'audiocpp_cli.exe' : 'audiocpp_cli');
  }

  /** Install provenance written when the release was downloaded and verified (optional). */
  installManifest(): Record<string, unknown> | null {
    const file = path.join(this.opts.binDir, 'neuraldrift-install.json');
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  }

  async probe(): Promise<RuntimeProbeResult> {
    try {
      const info = parseAudioCppVersion(execFileSync(this.cli, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 30000 }));
      if (!info) throw new Error('Unrecognized --version output.');
      const available = info.backends.includes(this.opts.backend);
      return {
        available,
        runtime: 'audio_cpp',
        runtimeVersion: info.version,
        backend: this.opts.backend,
        models: [],
        error: available ? undefined : `Backend "${this.opts.backend}" not compiled in (available: ${info.backends.join(', ')}).`,
      };
    } catch (err) {
      return { available: false, runtime: 'audio_cpp', runtimeVersion: 'unknown', backend: this.opts.backend, models: [], error: err instanceof Error ? err.message : String(err) };
    }
  }

  private runtimeConfig(model: BenchmarkModelConfig): { runtime: BenchmarkRuntimeConfig; versionText: string; manifest: Record<string, unknown> | null } {
    const versionText = execFileSync(this.cli, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
    const info = parseAudioCppVersion(versionText);
    const manifest = this.installManifest();
    return {
      versionText,
      manifest,
      runtime: {
        runtime: 'audio_cpp',
        runtimeVersion: info?.version ?? 'unknown',
        backend: this.opts.backend,
        backendVersion: typeof manifest?.cudaRuntime === 'string' ? `CUDA ${manifest.cudaRuntime} (bundled runtime)` : undefined,
        flags: {
          ...(info?.gitCommit ? { gitCommit: info.gitCommit } : {}),
          ...(this.opts.loadOptions ?? {}),
          ...(this.opts.sessionOptions ?? {}),
        },
        precision: model.quantization.toLowerCase(),
        attentionBackend: 'ggml',
        license: AUDIO_CPP_LICENSE,
      },
    };
  }

  private processFailure(run: MonitoredProcessResult, expectedOutputs: string[]): FailureEvidence | null {
    if (run.spawnError) return { stage: 'preflight', type: 'SPAWN_FAILED', message: run.spawnError };
    if (run.exitCode !== 0) {
      const last = tail((run.stderr || run.stdout).trim(), 6).replace(/\r?\n/g, ' | ');
      const stage = /load|gguf|model|weight/i.test(last) && !/metrics[.[]/.test(run.stdout) ? 'model_load' : 'execution';
      return { stage, type: run.signal ? `SIGNAL_${run.signal}` : `EXIT_${run.exitCode}`, message: last || 'audiocpp_cli exited without output.' };
    }
    const missing = expectedOutputs.filter((p) => !fs.existsSync(p));
    return missing.length ? { stage: 'execution', type: 'NO_OUTPUT', message: `audiocpp_cli exited 0 but did not write: ${missing.map((p) => path.basename(p)).join(', ')}` } : null;
  }

  async executeGeneration(model: BenchmarkModelConfig, workload: AudioWorkloadDefinition, outputDir: string, context: GenerationContext = {}): Promise<GenerationExecutionResult> {
    const { runtime, versionText, manifest } = this.runtimeConfig(model);
    fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, `output.${workload.audioSettings.outputFormat}`);
    let args: string[];
    try {
      args = buildAudioCppArgs(workload, { ...this.opts, inputOptions: context.inputOptions, outPath });
    } catch (err) {
      return preflightFailure(runtime, workload, err);
    }
    const run = await runMonitoredProcess(this.cli, args, { cwd: this.opts.binDir, gpuIndex: this.opts.device ?? 0, timeoutMs: this.opts.timeoutMs });
    const reported = parseAudioCppMetrics(run.stdout);
    const failure = this.processFailure(run, [outPath]);
    const sampleRate = Number(reported.sample_rate);
    const channels = Number(reported.channels);
    return {
      outputPath: fs.existsSync(outPath) ? outPath : null,
      runtime,
      failure,
      telemetry: run.telemetry,
      outputMetrics: {
        kind: 'audio',
        requestedDurationSec: workload.audioSettings.durationSec,
        outputDurationSec: null, // Filled from the decoded file by the runner
        generationTimeMs: run.spawnError ? null : Number(run.wallMs.toFixed(1)),
        realTimeFactor: null,
        sampleRateHz: Number.isFinite(sampleRate) ? sampleRate : null,
        channels: Number.isFinite(channels) ? channels : null,
        peakVramBytes: run.peakVramBytes,
        vramBaselineBytes: run.vramBaselineBytes,
        peakRamBytes: run.peakProcessTreeRamBytes,
        gpuUtilizationPct: run.peakGpuUtilizationPct,
        telemetryMethod: run.method,
      },
      rawTrace: {
        command: redactLongArgs([this.cli, ...args]),
        exitCode: run.exitCode,
        signal: run.signal,
        versionOutput: versionText.trim(),
        installManifest: manifest,
        runtimeReportedMetrics: reported,
        telemetrySamples: { gpu: run.gpuSamples, ram: run.ramSamples },
        stdoutTail: tail(run.stdout, 40),
        stderrTail: tail(run.stderr, 40),
      },
    };
  }

  async executeSession(model: BenchmarkModelConfig, workload: AudioWorkloadDefinition, outputDir: string, context: GenerationContext = {}): Promise<GenerationSessionResult> {
    const { runtime, versionText, manifest } = this.runtimeConfig(model);
    fs.mkdirSync(outputDir, { recursive: true });
    const ids = sessionRequestIds(workload);
    let sequence;
    try {
      sequence = buildAudioCppRequestSequence(workload, this.opts.family, context.inputOptions);
    } catch (err) {
      const pre = preflightFailure(runtime, workload, err);
      return { runtime, failure: pre.failure, telemetry: null, processWallMs: null, startupAndLoadMs: null, startupAndLoadBasis: 'measured', iterations: [], generationSource: '', rawTrace: pre.rawTrace };
    }
    const sequencePath = path.join(outputDir, 'request-sequence.json');
    fs.writeFileSync(sequencePath, JSON.stringify(sequence, null, 2));
    const args = [...sharedArgs(this.opts), '--request-sequence', sequencePath, '--out-dir', outputDir, '--metrics'];
    const run = await runMonitoredProcess(this.cli, args, { cwd: this.opts.binDir, gpuIndex: this.opts.device ?? 0, timeoutMs: this.opts.timeoutMs });
    const perRequest = parseAudioCppSessionMetrics(run.stdout);
    const ext = workload.audioSettings.outputFormat;
    // audiocpp_cli block-buffers stdout when piped, so line arrival times say nothing about when a
    // request started. Start-up and load is derived instead: process wall time minus request times.
    const requestTotal = ids.reduce((sum, { id }) => sum + (Number(perRequest[id]?.wall_ms) || 0), 0);
    const allReported = ids.every(({ id }) => Number.isFinite(Number(perRequest[id]?.wall_ms)));
    return {
      runtime,
      failure: this.processFailure(run, ids.map(({ id }) => path.join(outputDir, `${id}.${ext}`))),
      telemetry: run.telemetry,
      processWallMs: run.spawnError ? null : Number(run.wallMs.toFixed(1)),
      startupAndLoadMs: run.spawnError || !allReported ? null : Number((run.wallMs - requestTotal).toFixed(1)),
      startupAndLoadBasis: 'derived',
      generationSource: 'audio.cpp per-request metrics[<id>].wall_ms (runtime-reported, one loaded session). Start-up and load is derived: process wall time minus the sum of reported request times (includes process exit).',
      iterations: ids.map(({ id, warmup }, index) => {
        const outPath = path.join(outputDir, `${id}.${ext}`);
        const wall = Number(perRequest[id]?.wall_ms);
        return { id, index, warmup, generationMs: Number.isFinite(wall) ? wall : null, outputPath: fs.existsSync(outPath) ? outPath : null };
      }),
      rawTrace: {
        command: [this.cli, ...args],
        requestSequence: sequence,
        exitCode: run.exitCode,
        versionOutput: versionText.trim(),
        installManifest: manifest,
        runtimeReportedMetrics: perRequest,
        requestAnnouncements: run.stdoutLines.filter((l) => /^request_(index|id)=/.test(l.line.trim())),
        stdoutTail: tail(run.stdout, 60),
        stderrTail: tail(run.stderr, 60),
      },
    };
  }
}

/** Long option values (e.g. audio codes) are recorded by hash in the record inputs, not repeated in traces. */
function redactLongArgs(argv: string[]): string[] {
  return argv.map((a) => (a.length > 400 ? `${a.slice(0, 80)}…[${a.length} chars; see hashed workload input]` : a));
}

function preflightFailure(runtime: BenchmarkRuntimeConfig, workload: AudioWorkloadDefinition, err: unknown): GenerationExecutionResult {
  const message = err instanceof Error ? err.message : String(err);
  return {
    outputPath: null,
    runtime,
    failure: { stage: 'preflight', type: err instanceof UnsupportedOptionError ? 'UNSUPPORTED_OPTION' : 'PREFLIGHT_ERROR', message },
    telemetry: null,
    outputMetrics: { kind: 'audio', requestedDurationSec: workload.audioSettings.durationSec, outputDurationSec: null, generationTimeMs: null, realTimeFactor: null, sampleRateHz: null, channels: null, peakVramBytes: null, vramBaselineBytes: null, peakRamBytes: null, gpuUtilizationPct: null },
    rawTrace: { preflightError: message },
  };
}
