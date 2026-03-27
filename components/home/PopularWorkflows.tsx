"use client";

import Link from "next/link";
import React from "react";
import { Download, Layout } from "lucide-react";

const WORKFLOWS = [
  {
    title: "Starter Diffusion Workflow",
    desc: "Optimized for 8GB VRAM cards using SD1.5.",
    category: "Image / Low VRAM",
    href: "/workflows/essential/the-essential-flux.json"
  },
  {
    title: "High-Detail Image Pipeline",
    desc: "Professional SDXL architecture with Hires. fix.",
    category: "Image / Pro",
    href: "/workflows/essential/high-res-pipeline.json"
  },
  {
    title: "Video Generation Flow",
    desc: "Cinematic motion using LTX-Video and AnimateDiff.",
    category: "Video / Animation",
    href: "/workflows/essential/animatediff.json"
  },
  {
    title: "LoRA Training Graph",
    desc: "Targeted concept extraction and character training.",
    category: "Training / Experimental",
    href: "/workflows/essential/dual-lora.json"
  },
  {
    title: "Audio Generation Flow",
    desc: "Stable Audio and AudioLDM integration for sound FX.",
    category: "Audio / Experimental",
    href: "/workflows/essential/ultimate-upscaler.json"
  }
];

export const PopularWorkflows = () => {
  return (
    <section className="py-24 bg-[#0b0f14] border-t border-white/5">
      <div className="nh-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="nh-section-label mb-4">Workflow Library</div>
            <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
              Popular Workflow Templates
            </h2>
          </div>
          <Link 
            href="/workflows" 
            className="text-accent-purple font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            View Full Library →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WORKFLOWS.map((wf, idx) => (
            <div key={idx} className="nh-glass-card rounded-3xl p-8 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layout size={80} />
              </div>
              
              <div className="relative z-10">
                <span className="inline-block px-2 py-1 rounded bg-accent-purple/10 border border-accent-purple/20 text-[10px] font-mono uppercase tracking-widest text-accent-purple mb-4">
                  {wf.category}
                </span>
                <h3 className="text-2xl font-[800] text-white mb-3">
                  {wf.title}
                </h3>
                <p className="text-sm text-zinc-400 font-[500] mb-8 leading-relaxed">
                  {wf.desc}
                </p>
                <a 
                  href={wf.href} 
                  download={`${wf.title.toLowerCase().replace(/\s+/g, "-")}.json`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-purple text-white font-[700] hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Download size={18} />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
