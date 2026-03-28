"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { DynamicCTA } from "@/components/DynamicCTA";

type VRAMTier = "8GB" | "12GB" | "16GB" | "24GB";

const VRAM_CAPABILITIES = {
  "8GB": {
    rating: "Entry Level",
    color: "cyan",
    desc: "Good for basics and SD1.5. You'll need aggressive optimization for modern models.",
    models: [
      { name: "SD 1.5 & SDXL Turbo", status: "perfect", note: "Native speed" },
      { name: "SDXL 1.0", status: "ok", note: "Requires Tiled VAE / fp8" },
      {
        name: "FLUX.1 Schnell",
        status: "ok",
        note: "Aggressive fp8 quantization needed",
      },
      { name: "FLUX.1 Dev", status: "bad", note: "Too slow (OOM frequent)" },
      { name: "LTX Video", status: "bad", note: "Insufficient VRAM" },
    ],
    upgrade: "16GB (e.g. RTX 4080 Super or used RTX 3090)",
  },
  "12GB": {
    rating: "Capable",
    color: "blue",
    desc: "The sweet spot for casual SDXL generation and entry-level FLUX usage.",
    models: [
      {
        name: "SD 1.5 & SDXL",
        status: "perfect",
        note: "Native speed, no tiling needed",
      },
      { name: "FLUX.1 Schnell", status: "perfect", note: "Runs well in fp8" },
      { name: "FLUX.1 Dev", status: "ok", note: "Works in fp8, ~2.5s/it" },
      {
        name: "LoRA Training (SDXL)",
        status: "ok",
        note: "Batch size 1, gradient checkpointing",
      },
      { name: "LTX Video", status: "bad", note: "Requires roughly 16GB+" },
    ],
    upgrade: "16GB+ if you want to train FLUX LoRAs or generate video.",
  },
  "16GB": {
    rating: "Enthusiast",
    color: "violet",
    desc: "Excellent workstation tier. Can handle almost all modern consumer AI comfortably.",
    models: [
      { name: "SD 1.5 & SDXL", status: "perfect", note: "Lightning fast" },
      {
        name: "FLUX.1 Dev",
        status: "perfect",
        note: "Runs smoothly in fp8 or nf4",
      },
      {
        name: "LTX Video",
        status: "perfect",
        note: "Generates 5s clips reliably",
      },
      {
        name: "LoRA Training (SDXL)",
        status: "perfect",
        note: "Comfortable batch sizes",
      },
      {
        name: "LoRA Training (FLUX)",
        status: "ok",
        note: "Requires extreme optimization (Kohya)",
      },
    ],
    upgrade: "24GB only if you're training FLUX heavily.",
  },
  "24GB": {
    rating: "Elite",
    color: "indigo",
    desc: "The ultimate builder tier. No compromises, no out-of-memory errors.",
    models: [
      {
        name: "SDXL & FLUX.1 Dev",
        status: "perfect",
        note: "Handles fp16 native weights",
      },
      {
        name: "LTX Video & AnimateDiff",
        status: "perfect",
        note: "High resolution, long context",
      },
      {
        name: "LoRA Training (FLUX)",
        status: "perfect",
        note: "Train FLUX Dev with large batch sizes",
      },
      {
        name: "LLM Local Inference",
        status: "perfect",
        note: "Runs Llama 3 70B int4 smoothly",
      },
    ],
    upgrade:
      "None. You've reached the peak consumer tier (RTX 3090/4090/5090).",
  },
};

export default function SetupRaterPage() {
  const [selectedVRAM, setSelectedVRAM] = useState<VRAMTier>("16GB");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("neuraldrift_vram") as VRAMTier;
    if (saved && ["8GB", "12GB", "16GB", "24GB"].includes(saved)) {
      setSelectedVRAM(saved);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("neuraldrift_vram", selectedVRAM);
    // Dispatch custom event for persistent cross-tab/component syncing
    window.dispatchEvent(new Event("vram_update"));
  }, [selectedVRAM]);

  const currentCaps = VRAM_CAPABILITIES[selectedVRAM];

  return (
    <div className="min-h-screen bg-[#030712] pt-16 font-sans text-slate-50">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="mx-auto mb-16 max-w-4xl px-6 text-center md:px-12">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Zap className="h-8 w-8 text-cyan-400" />
        </div>
        <h1 className="mb-6 text-4xl font-[800] tracking-tight text-white drop-shadow-xl md:text-5xl lg:text-6xl">
          Setup <span className="text-cyan-400">Rater</span>
        </h1>
        <p className="mx-auto text-lg font-[500] leading-relaxed text-zinc-400 md:text-xl">
          Generative AI is entirely bound by{" "}
          <span className="font-[700] text-white">VRAM (Video RAM)</span>.
          Select your GPU&apos;s VRAM below to instantly see exactly what models
          and workflows you can comfortably run, and what you&apos;re missing
          out on.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 pb-24 md:px-12 lg:grid-cols-12">
        {/* ── LEFT: SELECTION ────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0f172a]/50 p-8 backdrop-blur-xl">
            <h3 className="mb-6 flex items-center gap-2 text-xs font-[800] uppercase tracking-widest text-indigo-400">
              <Cpu className="h-4 w-4" /> Select GPU VRAM
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {(["8GB", "12GB", "16GB", "24GB"] as VRAMTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedVRAM(tier)}
                  className={`rounded-2xl border-2 py-4 text-lg font-[800] transition-all duration-300 ${
                    selectedVRAM === tier
                      ? "scale-105 border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      : "border-indigo-500/10 bg-[#080b0f] text-zinc-500 hover:border-indigo-500/30 hover:text-zinc-300"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="mt-8 border-t border-indigo-500/10 pt-8">
              <h4 className="mb-2 text-sm font-[700] text-white">
                Not sure what you have?
              </h4>
              <p className="text-sm font-[500] leading-relaxed text-zinc-500">
                Open Task Manager (Windows) {`>`} Performance tab {`>`} GPU.
                Look at the &quot;Dedicated GPU memory&quot; value.
              </p>
            </div>
          </div>

          <Link
            href="/tutorials"
            className="group flex items-center justify-between rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-8 transition-all hover:bg-indigo-500/20"
          >
            <div>
              <h4 className="mb-1 font-[800] text-white transition-colors group-hover:text-indigo-300">
                Learn to Optimize
              </h4>
              <p className="text-sm font-[500] text-indigo-400">
                View guides on running heavy models.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── RIGHT: MATRIX RESULTS ──────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="flex h-full flex-col rounded-3xl border border-indigo-500/20 bg-[#0f172a]/30 p-8 backdrop-blur-xl md:p-10">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="text-3xl font-[800] text-white">
                {selectedVRAM} Rig Assessment
              </h2>
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-[800] uppercase tracking-wider bg-${currentCaps.color}-500/10 text-${currentCaps.color}-400 border border-${currentCaps.color}-500/30`}
              >
                {currentCaps.rating}
              </span>
            </div>

            <p className="mb-8 border-b border-indigo-500/10 pb-8 text-lg font-[500] leading-relaxed text-zinc-400">
              {currentCaps.desc}
            </p>

            <div className="flex-1">
              <h3 className="mb-6 flex items-center gap-2 text-xs font-[800] uppercase tracking-widest text-zinc-500">
                <Settings className="h-4 w-4" /> Capability Matrix
              </h3>

              <div className="space-y-4">
                {currentCaps.models.map((model, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#080b0f]/50 p-4"
                  >
                    <div className="shrink-0">
                      {model.status === "perfect" && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      {model.status === "ok" && (
                        <AlertTriangle className="h-5 w-5 text-cyan-400" />
                      )}
                      {model.status === "bad" && (
                        <XCircle className="h-5 w-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-[700] text-white">
                        {model.name}
                      </h4>
                      <p className="mt-0.5 text-xs font-[500] text-zinc-500">
                        {model.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-indigo-500/10 pt-8">
              <h3 className="mb-4 text-xs font-[800] uppercase tracking-widest text-zinc-500">
                Recommended Upgrade Path
              </h3>
              <div className="rounded-2xl border border-dashed border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="text-sm font-[600] text-indigo-300">
                  {currentCaps.upgrade}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="mx-auto max-w-5xl px-6 pb-32 md:px-12">
        <DynamicCTA
          title="Find the Right Models for Your Rig."
          description="Every GPU has a sweet spot. Now that you know your rating, browse our curated LoRA library to find models verified for your specific VRAM tier."
          ctaText="BROWSE MODEL LIBRARY"
          ctaHref="/loras"
          variant="emerald"
          tag="// Model Synergy"
        />
      </div>
    </div>
  );
}
