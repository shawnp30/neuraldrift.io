"use client";

import Link from "next/link";
import React from "react";
import "./home.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const TICKER = [
  { icon: "⚡", label: "RTX 5080", desc: "Primary test rig" },
  { icon: "🔧", label: "ComfyUI", desc: "Workflow engine" },
  { icon: "🎬", label: "LTX Video 2.3", desc: "Cinematic generation" },
  { icon: "🧠", label: "FLUX Dev/Schnell", desc: "Image models" },
  { icon: "📦", label: "6 LoRA Models", desc: "Ready to download" },
  { icon: "⚙️", label: "50 ComfyUI Workflows", desc: "Plug & play" },
  { icon: "📧", label: "15+ Subscribers", desc: "Weekly drops" },
  { icon: "🎯", label: "0 Ads", desc: "Just signal" },
];

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
    window.location.href = `/optimizer/result?gpu=${gpu}&goal=${goal}`;
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
  const tickerItems = [...TICKER, ...TICKER];

  return (
    <div className="nh-page">
      <div className="nh-noise" aria-hidden="true" />

      <Navbar />
      <Hero />

      <div className="nh-ticker-bar" aria-hidden="true">
        <div className="nh-ticker-track">
          {tickerItems.map((item, i) => (
            <span key={i} className="nh-ticker-item">
              <span className="nh-ticker-icon">{item.icon}</span>
              <strong>{item.label}</strong> — {item.desc}
            </span>
          ))}
        </div>
      </div>

      <section className="nh-section" id="guides">
        <div className="nh-container">
          <div className="nh-section-label">Focus Areas</div>
          <h2 className="nh-h2">Everything from dataset to deploy.</h2>
          <p className="nh-section-sub">
            — guides, code, configs, and hardware benchmarks. No surface-level
            tutorials.
          </p>
          <div className="nh-pillars">
            {PILLARS.map((p) => (
              <div key={p.title} className="nh-pillar">
                <div className="nh-pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className="nh-pillar-tag">{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: "5rem" }}>
        <div className="nh-container">
          <div className="nh-section-label">Real Code, Every Guide</div>
          <h2 className="nh-h2">Not theory. Working scripts.</h2>
          <p className="nh-section-sub">
            Every article comes with tested configs and benchmarks on actual
            consumer GPUs — the exact same hardware you&apos;re running.
          </p>
          <div className="nh-code-box">
            <div className="nh-code-topbar">
              <div className="nh-code-dots">
                <div
                  className="nh-code-dot"
                  style={{ background: "#ef4444" }}
                />
                <div
                  className="nh-code-dot"
                  style={{ background: "#f59e0b" }}
                />
                <div
                  className="nh-code-dot"
                  style={{ background: "#22c55e" }}
                />
              </div>
              <span className="nh-code-filename">
                lora_train.py — neuraldrift Guide #047
              </span>
              <span className="nh-code-badge">✓ RTX 5080 Verified</span>
            </div>
            <div className="nh-code-body">
              <span className="nh-cmt">
                # LoRA Training Config — RTX 5080 Optimized (16GB VRAM)
              </span>
              <br />
              <span className="nh-cmt">
                # Full guide: neuraldrift/guides/train-flux-lora
              </span>
              <br />
              <br />
              <span className="nh-kw">from</span>{" "}
              <span className="nh-var">neuraldrift</span>{" "}
              <span className="nh-kw">import</span>{" "}
              <span className="nh-fn">LoRATrainer</span>
              <br />
              <br />
              <span className="nh-var">trainer</span> ={" "}
              <span className="nh-fn">LoRATrainer</span>(<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="nh-var">model</span>=
              <span className="nh-str">&quot;flux-dev&quot;</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="nh-var">rank</span>=
              <span className="nh-num">32</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="nh-var">alpha</span>=
              <span className="nh-num">16</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="nh-var">dataset</span>=
              <span className="nh-str">&quot;./my_dataset&quot;</span>,{" "}
              <span className="nh-cmt"># 30–200 images</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="nh-var">epochs</span>=
              <span className="nh-num">10</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="nh-var">vram_budget</span>=
              <span className="nh-str">&quot;16GB&quot;</span>{" "}
              <span className="nh-cmt"># auto-tunes batch size</span>
              <br />
              )<br />
              <br />
              <span className="nh-var">trainer</span>.
              <span className="nh-fn">train</span>()
              <br />
              <br />
              <span className="nh-ok">✓ Epoch 10/10 — Loss: 0.0023</span>
              <br />
              <span className="nh-ok">
                ✓ Saved: ./output/my_lora_v1.safetensors
              </span>
              <br />
              <span className="nh-ok">
                ✓ Training time: ~4h 12m on RTX 5080
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="nh-section" id="workflows">
        <div className="nh-container">
          <div className="nh-section-label">Video Pipeline</div>
          <h2 className="nh-h2">Prompt to publish in 15 seconds.</h2>
          <p className="nh-section-sub">
            The full short-form content stack — optimized for YouTube Shorts,
            TikTok, and Instagram Reels.
          </p>
          <div className="nh-pipeline">
            {[
              { icon: "✍️", label: "Prompt", desc: "Scene Design" },
              { icon: "⚙️", label: "ComfyUI", desc: "Workflow" },
              { icon: "🎬", label: "LTX Video", desc: "Generation" },
              { icon: "🎞️", label: "CapCut", desc: "Edit + Hook" },
              { icon: "📱", label: "Publish", desc: "Shorts / TikTok" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className="nh-pipe-step">
                  <div className="nh-pipe-icon">{step.icon}</div>
                  <div className="nh-pipe-label">{step.label}</div>
                  <div className="nh-pipe-desc">{step.desc}</div>
                </div>
                {i < arr.length - 1 && <span className="nh-pipe-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="nh-highlight">
            <span className="nh-highlight-icon">⚡</span>
            <div className="nh-highlight-text">
              <h4>RTX 5080 Benchmark: 8-second clip in ~45 seconds</h4>
              <p>
                LTX Video 2.3 at 768×1344 (9:16), 25 steps, CFG 3.5, DPM++ 2M
                scheduler. Motion scale 1.2 for cinematic feel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: "5rem" }} id="loras">
        <div className="nh-container">
          <div className="nh-section-label">Latest Guides</div>
          <h2 className="nh-h2">Start with the essentials.</h2>
          <p className="nh-section-sub">
            Every guide is hardware-benchmarked and includes copy-paste configs.
            No paywalled content.
          </p>
          <div className="nh-guides-grid">
            {GUIDES.map((g) => (
              <Link key={g.href} className="nh-guide-card" href={g.href}>
                <div className="nh-guide-card-top">
                  <span className={levelClass(g.level)}>{g.level}</span>
                  <span className="nh-guide-time">⏱ {g.time}</span>
                </div>
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
                <div className="nh-guide-card-footer">
                  <span className="nh-guide-tag">{g.tag}</span>
                  <span className="nh-guide-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link className="nh-btn-secondary" href="/guides">
              View All Guides →
            </Link>
          </div>
        </div>
      </section>

      <section className="nh-section-sm" id="datasets">
        <div className="nh-container">
          <div className="nh-stats-row">
            {[
              { num: "6+", label: "ComfyUI Workflows" },
              { num: "6+", label: "LoRA Models" },
              { num: "2.4K", label: "Subscribers" },
              { num: "0", label: "Ads. Ever." },
            ].map((s) => (
              <div key={s.label} className="nh-stat-box">
                <div className="nh-stat-num">{s.num}</div>
                <div className="nh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nh-money-section nh-section" id="tools">
        <div className="nh-container">
          <div className="nh-money-inner">
            <div>
              <span className="nh-partner-badge">✓ Hardware Partner</span>
              <h2 className="nh-h2">Know your rig before you buy it.</h2>
              <p>
                Every workflow guide links out to exact hardware requirements.
                Our partner ComputeAtlas.ai lets you input your workload and get
                a precise build — GPU, CPU, RAM, NVMe, power draw, and total
                cost.
              </p>
              <p>
                Stop guessing if your card can handle 24-step FLUX at 1024px.
                Get the exact spec sheet in under 60 seconds.
              </p>
              <a
                className="nh-btn-primary"
                href="https://computeatlas.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Plan Your AI Rig → computeatlas.ai
              </a>
            </div>
            <div>
              <div className="nh-money-card">
                <div className="nh-money-card-top">
                  <span className="nh-money-card-logo">ComputeAtlas.ai</span>
                  <span className="nh-money-card-badge">Free Tool</span>
                </div>
                <div className="nh-money-features">
                  {[
                    {
                      label: "Workstation Builder",
                      desc: "GPU, CPU, RAM, NVMe with live pricing",
                    },
                    {
                      label: "Hardware Estimator",
                      desc: "Input your AI workload, get exact VRAM requirements",
                    },
                    {
                      label: "Recommended Builds",
                      desc: "Pre-tuned rigs for creators, fine-tuning, research",
                    },
                    {
                      label: "Side-by-side Compare",
                      desc: "RTX 4090 vs 5080 vs 5090 power & performance",
                    },
                  ].map((f) => (
                    <div key={f.label} className="nh-money-feat">
                      <span className="nh-money-feat-check">✓</span>
                      <span>
                        <strong>{f.label}</strong> — {f.desc}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  className="nh-btn-primary"
                  href="https://computeatlas.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Open Hardware Planner →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <Link className="nh-logo" href="/">
                <span className="nh-logo-dot" />
                neuraldrift
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
              <Link href="/guides">All Guides</Link>
              <Link href="/guides?level=beginner">Beginner</Link>
              <Link href="/guides?level=intermediate">Intermediate</Link>
              <Link href="/guides?level=advanced">Advanced</Link>
            </div>
            <div className="nh-footer-col">
              <h4>Downloads</h4>
              <Link href="/workflows">ComfyUI Workflows</Link>
              <Link href="/loras">LoRA Models</Link>
              <Link href="/datasets">Datasets</Link>
              <Link href="/tools">Scripts & Tools</Link>
            </div>
            <div className="nh-footer-col">
              <h4>Resources</h4>
              <Link href="/optimizer">Hardware Optimizer</Link>
              <Link href="/gpu-guide">GPU Compatibility Guide</Link>
              <Link href="/proof">Workflow Proof</Link>
              <a href="https://computeatlas.ai">ComputeAtlas.ai ↗</a>
              <Link href="/newsletter">Weekly Newsletter</Link>
              <Link href="/about">About</Link>
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
