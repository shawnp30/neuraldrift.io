// lib/workflowMatcher.ts

export type GoalType = 'video' | 'image' | 'lora' | 'upscale'
export type VramTier = '8GB' | '12GB' | '16GB' | '24GB' | '48GB+'

export interface WorkflowMatch {
  id: string
  filename: string           // maps to /public/workflows/{filename}.json
  name: string
  desc: string
  model: string
  steps: number
  cfg: number
  vramRequired: number       // GB
  compatScore: number        // 0–100
  compatLabel: 'Perfect' | 'Good' | 'Tight' | 'Unsupported'
  tags: GoalType[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  guideSlug?: string
}

// ─── VRAM budget map ────────────────────────────────────────────────────────
const VRAM_BUDGET: Record<VramTier, number> = {
  '8GB':   8,
  '12GB':  12,
  '16GB':  16,
  '24GB':  24,
  '48GB+': 48,
}

// ─── Workflow registry ──────────────────────────────────────────────────────
// Sourced from your /public/workflows/ filenames + known specs
const REGISTRY: WorkflowMatch[] = [
  // ── IMAGE WORKFLOWS ────────────────────────────────────────────────────────
  {
    id: '01', filename: '01-flux-dev-t2i',
    name: 'FLUX Dev — Text to Image',
    desc: 'Highest quality FLUX output. Photorealistic, detailed. Best for final renders.',
    model: 'flux-dev', steps: 28, cfg: 3.5, vramRequired: 12,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Intermediate', estimatedTime: '45s/img',
    guideSlug: 'comfyui-complete-setup',
  },
  {
    id: '02', filename: '02-flux-schnell-fast',
    name: 'FLUX Schnell — Fast',
    desc: 'FLUX at 4-step speed. Near-identical quality to Dev at 5x the speed.',
    model: 'flux-schnell', steps: 4, cfg: 1.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Beginner', estimatedTime: '8s/img',
  },
  {
    id: '03', filename: '03-sdxl-standard',
    name: 'SDXL Standard',
    desc: 'Versatile all-rounder. Great for concept art, product shots, portraits.',
    model: 'sdxl-base-1.0', steps: 30, cfg: 7.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Beginner', estimatedTime: '20s/img',
  },
  {
    id: '06', filename: '06-sd15-classic',
    name: 'SD 1.5 Classic',
    desc: 'Lowest VRAM overhead of any workflow. Great for batch runs on constrained hardware.',
    model: 'sd-1.5', steps: 25, cfg: 7.0, vramRequired: 4,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Beginner', estimatedTime: '12s/img',
  },
  {
    id: '30', filename: '30-flux-portrait-v2',
    name: 'FLUX Portrait v2',
    desc: 'Dialed-in portrait lighting, skin detail, and bokeh. Cinematic quality.',
    model: 'flux-dev', steps: 32, cfg: 3.5, vramRequired: 12,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Intermediate', estimatedTime: '55s/img',
    guideSlug: 'comfyui-complete-setup',
  },
  {
    id: '40', filename: '40-flux-realistic-person',
    name: 'FLUX Realistic Person',
    desc: 'Full-body and headshot realism. Best model settings for human generation.',
    model: 'flux-dev', steps: 30, cfg: 3.5, vramRequired: 12,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Intermediate', estimatedTime: '50s/img',
  },
  {
    id: '39', filename: '39-sdxl-concept-art',
    name: 'SDXL Concept Art',
    desc: 'Environment design, character sheets, sci-fi/fantasy worldbuilding.',
    model: 'sdxl-base-1.0', steps: 35, cfg: 7.5, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['image'], difficulty: 'Beginner', estimatedTime: '25s/img',
  },
  // ── VIDEO WORKFLOWS ────────────────────────────────────────────────────────
  {
    id: '12', filename: '12-ltx-video-cinematic',
    name: 'LTX Video — Cinematic',
    desc: 'Smooth camera motion, filmic grade. 3–5s clips at production quality.',
    model: 'ltx-video', steps: 30, cfg: 3.5, vramRequired: 16,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['video'], difficulty: 'Intermediate', estimatedTime: '3–5 min/clip',
    guideSlug: 'ltx-video-cinematic-action',
  },
  {
    id: '13', filename: '13-ltx-video-action-chase',
    name: 'LTX Video — Action Chase',
    desc: 'High-motion action sequences. Optimized for fast movement and camera shake.',
    model: 'ltx-video', steps: 28, cfg: 3.5, vramRequired: 16,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['video'], difficulty: 'Advanced', estimatedTime: '4–6 min/clip',
    guideSlug: 'ltx-video-cinematic-action',
  },
  {
    id: '14', filename: '14-ltx-video-fast-draft',
    name: 'LTX Video — Fast Draft',
    desc: 'Quick iteration at 8GB. Lower steps, great for testing prompts before full render.',
    model: 'ltx-video', steps: 15, cfg: 3.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['video'], difficulty: 'Beginner', estimatedTime: '90s/clip',
  },
  {
    id: '15', filename: '15-animatediff-simple',
    name: 'AnimateDiff Simple Loop',
    desc: 'Smooth looping animation from SD 1.5. Perfect first video workflow.',
    model: 'animatediff-v3', steps: 20, cfg: 7.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['video'], difficulty: 'Beginner', estimatedTime: '2 min/clip',
  },
  {
    id: '16', filename: '16-animatediff-character',
    name: 'AnimateDiff Character',
    desc: 'Character animation with consistent face/body. LoRA compatible.',
    model: 'animatediff-v3', steps: 25, cfg: 7.5, vramRequired: 10,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['video'], difficulty: 'Intermediate', estimatedTime: '3 min/clip',
  },
  // ── LORA WORKFLOWS ─────────────────────────────────────────────────────────
  {
    id: '07', filename: '07-flux-lora-character',
    name: 'FLUX LoRA — Character',
    desc: 'Apply a trained character LoRA to FLUX Dev. Consistent identity across prompts.',
    model: 'flux-dev', steps: 30, cfg: 3.5, vramRequired: 12,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['lora', 'image'], difficulty: 'Intermediate', estimatedTime: '50s/img',
    guideSlug: 'train-flux-lora',
  },
  {
    id: '08', filename: '08-sdxl-lora-style',
    name: 'SDXL LoRA — Style Transfer',
    desc: 'Apply style LoRAs to SDXL. Artist aesthetics, film looks, illustration styles.',
    model: 'sdxl-base-1.0', steps: 30, cfg: 7.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['lora', 'image'], difficulty: 'Intermediate', estimatedTime: '22s/img',
    guideSlug: 'train-flux-lora',
  },
  {
    id: '46', filename: '46-flux-lora-slacker-alien',
    name: 'FLUX LoRA — Custom Concept',
    desc: 'LoRA-injected creative concept workflow. Swap in any trained LoRA.',
    model: 'flux-dev', steps: 28, cfg: 3.5, vramRequired: 12,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['lora', 'image'], difficulty: 'Advanced', estimatedTime: '45s/img',
  },
  // ── UPSCALE WORKFLOWS ──────────────────────────────────────────────────────
  {
    id: '21', filename: '21-upscale-4x-esrgan',
    name: '4x ESRGAN Upscale',
    desc: 'Real-ESRGAN 4x upscaling. No hallucination, pure detail enhancement.',
    model: 'realesrgan-x4', steps: 1, cfg: 1.0, vramRequired: 4,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['upscale'], difficulty: 'Beginner', estimatedTime: '5s/img',
  },
  {
    id: '22', filename: '22-upscale-anime',
    name: 'Anime Upscale',
    desc: 'Anime-optimized ESRGAN model. Crisp lines, no over-smoothing.',
    model: 'realesrgan-anime', steps: 1, cfg: 1.0, vramRequired: 4,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['upscale'], difficulty: 'Beginner', estimatedTime: '5s/img',
  },
  {
    id: '35', filename: '35-controlnet-tile',
    name: 'ControlNet Tile Upscale',
    desc: 'AI-enhanced upscaling with detail regeneration. 4x with added realism.',
    model: 'sdxl-base-1.0', steps: 20, cfg: 6.0, vramRequired: 8,
    compatScore: 0, compatLabel: 'Perfect',
    tags: ['upscale', 'image'], difficulty: 'Intermediate', estimatedTime: '30s/img',
  },
]

// ─── Scoring logic ──────────────────────────────────────────────────────────
function scoreWorkflow(w: WorkflowMatch, vramGB: number): WorkflowMatch {
  const headroom = vramGB - w.vramRequired
  let score: number
  let label: WorkflowMatch['compatLabel']

  if (headroom >= 6)      { score = 98; label = 'Perfect' }
  else if (headroom >= 3) { score = 88; label = 'Good' }
  else if (headroom >= 0) { score = 72; label = 'Tight' }
  else                    { score = 0;  label = 'Unsupported' }

  return { ...w, compatScore: score, compatLabel: label }
}

// ─── Public API ─────────────────────────────────────────────────────────────
export function getMatches(
  vram: VramTier,
  goal: GoalType,
  limit = 4
): WorkflowMatch[] {
  const budget = VRAM_BUDGET[vram]

  return REGISTRY
    .filter((w) => w.tags.includes(goal))
    .map((w) => scoreWorkflow(w, budget))
    .filter((w) => w.compatScore > 0)
    .sort((a, b) => b.compatScore - a.compatScore || a.vramRequired - b.vramRequired)
    .slice(0, limit)
}

export function getCompatColor(label: WorkflowMatch['compatLabel']) {
  return {
    Perfect:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Good:        'text-indigo-400  bg-indigo-500/10  border-indigo-500/30',
    Tight:       'text-amber-400   bg-amber-500/10   border-amber-500/30',
    Unsupported: 'text-red-400     bg-red-500/10     border-red-500/30',
  }[label]
}

export function getScoreBarColor(score: number) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 75) return 'bg-indigo-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}