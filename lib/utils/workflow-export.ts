// NeuralHub Workflow Export Engine v3
// Uses real ComfyUI workflow files as templates
// Injects user-configured values into specific node widget_values by node ID

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

// Node injection map - defines which widget_values indices to update per node type
type NodeInjection = {
  nodeId: number;
  nodeType: string;
  inject: Record<number | string, "positive_prompt" | "negative_prompt" | "width" | "height" | "steps" | "cfg" | "sampler" | "scheduler" | "denoise" | "seed" | "frames" | "batch_size" | "lora_name" | "lora_strength" | "note">;
};

// Injection maps for each workflow
const INJECTION_MAPS: Record<string, NodeInjection[]> = {

  // LTX 2.3 - subgraph node, inject dimensions and frames only
  // Prompt must be set inside the subgraph in ComfyUI
  "ltx-cinematic-chase": [
    {
      nodeId: 267,
      nodeType: "b94257db-cdc1-45d3-8913-ca61e782d9c1",
      inject: {
        6: "width",
        7: "height",
        8: "frames",
      }
    }
  ],

  // LTX2 GGUF subgraph - inject dimensions and frames
  "ltx-gguf": [
    {
      nodeId: 92,
      nodeType: "b7c2d337-c38d-4c04-922b-2d638449d13e",
      inject: {
        4: "width",
        5: "height",
        6: "frames",
      }
    }
  ],

  // Z-Image Turbo - full injection into subgraph node
  // wv[0]=prompt, wv[1]=width, wv[2]=height, wv[3]=steps
  "z-image-turbo": [
    {
      nodeId: 57,
      nodeType: "f2fdebf6-dfaf-43b6-9eb2-7f70613cfdc1",
      inject: {
        0: "positive_prompt",
        1: "width",
        2: "height",
        3: "steps",
      }
    }
  ],

  // SDXL - standard nodes, full injection
  "sdxl-concept-batch": [
    {
      nodeId: 5,
      nodeType: "EmptyLatentImage",
      inject: {
        0: "width",
        1: "height",
        2: "batch_size",
      }
    },
    {
      nodeId: 6,
      nodeType: "CLIPTextEncode", // positive
      inject: {
        0: "positive_prompt",
      }
    },
    {
      nodeId: 7,
      nodeType: "CLIPTextEncode", // negative
      inject: {
        0: "negative_prompt",
      }
    },
    {
      nodeId: 10,
      nodeType: "KSamplerAdvanced",
      // wv: [add_noise, seed, control_after, steps, cfg, sampler, scheduler, start, end, return_noise]
      inject: {
        1: "seed",
        3: "steps",
        4: "cfg",
        5: "sampler",
        6: "scheduler",
      }
    }
  ],

  // Qwen Image - standard nodes
  "qwen-image": [
    {
      nodeId: 58,
      nodeType: "EmptySD3LatentImage",
      inject: {
        0: "width",
        1: "height",
      }
    },
    {
      nodeId: 6,
      nodeType: "CLIPTextEncode", // positive
      inject: {
        0: "positive_prompt",
      }
    },
    {
      nodeId: 7,
      nodeType: "CLIPTextEncode", // negative
      inject: {
        0: "negative_prompt",
      }
    },
    {
      nodeId: 3,
      nodeType: "KSampler",
      // wv: [seed, control_after, steps, cfg, sampler, scheduler, denoise]
      inject: {
        0: "seed",
        2: "steps",
        3: "cfg",
        4: "sampler",
        5: "scheduler",
      }
    }
  ],
};

// Build value map from config
function buildValueMap(config: ExportConfig): Record<string, unknown> {
  const { profile, params } = config;
  const seed = params.seed === -1 || params.seed === undefined
    ? Math.floor(Math.random() * 9999999999)
    : Number(params.seed);

  return {
    positive_prompt: String(params.positive_prompt || ""),
    negative_prompt: String(params.negative_prompt || ""),
    width: profile.width,
    height: profile.height,
    steps: profile.steps,
    cfg: profile.cfg,
    sampler: profile.sampler,
    scheduler: profile.scheduler,
    denoise: profile.denoise,
    seed: seed,
    frames: profile.frames || 97,
    batch_size: profile.batchSize,
    lora_name: String(params.lora_name || ""),
    lora_strength: Number(params.lora_strength ?? 0.8),
    note: `NeuralHub.ai Export\nWorkflow: ${config.workflowId}\nHardware: ${config.hardwareTier} -- ${profile.label}\nResolution: ${profile.width}x${profile.height}\nSteps: ${profile.steps} | CFG: ${profile.cfg}\nFlags: ${profile.extraFlags.join(" ") || "none"}\nneuralhub.ai`,
  };
}

export function exportWorkflow(config: ExportConfig): string {
  const { workflowId, hardwareTier, profile } = config;

  // Get template (bundled as static import in production)
  const template = getTemplate(workflowId);
  if (!template) {
    throw new Error(`No template for workflow: ${workflowId}`);
  }

  const workflow = JSON.parse(JSON.stringify(template)) as {
    nodes: Array<Record<string, unknown>>;
    extra?: Record<string, unknown>;
    [key: string]: unknown;
  };

  const valueMap = buildValueMap(config);
  const injectionMap = INJECTION_MAPS[workflowId];

  if (!injectionMap) {
    throw new Error(`No injection map for workflow: ${workflowId}`);
  }

  // Apply injections
  workflow.nodes = (workflow.nodes as Array<Record<string, unknown>>).map((node) => {
    const injection = injectionMap.find(
      (m) => m.nodeId === node.id
    );
    if (!injection) return node;

    const widgetValues = [...(node.widgets_values as Array<unknown>)];

    for (const [indexStr, valueKey] of Object.entries(injection.inject)) {
      const index = Number(indexStr);
      const value = valueMap[valueKey];
      if (value !== undefined) {
        widgetValues[index] = value;
      }
    }

    return { ...node, widgets_values: widgetValues };
  });

  // Add NeuralHub metadata
  workflow.extra = {
    ...(workflow.extra || {}),
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

// Static template registry
// Templates are loaded from data/comfy-templates/ at build time
// In client-side usage they are bundled directly

import ltxTemplate from "@/data/comfy-templates/ltx-cinematic-chase.json";
import zImageTemplate from "@/data/comfy-templates/z-image-turbo.json";
import sdxlTemplate from "@/data/comfy-templates/sdxl-concept-batch.json";
import qwenTemplate from "@/data/comfy-templates/qwen-image.json";
import ltxGgufTemplate from "@/data/comfy-templates/ltx-gguf.json";

function getTemplate(workflowId: string): object | null {
  switch (workflowId) {
    case "ltx-cinematic-chase": return ltxTemplate;
    case "z-image-turbo": return zImageTemplate;
    case "sdxl-concept-batch": return sdxlTemplate;
    case "qwen-image": return qwenTemplate;
    case "ltx-gguf": return ltxGgufTemplate;
    default: return null;
  }
}
