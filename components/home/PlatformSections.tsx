"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const SECTIONS = [
  {
    number: "01",
    icon: "⚙️",
    label: "Workflows",
    href: "/workflows",
    title: "Configure & export AI pipelines",
    description:
      "Browse a library of production-tested ComfyUI workflows. Each one is hardware-aware — pick your GPU tier, tune the parameters, and download a JSON that loads directly into ComfyUI and generates immediately. No missing nodes, no manual config, no guessing at settings.",
    features: [
      "4 hardware profiles per workflow (8GB / 12GB / 16GB / 24GB)",
      "Parameters configurable before export: prompt, LoRA, steps, resolution",
      "Requirements panel — exact models, nodes, and folder paths",
      "Live compatibility score from the optimizer engine",
    ],
    color: "text-[#00e5ff]",
    bg: "bg-[rgba(0,229,255,0.04)]",
    border: "border-[#00e5ff]/20",
    tag: "6 Workflows",
  },
  {
    number: "02",
    icon: "⚡",
    label: "Optimizer",
    href: "/optimizer",
    title: "Your GPU scored against every workflow",
    description:
      "The core engine. Select your GPU and every workflow gets a 0-100 compatibility score based on VRAM fit, RAM, task suitability, and stability headroom. Click Optimize and get the exact settings adjusted for your machine. Click Fix for My PC and get a specific list of what to change — never a generic error.",
    features: [
      "100-point scoring across 7 dimensions — VRAM, RAM, GPU tier, task match",
      "3 priority modes: Quality, Speed, Reliability",
      "Fix-for-My-PC engine — always returns a path forward",
      "Upgrade path with specific GPU recommendations",
    ],
    color: "text-accent",
    bg: "bg-[rgba(0,229,255,0.04)]",
    border: "border-accent/20",
    tag: "Live Engine",
  },
  {
    number: "03",
    icon: "📖",
    label: "Guides",
    href: "/guides",
    title: "Hardware-tested, code-first documentation",
    description:
      "Every guide is written by someone running the same hardware as you — RTX 5080, RTX 3080, GTX 1660 Ti. No theoretical explanations. Every guide includes tested configs, working Kohya TOML files, exact ComfyUI settings, and benchmarks from real training runs. If it didn't work on real consumer hardware, it's not published.",
    features: [
      "Beginner to Advanced — ComfyUI setup, LoRA training, video generation",
      "Code blocks with copy-paste ready configs",
      "Callout boxes: Pro Tips, Warnings, common failure modes",
      "Sidebar workflow CTA — open the related configurator directly",
    ],
    color: "text-[#a3e635]",
    bg: "bg-[rgba(163,230,53,0.04)]",
    border: "border-[#a3e635]/20",
    tag: "6 Guides",
  },
  {
    number: "04",
    icon: "🧠",
    label: "Model Hub",
    href: "/models",
    title: "Advanced neural architectures & adapters",
    description:
      "A massive library of trending models directly from the Hugging Face ecosystem. From state-of-the-art vision models to LLMs and high-fidelity LoRA adapters, each one includes precision metadata, deployment guides, and one-click integration with our workflow engine.",
    features: [
      "Trending models synced live from Hugging Face Hub",
      "Character, Style, and Concept adapters for FLUX/SDXL",
      "Full deployment specs and hardware requirements",
      "One-click Copy ID for seamless workflow integration",
    ],
    color: "text-[#a78bfa]",
    bg: "bg-[rgba(124,58,237,0.04)]",
    border: "border-[#a78bfa]/20",
    tag: "300+ Models",
  },
  {
    number: "05",
    icon: "🗃️",
    label: "Datasets",
    href: "/datasets",
    title: "Curated training datasets, ready to use",
    description:
      "The datasets that were used to train the LoRAs in this library. Each one is curated, WD14 or natural-language captioned, trigger-word-prefixed, and structured for Kohya SS. Download the ZIP, point Kohya at it, and train — without spending hours curating your own data from scratch.",
    features: [
      "Character, Style, and Concept dataset categories",
      "WD14 and Natural Language captions included",
      "Trigger word already in every caption file",
      "Training notes: repeat count, optimal epoch range, LoRA weight sweet spot",
    ],
    color: "text-[#f97316]",
    bg: "bg-[rgba(249,115,22,0.04)]",
    border: "border-[#f97316]/20",
    tag: "6 Datasets",
  },
  {
    number: "06",
    icon: "🔧",
    label: "Tools",
    href: "/tools",
    title: "Utilities for every stage of the AI stack",
    description:
      "Three standalone tools built for working AI creators. The VRAM Calculator estimates memory requirements before you start. The Caption Generator formats training captions in WD14, Natural Language, FLUX Optimized, or Training Dataset format. The GPU Benchmark Lookup gives you real inference numbers across consumer cards — your rigs highlighted.",
    features: [
      "VRAM Calculator — model + resolution + batch + LoRA = exact GB required",
      "Caption Generator — single or batch, 4 format styles, trigger word support",
      "GPU Benchmark Lookup — filter by model, GPU, sort by speed or VRAM",
      "Your GPUs highlighted across all benchmark tables",
    ],
    color: "text-[#10b981]",
    bg: "bg-[rgba(16,185,129,0.04)]",
    border: "border-[#10b981]/20",
    tag: "3 Tools",
  },
];

export function PlatformSections() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) =>
        e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.05 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-10 py-16">
      <div className="mb-16">
        <p className="reveal mb-4 font-mono text-xs uppercase tracking-widest text-accent">
          {"// Platform Overview"}
        </p>
        <h2 className="reveal mb-4 font-syne text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight tracking-tight">
          Six tools. One platform.
          <br />
          Every layer of the AI stack.
        </h2>
        <p className="reveal max-w-2xl leading-relaxed text-muted">
          From the first time you open ComfyUI to training custom models to
          optimizing for your specific hardware — everything you need is here,
          connected, and built to work together.
        </p>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((s, i) => (
          <div
            key={s.number}
            className={`reveal overflow-hidden rounded-2xl border bg-card ${s.border} transition-all duration-500 hover:shadow-[0_0_25px_var(--glow-color)] group relative`}
            style={{ transitionDelay: `${i * 60}ms`, "--glow-color": s.color.replace("text-", "").replace("[", "").replace("]", "") } as React.CSSProperties}
          >
            {/* Visual Hover Layer */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-${s.bg.replace("bg-[", "").replace("]", "")} to-transparent`} />

            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_340px] items-stretch">
              {/* Number */}
              <div
                className={`${s.bg} flex items-center justify-center border-r ${s.border}`}
              >
                <div className="text-center">
                  <div className="mb-1 text-3xl">{s.icon}</div>
                  <div className={`font-syne text-sm font-black ${s.color}`}>
                    {s.number}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${s.bg} ${s.color} border ${s.border}`}
                  >
                    {s.label}
                  </span>
                  <span className="font-mono text-xs text-muted">{s.tag}</span>
                </div>
                <h3 className="mb-3 font-syne text-xl font-black tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {s.description}
                </p>
              </div>

              {/* Features + CTA */}
              <div
                className={`${s.bg} border-l ${s.border} flex flex-col justify-between p-6`}
              >
                <ul className="mb-6 space-y-2">
                  {s.features.map((f, fi) => (
                    <li
                      key={fi}
                      className="flex items-start gap-2 font-mono text-xs leading-relaxed text-muted"
                    >
                      <span className={`${s.color} mt-0.5 flex-shrink-0`}>
                        →
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.href}
                  className={`block rounded border px-4 py-2.5 text-center font-mono text-xs uppercase tracking-widest transition-colors ${s.color} ${s.border} hover:opacity-80`}
                >
                  Open {s.label} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
