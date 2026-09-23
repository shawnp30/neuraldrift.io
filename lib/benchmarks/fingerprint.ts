// lib/benchmarks/fingerprint.ts
// Deterministic configuration fingerprinting and strict comparability engine.

import crypto from 'node:crypto';
import type { BenchmarkRecord, ComparabilityAssessment } from './types';

/**
 * Deterministically sorts and serializes any value for hashing.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`);
  return `{${entries.join(',')}}`;
}

export interface FingerprintPayload {
  modelId: string;
  quantization: string;
  runtime: string;
  runtimeVersion: string;
  backend: string;
  gpuName: string;
  driverVersion: string;
  workloadId: string;
  workloadVersion: string;
  paradigm: string;
}

/**
 * Extracts material configuration variables that dictate deterministic comparability.
 */
export function extractFingerprintPayload(record: BenchmarkRecord): FingerprintPayload {
  return {
    modelId: record.model.modelId.trim().toLowerCase(),
    quantization: (record.model.quantization || 'unknown').trim().toUpperCase(),
    runtime: record.runtime.runtime.trim().toLowerCase(),
    runtimeVersion: record.runtime.runtimeVersion.trim(),
    backend: record.runtime.backend.trim().toLowerCase(),
    gpuName: record.hardware.gpuName.trim(),
    driverVersion: record.software.driverVersion.trim(),
    workloadId: record.workloadId.trim().toUpperCase(),
    workloadVersion: record.workloadVersion.trim(),
    paradigm: record.paradigm,
  };
}

/**
 * Computes a SHA-256 fingerprint hash for a benchmark configuration.
 */
export function calculateConfigFingerprint(record: BenchmarkRecord): string {
  const payload = extractFingerprintPayload(record);
  const serialized = canonicalJson(payload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Generates a unique, human-traceable benchmark run ID.
 */
export function generateBenchmarkRunId(
  workloadId: string,
  modelId: string,
  gpuId: string
): string {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const cleanModel = modelId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);
  const cleanGpu = gpuId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
  const nonce = crypto.randomBytes(4).toString('hex');
  return `run-${dateStr}-${workloadId.toLowerCase()}-${cleanModel}-${cleanGpu}-${nonce}`;
}

/**
 * Evaluates whether two benchmark runs can be directly compared.
 * If material variables differ (e.g. different workloads, different drivers, different quantization),
 * it returns a structured assessment with clear reasons and warnings.
 */
export function checkComparability(a: BenchmarkRecord, b: BenchmarkRecord): ComparabilityAssessment {
  const diffs: { variable: string; valueA: unknown; valueB: unknown }[] = [];
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Workload mismatch is an absolute blocker: you cannot compare a tool use run to a generation run
  if (a.workloadId !== b.workloadId) {
    diffs.push({ variable: 'workloadId', valueA: a.workloadId, valueB: b.workloadId });
    reasons.push(`Different workloads: ${a.workloadId} vs ${b.workloadId}.`);
  }

  // Workload version mismatch
  if (a.workloadVersion !== b.workloadVersion) {
    diffs.push({ variable: 'workloadVersion', valueA: a.workloadVersion, valueB: b.workloadVersion });
    reasons.push(`Workload versions differ (${a.workloadVersion} vs ${b.workloadVersion}); tasks may not be identical.`);
  }

  // Paradigm mismatch (raw inference vs workload)
  if (a.paradigm !== b.paradigm) {
    diffs.push({ variable: 'paradigm', valueA: a.paradigm, valueB: b.paradigm });
    reasons.push(`Different benchmark paradigms: ${a.paradigm} vs ${b.paradigm}.`);
  }

  // Model comparison
  const sameModel = a.model.modelId.toLowerCase() === b.model.modelId.toLowerCase();
  if (!sameModel) {
    diffs.push({ variable: 'modelId', valueA: a.model.modelId, valueB: b.model.modelId });
  }

  // Quantization comparison
  const sameQuant = (a.model.quantization || '').toUpperCase() === (b.model.quantization || '').toUpperCase();
  if (!sameQuant) {
    diffs.push({ variable: 'quantization', valueA: a.model.quantization, valueB: b.model.quantization });
    warnings.push(`Differing quantization (${a.model.quantization || 'Unknown'} vs ${b.model.quantization || 'Unknown'}) impacts throughput and memory.`);
  }

  // Hardware comparison
  const sameGpu = a.hardware.gpuName === b.hardware.gpuName;
  if (!sameGpu) {
    diffs.push({ variable: 'gpuName', valueA: a.hardware.gpuName, valueB: b.hardware.gpuName });
  }

  // Runtime comparison
  const sameRuntime = a.runtime.runtime === b.runtime.runtime;
  if (!sameRuntime) {
    diffs.push({ variable: 'runtime', valueA: a.runtime.runtime, valueB: b.runtime.runtime });
    warnings.push(`Comparing different runtimes (${a.runtime.runtime} vs ${b.runtime.runtime}). Kernel implementations and memory overhead differ.`);
  }

  // Driver comparison
  const sameDriver = a.software.driverVersion === b.software.driverVersion;
  if (!sameDriver) {
    diffs.push({ variable: 'driverVersion', valueA: a.software.driverVersion, valueB: b.software.driverVersion });
    warnings.push(`Different GPU drivers (${a.software.driverVersion} vs ${b.software.driverVersion}). Minor throughput variance may stem from driver stack.`);
  }

  // Determine tier
  let matchTier: ComparabilityAssessment['matchTier'] = 'incomparable';
  let comparable = false;

  if (reasons.length > 0) {
    matchTier = 'incomparable';
    comparable = false;
  } else if (diffs.length === 0) {
    matchTier = 'identical_config';
    comparable = true;
  } else if (!sameGpu && sameModel && sameRuntime && sameQuant) {
    matchTier = 'different_hardware';
    comparable = true;
  } else if (!sameRuntime && sameModel && sameGpu) {
    matchTier = 'different_runtime';
    comparable = true;
  } else if (!sameQuant && sameModel && sameGpu && sameRuntime) {
    matchTier = 'different_quantization';
    comparable = true;
  } else {
    // Cross-comparison with multiple variables changed
    matchTier = 'different_hardware';
    comparable = true;
    warnings.push('Multiple material variables differ between runs; isolate one independent variable for highest scientific rigor.');
  }

  return {
    comparable,
    matchTier,
    reasons,
    warnings,
    materialDifferences: diffs,
  };
}
