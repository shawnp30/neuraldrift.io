"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Counter } from "@/components/shared/Counter";

export const HomeHero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-[160px] pb-16 overflow-hidden bg-[#080b0f]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px]" />
      </div>

      <div className="nh-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <div className="nh-animate-slide-up">
            <div className="nh-section-label" style={{ marginBottom: "1rem" }}>
              <span className="nh-node-pulse w-2 h-2 rounded-full bg-accent-cyan" />
              Neuraldrift AI Hub
            </div>
            
            <h1 className="font-syne text-5xl md:text-7xl font-[800] text-white leading-[1.05] mb-6 tracking-tight">
              Build, Optimize, and <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_auto] animate-gradient-x">
                Run AI Locally
              </span>
            </h1>

            <p className="text-xl text-zinc-400 font-[500] leading-relaxed mb-10 max-w-xl">
              Structured ComfyUI pipelines, GPU-tested workflows, and step-by-step 
              guides for local creation across image, video, and audio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/workflows" 
                className="px-8 py-4 bg-accent-cyan text-black font-[800] rounded-xl hover:scale-[1.02] transition-all nh-border-glow-cyan text-center"
              >
                Start Your First Workflow
              </Link>
              <Link 
                href="/workflows" 
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-[700] rounded-xl hover:bg-white/10 transition-all text-center"
              >
                Browse Workflow Library
              </Link>
            </div>

            {/* Sub-stats hidden as requested */}
            <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-8">
              <div>
                <div className="text-2xl font-[800] text-white flex items-center">
                  <Counter value={50} />+
                </div>
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Workflows</div>
              </div>
              <div>
                <div className="text-2xl font-[800] text-white flex items-center">
                  <Counter value={0} />
                </div>
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Ads Ever</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Asset */}
          <div className="relative group lg:block hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl">
              <Image
                src="/images/comfyui-hero.png"
                alt="Branded ComfyUI Workflow"
                width={800}
                height={600}
                priority
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              {/* Overlay Glass Nodes (Simulated) */}
              <div className="absolute top-4 left-4 nh-glass-card p-3 rounded-lg text-[10px] font-mono text-accent-cyan flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                COMFYUI_LOAD_MODEL
              </div>
              <div className="absolute bottom-20 right-6 nh-glass-card p-3 rounded-lg text-[10px] font-mono text-accent-purple flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                KSAMPLER_REFINED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
