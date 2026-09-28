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
  ExecutionConditions,
  FailureEvidence,
  SessionIteration,
  ValidationReport,
  WorkloadInputRef,
} from './types';
import type { GenerationExecutionResult, GenerationSessionResult } from './adapters/interface';
import { validateBenchmarkOutput, type AudioArtifactObservation } from './validators';
import { calculateConfigFingerprint } from './fingerprint';
import { distribution } from './stats';

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
  variant?: string;
  executionConditions?: ExecutionConditions | null;
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
    ...(input.variant ? { variant: input.variant } : {}),
    ...(input.executionConditions ? { executionConditions: input.executionConditions } : {}),
    rawInferenceMetrics: null,
    workloadMetrics: null,
    outputMetrics,
    ...(execution.telemetry ? { telemetry: execution.telemetry } : {}),
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

export interface AssembleAudioSessionInput extends Omit<AssembleAudioRecordInput, 'execution' | 'observation' | 'artifact'> {
  session: GenerationSessionResult;
  outputs: Map<string, { observation: AudioArtifactObservation; artifact: ArtifactRef }>; // By iteration id
}

/**
 * A warm session is one record: every iteration's artifact is decoded, validated and hashed, and the
 * session passes only if all of them do. Summary figures are medians over the measured iterations.
 */
export function assembleAudioSessionRecord(input: AssembleAudioSessionInput): BenchmarkRecord {
  const { session, workload } = input;
  const iterations: SessionIteration[] = session.iterations.map((it) => {
    const out = input.outputs.get(it.id);
    const analysis = out?.observation.analysis;
    const report = validateBenchmarkOutput(workload, '', { audioArtifact: out?.observation });
    return {
      index: it.index,
      warmup: it.warmup,
      generationMs: it.generationMs,
      outputDurationSec: analysis ? Number(analysis.durationSec.toFixed(3)) : null,
      realTimeFactor: realTimeFactor(it.generationMs, analysis?.durationSec ?? null),
      artifactSha256: out?.artifact.sha256 ?? null,
      ...(out?.artifact.contentSha256 ? { contentSha256: out.artifact.contentSha256 } : {}),
      passed: report.passed,
    };
  });
  const measured = iterations.filter((it) => !it.warmup);
  const expected = workload.session?.measuredIterations ?? measured.length;
  const failed = iterations.filter((it) => !it.passed);
  const firstMeasured = session.iterations.find((it) => !it.warmup);
  const firstObservation = firstMeasured ? input.outputs.get(firstMeasured.id)?.observation : undefined;
  const firstReport = validateBenchmarkOutput(workload, '', { audioArtifact: firstObservation });

  const passed = !session.failure && failed.length === 0 && measured.length === expected;
  const validation: ValidationReport = {
    passed,
    validator: 'audio_artifact',
    actualOutput: firstReport.actualOutput,
    expectedOutput: workload.expectedResult.value,
    details: passed
      ? `All ${iterations.length} session outputs (${measured.length} measured, ${iterations.length - measured.length} warm-up) decoded and validated. First measured: ${firstReport.actualOutput}.`
      : `${iterations.length - failed.length}/${iterations.length} session outputs passed; ${measured.length}/${expected} measured iterations completed.`,
    errors: failed.length ? failed.map((it) => `Iteration ${it.index}${it.warmup ? ' (warm-up)' : ''} failed validation.`) : undefined,
  };

  const generation = distribution(measured.map((it) => it.generationMs));
  const rtf = distribution(measured.map((it) => it.realTimeFactor));
  const durations = distribution(measured.map((it) => it.outputDurationSec));
  const t = session.telemetry;

  let outcome: BenchmarkOutcome;
  let failure: FailureEvidence | null = session.failure;
  if (failure) outcome = 'ERROR';
  else if (!passed) {
    outcome = 'FAIL';
    failure = { stage: 'validation', type: 'ARTIFACT_INVALID', message: validation.details ?? 'Session outputs failed validation.' };
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
    runtime: session.runtime,
    hardware: input.hardware,
    software: input.software,
    configFingerprint: '',
    ...(input.inputs?.length ? { inputs: input.inputs } : {}),
    ...(input.variant ? { variant: input.variant } : {}),
    ...(input.executionConditions ? { executionConditions: input.executionConditions } : {}),
    rawInferenceMetrics: null,
    workloadMetrics: null,
    outputMetrics: {
      kind: 'audio',
      requestedDurationSec: workload.audioSettings.durationSec,
      outputDurationSec: durations?.median ?? null,
      generationTimeMs: generation?.median ?? null,
      realTimeFactor: rtf?.median ?? null,
      sampleRateHz: firstObservation?.analysis?.sampleRateHz ?? null,
      channels: firstObservation?.analysis?.channels ?? null,
      peakVramBytes: t?.vramPeakBytes ?? null,
      vramBaselineBytes: t?.vramBaselineBytes ?? null,
      peakRamBytes: t?.processRamPeakBytes ?? null,
      gpuUtilizationPct: t?.gpuUtilizationPeakPct ?? null,
      telemetryMethod: `Warm-session record: generation time and RTF are medians of ${measured.length} measured iterations (see session metrics); memory and GPU figures cover the whole session. ${t?.method ?? ''}`.trim(),
    },
    sessionMetrics: {
      kind: 'warm_session',
      processWallMs: session.processWallMs,
      startupAndLoadMs: session.startupAndLoadMs,
      startupAndLoadBasis: session.startupAndLoadBasis,
      warmupIterations: iterations.length - measured.length,
      measuredIterations: measured.length,
      iterations,
      generationMs: generation,
      realTimeFactor: rtf,
      // Distinct audio, not distinct files: the payload hash when recorded, otherwise the file hash.
      distinctMeasuredOutputs: new Set(measured.map((it) => it.contentSha256 ?? it.artifactSha256).filter(Boolean)).size,
      generationSource: session.generationSource,
    },
    ...(t ? { telemetry: t } : {}),
    artifacts: session.iterations.flatMap((it) => {
      const out = input.outputs.get(it.id);
      return out ? [out.artifact] : [];
    }),
    failure,
    validation,
    rawEvidenceUrl: `/benchmark-evidence/${input.runId}/record.json`,
    logsSummary: `Warm session of ${workload.id} v${workload.version} on ${input.hardware.gpuName} via ${session.runtime.runtime} ${session.runtime.runtimeVersion}: ${outcome}.`,
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.limitations?.length ? { limitations: input.limitations } : {}),
  };
  record.configFingerprint = calculateConfigFingerprint(record);
  return record;
}
