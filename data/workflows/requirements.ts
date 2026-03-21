// NeuralHub Workflow Requirements
// Extracted from real workflow files + MarkdownNote nodes
// Used by the Requirements Panel on workflow detail pages

export interface ModelRequirement {
  name: string;
  filename: string;
  directory: string;
  sizeGB: number;
  url: string;
  required: boolean;
  type: "checkpoint" | "lora" | "vae" | "text_encoder" | "unet" | "upscaler" | "other";
  notes?: string;
}

export interface NodeRequirement {
  name: string;
  repo: string;
  installUrl: string;
  notes?: string;
}

export interface WorkflowRequirements {
  models: ModelRequirement[];
  customNodes: NodeRequirement[];
  comfyuiMinVersion?: string;
  vramMin: number;
  vramRec: number;
  systemRamMin: number;
  launchFlags: string[];
  tips: string[];
  folderStructure: string;
}

export const WORKFLOW_REQUIREMENTS: Record<string, WorkflowRequirements> = {

  "ltx-cinematic-chase": {
    vramMin: 16,
    vramRec: 24,
    systemRamMin: 32,
    launchFlags: ["--gpu-only"],
    models: [
      {
        name: "LTX-2.3 Dev FP8",
        filename: "ltx-2.3-22b-dev-fp8.safetensors",
        directory: "ComfyUI/models/checkpoints/",
        sizeGB: 22.4,
        url: "https://huggingface.co/Lightricks/LTX-2.3-fp8/resolve/main/ltx-2.3-22b-dev-fp8.safetensors",
        required: true,
        type: "checkpoint",
      },
      {
        name: "LTX-2.3 Distilled LoRA",
        filename: "ltx-2.3-22b-distilled-lora-384.safetensors",
        directory: "ComfyUI/models/loras/",
        sizeGB: 1.4,
        url: "https://huggingface.co/Lightricks/LTX-2.3/resolve/main/ltx-2.3-22b-distilled-lora-384.safetensors",
        required: true,
        type: "lora",
        notes: "Required for distilled (fast) generation",
      },
      {
        name: "Gemma 3 12B FP4 Text Encoder",
        filename: "gemma_3_12B_it_fp4_mixed.safetensors",
        directory: "ComfyUI/models/text_encoders/",
        sizeGB: 7.2,
        url: "https://huggingface.co/Comfy-Org/ltx-2/resolve/main/split_files/text_encoders/gemma_3_12B_it_fp4_mixed.safetensors",
        required: true,
        type: "text_encoder",
      },
      {
        name: "LTX-2.3 Spatial Upscaler",
        filename: "ltx-2.3-spatial-upscaler-x2-1.0.safetensors",
        directory: "ComfyUI/models/latent_upscale_models/",
        sizeGB: 0.3,
        url: "https://huggingface.co/Lightricks/LTX-2.3/resolve/main/ltx-2.3-spatial-upscaler-x2-1.0.safetensors",
        required: true,
        type: "upscaler",
      },
      {
        name: "Gemma Abliterated LoRA",
        filename: "gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors",
        directory: "ComfyUI/models/loras/",
        sizeGB: 0.8,
        url: "https://huggingface.co/Comfy-Org/ltx-2/resolve/main/split_files/loras/gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors",
        required: false,
        type: "lora",
        notes: "Optional — improves prompt following",
      },
    ],
    customNodes: [
      {
        name: "ComfyUI-LTXVideo",
        repo: "Lightricks/ComfyUI-LTXVideo",
        installUrl: "https://github.com/Lightricks/ComfyUI-LTXVideo",
        notes: "Required for LTX 2.3 nodes",
      },
    ],
    tips: [
      "Update ComfyUI to latest before installing",
      "Minimum 16GB VRAM — 24GB recommended for full quality",
      "Set width and height inside the Video Generation node",
      "Prompt goes inside the subgraph — double-click the main node to open it",
    ],
    folderStructure: `ComfyUI/models/
├── checkpoints/
│   └── ltx-2.3-22b-dev-fp8.safetensors
├── loras/
│   ├── ltx-2.3-22b-distilled-lora-384.safetensors
│   └── gemma-3-12b-it-abliterated_lora_rank64_bf16.safetensors
├── text_encoders/
│   └── gemma_3_12B_it_fp4_mixed.safetensors
└── latent_upscale_models/
    └── ltx-2.3-spatial-upscaler-x2-1.0.safetensors`,
  },

  "ltx-gguf": {
    vramMin: 16,
    vramRec: 16,
    systemRamMin: 64,
    launchFlags: ["--reserve-vram 8"],
    models: [
      {
        name: "LTX-2 GGUF Q8",
        filename: "ltx-2-19b-distilled_Q8_0.gguf",
        directory: "ComfyUI/models/diffusion_models/",
        sizeGB: 18.6,
        url: "https://huggingface.co/Kijai/LTXV2_comfy/resolve/main/diffusion_models/ltx-2-19b-distilled_Q8_0.gguf",
        required: true,
        type: "unet",
      },
      {
        name: "Gemma 3 12B FP8 Text Encoder",
        filename: "gemma_3_12B_it_fp8_e4m3fn.safetensors",
        directory: "ComfyUI/models/text_encoders/",
        sizeGB: 12.0,
        url: "https://huggingface.co/GitMylo/LTX-2-comfy_gemma_fp8_e4m3fn/resolve/main/gemma_3_12B_it_fp8_e4m3fn.safetensors",
        required: true,
        type: "text_encoder",
      },
      {
        name: "LTX-2 Video VAE",
        filename: "LTX2_video_vae_bf16.safetensors",
        directory: "ComfyUI/models/vae/",
        sizeGB: 0.4,
        url: "https://huggingface.co/Kijai/LTXV2_comfy/resolve/main/VAE/LTX2_video_vae_bf16.safetensors",
        required: true,
        type: "vae",
      },
      {
        name: "LTX-2 Spatial Upscaler",
        filename: "ltx-2-spatial-upscaler-x2-1.0.safetensors",
        directory: "ComfyUI/models/latent_upscale_models/",
        sizeGB: 0.3,
        url: "https://huggingface.co/Lightricks/LTX-2/resolve/main/ltx-2-spatial-upscaler-x2-1.0.safetensors",
        required: false,
        type: "upscaler",
      },
    ],
    customNodes: [
      {
        name: "ComfyUI-GGUF",
        repo: "city96/ComfyUI-GGUF",
        installUrl: "https://github.com/city96/ComfyUI-GGUF",
        notes: "Required for GGUF model loading",
      },
      {
        name: "ComfyUI-VideoHelperSuite",
        repo: "Kosinkadink/ComfyUI-VideoHelperSuite",
        installUrl: "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite",
      },
    ],
    tips: [
      "Tested on 16GB VRAM + 64GB system RAM",
      "Start ComfyUI with --reserve-vram 8 flag",
      "64GB system RAM strongly recommended",
      "Width and height must be divisible by 32",
    ],
    folderStructure: `ComfyUI/models/
├── diffusion_models/
│   └── ltx-2-19b-distilled_Q8_0.gguf
├── text_encoders/
│   └── gemma_3_12B_it_fp8_e4m3fn.safetensors
└── vae/
    └── LTX2_video_vae_bf16.safetensors`,
  },

  "z-image-turbo": {
    vramMin: 8,
    vramRec: 12,
    systemRamMin: 16,
    launchFlags: ["--gpu-only"],
    models: [
      {
        name: "Z-Image Turbo BF16",
        filename: "z_image_turbo_bf16.safetensors",
        directory: "ComfyUI/models/diffusion_models/",
        sizeGB: 6.2,
        url: "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors",
        required: true,
        type: "unet",
      },
      {
        name: "Qwen 3 4B Text Encoder",
        filename: "qwen_3_4b.safetensors",
        directory: "ComfyUI/models/text_encoders/",
        sizeGB: 4.1,
        url: "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors",
        required: true,
        type: "text_encoder",
      },
      {
        name: "AE VAE",
        filename: "ae.safetensors",
        directory: "ComfyUI/models/vae/",
        sizeGB: 0.3,
        url: "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors",
        required: true,
        type: "vae",
      },
    ],
    customNodes: [],
    tips: [
      "No negative prompt needed — model ignores it",
      "8 steps is optimal — more steps won't improve quality",
      "Works on 8GB VRAM GPUs",
      "Fast generation — under 5 seconds on RTX 5080",
    ],
    folderStructure: `ComfyUI/models/
├── diffusion_models/
│   └── z_image_turbo_bf16.safetensors
├── text_encoders/
│   └── qwen_3_4b.safetensors
└── vae/
    └── ae.safetensors`,
  },

  "sdxl-concept-batch": {
    vramMin: 6,
    vramRec: 10,
    systemRamMin: 16,
    launchFlags: ["--gpu-only"],
    models: [
      {
        name: "SDXL Base 1.0",
        filename: "sd_xl_base_1.0.safetensors",
        directory: "ComfyUI/models/checkpoints/",
        sizeGB: 6.5,
        url: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors",
        required: true,
        type: "checkpoint",
        notes: "Or any SDXL-compatible checkpoint",
      },
    ],
    customNodes: [],
    tips: [
      "Any SDXL checkpoint works — swap sd_xl_base_1.0.safetensors for your preferred model",
      "Recommended resolutions: 1024x1024, 1152x896, 896x1152",
      "CFG 5–8 for SDXL — higher values increase prompt adherence",
      "DPM++ 2M Karras is the most reliable sampler for SDXL",
    ],
    folderStructure: `ComfyUI/models/
└── checkpoints/
    └── sd_xl_base_1.0.safetensors`,
  },

  "qwen-image": {
    vramMin: 10,
    vramRec: 16,
    systemRamMin: 32,
    launchFlags: ["--gpu-only"],
    models: [
      {
        name: "Qwen Image 2512 GGUF Q5",
        filename: "qwen-image-2512-Q5_K_M.gguf",
        directory: "ComfyUI/models/unet/",
        sizeGB: 5.8,
        url: "https://huggingface.co/unsloth/Qwen-Image-2512-GGUF/resolve/main/qwen-image-2512-Q5_K_M.gguf",
        required: true,
        type: "unet",
      },
      {
        name: "Qwen 2.5 VL GGUF Text Encoder",
        filename: "Qwen2.5-VL-7B-Instruct-UD-Q5_K_XL.gguf",
        directory: "ComfyUI/models/text_encoders/",
        sizeGB: 5.2,
        url: "https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct-GGUF/resolve/main/Qwen2.5-VL-7B-Instruct-UD-Q5_K_XL.gguf",
        required: true,
        type: "text_encoder",
      },
      {
        name: "Qwen Image VAE",
        filename: "qwen_image_vae.safetensors",
        directory: "ComfyUI/models/vae/",
        sizeGB: 0.3,
        url: "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors",
        required: true,
        type: "vae",
      },
      {
        name: "Qwen Image Lightning LoRA",
        filename: "Qwen-Image-2512-Lightning-4steps-V1.0-bf16.safetensors",
        directory: "ComfyUI/models/loras/",
        sizeGB: 0.8,
        url: "https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning/resolve/main/Qwen-Image-2512-Lightning-4steps-V1.0-bf16.safetensors",
        required: true,
        type: "lora",
        notes: "Required for 4-step fast generation",
      },
    ],
    customNodes: [
      {
        name: "ComfyUI-GGUF",
        repo: "city96/ComfyUI-GGUF",
        installUrl: "https://github.com/city96/ComfyUI-GGUF",
        notes: "Required for GGUF model loading",
      },
    ],
    tips: [
      "4-step generation — very fast on 16GB VRAM",
      "Comic book, illustration, and concept art prompts work best",
      "Uses GGUF quantized models — lower VRAM than full precision",
    ],
    folderStructure: `ComfyUI/models/
├── unet/
│   └── qwen-image-2512-Q5_K_M.gguf
├── text_encoders/
│   └── Qwen2.5-VL-7B-Instruct-UD-Q5_K_XL.gguf
├── vae/
│   └── qwen_image_vae.safetensors
└── loras/
    └── Qwen-Image-2512-Lightning-4steps-V1.0-bf16.safetensors`,
  },
};

export function getRequirements(workflowId: string): WorkflowRequirements | null {
  return WORKFLOW_REQUIREMENTS[workflowId] || null;
}
