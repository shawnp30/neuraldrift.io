"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Counter } from "@/components/shared/Counter";

export const HomeHero = () => {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-transparent pb-16 pt-[160px]">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div className="bg-accent-cyan/10 absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-accent-purple/10 blur-[120px]" />
      </div>

      <div className="nh-container relative z-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Column: Content */}
          <div className="nh-animate-slide-up">
            <div className="nh-section-label" style={{ marginBottom: "1rem" }}>
              <span className="nh-node-pulse bg-accent-cyan h-2 w-2 rounded-full" />
              Neuraldrift AI Hub
            </div>

            <h1 className="mb-6 font-syne text-5xl font-[800] leading-[1.05] tracking-tight text-white md:text-7xl">
              Build, Optimize, and <br />
              <span className="from-accent-cyan to-accent-cyan animate-gradient-x bg-gradient-to-r via-accent-purple bg-[length:200%_auto] bg-clip-text text-transparent">
                Run AI Locally
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-xl font-[500] leading-relaxed text-zinc-400">
              Structured ComfyUI pipelines, GPU-tested workflows, and
              step-by-step guides for local creation across image, video, and
              audio.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/workflows"
                className="bg-accent-cyan nh-border-glow-cyan rounded-xl px-8 py-4 text-center font-[800] text-black transition-all hover:scale-[1.02]"
              >
                Start Your First Workflow
              </Link>
              <Link
                href="/workflows"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-center font-[700] text-white transition-all hover:bg-white/10"
              >
                Browse Workflow Library
              </Link>
            </div>

            {/* Sub-stats hidden as requested */}
            <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-8">
              <div>
                <div className="flex items-center text-2xl font-[800] text-white">
                  <Counter value={50} />+
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  Workflows
                </div>
              </div>
              <div>
                <div className="flex items-center text-2xl font-[800] text-white">
                  <Counter value={0} />
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  Ads Ever
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Asset */}
          <div className="group relative hidden lg:block">
            <div className="from-accent-cyan absolute -inset-0.5 rounded-3xl bg-gradient-to-r to-accent-purple opacity-20 blur transition duration-1000 group-hover:opacity-40"></div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl">
              <Image
                src="/images/comfyui-hero.png"
                alt="Branded ComfyUI Workflow"
                width={800}
                height={600}
                priority
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              {/* Overlay Glass Nodes (Simulated) */}
              <div className="nh-glass-card text-accent-cyan absolute left-4 top-4 flex items-center gap-2 rounded-lg p-3 font-mono text-[10px]">
                <span className="bg-accent-cyan h-1.5 w-1.5 animate-pulse rounded-full" />
                COMFYUI_LOAD_MODEL
              </div>
              <div className="nh-glass-card absolute bottom-20 right-6 flex items-center gap-2 rounded-lg p-3 font-mono text-[10px] text-accent-purple">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-purple" />
                KSAMPLER_REFINED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
