"use client";

import React from "react";
import { MousePointer2, Settings2, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: < MousePointer2 size={24} className="text-accent-cyan" />,
    title: "1 — Choose a Workflow Template",
    description: "Select from optimized pipelines for your hardware and goals."
  },
  {
    icon: < Settings2 size={24} className="text-accent-purple" />,
    title: "2 — Customize and Run Locally",
    description: "Node-based control with full workflow flexibility."
  },
  {
    icon: < ShieldCheck size={24} className="text-accent-cyan" />,
    title: "3 — Optimize With Tools",
    description: "Use VRAM assistant, hardware guide, and artifact validator."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-[#0b0f14] relative overflow-hidden">
      <div className="nh-container">
        <div className="text-center mb-16">
          <div className="nh-section-label justify-center mb-4">The Process</div>
          <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
            Build Smarter. Create Faster.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-[32px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block hidden" />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
              <div className="mb-8 w-16 h-16 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center nh-glass-card group-hover:border-accent-cyan/30">
                {step.icon}
              </div>
              <h3 className="text-xl font-[800] text-white mb-4">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 font-[500] leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
