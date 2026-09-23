// lib/benchmarks/registry.ts
// Benchmark registry querying, caching, and filtering.

import rawRecords from '@/data/benchmark-records.json';
import type { BenchmarkRecord, BenchmarkParadigm, BenchmarkCategory, EvidenceLevel } from './types';
import { checkComparability } from './fingerprint';

export const BENCHMARK_RECORDS: BenchmarkRecord[] = rawRecords as BenchmarkRecord[];

export function getAllBenchmarks(): BenchmarkRecord[] {
  return [...BENCHMARK_RECORDS].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getBenchmarkById(id: string): BenchmarkRecord | undefined {
  return BENCHMARK_RECORDS.find((r) => r.id === id);
}

export function filterBenchmarks(options: {
  paradigm?: BenchmarkParadigm;
  category?: BenchmarkCategory;
  workloadId?: string;
  runtime?: string;
  gpuName?: string;
  evidenceLevel?: EvidenceLevel;
  outcome?: string;
}): BenchmarkRecord[] {
  return BENCHMARK_RECORDS.filter((r) => {
    if (options.paradigm && r.paradigm !== options.paradigm) return false;
    if (options.category && r.category !== options.category) return false;
    if (options.workloadId && r.workloadId !== options.workloadId) return false;
    if (options.runtime && r.runtime.runtime !== options.runtime) return false;
    if (options.gpuName && !r.hardware.gpuName.toLowerCase().includes(options.gpuName.toLowerCase())) return false;
    if (options.evidenceLevel && r.evidenceLevel !== options.evidenceLevel) return false;
    if (options.outcome && r.outcome !== options.outcome) return false;
    return true;
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getComparableRuns(target: BenchmarkRecord): {
  record: BenchmarkRecord;
  comparability: ReturnType<typeof checkComparability>;
}[] {
  return BENCHMARK_RECORDS
    .filter((r) => r.id !== target.id)
    .map((other) => ({
      record: other,
      comparability: checkComparability(target, other),
    }))
    .filter((res) => res.comparability.comparable);
}
