"use client";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

type Category = "All" | "Image" | "Video" | "Training";

interface Benchmark {
  gpu: string;
  vram: number;
  yours?: boolean;
  model: string;
  modelType: Exclude<Category, "All">;
  resolution: string;
  steps: number;
  batchSize: number;
  timeSeconds: number;
  imagesPerMinute?: number;
  framesPerSecond?: number;
  precision: string;
  flags: string;
  notes?: string;
}

const BENCHMARKS: Benchmark[] = [
  // ── FLUX Dev FP8 ──────────────────────────────────────────────────────────
  {
    gpu: "RTX 5090",
    vram: 32,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 4.1,
    imagesPerMinute: 14.6,
    precision: "FP8",
    flags: "--gpu-only --highvram",
    notes: "Top consumer card",
  },
  {
    gpu: "RTX 5080",
    vram: 16,
    yours: true,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 8.1,
    imagesPerMinute: 7.4,
    precision: "FP8",
    flags: "--gpu-only --highvram",
  },
  {
    gpu: "RTX 4090",
    vram: 24,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 9.2,
    imagesPerMinute: 6.5,
    precision: "FP8",
    flags: "--gpu-only --highvram",
  },
  {
    gpu: "RTX 4080 Super",
    vram: 16,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 11.4,
    imagesPerMinute: 5.3,
    precision: "FP8",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 4070 Ti",
    vram: 12,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 18.2,
    imagesPerMinute: 3.3,
    precision: "FP8",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 3090",
    vram: 24,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 22.1,
    imagesPerMinute: 2.7,
    precision: "FP8",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 3080 16GB",
    vram: 16,
    yours: true,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 28.4,
    imagesPerMinute: 2.1,
    precision: "FP8",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 3080 10GB",
    vram: 10,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 38.0,
    imagesPerMinute: 1.6,
    precision: "FP8",
    flags: "--lowvram",
    notes: "Requires --lowvram",
  },
  {
    gpu: "RTX 3060 12GB",
    vram: 12,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 52.0,
    imagesPerMinute: 1.2,
    precision: "FP8",
    flags: "--lowvram",
  },
  {
    gpu: "GTX 1660 Ti",
    vram: 6,
    yours: true,
    model: "FLUX Dev FP8",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 0,
    imagesPerMinute: 0,
    precision: "FP8",
    flags: "N/A",
    notes: "OOM — not supported",
  },

  // ── SDXL FP16 ──────────────────────────────────────────────────────────────
  {
    gpu: "RTX 5090",
    vram: 32,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 4,
    timeSeconds: 4.8,
    imagesPerMinute: 50.0,
    precision: "FP16",
    flags: "--gpu-only --highvram",
  },
  {
    gpu: "RTX 5080",
    vram: 16,
    yours: true,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 4,
    timeSeconds: 12.8,
    imagesPerMinute: 18.8,
    precision: "FP16",
    flags: "--gpu-only --highvram",
  },
  {
    gpu: "RTX 4090",
    vram: 24,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 4,
    timeSeconds: 14.2,
    imagesPerMinute: 16.9,
    precision: "FP16",
    flags: "--gpu-only --highvram",
  },
  {
    gpu: "RTX 4080 Super",
    vram: 16,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 2,
    timeSeconds: 14.0,
    imagesPerMinute: 8.6,
    precision: "FP16",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 3080 16GB",
    vram: 16,
    yours: true,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 2,
    timeSeconds: 22.0,
    imagesPerMinute: 5.5,
    precision: "FP16",
    flags: "--gpu-only",
  },
  {
    gpu: "RTX 3060 12GB",
    vram: 12,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "1024×1024",
    steps: 20,
    batchSize: 1,
    timeSeconds: 24.0,
    imagesPerMinute: 2.5,
    precision: "FP16",
    flags: "--gpu-only",
  },
  {
    gpu: "GTX 1660 Ti",
    vram: 6,
    yours: true,
    model: "SDXL FP16",
    modelType: "Image",
    resolution: "768×768",
    steps: 20,
    batchSize: 1,
    timeSeconds: 62.0,
    imagesPerMinute: 1.0,
    precision: "FP16",
    flags: "--lowvram",
    notes: "Reduced resolution only",
  },

  // ── LTX Video ──────────────────────────────────────────────────────────────
  {
    gpu: "RTX 5090",
    vram: 32,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 2.8,
    framesPerSecond: 34.6,
    precision: "FP16",
    flags: "--gpu-only --highvram",
    notes: "97 frames",
  },
  {
    gpu: "RTX 5080",
    vram: 16,
    yours: true,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 5.4,
    framesPerSecond: 18.0,
    precision: "FP16",
    flags: "--gpu-only --highvram",
    notes: "97 frames",
  },
  {
    gpu: "RTX 4090",
    vram: 24,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 6.8,
    framesPerSecond: 14.3,
    precision: "FP16",
    flags: "--gpu-only --highvram",
    notes: "97 frames",
  },
  {
    gpu: "RTX 4080 Super",
    vram: 16,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 9.2,
    framesPerSecond: 10.5,
    precision: "FP16",
    flags: "--gpu-only",
    notes: "97 frames",
  },
  {
    gpu: "RTX 3090",
    vram: 24,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 12.4,
    framesPerSecond: 7.8,
    precision: "FP16",
    flags: "--gpu-only",
    notes: "97 frames",
  },
  {
    gpu: "RTX 3080 16GB",
    vram: 16,
    yours: true,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "768×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 16.8,
    framesPerSecond: 5.8,
    precision: "FP16",
    flags: "--gpu-only",
    notes: "97 frames",
  },
  {
    gpu: "RTX 3080 10GB",
    vram: 10,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "512×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 24.0,
    framesPerSecond: 4.0,
    precision: "FP16",
    flags: "--lowvram",
    notes: "Reduced res, 49 frames",
  },
  {
    gpu: "GTX 1660 Ti",
    vram: 6,
    yours: true,
    model: "LTX Video 2.3",
    modelType: "Video",
    resolution: "512×512",
    steps: 25,
    batchSize: 1,
    timeSeconds: 0,
    framesPerSecond: 0,
    precision: "FP16",
    flags: "N/A",
    notes: "OOM — not supported",
  },

  // ── FLUX LoRA Training ────────────────────────────────────────────────────
  {
    gpu: "RTX 5090",
    vram: 32,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 2,
    timeSeconds: 4200,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~70 min / 1000 steps",
  },
  {
    gpu: "RTX 5080",
    vram: 16,
    yours: true,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 1,
    timeSeconds: 7200,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~2h / 1000 steps",
  },
  {
    gpu: "RTX 4090",
    vram: 24,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 2,
    timeSeconds: 5400,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~90 min / 1000 steps",
  },
  {
    gpu: "RTX 4080 Super",
    vram: 16,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 1,
    timeSeconds: 9000,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~2.5h / 1000 steps",
  },
  {
    gpu: "RTX 3090",
    vram: 24,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 1,
    timeSeconds: 10800,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~3h / 1000 steps",
  },
  {
    gpu: "RTX 3080 16GB",
    vram: 16,
    yours: true,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 1,
    timeSeconds: 14400,
    precision: "BF16",
    flags: "--gradient_checkpointing",
    notes: "~4h / 1000 steps",
  },
  {
    gpu: "RTX 3080 10GB",
    vram: 10,
    model: "FLUX LoRA Training",
    modelType: "Training",
    resolution: "1024×1024",
    steps: 1000,
    batchSize: 1,
    timeSeconds: 21600,
    precision: "BF16",
    flags: "--gradient_checkpointing --cpu_offload",
    notes: "~6h / 1000 steps, CPU offload required",
  },
];

const MODELS = [...new Set(BENCHMARKS.map((b) => b.model))];
const GPUS_LIST = [...new Set(BENCHMARKS.map((b) => b.gpu))];

function formatTime(seconds: number): string {
  if (seconds === 0) return "N/A";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function getSpeedColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return "text-[#10b981]";
  if (pct >= 0.35) return "text-[#f97316]";
  return "text-[#ef4444]";
}

export default function BenchmarkLookupPage() {
  const [category, setCategory] = useState<Category>("All");
  const [modelFilter, setModelFilter] = useState<string>("All");
  const [gpuFilter, setGpuFilter] = useState<string>("All");
  const [showYoursOnly, setShowYoursOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"speed" | "gpu" | "vram">("speed");

  const filtered = useMemo(() => {
    let result = BENCHMARKS.filter((b) => {
      if (category !== "All" && b.modelType !== category) return false;
      if (modelFilter !== "All" && b.model !== modelFilter) return false;
      if (gpuFilter !== "All" && b.gpu !== gpuFilter) return false;
      if (showYoursOnly && !b.yours) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "speed") {
        const aSpeed =
          a.imagesPerMinute ||
          a.framesPerSecond ||
          (a.timeSeconds > 0 ? 1 / a.timeSeconds : 0);
        const bSpeed =
          b.imagesPerMinute ||
          b.framesPerSecond ||
          (b.timeSeconds > 0 ? 1 / b.timeSeconds : 0);
        return bSpeed - aSpeed;
      }
      if (sortBy === "vram") return b.vram - a.vram;
      return a.gpu.localeCompare(b.gpu);
    });

    return result;
  }, [category, modelFilter, gpuFilter, showYoursOnly, sortBy]);

  const maxSpeed = useMemo(() => {
    return Math.max(
      ...filtered.map((b) => b.imagesPerMinute || b.framesPerSecond || 0)
    );
  }, [filtered]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-10 pb-20 pt-24">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            // Tools
          </p>
          <h1 className="mb-4 font-syne text-5xl font-black tracking-tight text-white">
            GPU Benchmark Lookup
          </h1>
          <p className="max-w-xl leading-relaxed text-muted">
            Real inference and training benchmarks across consumer GPUs. Filter
            by model, GPU, or workload type. Your rigs are highlighted.
          </p>
        </div>

        {/* Your rigs summary */}
        <div className="mb-10 grid grid-cols-3 gap-4">
          {[
            {
              name: "RTX 5080",
              vram: 16,
              highlight: "Primary rig — fastest local inference",
            },
            {
              name: "RTX 3080 16GB",
              vram: 16,
              highlight: "Secondary — solid for training runs",
            },
            {
              name: "GTX 1660 Ti",
              vram: 6,
              highlight: "Aux — light inference only",
            },
          ].map((rig) => (
            <div
              key={rig.name}
              className="relative overflow-hidden rounded-xl border border-accent/20 bg-card p-5"
            >
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-accent to-transparent" />
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  Your Rig
                </span>
              </div>
              <h3 className="font-syne text-lg font-bold text-white">
                {rig.name}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted">
                {rig.vram}GB VRAM · {rig.highlight}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category */}
            <div className="flex gap-1.5">
              {(["All", "Image", "Video", "Training"] as Category[]).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                      category === c
                        ? "border border-accent/20 bg-accent/10 text-accent"
                        : "hover:text-text border border-border bg-surface text-muted"
                    }`}
                  >
                    {c}
                  </button>
                )
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Model filter */}
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="text-text rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs transition-colors focus:border-accent/50 focus:outline-none"
            >
              <option value="All">All Models</option>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* GPU filter */}
            <select
              value={gpuFilter}
              onChange={(e) => setGpuFilter(e.target.value)}
              className="text-text rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs transition-colors focus:border-accent/50 focus:outline-none"
            >
              <option value="All">All GPUs</option>
              {GPUS_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "speed" | "gpu" | "vram")
              }
              className="text-text rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs transition-colors focus:border-accent/50 focus:outline-none"
            >
              <option value="speed">Sort: Fastest First</option>
              <option value="gpu">Sort: GPU Name</option>
              <option value="vram">Sort: VRAM</option>
            </select>

            {/* Yours only */}
            <button
              onClick={() => setShowYoursOnly(!showYoursOnly)}
              className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                showYoursOnly
                  ? "border-accent/20 bg-accent/10 text-accent"
                  : "hover:text-text border-border bg-surface text-muted"
              }`}
            >
              {showYoursOnly ? "★ Your Rigs" : "☆ Your Rigs"}
            </button>

            <span className="ml-auto font-mono text-xs text-muted">
              {filtered.length} results
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[180px_160px_120px_80px_80px_100px_100px_100px_1fr] border-b border-border font-mono text-xs uppercase tracking-widest text-muted">
            {[
              "GPU",
              "Model",
              "Resolution",
              "VRAM",
              "Steps",
              "Time",
              "Speed",
              "Precision",
              "Flags / Notes",
            ].map((h) => (
              <div key={h} className="px-4 py-3">
                {h}
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center font-mono text-sm text-muted">
              No benchmarks match your filters.
            </div>
          ) : (
            filtered.map((b, i) => {
              const speed = b.imagesPerMinute || b.framesPerSecond || 0;
              const speedLabel = b.imagesPerMinute
                ? `${b.imagesPerMinute.toFixed(1)} img/m`
                : b.framesPerSecond
                  ? `${b.framesPerSecond.toFixed(1)} fps`
                  : b.modelType === "Training"
                    ? formatTime(b.timeSeconds)
                    : "N/A";
              const isOOM = b.timeSeconds === 0 && b.modelType !== "Training";

              return (
                <div
                  key={i}
                  className={`hover:bg-white/2 grid grid-cols-[180px_160px_120px_80px_80px_100px_100px_100px_1fr] border-b border-border transition-colors last:border-b-0 ${
                    b.yours ? "bg-accent/3" : ""
                  }`}
                >
                  {/* GPU */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    {b.yours && (
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                    )}
                    <span
                      className={`font-mono text-xs ${b.yours ? "font-medium text-white" : "text-muted"}`}
                    >
                      {b.gpu}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    {b.model}
                  </div>

                  {/* Resolution */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    {b.resolution}
                  </div>

                  {/* VRAM */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    {b.vram}GB
                  </div>

                  {/* Steps */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    {b.steps}
                  </div>

                  {/* Time */}
                  <div
                    className={`px-4 py-3 font-mono text-xs ${isOOM ? "text-[#ef4444]" : "text-muted"}`}
                  >
                    {isOOM ? "OOM" : formatTime(b.timeSeconds)}
                  </div>

                  {/* Speed */}
                  <div
                    className={`px-4 py-3 font-mono text-xs font-medium ${isOOM ? "text-[#ef4444]" : getSpeedColor(speed, maxSpeed)}`}
                  >
                    {isOOM ? "—" : speedLabel}
                  </div>

                  {/* Precision */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    {b.precision}
                  </div>

                  {/* Flags / Notes */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    <span className="text-accent/60">{b.flags}</span>
                    {b.notes && (
                      <span className="ml-2 text-muted opacity-60">
                        · {b.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            Fast (70%+ of max)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f97316]" />
            Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            Slow / OOM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Your rig
          </span>
        </div>

        {/* ComputeAtlas CTA */}
        <div className="from-accent-purple/8 mt-12 overflow-hidden rounded-xl border border-accent-purple/25 bg-gradient-to-br to-accent/5">
          <div className="grid grid-cols-2">
            <div className="border-r border-accent-purple/15 p-10">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#a78bfa]">
                // Hardware Partner
              </p>
              <h2 className="mb-3 font-syne text-3xl font-black tracking-tight text-white">
                Benchmarks too slow
                <br />
                for your workload?
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-muted">
                ComputeAtlas is an AI workstation planning platform. Use it to
                spec the exact hardware you need — GPU, CPU, RAM, storage —
                before you buy.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="https://computeatlas.ai/ai-hardware-estimator"
                  target="_blank"
                  className="inline-block rounded bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Estimate My Hardware →
                </Link>
                <Link
                  href="https://computeatlas.ai/recommended-builds"
                  target="_blank"
                  className="hover:text-text inline-block rounded border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-muted transition-colors"
                >
                  Recommended Builds
                </Link>
              </div>
            </div>
            <div className="p-10">
              <p className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">
                Relevant ComputeAtlas builds
              </p>
              <div className="space-y-3">
                {[
                  {
                    name: "Creator AI Rig",
                    spec: "1× RTX 4090 · Ryzen 9 9950X · 64GB RAM",
                    href: "https://computeatlas.ai/recommended-builds",
                    tag: "Image & Video Gen",
                  },
                  {
                    name: "Fine-Tuning Workstation",
                    spec: "2× RTX 6000 Ada · Threadripper PRO · 256GB RAM",
                    href: "https://computeatlas.ai/recommended-builds",
                    tag: "LoRA Training",
                  },
                  {
                    name: "Multi-GPU Research Rig",
                    spec: "4× RTX PRO 6000 · Threadripper PRO · 512GB RAM",
                    href: "https://computeatlas.ai/recommended-builds",
                    tag: "Heavy Workloads",
                  },
                ].map((b) => (
                  <Link
                    key={b.name}
                    href={b.href}
                    target="_blank"
                    className="group flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-accent-purple/30"
                  >
                    <div>
                      <div className="font-syne text-sm font-bold text-white transition-colors group-hover:text-[#a78bfa]">
                        {b.name}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-muted">
                        {b.spec}
                      </div>
                    </div>
                    <span className="ml-3 flex-shrink-0 rounded bg-accent-purple/10 px-2 py-0.5 font-mono text-xs tracking-wide text-[#a78bfa]">
                      {b.tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
