// lib/audio/comparison.ts
// Side-by-side statistics for implementations of the same audio workload. Reports medians and ranges
// per metric and every known non-equivalence. Deliberately produces no overall score or winner.

import type { AudioOutputMetrics, BenchmarkRecord } from '@/lib/benchmarks/types';
import { checkComparability } from '@/lib/benchmarks/fingerprint';
import { effectiveValue, isInvalidated } from '@/lib/benchmarks/errata';
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

/** Baseline configuration: no named variant and no deliberately constrained conditions. */
export const isBaselineRun = (r: BenchmarkRecord) => !r.variant && !r.executionConditions && !isInvalidated(r.id);

export function groupAudioRuns(workloadId: string, records: BenchmarkRecord[] = getAudioBenchmarks()): RuntimeRunGroup[] {
  const groups = new Map<string, BenchmarkRecord[]>();
  for (const r of records.filter((x) => x.workloadId === workloadId && audioMetrics(x) && isBaselineRun(x))) {
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
    'Each implementation ran one warm-up (retained locally, not registered) followed by measured runs, each in a fresh process with model loading included; the number of runs per implementation is shown in the table, and every registered run is included. Both used the same prompt, lyrics, seed, duration, steps, guidance, shift, sampler and planner settings, all set explicitly by the workload.',
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
    'One audio.cpp run took 30.9 s against 13.5 s for the other two. It predates process-level telemetry; later runs show slow cold runs coinciding with VRAM spilling into shared system memory (see Evidence Hardening). The run is kept.',
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
    out.push('Device-wide VRAM peaks are not minimum requirements; see the process-level VRAM figures where recorded.');
  }
  if (record.artifacts?.some((a) => a.storage === 'local_only')) {
    out.push('The generated audio is retained on the NeuralDrift testbench and not published; its SHA-256 identifies it exactly.');
  }
  return out;
}

/** One row per configuration (runtime, variant, constraint) for runs outside the baseline A/B. */
export interface ConfigurationRow {
  label: string;
  runtime: string;
  variant: string | null;
  constrainedVramBallastBytes: number | null;
  freeVramBeforeRunBytes: number | null;
  runs: BenchmarkRecord[];
  passCount: number;
}

export function configurationRows(workloadId: string, records: BenchmarkRecord[] = getAudioBenchmarks()): ConfigurationRow[] {
  const rows = new Map<string, BenchmarkRecord[]>();
  for (const r of records.filter((x) => x.workloadId === workloadId && !isInvalidated(x.id))) rows.set(r.configFingerprint, [...(rows.get(r.configFingerprint) ?? []), r]);
  return [...rows.values()]
    .map((runs) => {
      const r = runs[0];
      const ballast = r.executionConditions?.vramBallastBytes ?? null;
      return {
        label: [RUNTIME_LABEL[r.runtime.runtime] ?? r.runtime.runtime, r.variant ?? 'baseline', ballast ? `${(ballast / 2 ** 30).toFixed(0)} GiB ballast` : null].filter(Boolean).join(' · '),
        runtime: r.runtime.runtime,
        variant: r.variant ?? null,
        constrainedVramBallastBytes: ballast,
        freeVramBeforeRunBytes: r.executionConditions?.freeVramBeforeRunBytes ?? null,
        runs: [...runs].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        passCount: runs.filter((x) => x.outcome === 'PASS').length,
      };
    })
    .sort((a, b) => a.runtime.localeCompare(b.runtime) || (a.constrainedVramBallastBytes ?? 0) - (b.constrainedVramBallastBytes ?? 0) || (a.variant ?? '').localeCompare(b.variant ?? ''));
}

/** Warm-session records (one record = one session) with the figures the Lab compares. */
export interface WarmSessionRow {
  record: BenchmarkRecord;
  label: string;
  startupAndLoadMs: number | null;
  startupCorrected: boolean;
}

export function warmSessionRows(workloadId = 'ND-AUDIO-MUSIC-002', records: BenchmarkRecord[] = getAudioBenchmarks()): WarmSessionRow[] {
  return records
    .filter((r) => r.workloadId === workloadId && r.sessionMetrics && !isInvalidated(r.id))
    .map((r) => {
      const startup = effectiveValue<number | null>(r, 'sessionMetrics.startupAndLoadMs');
      return {
        record: r,
        label: `${RUNTIME_LABEL[r.runtime.runtime] ?? r.runtime.runtime} · ${r.variant ?? 'baseline'}`,
        startupAndLoadMs: startup.value,
        startupCorrected: Boolean(startup.erratum),
      };
    })
    .sort((a, b) => a.record.timestamp.localeCompare(b.record.timestamp));
}

// Findings from the hardening experiments, each traceable to registered records shown on /lab/audio.
export const HARDENING_FINDINGS: string[] = [
  'Warm sessions (ND-AUDIO-MUSIC-002, planner included): audio.cpp generated each 30 s clip in a median 2.13 s (CV 0.6%, default settings) and 2.18 s with mem_saver; the ACE-Step Python reference took 4.73 s (CV 5.2%). Start-up plus model loading took about 10.1 s for audio.cpp (derived) and 41.8 s for the Python reference (measured).',
  'With identical, content-hashed audio codes and the planner bypassed (ND-AUDIO-MUSIC-003), the DiT + VAE path took a median 0.98 s in audio.cpp and 1.08 s in the Python reference. The two implementations produced the same music from the same codes (waveform correlation 0.70, loudness-envelope correlation 0.95); the remaining difference is expected because their diffusion noise comes from different random number generators.',
  'audio.cpp reproduced identical audio at a fixed seed in every run. The Python reference produced different music on every planner run (sample correlation 0.0–0.33 between outputs) because its planner samples different audio codes each time; with fixed codes its audio was bit-identical, and the files differed only in a timestamp stored in the WAV PEAK chunk.',
  'ace_step.mem_saver lowered peak process VRAM (cold runs 12.22 → 10.45 GiB; warm sessions 13.34 → 10.53 GiB) with byte-identical output, no slowdown in cold runs (median 11.73 s vs 12.82 s) and about 2% in warm sessions.',
  'Quantizing the DiT to q8_0 lowered VRAM further (10.95 GiB; 8.46 GiB together with mem_saver) but ran slower in cold runs (median 18.15 s vs 12.82 s) and slightly changed the output (waveform correlation 0.999 against BF16).',
  'Slow cold runs coincided with VRAM spilling into shared system memory: across ten runs sampled with process-level telemetry, wall time and the shared-memory peak correlated at r = 0.95. One slow run drives most of that correlation, so it supports rather than proves the explanation; the earlier 30.9 s run predates this telemetry and is kept.',
  'A true VRAM floor could not be measured this way on Windows: a separate process holding 11.29 GiB was demoted by the OS to 3.15 GiB of dedicated VRAM while audio.cpp ran. Those constrained runs are invalidated. The lowest measured footprint, 8.46 GiB, is a footprint on this 16 GB card — not a minimum requirement and not evidence about smaller GPUs.',
  'Corrections published as errata: four audio.cpp session records ran without the pinned options (request-sequence items need options nested under "options") and were invalidated and re-run; seven constrained-VRAM records were invalidated; two recorded values were corrected.',
];
