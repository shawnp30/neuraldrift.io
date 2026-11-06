// lib/runtimes.ts
// Local-AI runtimes as first-class entities. Evidence (what NeuralDrift has proved) and everyday
// maturity (whether the tool is practically usable on the NeuralDrift workstation) are separate axes.

import type { EvidenceClass } from './intelligence';

export type EverydayMaturity =
  | 'DISCOVERED'
  | 'RESEARCHED'
  | 'INSTALLABLE'
  | 'INSTALLED'
  | 'TESTED'
  | 'BENCHMARKED'
  | 'VERIFIED'
  | 'EVERYDAY_READY'
  | 'PRIMARY_TOOL'
  | 'DEPRECATED'
  | 'BLOCKED';

export interface RuntimeFact {
  label: string;
  value: string;
  evidenceClass: EvidenceClass;
  sourceUrl?: string;
  checkedAt: string;
}

export interface RuntimeEntry {
  slug: string;
  name: string;
  summary: string;
  license: string;                          // Runtime license only; models carry their own
  repository: string;
  platforms: string;
  evidence: { level: EvidenceClass; summary: string; href?: string };
  everyday: { maturity: EverydayMaturity; summary: string };
  facts: RuntimeFact[];
  knownIssues: string[];
}

export const RUNTIMES: RuntimeEntry[] = [
  {
    slug: 'audio-cpp',
    name: 'audio.cpp',
    summary: 'C++/ggml inference engine for 80+ audio model families (TTS, ASR, voice conversion, separation, music) with a CLI, an OpenAI-style HTTP server and an embedded WebUI.',
    license: 'Apache-2.0',
    repository: 'https://github.com/0xShug0/audio.cpp',
    platforms: 'Windows, Linux, macOS; CUDA, Vulkan, Metal, HIP, CPU',
    evidence: { level: 'NEURALDRIFT_VERIFIED', summary: 'ACE-Step 1.5 Turbo executed and benchmarked on the RTX 5080 (cold runs, warm sessions, memory configurations).', href: '/lab/audio' },
    everyday: { maturity: 'EVERYDAY_READY', summary: 'Installed with a one-click launcher, health check, local-only WebUI and the measured-fast mem_saver configuration.' },
    facts: [
      { label: 'Version tested', value: '0.8.2-audio8-perf-hotfix (commit ac16661d), Windows CUDA 13.3 build', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' },
      { label: 'Blackwell kernels', value: 'CUDA 13.3 Windows build targets architectures 75–120', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/0xShug0/audio.cpp/blob/ac16661d/.github/workflows/release.yml', checkedAt: '2026-09-27' },
      { label: 'Unknown request options', value: 'Silently ignored by audiocpp_cli (NeuralDrift allow-lists options to fail closed)', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' },
      { label: 'Request-sequence option mapping', value: 'Model options must be nested under "options"; top-level keys outside a fixed list are dropped', evidenceClass: 'NEURALDRIFT_VERIFIED', sourceUrl: 'https://github.com/0xShug0/audio.cpp/blob/ac16661d/app/cli/request.cpp', checkedAt: '2026-09-28' },
    ],
    knownIssues: [
      'On 16 GB, occasional cold runs spilled VRAM into shared system memory and ran slower; ace_step.mem_saver=true lowered peak VRAM by about 1.8–2.8 GiB with byte-identical output.',
      'In --request-sequence JSON, model options are read only from each item\'s nested "options" object; other top-level keys are silently dropped (app/cli/request.cpp). With options nested correctly, the sequence path reproduces the single-run CLI output byte for byte.',
    ],
  },
  {
    slug: 'ace-step-python',
    name: 'ACE-Step 1.5 (Python reference)',
    summary: 'The upstream PyTorch implementation of ACE-Step 1.5 with Gradio UI and REST API.',
    license: 'MIT',
    repository: 'https://github.com/ace-step/ACE-Step-1.5',
    platforms: 'Windows, Linux, macOS; CUDA, ROCm, MPS, XPU, CPU',
    evidence: { level: 'NEURALDRIFT_VERIFIED', summary: 'Executed on the RTX 5080 as the comparison baseline (cold runs and a warm session).', href: '/lab/audio' },
    everyday: { maturity: 'INSTALLED', summary: "The owner's existing installation; NeuralDrift uses it read-only and has not packaged it." },
    facts: [
      { label: 'Version tested', value: 'ace-step 1.5.0 (git 6d467e4), torch 2.7.1+cu128', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' },
      { label: 'Planner backend on Windows', value: 'nano-vllm unavailable without Triton; falls back to PyTorch', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' },
    ],
    knownIssues: ['A fixed seed did not reproduce identical audio across runs, even within one warm session; the planner generated different audio codes each time.'],
  },
  {
    slug: 'comfyui',
    name: 'ComfyUI',
    summary: 'Node-graph runtime for image, video, audio and 3D diffusion workflows; NeuralDrift\'s workflow executions run on it.',
    license: 'GPL-3.0',
    repository: 'https://github.com/Comfy-Org/ComfyUI',
    platforms: 'Windows, Linux, macOS',
    evidence: { level: 'NEURALDRIFT_VERIFIED', summary: 'Workflow executions recorded with hashed graphs on the RTX 5080.', href: '/compatibility' },
    everyday: { maturity: 'INSTALLED', summary: 'Two installs on the workstation: ComfyUI Desktop 0.37.0 and a git install at 0.33.0.' },
    facts: [
      { label: 'Current upstream release', value: 'v0.37.0 (2026-09-21)', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.37.0', checkedAt: '2026-09-28' },
      { label: 'MiniMax-H3 VAE optimizations', value: 'Released in v0.36.0 (PR #16187); VAE-only', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/Comfy-Org/ComfyUI/pull/16187', checkedAt: '2026-09-28' },
      { label: 'Native TRELLIS.2 nodes', value: 'Present in the local 0.37.0 install', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' },
    ],
    knownIssues: [],
  },
  {
    slug: 'wangp',
    name: 'WanGP',
    summary: 'Low-VRAM video (and audio) generation UI for Wan and related models.',
    license: 'WanGP Community License 2.0',
    repository: 'https://github.com/deepbeepmeep/Wan2GP',
    platforms: 'Windows, Linux',
    evidence: { level: 'UNKNOWN', summary: 'Not yet benchmarked by NeuralDrift.' },
    everyday: { maturity: 'INSTALLED', summary: 'Installed at D:\\AI\\WanGP (WanGP 13.02); used by the owner.' },
    facts: [{ label: 'Installed version', value: 'WanGP 13.02 (git 09a6c1d)', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' }],
    knownIssues: [],
  },
  {
    slug: 'llama-cpp',
    name: 'llama.cpp (Unsloth Studio build)',
    summary: 'GGUF LLM inference server used by Unsloth Studio on the workstation.',
    license: 'MIT',
    repository: 'https://github.com/ggml-org/llama.cpp',
    platforms: 'Windows, Linux, macOS',
    evidence: { level: 'UNKNOWN', summary: 'Not yet benchmarked by NeuralDrift.' },
    everyday: { maturity: 'INSTALLED', summary: 'Runs under Unsloth Studio; observed serving a 27B GGUF model.' },
    facts: [{ label: 'Installed version', value: '0.5.0-dev build 11160 (commit a3c12db9d), MSVC build by Unsloth', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' }],
    knownIssues: [],
  },
  {
    slug: 'lm-studio',
    name: 'LM Studio',
    summary: 'Desktop LLM runner with an OpenAI-compatible local server.',
    license: 'Proprietary (free to use; see terms)',
    repository: 'https://lmstudio.ai',
    platforms: 'Windows, Linux, macOS',
    evidence: { level: 'NEURALDRIFT_MEASURED', summary: 'Two historical LLM/agent benchmark records (2026-09-17).', href: '/lab' },
    everyday: { maturity: 'INSTALLED', summary: 'CLI present (lms, commit 69d945a); the app version was not recorded by the historical runs.' },
    facts: [{ label: 'Version in historical records', value: '"0.3.9" was a hard-coded value, not a detected version; new runs report the detected or supplied version', evidenceClass: 'NEURALDRIFT_VERIFIED', checkedAt: '2026-09-28' }],
    knownIssues: [],
  },
  {
    slug: 'vllm',
    name: 'vLLM',
    summary: 'High-throughput LLM serving engine with consumer-Blackwell (SM120) quantization paths.',
    license: 'Apache-2.0',
    repository: 'https://github.com/vllm-project/vllm',
    platforms: 'Linux (Windows via WSL or community forks)',
    evidence: { level: 'UPSTREAM_VERIFIED', summary: 'Release notes reviewed; not installed or tested by NeuralDrift.' },
    everyday: { maturity: 'RESEARCHED', summary: 'Needs an isolated WSL environment before any test.' },
    facts: [
      { label: 'Current release', value: 'v0.30.0 (2026-09-22)', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/vllm-project/vllm/releases/tag/v0.30.0', checkedAt: '2026-09-28' },
      { label: 'SM120/121 defaults', value: 'W4A4 NVFP4 preferred; B12X causal paged attention available', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/vllm-project/vllm/releases/tag/v0.30.0', checkedAt: '2026-09-28' },
      { label: 'Windows', value: 'Not supported natively', evidenceClass: 'UPSTREAM_VERIFIED', sourceUrl: 'https://github.com/vllm-project/vllm/blob/v0.30.0/docs/getting_started/installation/gpu.md', checkedAt: '2026-09-28' },
    ],
    knownIssues: [],
  },
];

export const MATURITY_LABEL: Record<EverydayMaturity, string> = {
  DISCOVERED: 'Discovered',
  RESEARCHED: 'Researched',
  INSTALLABLE: 'Installable',
  INSTALLED: 'Installed',
  TESTED: 'Tested',
  BENCHMARKED: 'Benchmarked',
  VERIFIED: 'Verified',
  EVERYDAY_READY: 'Everyday-ready',
  PRIMARY_TOOL: 'Primary tool',
  DEPRECATED: 'Deprecated',
  BLOCKED: 'Blocked',
};
