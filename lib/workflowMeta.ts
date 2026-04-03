/**
 * Workflow Metadata Registry
 * Maps workflow filenames to descriptions, categories, and asset paths.
 */

export interface WorkflowMeta {
  description: string;
  category:
    | "flux"
    | "sdxl"
    | "sd15"
    | "ltx-video"
    | "animatediff"
    | "utility"
    | "controlnet";
  categoryLabel: string;
  categoryColor: string; // Tailwind text color
  categoryBg: string; // Tailwind bg color
  previewImage?: string; // Result of the workflow
}

const WORKFLOW_META: Record<string, WorkflowMeta> = {
  "01-flux-dev-t2i": {
    description:
      "A high-fidelity Text-to-Image pipeline utilizing the Flux Dev model. Optimized for complex image generation with integrated upscaling, high detail retention, and clean model routing. Ideal for detailed concept art.",
    category: "flux",
    categoryLabel: "FLUX",
    categoryColor: "text-cyan-400",
    categoryBg: "bg-cyan-400/10",
    previewImage: "/images/workflows/cards/starter-diffusion.png",
  },
  "02-flux-schnell-fast": {
    description:
      "A high-speed, low-step Text-to-Image workflow using Flux Schnell. Designed for rapid prototyping and quick iterative brainstorming without sacrificing baseline quality.",
    category: "flux",
    categoryLabel: "FLUX",
    categoryColor: "text-cyan-400",
    categoryBg: "bg-cyan-400/10",
    previewImage: "/images/workflows/cards/high-detail.png",
  },
  "03-sdxl-standard": {
    description:
      "The baseline Stable Diffusion XL pipeline. Features standard positive/negative prompting, standard refiner routing, and optimal latent noise settings for general-purpose generation.",
    category: "sdxl",
    categoryLabel: "SDXL",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
    previewImage: "/images/workflows/cards/lora-training.png",
  },
  "04-sdxl-portrait": {
    description:
      "Tuned specifically for human subjects. Includes FaceID/ControlNet routing, detailed skin texture Loras, and eye-correction nodes for photorealistic portraits.",
    category: "sdxl",
    categoryLabel: "SDXL",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
    previewImage: "/images/workflows/thumbs/sdxl.png",
  },
  "05-sdxl-turbo-fast": {
    description:
      "Near real-time generation using SDXL Turbo. Built for 1-to-4 step inference, making it perfect for live-canvas applications or instant prompt feedback.",
    category: "sdxl",
    categoryLabel: "SDXL",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
    previewImage: "/images/workflows/thumbs/sdxl.png",
  },
  "06-sd15-classic": {
    description:
      "A robust, legacy SD 1.5 setup. Heavily relies on standard ControlNets (Depth, Canny, OpenPose) and targeted inpainting nodes for precise compositional control.",
    category: "sd15",
    categoryLabel: "SD 1.5",
    categoryColor: "text-amber-400",
    categoryBg: "bg-amber-400/10",
    previewImage: "/images/workflows/cards/audio-gen.png",
  },
  "07-flux-lora-character": {
    description:
      "A specialized Flux Dev workflow with integrated LoRA loading nodes and trigger-word text concatenators. Perfect for maintaining consistent characters across multiple generations.",
    category: "flux",
    categoryLabel: "FLUX + LoRA",
    categoryColor: "text-cyan-400",
    categoryBg: "bg-cyan-400/10",
  },
  "08-sdxl-lora-style": {
    description:
      "Designed for artistic style transfer. Features chained LoRA loaders with adjustable weight sliders to blend multiple artistic styles seamlessly in SDXL.",
    category: "sdxl",
    categoryLabel: "SDXL + LoRA",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
  },
  "09-sdxl-landscape": {
    description:
      "Wide-aspect ratio optimized pipeline. Includes specialized upscalers and high-res fix routing to handle intricate details in environments, foliage, and architecture.",
    category: "sdxl",
    categoryLabel: "SDXL",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
  },
  "10-sd15-anime": {
    description:
      "Utilizing NAI-based or specialized anime checkpoints. Features specific VAE loading, flat-color correction nodes, and line-art extraction ControlNets.",
    category: "sd15",
    categoryLabel: "SD 1.5",
    categoryColor: "text-amber-400",
    categoryBg: "bg-amber-400/10",
    previewImage: "/images/workflows/thumbs/sd15.png",
  },
  "11-ltx-video-t2v-basic": {
    description:
      "A foundational Text-to-Video pipeline using LTX. Converts standard text prompts into short, cohesive motion clips with basic temporal consistency nodes.",
    category: "ltx-video",
    categoryLabel: "LTX VIDEO",
    categoryColor: "text-rose-400",
    categoryBg: "bg-rose-400/10",
    previewImage: "/images/workflows/thumbs/ltx-video.png",
  },
  "12-ltx-video-cinematic": {
    description:
      "Advanced LTX video generation featuring camera motion control nodes (pan, tilt, zoom) and multi-prompt scheduling for cinematic scene transitions.",
    category: "ltx-video",
    categoryLabel: "LTX VIDEO",
    categoryColor: "text-rose-400",
    categoryBg: "bg-rose-400/10",
    previewImage: "/images/workflows/thumbs/ltx-video.png",
  },
  "13-ltx-video-action-chase": {
    description:
      "High-framerate, high-motion video pipeline. Optimized for fast-moving subjects with enhanced frame interpolation to reduce motion blur artifacts.",
    category: "ltx-video",
    categoryLabel: "LTX VIDEO",
    categoryColor: "text-rose-400",
    categoryBg: "bg-rose-400/10",
  },
  "14-ltx-video-fast-draft": {
    description:
      "Low-resolution, low-step video generation for quickly testing motion concepts and prompt scheduling before rendering the final high-res output.",
    category: "ltx-video",
    categoryLabel: "LTX VIDEO",
    categoryColor: "text-rose-400",
    categoryBg: "bg-rose-400/10",
  },
  "15-animatediff-simple": {
    description:
      "A classic SD 1.5 AnimateDiff setup. Uses motion modules and standard SD prompts to create smooth, stylized looping GIFs and short animations.",
    category: "animatediff",
    categoryLabel: "ANIMATEDIFF",
    categoryColor: "text-emerald-400",
    categoryBg: "bg-emerald-400/10",
    previewImage: "/images/workflows/thumbs/animatediff.png",
  },
};

/**
 * Returns metadata for a given workflow filename (without .json extension).
 * Falls back to sensible defaults for unlisted workflows.
 */
export function getWorkflowMeta(filename: string): WorkflowMeta {
  // Strip .json extension if present
  const key = filename.replace(/\.json$/, "");

  if (WORKFLOW_META[key]) return WORKFLOW_META[key];

  // Infer category from filename for fallback
  const lower = key.toLowerCase();
  if (lower.includes("flux"))
    return {
      description:
        "A FLUX-based ComfyUI workflow optimized for high-fidelity local generation. Download the JSON and import directly into your ComfyUI environment.",
      category: "flux",
      categoryLabel: "FLUX",
      categoryColor: "text-cyan-400",
      categoryBg: "bg-cyan-400/10",
    };
  if (lower.includes("ltx") || lower.includes("video"))
    return {
      description:
        "An LTX Video pipeline for text-to-video generation. Features temporal consistency nodes and optimized frame scheduling.",
      category: "ltx-video",
      categoryLabel: "LTX VIDEO",
      categoryColor: "text-rose-400",
      categoryBg: "bg-rose-400/10",
    };
  if (lower.includes("animatediff"))
    return {
      description:
        "An AnimateDiff pipeline for creating smooth animations and motion clips from SD 1.5 checkpoints.",
      category: "animatediff",
      categoryLabel: "ANIMATEDIFF",
      categoryColor: "text-emerald-400",
      categoryBg: "bg-emerald-400/10",
    };
  if (lower.includes("controlnet"))
    return {
      description:
        "A ControlNet-guided generation pipeline for precise compositional control using depth, canny, pose, or other structural inputs.",
      category: "controlnet",
      categoryLabel: "CONTROLNET",
      categoryColor: "text-violet-400",
      categoryBg: "bg-violet-400/10",
    };
  if (lower.includes("upscale"))
    return {
      description:
        "An upscaling workflow for enhancing image resolution using ESRGAN or similar super-resolution models.",
      category: "utility",
      categoryLabel: "UTILITY",
      categoryColor: "text-zinc-400",
      categoryBg: "bg-zinc-400/10",
    };
  if (lower.includes("sd15") || lower.includes("sd-15"))
    return {
      description:
        "A Stable Diffusion 1.5 workflow with standard prompting and model routing for reliable, well-tested generation.",
      category: "sd15",
      categoryLabel: "SD 1.5",
      categoryColor: "text-amber-400",
      categoryBg: "bg-amber-400/10",
    };

  // Default: SDXL
  return {
    description:
      "A Stable Diffusion XL pipeline optimized for high-quality image generation. Download and import into your local ComfyUI setup.",
    category: "sdxl",
    categoryLabel: "SDXL",
    categoryColor: "text-indigo-400",
    categoryBg: "bg-indigo-400/10",
  };
}

/**
 * Returns the category color classes for a workflow by its filename.
 * Used for sidebar thumbnail accent colors.
 */
export function getCategoryColor(filename: string): {
  text: string;
  bg: string;
  label: string;
} {
  const meta = getWorkflowMeta(filename);
  return {
    text: meta.categoryColor,
    bg: meta.categoryBg,
    label: meta.categoryLabel,
  };
}
