"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ArrowRight, Play, BookOpen, Settings } from "lucide-react";

const CARDS = [
  {
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    level: "Beginner",
    levelColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: <Settings size={16} className="text-emerald-400" />,
    title: "ComfyUI Complete Setup: RTX 5080 Edition",
    readTime: "12 min",
    href: "/guides/comfyui-complete-setup",
    desc: "Install, configure, and benchmark your first ComfyUI workflow. From zero to generating in under 30 minutes.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
    level: "Intermediate",
    levelColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: <BookOpen size={16} className="text-orange-400" />,
    title: "Train Your First FLUX LoRA in Under 6 Hours",
    readTime: "28 min",
    href: "/guides/train-flux-lora",
    desc: "Dataset prep, Kohya config, training loop, and quality evaluation. Exact settings for RTX 5080 and 3080.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop",
    level: "Advanced",
    levelColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    icon: <Play size={16} className="text-violet-400" />,
    title: "LTX Video 2.3: Cinematic Action Sequences",
    readTime: "35 min",
    href: "/guides/ltx-video-cinematic-action",
    desc: "Build chase and action scenes with consistent motion, camera lock, and temporal coherence between clips.",
  },
];

export const LearningPreview = () => {
  return (
    <section className="border-t border-white/5 bg-transparent py-16">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map((card, idx) => (
            <Link
              href={card.href}
              key={idx}
              className="nh-glass-card group flex flex-col overflow-hidden rounded-2xl transition-all hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized // Simplifies demo
                />

                {/* Level Badge Overlay */}
                <div className="absolute left-4 top-4 z-10">
                  <span
                    className={`inline-block rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${card.levelColor}`}
                  >
                    {card.level}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    {card.readTime}
                  </div>
                </div>

                <h3 className="group-hover:text-accent-cyan mb-3 font-syne text-lg font-[800] leading-tight text-white transition-colors">
                  {card.title}
                </h3>

                <p className="mb-6 flex-1 text-xs font-[500] leading-relaxed text-zinc-400">
                  {card.desc}
                </p>

                <div className="mt-auto flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-colors group-hover:text-white">
                  Read Lesson{" "}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
