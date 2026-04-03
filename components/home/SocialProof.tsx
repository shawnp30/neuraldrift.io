"use client";

import React from "react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    content: "Neuraldrift solved my VRAM bottleneck issues. The step-by-step guides for FLUX training are the most accurate I've found.",
    author: "Technical Creator @ AI_Labs",
    role: "Local AI Researcher"
  },
  {
    content: "The pre-built ComfyUI workflows are a lifesaver. No more 'Disconnected Node' errors or hunting for missing custom nodes.",
    author: "Visual Designer",
    role: "Workflow Architect"
  },
  {
    content: "Clean, technical, and zero fluff. If you're serious about running models locally, this is the first place you should check.",
    author: "Software Engineer",
    role: "Independent Dev"
  }
];

export const SocialProof = () => {
  return (
    <section className="border-t border-white/5 bg-[#080b0f] py-12">
      <div className="nh-container">
        <div className="text-center mb-12">
          <div className="nh-section-label justify-center mb-4">Community</div>
          <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
            Creators Using Neuraldrift
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="nh-glass-card rounded-3xl p-10 relative group">
              <Quote className="absolute top-6 right-6 text-white/5 group-hover:text-accent-cyan/10 transition-colors" size={60} />
              <div className="relative z-10">
                <p className="text-lg text-zinc-300 font-[500] leading-relaxed mb-8 italic">
                  &quot;{t.content}&quot;
                </p>
                <div>
                  <div className="text-white font-[800] text-sm uppercase tracking-widest font-mono">
                    {t.author}
                  </div>
                  <div className="text-zinc-500 text-xs font-mono font-[500] mt-1">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
