// lib/benchmarks/adapters/audioCpp.ts
// audio.cpp (github.com/0xShug0/audio.cpp) adapter: runs audiocpp_cli as a monitored process.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { AudioWorkloadDefinition, BenchmarkModelConfig, BenchmarkRuntimeConfig, FailureEvidence, LicenseInfo } from '../types';
import type { GenerativeRuntimeAdapter, GenerationExecutionResult, RuntimeProbeResult } from './interface';
import { runMonitoredProcess } from '../telemetry';

export const AUDIO_CPP_LICENSE: LicenseInfo = {
  id: 'Apache-2.0',
  commercialUse: 'COMMERCIAL_OK',
  sourceUrl: 'https://github.com/0xShug0/audio.cpp/blob/main/LICENSE',
  verifiedAt: '2026-09-27',
  notes: 'Copyright 2026 ShugoAI LLC. Covers the audio.cpp engine only; each model has its own license.',
};

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

/** Builds the exact CLI arguments for an audio workload. Exported for tests. */
export function buildAudioCppArgs(
  workload: AudioWorkloadDefinition,
  options: { family: string; modelPath: string; backend: string; device?: number; outPath: string; loadOptions?: Record<string, string>; sessionOptions?: Record<string, string> }
): string[] {
  const s = workload.audioSettings;
  const args = [
    '--task', 'gen',
    '--family', options.family,
    '--model', options.modelPath,
    '--backend', options.backend,
    '--mode', 'offline',
    '--text', workload.prompt,
    '--duration-seconds', String(s.durationSec),
  ];
  if (options.device != null) args.push('--device', String(options.device));
  if (s.route) args.push('--task-route', s.route);
  if (s.language) args.push('--language', s.language);
  if (s.seed != null) args.push('--seed', String(s.seed));
  if (s.inferenceSteps != null) args.push('--num-inference-steps', String(s.inferenceSteps));
  if (s.guidanceScale != null) args.push('--guidance-scale', String(s.guidanceScale));
  if (s.lyrics != null) args.push('--request-option', `lyrics=${s.lyrics}`);
  for (const [key, value] of Object.entries(s.modelOptions ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    args.push('--request-option', `${key}=${value}`);
  }
  for (const [key, value] of Object.entries(options.loadOptions ?? {})) args.push('--load-option', `${key}=${value}`);
  for (const [key, value] of Object.entries(options.sessionOptions ?? {})) args.push('--session-option', `${key}=${value}`);
  args.push('--metrics', '--out', options.outPath);
  return args;
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

  async executeGeneration(model: BenchmarkModelConfig, workload: AudioWorkloadDefinition, outputDir: string): Promise<GenerationExecutionResult> {
    const versionText = execFileSync(this.cli, ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
    const info = parseAudioCppVersion(versionText);
    const manifest = this.installManifest();
    const runtime: BenchmarkRuntimeConfig = {
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
    };

    fs.mkdirSync(outputDir, { recursive: true });
    const outPath = path.join(outputDir, `output.${workload.audioSettings.outputFormat}`);
    const args = buildAudioCppArgs(workload, { ...this.opts, outPath });
    const run = await runMonitoredProcess(this.cli, args, { cwd: this.opts.binDir, gpuIndex: this.opts.device ?? 0, timeoutMs: this.opts.timeoutMs });
    const reported = parseAudioCppMetrics(run.stdout);
    const wroteOutput = fs.existsSync(outPath);

    let failure: FailureEvidence | null = null;
    if (run.spawnError) failure = { stage: 'preflight', type: 'SPAWN_FAILED', message: run.spawnError };
    else if (run.exitCode !== 0) {
      const tail = (run.stderr || run.stdout).trim().split(/\r?\n/).slice(-6).join(' | ');
      const stage = /load|gguf|model|weight/i.test(tail) && !/metrics\./.test(run.stdout) ? 'model_load' : 'execution';
      failure = { stage, type: run.signal ? `SIGNAL_${run.signal}` : `EXIT_${run.exitCode}`, message: tail || 'audiocpp_cli exited without output.' };
    } else if (!wroteOutput) failure = { stage: 'execution', type: 'NO_OUTPUT', message: `audiocpp_cli exited 0 but ${outPath} was not written.` };

    const sampleRate = Number(reported.sample_rate);
    const channels = Number(reported.channels);
    return {
      outputPath: wroteOutput ? outPath : null,
      runtime,
      failure,
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
        command: [this.cli, ...args],
        exitCode: run.exitCode,
        signal: run.signal,
        versionOutput: versionText.trim(),
        installManifest: manifest,
        runtimeReportedMetrics: reported,
        telemetrySamples: { gpu: run.gpuSamples, ram: run.ramSamples },
        stdoutTail: run.stdout.split(/\r?\n/).slice(-40).join('\n'),
        stderrTail: run.stderr.split(/\r?\n/).slice(-40).join('\n'),
      },
    };
  }
}
