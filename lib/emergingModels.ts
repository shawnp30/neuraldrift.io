// Tracking layer for models/workflows NeuralDrift has investigated but has not yet
// integrated into the full CATALOG/WORKFLOW_ASSETS system — either because no official,
// stock-ComfyUI-runnable workflow JSON exists yet, or because the required dependencies
// or model weights have not been installed and execution-tested on Lab hardware.
//
// This is deliberately lighter than a CATALOG entry: CATALOG assumes a real downloadable
// JSON graph with a matching WORKFLOW_ASSETS manifest (see lib/catalog.ts). A tracked
// model graduates into CATALOG once it has both of those and a real execution record.
//
// Reuse this for any future "we know about this, here's what's verified so far" case —
// it is not FastH3-specific.

export type TrackedModelStatus =
  | "discovered" // named/found upstream, not yet independently verified
  | "documented" // requirements, capabilities and sources verified against primary sources
  | "dependency_verified" // required backend/runtime confirmed installable/compatible on Lab hardware
  | "execution_tested" // ran successfully at least once on Lab hardware
  | "benchmarked" // execution-tested with recorded timing/VRAM measurements
  | "level_5_verified"; // current, hash-matched, successful execution — NeuralDrift's top tier (see lib/hardware/executions.ts)

export type ClaimBasis = "neuraldrift_tested" | "upstream_claim" | "community_reported" | "unknown";

export interface SourceCitation {
  label: string;
  url: string;
  kind: "official_repo" | "official_model_card" | "official_docs" | "official_blog" | "community";
}

export interface GpuCompatibilityRow {
  label: string;
  basis: ClaimBasis;
  note: string;
}

export interface ComparisonRow {
  metric: string;
  baseValue: string;
  trackedValue: string;
  basis: ClaimBasis;
}

export interface RelatedProject {
  name: string;
  relationship: string;
  sourceUrl: string;
}

export interface TrackedModel {
  slug: string;
  name: string;
  shortName: string;
  status: TrackedModelStatus;
  statusReason: string;
  summary: string;
  baseModel: { name: string; note: string } | null;
  capabilities: { supported: string[]; notSupported: string[] };
  distillation: { method: string; sparsity: string; steps: number; schedulerNote: string } | null;
  requirements: {
    attentionBackend: string;
    approxWeightSize: string;
    approxWeightSizeBasis: string;
    comfyUiNative: boolean;
    comfyUiNote: string;
    dependencies: string[];
  };
  sources: SourceCitation[];
  gpuCompatibility: GpuCompatibilityRow[];
  comparisonToBase: ComparisonRow[];
  limitations: { text: string; basis: ClaimBasis }[];
  neuralDriftLabStatus: string;
  relatedProjects: RelatedProject[];
  tags: string[];
}

export const FASTH3_8_STEP_V2: TrackedModel = {
  slug: "fasth3-8-step-v2",
  name: "FastVideo FastH3 8-Step V2",
  shortName: "FastH3 8-Step V2",
  status: "documented",
  statusReason:
    "Official sources reviewed and requirements verified. No local dependency install or execution attempt has been made — see NeuralDrift Lab status below.",
  summary:
    "FastH3 8-Step V2 is FastVideo's (Hao AI Lab @ UCSD) distilled version of MiniMax-H3, replacing H3's diffusion transformer with a student model trained via data-free DMD2 distillation combined with VSA-H3 sparse attention, cutting inference to 8 transformer forward passes instead of H3's standard range.",
  baseModel: {
    name: "MiniMax-H3",
    note:
      "MiniMax-H3 (MiniMaxAI) is NeuralDrift's existing base model coverage — a text/reference-to-video-with-audio model with native ComfyUI support (Comfy-Org/ComfyUI PR #15224) and official Comfy-Org workflow templates. FastH3 does not replace this coverage; it is tracked separately.",
  },
  capabilities: {
    supported: [
      "Text-to-video with synchronized audio (documented by FastVideo and ComfyUI)",
      "Image-to-video with optional first/last-frame conditioning (documented by current official ComfyUI templates)",
    ],
    notSupported: [
      "Reference-to-video (identity/style/voice lock) — not distilled, per current official ComfyUI documentation",
    ],
  },
  distillation: {
    method: "Data-free DMD2 (Distribution Matching Distillation) student trained against a frozen MiniMax-H3 teacher",
    sparsity: "VSA-H3 sparse attention, 80% sparsity on video-to-video attention (text/audio stay dense)",
    steps: 8,
    schedulerNote: "Video scheduler shift is 10 (base MiniMax-H3 uses 12) — the trained schedule loads from the checkpoint itself, it is not a manual setting to copy from base H3 workflows.",
  },
  requirements: {
    attentionBackend:
      "FastVideo's VSA-H3 backend for the upstream reference stack; ComfyUI's BlockSparseAttention node in the official FastH3 templates",
    approxWeightSize: "~70GB (computed, not an official figure)",
    approxWeightSizeBasis:
      "Hugging Face metadata reports about 35B BF16 parameters across the original repository. Multiplying that count by 2 bytes estimates roughly 70GB of BF16 weight tensors; this is arithmetic, not an official minimum-VRAM figure or a NeuralDrift measurement. The official ComfyUI package uses a separately named pruned INT8 diffusion model plus shared components, and its documentation does not state a minimum GPU VRAM requirement.",
    comfyUiNative: true,
    comfyUiNote:
      "Current official ComfyUI documentation provides FastVideo FastH3 8-Step V2 text-to-video and image-to-video templates, using the Comfy-Org-repacked FastVideo-FastH3-Comfy diffusion model and shared H3 components. This official integration has not been installed or run by NeuralDrift, so no local compatibility, VRAM, generation-time, or A/V-sync conclusion is implied.",
    dependencies: [
      "ComfyUI 0.36.0 or later, the official FastH3 templates, the Comfy-Org-repacked FastH3 diffusion model, and shared MiniMax H3 text encoder and VAEs",
      "Alternatively, FastVideo's own reference stack: FastVideo + VSA-H3 via uv using the documented CUDA 13 / Blackwell path",
      "FastVideo's tested reference defaults use four NVIDIA B200 GPUs; this is not an RTX 5080 compatibility claim",
      "The upstream multi-GPU guidance says the GPU count must divide H3's 56 attention heads; this is irrelevant to a single-GPU setup",
    ],
  },
  sources: [
    { label: "FastVideo/FastVideo-FastH3-8-Step-V2 (official model card)", url: "https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2", kind: "official_model_card" },
    { label: "Hao AI Lab @ UCSD — FastH3 technical writeup", url: "https://haoailab.com/blogs/fasth3-preview/", kind: "official_blog" },
    { label: "MiniMaxAI/MiniMax-H3 (official base model)", url: "https://huggingface.co/MiniMaxAI/MiniMax-H3", kind: "official_model_card" },
    { label: "ComfyUI docs — MiniMax H3 video generation guide (base model; does not mention FastH3)", url: "https://docs.comfy.org/tutorials/video/minimax/minimax-h3", kind: "official_docs" },
    { label: "ComfyUI docs — FastVideo FastH3 workflow examples", url: "https://docs.comfy.org/tutorials/video/minimax/minimax-h3-fastvideo", kind: "official_docs" },
    { label: "Comfy-Org/FastVideo-FastH3-Comfy (official ComfyUI repack)", url: "https://huggingface.co/FastVideo/FastVideo-FastH3-Comfy", kind: "official_repo" },
    { label: "Comfy-Org/MiniMax-H3 (official base model files hosted for ComfyUI)", url: "https://huggingface.co/Comfy-Org/MiniMax-H3", kind: "official_repo" },
  ],
  gpuCompatibility: [
    { label: "RTX 50-series (Blackwell) — incl. RTX 5080", basis: "unknown", note: "FastVideo's tested reference defaults use four B200 GPUs. The current official ComfyUI FastH3 guide does not make a per-GPU compatibility statement, and NeuralDrift has not installed or run FastH3 on the RTX 5080 Lab machine." },
    { label: "RTX 40-series (Ada Lovelace) / RTX 30-series (Ampere)", basis: "unknown", note: "No official or community report found confirming or ruling out VSA-H3 backend compatibility on non-Blackwell architectures." },
    { label: "AMD / Apple Silicon", basis: "unknown", note: "VSA-H3 is described as a CUDA-compiled backend; no ROCm or Metal/MPS port was found during source review." },
  ],
  comparisonToBase: [
    { metric: "Transformer forward passes", baseValue: "Base H3 schedule", trackedValue: "8", basis: "upstream_claim" },
    { metric: "Attention sparsity", baseValue: "Dense", trackedValue: "80% sparse (VSA-H3, video-to-video only)", basis: "upstream_claim" },
    { metric: "Capabilities", baseValue: "Text-to-video, image-to-video, first/last-frame, reference-to-video, audio sync", trackedValue: "Text-to-video and image-to-video with optional first/last-frame; no reference-to-video", basis: "upstream_claim" },
    { metric: "Generation time (RTX 5080)", baseValue: "No Evidence Yet", trackedValue: "No Evidence Yet", basis: "unknown" },
    { metric: "Peak VRAM (RTX 5080)", baseValue: "No Evidence Yet", trackedValue: "No Evidence Yet", basis: "unknown" },
    { metric: "Motion quality / fine detail", baseValue: "No Evidence Yet", trackedValue: "Below base H3 per the developers' own ablations (see Known limitations)", basis: "upstream_claim" },
    { metric: "Audio quality", baseValue: "No Evidence Yet", trackedValue: "May be below base H3 per the developers' own disclosure", basis: "upstream_claim" },
    { metric: "Setup complexity", baseValue: "Native ComfyUI support, official Comfy-Org templates", trackedValue: "Official ComfyUI 0.36+ templates; FastVideo's alternate reference stack uses VSA-H3", basis: "upstream_claim" },
    { metric: "RTX 5080 status", baseValue: "No FastH3 comparison run recorded", trackedValue: "Not tested", basis: "unknown" },
  ],
  limitations: [
    { text: "The developers explicitly disclose: \"Difficult motion, fine detail, and some audio may remain below the base MiniMax H3 model.\"", basis: "upstream_claim" },
    { text: "Reference-to-video is not distilled for the official FastH3 ComfyUI integration; use base MiniMax-H3 workflows for reference-based generation.", basis: "upstream_claim" },
    { text: "The current official ComfyUI templates have not been installed or executed by NeuralDrift. Their RTX 5080 compatibility, VRAM use, generation time, and A/V sync are unverified.", basis: "unknown" },
    { text: "The approximately 70GB BF16 figure is a calculation from upstream parameter metadata, not an official minimum-VRAM requirement or a NeuralDrift measurement.", basis: "unknown" },
  ],
  neuralDriftLabStatus:
    "NOT TESTED. NeuralDrift reviewed FastH3 8-Step V2's official FastVideo and ComfyUI sources, but has not downloaded its weights, installed either documented path, or attempted a generation on the RTX 5080 Lab machine. The roughly 70GB BF16 number is an arithmetic estimate for the original repository's reported parameter count, not a minimum-VRAM requirement. The official ComfyUI package uses a separately named pruned INT8 diffusion model, but NeuralDrift has not measured its total memory use or verified RTX 5080 compatibility. This status will be updated only after a real NeuralDrift execution.",
  relatedProjects: [
    {
      name: "MiniMax H3 Turbo (Lightx2v + ModelTC)",
      relationship:
        "A separate, unrelated distillation effort — a LoRA applied to the existing base H3 checkpoint rather than a full model swap. Community reporting describes it as running with native ComfyUI support and no custom node required, including an 8-step Ref2VA variant. This is a different project from FastVideo's FastH3 and should not be confused with it.",
      sourceUrl: "https://comfyui-wiki.com/en/news/2026-09-04-minimax-h3-turbo-ref2v-8step",
    },
    {
      name: "FastH3 4-Step Preview v1 (community GGUF)",
      relationship:
        "An earlier, separate FastVideo release (not the 8-Step V2 covered on this page) that has a community GGUF quantization and a documented (if involved) ComfyUI path via a custom-compiled attention node.",
      sourceUrl: "https://huggingface.co/realrebelai/FastH3_GGUFs",
    },
  ],
  tags: [
    "FastH3", "FastVideo", "MiniMax H3", "MiniMax-H3", "text-to-video", "synchronized audio",
    "audio-video", "ComfyUI", "local AI", "video generation", "sparse attention", "VSA-H3",
    "DMD2", "distillation", "RTX 50", "Blackwell", "16GB VRAM", "not yet tested",
  ],
};

export const TRACKED_MODELS: TrackedModel[] = [FASTH3_8_STEP_V2];

export function getTrackedModels(): TrackedModel[] {
  return TRACKED_MODELS;
}

export function getTrackedModelBySlug(slug: string): TrackedModel | undefined {
  return TRACKED_MODELS.find((m) => m.slug === slug);
}
