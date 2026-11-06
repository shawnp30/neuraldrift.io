import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOG, WORKFLOW_ASSETS } from "./catalog";
import aliasData from "@/data/model-file-aliases.json";
import verificationData from "@/data/model-file-verification.json";

// One page per model file referenced by the workflow catalog. A download source is
// only shown when scripts/verify-model-sources.mjs confirmed the file exists there.

export interface VerifiedSource {
  host: "huggingface" | "github";
  repo: string;
  path: string;
  downloadUrl: string;
  pageUrl: string;
  sizeBytes: number;
  sha256: string | null;
  gated: boolean;
}

interface ModelFileAlias {
  officialFile: string;
  officialUrl: string;
  note: string;
}

export type SourceStatus = "verified" | "renamed" | "unverified";

export interface ModelFile {
  slug: string;
  file: string;
  /** Path below the ComfyUI install, e.g. "ComfyUI/models/checkpoints/". */
  dir: string;
  folder: string;
  loaderNodes: string[];
  workflowIds: string[];
  source: VerifiedSource | null;
  alias: ModelFileAlias | null;
  status: SourceStatus;
}

const ALIASES: Record<string, ModelFileAlias> = aliasData;
const VERIFICATION = verificationData as { checkedAt: string; files: Record<string, VerifiedSource> };
export const SOURCES_CHECKED_AT = VERIFICATION.checkedAt;

export const FOLDER_LABELS: Record<string, string> = {
  checkpoints: "Checkpoints",
  diffusion_models: "Diffusion models",
  text_encoders: "Text encoders",
  vae: "VAE",
  loras: "LoRAs",
  controlnet: "ControlNet",
  upscale_models: "Upscale models",
  latent_upscale_models: "Latent upscale models",
  animatediff_models: "AnimateDiff motion modules",
};

// Display names of core ComfyUI loader nodes. Other node types are shown by type name.
export const LOADER_DISPLAY_NAMES: Record<string, string> = {
  CheckpointLoaderSimple: "Load Checkpoint",
  VAELoader: "Load VAE",
  LoraLoader: "Load LoRA",
  UNETLoader: "Load Diffusion Model",
  CLIPLoader: "Load CLIP",
  ControlNetLoader: "Load ControlNet Model",
  UpscaleModelLoader: "Load Upscale Model",
};

// diffusers stores every model under the same default name, so a page for that name
// could not say which model it is.
const GENERIC_FILE_NAMES = /^diffusion_pytorch_model(\.fp16)?\.safetensors$/;

export function modelFileSlug(file: string): string {
  return file.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface GraphNode {
  type?: string;
  class_type?: string;
  widgets_values?: unknown;
  inputs?: unknown;
}

interface WorkflowGraph {
  nodes?: GraphNode[];
  definitions?: { subgraphs?: { nodes?: GraphNode[] }[] };
}

/** Node types in a workflow JSON (UI or API format, including subgraphs) that reference `file`. */
function loaderNodesFor(graph: WorkflowGraph, file: string): string[] {
  const uiNodes = [...(graph.nodes ?? []), ...(graph.definitions?.subgraphs ?? []).flatMap((s) => s.nodes ?? [])];
  const nodes: GraphNode[] = graph.nodes ? uiNodes : Object.values(graph as Record<string, GraphNode>);
  return nodes
    .filter((node) => {
      const values = node.widgets_values ?? node.inputs;
      return values !== null && typeof values === "object" && Object.values(values).includes(file);
    })
    .map((node) => node.type ?? node.class_type ?? "")
    .filter(Boolean);
}

function buildModelFiles(): ModelFile[] {
  const byFile = new Map<string, ModelFile>();
  for (const workflow of CATALOG) {
    const asset = WORKFLOW_ASSETS[workflow.id];
    if (!asset) continue;
    const graph = JSON.parse(readFileSync(join(process.cwd(), "public", "workflows", `${workflow.id}.json`), "utf8")) as WorkflowGraph;
    for (const model of asset.models) {
      if (GENERIC_FILE_NAMES.test(model.file)) continue;
      const entry = byFile.get(model.file) ?? {
        slug: modelFileSlug(model.file),
        file: model.file,
        dir: model.dir,
        folder: model.dir.replace(/^ComfyUI\/models\//, "").replace(/\/$/, ""),
        loaderNodes: [],
        workflowIds: [],
        source: VERIFICATION.files[model.file] ?? null,
        alias: ALIASES[model.file] ?? null,
        status: "unverified" as SourceStatus,
      };
      entry.workflowIds.push(workflow.id);
      for (const node of loaderNodesFor(graph, model.file)) {
        if (!entry.loaderNodes.includes(node)) entry.loaderNodes.push(node);
      }
      byFile.set(model.file, entry);
    }
  }
  for (const entry of byFile.values()) {
    entry.status = !entry.source ? "unverified" : entry.alias ? "renamed" : "verified";
  }
  return [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file, "en", { sensitivity: "base" }));
}

export const MODEL_FILES: ModelFile[] = buildModelFiles();

/** Pages with a confirmed official source are indexable; the rest stay reachable but noindex. */
export function isIndexableModelFile(model: ModelFile): boolean {
  return model.status !== "unverified";
}

export function getModelFile(slug: string): ModelFile | undefined {
  return MODEL_FILES.find((model) => model.slug === slug);
}

export function getModelFileByName(file: string): ModelFile | undefined {
  return MODEL_FILES.find((model) => model.file === file);
}

export function formatBytes(bytes: number): string {
  return bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${Math.round(bytes / 1e6)} MB`;
}
