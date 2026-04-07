"use client";

import { DollarSign, Presentation, Target, Rocket, Briefcase, Zap, MoveRight } from "lucide-react";
import Link from "next/link";

export default function MonetizingComfyUIGuide() {
  return (
    <div className="min-h-screen bg-transparent text-slate-50 pt-32 pb-24 font-sans selection:bg-amber-500/30">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] text-indigo-500">
          <DollarSign className="w-8 h-8" />
        </div>
        <p className="text-indigo-400 font-[800] tracking-widest uppercase text-sm mb-4">Masterclass Guide</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Monetize Your <br/><span className="text-indigo-400">Workflows.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          How to turn your local ComfyUI instance from a hobby into a high-margin digital business using Print-on-Demand, freelancing, and digital asset sales.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* ── SECTION 1 ── */}
        <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Presentation className="w-7 h-7 text-indigo-400" /> 1. The Freelance Agency (Fiverr & Upwork)
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              The highest immediate ROI for your ComfyUI skills is B2B (Business-to-Business) generation. Brands constantly need high-quality assets but lack the technical skills or hardware to run FLUX or SDXL locally.
            </p>
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-indigo-400 font-[800] mb-3 uppercase tracking-widest text-xs">High-Demand Gigs</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-[500] text-zinc-300"><strong className="text-white">Product Photography Replacement:</strong> Train a LoRA on a client's specific product (e.g., a perfume bottle). Use ComfyUI to generate the product in impossible, high-end environments (glaciers, luxury marble bathrooms). Charge $50-$100 per final image.</p>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-[500] text-zinc-300"><strong className="text-white">Consistent AI Influencers:</strong> Setup an IPAdapter + FaceID workflow to generate the exact same face in hundreds of different poses and outfits. Social media managers will pay retainers for consistent character content.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── SECTION 2 ── */}
        <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Rocket className="w-7 h-7 text-sky-400" /> 2. Print-on-Demand (POD) Automation
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              Platforms like Printify and Printful allow you to sell physical products (t-shirts, canvases, mugs) without holding inventory. Your ComfyUI workflows can act as an infinite art engine for these shops.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h4 className="text-sky-400 font-[800] mb-2">The Setup</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Build a workflow centered around <span className="text-white font-[700]">SDXL</span> or <span className="text-white font-[700]">FLUX</span> prioritizing line-art, vector-style typography, or specific niche graphics (e.g., retro synthwave cars, dark fantasy tarot cards).</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h4 className="text-sky-400 font-[800] mb-2">The Secret Sauce</h4>
                <p className="text-sm text-zinc-400 font-[500] leading-relaxed">Incorporate an <span className="text-white font-[700]">Image Rembg (Background Removal)</span> node and an <span className="text-white font-[700]">Ultimate SD Upscaler</span> node right into your pipeline. You want your outputs to be 4000x4000px transparent PNGs instantly ready for a t-shirt print.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3 ── */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative">
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-6 relative z-10 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" /> 3. Selling Digital Assets
          </h2>
          <div className="space-y-6 relative z-10">
            <p className="text-zinc-300 font-[500] leading-relaxed text-lg">
              If client work isn't your speed, build assets once and sell them infinitely on platforms like Etsy, Gumroad, and Adobe Stock.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-4 bg-black/60 p-4 rounded-xl border border-white/5">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-[600] text-white">Stock Photography (Adobe Stock now accepts AI images if properly labeled).</span>
              </li>
              <li className="flex items-center gap-4 bg-black/60 p-4 rounded-xl border border-white/5">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-[600] text-white">VTuber & Streamer Assets (Overlays, animated backgrounds generated via AnimateDiff).</span>
              </li>
              <li className="flex items-center gap-4 bg-black/60 p-4 rounded-xl border border-white/5">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-[600] text-white">Selling your curated ComfyUI Workflows themselves on Patreon or Gumroad.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
              <Link href="/tutorials" className="flex items-center gap-2 text-sm font-[800] text-zinc-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-xl">
                ← Back to Tutorials
              </Link>
              <Link href="/workflows" className="flex items-center gap-2 text-sm font-[800] text-black bg-indigo-400 hover:bg-indigo-300 transition-colors px-6 py-3 rounded-xl">
                Explore Workflows <MoveRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
