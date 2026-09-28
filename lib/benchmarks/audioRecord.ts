// lib/benchmarks/audioRecord.ts
// Turns an audio generation attempt into a BenchmarkRecord. Pure: all file I/O (hashing, decoding)
// happens before this is called, so every outcome path is unit-testable.

import type {
  ArtifactRef,
  AudioOutputMetrics,
  AudioWorkloadDefinition,
  BenchmarkHardwareProfile,
  BenchmarkModelConfig,
  BenchmarkOutcome,
  BenchmarkRecord,
  BenchmarkSoftwareEnvironment,
  FailureEvidence,
  WorkloadInputRef,
} from './types';
import type { GenerationExecutionResult } from './adapters/interface';
import { validateBenchmarkOutput, type AudioArtifactObservation } from './validators';
import { calculateConfigFingerprint } from './fingerprint';

export const BENCHMARK_SUITE_VERSION = '1.0.0';

export function realTimeFactor(generationTimeMs: number | null, outputDurationSec: number | null): number | null {
  if (generationTimeMs == null || outputDurationSec == null || outputDurationSec <= 0) return null;
  return Number((generationTimeMs / 1000 / outputDurationSec).toFixed(4));
}

export interface AssembleAudioRecordInput {
  runId: string;
  timestamp: string;
  workload: AudioWorkloadDefinition;
  model: BenchmarkModelConfig;
  hardware: BenchmarkHardwareProfile;
  software: BenchmarkSoftwareEnvironment;
  execution: GenerationExecutionResult;
  observation: AudioArtifactObservation | undefined; // Decoded output, when a file was produced
  artifact: ArtifactRef | null;                       // Hashed, retained output
  inputs?: WorkloadInputRef[];                        // Verified by content hash
  workflow?: { id: string; sha256: string } | null;
  limitations?: string[];
  notes?: string;
}

export function assembleAudioRecord(input: AssembleAudioRecordInput): BenchmarkRecord {
  const { execution, observation, workload } = input;
  const analysis = observation?.analysis;

  // Decoded values are authoritative; runtime-reported values stay in the raw trace.
  const outputMetrics: AudioOutputMetrics = {
    ...execution.outputMetrics,
    outputDurationSec: analysis ? Number(analysis.durationSec.toFixed(3)) : null,
    sampleRateHz: analysis?.sampleRateHz ?? execution.outputMetrics.sampleRateHz,
    channels: analysis?.channels ?? execution.outputMetrics.channels,
    realTimeFactor: realTimeFactor(execution.outputMetrics.generationTimeMs, analysis?.durationSec ?? null),
  };

  const validation = validateBenchmarkOutput(workload, '', { audioArtifact: observation });

  let outcome: BenchmarkOutcome;
  let failure: FailureEvidence | null = execution.failure;
  if (failure) outcome = 'ERROR';
  else if (!validation.passed) {
    outcome = 'FAIL';
    failure = { stage: 'validation', type: 'ARTIFACT_INVALID', message: validation.details ?? 'Artifact failed validation.' };
  } else outcome = 'PASS';

  const record: BenchmarkRecord = {
    id: input.runId,
    workloadId: workload.id,
    workloadVersion: workload.version,
    paradigm: workload.paradigm,
    category: workload.category,
    timestamp: input.timestamp,
    benchmarkVersion: BENCHMARK_SUITE_VERSION,
    evidenceLevel: 'neuraldrift_benchmarked',
    outcome,
    model: input.model,
    runtime: execution.runtime,
    hardware: input.hardware,
    software: input.software,
    configFingerprint: '',
    ...(input.workflow ? { workflow: input.workflow } : {}),
    ...(input.inputs?.length ? { inputs: input.inputs } : {}),
    rawInferenceMetrics: null,
    workloadMetrics: null,
    outputMetrics,
    artifacts: input.artifact ? [input.artifact] : [],
    failure,
    validation,
    rawEvidenceUrl: `/benchmark-evidence/${input.runId}/record.json`,
    logsSummary: `Executed ${workload.id} v${workload.version} on ${input.hardware.gpuName} via ${execution.runtime.runtime} ${execution.runtime.runtimeVersion}: ${outcome}.`,
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.limitations?.length ? { limitations: input.limitations } : {}),
  };
  record.configFingerprint = calculateConfigFingerprint(record);
  return record;
}
