"use client";

import Link from "next/link";
import React from "react";
import { GraduationCap, Trophy, Wrench, Cpu } from "lucide-react";

const CARDS = [
  {
    icon: < GraduationCap size={20} className="text-accent-cyan" />,
    title: "ComfyUI Deployment Guide",
    cta: "Read Guide",
    href: "/guides/comfyui-deployment-guide",
    desc: "Master the full lifecycle of ComfyUI deployment from local to cloud."
  },
  {
    icon: < Trophy size={20} className="text-accent-purple" />,
    title: "Workflow Setup Guide",
    cta: "Read Guide",
    href: "/guides/ai-workflow-setup-guide",
    desc: "Architect scalable, modular AI systems for production environments."
  },
  {
    icon: < Wrench size={20} className="text-accent-cyan" />,
    title: "LoRA Training Toolkit",
    cta: "Start Training",
    href: "/loras",
    desc: "Everything you need to fine-tune custom characters."
  },
  {
    icon: < Cpu size={20} className="text-accent-purple" />,
    title: "Local Model Selection Guide",
    cta: "Explore Models",
    href: "/hardware",
    desc: "Pick the right GGUF or Safetensors for your VRAM."
  }
];

export const LearningPreview = () => {
  return (
    <section className="py-24 bg-[#080b0f] border-t border-white/5">
      <div className="nh-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="nh-section-label mb-4">Educational Hub</div>
            <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
              Master Local AI Creation
            </h2>
          </div>
          <Link 
            href="/tutorials" 
            className="text-accent-cyan font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Explore All Guides →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card, idx) => (
            <div key={idx} className="nh-glass-card rounded-2xl p-1 overflow-hidden group">
              <div className="p-6 h-full flex flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-accent-cyan/10 transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="text-sm font-[800] text-white tracking-tight uppercase font-mono">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 font-[500] mb-8 flex-1">
                  {card.desc}
                </p>
                <Link 
                  href={card.href} 
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-center font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/10 hover:border-accent-cyan/30 transition-all"
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
