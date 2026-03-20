// ── NeuralHub Workflow Export Engine ────────────────────────────────────────
// Templates are bundled directly — no API call needed.
// Produces valid, loadable ComfyUI workflow JSON files.

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

// ── Bundled templates ─────────────────────────────────────────────────────────

function getLTXTemplate(): object {
  return {
    last_node_id: 8,
    last_link_id: 9,
    nodes: [
      { id: 1, type: "CheckpointLoaderSimple", pos: [26, 474], size: {"0": 315, "1": 98}, flags: {}, order: 0, mode: 0, inputs: [], outputs: [{"name":"MODEL","type":"MODEL","links":[1],"slot_index":0},{"name":"CLIP","type":"CLIP","links":[2,3],"slot_index":1},{"name":"VAE","type":"VAE","links":[4],"slot_index":2}], properties: {}, widgets_values: ["REPLACE_MODEL"] },
      { id: 2, type: "CLIPTextEncode", pos: [415, 186], size: {"0": 422, "1": 164}, flags: {}, order: 2, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":2}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[5],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_POSITIVE"] },
      { id: 3, type: "CLIPTextEncode", pos: [415, 386], size: {"0": 422, "1": 164}, flags: {}, order: 3, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":3}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[6],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_NEGATIVE"] },
      { id: 4, type: "EmptyLTXVLatentVideo", pos: [26, 640], size: {"0": 315, "1": 130}, flags: {}, order: 1, mode: 0, inputs: [], outputs: [{"name":"LATENT","type":"LATENT","links":[7],"slot_index":0}], properties: {}, widgets_values: [512, 768, 97, 1] },
      { id: 5, type: "KSampler", pos: [905, 386], size: {"0": 315, "1": 262}, flags: {}, order: 4, mode: 0, inputs: [{"name":"model","type":"MODEL","link":1},{"name":"positive","type":"CONDITIONING","link":5},{"name":"negative","type":"CONDITIONING","link":6},{"name":"latent_image","type":"LATENT","link":7}], outputs: [{"name":"LATENT","type":"LATENT","links":[8],"slot_index":0}], properties: {}, widgets_values: [42, "fixed", 25, 3.0, "euler", "beta", 1.0] },
      { id: 6, type: "VAEDecodeTiled", pos: [1270, 386], size: {"0": 210, "1": 82}, flags: {}, order: 5, mode: 0, inputs: [{"name":"samples","type":"LATENT","link":8},{"name":"vae","type":"VAE","link":4}], outputs: [{"name":"IMAGE","type":"IMAGE","links":[9],"slot_index":0}], properties: {}, widgets_values: [512, 64, 64, 1] },
      { id: 7, type: "VHS_VideoCombine", pos: [1530, 386], size: {"0": 315, "1": 198}, flags: {}, order: 6, mode: 0, inputs: [{"name":"images","type":"IMAGE","link":9},{"name":"audio","type":"AUDIO","link":null}], outputs: [{"name":"Filenames","type":"VHS_FILENAMES","links":[],"slot_index":0}], properties: {}, widgets_values: [24, 1, "neuralhub_output", "video/h264-mp4", true, "default", []] },
      { id: 8, type: "Note", pos: [26, 200], size: {"0": 340, "1": 160}, flags: {}, order: 7, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["NeuralHub.ai — LTX Cinematic Chase\nHardware: REPLACE_TIER\nResolution: REPLACE_WxH\nFrames: REPLACE_FRAMES\nSteps: REPLACE_STEPS | CFG: REPLACE_CFG\nSampler: REPLACE_SAMPLER\nFlags: REPLACE_FLAGS\nneuralhub.ai"] },
    ],
    links: [[1,1,0,5,0,"MODEL"],[2,1,1,2,0,"CLIP"],[3,1,1,3,0,"CLIP"],[4,1,2,6,1,"VAE"],[5,2,0,5,1,"CONDITIONING"],[6,3,0,5,2,"CONDITIONING"],[7,4,0,5,3,"LATENT"],[8,5,0,6,0,"LATENT"],[9,6,0,7,0,"IMAGE"]],
    groups: [{"title":"NeuralHub LTX Chase Pipeline","bounding":[0,170,1900,700],"color":"#1a2030","font_size":24}],
    config: {}, extra: {}, version: 0.4,
  };
}

function getFLUXTemplate(): object {
  return {
    last_node_id: 11,
    last_link_id: 12,
    nodes: [
      { id: 1, type: "UNETLoader", pos: [26, 474], size: {"0": 315, "1": 82}, flags: {}, order: 0, mode: 0, inputs: [], outputs: [{"name":"MODEL","type":"MODEL","links":[1],"slot_index":0}], properties: {}, widgets_values: ["flux1-dev-fp8.safetensors", "fp8_e4m3fn"] },
      { id: 2, type: "DualCLIPLoader", pos: [26, 600], size: {"0": 315, "1": 106}, flags: {}, order: 1, mode: 0, inputs: [], outputs: [{"name":"CLIP","type":"CLIP","links":[10,11],"slot_index":0}], properties: {}, widgets_values: ["t5xxl_fp16.safetensors", "clip_l.safetensors", "flux"] },
      { id: 3, type: "VAELoader", pos: [26, 740], size: {"0": 315, "1": 58}, flags: {}, order: 2, mode: 0, inputs: [], outputs: [{"name":"VAE","type":"VAE","links":[4],"slot_index":0}], properties: {}, widgets_values: ["ae.safetensors"] },
      { id: 4, type: "LoraLoaderModelOnly", pos: [380, 474], size: {"0": 315, "1": 106}, flags: {}, order: 3, mode: 0, inputs: [{"name":"model","type":"MODEL","link":1}], outputs: [{"name":"MODEL","type":"MODEL","links":[2],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_LORA", 0.8] },
      { id: 5, type: "CLIPTextEncodeFlux", pos: [380, 186], size: {"0": 422, "1": 200}, flags: {}, order: 4, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":10}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[5],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_POSITIVE", "REPLACE_POSITIVE", 3.5] },
      { id: 6, type: "CLIPTextEncode", pos: [380, 420], size: {"0": 422, "1": 120}, flags: {}, order: 5, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":11}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[6],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_NEGATIVE"] },
      { id: 7, type: "EmptySD3LatentImage", pos: [26, 860], size: {"0": 315, "1": 106}, flags: {}, order: 6, mode: 0, inputs: [], outputs: [{"name":"LATENT","type":"LATENT","links":[7],"slot_index":0}], properties: {}, widgets_values: [1024, 1024, 1] },
      { id: 8, type: "KSampler", pos: [860, 386], size: {"0": 315, "1": 262}, flags: {}, order: 7, mode: 0, inputs: [{"name":"model","type":"MODEL","link":2},{"name":"positive","type":"CONDITIONING","link":5},{"name":"negative","type":"CONDITIONING","link":6},{"name":"latent_image","type":"LATENT","link":7}], outputs: [{"name":"LATENT","type":"LATENT","links":[8],"slot_index":0}], properties: {}, widgets_values: [42, "fixed", 20, 3.5, "euler", "simple", 1.0] },
      { id: 9, type: "VAEDecode", pos: [1220, 386], size: {"0": 210, "1": 46}, flags: {}, order: 8, mode: 0, inputs: [{"name":"samples","type":"LATENT","link":8},{"name":"vae","type":"VAE","link":4}], outputs: [{"name":"IMAGE","type":"IMAGE","links":[9],"slot_index":0}], properties: {}, widgets_values: [] },
      { id: 10, type: "SaveImage", pos: [1470, 386], size: {"0": 315, "1": 58}, flags: {}, order: 9, mode: 0, inputs: [{"name":"images","type":"IMAGE","link":9}], outputs: [], properties: {}, widgets_values: ["neuralhub_flux_portrait"] },
      { id: 11, type: "Note", pos: [26, 200], size: {"0": 340, "1": 160}, flags: {}, order: 10, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["NeuralHub.ai — FLUX Portrait\nHardware: REPLACE_TIER\nResolution: REPLACE_WxH\nSteps: REPLACE_STEPS | CFG: REPLACE_CFG\nLoRA: REPLACE_LORA @ REPLACE_LORA_STRENGTH\nneuralhub.ai"] },
    ],
    links: [[1,1,0,4,0,"MODEL"],[2,4,0,8,0,"MODEL"],[4,3,0,9,1,"VAE"],[5,5,0,8,1,"CONDITIONING"],[6,6,0,8,2,"CONDITIONING"],[7,7,0,8,3,"LATENT"],[8,8,0,9,0,"LATENT"],[9,9,0,10,0,"IMAGE"],[10,2,0,5,0,"CLIP"],[11,2,0,6,0,"CLIP"]],
    groups: [{"title":"NeuralHub FLUX Portrait Pipeline","bounding":[0,170,1850,750],"color":"#1a1530","font_size":24}],
    config: {}, extra: {}, version: 0.4,
  };
}

function getSDXLTemplate(): object {
  return {
    last_node_id: 8,
    last_link_id: 9,
    nodes: [
      { id: 1, type: "CheckpointLoaderSimple", pos: [26, 474], size: {"0": 315, "1": 98}, flags: {}, order: 0, mode: 0, inputs: [], outputs: [{"name":"MODEL","type":"MODEL","links":[1],"slot_index":0},{"name":"CLIP","type":"CLIP","links":[2,3],"slot_index":1},{"name":"VAE","type":"VAE","links":[4],"slot_index":2}], properties: {}, widgets_values: ["sd_xl_base_1.0.safetensors"] },
      { id: 2, type: "CLIPTextEncode", pos: [415, 186], size: {"0": 422, "1": 164}, flags: {}, order: 1, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":2}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[5],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_POSITIVE"] },
      { id: 3, type: "CLIPTextEncode", pos: [415, 386], size: {"0": 422, "1": 164}, flags: {}, order: 2, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":3}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[6],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_NEGATIVE"] },
      { id: 4, type: "EmptyLatentImage", pos: [26, 620], size: {"0": 315, "1": 106}, flags: {}, order: 3, mode: 0, inputs: [], outputs: [{"name":"LATENT","type":"LATENT","links":[7],"slot_index":0}], properties: {}, widgets_values: [1024, 1024, 4] },
      { id: 5, type: "KSampler", pos: [905, 386], size: {"0": 315, "1": 262}, flags: {}, order: 4, mode: 0, inputs: [{"name":"model","type":"MODEL","link":1},{"name":"positive","type":"CONDITIONING","link":5},{"name":"negative","type":"CONDITIONING","link":6},{"name":"latent_image","type":"LATENT","link":7}], outputs: [{"name":"LATENT","type":"LATENT","links":[8],"slot_index":0}], properties: {}, widgets_values: [42, "fixed", 20, 7.0, "dpmpp_2m", "karras", 1.0] },
      { id: 6, type: "VAEDecode", pos: [1270, 386], size: {"0": 210, "1": 46}, flags: {}, order: 5, mode: 0, inputs: [{"name":"samples","type":"LATENT","link":8},{"name":"vae","type":"VAE","link":4}], outputs: [{"name":"IMAGE","type":"IMAGE","links":[9],"slot_index":0}], properties: {}, widgets_values: [] },
      { id: 7, type: "SaveImage", pos: [1510, 386], size: {"0": 315, "1": 58}, flags: {}, order: 6, mode: 0, inputs: [{"name":"images","type":"IMAGE","link":9}], outputs: [], properties: {}, widgets_values: ["neuralhub_sdxl"] },
      { id: 8, type: "Note", pos: [26, 200], size: {"0": 340, "1": 140}, flags: {}, order: 7, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["NeuralHub.ai — SDXL Batch\nHardware: REPLACE_TIER\nResolution: REPLACE_WxH\nBatch: REPLACE_BATCH\nSteps: REPLACE_STEPS | CFG: REPLACE_CFG\nneuralhub.ai"] },
    ],
    links: [[1,1,0,5,0,"MODEL"],[2,1,1,2,0,"CLIP"],[3,1,1,3,0,"CLIP"],[4,1,2,6,1,"VAE"],[5,2,0,5,1,"CONDITIONING"],[6,3,0,5,2,"CONDITIONING"],[7,4,0,5,3,"LATENT"],[8,5,0,6,0,"LATENT"],[9,6,0,7,0,"IMAGE"]],
    groups: [{"title":"NeuralHub SDXL Batch Pipeline","bounding":[0,170,1890,680],"color":"#1a2415","font_size":24}],
    config: {}, extra: {}, version: 0.4,
  };
}

function getAnimateDiffTemplate(): object {
  return {
    last_node_id: 10,
    last_link_id: 12,
    nodes: [
      { id: 1, type: "CheckpointLoaderSimple", pos: [26, 474], size: {"0": 315, "1": 98}, flags: {}, order: 0, mode: 0, inputs: [], outputs: [{"name":"MODEL","type":"MODEL","links":[1],"slot_index":0},{"name":"CLIP","type":"CLIP","links":[2,3],"slot_index":1},{"name":"VAE","type":"VAE","links":[4],"slot_index":2}], properties: {}, widgets_values: ["dreamshaperXL_v21TurboDPMSDE.safetensors"] },
      { id: 2, type: "ADE_AnimateDiffLoaderWithContext", pos: [380, 474], size: {"0": 315, "1": 130}, flags: {}, order: 1, mode: 0, inputs: [{"name":"model","type":"MODEL","link":1}], outputs: [{"name":"MODEL","type":"MODEL","links":[10],"slot_index":0}], properties: {}, widgets_values: ["animatediff_v15_3.safetensors", "lcm >> sqrt_linear", null] },
      { id: 3, type: "LoraLoader", pos: [740, 474], size: {"0": 315, "1": 130}, flags: {}, order: 2, mode: 0, inputs: [{"name":"model","type":"MODEL","link":10},{"name":"clip","type":"CLIP","link":2}], outputs: [{"name":"MODEL","type":"MODEL","links":[11],"slot_index":0},{"name":"CLIP","type":"CLIP","links":[12],"slot_index":1}], properties: {}, widgets_values: ["REPLACE_LORA", 0.75, 0.75] },
      { id: 4, type: "CLIPTextEncode", pos: [415, 186], size: {"0": 422, "1": 164}, flags: {}, order: 3, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":12}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[5],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_POSITIVE"] },
      { id: 5, type: "CLIPTextEncode", pos: [415, 380], size: {"0": 422, "1": 120}, flags: {}, order: 4, mode: 0, inputs: [{"name":"clip","type":"CLIP","link":3}], outputs: [{"name":"CONDITIONING","type":"CONDITIONING","links":[6],"slot_index":0}], properties: {}, widgets_values: ["REPLACE_NEGATIVE"] },
      { id: 6, type: "EmptyLatentImage", pos: [26, 640], size: {"0": 315, "1": 106}, flags: {}, order: 5, mode: 0, inputs: [], outputs: [{"name":"LATENT","type":"LATENT","links":[7],"slot_index":0}], properties: {}, widgets_values: [512, 768, 24] },
      { id: 7, type: "KSampler", pos: [1100, 386], size: {"0": 315, "1": 262}, flags: {}, order: 6, mode: 0, inputs: [{"name":"model","type":"MODEL","link":11},{"name":"positive","type":"CONDITIONING","link":5},{"name":"negative","type":"CONDITIONING","link":6},{"name":"latent_image","type":"LATENT","link":7}], outputs: [{"name":"LATENT","type":"LATENT","links":[8],"slot_index":0}], properties: {}, widgets_values: [42, "fixed", 20, 7.0, "dpmpp_2m", "karras", 1.0] },
      { id: 8, type: "VAEDecode", pos: [1460, 386], size: {"0": 210, "1": 46}, flags: {}, order: 7, mode: 0, inputs: [{"name":"samples","type":"LATENT","link":8},{"name":"vae","type":"VAE","link":4}], outputs: [{"name":"IMAGE","type":"IMAGE","links":[9],"slot_index":0}], properties: {}, widgets_values: [] },
      { id: 9, type: "VHS_VideoCombine", pos: [1710, 386], size: {"0": 315, "1": 198}, flags: {}, order: 8, mode: 0, inputs: [{"name":"images","type":"IMAGE","link":9}], outputs: [], properties: {}, widgets_values: [12, 1, "neuralhub_animatediff", "video/h264-mp4", true, "default", []] },
      { id: 10, type: "Note", pos: [26, 200], size: {"0": 340, "1": 160}, flags: {}, order: 9, mode: 0, inputs: [], outputs: [], properties: {}, widgets_values: ["NeuralHub.ai — AnimateDiff Loop\nHardware: REPLACE_TIER\nResolution: REPLACE_WxH | Frames: REPLACE_FRAMES\nLoRA: REPLACE_LORA @ REPLACE_LORA_STRENGTH\nSteps: REPLACE_STEPS | CFG: REPLACE_CFG\nneuralhub.ai"] },
    ],
    links: [[1,1,0,2,0,"MODEL"],[2,1,1,3,1,"CLIP"],[3,1,1,5,0,"CLIP"],[4,1,2,8,1,"VAE"],[5,4,0,7,1,"CONDITIONING"],[6,5,0,7,2,"CONDITIONING"],[7,6,0,7,3,"LATENT"],[8,7,0,8,0,"LATENT"],[9,8,0,9,0,"IMAGE"],[10,2,0,3,0,"MODEL"],[11,3,0,7,0,"MODEL"],[12,3,1,4,0,"CLIP"]],
    groups: [{"title":"NeuralHub AnimateDiff Loop","bounding":[0,170,2100,720],"color":"#1a1520","font_size":24}],
    config: {}, extra: {}, version: 0.4,
  };
}

function getTemplate(workflowId: string): object {
  switch (workflowId) {
    case "ltx-cinematic-chase": return getLTXTemplate();
    case "flux-portrait-lora": return getFLUXTemplate();
    case "sdxl-concept-batch": return getSDXLTemplate();
    case "animatediff-character-loop": return getAnimateDiffTemplate();
    default: throw new Error(`No template for workflow: ${workflowId}`);
  }
}

// ── Injection engine ──────────────────────────────────────────────────────────

export function exportWorkflow(config: ExportConfig): string {
  const { workflowId, hardwareTier, profile, params, modelFilename } = config;

  const seed = params.seed === -1 || params.seed === undefined
    ? Math.floor(Math.random() * 9999999999)
    : Number(params.seed);

  const loraName = String(params.lora_name || "your_lora.safetensors");
  const loraStrength = Number(params.lora_strength ?? 0.8);
  const positivePrompt = String(params.positive_prompt || "");
  const negativePrompt = String(params.negative_prompt || "");

  // Deep clone template
  const workflow = JSON.parse(JSON.stringify(getTemplate(workflowId))) as {
    nodes: Array<Record<string, unknown>>;
    extra: Record<string, unknown>;
  };

  // Inject values into each node
  workflow.nodes = workflow.nodes.map((node: Record<string, unknown>) => {
    const widgetValues = node.widgets_values as Array<unknown>;
    if (!widgetValues) return node;

    const type = node.type as string;
    const updated = [...widgetValues];

    switch (type) {
      case "CheckpointLoaderSimple":
        updated[0] = modelFilename || widgetValues[0];
        break;
      case "UNETLoader":
        updated[0] = modelFilename || widgetValues[0];
        break;
      case "CLIPTextEncode":
        if (String(widgetValues[0]).includes("REPLACE_POSITIVE")) updated[0] = positivePrompt;
        if (String(widgetValues[0]).includes("REPLACE_NEGATIVE")) updated[0] = negativePrompt;
        break;
      case "CLIPTextEncodeFlux":
        if (String(widgetValues[0]).includes("REPLACE_POSITIVE")) {
          updated[0] = positivePrompt;
          updated[1] = positivePrompt;
        }
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
        updated[2] = profile.frames || profile.batchSize;
        break;
      case "EmptyLTXVLatentVideo":
        updated[0] = profile.width;
        updated[1] = profile.height;
        updated[2] = profile.frames || 97;
        break;
      case "EmptySD3LatentImage":
        updated[0] = profile.width;
        updated[1] = profile.height;
        break;
      case "LoraLoader":
      case "LoraLoaderModelOnly":
        updated[0] = loraName;
        updated[1] = loraStrength;
        if (updated.length > 2) updated[2] = loraStrength;
        // Bypass if LoRA not enabled
        if (!params.lora_enabled) {
          return { ...node, mode: 4, widgets_values: updated };
        }
        break;
      case "Note":
        updated[0] = String(widgetValues[0])
          .replace("REPLACE_TIER", `${hardwareTier} — ${profile.label}`)
          .replace("REPLACE_WxH", `${profile.width}×${profile.height}`)
          .replace("REPLACE_FRAMES", String(profile.frames || 97))
          .replace("REPLACE_STEPS", String(profile.steps))
          .replace("REPLACE_CFG", String(profile.cfg))
          .replace("REPLACE_SAMPLER", profile.sampler)
          .replace("REPLACE_FLAGS", profile.extraFlags.join(" ") || "none")
          .replace("REPLACE_BATCH", String(profile.batchSize))
          .replace("REPLACE_LORA", loraName)
          .replace("REPLACE_LORA_STRENGTH", String(loraStrength));
        break;
    }

    return { ...node, widgets_values: updated };
  });

  // Add NeuralHub metadata
  workflow.extra = {
    ...workflow.extra,
    neuralhub: {
      workflow_id: workflowId,
      hardware_tier: hardwareTier,
      exported_at: new Date().toISOString(),
      generated_by: "NeuralHub.ai",
      launch_flags: profile.extraFlags.join(" "),
      estimated_time: profile.estimatedTime,
    },
  };

  return JSON.stringify(workflow, null, 2);
}
