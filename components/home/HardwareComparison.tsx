"use client";

import Link from "next/link";
import React from "react";
import { Monitor, Tablet } from "lucide-react";

export const HardwareComparison = () => {
  return (
    <section className="py-24 bg-[#080b0f] border-t border-white/5">
      <div className="nh-container">
        <div className="text-center mb-16">
          <div className="nh-section-label justify-center mb-4">Hardware Guide</div>
          <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
            Local vs Portable AI Creation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Desktop Column */}
          <div className="nh-glass-card rounded-3xl p-10 flex flex-col items-center text-center">
            <div className="mb-8 p-4 rounded-3xl bg-accent-cyan/10 border border-accent-cyan/20">
              <Monitor size={48} className="text-accent-cyan" />
            </div>
            <h3 className="text-2xl font-[800] text-white mb-6 uppercase tracking-wider">
              Desktop Setup
            </h3>
            <ul className="space-y-4 mb-10 text-zinc-400 font-[500] text-sm leading-relaxed">
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-cyan">✓</span> Maximum performance
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-cyan">✓</span> Ideal for training
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-cyan">✓</span> Best for high-VRAM workflows
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-cyan">✓</span> Multi-GPU scalability
              </li>
            </ul>
            <Link 
              href="/hardware" 
              className="mt-auto px-10 py-4 rounded-xl border border-accent-cyan/20 text-accent-cyan font-[800] uppercase tracking-widest text-xs hover:bg-accent-cyan/10 hover:border-accent-cyan/40 transition-all"
            >
              Compare Setups
            </Link>
          </div>

          {/* Portable Column */}
          <div className="nh-glass-card rounded-3xl p-10 flex flex-col items-center text-center">
            <div className="mb-8 p-4 rounded-3xl bg-accent-purple/10 border border-accent-purple/20">
              <Tablet size={48} className="text-accent-purple" />
            </div>
            <h3 className="text-2xl font-[800] text-white mb-6 uppercase tracking-wider">
              Portable Setup
            </h3>
            <ul className="space-y-4 mb-10 text-zinc-400 font-[500] text-sm leading-relaxed">
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-purple">✓</span> Great for mobile creators
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-purple">✓</span> Best for quick tests
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-purple">✓</span> Good for small workloads
              </li>
              <li className="flex items-center gap-2 justify-center">
                <span className="text-accent-purple">✓</span> Energy efficient
              </li>
            </ul>
            <Link 
              href="/hardware" 
              className="mt-auto px-10 py-4 rounded-xl border border-accent-purple/20 text-accent-purple font-[800] uppercase tracking-widest text-xs hover:bg-accent-purple/10 hover:border-accent-purple/40 transition-all"
            >
              Compare Setups
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
