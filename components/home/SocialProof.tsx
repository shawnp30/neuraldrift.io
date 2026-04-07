"use client";

import React from "react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    content:
      "Neuraldrift solved my VRAM bottleneck issues. The step-by-step guides for FLUX training are the most accurate I've found.",
    author: "Technical Creator @ AI_Labs",
    role: "Local AI Researcher",
  },
  {
    content:
      "The pre-built ComfyUI workflows are a lifesaver. No more 'Disconnected Node' errors or hunting for missing custom nodes.",
    author: "Visual Designer",
    role: "Workflow Architect",
  },
  {
    content:
      "Clean, technical, and zero fluff. If you're serious about running models locally, this is the first place you should check.",
    author: "Software Engineer",
    role: "Independent Dev",
  },
];

export const SocialProof = () => {
  return (
    <section className="border-t border-white/5 bg-transparent py-12">
      <div className="nh-container">
        <div className="mb-12 text-center">
          <div className="nh-section-label mb-4 justify-center">Community</div>
          <h2 className="font-syne text-4xl font-[800] tracking-tight text-white md:text-5xl">
            Creators Using Neuraldrift
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="nh-glass-card group relative rounded-3xl p-10"
            >
              <Quote
                className="group-hover:text-accent-cyan/10 absolute right-6 top-6 text-white/5 transition-colors"
                size={60}
              />
              <div className="relative z-10">
                <p className="mb-8 text-lg font-[500] italic leading-relaxed text-zinc-300">
                  &quot;{t.content}&quot;
                </p>
                <div>
                  <div className="font-mono text-sm font-[800] uppercase tracking-widest text-white">
                    {t.author}
                  </div>
                  <div className="mt-1 font-mono text-xs font-[500] text-zinc-400">
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
