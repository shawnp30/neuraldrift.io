// lib/benchmarks/workloads.ts
// Standardized, versioned workload suite for the NeuralDrift Local AI Benchmark Framework.

import type { WorkloadDefinition } from './types';

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
];

export function getWorkloadById(id: string): WorkloadDefinition | undefined {
  return WORKLOAD_SUITE.find((w) => w.id === id);
}
