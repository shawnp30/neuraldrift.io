// lib/hardware/registry.ts

export type BudgetTier = "entry" | "mid" | "high-end" | "flagship";
export type ModelType = "image" | "video" | "audio" | "llm";

export interface GPUModelCapability {
  name: string;
  type: string;
  notes: string;
}

export interface GPURegistryItem {
  id: string;
  name: string;
  vram: number;
  arch: string;
  tier: BudgetTier;
  type: "desktop" | "laptop";
  tdp?: number;
  msrp?: string;
  verdict: string;
  canHandle: boolean | "limited";
  models: GPUModelCapability[];
  buy_url?: string;
}

export interface Benchmark {
  gpu: string;
  vram: number;
  model: string;
  modelType: "Image" | "Video" | "Training";
  resolution: string;
  steps: number;
  timeSeconds: number;
  imagesPerMinute?: number;
  framesPerSecond?: number;
  precision: string;
  flags: string;
  notes?: string;
}

export interface AIModel {
  id: string;
  name: string;
  vramNeeded: number;
  type: ModelType;
  desc: string;
}

// ─── GPU DATABASE ──────────────────────────────────────────────────────────
export const GPUS: Record<string, GPURegistryItem> = {
  // Desktop GPUs
  "RTX 5090": { 
    id: "5090", name: "RTX 5090", vram: 32, arch: "Blackwell", tier: "flagship", type: "desktop", tdp: 575, msrp: "$1,999",
    verdict: "The absolute beast. Nothing in consumer-land touches this. Run anything you want — full Flux, 70B LLMs quantized, video gen, multi-LoRA stacks. You have zero limitations for local AI work.",
    canHandle: true,
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Full model, no quantization needed. Fast batch generation." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Multiple LoRAs stacked. Train custom LoRAs locally." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "High-res video at full quality. Extended clip lengths." },
    ],
    buy_url: "https://computeatlas.ai/builds/flagship-5090"
  },
  "RTX 5080": { 
    id: "5080", name: "RTX 5080", vram: 16, arch: "Blackwell", tier: "high-end", type: "desktop", tdp: 360, msrp: "$999",
    verdict: "Sweet spot for serious AI creators. 16GB VRAM handles Flux, SDXL, video gen, and 8B LLMs without breaking a sweat.",
    canHandle: true,
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Runs great with FP8 quantization. Near-lossless quality." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "Short clips work well. Medium res recommended." },
    ],
    buy_url: "https://computeatlas.ai/builds/pro-5080"
  },
  "RTX 4090": { 
    id: "4090", name: "RTX 4090", vram: 24, arch: "Ada Lovelace", tier: "flagship", type: "desktop", tdp: 450, msrp: "$1,599",
    verdict: "Still the king for most AI creators. 24GB VRAM means Flux at full precision, video gen, and even 70B LLMs quantized.",
    canHandle: true,
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Runs at full FP16. Excellent speed." },
    ],
    buy_url: "https://computeatlas.ai/builds/4090-pro"
  },
  "RTX 4060 Ti 16GB": { 
    id: "4060ti-16", name: "RTX 4060 Ti 16GB", vram: 16, arch: "Ada Lovelace", tier: "mid", type: "desktop", tdp: 165, msrp: "$449",
    verdict: "The 16GB version is surprisingly capable for the price. VRAM matches high-end cards — you just pay in generation speed.",
    canHandle: true,
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Works. Slower than higher-tier cards." },
    ],
    buy_url: "https://computeatlas.ai/builds/budget-hero"
  },
  "RTX 3060 12GB": { 
    id: "3060-12", name: "RTX 3060 12GB", vram: 12, arch: "Ampere", tier: "entry", type: "desktop", tdp: 170, msrp: "$329",
    verdict: "The budget AI card legend. 12GB VRAM punches way above its price class.",
    canHandle: true,
    models: [
      { name: "SDXL", type: "Image Gen", notes: "12GB VRAM is the saving grace." },
    ],
    buy_url: "https://computeatlas.ai/builds/entry-level"
  },

  // Laptop GPUs
  "Apple M4 Max": { 
    id: "m4-max", name: "Apple M4 Max", vram: 48, arch: "Apple Silicon", tier: "flagship", type: "laptop", 
    verdict: "48GB unified memory rivals workstation GPUs for model compatibility. Remarkably capable for a laptop.",
    canHandle: true,
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Plenty of room. Full quality." },
      { name: "Llama 3.3 70B", type: "LLM", notes: "Near full precision via MLX." },
    ]
  },
  "Apple M2 Pro": { 
    id: "m2-pro", name: "Apple M2 Pro (16GB)", vram: 16, arch: "Apple Silicon", tier: "mid", type: "laptop", 
    verdict: "16GB unified memory handles SDXL and smaller LLMs. Slower than discrete but capable.",
    canHandle: true,
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Works via MPS." },
    ]
  },
  "Laptop RTX 4060": { 
    id: "l4060", name: "Laptop RTX 4060", vram: 8, arch: "Ada Lovelace", tier: "entry", type: "laptop",
    verdict: "8GB mobile is limited. Good for SD 1.5, tight for SDXL. Cloud gen recommended for Flux.",
    canHandle: "limited",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Works fine locally." },
    ]
  }
};

// ─── BENCHMARKS ───────────────────────────────────────────────────────────
export const BENCHMARKS: Benchmark[] = [
  { gpu: "RTX 5090", vram: 32, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, timeSeconds: 4.1, imagesPerMinute: 14.6, precision: "FP8", flags: "--gpu-only --highvram" },
  { gpu: "RTX 5080", vram: 16, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, timeSeconds: 8.1, imagesPerMinute: 7.4, precision: "FP8", flags: "--gpu-only --highvram" },
  { gpu: "RTX 4090", vram: 24, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, timeSeconds: 9.2, imagesPerMinute: 6.5, precision: "FP8", flags: "--gpu-only --highvram" },
  { gpu: "Apple M4 Max", vram: 48, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, timeSeconds: 15.5, imagesPerMinute: 3.8, precision: "MPS", flags: "--unified-memory" },
];

// ─── MODELS ───────────────────────────────────────────────────────────────
export const MODELS: AIModel[] = [
  { id: "flux-dev", name: "Flux Dev", vramNeeded: 12.1, type: "image", desc: "SOTA Open Image Model" },
  { id: "sdxl", name: "SDXL 1.0", vramNeeded: 6.5, type: "image", desc: "Standard High Res Diffusion" },
  { id: "ltx-2.3-22b", name: "LTX Video 2.3 22B", vramNeeded: 24.5, type: "video", desc: "High-Fidelity Video Gen" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B (4-bit)", vramNeeded: 42.0, type: "llm", desc: "SOTA Open Weights Language" },
];

// ─── CLOUD PROVIDERS ───────────────────────────────────────────────────────
export const CLOUD_PROVIDERS = [
  {
    id: "runpod",
    name: "RunPod",
    url: "https://runpod.io?ref=neuraldrift",
    icon: "🖥️",
    tag: "Best Value",
    pricing: "RTX 4090: ~$0.34/hr",
    description: "GPU pods on demand — ComfyUI template, per-second billing"
  },
  {
    id: "vast",
    name: "Vast.ai",
    url: "https://vast.ai?ref=neuraldrift",
    icon: "💰",
    tag: "Cheapest",
    pricing: "RTX 4090: ~$0.20/hr",
    description: "Marketplace of rental GPUs — cheapest hourly rates"
  }
];

// ─── BUDGET TIERS ──────────────────────────────────────────────────────────
export const BUDGET_RECOMMENDATIONS = {
  $500: {
    label: "Cloud-First Strategy",
    focus: "RunPod / Vast.ai Rental",
    recommendation: "At this price point, local hardware will struggle with Flux and Video gen. We recommend offloading 100% of your inference to Cloud Pods while keeping your current PC for browsing and prompt-prep.",
    atlas_link: "https://runpod.io?ref=neuraldrift" // Direct to Cloud instead of PC
  },
  $1500: {
    label: "Mid-Range Creator",
    focus: "Local RTX 4070 Ti Super (16GB)",
    recommendation: "The 'Utility Floor' for local AI build. A workstation with 16GB VRAM is the minimum we recommend for a seamless ComfyUI experience with Flux Dev.",
    atlas_link: "https://computeatlas.ai/builds/pro-creator"
  },
  $3000: {
    label: "Pro Flagship",
    focus: "Dual RTX 3090 or Single 5090 (24GB+)",
    recommendation: "Maximum local VRAM throughput. Zero compromises. For creators who need absolute privacy and peak local performance for multi-day training runs.",
    atlas_link: "https://computeatlas.ai/builds/flagship-monsters"
  }
};
