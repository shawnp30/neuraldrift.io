// lib/benchmarks/adapters/interface.ts
// Standardized interface for local AI runtime adapters.

import type {
  BenchmarkModelConfig,
  BenchmarkRuntimeConfig,
  RawInferenceMetrics,
  WorkloadMetrics,
  WorkloadDefinition,
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

export interface RuntimeAdapter {
  name: string;
  probe(endpoint?: string): Promise<RuntimeProbeResult>;

  executeRawInference(
    endpoint: string,
    model: BenchmarkModelConfig,
    workload: WorkloadDefinition
  ): Promise<RawInferenceExecutionResult>;

  executeWorkload(
    endpoint: string,
    model: BenchmarkModelConfig,
    workload: WorkloadDefinition
  ): Promise<WorkloadExecutionResult>;
}
