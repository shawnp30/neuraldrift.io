// NeuralHub Workflow Export Engine
// Built around real ComfyUI workflows tested on RTX 5080 + RTX 3080

import type { HardwareTier } from "@/data/workflows";

export interface ExportConfig {
  workflowId: string;
  hardwareTier: HardwareTier;
  profile: {
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
    estimatedTime: string;
    label: string;
  };
  params: Record<string, string | number | boolean>;
  modelFilename?: string;
}

// Model format definitions
interface ModelFormat {
  loaderType: "gguf" | "safetensors";
  filename: string;
  sizeGB: number;
  downloadUrl: string;
  placePath: string;
  requiresNode?: string;
}

const LTX_MODEL_FORMATS: Record<string, ModelFormat> = {
  "gguf-q8": {
    loaderType: "gguf",
    filename: "ltx-video-2b-v0.9.5-distilled_fp8_scaled_q8_0.gguf",
    sizeGB: 18.6,
    downloadUrl: "https://huggingface.co/city96/LTX-Video-2.0-gguf",
    placePath: "ComfyUI/models/unet/",
    requiresNode: "ComfyUI-GGUF",
  },
  "gguf-q4": {
    loaderType: "gguf",
    filename: "ltx-video-2b-v0.9.5-distilled_q4_k_m.gguf",
    sizeGB: 10.2,
    downloadUrl: "https://huggingface.co/city96/LTX-Video-2.0-gguf",
    placePath: "ComfyUI/models/unet/",
    requiresNode: "ComfyUI-GGUF",
  },
  "safetensors": {
    loaderType: "safetensors",
    filename: "ltx-video-2b-v0.9.1.safetensors",
    sizeGB: 9.4,
    downloadUrl: "https://huggingface.co/Lightricks/LTX-Video",
    placePath: "ComfyUI/models/checkpoints/",
  },
};

// Build the left-side info note content
function buildInfoNote(workflowId: string, tier: string, profile: ExportConfig["profile"], modelFmt?: ModelFormat): string {
  const modelInfo = modelFmt
    ? `Model: ${modelFmt.filename}\nSize: ${modelFmt.sizeGB}GB\nPlace in: ${modelFmt.placePath}\nDownload: ${modelFmt.downloadUrl}${modelFmt.requiresNode ? `\nRequires node: ${modelFmt.requiresNode}` : ""}`
    : "See NeuralHub.ai for model details";

  return [
    "NeuralHub.ai -- " + workflowId,
    "",
    "Hardware: " + tier + " -- " + profile.label,
    "Resolution: " + profile.width + " x " + profile.height,
    "Frames: " + (profile.frames || 97),
    "Steps: " + profile.steps + " | CFG: " + profile.cfg,
    "Sampler: " + profile.sampler + " | Scheduler: " + profile.scheduler,
    "Launch flags: " + (profile.extraFlags.join(" ") || "none"),
    "Est. time: " + profile.estimatedTime,
    "",
    "-- Required Models --",
    modelInfo,
    "",
    "neuralhub.ai",
  ].join("\n");
}

// LTX Video 2 - GGUF variant (UnetLoaderGGUF)
function getLTXGGUFTemplate(filename: string): object {
  return {
    last_node_id: 14, last_link_id: 14,
    nodes: [
      { id: 1, type: "UnetLoaderGGUF", pos: [460, 200], size: [360, 80], flags: {}, order: 0, mode: 0, inputs: [], outputs: [{ name: "MODEL", type: "MODEL", links: [1] }], properties: { "Node name for S&R": "Load UNet (GGUF)" }, widgets_values: [filename, "auto"] },
      { id: 2, type: "DualCLIPLoader", pos: [460, 310], size: [360, 110], flags: {}, order: 1, mode: 0, inputs: [], outputs: [{ name: "CLIP", type: "CLIP", links: [2] }], properties: { "Node name for S&R": "DualCLIPLoader" }, widgets_values: ["", "", "bf16", "default"] },
      { id: 3, type: "CLIPTextEncode", pos: [860, 200], size: [380, 140], flags: {}, order: 2, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [3] }], properties: { "Node name for S&R": "Positive Prompt" }, widgets_values: ["INJECT_POSITIVE"] },
      { id: 4, type: "CLIPTextEncode", pos: [860, 370], size: [380, 140], flags: {}, order: 3, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [4] }], properties: { "Node name for S&R": "Negative Prompt" }, widgets_values: ["INJECT_NEGATIVE"] },
      { id: 5, type: "EmptyLTXVLatentVideo", pos: [460, 460], size: [360, 170], flags: {}, order: 4, mode: 0, inputs: [], outputs: [{ name: "LATENT", type: "LATENT", links: [5] }], properties: { "Node name for S&R": "Empty Latent Video" }, widgets_values: [512, 768, 97, 1] },
      { id: 6, type: "LTXVConditioning", pos: [1280, 280], size: [320, 140], flags: {}, order: 5, mode: 0, inputs: [{ name: "positive", type: "CONDITIONING", link: 3 }, { name: "negative", type: "CONDITIONING", link: 4 }], outputs: [{ name: "positive", type: "CONDITIONING", links: [6] }, { name: "negative", type: "CONDITIONING", links: [7] }], properties: { "Node name for S&R": "LTXVConditioning" }, widgets_values: [25.0] },
      { id: 7, type: "CFGGuider", pos: [1280, 160], size: [320, 120], flags: {}, order: 6, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 1 }, { name: "positive", type: "CONDITIONING", link: 6 }, { name: "negative", type: "CONDITIONING", link: 7 }], outputs: [{ name: "GUIDER", type: "GUIDER", links: [8] }], properties: { "Node name for S&R": "CFGGuider" }, widgets_values: [3.0] },
      { id: 8, type: "KSamplerSelect", pos: [1280, 450], size: [320, 80], flags: {}, order: 7, mode: 0, inputs: [], outputs: [{ name: "SAMPLER", type: "SAMPLER", links: [9] }], properties: { "Node name for S&R": "KSamplerSelect" }, widgets_values: ["euler"] },
      { id: 9, type: "BasicScheduler", pos: [1280, 560], size: [320, 120], flags: {}, order: 8, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 1 }], outputs: [{ name: "SIGMAS", type: "SIGMAS", links: [10] }], properties: { "Node name for S&R": "BasicScheduler" }, widgets_values: ["beta", 25, 1.0] },
      { id: 10, type: "RandomNoise", pos: [1280, 710], size: [320, 80], flags: {}, order: 9, mode: 0, inputs: [], outputs: [{ name: "NOISE", type: "NOISE", links: [11] }], properties: { "Node name for S&R": "RandomNoise" }, widgets_values: [42, "fixed"] },
      { id: 11, type: "SamplerCustom", pos: [1640, 280], size: [360, 140], flags: {}, order: 10, mode: 0, inputs: [{ name: "noise", type: "NOISE", link: 11 }, { name: "guider", type: "GUIDER", link: 8 }, { name: "sampler", type: "SAMPLER", link: 9 }, { name: "sigmas", type: "SIGMAS", link: 10 }, { name: "latent_image", type: "LATENT", link: 5 }], outputs: [{ name: "output", type: "LATENT", links: [12] }], properties: { "Node name for S&R": "SamplerCustom" }, widgets_values: [] },
      { id: 12, type: "LTXVDecode", pos: [2040, 280], size: [320, 110], flags: {}, order: 11, mode: 0, inputs: [{ name: "samples", type: "LATENT", link: 12 }], outputs: [{ name: "IMAGE", type: "IMAGE", links: [13] }], properties: { "Node name for S&R": "LTXVDecode" }, widgets_values: [] },
      { id: 13, type: "VHS_VideoCombine", pos: [2400, 280], size: [340, 220], flags: {}, order: 12, mode: 0, inputs: [{ name: "images", type: "IMAGE", link: 13 }, { name: "audio", type: "AUDIO", link: null }], outputs: [{ name: "Filenames", type: "VHS_FILENAMES", links: [] }], properties: { "Node name for S&R": "VHS_VideoCombine" }, widgets_values: [24, 1, "neuralhub_ltx", "video/h264-mp4", true, "default", []] },
      { id: 14, type: "Note", pos: [20, 160], size: [400, 500], flags: {}, order: 13, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["INJECT_NOTE"] },
    ],
    links: [[1,1,0,7,0,"MODEL"],[2,2,0,3,0,"CLIP"],[3,3,0,6,0,"CONDITIONING"],[4,4,0,6,1,"CONDITIONING"],[5,5,0,11,4,"LATENT"],[6,6,0,7,1,"CONDITIONING"],[7,6,1,7,2,"CONDITIONING"],[8,7,0,11,1,"GUIDER"],[9,8,0,11,2,"SAMPLER"],[10,9,0,11,3,"SIGMAS"],[11,10,0,11,0,"NOISE"],[12,11,0,12,0,"LATENT"],[13,12,0,13,0,"IMAGE"]],
    groups: [{ title: "NeuralHub -- LTX Chase Pipeline", bounding: [0, 140, 2800, 800], color: "#1a2030", font_size: 24 }],
    config: {}, extra: { ds: { scale: 0.6, offset: [0, 0] } }, version: 0.4
  };
}

// LTX Video - safetensors variant
function getLTXSafetensorsTemplate(filename: string): object {
  return {
    last_node_id: 14, last_link_id: 14,
    nodes: [
      { id: 1, type: "LTXVLoader", pos: [460, 200], size: [360, 130], flags: {}, order: 0, mode: 0, inputs: [], outputs: [{ name: "model", type: "LTXV", links: [1] }, { name: "vae", type: "VAE", links: [4] }], properties: { "Node name for S&R": "LTXVLoader" }, widgets_values: [filename, "bfloat16"] },
      { id: 2, type: "CLIPLoader", pos: [460, 360], size: [360, 82], flags: {}, order: 1, mode: 0, inputs: [], outputs: [{ name: "CLIP", type: "CLIP", links: [2] }], properties: { "Node name for S&R": "CLIPLoader" }, widgets_values: ["t5xxl_fp8_e4m3fn.safetensors", "ltxv"] },
      { id: 3, type: "CLIPTextEncode", pos: [860, 200], size: [380, 140], flags: {}, order: 2, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [3] }], properties: { "Node name for S&R": "Positive Prompt" }, widgets_values: ["INJECT_POSITIVE"] },
      { id: 4, type: "CLIPTextEncode", pos: [860, 370], size: [380, 140], flags: {}, order: 3, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [4] }], properties: { "Node name for S&R": "Negative Prompt" }, widgets_values: ["INJECT_NEGATIVE"] },
      { id: 5, type: "EmptyLTXVLatentVideo", pos: [460, 480], size: [360, 170], flags: {}, order: 4, mode: 0, inputs: [], outputs: [{ name: "LATENT", type: "LATENT", links: [5] }], properties: { "Node name for S&R": "Empty Latent Video" }, widgets_values: [512, 768, 97, 1] },
      { id: 6, type: "LTXVConditioning", pos: [1280, 280], size: [320, 140], flags: {}, order: 5, mode: 0, inputs: [{ name: "positive", type: "CONDITIONING", link: 3 }, { name: "negative", type: "CONDITIONING", link: 4 }], outputs: [{ name: "positive", type: "CONDITIONING", links: [6] }, { name: "negative", type: "CONDITIONING", links: [7] }], properties: {}, widgets_values: [25.0] },
      { id: 7, type: "CFGGuider", pos: [1280, 160], size: [320, 120], flags: {}, order: 6, mode: 0, inputs: [{ name: "model", type: "LTXV", link: 1 }, { name: "positive", type: "CONDITIONING", link: 6 }, { name: "negative", type: "CONDITIONING", link: 7 }], outputs: [{ name: "GUIDER", type: "GUIDER", links: [8] }], properties: {}, widgets_values: [3.0] },
      { id: 8, type: "KSamplerSelect", pos: [1280, 450], size: [320, 80], flags: {}, order: 7, mode: 0, inputs: [], outputs: [{ name: "SAMPLER", type: "SAMPLER", links: [9] }], properties: {}, widgets_values: ["euler"] },
      { id: 9, type: "BasicScheduler", pos: [1280, 560], size: [320, 120], flags: {}, order: 8, mode: 0, inputs: [{ name: "model", type: "LTXV", link: 1 }], outputs: [{ name: "SIGMAS", type: "SIGMAS", links: [10] }], properties: {}, widgets_values: ["beta", 25, 1.0] },
      { id: 10, type: "RandomNoise", pos: [1280, 710], size: [320, 80], flags: {}, order: 9, mode: 0, inputs: [], outputs: [{ name: "NOISE", type: "NOISE", links: [11] }], properties: {}, widgets_values: [42, "fixed"] },
      { id: 11, type: "SamplerCustom", pos: [1640, 280], size: [360, 140], flags: {}, order: 10, mode: 0, inputs: [{ name: "noise", type: "NOISE", link: 11 }, { name: "guider", type: "GUIDER", link: 8 }, { name: "sampler", type: "SAMPLER", link: 9 }, { name: "sigmas", type: "SIGMAS", link: 10 }, { name: "latent_image", type: "LATENT", link: 5 }], outputs: [{ name: "output", type: "LATENT", links: [12] }], properties: {}, widgets_values: [] },
      { id: 12, type: "LTXVDecode", pos: [2040, 280], size: [320, 110], flags: {}, order: 11, mode: 0, inputs: [{ name: "samples", type: "LATENT", link: 12 }, { name: "vae", type: "VAE", link: 4 }], outputs: [{ name: "IMAGE", type: "IMAGE", links: [13] }], properties: {}, widgets_values: [] },
      { id: 13, type: "VHS_VideoCombine", pos: [2400, 280], size: [340, 220], flags: {}, order: 12, mode: 0, inputs: [{ name: "images", type: "IMAGE", link: 13 }, { name: "audio", type: "AUDIO", link: null }], outputs: [], properties: {}, widgets_values: [24, 1, "neuralhub_ltx", "video/h264-mp4", true, "default", []] },
      { id: 14, type: "Note", pos: [20, 160], size: [400, 500], flags: {}, order: 13, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["INJECT_NOTE"] },
    ],
    links: [[1,1,0,7,0,"LTXV"],[2,2,0,3,0,"CLIP"],[3,3,0,6,0,"CONDITIONING"],[4,4,0,6,1,"CONDITIONING"],[5,5,0,11,4,"LATENT"],[6,6,0,7,1,"CONDITIONING"],[7,6,1,7,2,"CONDITIONING"],[8,7,0,11,1,"GUIDER"],[9,8,0,11,2,"SAMPLER"],[10,9,0,11,3,"SIGMAS"],[11,10,0,11,0,"NOISE"],[12,11,0,12,0,"LATENT"],[13,12,0,13,0,"IMAGE"]],
    groups: [{ title: "NeuralHub -- LTX Chase Pipeline", bounding: [0, 140, 2800, 800], color: "#1a2030", font_size: 24 }],
    config: {}, extra: { ds: { scale: 0.6, offset: [0, 0] } }, version: 0.4
  };
}

function getFLUXTemplate(): object {
  return {
    last_node_id: 11, last_link_id: 11,
    nodes: [
      { id: 1, type: "UNETLoader", pos: [460, 300], size: [315, 82], flags: {}, order: 0, mode: 0, inputs: [], outputs: [{ name: "MODEL", type: "MODEL", links: [1] }], properties: {}, widgets_values: ["flux1-dev-fp8.safetensors", "fp8_e4m3fn"] },
      { id: 2, type: "DualCLIPLoader", pos: [460, 420], size: [315, 106], flags: {}, order: 1, mode: 0, inputs: [], outputs: [{ name: "CLIP", type: "CLIP", links: [10, 11] }], properties: {}, widgets_values: ["t5xxl_fp16.safetensors", "clip_l.safetensors", "flux"] },
      { id: 3, type: "VAELoader", pos: [460, 560], size: [315, 58], flags: {}, order: 2, mode: 0, inputs: [], outputs: [{ name: "VAE", type: "VAE", links: [4] }], properties: {}, widgets_values: ["ae.safetensors"] },
      { id: 4, type: "LoraLoaderModelOnly", pos: [820, 300], size: [315, 106], flags: {}, order: 3, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 1 }], outputs: [{ name: "MODEL", type: "MODEL", links: [2] }], properties: {}, widgets_values: ["INJECT_LORA", 0.8] },
      { id: 5, type: "CLIPTextEncodeFlux", pos: [820, 100], size: [422, 200], flags: {}, order: 4, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 10 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [5] }], properties: {}, widgets_values: ["INJECT_POSITIVE", "INJECT_POSITIVE", 3.5] },
      { id: 6, type: "CLIPTextEncode", pos: [820, 420], size: [422, 120], flags: {}, order: 5, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 11 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [6] }], properties: {}, widgets_values: ["INJECT_NEGATIVE"] },
      { id: 7, type: "EmptySD3LatentImage", pos: [460, 650], size: [315, 106], flags: {}, order: 6, mode: 0, inputs: [], outputs: [{ name: "LATENT", type: "LATENT", links: [7] }], properties: {}, widgets_values: [1024, 1024, 1] },
      { id: 8, type: "KSampler", pos: [1280, 300], size: [315, 262], flags: {}, order: 7, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 2 }, { name: "positive", type: "CONDITIONING", link: 5 }, { name: "negative", type: "CONDITIONING", link: 6 }, { name: "latent_image", type: "LATENT", link: 7 }], outputs: [{ name: "LATENT", type: "LATENT", links: [8] }], properties: {}, widgets_values: [42, "fixed", 20, 3.5, "euler", "simple", 1.0] },
      { id: 9, type: "VAEDecode", pos: [1640, 300], size: [210, 46], flags: {}, order: 8, mode: 0, inputs: [{ name: "samples", type: "LATENT", link: 8 }, { name: "vae", type: "VAE", link: 4 }], outputs: [{ name: "IMAGE", type: "IMAGE", links: [9] }], properties: {}, widgets_values: [] },
      { id: 10, type: "SaveImage", pos: [1900, 300], size: [315, 58], flags: {}, order: 9, mode: 0, inputs: [{ name: "images", type: "IMAGE", link: 9 }], outputs: [], properties: {}, widgets_values: ["neuralhub_flux"] },
      { id: 11, type: "Note", pos: [20, 160], size: [400, 420], flags: {}, order: 10, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["INJECT_NOTE"] },
    ],
    links: [[1,1,0,4,0,"MODEL"],[2,4,0,8,0,"MODEL"],[4,3,0,9,1,"VAE"],[5,5,0,8,1,"CONDITIONING"],[6,6,0,8,2,"CONDITIONING"],[7,7,0,8,3,"LATENT"],[8,8,0,9,0,"LATENT"],[9,9,0,10,0,"IMAGE"],[10,2,0,5,0,"CLIP"],[11,2,0,6,0,"CLIP"]],
    groups: [], config: {}, extra: {}, version: 0.4
  };
}

function getSDXLTemplate(): object {
  return {
    last_node_id: 8, last_link_id: 9,
    nodes: [
      { id: 1, type: "CheckpointLoaderSimple", pos: [460, 300], size: [315, 98], flags: {}, order: 0, mode: 0, inputs: [], outputs: [{ name: "MODEL", type: "MODEL", links: [1] }, { name: "CLIP", type: "CLIP", links: [2, 3] }, { name: "VAE", type: "VAE", links: [4] }], properties: {}, widgets_values: ["sd_xl_base_1.0.safetensors"] },
      { id: 2, type: "CLIPTextEncode", pos: [820, 200], size: [422, 164], flags: {}, order: 1, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [5] }], properties: {}, widgets_values: ["INJECT_POSITIVE"] },
      { id: 3, type: "CLIPTextEncode", pos: [820, 400], size: [422, 164], flags: {}, order: 2, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 3 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [6] }], properties: {}, widgets_values: ["INJECT_NEGATIVE"] },
      { id: 4, type: "EmptyLatentImage", pos: [460, 440], size: [315, 106], flags: {}, order: 3, mode: 0, inputs: [], outputs: [{ name: "LATENT", type: "LATENT", links: [7] }], properties: {}, widgets_values: [1024, 1024, 4] },
      { id: 5, type: "KSampler", pos: [1280, 300], size: [315, 262], flags: {}, order: 4, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 1 }, { name: "positive", type: "CONDITIONING", link: 5 }, { name: "negative", type: "CONDITIONING", link: 6 }, { name: "latent_image", type: "LATENT", link: 7 }], outputs: [{ name: "LATENT", type: "LATENT", links: [8] }], properties: {}, widgets_values: [42, "fixed", 20, 7.0, "dpmpp_2m", "karras", 1.0] },
      { id: 6, type: "VAEDecode", pos: [1640, 300], size: [210, 46], flags: {}, order: 5, mode: 0, inputs: [{ name: "samples", type: "LATENT", link: 8 }, { name: "vae", type: "VAE", link: 4 }], outputs: [{ name: "IMAGE", type: "IMAGE", links: [9] }], properties: {}, widgets_values: [] },
      { id: 7, type: "SaveImage", pos: [1900, 300], size: [315, 58], flags: {}, order: 6, mode: 0, inputs: [{ name: "images", type: "IMAGE", link: 9 }], outputs: [], properties: {}, widgets_values: ["neuralhub_sdxl"] },
      { id: 8, type: "Note", pos: [20, 160], size: [400, 380], flags: {}, order: 7, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["INJECT_NOTE"] },
    ],
    links: [[1,1,0,5,0,"MODEL"],[2,1,1,2,0,"CLIP"],[3,1,1,3,0,"CLIP"],[4,1,2,6,1,"VAE"],[5,2,0,5,1,"CONDITIONING"],[6,3,0,5,2,"CONDITIONING"],[7,4,0,5,3,"LATENT"],[8,5,0,6,0,"LATENT"],[9,6,0,7,0,"IMAGE"]],
    groups: [], config: {}, extra: {}, version: 0.4
  };
}

function getAnimateDiffTemplate(): object {
  return {
    last_node_id: 10, last_link_id: 12,
    nodes: [
      { id: 1, type: "CheckpointLoaderSimple", pos: [460, 400], size: [315, 98], flags: {}, order: 0, mode: 0, inputs: [], outputs: [{ name: "MODEL", type: "MODEL", links: [1] }, { name: "CLIP", type: "CLIP", links: [2, 3] }, { name: "VAE", type: "VAE", links: [4] }], properties: {}, widgets_values: ["dreamshaperXL_v21TurboDPMSDE.safetensors"] },
      { id: 2, type: "ADE_AnimateDiffLoaderWithContext", pos: [820, 400], size: [315, 130], flags: {}, order: 1, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 1 }], outputs: [{ name: "MODEL", type: "MODEL", links: [10] }], properties: {}, widgets_values: ["animatediff_v15_3.safetensors", "lcm >> sqrt_linear", null] },
      { id: 3, type: "LoraLoader", pos: [1160, 400], size: [315, 130], flags: {}, order: 2, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 10 }, { name: "clip", type: "CLIP", link: 2 }], outputs: [{ name: "MODEL", type: "MODEL", links: [11] }, { name: "CLIP", type: "CLIP", links: [12] }], properties: {}, widgets_values: ["INJECT_LORA", 0.75, 0.75] },
      { id: 4, type: "CLIPTextEncode", pos: [820, 200], size: [422, 164], flags: {}, order: 3, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 12 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [5] }], properties: {}, widgets_values: ["INJECT_POSITIVE"] },
      { id: 5, type: "CLIPTextEncode", pos: [820, 560], size: [422, 120], flags: {}, order: 4, mode: 0, inputs: [{ name: "clip", type: "CLIP", link: 3 }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING", links: [6] }], properties: {}, widgets_values: ["INJECT_NEGATIVE"] },
      { id: 6, type: "EmptyLatentImage", pos: [460, 560], size: [315, 106], flags: {}, order: 5, mode: 0, inputs: [], outputs: [{ name: "LATENT", type: "LATENT", links: [7] }], properties: {}, widgets_values: [512, 768, 24] },
      { id: 7, type: "KSampler", pos: [1520, 300], size: [315, 262], flags: {}, order: 6, mode: 0, inputs: [{ name: "model", type: "MODEL", link: 11 }, { name: "positive", type: "CONDITIONING", link: 5 }, { name: "negative", type: "CONDITIONING", link: 6 }, { name: "latent_image", type: "LATENT", link: 7 }], outputs: [{ name: "LATENT", type: "LATENT", links: [8] }], properties: {}, widgets_values: [42, "fixed", 20, 7.0, "dpmpp_2m", "karras", 1.0] },
      { id: 8, type: "VAEDecode", pos: [1880, 300], size: [210, 46], flags: {}, order: 7, mode: 0, inputs: [{ name: "samples", type: "LATENT", link: 8 }, { name: "vae", type: "VAE", link: 4 }], outputs: [{ name: "IMAGE", type: "IMAGE", links: [9] }], properties: {}, widgets_values: [] },
      { id: 9, type: "VHS_VideoCombine", pos: [2140, 300], size: [315, 198], flags: {}, order: 8, mode: 0, inputs: [{ name: "images", type: "IMAGE", link: 9 }, { name: "audio", type: "AUDIO", link: null }], outputs: [], properties: {}, widgets_values: [12, 1, "neuralhub_animatediff", "video/h264-mp4", true, "default", []] },
      { id: 10, type: "Note", pos: [20, 160], size: [400, 420], flags: {}, order: 9, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["INJECT_NOTE"] },
    ],
    links: [[1,1,0,2,0,"MODEL"],[2,1,1,3,1,"CLIP"],[3,1,1,5,0,"CLIP"],[4,1,2,8,1,"VAE"],[5,4,0,7,1,"CONDITIONING"],[6,5,0,7,2,"CONDITIONING"],[7,6,0,7,3,"LATENT"],[8,7,0,8,0,"LATENT"],[9,8,0,9,0,"IMAGE"],[10,2,0,3,0,"MODEL"],[11,3,0,7,0,"MODEL"],[12,3,1,4,0,"CLIP"]],
    groups: [], config: {}, extra: {}, version: 0.4
  };
}

export function exportWorkflow(config: ExportConfig): string {
  const { workflowId, hardwareTier, profile, params } = config;

  const seed = params.seed === -1 || params.seed === undefined
    ? Math.floor(Math.random() * 9999999999)
    : Number(params.seed);

  const loraName = String(params.lora_name || "your_lora.safetensors");
  const loraStrength = Number(params.lora_strength ?? 0.8);
  const positive = String(params.positive_prompt || "");
  const negative = String(params.negative_prompt || "");
  const modelFormat = String(params.model_format || "gguf-q8");

  // Select template based on workflow and model format
  let workflow: ReturnType<typeof getLTXGGUFTemplate>;
  let modelFmt: ModelFormat | undefined;

  if (workflowId === "ltx-cinematic-chase") {
    modelFmt = LTX_MODEL_FORMATS[modelFormat] || LTX_MODEL_FORMATS["gguf-q8"];
    if (modelFmt.loaderType === "gguf") {
      workflow = JSON.parse(JSON.stringify(getLTXGGUFTemplate(modelFmt.filename)));
    } else {
      workflow = JSON.parse(JSON.stringify(getLTXSafetensorsTemplate(modelFmt.filename)));
    }
  } else if (workflowId === "flux-portrait-lora") {
    workflow = JSON.parse(JSON.stringify(getFLUXTemplate()));
  } else if (workflowId === "sdxl-concept-batch") {
    workflow = JSON.parse(JSON.stringify(getSDXLTemplate()));
  } else if (workflowId === "animatediff-character-loop") {
    workflow = JSON.parse(JSON.stringify(getAnimateDiffTemplate()));
  } else {
    throw new Error("No template for workflow: " + workflowId);
  }

  const noteContent = buildInfoNote(workflowId, hardwareTier, profile, modelFmt);

  const nodes = (workflow as unknown as { nodes: Array<Record<string, unknown>> }).nodes;

  (workflow as unknown as { nodes: Array<Record<string, unknown>> }).nodes = nodes.map((node) => {
    const wv = node.widgets_values as Array<unknown>;
    if (!wv) return node;
    const updated = [...wv];
    const type = node.type as string;

    switch (type) {
      case "CLIPTextEncode":
        if (String(updated[0]).includes("INJECT_POSITIVE")) updated[0] = positive;
        if (String(updated[0]).includes("INJECT_NEGATIVE")) updated[0] = negative;
        break;
      case "CLIPTextEncodeFlux":
        updated[0] = positive;
        updated[1] = positive;
        break;
      case "KSampler":
        updated[0] = seed;
        updated[2] = profile.steps;
        updated[3] = profile.cfg;
        updated[4] = profile.sampler;
        updated[5] = profile.scheduler;
        updated[6] = profile.denoise;
        break;
      case "EmptyLatentImage":
        updated[0] = profile.width;
        updated[1] = profile.height;
        updated[2] = profile.batchSize;
        break;
      case "EmptySD3LatentImage":
        updated[0] = profile.width;
        updated[1] = profile.height;
        break;
      case "EmptyLTXVLatentVideo":
        updated[0] = profile.width;
        updated[1] = profile.height;
        updated[2] = profile.frames || 97;
        break;
      case "BasicScheduler":
        // widgets_values: [scheduler, steps, denoise]
        updated[0] = profile.scheduler;
        updated[1] = profile.steps;
        updated[2] = profile.denoise;
        break;
      case "CFGGuider":
        updated[0] = profile.cfg;
        break;
      case "KSamplerSelect":
        updated[0] = profile.sampler;
        break;
      case "RandomNoise":
        updated[0] = seed;
        updated[1] = "fixed";
        break;
      case "LoraLoader":
      case "LoraLoaderModelOnly":
        updated[0] = loraName;
        updated[1] = loraStrength;
        if (updated.length > 2) updated[2] = loraStrength;
        if (!params.lora_enabled) {
          return { ...node, mode: 4, widgets_values: updated };
        }
        break;
      case "Note":
        if (String(updated[0]).includes("INJECT_NOTE")) {
          updated[0] = noteContent;
        }
        break;
    }

    return { ...node, widgets_values: updated };
  });

  (workflow as unknown as { extra: Record<string, unknown> }).extra = {
    ...(workflow as unknown as { extra: Record<string, unknown> }).extra,
    neuralhub: {
      workflow_id: workflowId,
      hardware_tier: hardwareTier,
      model_format: modelFormat,
      exported_at: new Date().toISOString(),
      generated_by: "NeuralHub.ai",
    },
  };

  return JSON.stringify(workflow, null, 2);
}
