// lib/benchmarks/adapters/interface.ts
// Standardized interface for local AI runtime adapters.

import type {
  AudioWorkloadDefinition,
  BenchmarkModelConfig,
  BenchmarkRuntimeConfig,
  FailureEvidence,
  OutputMetrics,
  RawInferenceMetrics,
  TextWorkloadDefinition,
  WorkloadMetrics,
} from '../types';

export interface RuntimeProbeResult {
  available: boolean;
  runtime: string;
  runtimeVersion: string;
  backend: string;
  models: {
    id: string;
    name?: string;
    architecture?: string;
    parameterSize?: string;
    quantization?: string;
  }[];
  error?: string;
}

export interface RawInferenceExecutionResult {
  output: string;
  metrics: RawInferenceMetrics;
  rawResponse: unknown;
}

export interface WorkloadExecutionResult {
  finalOutput: string;
  toolCallsExecuted: {
    name: string;
    arguments: Record<string, unknown>;
    result: unknown;
    latencyMs: number;
    success: boolean;
  }[];
  metrics: WorkloadMetrics;
  rawTrace: unknown;
}

// Text runtimes (LLM / agent) exchange strings and tool calls.
export interface RuntimeAdapter {
  name: string;
  probe(endpoint?: string): Promise<RuntimeProbeResult>;

  executeRawInference(
    endpoint: string,
    model: BenchmarkModelConfig,
    workload: TextWorkloadDefinition
  ): Promise<RawInferenceExecutionResult>;

  executeWorkload(
    endpoint: string,
    model: BenchmarkModelConfig,
    workload: TextWorkloadDefinition
  ): Promise<WorkloadExecutionResult>;
}

// Generative runtimes write files. The adapter reports what it ran and where the output landed;
// the runner hashes, decodes and validates the file itself rather than trusting the adapter.
export interface GenerationExecutionResult {
  outputPath: string | null;       // Absolute path of the generated file, when one was written
  outputMetrics: OutputMetrics;
  runtime: BenchmarkRuntimeConfig; // Runtime configuration as actually executed
  failure: FailureEvidence | null;
  rawTrace: unknown;               // Command line, exit status, runtime-reported metrics, log tail
}

export interface GenerativeRuntimeAdapter<W = AudioWorkloadDefinition> {
  name: string;
  probe(): Promise<RuntimeProbeResult>;
  executeGeneration(model: BenchmarkModelConfig, workload: W, outputDir: string): Promise<GenerationExecutionResult>;
}
