"use client";

import { useState, useEffect } from "react";
import { Cpu, Zap, Settings, CheckCircle, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
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
      { name: "FLUX.1 Schnell", status: "ok", note: "Aggressive fp8 quantization needed" },
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
      { name: "SD 1.5 & SDXL", status: "perfect", note: "Native speed, no tiling needed" },
      { name: "FLUX.1 Schnell", status: "perfect", note: "Runs well in fp8" },
      { name: "FLUX.1 Dev", status: "ok", note: "Works in fp8, ~2.5s/it" },
      { name: "LoRA Training (SDXL)", status: "ok", note: "Batch size 1, gradient checkpointing" },
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
      { name: "FLUX.1 Dev", status: "perfect", note: "Runs smoothly in fp8 or nf4" },
      { name: "LTX Video", status: "perfect", note: "Generates 5s clips reliably" },
      { name: "LoRA Training (SDXL)", status: "perfect", note: "Comfortable batch sizes" },
      { name: "LoRA Training (FLUX)", status: "ok", note: "Requires extreme optimization (Kohya)" },
    ],
    upgrade: "24GB only if you're training FLUX heavily.",
  },
  "24GB": {
    rating: "Elite",
    color: "indigo",
    desc: "The ultimate builder tier. No compromises, no out-of-memory errors.",
    models: [
      { name: "SDXL & FLUX.1 Dev", status: "perfect", note: "Handles fp16 native weights" },
      { name: "LTX Video & AnimateDiff", status: "perfect", note: "High resolution, long context" },
      { name: "LoRA Training (FLUX)", status: "perfect", note: "Train FLUX Dev with large batch sizes" },
      { name: "LLM Local Inference", status: "perfect", note: "Runs Llama 3 70B int4 smoothly" },
    ],
    upgrade: "None. You've reached the peak consumer tier (RTX 3090/4090/5090).",
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
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-16 font-sans">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl">
          Setup <span className="text-cyan-400">Rater</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 leading-relaxed mx-auto">
          Generative AI is entirely bound by <span className="text-white font-[700]">VRAM (Video RAM)</span>. Select your GPU&apos;s VRAM below to instantly see exactly what models and workflows you can comfortably run, and what you&apos;re missing out on.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── LEFT: SELECTION ────────────────────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0f172a]/50 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-xs font-[800] tracking-widest uppercase text-indigo-400 mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Select GPU VRAM
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {(["8GB", "12GB", "16GB", "24GB"] as VRAMTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedVRAM(tier)}
                  className={`py-4 rounded-2xl font-[800] text-lg border-2 transition-all duration-300 ${
                    selectedVRAM === tier 
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-105" 
                      : "border-indigo-500/10 bg-[#080b0f] text-zinc-500 hover:border-indigo-500/30 hover:text-zinc-300"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-indigo-500/10">
              <h4 className="text-sm font-[700] text-white mb-2">Not sure what you have?</h4>
              <p className="text-sm text-zinc-500 font-[500] leading-relaxed">
                Open Task Manager (Windows) {`>`} Performance tab {`>`} GPU. Look at the &quot;Dedicated GPU memory&quot; value.
              </p>
            </div>
          </div>

          <Link href="/tutorials" className="group flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 hover:bg-indigo-500/20 transition-all">
            <div>
              <h4 className="text-white font-[800] mb-1 group-hover:text-indigo-300 transition-colors">Learn to Optimize</h4>
              <p className="text-sm text-indigo-400 font-[500]">View guides on running heavy models.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── RIGHT: MATRIX RESULTS ──────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="bg-[#0f172a]/30 border border-indigo-500/20 rounded-3xl p-8 md:p-10 backdrop-blur-xl h-full flex flex-col">
            
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-3xl font-[800] text-white">
                {selectedVRAM} Rig Assessment
              </h2>
              <span className={`px-4 py-1.5 rounded-full text-xs font-[800] uppercase tracking-wider bg-${currentCaps.color}-500/10 text-${currentCaps.color}-400 border border-${currentCaps.color}-500/30`}>
                {currentCaps.rating}
              </span>
            </div>
            
            <p className="text-lg text-zinc-400 font-[500] mb-8 pb-8 border-b border-indigo-500/10 leading-relaxed">
              {currentCaps.desc}
            </p>

            <div className="flex-1">
              <h3 className="text-xs font-[800] tracking-widest uppercase text-zinc-500 mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Capability Matrix
              </h3>
              
              <div className="space-y-4">
                {currentCaps.models.map((model, i) => (
                  <div key={i} className="flex items-center gap-4 bg-[#080b0f]/50 p-4 rounded-2xl border border-white/5">
                    <div className="shrink-0">
                      {model.status === "perfect" && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {model.status === "ok" && <AlertTriangle className="w-5 h-5 text-cyan-400" />}
                      {model.status === "bad" && <XCircle className="w-5 h-5 text-indigo-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-[700] text-sm">{model.name}</h4>
                      <p className="text-xs text-zinc-500 font-[500] mt-0.5">{model.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-indigo-500/10">
              <h3 className="text-xs font-[800] tracking-widest uppercase text-zinc-500 mb-4">
                Recommended Upgrade Path
              </h3>
              <div className="bg-indigo-500/5 border border-indigo-500/20 border-dashed rounded-2xl p-4">
                <p className="text-sm font-[600] text-indigo-300">
                  {currentCaps.upgrade}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-32">
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
