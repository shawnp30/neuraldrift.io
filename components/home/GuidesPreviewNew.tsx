"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const GUIDES = [
  { slug: "comfyui-complete-setup", difficulty: "Beginner", title: "ComfyUI Complete Setup: RTX 5080 Edition", desc: "Install, configure, and benchmark your first ComfyUI workflow. From zero to generating in under 30 minutes.", time: "12 min", tag: "Image Gen", color: "text-[#a3e635]", bg: "bg-[rgba(163,230,53,0.1)]" },
  { slug: "train-flux-lora", difficulty: "Intermediate", title: "Train Your First FLUX LoRA in Under 6 Hours", desc: "Dataset prep, Kohya config, training loop, and quality evaluation. Exact settings for RTX 5080 and 3080.", time: "28 min", tag: "LoRA Training", color: "text-[#f97316]", bg: "bg-[rgba(249,115,22,0.1)]" },
  { slug: "ltx-video-cinematic-action", difficulty: "Advanced", title: "LTX Video 2.3: Cinematic Action Sequences", desc: "Build chase and action scenes with consistent motion, camera lock, and temporal coherence between clips.", time: "35 min", tag: "Video Gen", color: "text-[#a78bfa]", bg: "bg-[rgba(124,58,237,0.1)]" },
];

export function GuidesPreviewNew() {
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
      <div className="reveal flex items-end justify-between mb-12">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Guides</p>
          <h2 className="font-syne text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight mb-3">
            Written by someone on<br />the same hardware as you.
          </h2>
          <p className="text-muted max-w-xl leading-relaxed">
            Every guide is tested on RTX 5080, RTX 3080, and GTX 1660 Ti. Exact settings, working code, real benchmarks — no filler.
          </p>
        </div>
        <Link href="/guides" className="flex-shrink-0 font-mono text-xs text-accent border border-accent/20 px-5 py-2.5 rounded hover:bg-accent/8 transition-colors tracking-widest uppercase">
          All Guides →
        </Link>
      </div>

      <div className="reveal grid grid-cols-3 gap-5 mb-10">
        {GUIDES.map(g => (
          <Link key={g.slug} href={`/guides/${g.slug}`}
            className="bg-card border border-border rounded-xl p-7 block hover:-translate-y-1 hover:border-accent/30 transition-all duration-200 group">
            <span className={`inline-block font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase mb-4 ${g.bg} ${g.color}`}>{g.difficulty}</span>
            <h4 className="font-syne text-sm font-bold text-white mb-2 leading-snug group-hover:text-accent transition-colors">{g.title}</h4>
            <p className="text-xs text-muted leading-relaxed mb-5">{g.desc}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border font-mono text-xs text-muted">
              <span>⏱ {g.time}</span><span>·</span><span>{g.tag}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* What makes guides different */}
      <div className="reveal grid grid-cols-4 gap-4">
        {[
          { icon: "🖥️", label: "Real hardware tested", detail: "RTX 5080, 3080, 1660 Ti — every guide runs on consumer GPUs" },
          { icon: "📋", label: "Copy-paste configs", detail: "Kohya TOML, ComfyUI JSON, bash scripts — all included" },
          { icon: "⚠️", label: "Failure modes documented", detail: "Common errors, why they happen, and the exact fix" },
          { icon: "🔗", label: "Linked to workflows", detail: "Every guide links directly to the related workflow configurator" },
        ].map(f => (
          <div key={f.label} className="bg-card border border-border rounded-xl p-5">
            <span className="text-2xl block mb-3">{f.icon}</span>
            <div className="font-syne text-sm font-bold text-white mb-1">{f.label}</div>
            <div className="font-mono text-xs text-muted leading-relaxed">{f.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
