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
  { gpu: "RTX 5090", vram: 32, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 4.1, imagesPerMinute: 14.6, precision: "FP8", flags: "--gpu-only --highvram", notes: "Top consumer card" },
  { gpu: "RTX 5080", vram: 16, yours: true, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 8.1, imagesPerMinute: 7.4, precision: "FP8", flags: "--gpu-only --highvram" },
  { gpu: "RTX 4090", vram: 24, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 9.2, imagesPerMinute: 6.5, precision: "FP8", flags: "--gpu-only --highvram" },
  { gpu: "RTX 4080 Super", vram: 16, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 11.4, imagesPerMinute: 5.3, precision: "FP8", flags: "--gpu-only" },
  { gpu: "RTX 4070 Ti", vram: 12, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 18.2, imagesPerMinute: 3.3, precision: "FP8", flags: "--gpu-only" },
  { gpu: "RTX 3090", vram: 24, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 22.1, imagesPerMinute: 2.7, precision: "FP8", flags: "--gpu-only" },
  { gpu: "RTX 3080 16GB", vram: 16, yours: true, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 28.4, imagesPerMinute: 2.1, precision: "FP8", flags: "--gpu-only" },
  { gpu: "RTX 3080 10GB", vram: 10, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 38.0, imagesPerMinute: 1.6, precision: "FP8", flags: "--lowvram", notes: "Requires --lowvram" },
  { gpu: "RTX 3060 12GB", vram: 12, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 52.0, imagesPerMinute: 1.2, precision: "FP8", flags: "--lowvram" },
  { gpu: "GTX 1660 Ti", vram: 6, yours: true, model: "FLUX Dev FP8", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 0, imagesPerMinute: 0, precision: "FP8", flags: "N/A", notes: "OOM — not supported" },

  // ── SDXL FP16 ──────────────────────────────────────────────────────────────
  { gpu: "RTX 5090", vram: 32, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 4, timeSeconds: 4.8, imagesPerMinute: 50.0, precision: "FP16", flags: "--gpu-only --highvram" },
  { gpu: "RTX 5080", vram: 16, yours: true, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 4, timeSeconds: 12.8, imagesPerMinute: 18.8, precision: "FP16", flags: "--gpu-only --highvram" },
  { gpu: "RTX 4090", vram: 24, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 4, timeSeconds: 14.2, imagesPerMinute: 16.9, precision: "FP16", flags: "--gpu-only --highvram" },
  { gpu: "RTX 4080 Super", vram: 16, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 2, timeSeconds: 14.0, imagesPerMinute: 8.6, precision: "FP16", flags: "--gpu-only" },
  { gpu: "RTX 3080 16GB", vram: 16, yours: true, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 2, timeSeconds: 22.0, imagesPerMinute: 5.5, precision: "FP16", flags: "--gpu-only" },
  { gpu: "RTX 3060 12GB", vram: 12, model: "SDXL FP16", modelType: "Image", resolution: "1024×1024", steps: 20, batchSize: 1, timeSeconds: 24.0, imagesPerMinute: 2.5, precision: "FP16", flags: "--gpu-only" },
  { gpu: "GTX 1660 Ti", vram: 6, yours: true, model: "SDXL FP16", modelType: "Image", resolution: "768×768", steps: 20, batchSize: 1, timeSeconds: 62.0, imagesPerMinute: 1.0, precision: "FP16", flags: "--lowvram", notes: "Reduced resolution only" },

  // ── LTX Video ──────────────────────────────────────────────────────────────
  { gpu: "RTX 5090", vram: 32, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 2.8, framesPerSecond: 34.6, precision: "FP16", flags: "--gpu-only --highvram", notes: "97 frames" },
  { gpu: "RTX 5080", vram: 16, yours: true, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 5.4, framesPerSecond: 18.0, precision: "FP16", flags: "--gpu-only --highvram", notes: "97 frames" },
  { gpu: "RTX 4090", vram: 24, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 6.8, framesPerSecond: 14.3, precision: "FP16", flags: "--gpu-only --highvram", notes: "97 frames" },
  { gpu: "RTX 4080 Super", vram: 16, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 9.2, framesPerSecond: 10.5, precision: "FP16", flags: "--gpu-only", notes: "97 frames" },
  { gpu: "RTX 3090", vram: 24, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 12.4, framesPerSecond: 7.8, precision: "FP16", flags: "--gpu-only", notes: "97 frames" },
  { gpu: "RTX 3080 16GB", vram: 16, yours: true, model: "LTX Video 2.3", modelType: "Video", resolution: "768×512", steps: 25, batchSize: 1, timeSeconds: 16.8, framesPerSecond: 5.8, precision: "FP16", flags: "--gpu-only", notes: "97 frames" },
  { gpu: "RTX 3080 10GB", vram: 10, model: "LTX Video 2.3", modelType: "Video", resolution: "512×512", steps: 25, batchSize: 1, timeSeconds: 24.0, framesPerSecond: 4.0, precision: "FP16", flags: "--lowvram", notes: "Reduced res, 49 frames" },
  { gpu: "GTX 1660 Ti", vram: 6, yours: true, model: "LTX Video 2.3", modelType: "Video", resolution: "512×512", steps: 25, batchSize: 1, timeSeconds: 0, framesPerSecond: 0, precision: "FP16", flags: "N/A", notes: "OOM — not supported" },

  // ── FLUX LoRA Training ────────────────────────────────────────────────────
  { gpu: "RTX 5090", vram: 32, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 2, timeSeconds: 4200, precision: "BF16", flags: "--gradient_checkpointing", notes: "~70 min / 1000 steps" },
  { gpu: "RTX 5080", vram: 16, yours: true, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 1, timeSeconds: 7200, precision: "BF16", flags: "--gradient_checkpointing", notes: "~2h / 1000 steps" },
  { gpu: "RTX 4090", vram: 24, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 2, timeSeconds: 5400, precision: "BF16", flags: "--gradient_checkpointing", notes: "~90 min / 1000 steps" },
  { gpu: "RTX 4080 Super", vram: 16, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 1, timeSeconds: 9000, precision: "BF16", flags: "--gradient_checkpointing", notes: "~2.5h / 1000 steps" },
  { gpu: "RTX 3090", vram: 24, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 1, timeSeconds: 10800, precision: "BF16", flags: "--gradient_checkpointing", notes: "~3h / 1000 steps" },
  { gpu: "RTX 3080 16GB", vram: 16, yours: true, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 1, timeSeconds: 14400, precision: "BF16", flags: "--gradient_checkpointing", notes: "~4h / 1000 steps" },
  { gpu: "RTX 3080 10GB", vram: 10, model: "FLUX LoRA Training", modelType: "Training", resolution: "1024×1024", steps: 1000, batchSize: 1, timeSeconds: 21600, precision: "BF16", flags: "--gradient_checkpointing --cpu_offload", notes: "~6h / 1000 steps, CPU offload required" },
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
        const aSpeed = a.imagesPerMinute || a.framesPerSecond || (a.timeSeconds > 0 ? 1 / a.timeSeconds : 0);
        const bSpeed = b.imagesPerMinute || b.framesPerSecond || (b.timeSeconds > 0 ? 1 / b.timeSeconds : 0);
        return bSpeed - aSpeed;
      }
      if (sortBy === "vram") return b.vram - a.vram;
      return a.gpu.localeCompare(b.gpu);
    });

    return result;
  }, [category, modelFilter, gpuFilter, showYoursOnly, sortBy]);

  const maxSpeed = useMemo(() => {
    return Math.max(...filtered.map((b) => b.imagesPerMinute || b.framesPerSecond || 0));
  }, [filtered]);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Tools</p>
          <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
            GPU Benchmark Lookup
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            Real inference and training benchmarks across consumer GPUs. Filter by model, GPU, or workload type. Your rigs are highlighted.
          </p>
        </div>

        {/* Your rigs summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { name: "RTX 5080", vram: 16, highlight: "Primary rig — fastest local inference" },
            { name: "RTX 3080 16GB", vram: 16, highlight: "Secondary — solid for training runs" },
            { name: "GTX 1660 Ti", vram: 6, highlight: "Aux — light inference only" },
          ].map((rig) => (
            <div key={rig.name} className="bg-card border border-accent/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent to-transparent" />
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-xs text-accent tracking-widest uppercase">Your Rig</span>
              </div>
              <h3 className="font-syne text-lg font-bold text-white">{rig.name}</h3>
              <p className="font-mono text-xs text-muted mt-1">{rig.vram}GB VRAM · {rig.highlight}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">

            {/* Category */}
            <div className="flex gap-1.5">
              {(["All", "Image", "Video", "Training"] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors ${
                    category === c
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "bg-surface border border-border text-muted hover:text-text"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Model filter */}
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 font-mono text-xs text-text focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="All">All Models</option>
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* GPU filter */}
            <select
              value={gpuFilter}
              onChange={(e) => setGpuFilter(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 font-mono text-xs text-text focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="All">All GPUs</option>
              {GPUS_LIST.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "speed" | "gpu" | "vram")}
              className="bg-surface border border-border rounded-lg px-3 py-2 font-mono text-xs text-text focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="speed">Sort: Fastest First</option>
              <option value="gpu">Sort: GPU Name</option>
              <option value="vram">Sort: VRAM</option>
            </select>

            {/* Yours only */}
            <button
              onClick={() => setShowYoursOnly(!showYoursOnly)}
              className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${
                showYoursOnly
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-surface border-border text-muted hover:text-text"
              }`}
            >
              {showYoursOnly ? "★ Your Rigs" : "☆ Your Rigs"}
            </button>

            <span className="font-mono text-xs text-muted ml-auto">{filtered.length} results</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[180px_160px_120px_80px_80px_100px_100px_100px_1fr] font-mono text-xs text-muted tracking-widest uppercase border-b border-border">
            {["GPU", "Model", "Resolution", "VRAM", "Steps", "Time", "Speed", "Precision", "Flags / Notes"].map((h) => (
              <div key={h} className="px-4 py-3">{h}</div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 font-mono text-sm text-muted">No benchmarks match your filters.</div>
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
                  className={`grid grid-cols-[180px_160px_120px_80px_80px_100px_100px_100px_1fr] border-b border-border last:border-b-0 transition-colors hover:bg-white/2 ${
                    b.yours ? "bg-accent/3" : ""
                  }`}
                >
                  {/* GPU */}
                  <div className="px-4 py-3 flex items-center gap-2">
                    {b.yours && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                    <span className={`font-mono text-xs ${b.yours ? "text-white font-medium" : "text-muted"}`}>
                      {b.gpu}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">{b.model}</div>

                  {/* Resolution */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">{b.resolution}</div>

                  {/* VRAM */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">{b.vram}GB</div>

                  {/* Steps */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">{b.steps}</div>

                  {/* Time */}
                  <div className={`px-4 py-3 font-mono text-xs ${isOOM ? "text-[#ef4444]" : "text-muted"}`}>
                    {isOOM ? "OOM" : formatTime(b.timeSeconds)}
                  </div>

                  {/* Speed */}
                  <div className={`px-4 py-3 font-mono text-xs font-medium ${isOOM ? "text-[#ef4444]" : getSpeedColor(speed, maxSpeed)}`}>
                    {isOOM ? "—" : speedLabel}
                  </div>

                  {/* Precision */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">{b.precision}</div>

                  {/* Flags / Notes */}
                  <div className="px-4 py-3 font-mono text-xs text-muted">
                    <span className="text-accent/60">{b.flags}</span>
                    {b.notes && <span className="ml-2 text-muted opacity-60">· {b.notes}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Fast (70%+ of max)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]" />Medium</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Slow / OOM</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" />Your rig</span>
        </div>

        {/* ComputeAtlas CTA */}
        <div className="mt-12 bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl p-10 text-center">
          <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-3">// Need More Speed?</p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">
            Your GPU too slow for this workload?
          </h2>
          <p className="text-muted max-w-md mx-auto mb-6 text-sm leading-relaxed">
            Route heavy jobs to ComputeAtlas GPU cloud. RTX 4090 and A100 instances available by the minute.
          </p>
          <Link href="https://computeatlas.ai" target="_blank"
            className="inline-block bg-accent-purple text-white px-6 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
            Explore ComputeAtlas →
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}
