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

// Commercial-use status of a license as NeuralDrift read it from the licensor's own text.
// Informational only, not legal advice. Downloadable weights never imply COMMERCIAL_OK.
export type CommercialUseStatus =
  | 'COMMERCIAL_OK'
  | 'RESTRICTED'
  | 'NON_COMMERCIAL'
  | 'RESEARCH_ONLY'
  | 'LICENSE_REVIEW_REQUIRED'
  | 'UNKNOWN';

export interface LicenseInfo {
  id: string;                     // SPDX id where one exists, e.g. "Apache-2.0", "MIT"
  commercialUse: CommercialUseStatus;
  sourceUrl: string;              // Authoritative license text or model card
  verifiedAt?: string;            // ISO date NeuralDrift last read the source
  notes?: string;
}

// A file identified by content, not by name. Used for model files, workload inputs and outputs.
export interface HashedFileRef {
  path: string;                   // Where the file was read from, relative to the evidence root where possible
  sha256: string;
  bytes: number;
}

export interface BenchmarkModelConfig {
  provider: string;               // e.g. "Qwen", "Meta", "Google", "Mistral"
  modelId: string;                // e.g. "qwen2.5.1-coder-7b-instruct"
  displayName: string;            // e.g. "Qwen 2.5 Coder 7B Instruct"
  parameterSize: string;          // e.g. "7B", "14B-A3B", "70B"
  architecture: string;           // e.g. "Qwen2", "gemma4", "Llama"
  quantization: string;           // e.g. "Q4_K_M", "Q8_0", "FP16", "FP8", "BF16", "Unknown"
  contextLength?: number;         // e.g. 32768, 131072
  version?: string;               // Upstream model version or revision, e.g. "1.5" or a Hugging Face commit
  files?: HashedFileRef[];        // Weight files actually loaded, hashed locally
  license?: LicenseInfo;          // Model weights license (never the runtime's license)
}

export interface BenchmarkRuntimeConfig {
  runtime: 'lm_studio' | 'ollama' | 'llama_cpp' | 'vllm' | 'openvino' | 'comfyui' | 'audio_cpp' | 'pytorch' | 'custom';
  runtimeVersion: string;         // e.g. "0.3.9", "0.5.12"
  backend: 'cuda' | 'rocm' | 'vulkan' | 'metal' | 'openvino' | 'cpu' | 'directml';
  backendVersion?: string;        // e.g. "CUDA 13.4", "ROCm 6.2"
  endpoint?: string;              // e.g. "http://localhost:1234"
  flags?: Record<string, unknown>; // e.g. { flashAttention: true, contextLength: 4096 }
  precision?: string;             // Compute/weight precision the runtime actually used, e.g. "bf16"
  attentionBackend?: string;      // e.g. "sdpa", "flash_attn_2", "ggml"
  license?: LicenseInfo;          // Runtime/engine license (never the model's license)
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

export type AudioTask =
  | 'tts'
  | 'voice_cloning'
  | 'asr'
  | 'diarization'
  | 'voice_conversion'
  | 'music'
  | 'sfx'
  | 'source_separation'
  | 'restoration';

// A workload input identified by content hash; the path alone is never trusted.
export interface WorkloadInputRef extends HashedFileRef {
  role: string;                   // e.g. "reference_voice", "source_audio", "audio_codes"
  optionKey?: string;             // When set, the file's UTF-8 text is passed as this request option
}

// Repeated generations inside one loaded model session.
export interface WorkloadSession {
  warmupIterations: number;
  measuredIterations: number;
}

export type ValidatorType =
  | 'exact_string'
  | 'regex'
  | 'json_schema'
  | 'tool_call'
  | 'numeric'
  | 'contains_all'
  | 'custom_validator'
  | 'audio_artifact';

export interface AudioArtifactExpectation {
  format: 'wav';
  minDurationSec: number;
  maxDurationSec: number;
  sampleRateHz?: number;
  channels?: number;
  minRmsDbfs: number;             // Below this the output counts as effectively silent
}

interface WorkloadDefinitionBase {
  id: string;                     // e.g. "ND-LLM-001", "ND-AGENT-001"
  version: string;                // e.g. "1.0.0"
  paradigm: BenchmarkParadigm;
  name: string;
  description: string;
  prompt: string;                 // User / task prompt
  inputs?: WorkloadInputRef[];
  session?: WorkloadSession;      // Present for warm-session workloads
  expectedResult: {
    type: ValidatorType;
    value: unknown;
  };
}

export interface TextWorkloadDefinition extends WorkloadDefinitionBase {
  category: Exclude<BenchmarkCategory, 'creator_audio'>;
  systemPrompt?: string;
  tools?: WorkloadToolDefinition[];
  ragCorpus?: {
    documents: { id: string; title: string; text: string }[];
    retrievalQuery?: string;
  };
  generationSettings: {
    temperature: number;
    maxTokens: number;
    topP?: number;
    seed?: number;
  };
}

export interface AudioWorkloadDefinition extends WorkloadDefinitionBase {
  category: 'creator_audio';
  audioTask: AudioTask;
  audioSettings: {
    route?: string;               // Model-specific operation, e.g. ACE-Step "text2music"
    lyrics?: string;
    language?: string;
    durationSec: number;          // Requested output duration
    seed?: number;
    inferenceSteps?: number;
    guidanceScale?: number;
    outputFormat: 'wav';
    modelOptions?: Record<string, string | number | boolean>; // Family-specific request options
  };
}

export type WorkloadDefinition = TextWorkloadDefinition | AudioWorkloadDefinition;

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

// Output-specific metrics, tagged by kind so another kind can be added without touching this one.
export interface AudioOutputMetrics {
  kind: 'audio';
  requestedDurationSec: number | null;
  outputDurationSec: number | null;
  generationTimeMs: number | null;         // Wall time of the generation process, model load included
  realTimeFactor: number | null;           // generationTimeMs / 1000 / outputDurationSec; below 1 is faster than real time
  sampleRateHz: number | null;
  channels: number | null;
  peakVramBytes: number | null;            // Peak device-wide VRAM in use while the run was active
  vramBaselineBytes: number | null;        // Device-wide VRAM in use just before the run started
  peakRamBytes: number | null;             // Peak working set of the generation process
  gpuUtilizationPct: number | null;        // Peak sampled GPU utilization
  telemetryMethod?: string;                // How the telemetry above was sampled
}

export type OutputMetrics = AudioOutputMetrics;

export interface DistributionStats {
  n: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  stdev: number;                           // Sample standard deviation (n − 1)
  cv: number;                              // stdev / mean
  p95: number | null;                      // Only reported when n ≥ 20
}

export interface SessionIteration {
  index: number;
  warmup: boolean;
  generationMs: number | null;             // Request time reported by the runtime for this generation
  outputDurationSec: number | null;
  realTimeFactor: number | null;
  artifactSha256: string | null;
  contentSha256?: string | null;           // Audio payload hash; identical audio can differ in file metadata
  passed: boolean;                         // This iteration's artifact passed validation
}

export interface SessionMetrics {
  kind: 'warm_session';
  processWallMs: number | null;            // Whole session: spawn to exit
  startupAndLoadMs: number | null;         // Time before the first request started
  startupAndLoadBasis: 'measured' | 'derived';
  warmupIterations: number;
  measuredIterations: number;
  iterations: SessionIteration[];
  generationMs: DistributionStats | null;  // Measured (non-warm-up) iterations only
  realTimeFactor: DistributionStats | null;
  distinctMeasuredOutputs: number;
  generationSource: string;                // Where per-iteration times come from
}

// How telemetry was sampled, plus what it saw. Stored with the record as evidence of method.
export interface TelemetrySummary {
  method: string;
  gpuSampleIntervalMs: number;
  gpuSamples: number;
  vramBaselineBytes: number | null;        // Device-wide, before start
  vramPeakBytes: number | null;            // Device-wide
  gpuUtilizationPeakPct: number | null;
  gpuUtilizationMeanPct: number | null;
  gpuMemoryUtilizationPeakPct: number | null;
  gpuTemperaturePeakC: number | null;
  gpuPowerPeakW: number | null;
  gpuPowerMeanW: number | null;
  gpuSmClockMinMHz: number | null;
  processSampleIntervalMs: number | null;
  processSamples: number;
  processRamPeakBytes: number | null;      // Working set of the process tree
  processGpuSamples: number;
  processVramPeakBytes: number | null;     // Dedicated VRAM of the process tree (OS GPU process counters)
  processSharedGpuMemoryPeakBytes: number | null; // Shared (system) memory used by the process tree's GPU work
  adapterSharedGpuMemoryStartBytes?: number | null; // Whole-adapter shared (system) memory in use at the first sample
  adapterSharedGpuMemoryPeakBytes?: number | null;  // Whole-adapter peak; includes every process using the GPU
  cpuUtilizationPeakPct: number | null;
  cpuUtilizationMeanPct: number | null;
  systemRamBaselineBytes: number | null;
  systemRamPeakBytes: number | null;
}

// Deliberately constrained conditions. Results under these conditions are not physical-GPU evidence.
export interface ExecutionConditions {
  kind: 'constrained_vram';
  vramBallastBytes: number;                // VRAM held by a separate process for the whole run
  freeVramBeforeRunBytes: number | null;   // Device-wide free VRAM after the ballast, before the run
  method: string;
}

export interface ArtifactRef extends HashedFileRef {
  format: string;                          // e.g. "wav"
  storage: 'local_only' | 'public';        // local_only artifacts are retained off-site; no playback is offered
  contentSha256?: string;                  // Hash of the decoded payload only (e.g. the WAV data chunk); metadata such as timestamps excluded
  publicUrl?: string;                      // Set only when the file is actually served by the site
}

export type FailureStage = 'preflight' | 'model_load' | 'execution' | 'validation' | 'transport';

// Same shape as ExecutionRecord.failure in lib/hardware/executions.ts, with benchmark-specific stages.
export interface FailureEvidence {
  stage: FailureStage;
  type: string;
  message: string;
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

  workflow?: { id: string; sha256: string } | null; // ComfyUI workflow identity, when the run executed one
  inputs?: WorkloadInputRef[];             // Hashed inputs actually supplied to the run

  rawInferenceMetrics?: RawInferenceMetrics | null;
  workloadMetrics?: WorkloadMetrics | null;
  outputMetrics?: OutputMetrics | null;
  sessionMetrics?: SessionMetrics | null;
  telemetry?: TelemetrySummary | null;
  variant?: string;                        // Human label for a non-baseline configuration, e.g. "mem_saver"
  executionConditions?: ExecutionConditions | null;
  artifacts?: ArtifactRef[];
  failure?: FailureEvidence | null;
  validation: ValidationReport;

  rawEvidenceUrl: string;                  // Path to raw JSON trace, e.g. "/benchmark-evidence/<id>/record.json"
  logsSummary?: string;
  notes?: string;
  limitations?: string[];                  // Known limitations of this specific run
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
