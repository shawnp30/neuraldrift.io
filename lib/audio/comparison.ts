// lib/audio/comparison.ts
// Side-by-side statistics for implementations of the same audio workload. Reports medians and ranges
// per metric and every known non-equivalence. Deliberately produces no overall score or winner.

import type { AudioOutputMetrics, BenchmarkRecord } from '@/lib/benchmarks/types';
import { checkComparability } from '@/lib/benchmarks/fingerprint';
import { getAudioBenchmarks } from './catalog';

export interface MetricStat {
  median: number;
  min: number;
  max: number;
  n: number;
}

export function stat(values: (number | null | undefined)[]): MetricStat | null {
  const v = values.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return { median: v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2, min: v[0], max: v[v.length - 1], n: v.length };
}

export interface RuntimeRunGroup {
  key: string;
  runtime: string;
  runtimeVersion: string;
  runs: BenchmarkRecord[];
  passCount: number;
  distinctArtifactHashes: number;
  stats: {
    generationTimeMs: MetricStat | null;
    realTimeFactor: MetricStat | null;
    outputDurationSec: MetricStat | null;
    peakVramBytes: MetricStat | null;
    vramAboveBaselineBytes: MetricStat | null;
    peakRamBytes: MetricStat | null;
    gpuUtilizationPct: MetricStat | null;
  };
}

const audioMetrics = (r: BenchmarkRecord): AudioOutputMetrics | null => (r.outputMetrics?.kind === 'audio' ? r.outputMetrics : null);

export function groupAudioRuns(workloadId: string, records: BenchmarkRecord[] = getAudioBenchmarks()): RuntimeRunGroup[] {
  const groups = new Map<string, BenchmarkRecord[]>();
  for (const r of records.filter((x) => x.workloadId === workloadId && audioMetrics(x))) {
    const key = `${r.runtime.runtime}@${r.runtime.runtimeVersion}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()]
    .map(([key, runs]) => {
      const m = runs.map((r) => audioMetrics(r)!);
      return {
        key,
        runtime: runs[0].runtime.runtime,
        runtimeVersion: runs[0].runtime.runtimeVersion,
        runs: [...runs].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        passCount: runs.filter((r) => r.outcome === 'PASS').length,
        distinctArtifactHashes: new Set(runs.flatMap((r) => r.artifacts?.map((a) => a.sha256) ?? [])).size,
        stats: {
          generationTimeMs: stat(m.map((x) => x.generationTimeMs)),
          realTimeFactor: stat(m.map((x) => x.realTimeFactor)),
          outputDurationSec: stat(m.map((x) => x.outputDurationSec)),
          peakVramBytes: stat(m.map((x) => x.peakVramBytes)),
          vramAboveBaselineBytes: stat(m.map((x) => (x.peakVramBytes != null && x.vramBaselineBytes != null ? x.peakVramBytes - x.vramBaselineBytes : null))),
          peakRamBytes: stat(m.map((x) => x.peakRamBytes)),
          gpuUtilizationPct: stat(m.map((x) => x.gpuUtilizationPct)),
        },
      };
    })
    .sort((a, b) => a.runtime.localeCompare(b.runtime));
}

/** Comparability of the two implementations, judged on their first runs with the standard engine. */
export function implementationComparability(groups: RuntimeRunGroup[]) {
  return groups.length === 2 ? checkComparability(groups[0].runs[0], groups[1].runs[0]) : null;
}

export const RUNTIME_LABEL: Record<string, string> = {
  audio_cpp: 'audio.cpp (C++ / ggml)',
  pytorch: 'ACE-Step Python (PyTorch reference)',
};

// ND-AUDIO-MUSIC-001 A/B, RTX 5080, 2026-09-28: facts established from the run traces and install
// inspection. Every item is a documented difference, not a judgment of which implementation is better.
export const ACE_STEP_AB = {
  workloadId: 'ND-AUDIO-MUSIC-001',
  protocol:
    'Each implementation ran one warm-up (retained locally, not registered) followed by three measured runs, each in a fresh process with model loading included. Both used the same prompt, lyrics, seed, duration, steps, guidance, shift, sampler and planner settings, all set explicitly by the workload.',
  nonEquivalences: [
    'Weights: audio.cpp loads the converted BF16 GGUF (DiT, planner LM, text encoder and VAE in one 10.09 GB file); the Python reference loads the original safetensors checkpoints. Content hashes differ by construction.',
    'Planner LM backend: audio.cpp runs the 1.7B planner in ggml. ACE-Step requested its CUDA default (nano-vllm) and fell back to PyTorch on Windows: "vLLM backend is unavailable on Windows because Triton is not installed or is incompatible."',
    'Attention: ggml kernels vs PyTorch SDPA (flash_attn is not installed in the ACE-Step environment).',
    'Random number generation differs between implementations, so the same seed does not produce the same audio across runtimes.',
    'Output encoding: audio.cpp writes 16-bit PCM WAV (5.76 MB for 30 s); ACE-Step writes 32-bit float WAV (11.52 MB).',
    'DCW: disabled by default in audio.cpp; enabled by default in ACE-Step but a no-op here because pytorch_wavelets is not installed. Effectively off in both.',
    'Process start-up: the Python wall time includes interpreter and library import (about 6 s beyond the runner-reported load and generate phases).',
  ],
  observations: [
    'audio.cpp produced bit-identical WAV files in all four runs (warm-up included) at seed 42.',
    'The Python reference produced a different WAV in each of its four runs at seed 42; across the three measured runs its generation phase varied from 8.6 s to 25.1 s while model loading stayed at 18.1–18.9 s, consistent with different planner sampling paths.',
    'Device-wide VRAM peaked near the card\'s capacity for both implementations regardless of the baseline, so the peak is not a minimum requirement. PyTorch itself reported 10.64 GB peak allocated and 14.83 GB peak reserved in every run.',
    'One audio.cpp run took 30.9 s against 13.5 s for the other two; no cause was identified and the run is kept.',
  ],
  installation: {
    audio_cpp: 'Two release archives (272 MB binaries + 575 MB CUDA 13.3 runtime; 1.1 GB extracted) and one 10.09 GB GGUF. No Python. Extracts a 61 MB sidecar cache to %TEMP% on first load.',
    pytorch: 'Git checkout plus a uv-managed Python 3.12 virtual environment (6.3 GB, torch 2.7.1+cu128) and about 9.4 GiB of safetensors checkpoints for this configuration.',
  } as Record<string, string>,
};

/** Known limitations that apply to a specific record, from the record itself and the A/B analysis above. */
export function knownLimitationsFor(record: BenchmarkRecord): string[] {
  const out = [...(record.limitations ?? [])];
  const m = audioMetrics(record);
  if (m) {
    out.push('VRAM figures are device-wide (other processes included); the baseline before the run is shown for context.');
    out.push('A single fixed prompt and seed; this is a performance and validity benchmark, not a listening or quality evaluation.');
  }
  if (record.workloadId === ACE_STEP_AB.workloadId && record.runtime.runtime === 'pytorch') {
    out.push('Planner LM ran on the PyTorch backend: nano-vllm is unavailable on Windows without Triton (ACE-Step\'s own fallback).');
    out.push('Fixed seed did not reproduce identical audio across runs in this configuration.');
  }
  if (record.workloadId === ACE_STEP_AB.workloadId && record.runtime.runtime === 'audio_cpp') {
    out.push('audio.cpp VRAM use appears to expand into available memory; the device-wide peak is not a minimum requirement.');
  }
  if (record.artifacts?.some((a) => a.storage === 'local_only')) {
    out.push('The generated audio is retained on the NeuralDrift testbench and not published; its SHA-256 identifies it exactly.');
  }
  return out;
}
