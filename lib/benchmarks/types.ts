// lib/benchmarks/types.ts
// Core type definitions for the NeuralDrift Local AI Benchmark Framework.
// Strictly separates Raw Inference Benchmarks from End-to-End Workload Benchmarks.

export type BenchmarkParadigm = 'raw_inference' | 'workload';

export type BenchmarkCategory =
  | 'generation'       // Raw text generation / prompt completion
  | 'tool_use'         // Agentic tool selection & invocation
  | 'rag'              // Context retrieval & factual synthesis
  | 'multi_step'       // Multi-turn reasoning, tool chaining, verification
  | 'creator_image'    // Diffusion / DiT image generation workflow
  | 'creator_video'    // Video generation workflow (e.g. MiniMax, WanGP, FastH3)
  | 'creator_audio'    // Audio / speech generation
  | 'comfyui';         // Graph execution in ComfyUI

export type EvidenceLevel =
  | 'upstream_claim'               // Vendor / creator documentation
  | 'community_result'             // Credible third-party report
  | 'neuraldrift_documented'       // Requirements & spec verified by NeuralDrift
  | 'neuraldrift_execution_tested' // Ran successfully at least once on Lab hardware
  | 'neuraldrift_benchmarked'      // Ran under controlled benchmark conditions with recorded telemetry
  | 'neuraldrift_verified';        // Level-5 verified (current hash, reproducible, validated output)

export type BenchmarkOutcome = 'PASS' | 'PARTIAL' | 'FAIL' | 'ERROR';

export type HardwareFormFactor =
  | 'desktop'
  | 'laptop'
  | 'cloud'
  | 'multi_gpu'
  | 'multi_machine'
  | 'hybrid';

export interface BenchmarkModelConfig {
  provider: string;               // e.g. "Qwen", "Meta", "Google", "Mistral"
  modelId: string;                // e.g. "qwen2.5.1-coder-7b-instruct"
  displayName: string;            // e.g. "Qwen 2.5 Coder 7B Instruct"
  parameterSize: string;          // e.g. "7B", "14B-A3B", "70B"
  architecture: string;           // e.g. "Qwen2", "gemma4", "Llama"
  quantization: string;           // e.g. "Q4_K_M", "Q8_0", "FP16", "FP8", "BF16", "Unknown"
  contextLength?: number;         // e.g. 32768, 131072
}

export interface BenchmarkRuntimeConfig {
  runtime: 'lm_studio' | 'ollama' | 'llama_cpp' | 'vllm' | 'openvino' | 'comfyui' | 'custom';
  runtimeVersion: string;         // e.g. "0.3.9", "0.5.12"
  backend: 'cuda' | 'rocm' | 'vulkan' | 'metal' | 'openvino' | 'cpu' | 'directml';
  backendVersion?: string;        // e.g. "CUDA 13.4", "ROCm 6.2"
  endpoint?: string;              // e.g. "http://localhost:1234"
  flags?: Record<string, unknown>; // e.g. { flashAttention: true, contextLength: 4096 }
}

export interface BenchmarkHardwareProfile {
  id: string;                     // e.g. "local-rtx-5080", "cloud-h100-sxm"
  gpuName: string;                // e.g. "NVIDIA GeForce RTX 5080"
  gpuArch: string;                // e.g. "Blackwell", "Ada Lovelace", "RDNA3"
  gpuCount: number;               // 1, 2, 4, 8
  vramBytes: number;              // Dedicated VRAM in bytes
  systemRamBytes: number | null;  // Total system RAM in bytes
  cpuModel?: string;              // e.g. "AMD Ryzen 9 9950X"
  formFactor: HardwareFormFactor;
  isCloud: boolean;
  cloudProvider?: string;         // e.g. "RunPod", "Lambda Labs"
  hourlyRateUsd?: number | null;  // Cloud rate if applicable, evidenced
}

export interface BenchmarkSoftwareEnvironment {
  os: string;                     // e.g. "win32 10.0.26100", "Ubuntu 24.04 LTS"
  driverVersion: string;          // e.g. "616.92"
  cudaVersion?: string | null;    // e.g. "13.4"
  rocmVersion?: string | null;
  pythonVersion?: string | null;
  runtimeLibraries?: Record<string, string>;
}

export interface WorkloadToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface WorkloadDefinition {
  id: string;                     // e.g. "ND-LLM-001", "ND-AGENT-001"
  version: string;                // e.g. "1.0.0"
  paradigm: BenchmarkParadigm;
  category: BenchmarkCategory;
  name: string;
  description: string;
  prompt: string;                 // User / task prompt
  systemPrompt?: string;
  tools?: WorkloadToolDefinition[];
  ragCorpus?: {
    documents: { id: string; title: string; text: string }[];
    retrievalQuery?: string;
  };
  expectedResult: {
    type: 'exact_string' | 'regex' | 'json_schema' | 'tool_call' | 'numeric' | 'contains_all' | 'custom_validator';
    value: unknown;
  };
  generationSettings: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    seed?: number;
  };
}

export interface RawInferenceMetrics {
  ttftMs: number | null;                   // Time to first token in milliseconds
  promptTokens: number | null;             // Number of prompt tokens processed
  promptProcessingMs: number | null;       // Prompt processing time in ms
  promptTokensPerSec: number | null;       // Prompt processing speed (tok/s)
  generationTokens: number | null;         // Tokens generated
  generationMs: number | null;             // Generation time in ms
  generationTokensPerSec: number | null;   // Token generation throughput (tok/s)
  totalTokens: number | null;
  totalExecutionTimeMs: number;            // Total wall time in ms
  modelLoadTimeMs?: number | null;         // Time to load model into VRAM
  peakVramBytes: number | null;            // Peak VRAM observed
  peakRamBytes: number | null;             // Peak System RAM observed
  gpuUtilizationPct: number | null;        // Peak/Avg GPU utilization %
  cpuUtilizationPct?: number | null;
  powerWatts?: number | null;              // Power draw if measurable, else null
}

export interface WorkloadMetrics {
  taskCompletionTimeMs: number;            // End-to-end task completion time
  totalExecutionTimeMs: number;            // Wall time
  totalTokens: number | null;              // All tokens across all turns
  toolCallsCount: number;                  // Total tool calls attempted
  successfulToolCalls: number;             // Tool calls that succeeded
  failedToolCalls: number;                 // Tool calls that failed/errored
  retriesCount: number;                    // Turns required to recover
  toolCallLatencyMs: number | null;        // Time spent waiting for tool resolution
  finalTaskSuccess: boolean;               // Did the final answer satisfy the objective?
  peakVramBytes: number | null;
  peakRamBytes: number | null;
  gpuUtilizationPct: number | null;
  cpuUtilizationPct?: number | null;
  powerWatts?: number | null;
}

export interface ValidationReport {
  passed: boolean;
  validator: string;
  actualOutput: string;
  expectedOutput: unknown;
  details?: string;
  errors?: string[];
}

export interface BenchmarkRecord {
  id: string;                              // benchmark_run_id e.g. "run-2026-09-17-nd-llm-001-qwen-rtx5080-abc123"
  workloadId: string;                      // e.g. "ND-LLM-001"
  workloadVersion: string;                 // e.g. "1.0.0"
  paradigm: BenchmarkParadigm;
  category: BenchmarkCategory;
  timestamp: string;                       // ISO 8601 UTC
  benchmarkVersion: string;                // e.g. "1.0.0"
  evidenceLevel: EvidenceLevel;
  outcome: BenchmarkOutcome;

  model: BenchmarkModelConfig;
  runtime: BenchmarkRuntimeConfig;
  hardware: BenchmarkHardwareProfile;
  software: BenchmarkSoftwareEnvironment;

  configFingerprint: string;               // Deterministic SHA-256 hash of material variables

  rawInferenceMetrics?: RawInferenceMetrics | null;
  workloadMetrics?: WorkloadMetrics | null;
  validation: ValidationReport;

  rawEvidenceUrl: string;                  // Path to raw JSON trace, e.g. "/benchmark-evidence/<id>/record.json"
  logsSummary?: string;
  notes?: string;
}

export interface ComparabilityAssessment {
  comparable: boolean;
  matchTier: 'identical_config' | 'different_hardware' | 'different_runtime' | 'different_quantization' | 'incomparable';
  reasons: string[];
  warnings: string[];
  materialDifferences: {
    variable: string;
    valueA: unknown;
    valueB: unknown;
  }[];
}
