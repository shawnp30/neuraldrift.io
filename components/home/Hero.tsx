"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function Hero() {
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
    <section
      ref={ref}
      className="bg-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-10 pb-20 pt-24 text-center"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(0,229,255,0.07)_0%,rgba(124,58,237,0.05)_50%,transparent_70%)]" />

      {/* Badge */}
      <div className="reveal bg-accent/8 mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 px-4 py-1.5 font-mono text-xs tracking-widest text-accent">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
        The AI Workflow Operating System
      </div>

      {/* Headline */}
      <h1 className="reveal mb-6 max-w-5xl font-syne text-[clamp(3rem,7vw,6.5rem)] font-black leading-[0.9] tracking-[-0.04em]">
        Build AI workflows
        <br />
        <span className="gradient-text">without the guesswork.</span>
      </h1>

      <p className="reveal mb-4 max-w-2xl text-xl font-light leading-relaxed text-muted">
        neuraldrift is where AI creators build ComfyUI pipelines, train custom
        LoRA models, curate datasets, and optimize everything for their specific
        hardware — all in one place.
      </p>
      <p className="reveal mb-10 max-w-xl font-mono text-sm text-muted/60">
        Not a cloud service. Not a subscription. A complete local AI production
        system — workflows export as ready-to-run ComfyUI JSON for your GPU.
      </p>

      {/* CTAs */}
      <div className="reveal mb-16 flex flex-wrap justify-center gap-4">
        <Link
          href="/optimizer"
          className="glow-cyan rounded bg-accent px-8 py-3.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          Score My Hardware Free →
        </Link>
        <Link
          href="/workflows"
          className="text-text rounded border border-border px-8 py-3.5 font-mono text-sm tracking-wider transition-colors hover:border-accent hover:text-accent"
        >
          Browse Workflows
        </Link>
        <Link
          href="/guides"
          className="text-text rounded border border-border px-8 py-3.5 font-mono text-sm tracking-wider transition-colors hover:border-accent hover:text-accent"
        >
          Read Guides
        </Link>
      </div>

      {/* What's inside strip */}
      <div className="reveal grid w-full max-w-5xl grid-cols-6 gap-0 overflow-hidden rounded-2xl border border-border bg-card">
        {[
          {
            icon: "⚙️",
            label: "Workflows",
            count: "6",
            sub: "ComfyUI pipelines",
          },
          { icon: "📖", label: "Guides", count: "6", sub: "Hardware-tested" },
          { icon: "🔁", label: "LoRAs", count: "6", sub: "Custom models" },
          { icon: "🗃️", label: "Datasets", count: "6", sub: "Ready to train" },
          {
            icon: "⚡",
            label: "Optimizer",
            count: "Live",
            sub: "Your GPU scored",
          },
          {
            icon: "🔧",
            label: "Tools",
            count: "3",
            sub: "VRAM, captions, benchmarks",
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className={`px-6 py-5 text-center ${i < 5 ? "border-r border-border" : ""}`}
          >
            <div className="mb-2 text-2xl">{item.icon}</div>
            <div className="font-syne text-xl font-black text-white">
              {item.count}
            </div>
            <div className="mt-0.5 font-syne text-xs font-bold text-white">
              {item.label}
            </div>
            <div className="mt-0.5 font-mono text-xs leading-tight text-muted">
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
