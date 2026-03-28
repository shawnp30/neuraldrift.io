"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const WORKFLOWS = [
  {
    title: "Starter Diffusion Workflow",
    desc: "Optimized for 8GB VRAM cards using SD1.5.",
    category: "Image / Low VRAM",
    tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    glowColor: "from-blue-500/20",
    image: "/images/workflows/cards/starter-diffusion.png",
    href: "/workflows/essential/the-essential-flux",
  },
  {
    title: "High-Detail Image Pipeline",
    desc: "Professional SDXL architecture with Hires. fix.",
    category: "Image / Pro",
    tagColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    glowColor: "from-cyan-500/20",
    image: "/images/workflows/cards/high-detail.png",
    href: "/workflows/essential/high-res-pipeline",
  },
  {
    title: "LoRA Training Graph",
    desc: "Targeted concept extraction and character training.",
    category: "Training / Experimental",
    tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    glowColor: "from-emerald-500/20",
    image: "/images/workflows/cards/lora-training.png",
    href: "/workflows/essential/dual-lora",
  },
  {
    title: "Audio Generation Flow",
    desc: "Stable Audio and AudioLDM integration for sound FX.",
    category: "Audio / Experimental",
    tagColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
    glowColor: "from-yellow-500/20",
    image: "/images/workflows/cards/audio-gen.png",
    href: "/workflows/essential/ultimate-upscaler",
  },
];

export const PopularWorkflows = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#0b0f14] py-28">
      {/* Subtle circuit background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
              Workflow Library
            </div>
            <h2 className="font-syne text-4xl font-[900] tracking-tight text-white md:text-5xl">
              Popular Workflow Templates
            </h2>
          </div>
          <Link
            href="/workflows"
            className="font-mono text-xs uppercase tracking-widest text-accent-purple transition-colors hover:text-white"
          >
            View Full Library →
          </Link>
        </div>

        {/* 2×2 Card Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {WORKFLOWS.map((wf, idx) => (
            <WorkflowCard key={idx} workflow={wf} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Individual Card Component ───────────────────────────────────────
interface WorkflowCardProps {
  workflow: (typeof WORKFLOWS)[number];
}

function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[#111820] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_0_60px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Thumbnail ── */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={workflow.image}
          alt={workflow.title}
          fill
          className={`object-cover transition-all duration-700 ${
            isHovered ? "scale-110 brightness-75" : "scale-100 brightness-90"
          }`}
          unoptimized
        />

        {/* Glow emanating from image */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${workflow.glowColor} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Bottom gradient fade into card body */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111820] to-transparent" />

        {/* Hover overlay: subtle node graph hint */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            isHovered ? "opacity-30" : "opacity-0"
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139,92,246,0.3) 0%, transparent 40%),
              radial-gradient(circle at 70% 60%, rgba(0,229,255,0.2) 0%, transparent 35%),
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 30px 30px, 30px 30px",
          }}
        />

        {/* Category tag */}
        <div className="absolute left-5 top-5 z-10">
          <span
            className={`inline-block rounded-lg border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${workflow.tagColor}`}
          >
            {workflow.category}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="relative px-8 pb-8 pt-2">
        <h3 className="mb-2 font-syne text-xl font-[900] tracking-tight text-white transition-colors duration-300 group-hover:text-accent">
          {workflow.title}
        </h3>
        <p className="mb-6 text-sm font-medium leading-relaxed text-zinc-300">
          {workflow.desc}
        </p>

        <Link
          href={workflow.href}
          className="inline-flex items-center gap-2.5 rounded-xl bg-[#7C3AED] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#6D28D9] hover:shadow-[0_0_25px_rgba(124,58,237,0.35)] active:scale-[0.97]"
        >
          Explore Pipeline
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
