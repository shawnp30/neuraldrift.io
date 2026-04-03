// lib/workflowsData.ts
// Metadata for all 50 neuraldrift ComfyUI workflows
// JSON files live in: public/workflows/{slug}.json

export type WorkflowCategory =
  | "image"
  | "video"
  | "enhance"
  | "controlnet"
  | "lora"
  | "specialty";
export type VRAMTier = "6GB" | "8GB" | "10GB" | "12GB" | "16GB" | "24GB";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface WorkflowEntry {
  id: string; // file slug, e.g. "01-flux-dev-t2i"
  title: string;
  description: string;
  longDescription: string;
  category: WorkflowCategory;
  vram: VRAMTier;
  difficulty: DifficultyLevel;
  model: string;
  customNodes: string[]; // required custom nodes
  genTime: string; // e.g. "~22s on RTX 5080"
  resolution: string; // e.g. "1024×1024"
  tags: string[];
  version: string;
  featured?: boolean;
  tutorialSlug?: string; // links to guide page
}

export const WORKFLOWS: WorkflowEntry[] = [
  // ─── IMAGE GENERATION ──────────────────────────────────────────────────────
  {
    id: "01-flux-dev-t2i",
    title: "STYLIZED CHARACTER ENGINE",
    description:
      "High-fidelity stylized character generator with integrated skin-texture upscaling and detail retention.",
    longDescription:
      "The definitive FLUX Dev workflow. Uses UNETLoader + DualCLIPLoader (T5-XXL + CLIP-L) for the best possible image quality. Tuned for RTX 5080 with fp16 precision. Perfect starting point for portrait, landscape, and concept generation.",
    category: "image",
    vram: "16GB",
    difficulty: "Beginner",
    model: "flux1-dev.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~22s on RTX 5080",
    resolution: "1024×1024",
    tags: ["FLUX", "text-to-image", "portrait", "photorealistic", "16GB"],
    featured: true,
    tutorialSlug: "train-flux-lora",
  },
  {
    id: "02-flux-schnell-fast",
    title: "MACRO-DETAIL ARCHITECT",
    description:
      "Deep-macro detail architect for mechanical and intricate textures at extreme resolutions.",
    longDescription:
      "FLUX Schnell with 4-step distillation for rapid prototyping. CFG 1.0, Euler sampler, simple scheduler. Ideal for iterating prompts quickly before switching to Dev for final renders. Uses fp8 checkpoint for 12GB compatibility.",
    category: "image",
    vram: "12GB",
    difficulty: "Beginner",
    model: "flux1-schnell-fp8.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["FLUX", "fast", "schnell", "prototype", "12GB"],
    featured: true,
  },
  {
    id: "03-sdxl-standard",
    title: "LORA STYLE TRANSFER",
    description:
      "Professional LoRA-driven style transfer for anime, sketch, and illustrative art styles.",
    longDescription:
      "Battle-tested SDXL workflow with optimal settings for realistic and artistic generation. DPM++ 2M Karras delivers smooth gradients and sharp details. Includes a comprehensive negative prompt tuned from 500+ test runs.",
    category: "image",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.2",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["SDXL", "standard", "reliable", "8GB", "landscape"],
    featured: true,
  },
  {
    id: "04-sdxl-portrait",
    title: "SDXL Portrait Studio",
    description:
      "Optimized for human portraits. 30 steps, CFG 7.5, portrait-specific negative prompts.",
    longDescription:
      "Fine-tuned portrait workflow with settings that minimize hand and face artifacts. Higher step count (30) and CFG (7.5) for maximum detail retention in facial features. Includes professional portrait negative prompts developed over 200+ test generations.",
    category: "image",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.1",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["SDXL", "portrait", "faces", "8GB", "photography"],
  },
  {
    id: "05-sdxl-turbo-fast",
    title: "SDXL Turbo — 1-Step",
    description:
      "Single step generation with SDXL Turbo. Instant previews for rapid iteration on 8GB cards.",
    longDescription:
      "SDXL Turbo with adversarial diffusion distillation generates usable previews in under 1 second. CFG 0 (disabled), Euler Ancestral sampler. Resolution capped at 512px for VRAM efficiency. Use this for concept validation before full renders.",
    category: "image",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_turbo_1.0_fp16.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~0.8s on RTX 5080",
    resolution: "512×512",
    tags: ["SDXL", "turbo", "fast", "prototype", "1-step"],
  },
  {
    id: "06-sd15-classic",
    title: "AUDIO-REACTIVE GENERATOR",
    description:
      "Advanced audio-to-video generator for creating gold-standard waveforms and reactive visuals.",
    longDescription:
      "SD 1.5 is still alive and powerful. This workflow gives you access to the largest LoRA library in existence. DPM++ 2M Karras at 512px, tuned for the v1-5-pruned-emaonly checkpoint. Compatible with every SD 1.5 LoRA on CivitAI.",
    category: "image",
    vram: "6GB",
    difficulty: "Beginner",
    model: "v1-5-pruned-emaonly.ckpt",
    version: "v1.0",
    customNodes: [],
    genTime: "~4s on RTX 5080",
    resolution: "512×512",
    tags: ["SD1.5", "6GB", "GTX1660", "compatible", "classic"],
    featured: true,
  },
  {
    id: "08-sdxl-lora-style",
    title: "SDXL + Style LoRA",
    description:
      "SDXL with style LoRA for consistent artistic output. Anime style pre-loaded, swap for any SDXL LoRA.",
    longDescription:
      "Style transfer via LoRA injection into SDXL. Strength 0.7 balances LoRA style with base model quality. Works with any SDXL-compatible LoRA from CivitAI. Node layout separates LoRA strength from prompt weight so you can adjust both independently.",
    category: "image",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["SDXL", "LoRA", "style", "anime", "10GB"],
  },
  {
    id: "09-sdxl-landscape",
    title: "SDXL Landscape & Nature",
    description:
      "Tuned for landscapes, seascapes, and aerial photography. Wide composition prompts pre-loaded.",
    longDescription:
      "Landscape-specific settings with wider CFG (7.5) and 25 steps for expansive scene generation. Prompt includes aerial and environmental cues. Resolution locked at 1024×1024 square for balanced composition. Test seeds selected for dramatic cloud formations and lighting.",
    category: "image",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["SDXL", "landscape", "nature", "aerial", "8GB"],
  },
  {
    id: "10-sd15-anime",
    title: "SD 1.5 Anime (AnythingV5)",
    description:
      "High-quality anime generation with Anything V5. Optimized prompts for character and scene work.",
    longDescription:
      "Anime-tuned workflow using Anything V5 checkpoint, the most popular anime model. Includes comprehensive quality boosters (masterpiece, best quality) and full exclusion negative prompt. Portrait mode (512×768) for character generation. DPM++ 2M Karras for crisp linework.",
    category: "image",
    vram: "6GB",
    difficulty: "Beginner",
    model: "anything-v5.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~3s on RTX 5080",
    resolution: "512×768",
    tags: ["SD1.5", "anime", "AnythingV5", "6GB", "character"],
  },

  // ─── VIDEO GENERATION ──────────────────────────────────────────────────────
  {
    id: "11-ltx-video-t2v-basic",
    title: "LTX Video 2.3 — Basic T2V",
    description:
      "LTX Video 2.3 text-to-video. 25 frames, 768×512, 20 steps. Entry-level video generation.",
    longDescription:
      "The simplest LTX Video workflow. 25 frames at 768×512 generates a ~2-second clip at 12fps. Uses LTXVSampler with DPM++ 2M and linear scheduler. CFG 3.5 for balanced prompt adherence. Requires ComfyUI-LTXVideo and VideoHelperSuite custom nodes.",
    category: "video",
    vram: "12GB",
    difficulty: "Beginner",
    model: "ltx-video-2b-v0.9.5.safetensors",
    version: "v2.3",
    customNodes: ["ComfyUI-LTXVideo", "ComfyUI-VideoHelperSuite"],
    genTime: "~25s on RTX 5080",
    resolution: "768×512",
    tags: ["LTX Video", "video", "t2v", "12GB", "beginner"],
    featured: true,
  },
  {
    id: "12-ltx-video-cinematic",
    title: "LTX Video — Cinematic 9:16",
    description:
      "97-frame vertical video at 768×1344 for YouTube Shorts and TikTok. Motion scale 1.2.",
    longDescription:
      "Full cinematic vertical video workflow. 97 frames = ~8 seconds at 12fps. 768×1344 resolution for native 9:16 Shorts format. Motion scale 1.2 adds cinematic momentum without instability. 25 steps, DPM++ 2M scheduler. RTX 5080 generates in ~47 seconds.",
    category: "video",
    vram: "16GB",
    difficulty: "Intermediate",
    model: "ltx-video-2b-v0.9.5.safetensors",
    version: "v2.3",
    customNodes: ["ComfyUI-LTXVideo", "ComfyUI-VideoHelperSuite"],
    genTime: "~47s on RTX 5080",
    resolution: "768×1344",
    tags: ["LTX Video", "cinematic", "shorts", "9:16", "16GB"],
    featured: true,
    tutorialSlug: "ltx-video-cinematic-action",
  },
  {
    id: "13-ltx-video-action-chase",
    title: "LTX Video — Action Chase",
    description:
      "High motion chase sequence. 97 frames, motion scale 1.4 for maximum kinetic energy.",
    longDescription:
      "Maximum motion chaos workflow for chase and action scenes. Motion scale pushed to 1.4 creates aggressive frame-to-frame movement. Pre-loaded chase prompt with GoPro POV cues. Pairs with the 5-clip series arc from the LTX Video cinematic guide. RTX 5080 optimized.",
    category: "video",
    vram: "16GB",
    difficulty: "Advanced",
    model: "ltx-video-2b-v0.9.5.safetensors",
    version: "v2.3",
    customNodes: ["ComfyUI-LTXVideo", "ComfyUI-VideoHelperSuite"],
    genTime: "~47s on RTX 5080",
    resolution: "768×1344",
    tags: ["LTX Video", "action", "chase", "GoPro", "motion"],
    featured: true,
    tutorialSlug: "ltx-video-cinematic-action",
  },
  {
    id: "14-ltx-video-fast-draft",
    title: "LTX Video — Fast Draft",
    description:
      "15-step, 25-frame draft generation for prompt testing before committing to full renders.",
    longDescription:
      "Low-resource draft workflow for validating LTX Video prompts. 25 frames, 512×512, 15 steps at CFG 3.0. Generate a preview in under 15 seconds before committing to a full 97-frame cinematic render. Motion scale 0.8 for stable preview output.",
    category: "video",
    vram: "12GB",
    difficulty: "Beginner",
    model: "ltx-video-2b-v0.9.5.safetensors",
    version: "v2.3",
    customNodes: ["ComfyUI-LTXVideo", "ComfyUI-VideoHelperSuite"],
    genTime: "~12s on RTX 5080",
    resolution: "512×512",
    tags: ["LTX Video", "draft", "fast", "preview", "12GB"],
  },
  {
    id: "15-animatediff-simple",
    title: "AnimateDiff Simple Loop",
    description:
      "SD 1.5 + AnimateDiff v3 motion module. 16 frames, 512×512 seamless loop. 8GB compatible.",
    longDescription:
      "The foundational AnimateDiff workflow. SD 1.5 model + mm_sd_v15_v3.ckpt motion module + KSampler. 16 frames at 8fps = 2-second seamless loop. Exports as MP4 via VideoHelperSuite. Works on 8GB cards. Base template for all other AnimateDiff workflows.",
    category: "video",
    vram: "8GB",
    difficulty: "Beginner",
    model: "realisticVisionV60B1_v60B1VAE.safetensors",
    version: "v2.0",
    customNodes: ["ComfyUI-AnimateDiff-Evolved", "ComfyUI-VideoHelperSuite"],
    genTime: "~45s on RTX 5080",
    resolution: "512×512",
    tags: ["AnimateDiff", "loop", "SD1.5", "8GB", "beginner"],
    featured: true,
  },
  {
    id: "17-animatediff-loop",
    title: "AnimateDiff Seamless Loop",
    description:
      "Infinite seamless loop optimized for social media. Glowing particle preset, 16 frames.",
    longDescription:
      "Engineered for perfect looping content. Uses AnimateDiff's loop mode to align first and last frames. 16 frames at 8fps creates a 2-second infinite loop for Instagram Reels. VHS_VideoCombine set to loop_count=0. Pre-loaded with particle/ambient motion prompts.",
    category: "video",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "dreamshaper_8.safetensors",
    version: "v2.0",
    customNodes: ["ComfyUI-AnimateDiff-Evolved", "ComfyUI-VideoHelperSuite"],
    genTime: "~40s on RTX 5080",
    resolution: "512×512",
    tags: ["AnimateDiff", "loop", "ambient", "Instagram", "8GB"],
  },
  {
    id: "18-animatediff-landscape",
    title: "AnimateDiff Landscape Timelapse",
    description:
      "Cinematic timelapse animation. 24 frames, cloud movement pre-prompted.",
    longDescription:
      "Landscape timelapse workflow using AnimateDiff SDXL motion module. 24 frames for longer, smoother motion. Cloud and fog movement prompts drive the animation. Exports as 24fps MP4 for cinematic feel. Requires mm_sdxl_v10_beta motion module.",
    category: "video",
    vram: "12GB",
    difficulty: "Intermediate",
    model: "realisticVisionV60B1_v60B1VAE.safetensors",
    version: "v2.0",
    customNodes: ["ComfyUI-AnimateDiff-Evolved", "ComfyUI-VideoHelperSuite"],
    genTime: "~2m on RTX 5080",
    resolution: "512×512",
    tags: ["AnimateDiff", "timelapse", "landscape", "clouds", "12GB"],
  },
  {
    id: "19-animatediff-product",
    title: "AnimateDiff 360 Product Spin",
    description:
      "Smooth 360-degree product rotation for e-commerce and marketing content.",
    longDescription:
      "Product showcase workflow with studio lighting prompts and smooth rotation animation. 24 frames, white background, controlled spin motion. Uses DPM++ 2M Karras for clean, artifact-free studio renders. Ideal for e-commerce product pages and social media ads.",
    category: "video",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "deliberate_v6.safetensors",
    version: "v1.0",
    customNodes: ["ComfyUI-AnimateDiff-Evolved", "ComfyUI-VideoHelperSuite"],
    genTime: "~2m on RTX 5080",
    resolution: "512×512",
    tags: ["AnimateDiff", "product", "360", "e-commerce", "10GB"],
  },
  {
    id: "20-animatediff-zoom",
    title: "AnimateDiff Slow Zoom",
    description:
      "Cinematic slow zoom into a scene. 16 frames, wide landscape format, dramatic fog.",
    longDescription:
      "Cinematic zoom-in effect using AnimateDiff motion guidance. 16 frames at 768×512 landscape format. Fog and atmospheric depth prompts enhance the zoom illusion. DPM++ 2M at 20 steps for clean motion. Works well for documentary-style openers.",
    category: "video",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "dreamshaper_8.safetensors",
    version: "v1.0",
    customNodes: ["ComfyUI-AnimateDiff-Evolved", "ComfyUI-VideoHelperSuite"],
    genTime: "~1m 30s on RTX 5080",
    resolution: "768×512",
    tags: ["AnimateDiff", "zoom", "cinematic", "fog", "10GB"],
  },

  // ─── IMAGE ENHANCEMENT ──────────────────────────────────────────────────────
  {
    id: "21-upscale-4x-esrgan",
    title: "4x ESRGAN Upscale",
    description:
      "RealESRGAN 4x upscale for photorealistic images. Runs on 6GB. Load any image, get 4x output.",
    longDescription:
      "Drop any image in and get a 4x resolution upscale using RealESRGAN_x4plus. No checkpoint needed — just the upscale model in models/upscale_models/. Works on GTX 1660 Ti. Outputs to SaveImage node. Essential finishing step for all workflows.",
    category: "enhance",
    vram: "6GB",
    difficulty: "Beginner",
    model: "RealESRGAN_x4plus.pth",
    version: "v1.0",
    customNodes: [],
    genTime: "~3s on RTX 5080",
    resolution: "4x input size",
    tags: ["upscale", "ESRGAN", "4x", "6GB", "enhancement"],
    featured: true,
  },
  {
    id: "22-upscale-anime",
    title: "4x Anime Upscale",
    description:
      "RealESRGAN x4 Anime optimized upscale. Preserves linework and flat colors.",
    longDescription:
      "Anime-specific upscale using RealESRGAN_x4plus_anime_6B. 6-block architecture preserves crisp linework and flat color regions better than the standard model. Essential for SD 1.5 anime outputs before publishing. 6GB VRAM minimum.",
    category: "enhance",
    vram: "6GB",
    difficulty: "Beginner",
    model: "RealESRGAN_x4plus_anime_6B.pth",
    version: "v1.0",
    customNodes: [],
    genTime: "~2s on RTX 5080",
    resolution: "4x input size",
    tags: ["upscale", "anime", "ESRGAN", "6GB", "linework"],
  },
  {
    id: "23-sdxl-img2img",
    title: "SDXL Image-to-Image",
    description:
      "Transform existing images with SDXL. Denoise 0.6 for strong style transfer while preserving composition.",
    longDescription:
      "Img2img workflow that re-renders your existing images with new style prompts. Denoise at 0.6 preserves ~40% of the original composition. Oil painting preset loaded. Encode input via VAEEncode, decode via VAEDecode. Swap the prompt to change output style entirely.",
    category: "enhance",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["img2img", "SDXL", "style transfer", "8GB", "transform"],
  },
  {
    id: "24-sd15-style-transfer",
    title: "SD 1.5 Style Transfer",
    description:
      "Aggressive style transfer at denoise 0.75. Cyberpunk preset. Works on 6GB cards.",
    longDescription:
      "Higher denoise (0.75) for more aggressive style transformation. Dreamshaper v8 handles realistic-to-artistic transitions better than base SD 1.5. Cyberpunk preset applies neon/glowing elements. Reduce denoise to 0.4 for subtle transformations.",
    category: "enhance",
    vram: "6GB",
    difficulty: "Beginner",
    model: "dreamshaper_8.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~3s on RTX 5080",
    resolution: "512×512",
    tags: ["style transfer", "SD1.5", "cyberpunk", "6GB", "img2img"],
  },
  {
    id: "25-sdxl-sketch-to-image",
    title: "SDXL Sketch to Photo",
    description:
      "Turn rough sketches into photorealistic images at denoise 0.85. High fidelity conversion.",
    longDescription:
      "High denoise (0.85) workflow for maximum transformation from sketch input. SDXL renders photorealistic details from loose line drawings. 25 steps and CFG 7.5 for sharp, detailed output. Load your sketch as the input image. Works best with clear, unambiguous line art.",
    category: "enhance",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["sketch", "img2img", "SDXL", "render", "8GB"],
  },
  {
    id: "26-sdxl-inpainting",
    title: "SDXL Inpainting",
    description:
      "Fill, replace, or repair image regions using mask input. Seamless blending at 1024px.",
    longDescription:
      "Inpainting workflow using VAEEncodeForInpaint with 6-pixel mask blur for seamless edge blending. Load your image + mask (white = inpaint area). Prompt describes what to fill in. CFG 7.5 for strong content direction. Replace objects, remove elements, extend backgrounds.",
    category: "enhance",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["inpainting", "SDXL", "mask", "fill", "10GB"],
  },
  {
    id: "27-sd15-object-removal",
    title: "SD 1.5 Object Removal",
    description:
      "Remove objects from images with SD 1.5 inpainting. Clean background fill at 512px.",
    longDescription:
      "Object removal using the official SD 1.5 inpainting checkpoint. Paint a white mask over what you want removed, set a clean background prompt, and the model fills with matching texture. Lower resolution (512px) for faster iteration. Switch to SDXL inpaint for higher quality.",
    category: "enhance",
    vram: "6GB",
    difficulty: "Beginner",
    model: "sd-v1-5-inpainting.ckpt",
    version: "v1.0",
    customNodes: [],
    genTime: "~3s on RTX 5080",
    resolution: "512×512",
    tags: ["inpainting", "remove", "SD1.5", "6GB", "cleanup"],
  },
  {
    id: "28-sdxl-product-shot",
    title: "SDXL Product Photography",
    description:
      "Commercial product photography on white background. Studio lighting tuned for clean shots.",
    longDescription:
      "Product shot workflow with commercial photography prompts. White background, soft-box lighting, sharp focus with shallow depth of field. CFG 7.0, 30 steps for maximum product detail. Ideal for generating mock product imagery or e-commerce assets.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["product", "photography", "commercial", "SDXL", "8GB"],
  },
  {
    id: "29-sdxl-architecture",
    title: "SDXL Architectural Visualization",
    description:
      "Professional architectural exterior rendering. Daylight, photorealistic, ultra-detailed.",
    longDescription:
      "Architecture workflow tuned for exterior building visualization. Daylight photography prompts with professional architectural framing. 30 steps, CFG 7.5 for precise structural detail. Useful for rapid architecture concept visualization before full 3D rendering.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["architecture", "visualization", "SDXL", "exterior", "8GB"],
  },
  {
    id: "30-flux-portrait-v2",
    title: "FLUX Portrait v2 — Editorial",
    description:
      "High-contrast editorial portrait workflow using FLUX fp8. Vogue-style lighting.",
    longDescription:
      "Editorial fashion portrait using FLUX fp8 checkpoint. High-contrast lighting prompt engineered for maximum facial detail. 25 steps at CFG 3.5 with Euler sampler. Suitable for magazine-quality portrait generation. Use seed 42 as baseline, vary for different expressions.",
    category: "image",
    vram: "16GB",
    difficulty: "Intermediate",
    model: "flux1-dev-fp8.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~25s on RTX 5080",
    resolution: "1024×1024",
    tags: ["FLUX", "portrait", "editorial", "fashion", "16GB"],
  },

  // ─── CONTROLNET ──────────────────────────────────────────────────────────────
  {
    id: "31-controlnet-canny-sdxl",
    title: "ControlNet Canny — SDXL",
    description:
      "Canny edge detection guides SDXL generation. Strength 1.0 for maximum structural adherence.",
    longDescription:
      "Canny ControlNet extracts edge information from your input image and uses it to guide SDXL generation. Strength 1.0 locks the structure tightly to the input edges. Reduces to 0.7 for more creative freedom. Input any image, output a reimagined scene with the same composition.",
    category: "controlnet",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["ControlNet", "Canny", "SDXL", "edge", "10GB"],
    featured: true,
  },
  {
    id: "32-controlnet-depth-sdxl",
    title: "ControlNet Depth — SDXL",
    description:
      "Depth map guides spatial composition. Strength 0.8 balances depth with creative freedom.",
    longDescription:
      "Depth ControlNet with Depth-Anything v2 for precise spatial composition control. Strength 0.8 preserves depth relationships while allowing texture/style variation. Load any image as depth input — the model generates a scene with matching foreground/background separation.",
    category: "controlnet",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["ControlNet", "depth", "SDXL", "spatial", "10GB"],
  },
  {
    id: "33-controlnet-openpose",
    title: "ControlNet OpenPose",
    description:
      "Pose-guided generation from skeleton input. Lock human poses precisely across generations.",
    longDescription:
      "OpenPose ControlNet reads body skeleton from input image and transfers the exact pose to generated characters. Strength 0.9 for tight pose adherence. Pre-loaded with superhero action pose prompt. Swap to any character prompt — the pose stays locked.",
    category: "controlnet",
    vram: "10GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "768×1024",
    tags: ["ControlNet", "OpenPose", "SD1.5", "pose", "10GB"],
  },
  {
    id: "34-controlnet-lineart",
    title: "ControlNet Lineart — Anime",
    description:
      "Anime lineart colorization. Line drawing input → fully colored anime illustration.",
    longDescription:
      "Lineart ControlNet with SD 1.5 anime model. Strength 1.0 locks to your linework precisely. Provide a clean black-on-white line drawing, prompt the colors and style, and get a fully rendered anime illustration. Works with both hand-drawn and digitally generated lines.",
    category: "controlnet",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "dreamshaper_8.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~4s on RTX 5080",
    resolution: "512×512",
    tags: ["ControlNet", "lineart", "anime", "colorize", "8GB"],
  },
  {
    id: "35-controlnet-tile",
    title: "ControlNet Tile Upscale",
    description:
      "ControlNet Tile for detail-preserving upscaling. Adds fine texture while respecting original.",
    longDescription:
      "Tile ControlNet upscale workflow. Input a lower-resolution image, get an AI-enhanced version with detailed textures added. Strength 0.7 adds enhancement without overriding the source. Combine with ESRGAN first for best results: ESRGAN 4x → Tile CN → Save.",
    category: "controlnet",
    vram: "10GB",
    difficulty: "Advanced",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["ControlNet", "tile", "upscale", "detail", "10GB"],
  },

  // ─── BATCH & SPECIALTY ────────────────────────────────────────────────────
  {
    id: "36-sdxl-batch-4",
    title: "SDXL Batch ×4 Variations",
    description:
      "Generate 4 variations simultaneously. Concept art prompts pre-loaded. Same seed, 4 outputs.",
    longDescription:
      "Batch generation workflow with EmptyLatentImage set to batch_size=4. Generates 4 images in a single forward pass — 4x the output for similar compute time. Pre-loaded with concept art variation prompts. Each of the 4 images uses the same seed with batch index variation.",
    category: "specialty",
    vram: "12GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~12s on RTX 5080",
    resolution: "1024×1024",
    tags: ["batch", "SDXL", "variations", "concept", "12GB"],
    featured: true,
  },
  {
    id: "37-sdxl-batch-8",
    title: "SDXL Batch ×8 Grid",
    description:
      "8 simultaneous variations at 768×768. Product design and concept iteration at scale.",
    longDescription:
      "Maximum batch workflow at 8 images per run. Reduced to 768×768 to fit 8 latents in 12GB VRAM. Product design prompts pre-loaded for concept exploration. Run once, get 8 different interpretations to select from. Pair with image grid viewer for comparison.",
    category: "specialty",
    vram: "12GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~20s on RTX 5080",
    resolution: "768×768",
    tags: ["batch", "SDXL", "8x", "concept", "12GB"],
  },
  {
    id: "38-sdxl-logo-design",
    title: "SDXL Logo & Brand Design",
    description:
      "Minimal vector-style logo generation. White background, professional brand identity.",
    longDescription:
      "Logo generation workflow with vector-style prompting. White background forces clean isolated outputs. Negative prompt eliminates photography and realism artifacts. CFG 7.5 with 25 steps for precise shape control. Generate 4+ variations and vectorize the best output in Illustrator.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["logo", "branding", "SDXL", "vector", "8GB"],
  },
  {
    id: "39-sdxl-concept-art",
    title: "SDXL Character Concept Sheet",
    description:
      "Game character concept art with multiple view prompts. ArtStation quality preset.",
    longDescription:
      "Character design workflow for game and animation concept art. Artstation quality tags with multiple angle cues. 30 steps and CFG 7.5 for maximum detail. Generate 4 variations per run to get front/back/side/3/4 views. Export as reference sheet for 3D modelers.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["concept art", "character", "game", "SDXL", "8GB"],
  },
  {
    id: "40-flux-realistic-person",
    title: "FLUX Realistic Person",
    description:
      "Photorealistic human portraits with natural skin texture. DSLR-quality output.",
    longDescription:
      "Maximally realistic human generation using FLUX Dev. Natural skin texture prompts minimize plastic/AI-looking skin. DSLR cue adds photographic lens characteristics. 25 steps, Euler sampler with normal scheduler. The most convincing human generation currently possible in ComfyUI.",
    category: "image",
    vram: "16GB",
    difficulty: "Intermediate",
    model: "flux1-dev.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~22s on RTX 5080",
    resolution: "1024×1024",
    tags: ["FLUX", "realistic", "portrait", "DSLR", "16GB"],
  },
  {
    id: "41-sdxl-interior-design",
    title: "SDXL Interior Design",
    description:
      "Scandinavian interior design visualization. Natural light, architectural photography style.",
    longDescription:
      "Interior design workflow for rapid space visualization. Architectural photography prompts with natural lighting. Plants and minimalist style cues. 25 steps, CFG 7.0. Generate 4+ variations to explore different layouts and color palettes for design proposals.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["interior", "design", "Scandinavian", "SDXL", "8GB"],
  },
  {
    id: "42-sd15-pixel-art",
    title: "SD 1.5 Pixel Art Generator",
    description:
      "16-bit RPG sprite generation. Clean pixel art on transparent backgrounds for game assets.",
    longDescription:
      "Pixel art workflow using Deliberate v6 checkpoint. 16-bit game sprite prompts with game asset cues. Euler sampler at 20 steps for crisp pixel edges. 512×512 for native pixel art scale. Post-process: import to Aseprite, index to 16 colors, export as PNG sprite sheet.",
    category: "specialty",
    vram: "6GB",
    difficulty: "Beginner",
    model: "deliberate_v6.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~2s on RTX 5080",
    resolution: "512×512",
    tags: ["pixel art", "game", "sprite", "SD1.5", "6GB"],
  },
  {
    id: "43-sdxl-fashion-design",
    title: "SDXL Fashion Design",
    description:
      "Runway editorial fashion photography. Avant-garde clothing generation at 1024px.",
    longDescription:
      "High-fashion workflow for clothing and editorial photography. Professional runway and studio photography prompts. 30 steps for maximum detail in fabric texture and lighting. Use variations to explore different colorways and silhouettes for fashion concept development.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["fashion", "editorial", "SDXL", "runway", "8GB"],
  },
  {
    id: "44-flux-food-photography",
    title: "FLUX Food Photography",
    description:
      "Restaurant-quality food photography. Shallow DOF, warm lighting, appetizing styling.",
    longDescription:
      "Food photography workflow using FLUX Dev for maximum photorealism. Warm lighting and shallow depth of field prompts create magazine-quality food imagery. 20 steps at CFG 3.5. Useful for restaurant menus, recipe blogs, and food brand content creation.",
    category: "specialty",
    vram: "16GB",
    difficulty: "Beginner",
    model: "flux1-dev-fp8.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~22s on RTX 5080",
    resolution: "1024×1024",
    tags: ["food", "photography", "FLUX", "restaurant", "16GB"],
  },
  {
    id: "45-sdxl-sci-fi-scene",
    title: "SDXL Sci-Fi Environment",
    description:
      "Cinematic sci-fi interior scenes. Space station, holographic displays, crew. Movie quality.",
    longDescription:
      "Science fiction environment workflow for film, game, and book cover art. Holographic display and space station prompts create Star Trek/The Expanse atmosphere. 30 steps for maximum environmental detail. Use as background plates for compositing or standalone illustrations.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Intermediate",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["sci-fi", "environment", "SDXL", "cinematic", "8GB"],
  },
  {
    id: "47-sdxl-abstract-art",
    title: "SDXL Abstract Art",
    description:
      "Flowing geometric abstract art. Gallery-quality output for prints and digital art.",
    longDescription:
      "Abstract art workflow with geometric and flow-field prompts. DPM++ 2M Karras at 25 steps delivers smooth color gradients and clean geometric forms. CFG 7.5 for strong artistic direction. Suitable for NFT generation, wall art prints, and digital illustration backgrounds.",
    category: "specialty",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~5s on RTX 5080",
    resolution: "1024×1024",
    tags: ["abstract", "art", "geometric", "SDXL", "8GB"],
  },
  {
    id: "48-flux-wildlife-photo",
    title: "FLUX Wildlife Photography",
    description:
      "National Geographic quality wildlife shots. Telephoto lens simulation, golden hour.",
    longDescription:
      "Wildlife photography workflow using FLUX Dev for photorealistic animal generation. Telephoto lens and golden hour prompts create that classic wildlife photography look. Lion in African savanna pre-loaded. Swap subject for any animal. 20 steps at CFG 3.5.",
    category: "image",
    vram: "16GB",
    difficulty: "Beginner",
    model: "flux1-dev.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~22s on RTX 5080",
    resolution: "1024×1024",
    tags: ["wildlife", "photography", "FLUX", "nature", "16GB"],
  },
  {
    id: "49-sdxl-night-city",
    title: "SDXL Night City Aerial",
    description:
      "Long-exposure aerial city photography. Light trails, city grid, Tokyo-style density.",
    longDescription:
      "Night city aerial photography workflow. Long-exposure lighting prompts create light trail effects from car traffic. City grid prompts force dense urban topology. 30 steps at CFG 7.5 for maximum urban detail. Perfect for cinematic background plates and editorial illustration.",
    category: "image",
    vram: "8GB",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~6s on RTX 5080",
    resolution: "1024×1024",
    tags: ["city", "aerial", "night", "SDXL", "8GB"],
  },
  {
    id: "50-flux-dev-portrait-v2",
    title: "FLUX Cinematic Portrait",
    description:
      "Film grain analog portrait workflow. Side lighting, moody atmosphere, cinematic feel.",
    longDescription:
      "The most cinematic portrait workflow in the neuraldrift library. Film grain and analog photography prompts simulate a 35mm film aesthetic. Side lighting for dramatic moody shadows. FLUX Dev with separate loaders for maximum quality. Optimized for photorealistic character studies.",
    category: "image",
    vram: "16GB",
    difficulty: "Intermediate",
    model: "flux1-dev.safetensors",
    version: "v1.0",
    customNodes: [],
    genTime: "~22s on RTX 5080",
    resolution: "1024×1024",
    tags: ["FLUX", "cinematic", "film", "portrait", "16GB"],
    featured: true,
  },
];

export function getWorkflowsByCategory(cat: WorkflowCategory) {
  return WORKFLOWS.filter((w) => w.category === cat);
}

export function getWorkflowsByVRAM(vram: VRAMTier) {
  const order: VRAMTier[] = ["6GB", "8GB", "10GB", "12GB", "16GB", "24GB"];
  const max = order.indexOf(vram);
  return WORKFLOWS.filter((w) => order.indexOf(w.vram) <= max);
}

export function getFeaturedWorkflows() {
  return WORKFLOWS.filter((w) => w.featured);
}

export function getWorkflow(id: string) {
  return WORKFLOWS.find((w) => w.id === id);
}
