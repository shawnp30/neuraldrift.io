"use client";

import Link from "next/link";
import React from "react";

export const FinalCTA = () => {
  return (
    <section className="py-24 bg-[#080b0f] relative overflow-hidden text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent-cyan/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="nh-container relative z-10">
        <h2 className="font-syne text-5xl md:text-7xl font-[800] text-white leading-tight mb-6 tracking-tight">
          Start Creating <br />
          <span className="text-accent-cyan">Locally Today</span>
        </h2>
        
        <p className="text-xl text-zinc-400 font-[500] mb-12 max-w-2xl mx-auto">
          No sign-in required. Download, import, create. <br />
          Your hardware is ready. Are you?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/workflows" 
            className="px-10 py-5 bg-accent-cyan text-black font-[800] rounded-2xl hover:scale-[1.02] transition-all nh-border-glow-cyan text-lg"
          >
            Start Workflow
          </Link>
          <Link 
            href="/workflows" 
            className="px-10 py-5 bg-white/5 border border-white/10 text-white font-[700] rounded-2xl hover:bg-white/10 transition-all text-lg"
          >
            Explore Library
          </Link>
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Neuraldrift — Local AI Workflow Architecture
        </p>
      </div>
    </section>
  );
};
