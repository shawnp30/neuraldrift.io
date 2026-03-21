"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function Hero() {
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
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center text-center px-10 pt-24 pb-20 overflow-hidden bg-grid">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.07)_0%,rgba(124,58,237,0.05)_50%,transparent_70%)] pointer-events-none" />

      {/* Badge */}
      <div className="reveal inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 font-mono text-xs text-accent tracking-widest mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
        The AI Workflow Operating System
      </div>

      {/* Headline */}
      <h1 className="reveal font-syne font-black text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.04em] mb-6 max-w-5xl">
        Build AI workflows
        <br />
        <span className="gradient-text">without the guesswork.</span>
      </h1>

      <p className="reveal text-xl text-muted max-w-2xl leading-relaxed font-light mb-4">
        NeuralHub is where AI creators build ComfyUI pipelines, train custom LoRA models, curate datasets, and optimize everything for their specific hardware — all in one place.
      </p>
      <p className="reveal font-mono text-sm text-muted/60 max-w-xl mb-10">
        Not a cloud service. Not a subscription. A complete local AI production system — workflows export as ready-to-run ComfyUI JSON for your GPU.
      </p>

      {/* CTAs */}
      <div className="reveal flex gap-4 justify-center flex-wrap mb-16">
        <Link href="/optimizer" className="bg-accent text-black px-8 py-3.5 rounded font-semibold text-sm glow-cyan transition-transform hover:-translate-y-0.5">
          Score My Hardware Free →
        </Link>
        <Link href="/workflows" className="border border-border text-text px-8 py-3.5 rounded text-sm font-mono tracking-wider hover:border-accent hover:text-accent transition-colors">
          Browse Workflows
        </Link>
        <Link href="/guides" className="border border-border text-text px-8 py-3.5 rounded text-sm font-mono tracking-wider hover:border-accent hover:text-accent transition-colors">
          Read Guides
        </Link>
      </div>

      {/* What's inside strip */}
      <div className="reveal w-full max-w-5xl grid grid-cols-6 gap-0 bg-card border border-border rounded-2xl overflow-hidden">
        {[
          { icon: "⚙️", label: "Workflows", count: "6", sub: "ComfyUI pipelines" },
          { icon: "📖", label: "Guides", count: "6", sub: "Hardware-tested" },
          { icon: "🔁", label: "LoRAs", count: "6", sub: "Custom models" },
          { icon: "🗃️", label: "Datasets", count: "6", sub: "Ready to train" },
          { icon: "⚡", label: "Optimizer", count: "Live", sub: "Your GPU scored" },
          { icon: "🔧", label: "Tools", count: "3", sub: "VRAM, captions, benchmarks" },
        ].map((item, i) => (
          <div key={item.label} className={`px-6 py-5 text-center ${i < 5 ? "border-r border-border" : ""}`}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-syne text-xl font-black text-white">{item.count}</div>
            <div className="font-syne text-xs font-bold text-white mt-0.5">{item.label}</div>
            <div className="font-mono text-xs text-muted mt-0.5 leading-tight">{item.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
