"use client";
import { useEffect, useRef } from "react";

export function WhatIsNeuralHub() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="reveal grid grid-cols-2 gap-20 items-center">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// What is NeuralHub?</p>
          <h2 className="font-syne text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight mb-6 leading-tight">
            The place you go<br />before opening ComfyUI.
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            Most AI creators waste hours figuring out which model to use, what settings to dial in, which custom nodes to install, and why their GPU keeps running out of memory. NeuralHub eliminates all of that.
          </p>
          <p className="text-muted leading-relaxed mb-5">
            We built a system that knows your hardware. You tell us your GPU — we score every workflow against it, recommend the right settings, and export a ready-to-run ComfyUI JSON that loads and generates without any manual configuration.
          </p>
          <p className="text-muted leading-relaxed">
            On top of that: hardware-tested guides written by someone running the same RTX hardware as you, a curated library of custom LoRA models with training specs, and tools for every step of the AI production pipeline.
          </p>
        </div>

        {/* Problem/Solution cards */}
        <div className="space-y-3">
          {[
            {
              problem: "Which workflow settings work on my GPU?",
              solution: "Optimizer scores every workflow against your GPU — automatically.",
              icon: "🖥️",
            },
            {
              problem: "Why does my ComfyUI keep crashing?",
              solution: "Fix-for-My-PC gives exact settings changes to stop OOM errors.",
              icon: "🔧",
            },
            {
              problem: "How do I train a LoRA without wasting 6 hours?",
              solution: "Step-by-step guides tested on real consumer GPUs with exact configs.",
              icon: "📖",
            },
            {
              problem: "Where do I get good training datasets?",
              solution: "Download curated, captioned, trigger-word-ready datasets directly.",
              icon: "🗃️",
            },
            {
              problem: "What hardware do I need to run this model?",
              solution: "VRAM Calculator gives exact memory requirements before you start.",
              icon: "⚡",
            },
          ].map((item) => (
            <div key={item.problem} className="bg-card border border-border rounded-xl p-5 grid grid-cols-[32px_1fr] gap-4">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <p className="font-mono text-xs text-[#ef4444]/70 mb-1 leading-relaxed">✗ {item.problem}</p>
                <p className="font-mono text-xs text-[#10b981] leading-relaxed">✓ {item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
