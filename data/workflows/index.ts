// ── Workflow Data Model ──────────────────────────────────────────────────────
// This is the single source of truth for all workflows on neuraldrift.io.
// Each workflow has full metadata, hardware profiles, required models,
// configurable parameters, and a reference to its ComfyUI JSON template.

export type WorkflowCategory =
  | "Image"
  | "Video"
  | "Animation"
  | "Training"
  | "Upscale";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type HardwareTier = "8gb" | "12gb" | "16gb" | "24gb";

export interface HardwareProfile {
  tier: HardwareTier;
  label: string;
  vram: string;
  gpuExamples: string[];
  width: number;
  height: number;
  steps: number;
  cfg: number;
  denoise: number;
  sampler: string;
  scheduler: string;
  batchSize: number;
  frames?: number;
  motionScale?: number;
  extraFlags: string[];
  qualityNote: string;
  estimatedTime: string;
}

export interface RequiredModel {
  name: string;
  type: "checkpoint" | "lora" | "vae" | "controlnet" | "upscaler" | "motion";
  filename: string;
  sizeGB: number;
  downloadUrl: string;
  required: boolean;
  notes?: string;
}

export interface WorkflowParam {
  id: string;
  label: string;
  type: "select" | "range" | "number" | "text" | "toggle";
  default: string | number | boolean;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  description: string;
  affects: string; // what it changes in the output
}

export interface TroubleshootingItem {
  problem: string;
  solution: string;
}

export interface Workflow {
  id: string;
  version: string;
  title: string;
  tagline: string;
  description: string;
  purpose: string;
  whoItsFor: string[];
  category: WorkflowCategory;
  difficulty: Difficulty;
  tags: string[];
  hardwareProfiles: Record<HardwareTier, HardwareProfile>;
  requiredModels: RequiredModel[];
  setupSteps: string[];
  configurableParams: WorkflowParam[];
  troubleshooting: TroubleshootingItem[];
  templateFile: string;
  previewOutputs: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Workflow Definitions ─────────────────────────────────────────────────────

export const WORKFLOWS: Workflow[] = [
  {
    id: "ltx-cinematic-chase",
    version: "2.3.1",
    title: "LTX Cinematic Chase Sequence",
    tagline: "Hollywood-style action clips for Shorts & TikTok",
    description:
      "A five-clip vertical video pipeline built around LTX Video 2.3. Produces cinematic chase and action sequences with consistent motion, camera lock, and temporal coherence between clips. Optimized for short-form vertical content.",
    purpose:
      "Generate cinematic action video clips for YouTube Shorts, TikTok, and Instagram Reels.",
    whoItsFor: [
      "Short-form content creators",
      "AI video experimenters",
      "Anyone building a character-driven video channel",
      "ComfyUI users who want pre-tuned video settings",
    ],
    category: "Video",
    difficulty: "Advanced",
    tags: [
      "LTX Video",
      "Action",
      "Chase",
      "Vertical",
      "Short-form",
      "Cinematic",
    ],
    hardwareProfiles: {
      "8gb": {
        tier: "8gb",
        label: "8GB Safe",
        vram: "8GB",
        gpuExamples: ["RTX 3070", "RTX 3060 Ti", "RTX 4060"],
        width: 512,
        height: 512,
        steps: 20,
        cfg: 3.0,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "beta",
        batchSize: 1,
        frames: 49,
        motionScale: 1.0,
        extraFlags: ["--lowvram", "--cpu-vae"],
        qualityNote:
          "Reduced resolution and frames. Motion quality slightly lower but still usable.",
        estimatedTime: "45–90s per clip",
      },
      "12gb": {
        tier: "12gb",
        label: "12GB Balanced",
        vram: "12GB",
        gpuExamples: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 10GB"],
        width: 512,
        height: 768,
        steps: 25,
        cfg: 3.0,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "beta",
        batchSize: 1,
        frames: 65,
        motionScale: 1.2,
        extraFlags: ["--lowvram"],
        qualityNote:
          "Good quality at reduced resolution. Full vertical aspect ratio.",
        estimatedTime: "25–45s per clip",
      },
      "16gb": {
        tier: "16gb",
        label: "16GB High Quality",
        vram: "16GB",
        gpuExamples: [
          "RTX 5080",
          "RTX 3080 16GB",
          "RTX 4080 Super",
          "RTX 4070 Ti",
        ],
        width: 512,
        height: 768,
        steps: 25,
        cfg: 3.0,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "beta",
        batchSize: 1,
        frames: 97,
        motionScale: 1.3,
        extraFlags: ["--gpu-only"],
        qualityNote:
          "Full 97-frame clips at recommended resolution. Best balance of quality and speed.",
        estimatedTime: "5–18s per clip",
      },
      "24gb": {
        tier: "24gb",
        label: "24GB Max Quality",
        vram: "24GB",
        gpuExamples: ["RTX 4090", "RTX 3090", "RTX 3090 Ti"],
        width: 768,
        height: 1024,
        steps: 30,
        cfg: 3.5,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "beta",
        batchSize: 1,
        frames: 97,
        motionScale: 1.4,
        extraFlags: ["--gpu-only", "--highvram"],
        qualityNote: "Maximum resolution and frames. Highest motion quality.",
        estimatedTime: "4–8s per clip",
      },
    },
    requiredModels: [
      {
        name: "LTX Video 2.3",
        type: "checkpoint",
        filename: "ltx-video-2b-v0.9.1.safetensors",
        sizeGB: 9.4,
        downloadUrl: "https://huggingface.co/Lightricks/LTX-Video",
        required: true,
        notes: "Place in ComfyUI/models/checkpoints/",
      },
      {
        name: "LTX VAE",
        type: "vae",
        filename: "ltxv-spatial-vae-small-2b-v0.9.1.safetensors",
        sizeGB: 0.5,
        downloadUrl: "https://huggingface.co/Lightricks/LTX-Video",
        required: true,
        notes: "Place in ComfyUI/models/vae/",
      },
    ],
    setupSteps: [
      "Download LTX Video 2.3 checkpoint and VAE from Hugging Face",
      "Place checkpoint in ComfyUI/models/checkpoints/",
      "Place VAE in ComfyUI/models/vae/",
      "Install ComfyUI-VideoHelperSuite via ComfyUI Manager",
      "Select your hardware profile below",
      "Customize your prompt and settings",
      "Click Export JSON and load into ComfyUI",
    ],
    configurableParams: [
      {
        id: "positive_prompt",
        label: "Scene Prompt",
        type: "text",
        default:
          "Low tracking shot following a motorcycle weaving through traffic on a rain-soaked highway at night, motion blur, neon reflections, cinematic",
        description:
          "Describe the action, camera movement, environment, and lighting.",
        affects: "CLIPTextEncode positive",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        default:
          "static camera, no movement, blurry subject, distorted, watermark, text",
        description: "What to avoid in the output.",
        affects: "CLIPTextEncode negative",
      },
      {
        id: "motion_scale",
        label: "Motion Scale",
        type: "range",
        default: 1.3,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        description:
          "Higher = more movement. 1.0 is neutral. Above 1.5 can cause artifacts.",
        affects: "LTXVideo motion_scale",
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
        description: "Set to -1 for random. Fix a seed to reproduce results.",
        affects: "KSampler seed",
      },
    ],
    troubleshooting: [
      {
        problem: "CUDA out of memory",
        solution:
          "Switch to a lower hardware profile or reduce frames from 97 to 49.",
      },
      {
        problem: "Flickering between frames",
        solution: "Lower motion scale to 0.8 and increase steps to 30.",
      },
      {
        problem: "Subject morphing mid-clip",
        solution: "Add more detail to negative prompt. Reduce CFG below 3.0.",
      },
      {
        problem: "Slow generation on 16GB",
        solution:
          "Ensure --gpu-only flag is set and no other GPU processes are running.",
      },
      {
        problem: "Black or corrupted frames",
        solution:
          "Verify LTX VAE is loaded correctly. Check ComfyUI console for VAE errors.",
      },
    ],
    templateFile: "ltx-cinematic-chase.json",
    previewOutputs: [],
    createdAt: "2025-03-01",
    updatedAt: "2025-03-15",
  },

  {
    id: "flux-portrait-lora",
    version: "1.4.0",
    title: "FLUX Portrait + LoRA Injection",
    tagline: "High-quality character portraits with custom LoRA support",
    description:
      "A complete portrait generation pipeline for FLUX Dev FP8 with LoRA injection, face detailing pass, and prompt weighting. Produces consistent character outputs with full control over style, lighting, and composition.",
    purpose:
      "Generate professional-quality character portraits using FLUX with custom LoRA models.",
    whoItsFor: [
      "Character designers and concept artists",
      "Content creators building consistent character identities",
      "Anyone with a trained character LoRA",
      "FLUX users wanting a production-ready portrait workflow",
    ],
    category: "Image",
    difficulty: "Intermediate",
    tags: ["FLUX", "Portrait", "LoRA", "Character", "Face Detail"],
    hardwareProfiles: {
      "8gb": {
        tier: "8gb",
        label: "8GB Safe",
        vram: "8GB",
        gpuExamples: ["RTX 3070", "RTX 4060", "RTX 3060 Ti"],
        width: 512,
        height: 512,
        steps: 20,
        cfg: 3.5,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "simple",
        batchSize: 1,
        extraFlags: ["--lowvram", "--cpu-vae"],
        qualityNote:
          "Reduced resolution. Requires FLUX GGUF Q4 instead of FP8.",
        estimatedTime: "45–90s per image",
      },
      "12gb": {
        tier: "12gb",
        label: "12GB Balanced",
        vram: "12GB",
        gpuExamples: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 10GB"],
        width: 768,
        height: 1024,
        steps: 20,
        cfg: 3.5,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "simple",
        batchSize: 1,
        extraFlags: ["--lowvram"],
        qualityNote:
          "Good portrait quality at reduced resolution. FP8 recommended.",
        estimatedTime: "20–35s per image",
      },
      "16gb": {
        tier: "16gb",
        label: "16GB High Quality",
        vram: "16GB",
        gpuExamples: [
          "RTX 5080",
          "RTX 3080 16GB",
          "RTX 4080",
          "RTX 4070 Ti Super",
        ],
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 3.5,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "simple",
        batchSize: 1,
        extraFlags: ["--gpu-only"],
        qualityNote:
          "Full 1024×1024 quality. Recommended setting for most users.",
        estimatedTime: "8–12s per image",
      },
      "24gb": {
        tier: "24gb",
        label: "24GB Max Quality",
        vram: "24GB",
        gpuExamples: ["RTX 4090", "RTX 3090"],
        width: 1024,
        height: 1344,
        steps: 25,
        cfg: 3.5,
        denoise: 1.0,
        sampler: "euler",
        scheduler: "simple",
        batchSize: 2,
        extraFlags: ["--gpu-only", "--highvram"],
        qualityNote:
          "High-res portraits with batch generation. Maximum detail.",
        estimatedTime: "6–10s per image",
      },
    },
    requiredModels: [
      {
        name: "FLUX Dev FP8",
        type: "checkpoint",
        filename: "flux1-dev-fp8.safetensors",
        sizeGB: 12.1,
        downloadUrl: "https://huggingface.co/Comfy-Org/flux1-dev",
        required: true,
        notes: "Place in ComfyUI/models/checkpoints/",
      },
      {
        name: "CLIP-L",
        type: "checkpoint",
        filename: "clip_l.safetensors",
        sizeGB: 0.2,
        downloadUrl: "https://huggingface.co/comfyanonymous/flux_text_encoders",
        required: true,
        notes: "Place in ComfyUI/models/clip/",
      },
      {
        name: "T5XXL FP16",
        type: "checkpoint",
        filename: "t5xxl_fp16.safetensors",
        sizeGB: 9.3,
        downloadUrl: "https://huggingface.co/comfyanonymous/flux_text_encoders",
        required: true,
        notes: "Place in ComfyUI/models/clip/",
      },
      {
        name: "Character LoRA",
        type: "lora",
        filename: "your_lora.safetensors",
        sizeGB: 0.4,
        downloadUrl: "",
        required: false,
        notes: "Optional. Place in ComfyUI/models/loras/",
      },
    ],
    setupSteps: [
      "Download FLUX Dev FP8, CLIP-L, and T5XXL from Hugging Face",
      "Place models in correct ComfyUI subdirectories",
      "Optional: place your character LoRA in ComfyUI/models/loras/",
      "Select your hardware profile",
      "Set your LoRA filename and strength if using one",
      "Write your portrait prompt",
      "Export JSON and load into ComfyUI",
    ],
    configurableParams: [
      {
        id: "positive_prompt",
        label: "Portrait Prompt",
        type: "text",
        default:
          "Portrait photo of a person, professional studio lighting, sharp focus, detailed skin texture, neutral background",
        description: "Describe your subject, pose, lighting, and style.",
        affects: "CLIPTextEncode positive",
      },
      {
        id: "lora_enabled",
        label: "Enable LoRA",
        type: "toggle",
        default: false,
        description: "Toggle LoRA injection on or off.",
        affects: "LoraLoader enabled",
      },
      {
        id: "lora_name",
        label: "LoRA Filename",
        type: "text",
        default: "your_lora.safetensors",
        description: "Exact filename of your LoRA in ComfyUI/models/loras/",
        affects: "LoraLoader lora_name",
      },
      {
        id: "lora_strength",
        label: "LoRA Strength",
        type: "range",
        default: 0.8,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        description:
          "Higher = stronger LoRA influence. Start at 0.8, adjust as needed.",
        affects: "LoraLoader strength_model + strength_clip",
      },
      {
        id: "seed",
        label: "Seed",
        type: "number",
        default: -1,
        description: "Set to -1 for random. Fix to reproduce results.",
        affects: "KSampler seed",
      },
    ],
    troubleshooting: [
      {
        problem: "CUDA out of memory",
        solution:
          "Switch to 8GB or 12GB profile. Use FLUX GGUF Q4 for very low VRAM.",
      },
      {
        problem: "Blurry or low detail faces",
        solution:
          "Increase steps to 25–30. Ensure T5XXL encoder is loaded correctly.",
      },
      {
        problem: "LoRA not activating",
        solution:
          "Check filename matches exactly. Try increasing strength to 0.9.",
      },
      {
        problem: "LoRA overpowering the prompt",
        solution:
          "Reduce LoRA strength to 0.6. Add more descriptive text to your prompt.",
      },
      {
        problem: "Wrong colors or style",
        solution:
          "Verify you loaded FLUX Dev, not Schnell. Check VAE is correct.",
      },
    ],
    templateFile: "flux-portrait-lora.json",
    previewOutputs: [],
    createdAt: "2025-03-05",
    updatedAt: "2025-03-15",
  },

  {
    id: "sdxl-concept-batch",
    version: "1.2.0",
    title: "SDXL Batch Concept Generator",
    tagline: "8 concept variations in one run — fast iteration for designers",
    description:
      "A high-throughput SDXL concept generation pipeline. Generates 8 variations per run using prompt weighting and seed iteration. Ideal for character design sheets, environment concepts, and style exploration.",
    purpose:
      "Rapidly generate multiple concept variations for design work and creative iteration.",
    whoItsFor: [
      "Character and concept designers",
      "Anyone needing rapid visual iteration",
      "Creators building reference sheets",
      "Beginners learning ComfyUI batch workflows",
    ],
    category: "Image",
    difficulty: "Beginner",
    tags: ["SDXL", "Batch", "Concept Art", "Design", "Iteration"],
    hardwareProfiles: {
      "8gb": {
        tier: "8gb",
        label: "8GB Safe",
        vram: "8GB",
        gpuExamples: ["RTX 3070", "RTX 4060 Ti", "RTX 3060 Ti", "GTX 1080 Ti"],
        width: 768,
        height: 768,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 2,
        extraFlags: ["--lowvram"],
        qualityNote:
          "Reduced resolution, smaller batch. Still produces great concepts.",
        estimatedTime: "25–40s per batch",
      },
      "12gb": {
        tier: "12gb",
        label: "12GB Balanced",
        vram: "12GB",
        gpuExamples: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 10GB"],
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 4,
        extraFlags: [],
        qualityNote: "Full resolution, 4-image batches. Good throughput.",
        estimatedTime: "20–30s per batch",
      },
      "16gb": {
        tier: "16gb",
        label: "16GB High Quality",
        vram: "16GB",
        gpuExamples: ["RTX 5080", "RTX 3080 16GB", "RTX 4070 Ti", "RTX 4080"],
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 8,
        extraFlags: ["--gpu-only"],
        qualityNote: "Full batch of 8 at 1024×1024. Fast and clean.",
        estimatedTime: "12–20s per batch",
      },
      "24gb": {
        tier: "24gb",
        label: "24GB Max Quality",
        vram: "24GB",
        gpuExamples: ["RTX 4090", "RTX 3090"],
        width: 1152,
        height: 1152,
        steps: 25,
        cfg: 7.5,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 8,
        extraFlags: ["--gpu-only", "--highvram"],
        qualityNote: "Higher resolution batch generation. Maximum detail.",
        estimatedTime: "10–15s per batch",
      },
    },
    requiredModels: [
      {
        name: "SDXL Base 1.0",
        type: "checkpoint",
        filename: "sd_xl_base_1.0.safetensors",
        sizeGB: 6.5,
        downloadUrl:
          "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
        required: true,
        notes: "Place in ComfyUI/models/checkpoints/",
      },
      {
        name: "SDXL Refiner 1.0",
        type: "checkpoint",
        filename: "sd_xl_refiner_1.0.safetensors",
        sizeGB: 6.1,
        downloadUrl:
          "https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0",
        required: false,
        notes: "Optional refiner pass. Place in ComfyUI/models/checkpoints/",
      },
    ],
    setupSteps: [
      "Download SDXL Base 1.0 from Hugging Face or CivitAI",
      "Place in ComfyUI/models/checkpoints/",
      "Optional: download SDXL Refiner for higher quality",
      "Select your hardware profile",
      "Write your concept prompt",
      "Export JSON and load into ComfyUI",
    ],
    configurableParams: [
      {
        id: "positive_prompt",
        label: "Concept Prompt",
        type: "text",
        default:
          "Character concept art, full body, front view, plain white background, clean linework, professional illustration",
        description:
          "Describe your concept. Include style, subject, and composition.",
        affects: "CLIPTextEncode positive",
      },
      {
        id: "negative_prompt",
        label: "Negative Prompt",
        type: "text",
        default:
          "blurry, low quality, watermark, text, cropped, deformed, ugly",
        description: "What to avoid.",
        affects: "CLIPTextEncode negative",
      },
      {
        id: "cfg",
        label: "CFG Scale",
        type: "range",
        default: 7.0,
        min: 1.0,
        max: 15.0,
        step: 0.5,
        description:
          "Higher = more prompt adherence. Lower = more creative. 7.0 is standard for SDXL.",
        affects: "KSampler cfg",
      },
      {
        id: "seed",
        label: "Base Seed",
        type: "number",
        default: -1,
        description: "Base seed for variation generation. -1 for random.",
        affects: "KSampler seed",
      },
    ],
    troubleshooting: [
      {
        problem: "Anatomy issues or deformed figures",
        solution:
          "Add 'bad anatomy, extra limbs, deformed hands' to negative prompt. Lower CFG to 6.0.",
      },
      {
        problem: "All variations look the same",
        solution: "Lower CFG to 5.0 and ensure seed is set to -1.",
      },
      {
        problem: "Out of memory on batch",
        solution: "Reduce batch size to 2. Switch to lower hardware profile.",
      },
      {
        problem: "Slow generation",
        solution:
          "Ensure --gpu-only flag. Try dpmpp_sde sampler for faster results at similar quality.",
      },
    ],
    templateFile: "sdxl-concept-batch.json",
    previewOutputs: [],
    createdAt: "2025-02-20",
    updatedAt: "2025-03-10",
  },

  {
    id: "animatediff-character-loop",
    version: "1.1.0",
    title: "AnimateDiff Seamless Character Loop",
    tagline: "Looping animations for short-form content — LoRA compatible",
    description:
      "A seamless looping animation pipeline using AnimateDiff with SDXL. Character LoRA compatible. Outputs clean 24-frame loops as GIF or MP4. Designed for Instagram Reels and TikTok loop format.",
    purpose:
      "Create seamless looping character animations for social media content.",
    whoItsFor: [
      "Short-form content creators",
      "Anyone with a character LoRA wanting animated content",
      "Creators building looping visual content",
      "AnimateDiff beginners",
    ],
    category: "Animation",
    difficulty: "Intermediate",
    tags: ["AnimateDiff", "Loop", "Character", "Animation", "SDXL"],
    hardwareProfiles: {
      "8gb": {
        tier: "8gb",
        label: "8GB Safe",
        vram: "8GB",
        gpuExamples: ["RTX 3070", "RTX 4060", "RTX 3060 Ti"],
        width: 512,
        height: 512,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 1,
        frames: 16,
        extraFlags: ["--lowvram"],
        qualityNote: "16 frames at 512×512. Short loop, lower resolution.",
        estimatedTime: "60–90s",
      },
      "12gb": {
        tier: "12gb",
        label: "12GB Balanced",
        vram: "12GB",
        gpuExamples: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 10GB"],
        width: 512,
        height: 768,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 1,
        frames: 24,
        extraFlags: [],
        qualityNote: "24 frames at vertical resolution. Clean loop.",
        estimatedTime: "40–60s",
      },
      "16gb": {
        tier: "16gb",
        label: "16GB High Quality",
        vram: "16GB",
        gpuExamples: ["RTX 5080", "RTX 3080 16GB", "RTX 4070 Ti"],
        width: 512,
        height: 768,
        steps: 20,
        cfg: 7.0,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 1,
        frames: 24,
        extraFlags: ["--gpu-only"],
        qualityNote: "24 frames at vertical resolution. Fast and clean.",
        estimatedTime: "20–35s",
      },
      "24gb": {
        tier: "24gb",
        label: "24GB Max Quality",
        vram: "24GB",
        gpuExamples: ["RTX 4090", "RTX 3090"],
        width: 768,
        height: 1024,
        steps: 25,
        cfg: 7.5,
        denoise: 1.0,
        sampler: "dpmpp_2m",
        scheduler: "karras",
        batchSize: 1,
        frames: 32,
        extraFlags: ["--gpu-only", "--highvram"],
        qualityNote: "Higher res, longer loop. Best quality.",
        estimatedTime: "15–25s",
      },
    },
    requiredModels: [
      {
        name: "DreamShaper XL",
        type: "checkpoint",
        filename: "dreamshaperXL_v21TurboDPMSDE.safetensors",
        sizeGB: 6.5,
        downloadUrl: "https://civitai.com/models/112902",
        required: true,
        notes: "Or any SDXL checkpoint. Place in ComfyUI/models/checkpoints/",
      },
      {
        name: "AnimateDiff SDXL Motion Module",
        type: "motion",
        filename: "animatediff_v15_3.safetensors",
        sizeGB: 1.7,
        downloadUrl: "https://huggingface.co/guoyww/animatediff",
        required: true,
        notes:
          "Place in ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved/models/",
      },
    ],
    setupSteps: [
      "Install ComfyUI-AnimateDiff-Evolved via ComfyUI Manager",
      "Download AnimateDiff motion module",
      "Place motion module in AnimateDiff models folder",
      "Download SDXL checkpoint of your choice",
      "Optional: place character LoRA in ComfyUI/models/loras/",
      "Select hardware profile",
      "Configure prompt and LoRA settings",
      "Export JSON and load into ComfyUI",
    ],
    configurableParams: [
      {
        id: "positive_prompt",
        label: "Animation Prompt",
        type: "text",
        default:
          "Character walking through a forest, dappled sunlight, gentle breeze, cinematic",
        description: "Describe the character, action, and environment.",
        affects: "CLIPTextEncode positive",
      },
      {
        id: "lora_name",
        label: "Character LoRA",
        type: "text",
        default: "",
        description: "Optional. Exact LoRA filename for character consistency.",
        affects: "LoraLoader lora_name",
      },
      {
        id: "lora_strength",
        label: "LoRA Strength",
        type: "range",
        default: 0.75,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        description:
          "LoRA influence. Keep at 0.7–0.8 to avoid motion artifacts.",
        affects: "LoraLoader strength_model",
      },
      {
        id: "motion_scale",
        label: "Motion Amount",
        type: "range",
        default: 1.0,
        min: 0.5,
        max: 1.5,
        step: 0.1,
        description: "How much movement in the animation. 1.0 is standard.",
        affects: "AnimateDiff motion_scale",
      },
    ],
    troubleshooting: [
      {
        problem: "Loop doesn't connect cleanly",
        solution:
          "Enable loop conditioning in AnimateDiff node. Use 24 frames minimum.",
      },
      {
        problem: "Character changes between frames",
        solution:
          "Lower LoRA strength to 0.7. Add character description to every frame of the prompt.",
      },
      {
        problem: "Flickering or artifacts",
        solution: "Reduce motion scale to 0.8. Lower steps to 15.",
      },
      {
        problem: "Out of memory",
        solution: "Switch to 8GB profile. Reduce frames to 16.",
      },
    ],
    templateFile: "animatediff-character-loop.json",
    previewOutputs: [],
    createdAt: "2025-02-15",
    updatedAt: "2025-03-10",
  },
];

export function getWorkflow(id: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.id === id);
}

export function getWorkflowsByCategory(category: WorkflowCategory): Workflow[] {
  return WORKFLOWS.filter((w) => w.category === category);
}
