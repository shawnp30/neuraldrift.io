import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = { title: "ComfyUI Workflows" };

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
      <main className="mx-auto max-w-7xl px-10 pb-20 pt-24">
        {/* Header */}
        <div className="mb-16 flex items-end justify-between">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
              // ComfyUI Workflows
            </p>
            <h1 className="mb-4 font-syne text-5xl font-black tracking-tight text-white">
              Ready-to-run
              <br />
              workflow library.
            </h1>
            <p className="max-w-lg leading-relaxed text-muted">
              Download, drop into ComfyUI, and generate. Every workflow includes
              full config specs, VRAM requirements, and hardware compatibility.
            </p>
          </div>
          <Link
            href="/workflows/create"
            className="whitespace-nowrap rounded bg-accent px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
          >
            + Create Workflow
          </Link>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 gap-6">
          {WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/20"
            >
              <div className="grid grid-cols-[1fr_340px]">
                {/* Left: Info */}
                <div className="border-r border-border p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${TYPE_STYLES[wf.type] || "bg-white/5 text-muted"}`}
                    >
                      {wf.type}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${DIFF_STYLES[wf.difficulty]}`}
                    >
                      {wf.difficulty}
                    </span>
                  </div>

                  <h3 className="mb-2 font-syne text-xl font-bold tracking-tight text-white">
                    {wf.name}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted">
                    {wf.description}
                  </p>

                  {/* Model */}
                  <div className="mb-4">
                    <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">
                      Model
                    </p>
                    <p className="font-mono text-xs text-accent">{wf.model}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {wf.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/4 rounded px-2 py-1 font-mono text-xs tracking-wide text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Config + System */}
                <div className="flex flex-col gap-6 p-8">
                  {/* ComfyUI Config */}
                  <div>
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
                      ComfyUI Config
                    </p>
                    <div className="space-y-1.5 rounded-lg border border-border bg-surface p-4 font-mono text-xs">
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
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
                      System Requirements
                    </p>
                    <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
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
                      <div className="border-t border-border pt-2">
                        <p className="mb-1.5 font-mono text-xs text-muted">
                          Compatible GPUs
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {wf.system.gpus.map((gpu) => (
                            <span
                              key={gpu}
                              className="bg-white/4 rounded px-1.5 py-0.5 font-mono text-[10px] text-xs text-muted"
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
                    className="mt-auto block rounded bg-accent py-2.5 text-center text-sm font-semibold text-black transition-opacity hover:opacity-85"
                  >
                    Download Workflow JSON
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ComputeAtlas CTA */}
        <div className="from-accent-purple/8 mt-16 rounded-xl border border-accent-purple/25 bg-gradient-to-br to-accent/5 p-12 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#a78bfa]">
            // Hardware Partner
          </p>
          <h2 className="mb-3 font-syne text-3xl font-black tracking-tight text-white">
            Running out of VRAM?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted">
            These workflows need serious hardware. ComputeAtlas helps you plan
            the right AI workstation — spec GPU, CPU, RAM, and storage before
            you buy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="https://computeatlas.ai/ai-hardware-estimator"
              target="_blank"
              className="inline-block rounded bg-accent-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              Estimate My Hardware →
            </Link>
            <Link
              href="https://computeatlas.ai/recommended-builds"
              target="_blank"
              className="hover:text-text inline-block rounded border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-muted transition-colors"
            >
              View Recommended Builds
            </Link>
          </div>
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
