"use client";

import Link from "next/link";
import React from "react";

import { Hero } from "@/components/home/Hero";
// or use HeroSection for the GPU selector version:
import HeroSection from "@/components/home/HeroSection";
import { BrainCircuit } from "lucide-react";


const PILLARS = [
  {
    icon: "🧠",
    title: "AI Model Training",
    body: "End-to-end training guides for image, video, and language models. Hardware-tuned configs for every VRAM tier from 8GB to 32GB.",
    tag: "LoRA · Dreambooth · Kohya",
  },
  {
    icon: "🔧",
    title: "LoRA Creation",
    body: "Build style, character, and concept LoRAs from scratch. Real dataset prep, training loops, and quality evaluation included.",
    tag: "FLUX · SD3.5 · SDXL",
  },
  {
    icon: "⚡",
    title: "ComfyUI Pipelines",
    body: "Shareable node graphs for every use case — AnimateDiff, LTX Video, img2img, inpainting, and multi-model chains.",
    tag: "Version controlled · Plug & play",
  },
  {
    icon: "🗃️",
    title: "Dataset Tooling",
    body: "Curate, caption, tag, and structure training datasets at scale using WD14, BLIP2, and custom captioning pipelines.",
    tag: "Auto-captioning · Bulk processing",
  },
  {
    icon: "📦",
    title: "Scripts & Utilities",
    body: "Open-source tools for batch inference, VRAM optimization, model merging, GGUF quantization, and format conversion.",
    tag: "Python · Batch · CLI",
  },
  {
    icon: "🚀",
    title: "Optimization & Deploy",
    body: "GGUF, ONNX, TensorRT conversions. Local inference APIs and cloud deploy — serve your models at real-world scale.",
    tag: "TensorRT · Ollama · vLLM",
  },
];

const GUIDES = [
  {
    href: "/guides/comfyui-complete-setup",
    level: "Beginner",
    time: "12 min",
    title: "ComfyUI Complete Setup: RTX 5080 Edition",
    desc: "Install, configure, and benchmark your first ComfyUI workflow with optimal VRAM settings for 16GB cards.",
    tag: "// Image Gen",
  },
  {
    href: "/guides/train-flux-lora",
    level: "Intermediate",
    time: "28 min",
    title: "Train Your First FLUX LoRA in Under 6 Hours",
    desc: "Dataset prep, Kohya config, training loop, and quality evaluation from scratch. RTX 3080+ compatible.",
    tag: "// LoRA Training",
  },
  {
    href: "/guides/ltx-video-cinematic-action",
    level: "Advanced",
    time: "35 min",
    title: "LTX Video 2.3: Cinematic Action Sequences",
    desc: "Chase and action scenes with consistent motion, camera lock, and temporal coherence. Complete prompt formula included.",
    tag: "// Video Gen",
  },
  {
    href: "/guides/dataset-curation-captioning",
    level: "Beginner",
    time: "15 min",
    title: "Dataset Curation: Captioning at Scale",
    desc: "Auto-caption 1,000+ images with WD14 tagger and build clean training data in an afternoon.",
    tag: "// Datasets",
  },
  {
    href: "/guides/animatediff-character-consistency",
    level: "Intermediate",
    time: "22 min",
    title: "AnimateDiff + LoRA Character Consistency",
    desc: "Lock a character across frames using motion modules and custom LoRA injection. Includes workflow file.",
    tag: "// Animation",
  },
  {
    href: "/guides/multi-gpu-inference",
    level: "Advanced",
    time: "40 min",
    title: "Multi-GPU Inference: 3x Speed, Same VRAM",
    desc: "Route compute across RTX workstation + laptop for parallel batch inference without additional VRAM cost.",
    tag: "// Optimization",
  },
];

function levelClass(level: string) {
  if (level === "Beginner") return "nh-guide-level nh-level-beginner";
  if (level === "Intermediate") return "nh-guide-level nh-level-intermediate";
  return "nh-guide-level nh-level-advanced";
}

function GPUSelector() {
  const [gpu, setGpu] = React.useState("");
  const [goal, setGoal] = React.useState("");

  const GPU_OPTIONS = ["8GB", "12GB", "16GB", "24GB", "48GB+"];
  const GOAL_OPTIONS = [
    { value: "video", label: "AI Video" },
    { value: "image", label: "AI Images" },
    { value: "lora", label: "Train LoRA" },
    { value: "upscale", label: "Upscaling" },
  ];

  const handleGenerate = () => {
    if (!gpu || !goal) return;
    window.location.href = `/hardware?gpu=${gpu}&goal=${goal}`;
  };

  const btnBase: React.CSSProperties = {
    padding: "0.35rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.82rem",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "1.5rem",
        marginTop: "2rem",
        maxWidth: "560px",
      }}
    >
      <p
        style={{
          fontSize: "0.7rem",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "1.25rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        ⚡ Get your personalized workflow
      </p>
      <div style={{ marginBottom: "1.1rem" }}>
        <p
          style={{
            fontSize: "0.68rem",
            color: "var(--text-dim)",
            marginBottom: "0.5rem",
            letterSpacing: "0.08em",
          }}
        >
          YOUR GPU VRAM
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {GPU_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => setGpu(g)}
              style={{
                ...btnBase,
                border: `1px solid ${gpu === g ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                background: gpu === g ? "#6366f1" : "transparent",
                color: gpu === g ? "#fff" : "var(--text-dim)",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: "1.25rem" }}>
        <p
          style={{
            fontSize: "0.68rem",
            color: "var(--text-dim)",
            marginBottom: "0.5rem",
            letterSpacing: "0.08em",
          }}
        >
          WHAT DO YOU WANT TO CREATE?
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              style={{
                ...btnBase,
                border: `1px solid ${goal === g.value ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                background: goal === g.value ? "#6366f1" : "transparent",
                color: goal === g.value ? "#fff" : "var(--text-dim)",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={!gpu || !goal}
        style={{
          width: "100%",
          padding: "0.8rem",
          borderRadius: "10px",
          background: !gpu || !goal ? "rgba(99,102,241,0.25)" : "#6366f1",
          color: !gpu || !goal ? "rgba(255,255,255,0.4)" : "#fff",
          fontWeight: 600,
          fontSize: "0.9rem",
          border: "none",
          cursor: !gpu || !goal ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
      >
        Customize My Workflow →
      </button>
    </div>
  );
}


export default function HomePage() {

  return (
    <div className="nh-page">
      <div className="nh-noise" aria-hidden="true" />

      <Hero />


      {/* ── WHAT TO EXPECT ────────────────────────────────────────── */}
      <section className="py-24 relative flex flex-col items-center justify-center text-center bg-[#080b0f] border-t border-white/5">
        <div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center">
          <p className="text-cyan-400 font-[800] tracking-widest uppercase text-sm mb-12">What to Expect</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="bg-[#0f172a]/50 p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-3xl mb-4">🖥️</span>
              <h4 className="text-xl font-[800] text-white mb-2">Hardware Clarity</h4>
              <p className="text-sm font-[500] text-zinc-400 leading-relaxed">Know exactly what models your specific GPU can run, without the guesswork.</p>
            </div>
            <div className="bg-[#0f172a]/50 p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-3xl mb-4">🧠</span>
              <h4 className="text-xl font-[800] text-white mb-2">Workflow Mastery</h4>
              <p className="text-sm font-[500] text-zinc-400 leading-relaxed">Download pre-built architectures and learn exactly how KSamplers and Nodes connect.</p>
            </div>
            <div className="bg-[#0f172a]/50 p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <span className="text-3xl mb-4">☁️</span>
              <h4 className="text-xl font-[800] text-white mb-2">Cloud Generation</h4>
              <p className="text-sm font-[500] text-zinc-400 leading-relaxed">Extensive prompting guides for Sora, Veo 3, Midjourney, and Runway.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE MISSION ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative flex flex-col items-center justify-center text-center border-t border-white/5">
        <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <p className="text-indigo-400 font-[800] tracking-widest uppercase text-sm mb-6">Our Mission</p>
          <h2 className="text-4xl md:text-5xl font-[800] text-white leading-tight mb-8 text-center mx-auto">
            ComfyUI is powerful, but chaotic. <br className="hidden md:block"/>
            <span className="text-zinc-500">We make it accessible.</span>
          </h2>
          <p className="text-lg md:text-xl font-[500] text-zinc-400 leading-relaxed max-w-2xl mx-auto text-center">
            Neuraldrift is dedicated to teaching you exactly how to structure your generative AI nodes. From understanding what Samplers do to picking the right GPU to run FLUX, we guide you from complete beginner to workflow architect.
          </p>
        </div>
      </section>

      {/* ── DIRECTIONAL FUNNELS ────────────────────────────────── */}
      <section className="py-12 pb-32 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 place-content-center place-items-center">
          
          {/* Funnel 1: Learning */}
          <Link href="/tutorials" className="group flex flex-col items-center text-center p-10 rounded-3xl bg-[#0f172a]/30 border border-indigo-500/10 hover:border-indigo-500/40 hover:bg-[#0f172a]/60 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-2xl font-[800] text-white mb-4 group-hover:text-indigo-300 transition-colors">Start Learning</h3>
            <p className="text-zinc-400 font-[500] leading-relaxed mb-8 flex-1">
              Dive into our comprehensive Masterclasses and written guides. Learn definition of terms, node setups, and advanced tricks.
            </p>
            <span className="text-sm font-[700] tracking-widest uppercase text-indigo-400 flex items-center gap-2 group-hover:gap-4 transition-all">
              Go to Tutorials <span>→</span>
            </span>
          </Link>

          {/* Funnel 2: Hardware */}
          <Link href="/hardware" className="group flex flex-col items-center text-center p-10 rounded-3xl bg-[#0f172a]/30 border border-indigo-500/10 hover:border-indigo-500/40 hover:bg-[#0f172a]/60 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-2xl font-[800] text-white mb-4 group-hover:text-cyan-300 transition-colors">Check Your Setup</h3>
            <p className="text-zinc-400 font-[500] leading-relaxed mb-8 flex-1">
              Not sure what your GPU can handle? Rate your setup and see exactly what models (SD1.5, SDXL, FLUX) you can run comfortably.
            </p>
            <span className="text-sm font-[700] tracking-widest uppercase text-cyan-400 flex items-center gap-2 group-hover:gap-4 transition-all">
              Rate My Setup <span>→</span>
            </span>
          </Link>

          {/* Funnel 3: Workflows */}
          <Link href="/workflows" className="group flex flex-col items-center text-center p-10 rounded-3xl bg-[#0f172a]/30 border border-indigo-500/10 hover:border-indigo-500/40 hover:bg-[#0f172a]/60 transition-all duration-500 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-2xl font-[800] text-white mb-4 group-hover:text-violet-300 transition-colors">Browse Workflows</h3>
            <p className="text-zinc-400 font-[500] leading-relaxed mb-8 flex-1">
              Skip the setup. Download pre-built, hardware-tested `.json` workflows for image generation, upscaling, and LTX Video.
            </p>
            <span className="text-sm font-[700] tracking-widest uppercase text-violet-400 flex items-center gap-2 group-hover:gap-4 transition-all">
              Get Workflows <span>→</span>
            </span>
          </Link>

        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────── */}
      <section className="nh-section" id="newsletter">
        <div className="nh-container">
          <div className="nh-newsletter-box">
            <div
              className="nh-section-label"
              style={{ justifyContent: "center" }}
            >
              Weekly Drop
            </div>
            <h2 className="nh-h2">Stay ahead of the workflow curve.</h2>
            <p>
              New guides, LoRA releases, ComfyUI workflow drops, and hardware
              benchmarks — every week. Real signal, no noise. Unsubscribe
              anytime.
            </p>
            <div className="nh-nl-form">
              <input
                className="nh-nl-input"
                type="email"
                placeholder="your@email.com"
              />
              <button className="nh-nl-btn" type="button">
                Get Weekly Drops
              </button>
            </div>
            <div className="nh-nl-proof">
              <span>2,400+ builders subscribed</span>
              <span className="nh-nl-dot" />
              <span>Weekly cadence</span>
              <span className="nh-nl-dot" />
              <span>Zero ads</span>
              <span className="nh-nl-dot" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="nh-footer">
        <div className="nh-container">
          <div className="nh-footer-inner">
            <div>
              <Link className="nh-logo flex items-center gap-2" href="/">
                <BrainCircuit size={24} className="text-indigo-400" />
                <span>neural<span className="text-indigo-400">drift</span></span>
              </Link>
              <p>
                Hardware-tuned AI workflow guides for builders running local
                inference. ComfyUI, LoRA training, LTX Video — from RTX 3080 to
                5090.
              </p>
              <div className="nh-footer-socials">
                {["YouTube", "GitHub", "Twitter/X", "Discord"].map((s) => (
                  <a key={s} href="#">
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div className="nh-footer-col">
              <h4>Learn</h4>
              <Link href="/tutorials">Tutorials & Guides</Link>
              <Link href="/tutorials">AI Glossary</Link>
            </div>
            <div className="nh-footer-col">
              <h4>Downloads</h4>
              <Link href="/workflows">ComfyUI Workflows</Link>
              <Link href="/loras">LoRA Models</Link>
            </div>
            <div className="nh-footer-col">
              <h4>Tools & Meta</h4>
              <Link href="/hardware">Setup Rater</Link>
              <Link href="/proofs">Workflow Proofs</Link>
              <Link href="/hardware">Hardware Optimizer</Link>
              <a href="https://computeatlas.ai">ComputeAtlas.ai ↗</a>
            </div>
          </div>
          <div className="nh-footer-bottom">
            <span>© 2026 neuraldrift — Built in Virginia, USA</span>
            <div className="nh-footer-status">
              <span className="nh-status-dot" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
