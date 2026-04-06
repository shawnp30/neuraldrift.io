import { WORKFLOWS, WorkflowEntry } from "./workflowsData";

export interface WorkflowMeta {
  description: string;
  category:
    | "flux"
    | "sdxl"
    | "sd15"
    | "ltx-video"
    | "animatediff"
    | "utility"
    | "controlnet"
    | "specialty";
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
    previewImage: "/workflow-thumbs/01.png",
  },
  // ... rest of the hardcoded overrides if any are still needed, but we will primarily use WORKFLOWS
};

/**
 * Maps a WorkflowEntry category to visual metadata
 */
function mapCategory(workflow: WorkflowEntry): Pick<WorkflowMeta, "category" | "categoryLabel" | "categoryColor" | "categoryBg"> {
  const cat = workflow.category;
  const tags = workflow.tags.map(t => t.toLowerCase());
  const model = workflow.model.toLowerCase();

  // Try to infer specific model-based category first
  if (model.includes("flux") || tags.includes("flux")) {
    return {
      category: "flux",
      categoryLabel: "FLUX",
      categoryColor: "text-cyan-400",
      categoryBg: "bg-cyan-400/10",
    };
  }
  if (model.includes("sdxl") || model.includes("sd_xl") || tags.includes("sdxl")) {
    return {
      category: "sdxl",
      categoryLabel: "SDXL",
      categoryColor: "text-indigo-400",
      categoryBg: "bg-indigo-400/10",
    };
  }
  if (model.includes("ltx")) {
    return {
      category: "ltx-video",
      categoryLabel: "LTX VIDEO",
      categoryColor: "text-rose-400",
      categoryBg: "bg-rose-400/10",
    };
  }
  if (tags.includes("animatediff")) {
    return {
      category: "animatediff",
      categoryLabel: "ANIMATEDIFF",
      categoryColor: "text-emerald-400",
      categoryBg: "bg-emerald-400/10",
    };
  }
  if (tags.includes("wan")) {
    return {
        category: "ltx-video",
        categoryLabel: "WAN 2.1",
        categoryColor: "text-rose-400",
        categoryBg: "bg-rose-400/10",
    };
  }

  // Fallback to general categories
  switch (cat) {
    case "video":
      return {
        category: "ltx-video",
        categoryLabel: "VIDEO",
        categoryColor: "text-rose-400",
        categoryBg: "bg-rose-400/10",
      };
    case "enhance":
      return {
        category: "utility",
        categoryLabel: "ENHANCE",
        categoryColor: "text-zinc-400",
        categoryBg: "bg-zinc-400/10",
      };
    case "controlnet":
      return {
        category: "controlnet",
        categoryLabel: "CONTROLNET",
        categoryColor: "text-violet-400",
        categoryBg: "bg-violet-400/10",
      };
    case "lora":
      return {
        category: "utility",
        categoryLabel: "LORA",
        categoryColor: "text-amber-400",
        categoryBg: "bg-amber-400/10",
      };
    default:
      return {
        category: "sdxl",
        categoryLabel: "GENERAL",
        categoryColor: "text-indigo-400",
        categoryBg: "bg-indigo-400/10",
      };
  }
}

/**
 * Returns metadata for a given workflow filename (without .json extension).
 * Falls back to sensible defaults for unlisted workflows.
 */
export function getWorkflowMeta(filename: string): WorkflowMeta {
  const key = filename.replace(/\.json$/, "");
  
  // 1. Try to find in WORKFLOWS by ID (slug)
  const idMatch = key.match(/^(\d+)/);
  const id = idMatch ? idMatch[1] : key;
  const workflow = WORKFLOWS.find(w => w.id === id);

  if (workflow) {
    const catMeta = mapCategory(workflow);
    return {
      description: workflow.description,
      previewImage: workflow.imageUrl,
      ...catMeta
    };
  }

  // 2. Fallback to hardcoded overrides
  if (WORKFLOW_META[key]) return WORKFLOW_META[key];

  // 3. Last resort fallbacks (for non-numbered files)
  const lower = key.toLowerCase();
  if (lower.includes("flux"))
    return {
      description: "A FLUX-based ComfyUI workflow.",
      category: "flux",
      categoryLabel: "FLUX",
      categoryColor: "text-cyan-400",
      categoryBg: "bg-cyan-400/10",
    };
  
  return {
    description: "A high-fidelity Stable Diffusion pipeline.",
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
