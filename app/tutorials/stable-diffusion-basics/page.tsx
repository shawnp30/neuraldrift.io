"use client";

import { Box, Workflow, Share2, Lightbulb, MoveRight } from "lucide-react";
import Link from "next/link";

export default function SDXLBasicsGuide() {
  return (
    <div className="min-h-screen bg-transparent text-slate-50 pt-32 pb-24 font-sans selection:bg-sky-500/30">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(14,165,233,0.15)] text-sky-400">
          <Workflow className="w-8 h-8" />
        </div>
        <p className="text-sky-400 font-[800] tracking-widest uppercase text-sm mb-4">Core Foundations</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Stable Diffusion <span className="text-sky-400">Basics.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate primer on Checkpoints, Nodes, KSamplers, and Latent Space for absolute beginners in ComfyUI.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* ── SECTION 1 ── */}
        <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Box className="w-7 h-7 text-sky-400" /> 1. The Anatomy of a Generation
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              Unlike Midjourney which hides the magic behind a Discord bot, ComfyUI exposes the raw pipeline. Every image generation requires 4 core components to be wired together.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-xs font-[900] text-sky-400 uppercase tracking-widest mb-1 block">Component 01</span>
                <h4 className="text-white font-[800] mb-2 text-lg">Load Checkpoint</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">This loads the main "brain" (the `.safetensors` model file like SDXL or FLUX). It contains the vast database of visual knowledge.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-xs font-[900] text-pink-400 uppercase tracking-widest mb-1 block">Component 02</span>
                <h4 className="text-white font-[800] mb-2 text-lg">CLIP Text Encode</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">This acts as a translator. It takes your English prompt and converts it into mathematical vectors the Checkpoint can understand.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-xs font-[900] text-emerald-400 uppercase tracking-widest mb-1 block">Component 03</span>
                <h4 className="text-white font-[800] mb-2 text-lg">Empty Latent Image</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Think of this as your blank canvas. You specify the width and height (e.g., 1024x1024) here *before* any drawing happens.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-xs font-[900] text-amber-400 uppercase tracking-widest mb-1 block">Component 04</span>
                <h4 className="text-white font-[800] mb-2 text-lg">The KSampler</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">The engine room. It takes the text vectors, the blank canvas, and the Checkpoint data, and runs the "denoising" steps to physically form the image.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 ── */}
        <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Share2 className="w-7 h-7 text-indigo-400" /> 2. Understanding Latent Space
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg pb-4 border-b border-white/5">
              Stable Diffusion does not generate pixels directly from thin air. It operates in <strong>Latent Space</strong>—a compressed, mathematical representation of images.
            </p>
            <p className="text-zinc-400 font-[500] leading-relaxed">
              When the <span className="text-white font-[700]">KSampler</span> finishes its job, the result is *not* an image file. It is a cluster of latent data. To actually see it, you must pass it through a <span className="text-amber-400 font-[700] border-b border-amber-400/30">VAE Decode</span> node.
            </p>
            <p className="text-zinc-400 font-[500] leading-relaxed">
              The VAE (Variational Auto-Encoder) acts as a decompresor. It takes the latent data and expands it outward into visible RGB pixels that your monitor can display inside a <span className="text-white font-[700]">Save Image</span> node.
            </p>
          </div>
        </div>

        {/* ── SECTION 3 ── */}
        <div className="bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative">
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-white" /> 3. Wiring It All Together
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              ComfyUI relies on matching color-coded noodles. Model (Purple) connects to Model. Conditioning (Orange) connects to Conditioning. Latent (Pink) connects to Latent.
            </p>
            <p className="text-sm font-[600] text-sky-400 bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
              The fastest way to learn is to download a JSON workflow from our database, drag it into your ComfyUI browser tab, and study how the nodes are wired!
            </p>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
              <Link href="/tutorials" className="flex items-center gap-2 text-sm font-[800] text-zinc-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-xl">
                ← Back to Tutorials
              </Link>
              <Link href="/workflows" className="flex items-center gap-2 text-sm font-[800] text-black bg-sky-400 hover:bg-sky-300 transition-colors px-6 py-3 rounded-xl">
                Download a Base Workflow <MoveRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
