// lib/benchmarks/workloads.ts
// Standardized, versioned workload suite for the NeuralDrift Local AI Benchmark Framework.

import type { AudioWorkloadDefinition, WorkloadDefinition } from './types';

// ND-AUDIO-MUSIC-001 v1.0.0 definition. Workloads derived from it reuse these exact values.
const MUSIC_001_PROMPT =
  'Instrumental lo-fi hip hop beat with warm Rhodes piano chords, mellow sub bass, soft vinyl crackle and relaxed boom-bap drums';

const MUSIC_001_SETTINGS: AudioWorkloadDefinition['audioSettings'] = {
  route: 'text2music',
  lyrics: '[Instrumental]',
  language: 'en',
  durationSec: 30,
  seed: 42,
  inferenceSteps: 8,
  guidanceScale: 1.0, // Turbo is guidance-distilled; both reference implementations use 1.0
  outputFormat: 'wav',
  // Pinned explicitly: implementations disagree on some defaults (e.g. shift), so nothing is left to one.
  modelOptions: {
    bpm: 85,
    keyscale: 'C minor',
    timesignature: '4',
    shift: 3.0,
    infer_method: 'ode',
    thinking: true,
    lm_temperature: 0.85,
    lm_cfg_scale: 2.0,
    lm_top_k: 0,
    lm_top_p: 0.9,
  },
};

const MUSIC_001_EXPECTED: AudioWorkloadDefinition['expectedResult'] = {
  type: 'audio_artifact',
  value: {
    format: 'wav',
    minDurationSec: 25,
    maxDurationSec: 35,
    sampleRateHz: 48000,
    channels: 2,
    minRmsDbfs: -45,
  },
};

export const WORKLOAD_SUITE: WorkloadDefinition[] = [
  {
    id: 'ND-LLM-001',
    version: '1.0.0',
    paradigm: 'raw_inference',
    category: 'generation',
    name: 'Deterministic Structured Generation (ND-LLM-001)',
    description:
      'Evaluates raw inference throughput and latency under deterministic constraints. The model processes a standardized prompt and generates structured markdown/JSON with exact calculations.',
    systemPrompt:
      'You are a rigorous benchmark evaluation assistant. Always produce exact, deterministic outputs adhering strictly to the requested format.',
    prompt:
      'Calculate the exact VRAM requirements for a model with 14.8 billion parameters stored in FP16 precision, assuming standard 2 bytes per parameter plus 1.25 GB runtime KV-cache overhead at 4096 context length. Output the calculation in a JSON object with keys: "parameters_b", "bytes_per_param", "weights_gb", "kv_overhead_gb", "total_vram_gb", and "fits_16gb_gpu" (boolean). Round total_vram_gb to two decimal places.',
    expectedResult: {
      type: 'json_schema',
      value: {
        required: ['parameters_b', 'bytes_per_param', 'weights_gb', 'kv_overhead_gb', 'total_vram_gb', 'fits_16gb_gpu'],
        expectedValues: {
          fits_16gb_gpu: false, // 14.8 * 2 = 29.6 GB + 1.25 = 30.85 GB -> does not fit 16GB
        },
      },
    },
    generationSettings: {
      temperature: 0.0,
      maxTokens: 256,
      topP: 1.0,
      seed: 42,
    },
  },
  {
    id: 'ND-AGENT-001',
    version: '1.0.0',
    paradigm: 'workload',
    category: 'tool_use',
    name: 'Single-Turn Agent Tool Invocation (ND-AGENT-001)',
    description:
      'Evaluates on-device agent tool calling. The model must inspect the user request, choose the approved local tool from the schema, pass valid strongly typed arguments, and return the executed output.',
    systemPrompt:
      'You are a helpful local assistant with access to local system diagnostic tools. When asked to perform calculations or hardware checks, you must use the provided tools.',
    prompt:
      'What is the effective memory bandwidth in GB/s for a GPU featuring a 256-bit memory bus width running GDDR7 memory at 28 Gbps? Use the compute_memory_bandwidth tool to compute this.',
    tools: [
      {
        name: 'compute_memory_bandwidth',
        description: 'Computes memory bandwidth in gigabytes per second (GB/s).',
        parameters: {
          type: 'object',
          properties: {
            busWidthBits: {
              type: 'number',
              description: 'Memory bus width in bits, e.g. 256 or 384',
            },
            memorySpeedGbps: {
              type: 'number',
              description: 'Memory speed in Gbps per pin, e.g. 28 or 32',
            },
          },
          required: ['busWidthBits', 'memorySpeedGbps'],
        },
      },
      {
        name: 'query_gpu_temperature',
        description: 'Returns the current GPU core temperature in degrees Celsius.',
        parameters: {
          type: 'object',
          properties: {
            gpuIndex: { type: 'number' },
          },
        },
      },
    ],
    expectedResult: {
      type: 'tool_call',
      value: {
        toolName: 'compute_memory_bandwidth',
        arguments: {
          busWidthBits: 256,
          memorySpeedGbps: 28,
        },
        expectedComputedResult: 896, // (256 * 28) / 8 = 896 GB/s
      },
    },
    generationSettings: {
      temperature: 0.0,
      maxTokens: 200,
      topP: 1.0,
      seed: 42,
    },
  },
  {
    id: 'ND-RAG-001',
    version: '1.0.0',
    paradigm: 'workload',
    category: 'rag',
    name: 'Targeted Local Corpus Retrieval & QA (ND-RAG-001)',
    description:
      'Evaluates retrieval-augmented generation on a controlled local corpus. The model must extract specific facts without hallucinating external data.',
    systemPrompt:
      'You are an authoritative technical assistant. Answer the user question strictly and only using the provided reference documents. If the information is not present in the documents, state that it is unverified.',
    ragCorpus: {
      documents: [
        {
          id: 'doc-lab-arch-01',
          title: 'NeuralDrift Lab Hardware Specifications',
          text:
            'The primary NeuralDrift Lab testbench operates an NVIDIA GeForce RTX 5080 desktop card with 16,384 MiB GDDR7 VRAM on a 256-bit bus, connected to an AMD Ryzen 9 9950X CPU with 64 GiB DDR5-6000 system memory. Maximum board power (TGP) is rated at 360W.',
        },
        {
          id: 'doc-fasth3-spec-02',
          title: 'FastH3 8-Step V2 Architecture Note',
          text:
            'FastH3 8-Step V2 utilizes data-free DMD2 student distillation combined with VSA-H3 sparse attention. It reduces required diffusion transformer forward passes to 8 steps, but requires 80% sparsity on video-to-video self-attention while text and audio projections remain dense.',
        },
      ],
      retrievalQuery: 'What is the rated maximum board power (TGP) of the primary NeuralDrift Lab RTX 5080 card?',
    },
    prompt:
      'Context:\n[doc-lab-arch-01]: The primary NeuralDrift Lab testbench operates an NVIDIA GeForce RTX 5080 desktop card with 16,384 MiB GDDR7 VRAM on a 256-bit bus, connected to an AMD Ryzen 9 9950X CPU with 64 GiB DDR5-6000 system memory. Maximum board power (TGP) is rated at 360W.\n[doc-fasth3-spec-02]: FastH3 8-Step V2 utilizes data-free DMD2 student distillation...\n\nQuestion: What is the rated maximum board power (TGP) of the primary NeuralDrift Lab RTX 5080 card?',
    expectedResult: {
      type: 'contains_all',
      value: ['360W', 'TGP'],
    },
    generationSettings: {
      temperature: 0.0,
      maxTokens: 120,
      topP: 1.0,
      seed: 42,
    },
  },
  {
    id: 'ND-AGENT-002',
    version: '1.0.0',
    paradigm: 'workload',
    category: 'multi_step',
    name: 'Multi-Step Agent Reasoning & Action (ND-AGENT-002)',
    description:
      'Multi-turn agent workload testing reasoning, sequential tool use, and outcome verification.',
    systemPrompt:
      'You are an autonomous local AI system evaluator. You solve technical problems by chaining tool calls and verifying outputs.',
    prompt:
      'Determine whether a 32GB batch job can fit on the current host. First check available free VRAM using get_system_vram_status, then calculate if available VRAM is greater than or equal to 32GB.',
    tools: [
      {
        name: 'get_system_vram_status',
        description: 'Returns the total and currently free GPU VRAM in megabytes.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'evaluate_fit_status',
        description: 'Records whether the requested workload fits in free VRAM.',
        parameters: {
          type: 'object',
          properties: {
            requestedMb: { type: 'number' },
            availableMb: { type: 'number' },
            fits: { type: 'boolean' },
          },
          required: ['requestedMb', 'availableMb', 'fits'],
        },
      },
    ],
    expectedResult: {
      type: 'tool_call',
      value: {
        toolName: 'evaluate_fit_status',
        arguments: { fits: false },
      },
    },
    generationSettings: {
      temperature: 0.0,
      maxTokens: 256,
      topP: 1.0,
      seed: 42,
    },
  },
  {
    id: 'ND-AUDIO-MUSIC-001',
    version: '1.0.0',
    paradigm: 'raw_inference',
    category: 'creator_audio',
    audioTask: 'music',
    name: 'Fixed-Seed 30 s Instrumental Text-to-Music (ND-AUDIO-MUSIC-001)',
    description:
      'Generates one 30-second instrumental clip from a fixed prompt, seed and fully pinned planner/diffusion settings, then decodes the WAV and checks duration, format and signal level. Measures wall time (model load included), real-time factor, VRAM, RAM and GPU utilization. Different implementations of the same model use different random number generators, so outputs are not expected to be identical across runtimes.',
    prompt: MUSIC_001_PROMPT,
    audioSettings: MUSIC_001_SETTINGS,
    expectedResult: MUSIC_001_EXPECTED,
  },
  {
    id: 'ND-AUDIO-MUSIC-002',
    version: '1.0.0',
    paradigm: 'raw_inference',
    category: 'creator_audio',
    audioTask: 'music',
    name: 'Warm-Session Repeated Text-to-Music, 1 + 10 Iterations (ND-AUDIO-MUSIC-002)',
    description:
      'The exact ND-AUDIO-MUSIC-001 request repeated inside one loaded model session: one warm-up generation, then ten measured generations. Separates start-up and model loading from warm generation time, reports the distribution (median, mean, min, max, standard deviation, coefficient of variation), and tests whether a fixed seed reproduces identical output within a session. Every generated file is decoded and validated.',
    prompt: MUSIC_001_PROMPT,
    session: { warmupIterations: 1, measuredIterations: 10 },
    audioSettings: MUSIC_001_SETTINGS,
    expectedResult: MUSIC_001_EXPECTED,
  },
  {
    id: 'ND-AUDIO-MUSIC-003',
    version: '1.0.0',
    paradigm: 'raw_inference',
    category: 'creator_audio',
    audioTask: 'music',
    name: 'Fixed Audio Codes, Planner Bypassed, 1 + 5 Iterations (ND-AUDIO-MUSIC-003)',
    description:
      'The ND-AUDIO-MUSIC-001 request with the 5 Hz planner removed: a fixed, content-hashed set of 150 ACE-Step semantic audio codes (30 s) is supplied, and chain-of-thought planning is disabled. Isolates the DiT + VAE path, and tests whether each implementation reproduces identical output at a fixed seed once planner sampling is taken out. Runs as one warm session (one warm-up, five measured).',
    prompt: MUSIC_001_PROMPT,
    inputs: [
      {
        role: 'audio_codes',
        optionKey: 'audio_codes',
        path: 'data/benchmark-inputs/nd-audio-music-003-audio-codes.txt',
        sha256: 'd6e89b37adeca98ebc3c790b0f088f30a97ab7afe64e30b03c223426f4557404',
        bytes: 2976,
      },
    ],
    session: { warmupIterations: 1, measuredIterations: 5 },
    audioSettings: {
      ...MUSIC_001_SETTINGS,
      modelOptions: {
        ...MUSIC_001_SETTINGS.modelOptions,
        thinking: false,
        use_cot_metas: false,
        use_cot_caption: false,
        use_cot_language: false,
      },
    },
    expectedResult: MUSIC_001_EXPECTED,
  },
];

export function getWorkloadById(id: string): WorkloadDefinition | undefined {
  return WORKLOAD_SUITE.find((w) => w.id === id);
}
