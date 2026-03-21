"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

const STATS = [
  { value: "6", label: "Workflows" },
  { value: "6", label: "LoRA Models" },
  { value: "RTX 5080", label: "Tested On" },
  { value: "16GB", label: "Optimized For" },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center text-center px-10 pt-24 pb-20 overflow-hidden bg-grid">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.08)_0%,rgba(124,58,237,0.06)_50%,transparent_70%)] pointer-events-none" />

      {/* Badge */}
      <div className="reveal inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 font-mono text-xs text-accent tracking-widest mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
        v2.3 · LTX Video · FLUX · SD3.5 Supported
      </div>

      {/* Heading */}
      <h1 className="reveal font-syne font-black text-[clamp(3rem,7vw,6rem)] leading-[0.95] tracking-[-0.04em] mb-3">
        Train. Build.
        <br />
        <span className="gradient-text">Master AI.</span>
      </h1>

      <p className="reveal text-lg text-muted max-w-xl leading-relaxed font-light mt-6 mb-10">
        The hub for building, training, and deploying AI systems. LoRA creation, ComfyUI pipelines, datasets, and optimization — all in one place.
      </p>

      <div className="reveal flex gap-4 justify-center">
        <Link href="/dashboard" className="bg-accent text-black px-8 py-3.5 rounded font-semibold text-sm glow-cyan transition-transform hover:-translate-y-0.5">
          Start Building →
        </Link>
        <Link href="/guides" className="border border-border text-text px-8 py-3.5 rounded text-sm font-mono tracking-wider hover:border-accent hover:text-accent transition-colors">
          Browse Guides
        </Link>
      </div>

      {/* Stats */}
      <div className="reveal flex justify-center gap-16 mt-20 pt-12 border-t border-border w-full max-w-3xl">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-syne text-3xl font-black text-white tracking-tight">{s.value}</div>
            <div className="font-mono text-xs text-muted tracking-widest uppercase mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
