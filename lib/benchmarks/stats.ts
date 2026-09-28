// lib/benchmarks/stats.ts
// Descriptive statistics for repeated measurements. Nothing is dropped: outliers stay in every figure.

import type { DistributionStats } from './types';

export const P95_MIN_SAMPLES = 20;

export function distribution(values: (number | null | undefined)[]): DistributionStats | null {
  const v = values.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  const n = v.length;
  if (!n) return null;
  const mean = v.reduce((s, x) => s + x, 0) / n;
  const mid = Math.floor(n / 2);
  const median = n % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  const stdev = n > 1 ? Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)) : 0;
  // Nearest-rank p95, reported only when enough samples make it more than "the maximum".
  const p95 = n >= P95_MIN_SAMPLES ? v[Math.min(n - 1, Math.ceil(0.95 * n) - 1)] : null;
  const round = (x: number) => Number(x.toFixed(4));
  return { n, median: round(median), mean: round(mean), min: round(v[0]), max: round(v[n - 1]), stdev: round(stdev), cv: mean ? round(stdev / mean) : 0, p95: p95 == null ? null : round(p95) };
}
