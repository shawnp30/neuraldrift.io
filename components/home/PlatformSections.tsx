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
    description: "Browse a library of production-tested ComfyUI workflows. Each one is hardware-aware — pick your GPU tier, tune the parameters, and download a JSON that loads directly into ComfyUI and generates immediately. No missing nodes, no manual config, no guessing at settings.",
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
    description: "The core engine. Select your GPU and every workflow gets a 0-100 compatibility score based on VRAM fit, RAM, task suitability, and stability headroom. Click Optimize and get the exact settings adjusted for your machine. Click Fix for My PC and get a specific list of what to change — never a generic error.",
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
    description: "Every guide is written by someone running the same hardware as you — RTX 5080, RTX 3080, GTX 1660 Ti. No theoretical explanations. Every guide includes tested configs, working Kohya TOML files, exact ComfyUI settings, and benchmarks from real training runs. If it didn't work on real consumer hardware, it's not published.",
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
    icon: "🔁",
    label: "LoRA Library",
    href: "/loras",
    title: "Custom-trained models with full training specs",
    description: "Every LoRA in the library was trained from scratch on real hardware. Character LoRAs, style LoRAs, concept LoRAs — each one includes the trigger word, recommended strength range, training dataset size, epoch count, hardware used, and an example prompt. Download the .safetensors file and start using it immediately.",
    features: [
      "Character LoRAs: Fat Bigfoot, Slacker Alien — SDXL",
      "Style LoRAs: Highway Ghost, Desert Pursuit — FLUX cinematic",
      "Full training specs for every model — not just the download",
      "Filter by type, base model, status (Released / Beta / WIP)",
    ],
    color: "text-[#a78bfa]",
    bg: "bg-[rgba(124,58,237,0.04)]",
    border: "border-[#a78bfa]/20",
    tag: "6 Models",
  },
  {
    number: "05",
    icon: "🗃️",
    label: "Datasets",
    href: "/datasets",
    title: "Curated training datasets, ready to use",
    description: "The datasets that were used to train the LoRAs in this library. Each one is curated, WD14 or natural-language captioned, trigger-word-prefixed, and structured for Kohya SS. Download the ZIP, point Kohya at it, and train — without spending hours curating your own data from scratch.",
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
    description: "Three standalone tools built for working AI creators. The VRAM Calculator estimates memory requirements before you start. The Caption Generator formats training captions in WD14, Natural Language, FLUX Optimized, or Training Dataset format. The GPU Benchmark Lookup gives you real inference numbers across consumer cards — your rigs highlighted.",
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
      (e) => e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.05 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="mb-16">
        <p className="reveal font-mono text-xs text-accent tracking-widest uppercase mb-4">// Platform Overview</p>
        <h2 className="reveal font-syne text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight mb-4 leading-tight">
          Six tools. One platform.<br />Every layer of the AI stack.
        </h2>
        <p className="reveal text-muted max-w-2xl leading-relaxed">
          From the first time you open ComfyUI to training custom models to optimizing for your specific hardware — everything you need is here, connected, and built to work together.
        </p>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((s, i) => (
          <div key={s.number} className={`reveal bg-card border rounded-2xl overflow-hidden ${s.border} hover:shadow-lg transition-all duration-300`}
            style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="grid grid-cols-[80px_1fr_320px] items-stretch">

              {/* Number */}
              <div className={`${s.bg} flex items-center justify-center border-r ${s.border}`}>
                <div className="text-center">
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className={`font-syne text-sm font-black ${s.color}`}>{s.number}</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${s.bg} ${s.color} border ${s.border}`}>
                    {s.label}
                  </span>
                  <span className="font-mono text-xs text-muted">{s.tag}</span>
                </div>
                <h3 className="font-syne text-xl font-black text-white mb-3 tracking-tight">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.description}</p>
              </div>

              {/* Features + CTA */}
              <div className={`${s.bg} border-l ${s.border} p-6 flex flex-col justify-between`}>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 font-mono text-xs text-muted leading-relaxed">
                      <span className={`${s.color} flex-shrink-0 mt-0.5`}>→</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={s.href}
                  className={`block text-center font-mono text-xs tracking-widest uppercase border px-4 py-2.5 rounded transition-colors ${s.color} ${s.border} hover:opacity-80`}>
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
