"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Info,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ── Models & GPUs Data ────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "flux-dev-fp16",
    name: "FLUX.1 Dev (FP16)",
    vram: 23.8,
    category: "Image / Pro",
  },
  {
    id: "flux-dev-fp8",
    name: "FLUX.1 Dev (FP8)",
    vram: 11.9,
    category: "Image / Pro",
  },
  {
    id: "flux-schnell-fp8",
    name: "FLUX.1 Schnell (FP8)",
    vram: 11.9,
    category: "Image / Fast",
  },
  {
    id: "sdxl-fp16",
    name: "SDXL 1.0 (FP16)",
    vram: 6.5,
    category: "Image / Legacy",
  },
  {
    id: "sdxl-fp8",
    name: "SDXL 1.0 (FP8)",
    vram: 4.2,
    category: "Image / Legacy",
  },
  {
    id: "ltx-video-23",
    name: "LTX Video 2.3",
    vram: 9.4,
    category: "Video Gen",
  },
  {
    id: "ace-step-15",
    name: "ACE-Step 1.5",
    vram: 14.5,
    category: "Video Gen",
  },
  {
    id: "wan-video-14b",
    name: "Wan Video 2.1 (14B)",
    vram: 18.2,
    category: "Video Gen",
  },
  {
    id: "animatediff-sd15",
    name: "AnimateDiff (SD1.5)",
    vram: 4.8,
    category: "Animation",
  },
  {
    id: "llama-3-8b-q4",
    name: "Llama 3 (8B Q4)",
    vram: 5.5,
    category: "LLM / Text",
  },
  {
    id: "deepseek-v3-q4",
    name: "DeepSeek V3 (Q4)",
    vram: 42.0,
    category: "LLM / Text",
  },
];

const GPUS = [
  { id: "rtx-5090", name: "NVIDIA RTX 5090", vram: 32, series: "50-Series" },
  { id: "rtx-5080", name: "NVIDIA RTX 5080", vram: 16, series: "50-Series" },
  { id: "rtx-4090", name: "NVIDIA RTX 4090", vram: 24, series: "40-Series" },
  { id: "rtx-4080", name: "NVIDIA RTX 4080", vram: 16, series: "40-Series" },
  { id: "rtx-4070", name: "NVIDIA RTX 4070", vram: 12, series: "40-Series" },
  { id: "rtx-4060", name: "NVIDIA RTX 4060", vram: 8, series: "40-Series" },
  { id: "rtx-3090", name: "NVIDIA RTX 3090", vram: 24, series: "30-Series" },
  { id: "rtx-3080", name: "NVIDIA RTX 3080", vram: 10, series: "30-Series" },
  {
    id: "a100-80g",
    name: "NVIDIA A100 (80GB)",
    vram: 80,
    series: "Enterprise",
  },
  {
    id: "h100-80g",
    name: "NVIDIA H100 (80GB)",
    vram: 80,
    series: "Enterprise",
  },
];

// ── Components ────────────────────────────────────────────────────────────────

const Dropdown = ({ label, options, selected, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o: any) => o.id === selected);

  return (
    <div className="relative mb-6">
      <label className="mb-2 block px-1 font-mono text-[10px] uppercase tracking-widest text-[#7c6af7]">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#2a2a30] bg-[#111113] px-4 py-4 text-left transition-all hover:border-[#7c6af7]/40 focus:outline-none focus:ring-2 focus:ring-[#7c6af7]/20"
      >
        <span className="font-syne font-bold uppercase tracking-tight text-white">
          {selectedOption?.name || "Select..."}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#8888a0] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-hidden overflow-y-auto rounded-xl border border-[#2a2a30] bg-[#111113] shadow-2xl">
          {options.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.id);
                setIsOpen(false);
              }}
              className="group w-full border-b border-[#2a2a30] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#7c6af7]/10"
            >
              <div className="flex items-center justify-between">
                <span className="font-syne text-sm font-bold uppercase tracking-tight text-white group-hover:text-[#7c6af7]">
                  {opt.name}
                </span>
                <span className="font-mono text-[10px] text-[#8888a0]">
                  {opt.vram} GB
                </span>
              </div>
              {opt.category && (
                <div className="mt-0.5 text-[10px] text-[#8888a0]">
                  {opt.category}
                </div>
              )}
              {opt.series && (
                <div className="mt-0.5 text-[10px] text-[#8888a0]">
                  {opt.series}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function VRAMCalculatorPage() {
  const [modelId, setModelId] = useState("flux-dev-fp8");
  const [gpuId, setGpuId] = useState("rtx-4080");
  const [batchSize, setBatchSize] = useState(1);

  const selectedModel = MODELS.find((m) => m.id === modelId)!;
  const selectedGPU = GPUS.find((g) => g.id === gpuId)!;

  const estimatedVRAM = useMemo(() => {
    let base = selectedModel.vram;
    // Batch scaling: first image full vram, subsequent ones ~35% overhead
    const total = base + (batchSize - 1) * (base * 0.35);
    return Math.round(total * 10) / 10;
  }, [selectedModel, batchSize]);

  const canRun = estimatedVRAM <= selectedGPU.vram;
  const tightFit = !canRun && estimatedVRAM <= selectedGPU.vram * 1.15; // Within 15% (could use swap)

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] selection:bg-[#7c6af7]/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-32 pt-[140px]">
        {/* Header */}
        <div className="mb-16">
          <div
            className="nh-section-label mb-6"
            style={{
              background: "rgba(124, 106, 247, 0.1)",
              border: "1px solid rgba(124, 106, 247, 0.2)",
              color: "#7c6af7",
            }}
          >
            <span className="nh-node-pulse h-2 w-2 rounded-full bg-[#7c6af7]" />
            Hardware Optimizer
          </div>
          <h1 className="mb-6 font-syne text-5xl font-black tracking-tight text-white md:text-7xl">
            VRAM{" "}
            <span className="bg-gradient-to-r from-[#22d3ee] to-[#7c6af7] bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-[#8888a0]">
            Determine if your GPU can handle specific AI models. Our calculator
            factors in precision (FP8/FP16), batch size, and architecture
            overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[450px_1fr]">
          {/* Controls */}
          <div className="sticky top-40 rounded-3xl border border-[#2a2a30] bg-[#111113] p-8">
            <Dropdown
              label="01 — Select AI Model"
              options={MODELS}
              selected={modelId}
              onSelect={setModelId}
            />

            <Dropdown
              label="02 — Target Hardware (GPU)"
              options={GPUS}
              selected={gpuId}
              onSelect={setGpuId}
            />

            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between px-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#4ade80]">
                  03 — Batch Size
                </label>
                <span className="font-syne font-black text-white">
                  {batchSize}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={16}
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full accent-[#4ade80]"
              />
              <div className="mt-2 flex justify-between font-mono text-[9px] text-[#8888a0]">
                <span>SOLO</span>
                <span>MASSIVE BATCH</span>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-[#2a2a30] bg-[#0a0a0b] p-6">
              <div className="flex items-start gap-4">
                <Info className="flex-shrink-0 text-[#22d3ee]" size={20} />
                <p className="text-xs leading-relaxed text-[#8888a0]">
                  Calculations assume ComfyUI/Forge overhead. Using Windows can
                  consume ~1-2GB of VRAM for display management.
                </p>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-8">
            {/* Result Card */}
            <div
              className={`relative overflow-hidden rounded-3xl border p-10 transition-all duration-500 ${
                canRun
                  ? "border-[#4ade80]/30 bg-[#4ade80]/5"
                  : tightFit
                    ? "border-orange-500/30 bg-orange-500/5"
                    : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="absolute right-0 top-0 p-10 opacity-10">
                {canRun ? (
                  <Zap size={160} className="text-[#4ade80]" />
                ) : (
                  <AlertTriangle size={160} className="text-red-500" />
                )}
              </div>

              <div className="relative z-10">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#8888a0]">
                  Estimated VRAM Load
                </p>
                <div className="mb-8 flex items-baseline gap-4">
                  <span className="font-syne text-8xl font-black tracking-tighter text-white">
                    {estimatedVRAM}
                  </span>
                  <span className="font-syne text-3xl font-black text-[#8888a0]">
                    GB
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-10">
                  <div className="flex items-center gap-3">
                    {canRun ? (
                      <CheckCircle2 className="text-[#4ade80]" size={32} />
                    ) : tightFit ? (
                      <Info className="text-orange-500" size={32} />
                    ) : (
                      <AlertTriangle className="text-red-500" size={32} />
                    )}
                    <div>
                      <h3 className="font-syne text-xl font-bold text-white">
                        {canRun
                          ? "System Compatible"
                          : tightFit
                            ? "Insufficient VRAM"
                            : "OOM Imminent"}
                      </h3>
                      <p className="text-sm text-[#8888a0]">
                        {canRun
                          ? "This model will run comfortably at FP8 precision."
                          : tightFit
                            ? "Likely to trigger shared system memory (latency hit)."
                            : "This model requires a GPU upgrade to run."}
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-12 w-px bg-[#2a2a30] md:block" />

                  <div>
                    <h4 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#8888a0]">
                      Recommended Setting
                    </h4>
                    <p className="font-syne font-bold text-white">
                      {canRun ? "FP16 (High Quality)" : "GGUF / Quantized"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ComputeAtlas Recommendation */}
            <div className="group overflow-hidden rounded-3xl border border-[#7c6af7]/20 bg-[#111113]">
              <div className="flex flex-col md:flex-row">
                <div className="relative aspect-square w-full md:aspect-auto md:w-1/3">
                  <Image
                    src="/images/computeatlas-partner.png"
                    alt="ComputeAtlas Hardware"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111113]" />
                </div>
                <div className="flex-1 p-10">
                  <div
                    className="nh-section-label mb-6"
                    style={{
                      background: "rgba(124, 106, 247, 0.1)",
                      border: "1px solid rgba(124, 106, 247, 0.2)",
                      color: "#7c6af7",
                    }}
                  >
                    Official Hardware Partner
                  </div>
                  <h3 className="mb-4 font-syne text-3xl font-black text-white">
                    Upgrade to{" "}
                    {estimatedVRAM > 24
                      ? "H100"
                      : estimatedVRAM > 12
                        ? "4090"
                        : "5080"}
                  </h3>
                  <p className="mb-8 max-w-xl leading-relaxed text-[#8888a0]">
                    Don&apos;t let VRAM limits bottleneck your creativity.
                    ComputeAtlas calculates the best GPU for your specific
                    workflow—from LORA training to cinematic video
                    generation—before you buy.
                  </p>
                  <a
                    href="https://computeatlas.ai?ref=neuraldrift"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 rounded-xl bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(124,106,247,0.3)] transition-all hover:bg-[#7c6af7] hover:text-white"
                  >
                    Build Your Rig on ComputeAtlas{" "}
                    <Zap size={14} fill="currentColor" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Specs Table */}
            <div className="rounded-3xl border border-[#2a2a30] bg-[#111113] p-10">
              <h3 className="mb-8 font-syne text-xl font-bold text-white">
                Model Architecture Details
              </h3>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                <div>
                  <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#22d3ee]">
                    Model Files
                  </h4>
                  <p className="border-l border-[#22d3ee]/30 py-2 pl-4 text-sm text-[#8888a0]">
                    Flux models are ~23GB (FP16) or ~12GB (FP8).
                  </p>
                </div>
                <div>
                  <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#7c6af7]">
                    Context Window
                  </h4>
                  <p className="border-l border-[#7c6af7]/30 py-2 pl-4 text-sm text-[#8888a0]">
                    Higher batch sizes increase peak memory during the sampling
                    phase.
                  </p>
                </div>
                <div>
                  <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#4ade80]">
                    OS Overhead
                  </h4>
                  <p className="border-l border-[#4ade80]/30 py-2 pl-4 text-sm text-[#8888a0]">
                    Windows WDDM reserve takes ~15% of total VRAM. Linux is
                    recommended for pro builds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
