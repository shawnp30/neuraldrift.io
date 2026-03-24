"use client";

import { Layers, Database, Cpu, Clock, TerminalSquare, AlertCircle } from "lucide-react";

export default function LorasGuidePage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-24 font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-emerald-400">
          <Layers className="w-8 h-8" />
        </div>
        <p className="text-emerald-400 font-[800] tracking-widest uppercase text-sm mb-4">Training Mastery</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Custom <span className="text-emerald-400">LoRAs.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Inject specific characters, objects, and art styles into massive AI models without retraining from scratch. Here is everything you need to know.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* ── SECTION 1: WTF IS A LORA? ── */}
        <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Database className="w-7 h-7 text-emerald-400" /> What Do LoRAs Do?
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              LoRA stands for <span className="text-emerald-400 font-[800]">Low-Rank Adaptation</span>. 
            </p>
            <p className="text-zinc-400 font-[500] leading-relaxed">
              Base models like FLUX.1 or SDXL are massive (often 6GB to 23GB in size) and take thousands of GPUs to train on the internet&apos;s data. You cannot easily teach them a new concept (like your face, or a specific product) by just prompting.
            </p>
            <p className="text-zinc-400 font-[500] leading-relaxed">
              A LoRA is a tiny, lightweight mathematical patch (usually 50MB to 500MB) that slides into the base model during generation. It forcefully steers the model's existing knowledge to generate exactly what you trained it on.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
              <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-2xl">
                <h4 className="text-emerald-400 font-[800] mb-2">Character LoRAs</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Train on 15-20 photos of a specific person's face to generate them perfectly in any scenario.</p>
              </div>
              <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-2xl">
                <h4 className="text-emerald-400 font-[800] mb-2">Style LoRAs</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Upload 30+ images of a specific artistic style (e.g. 1990s Anime, Tarot Cards) to force the model to render in that exact aesthetic.</p>
              </div>
              <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-2xl">
                <h4 className="text-emerald-400 font-[800] mb-2">Product LoRAs</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Train on a specific sneaker, can, or packaging to generate infinite photorealistic lifestyle shots of that product.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: HARDWARE & TIME ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#0f172a]/50 border border-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-md">
            <h2 className="text-xl md:text-2xl font-[800] text-white mb-6 flex items-center gap-3">
              <Cpu className="w-6 h-6 text-sky-400" /> Hardware Requirements
            </h2>
            <p className="text-zinc-400 font-[500] mb-8 leading-relaxed">
              Training a LoRA requires significant GPU VRAM. You can train locally on an Nvidia GPU or rent a cloud instance (like RunPod).
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-xl">
                <span className="font-[800] text-white">SD 1.5 Base</span>
                <span className="bg-sky-500/10 text-sky-400 font-mono text-xs px-3 py-1 rounded border border-sky-500/20 uppercase tracking-widest">8GB+ VRAM</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5 rounded-xl">
                <span className="font-[800] text-white">SDXL Base</span>
                <span className="bg-sky-500/10 text-sky-400 font-mono text-xs px-3 py-1 rounded border border-sky-500/20 uppercase tracking-widest">12GB+ VRAM</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/40 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 mix-blend-screen" />
                <span className="font-[800] text-emerald-400 relative z-10">FLUX.1 Dev Base</span>
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-3 py-1 rounded border border-emerald-500/30 uppercase tracking-widest relative z-10">24GB+ VRAM</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/50 border border-white/5 p-8 md:p-10 rounded-3xl backdrop-blur-md">
            <h2 className="text-xl md:text-2xl font-[800] text-white mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-400" /> Time Estimates
            </h2>
            <p className="text-zinc-400 font-[500] mb-8 leading-relaxed">
              Training time scales exponentially based on your dataset size, the base model, and your GPU speed (e.g., RTX 3090 vs RTX 4090).
            </p>
            
            <div className="space-y-4">
              <div className="p-5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-[800] text-white">Quick Character (SDXL)</span>
                  <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">~30 Mins</span>
                </div>
                <p className="text-xs text-zinc-500 font-[500]">15 images, 1500 steps on an RTX 4090.</p>
              </div>
              <div className="p-5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-[800] text-white">High-Quality Style (FLUX)</span>
                  <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">1 - 3 Hours</span>
                </div>
                <p className="text-xs text-zinc-500 font-[500]">40 images, fp8 precision, 3000 steps on a 24GB GPU.</p>
              </div>
              <div className="p-5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-[800] text-white">Massive Concept (FLUX)</span>
                  <span className="text-red-400 font-mono text-xs uppercase tracking-widest">6+ Hours</span>
                </div>
                <p className="text-xs text-zinc-500 font-[500]">100+ images, heavy regularization, intense learning rate.</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* ── SECTION 3: USAGE IN COMFYUI ── */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative">
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-8 flex items-center gap-3">
            <TerminalSquare className="w-7 h-7 text-indigo-400" /> Using LoRAs in ComfyUI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-black/60 border border-white/5 p-6 rounded-2xl relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-[900] text-sm text-white shadow-lg">1</div>
              <h4 className="text-white font-[800] mb-3 mt-2">Place the File</h4>
              <p className="text-sm text-zinc-400 font-[500] leading-relaxed">
                Move your newly trained `.safetensors` file into the <code className="text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded font-mono text-xs">ComfyUI/models/loras</code> folder.
              </p>
            </div>

            <div className="bg-black/60 border border-white/5 p-6 rounded-2xl relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-[900] text-sm text-white shadow-lg">2</div>
              <h4 className="text-white font-[800] mb-3 mt-2">Load the Node</h4>
              <p className="text-sm text-zinc-400 font-[500] leading-relaxed">
                Right click the canvas: <span className="text-white font-[700]">Add Node &gt; loaders &gt; Load LoRA</span>. Connect it between your Checkpoint Loader and KSampler.
              </p>
            </div>

            <div className="bg-black/60 border border-white/5 p-6 rounded-2xl relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-[900] text-sm text-white shadow-lg">3</div>
              <h4 className="text-white font-[800] mb-3 mt-2">Trigger it</h4>
              <p className="text-sm text-zinc-400 font-[500] leading-relaxed">
                Select your file in the node. Set the strength between 0.6 and 1.0. Include your trigger word (e.g. "ohwx man") in your positive prompt.
              </p>
            </div>
          </div>

          <div className="mt-10 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-indigo-200/80 font-[500] text-sm leading-relaxed">
              <strong className="text-indigo-300">Pro Tip:</strong> Multiple LoRAs can be stacked by daisy-chaining "Load LoRA" nodes together. However, mixing too many styles and characters simultaneously will deep-fry the image output. Keep it under 3.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
