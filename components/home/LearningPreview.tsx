"use client";

import Link from "next/link";
import React from "react";
import { GraduationCap, Trophy, Wrench, Cpu, ArrowRight } from "lucide-react";

const CARDS = [
  {
    icon: <GraduationCap size={20} className="text-accent-cyan" />,
    title: "ComfyUI Deployment Guide",
    cta: "Read Guide",
    href: "/guides/comfyui-deployment-guide",
    desc: "Master the full lifecycle of ComfyUI deployment from local to cloud.",
  },
  {
    icon: <Trophy size={20} className="text-accent-purple" />,
    title: "Workflow Setup Guide",
    cta: "Read Guide",
    href: "/guides/ai-workflow-setup-guide",
    desc: "Architect scalable, modular AI systems for production environments.",
  },
  {
    icon: <Wrench size={20} className="text-accent-cyan" />,
    title: "LoRA Training Toolkit",
    cta: "Start Training",
    href: "/loras",
    desc: "Everything you need to fine-tune custom characters.",
  },
  {
    icon: <Cpu size={20} className="text-accent-purple" />,
    title: "Local Model Selection Guide",
    cta: "Explore Models",
    href: "/hardware",
    desc: "Pick the right GGUF or Safetensors for your VRAM.",
  },
];

export const LearningPreview = () => {
  return (
    <section className="border-t border-white/5 bg-[#080b0f] py-24">
      <div className="nh-container">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="nh-section-label mb-4">Educational Hub</div>
            <h2 className="font-syne text-4xl font-[800] tracking-tight text-white md:text-5xl">
              Master Local AI Creation
            </h2>
          </div>
          <Link
            href="/models"
            className="flex items-center gap-3 rounded-full bg-accent px-12 py-5 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            EXPLORE MODELS
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, idx) => (
            <div
              key={idx}
              className="nh-glass-card group overflow-hidden rounded-2xl p-1"
            >
              <div className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="group-hover:bg-accent-cyan/10 rounded-lg border border-white/10 bg-white/5 p-2 transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="font-mono text-sm font-[800] uppercase tracking-tight text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="mb-8 flex-1 text-xs font-[500] text-zinc-500">
                  {card.desc}
                </p>
                <Link
                  href={card.href}
                  className="hover:border-accent-cyan/30 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-white transition-all hover:bg-white/10"
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
