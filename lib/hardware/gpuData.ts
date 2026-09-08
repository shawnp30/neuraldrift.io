// lib/hardware/gpuData.ts
// Authoritative GPU reference dataset for NeuralDrift compatibility matching.
// Contains common creator GPUs with dedicated VRAM, architecture, and generation.

export interface GPUDefinition {
  id: string; // URL-safe slug e.g. "rtx-5080", "rtx-4070", "rtx-3060-12gb"
  name: string; // Full display name
  shortName: string; // Concise display name
  vendor: "NVIDIA" | "AMD" | "Apple" | "Intel";
  vramGb: number;
  arch: string;
  generation: string;
  type: "desktop" | "laptop";
  notes?: string;
}

export const COMMON_GPUS: GPUDefinition[] = [
  // NVIDIA 50-Series (Blackwell)
  {
    id: "rtx-5090",
    name: "NVIDIA GeForce RTX 5090 (32GB)",
    shortName: "RTX 5090",
    vendor: "NVIDIA",
    vramGb: 32,
    arch: "Blackwell",
    generation: "RTX 50-series",
    type: "desktop",
    notes: "32GB VRAM. Flagship consumer card; fits all tested models and video generation."
  },
  {
    id: "rtx-5080",
    name: "NVIDIA GeForce RTX 5080 (16GB)",
    shortName: "RTX 5080",
    vendor: "NVIDIA",
    vramGb: 16,
    arch: "Blackwell",
    generation: "RTX 50-series",
    type: "desktop",
    notes: "NeuralDrift primary local test hardware. 37 Level-5 runs verified."
  },
  {
    id: "rtx-5070-ti",
    name: "NVIDIA GeForce RTX 5070 Ti (16GB)",
    shortName: "RTX 5070 Ti",
    vendor: "NVIDIA",
    vramGb: 16,
    arch: "Blackwell",
    generation: "RTX 50-series",
    type: "desktop",
    notes: "16GB VRAM on Blackwell architecture."
  },
  {
    id: "rtx-5070",
    name: "NVIDIA GeForce RTX 5070 (12GB)",
    shortName: "RTX 5070",
    vendor: "NVIDIA",
    vramGb: 12,
    arch: "Blackwell",
    generation: "RTX 50-series",
    type: "desktop",
    notes: "12GB VRAM on Blackwell architecture."
  },

  // NVIDIA 40-Series (Ada Lovelace)
  {
    id: "rtx-4090",
    name: "NVIDIA GeForce RTX 4090 (24GB)",
    shortName: "RTX 4090",
    vendor: "NVIDIA",
    vramGb: 24,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "24GB VRAM. Established flagship for high-end local diffusion."
  },
  {
    id: "rtx-4080",
    name: "NVIDIA GeForce RTX 4080 / 4080 Super (16GB)",
    shortName: "RTX 4080",
    vendor: "NVIDIA",
    vramGb: 16,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "16GB VRAM tier on Ada Lovelace."
  },
  {
    id: "rtx-4070-ti-super",
    name: "NVIDIA GeForce RTX 4070 Ti SUPER (16GB)",
    shortName: "RTX 4070 Ti SUPER",
    vendor: "NVIDIA",
    vramGb: 16,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "16GB VRAM tier on Ada Lovelace."
  },
  {
    id: "rtx-4070-ti",
    name: "NVIDIA GeForce RTX 4070 Ti (12GB)",
    shortName: "RTX 4070 Ti",
    vendor: "NVIDIA",
    vramGb: 12,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "12GB VRAM tier on Ada Lovelace."
  },
  {
    id: "rtx-4070",
    name: "NVIDIA GeForce RTX 4070 / 4070 Super (12GB)",
    shortName: "RTX 4070",
    vendor: "NVIDIA",
    vramGb: 12,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "Popular 12GB creator card."
  },
  {
    id: "rtx-4060-ti-16gb",
    name: "NVIDIA GeForce RTX 4060 Ti (16GB)",
    shortName: "RTX 4060 Ti 16GB",
    vendor: "NVIDIA",
    vramGb: 16,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "16GB capacity with 128-bit memory bus."
  },
  {
    id: "rtx-4060-ti-8gb",
    name: "NVIDIA GeForce RTX 4060 Ti (8GB)",
    shortName: "RTX 4060 Ti 8GB",
    vendor: "NVIDIA",
    vramGb: 8,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "8GB VRAM capacity. Requires careful attention to model memory footprint."
  },
  {
    id: "rtx-4060",
    name: "NVIDIA GeForce RTX 4060 (8GB)",
    shortName: "RTX 4060",
    vendor: "NVIDIA",
    vramGb: 8,
    arch: "Ada Lovelace",
    generation: "RTX 40-series",
    type: "desktop",
    notes: "8GB entry card."
  },

  // NVIDIA 30-Series (Ampere)
  {
    id: "rtx-3090",
    name: "NVIDIA GeForce RTX 3090 / 3090 Ti (24GB)",
    shortName: "RTX 3090",
    vendor: "NVIDIA",
    vramGb: 24,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "24GB VRAM budget workstation benchmark."
  },
  {
    id: "rtx-3080-12gb",
    name: "NVIDIA GeForce RTX 3080 (12GB)",
    shortName: "RTX 3080 12GB",
    vendor: "NVIDIA",
    vramGb: 12,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "12GB variant of RTX 3080."
  },
  {
    id: "rtx-3080-10gb",
    name: "NVIDIA GeForce RTX 3080 (10GB)",
    shortName: "RTX 3080 10GB",
    vendor: "NVIDIA",
    vramGb: 10,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "10GB standard model."
  },
  {
    id: "rtx-3070",
    name: "NVIDIA GeForce RTX 3070 / 3070 Ti (8GB)",
    shortName: "RTX 3070",
    vendor: "NVIDIA",
    vramGb: 8,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "8GB VRAM."
  },
  {
    id: "rtx-3060-12gb",
    name: "NVIDIA GeForce RTX 3060 (12GB)",
    shortName: "RTX 3060 12GB",
    vendor: "NVIDIA",
    vramGb: 12,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "Benchmark 12GB budget card widely used for SDXL and ComfyUI."
  },
  {
    id: "rtx-3060-ti",
    name: "NVIDIA GeForce RTX 3060 Ti (8GB)",
    shortName: "RTX 3060 Ti",
    vendor: "NVIDIA",
    vramGb: 8,
    arch: "Ampere",
    generation: "RTX 30-series",
    type: "desktop",
    notes: "8GB VRAM."
  },

  // Older / Budget NVIDIA
  {
    id: "rtx-2080-ti",
    name: "NVIDIA GeForce RTX 2080 Ti (11GB)",
    shortName: "RTX 2080 Ti",
    vendor: "NVIDIA",
    vramGb: 11,
    arch: "Turing",
    generation: "RTX 20-series",
    type: "desktop",
    notes: "11GB VRAM Turing flagship."
  },
  {
    id: "gtx-1080-ti",
    name: "NVIDIA GeForce GTX 1080 Ti (11GB)",
    shortName: "GTX 1080 Ti",
    vendor: "NVIDIA",
    vramGb: 11,
    arch: "Pascal",
    generation: "GTX 10-series",
    type: "desktop",
    notes: "11GB Pascal card. Lacks Tensor cores and fp16/bf16 acceleration."
  },

  // AMD RDNA (With explicit caution notes)
  {
    id: "rx-7900-xtx",
    name: "AMD Radeon RX 7900 XTX (24GB)",
    shortName: "RX 7900 XTX",
    vendor: "AMD",
    vramGb: 24,
    arch: "RDNA 3",
    generation: "Radeon 7000",
    type: "desktop",
    notes: "24GB VRAM. Requires ROCm environment on Linux or DirectML; NeuralDrift records are CUDA-tested."
  },
  {
    id: "rx-7800-xt",
    name: "AMD Radeon RX 7800 XT (16GB)",
    shortName: "RX 7800 XT",
    vendor: "AMD",
    vramGb: 16,
    arch: "RDNA 3",
    generation: "Radeon 7000",
    type: "desktop",
    notes: "16GB VRAM. ROCm/DirectML required; CUDA workflows may not run identically."
  },

  // Apple Silicon
  {
    id: "m4-max",
    name: "Apple M4 Max (48GB Unified)",
    shortName: "Apple M4 Max",
    vendor: "Apple",
    vramGb: 48,
    arch: "Apple Silicon",
    generation: "M-Series",
    type: "laptop",
    notes: "Unified memory via MPS backend. FP8 and certain CUDA-specific custom nodes unsupported."
  }
];

export const VRAM_TIERS: number[] = [6, 8, 10, 11, 12, 16, 24, 32, 48];

export function findGpuBySlug(slug: string): GPUDefinition | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase().replace(/_/g, "-");
  return COMMON_GPUS.find(g => g.id === normalized);
}

export function findGpuByName(query: string): GPUDefinition | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return COMMON_GPUS.find(g => 
    g.id.toLowerCase() === q || 
    g.name.toLowerCase().includes(q) || 
    g.shortName.toLowerCase() === q
  );
}
