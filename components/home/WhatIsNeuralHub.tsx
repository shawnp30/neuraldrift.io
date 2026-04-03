"use client";
import { useEffect, useRef } from "react";

export function WhatIsneuraldrift() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) =>
        e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-10 py-24">
      <div className="reveal grid grid-cols-2 items-center gap-20">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            {"// What is neuraldrift?"}
          </p>
          <h2 className="mb-6 font-syne text-[clamp(2rem,3.5vw,3rem)] font-black leading-tight tracking-tight">
            The place you go
            <br />
            before opening ComfyUI.
          </h2>
          <p className="mb-5 leading-relaxed text-muted">
            Most AI creators waste hours figuring out which model to use, what
            settings to dial in, which custom nodes to install, and why their
            GPU keeps running out of memory. neuraldrift eliminates all of that.
          </p>
          <p className="mb-5 leading-relaxed text-muted">
            We built a system that knows your hardware. You tell us your GPU —
            we score every workflow against it, recommend the right settings,
            and export a ready-to-run ComfyUI JSON that loads and generates
            without any manual configuration.
          </p>
          <p className="leading-relaxed text-muted">
            On top of that: hardware-tested guides written by someone running
            the same RTX hardware as you, a curated library of custom LoRA
            models with training specs, and tools for every step of the AI
            production pipeline.
          </p>
        </div>

        {/* Problem/Solution cards */}
        <div className="space-y-3">
          {[
            {
              problem: "Which workflow settings work on my GPU?",
              solution:
                "Optimizer scores every workflow against your GPU — automatically.",
              icon: "🖥️",
            },
            {
              problem: "Why does my ComfyUI keep crashing?",
              solution:
                "Fix-for-My-PC gives exact settings changes to stop OOM errors.",
              icon: "🔧",
            },
            {
              problem: "How do I train a LoRA without wasting 6 hours?",
              solution:
                "Step-by-step guides tested on real consumer GPUs with exact configs.",
              icon: "📖",
            },
            {
              problem: "Where do I get good training datasets?",
              solution:
                "Download curated, captioned, trigger-word-ready datasets directly.",
              icon: "🗃️",
            },
            {
              problem: "What hardware do I need to run this model?",
              solution:
                "VRAM Calculator gives exact memory requirements before you start.",
              icon: "⚡",
            },
          ].map((item) => (
            <div
              key={item.problem}
              className="grid grid-cols-[32px_1fr] gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="mt-0.5 text-xl">{item.icon}</span>
              <div>
                <p className="mb-1 font-mono text-xs leading-relaxed text-[#ef4444]/70">
                  ✗ {item.problem}
                </p>
                <p className="font-mono text-xs leading-relaxed text-[#10b981]">
                  ✓ {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
