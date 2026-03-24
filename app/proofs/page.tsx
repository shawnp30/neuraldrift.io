"use client";

import Image from "next/image";
import { ExternalLink, CheckCircle2 } from "lucide-react";

// Mock data for workflow proofs
const PROOFS = [
  {
    id: "p1",
    author: "@shawn_builds",
    model: "FLUX.1 Dev + Concept LoRA",
    workflow: "Elite Character Generator",
    prompt: "Cinematic portrait of a cyberpunk bounty hunter, neon city lights, 35mm photography, volumetric fog, high detail...",
    image: "/workflow-previews/wf-1.svg",
    vramUsed: "14GB",
    genTime: "12.5s",
  },
  {
    id: "p2",
    author: "@ai_architect",
    model: "SDXL 1.0 + ControlNet",
    workflow: "Architectural Exterior Realism",
    prompt: "Brutalist concrete mansion in a misty pine forest, twilight, golden interior lighting, architectural visualization...",
    image: "/workflow-previews/wf-2.svg",
    vramUsed: "11GB",
    genTime: "8.2s",
  },
  {
    id: "p3",
    author: "@studio_drift",
    model: "FLUX.1 Schnell",
    workflow: "Product Photography Pro",
    prompt: "Minimalist skincare bottle on a travertine stone podium, soft studio lighting, water droplets, macro photography...",
    image: "/workflow-previews/wf-3.svg",
    vramUsed: "8.5GB",
    genTime: "4.1s",
  },
  {
    id: "p4",
    author: "@neural_nomad",
    model: "SD 1.5 + AnimateDiff",
    workflow: "Motion Deforum Engine",
    prompt: "Seamless loop of a futuristic train window passing through a vibrant Tokyo metropolis, rainy evening...",
    image: "/workflow-previews/wf-1.svg",
    vramUsed: "16GB",
    genTime: "2m 15s",
  },
  {
    id: "p5",
    author: "@shawn_builds",
    model: "FLUX.1 Dev",
    workflow: "Photoreal Food Stylist",
    prompt: "Gourmet sushi platter, wispy smoke from dry ice, dark slate table, bokeh, shallow depth of field, 8k resolution...",
    image: "/workflow-previews/wf-3.svg",
    vramUsed: "15GB",
    genTime: "14s",
  },
  {
    id: "p6",
    author: "@visionary_vfx",
    model: "SDXL + LCM",
    workflow: "Realtime Asset Creator",
    prompt: "Detailed fantasy sword, glowing runes, obsidian blade, concept art, white background, isolated...",
    image: "/workflow-previews/wf-2.svg",
    vramUsed: "8GB",
    genTime: "1.2s",
  },
];

export default function ProofsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-16">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 text-center">
        <p className="text-indigo-400 font-[700] tracking-widest uppercase text-sm mb-4">
          Community Gallery
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl">
          Workflow <span className="text-indigo-400">Proofs</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Stunning results generated globally using Neuraldrift's optimized ComfyUI workspaces and custom LoRAs.
        </p>
      </div>

      {/* ── PROOFS MASONRY GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {PROOFS.map((proof) => (
            <div 
              key={proof.id} 
              className="break-inside-avoid bg-[#0f172a]/40 border border-indigo-500/10 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(99,102,241,0.08)]"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/5] bg-[#080b0f] overflow-hidden">
                <Image
                  src={proof.image}
                  alt={proof.workflow}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                
                {/* Author Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-xs font-[700] text-zinc-200">
                    {proof.author}
                  </span>
                  {proof.author === "@shawn_builds" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>

                {/* Performance Stats Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <div className="bg-indigo-500/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-[800] tracking-wide text-white">
                    {proof.vramUsed} VRAM
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-[800] tracking-wide text-zinc-300">
                    {proof.genTime}
                  </div>
                </div>
              </div>

              {/* Data payload body */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-[800] text-white leading-snug group-hover:text-cyan-300 transition-colors">
                    {proof.workflow}
                  </h3>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs font-[700] text-indigo-400 mb-4">
                  {proof.model}
                </p>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-[500] text-zinc-400 font-mono leading-relaxed line-clamp-3">
                    "{proof.prompt}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
