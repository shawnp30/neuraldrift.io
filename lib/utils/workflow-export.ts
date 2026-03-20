// ── NeuralHub Workflow Export Engine ────────────────────────────────────────
// Loads a ComfyUI JSON template and injects user-configured values.
// Produces a valid, loadable ComfyUI workflow JSON file.

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
  };
  params: Record<string, string | number | boolean>;
  modelFilename?: string;
}

// Template token map — maps placeholder tokens to config values
function buildTokenMap(config: ExportConfig): Record<string, string> {
  const { profile, params, hardwareTier } = config;

  const seed = params.seed === -1 || params.seed === undefined
    ? Math.floor(Math.random() * 9999999999)
    : Number(params.seed);

  const loraName = String(params.lora_name || "your_lora.safetensors");
  const loraStrength = Number(params.lora_strength ?? 0.8);

  return {
    // Hardware profile values
    "__WIDTH__": String(profile.width),
    "__HEIGHT__": String(profile.height),
    "__STEPS__": String(profile.steps),
    "__CFG__": String(profile.cfg),
    "__DENOISE__": String(profile.denoise),
    "__SAMPLER__": profile.sampler,
    "__SCHEDULER__": profile.scheduler,
    "__BATCH_SIZE__": String(profile.batchSize),
    "__FRAMES__": String(profile.frames ?? 24),
    "__MOTION_SCALE__": String(params.motion_scale ?? profile.motionScale ?? 1.0),
    "__SEED__": String(seed),
    "__HARDWARE_TIER__": hardwareTier,

    // Prompts
    "__POSITIVE_PROMPT__": String(params.positive_prompt || ""),
    "__NEGATIVE_PROMPT__": String(params.negative_prompt || ""),

    // LoRA
    "__LORA_NAME__": loraName,
    "__LORA_STRENGTH__": String(loraStrength),

    // Model
    "__MODEL_FILENAME__": config.modelFilename || "model.safetensors",
  };
}

// Inject tokens into JSON string
function injectTokens(jsonStr: string, tokenMap: Record<string, string>): string {
  let result = jsonStr;

  for (const [token, value] of Object.entries(tokenMap)) {
    // Handle both quoted string tokens ("__TOKEN__") and bare numeric tokens (__TOKEN__)
    // Quoted: replace entire quoted string including quotes
    result = result.split(`"${token}"`).join(JSON.stringify(value));
    // Bare: replace numeric/boolean placeholder
    result = result.split(token).join(value);
  }

  return result;
}

// Handle LoRA disabled state — if lora_enabled is false, bypass LoRA node
function handleLoraDisabled(jsonObj: Record<string, unknown>, loraEnabled: boolean): Record<string, unknown> {
  if (loraEnabled) return jsonObj;

  const nodes = jsonObj.nodes as Array<Record<string, unknown>>;
  if (!nodes) return jsonObj;

  // Find LoRA nodes and set them to bypass mode (mode: 4)
  const updatedNodes = nodes.map((node) => {
    if (
      node.type === "LoraLoader" ||
      node.type === "LoraLoaderModelOnly"
    ) {
      return { ...node, mode: 4 }; // mode 4 = bypassed in ComfyUI
    }
    return node;
  });

  return { ...jsonObj, nodes: updatedNodes };
}

// Main export function — called client-side
export async function exportWorkflow(config: ExportConfig): Promise<string> {
  const { workflowId } = config;

  // Load the template
  const templateUrl = `/api/workflow-template/${workflowId}`;
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Template not found for workflow: ${workflowId}`);
  }

  const templateJson = await response.text();

  // Build token map and inject values
  const tokenMap = buildTokenMap(config);
  let injectedJson = injectTokens(templateJson, tokenMap);

  // Parse and handle LoRA disabled state
  let workflowObj = JSON.parse(injectedJson) as Record<string, unknown>;
  workflowObj = handleLoraDisabled(workflowObj, Boolean(config.params.lora_enabled));

  // Add NeuralHub metadata
  workflowObj.extra = {
    ...(workflowObj.extra as Record<string, unknown> || {}),
    neuralhub: {
      workflow_id: workflowId,
      hardware_tier: config.hardwareTier,
      exported_at: new Date().toISOString(),
      generated_by: "NeuralHub.ai Workflow Configurator",
      launch_flags: config.profile.extraFlags.join(" "),
    },
  };

  return JSON.stringify(workflowObj, null, 2);
}
