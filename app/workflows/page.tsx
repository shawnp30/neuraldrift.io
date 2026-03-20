"use client"
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";



type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface WorkflowConfig {
  steps: number;
  cfg: number;
  denoise: number;
  sampler: string;
  scheduler: string;
  resolution: string;
  frames?: number;
  motionScale?: number;
}

interface SystemReq {
  minVRAM: number;
  recVRAM: number;
  gpus: string[];
  cpuOk: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: Difficulty;
  model: string;
  config: WorkflowConfig;
  system: SystemReq;
  tags: string[];
  downloadUrl: string;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "ltx-cinematic-chase",
    name: "LTX Cinematic Chase Sequence",
    description:
      "Five-clip action chase pipeline. Low tracking shots, motion blur, temporal coherence across clips. Outputs vertical 512x768 for Shorts/TikTok.",
    type: "Video",
    difficulty: "Advanced",
    model: "ltx-video-2b-v0.9.1.safetensors",
    config: {
      steps: 25,
      cfg: 3.0,
      denoise: 1.0,
      sampler: "euler",
      scheduler: "beta",
      resolution: "512x768",
      frames: 97,
      motionScale: 1.3,
    },
    system: {
      minVRAM: 10,
      recVRAM: 16,
      gpus: ["RTX 5080", "RTX 4090", "RTX 3080 16GB", "RTX 3090"],
      cpuOk: false,
    },
    tags: ["LTX Video", "Action", "Vertical", "Short-form"],
    downloadUrl: "#",
  },
  {
    id: "flux-portrait-lora",
    name: "FLUX Portrait + LoRA Injection",
    description:
      "High-quality portrait workflow with LoRA support. Optimized for character consistency with face detailing pass via Impact Pack.",
    type: "Image",
    difficulty: "Intermediate",
    model: "flux1-dev-fp8.safetensors",
    config: {
      steps: 20,
      cfg: 3.5,
      denoise: 1.0,
      sampler: "euler",
      scheduler: "simple",
      resolution: "1024x1024",
    },
    system: {
      minVRAM: 12,
      recVRAM: 16,
      gpus: ["RTX 5080", "RTX 4090", "RTX 3080 16GB", "RTX 3090", "RTX 4080"],
      cpuOk: false,
    },
    tags: ["FLUX", "Portrait", "LoRA", "Face Detail"],
    downloadUrl: "#",
  },
  {
    id: "animatediff-character-loop",
    name: "AnimateDiff Character Loop",
    description:
      "Seamless looping animation for short-form content. Character LoRA compatible. Outputs 24-frame GIF or MP4.",
    type: "Animation",
    difficulty: "Intermediate",
    model: "dreamshaper-xl.safetensors",
    config: {
      steps: 20,
      cfg: 7.0,
      denoise: 1.0,
      sampler: "dpmpp_2m",
      scheduler: "karras",
      resolution: "512x512",
      frames: 24,
      motionScale: 1.0,
    },
    system: {
      minVRAM: 8,
      recVRAM: 12,
      gpus: ["RTX 5080", "RTX 4090", "RTX 3080", "RTX 3070", "RTX 3060 12GB"],
      cpuOk: false,
    },
    tags: ["AnimateDiff", "Loop", "Character", "Animation"],
    downloadUrl: "#",
  },
  {
    id: "sdxl-batch-concept",
    name: "SDXL Batch Concept Generator",
    description:
      "Generate 8 concept variations in one run. Uses prompt weighting and seed iteration. Great for character design sheets.",
    type: "Image",
    difficulty: "Beginner",
    model: "sd_xl_base_1.0.safetensors",
    config: {
      steps: 20,
      cfg: 7.0,
      denoise: 1.0,
      sampler: "dpmpp_2m",
      scheduler: "karras",
      resolution: "1024x1024",
    },
    system: {
      minVRAM: 6,
      recVRAM: 10,
      gpus: [
        "RTX 5080",
        "RTX 4090",
        "RTX 3080",
        "RTX 3070",
        "RTX 3060",
        "RTX 2080",
      ],
      cpuOk: true,
    },
    tags: ["SDXL", "Batch", "Concept Art", "Design"],
    downloadUrl: "#",
  },
  {
    id: "ltx-fat-bigfoot-pov",
    name: "Fat Bigfoot GoPro POV",
    description:
      "Handheld GoPro POV workflow optimized for the Fat Bigfoot character. Chaotic movement, fisheye lens simulation, forest environments.",
    type: "Video",
    difficulty: "Advanced",
    model: "ltx-video-2b-v0.9.1.safetensors",
    config: {
      steps: 30,
      cfg: 3.5,
      denoise: 1.0,
      sampler: "euler",
      scheduler: "beta",
      resolution: "512x768",
      frames: 65,
      motionScale: 1.8,
    },
    system: {
      minVRAM: 10,
      recVRAM: 16,
      gpus: ["RTX 5080", "RTX 4090", "RTX 3080 16GB", "RTX 3090"],
      cpuOk: false,
    },
    tags: ["LTX Video", "POV", "Character", "Fat Bigfoot"],
    downloadUrl: "#",
  },
  {
    id: "flux-schnell-speed-run",
    name: "FLUX Schnell Speed Run",
    description:
      "Maximum throughput image generation. 4-step inference, 4x batch size, no quality compromises for concept iteration.",
    type: "Image",
    difficulty: "Beginner",
    model: "flux1-schnell-fp8.safetensors",
    config: {
      steps: 4,
      cfg: 1.0,
      denoise: 1.0,
      sampler: "euler",
      scheduler: "simple",
      resolution: "1024x1024",
    },
    system: {
      minVRAM: 8,
      recVRAM: 12,
      gpus: ["RTX 5080", "RTX 4090", "RTX 3080", "RTX 3070", "RTX 3060 12GB"],
      cpuOk: false,
    },
    tags: ["FLUX Schnell", "Speed", "Batch", "Iteration"],
    downloadUrl: "#",
  },
];

const DIFF_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

const TYPE_STYLES: Record<string, string> = {
  Video: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Image: "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  Animation: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
};

const VRAM_COLOR = (vram: number) => {
  if (vram <= 8) return "text-[#a3e635]";
  if (vram <= 12) return "text-[#f97316]";
  return "text-[#ef4444]";
};

export default function WorkflowsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
              // ComfyUI Workflows
            </p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
              Ready-to-run
              <br />
              workflow library.
            </h1>
            <p className="text-muted max-w-lg leading-relaxed">
              Download, drop into ComfyUI, and generate. Every workflow includes
              full config specs, VRAM requirements, and hardware compatibility.
            </p>
          </div>
          <Link
            href="/workflows/create"
            className="bg-accent text-black px-6 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            + Create Workflow
          </Link>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 gap-6">
          {WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-colors"
            >
              <div className="grid grid-cols-[1fr_340px]">
                {/* Left: Info */}
                <div className="p-8 border-r border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${TYPE_STYLES[wf.type] || "bg-white/5 text-muted"}`}
                    >
                      {wf.type}
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[wf.difficulty]}`}
                    >
                      {wf.difficulty}
                    </span>
                  </div>

                  <h3 className="font-syne text-xl font-bold text-white mb-2 tracking-tight">
                    {wf.name}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-6">
                    {wf.description}
                  </p>

                  {/* Model */}
                  <div className="mb-4">
                    <p className="font-mono text-xs text-muted tracking-widest uppercase mb-1">
                      Model
                    </p>
                    <p className="font-mono text-xs text-accent">{wf.model}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {wf.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs bg-white/4 text-muted px-2 py-1 rounded tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Config + System */}
                <div className="p-8 flex flex-col gap-6">
                  {/* ComfyUI Config */}
                  <div>
                    <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
                      ComfyUI Config
                    </p>
                    <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs space-y-1.5">
                      <ConfigRow
                        label="Steps"
                        value={wf.config.steps.toString()}
                      />
                      <ConfigRow
                        label="CFG Scale"
                        value={wf.config.cfg.toFixed(1)}
                      />
                      <ConfigRow
                        label="Denoise"
                        value={wf.config.denoise.toFixed(1)}
                      />
                      <ConfigRow label="Sampler" value={wf.config.sampler} />
                      <ConfigRow
                        label="Scheduler"
                        value={wf.config.scheduler}
                      />
                      <ConfigRow
                        label="Resolution"
                        value={wf.config.resolution}
                      />
                      {wf.config.frames && (
                        <ConfigRow
                          label="Frames"
                          value={wf.config.frames.toString()}
                        />
                      )}
                      {wf.config.motionScale && (
                        <ConfigRow
                          label="Motion Scale"
                          value={wf.config.motionScale.toFixed(1)}
                        />
                      )}
                    </div>
                  </div>

                  {/* System Requirements */}
                  <div>
                    <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
                      System Requirements
                    </p>
                    <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-muted">Min VRAM</span>
                        <span className={VRAM_COLOR(wf.system.minVRAM)}>
                          {wf.system.minVRAM}GB
                        </span>
                      </div>
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-muted">Rec VRAM</span>
                        <span className="text-white">
                          {wf.system.recVRAM}GB
                        </span>
                      </div>
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-muted">CPU Mode</span>
                        <span
                          className={
                            wf.system.cpuOk
                              ? "text-[#a3e635]"
                              : "text-[#ef4444]"
                          }
                        >
                          {wf.system.cpuOk ? "Supported" : "GPU Only"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="font-mono text-xs text-muted mb-1.5">
                          Compatible GPUs
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {wf.system.gpus.map((gpu) => (
                            <span
                              key={gpu}
                              className="font-mono text-xs bg-white/4 text-muted px-1.5 py-0.5 rounded text-[10px]"
                            >
                              {gpu}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download */}
                  <a
                    href={wf.downloadUrl}
                    className="block text-center bg-accent text-black py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity mt-auto"
                  >
                    Download Workflow JSON
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ComputeAtlas CTA */}
        <div className="mt-16 bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl p-12 text-center">
          <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-3">
            // Heavy Workflows
          </p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">
            Running out of VRAM?
          </h2>
          <p className="text-muted max-w-md mx-auto mb-6 leading-relaxed text-sm">
            Route heavy batch jobs and high-res video generation to ComputeAtlas
            GPU cloud. Pay per minute, no subscription.
          </p>
          <Link
            href="https://computeatlas.ai"
            target="_blank"
            className="inline-block bg-accent-purple text-white px-6 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
          >
            Explore ComputeAtlas â†’
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-accent">{value}</span>
    </div>
  );
}

