"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function ToolsPreview() {
  const ref = useRef<HTMLElement>(null);
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
      <div className="reveal mb-12">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Tools</p>
        <h2 className="font-syne text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight mb-3">
          Utilities for every stage<br />of the pipeline.
        </h2>
        <p className="text-muted max-w-xl leading-relaxed">
          Standalone tools built for AI creators. No login required, no limits.
        </p>
      </div>

      <div className="reveal grid grid-cols-3 gap-6">
        {[
          {
            href: "/tools/vram-calculator",
            icon: "🖥️",
            title: "VRAM Calculator",
            desc: "Estimate exactly how much VRAM your setup needs before you start.",
            features: ["Select model, resolution, batch size, LoRA count", "Real-time estimate with a visual bar", "GPU compatibility table — green / yellow / red", "Recommended hardware build for your requirements"],
            color: "border-[#00e5ff]/20",
            accent: "text-[#00e5ff]",
          },
          {
            href: "/tools/caption-generator",
            icon: "💬",
            title: "Caption Generator",
            desc: "Generate training-ready captions in the right format for your model.",
            features: ["4 styles: WD14, Natural Language, FLUX Optimized, Training Dataset", "Single or batch mode — separate descriptions with blank lines", "Trigger word support — prepended to every caption", "Quick templates for character, style, and environment"],
            color: "border-[#a78bfa]/20",
            accent: "text-[#a78bfa]",
          },
          {
            href: "/tools/benchmark-lookup",
            icon: "⚡",
            title: "GPU Benchmark Lookup",
            desc: "Real inference and training benchmarks across consumer GPUs.",
            features: ["FLUX Dev FP8, SDXL, LTX Video 2.3, FLUX LoRA Training", "Filter by model, GPU, category", "Sort by speed, VRAM, or GPU name", "Your rigs highlighted across all benchmark rows"],
            color: "border-[#10b981]/20",
            accent: "text-[#10b981]",
          },
        ].map(t => (
          <Link key={t.href} href={t.href}
            className={`bg-card border ${t.color} rounded-2xl p-8 block hover:-translate-y-1 transition-all duration-200 group`}>
            <span className="text-4xl block mb-5">{t.icon}</span>
            <h3 className={`font-syne text-lg font-bold text-white mb-2 group-hover:${t.accent} transition-colors`}>{t.title}</h3>
            <p className="text-sm text-muted leading-relaxed mb-5">{t.desc}</p>
            <ul className="space-y-2">
              {t.features.map(f => (
                <li key={f} className="flex items-start gap-2 font-mono text-xs text-muted">
                  <span className={`${t.accent} flex-shrink-0 mt-0.5`}>→</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className={`mt-6 pt-5 border-t border-border font-mono text-xs ${t.accent} tracking-widest uppercase`}>
              Open Tool →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
