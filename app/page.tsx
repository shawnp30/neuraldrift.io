import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <WhatIsNeuralHub />
        <PlatformFeatures />
        <HowItWorks />
        <WorkflowShowcase />
        <OptimizerFeature />
        <GuidesPreviewSection />
        <LoRASection />
        <PipelineVisual />
        <ComputeBridgeSection />
        <NewsletterSignup />
      </main>
      <Footer />
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-10 pt-24 pb-20 overflow-hidden bg-grid">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.07)_0%,rgba(124,58,237,0.05)_50%,transparent_70%)] pointer-events-none" />

      <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 font-mono text-xs text-accent tracking-widest mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
        LTX Video 2.3 · FLUX Dev · SDXL · AnimateDiff — All Supported
      </div>

      <h1 className="font-syne font-black text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[-0.04em] mb-6 max-w-5xl">
        The operating system<br />
        <span className="gradient-text">for AI workflows.</span>
      </h1>

      <p className="text-xl text-muted max-w-2xl leading-relaxed font-light mb-4">
        NeuralHub is where AI creators go before opening ComfyUI. Score your hardware, configure the right workflow, train LoRAs, and export a ready-to-run pipeline — no guessing, no wasted renders.
      </p>
      <p className="text-sm text-muted/60 font-mono mb-12 max-w-xl leading-relaxed">
        Built for local GPU creators running RTX 3080 through RTX 5090. Real configs, real benchmarks, real workflows tested on real hardware.
      </p>

      <div className="flex gap-4 justify-center flex-wrap mb-20">
        <Link href="/optimizer" className="bg-accent text-black px-8 py-3.5 rounded font-semibold text-sm hover:opacity-85 transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
          Score My Hardware →
        </Link>
        <Link href="/workflows" className="bg-white/5 border border-border text-text px-8 py-3.5 rounded text-sm font-semibold hover:border-accent/30 hover:text-accent transition-colors">
          Browse Workflows
        </Link>
        <Link href="/guides" className="border border-border text-muted px-8 py-3.5 rounded text-sm font-mono tracking-wider hover:border-accent/20 hover:text-text transition-colors">
          Read Guides
        </Link>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-4 gap-8 max-w-3xl w-full pt-12 border-t border-border">
        {[
          { value: "6",       label: "AI Workflows",       sub: "ComfyUI-ready exports" },
          { value: "6",       label: "LoRA Models",        sub: "Character & style" },
          { value: "3",       label: "Training Guides",    sub: "Step-by-step" },
          { value: "RTX 5080",label: "Primary Test GPU",  sub: "16GB VRAM" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="font-syne text-3xl font-black text-white tracking-tight">{s.value}</div>
            <div className="font-mono text-xs text-muted tracking-widest uppercase mt-1">{s.label}</div>
            <div className="font-mono text-xs text-muted/40 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── What Is NeuralHub ────────────────────────────────────────────────────────

function WhatIsNeuralHub() {
  return (
    <section className="py-28 px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 gap-20 items-center">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// What is NeuralHub</p>
          <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            The place you go<br />before you generate.
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            Most AI creators waste hours figuring out why their workflow crashes, why the settings are wrong for their GPU, or why their LoRA doesn't look right. NeuralHub solves that.
          </p>
          <p className="text-muted leading-relaxed mb-5">
            We built a hardware-aware workflow intelligence system. Tell it your GPU — it tells you exactly which workflows will run, what settings to use, and what to do when something breaks.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            Every workflow is real. Every guide is tested. Every LoRA was trained on the same hardware you probably own. No cloud, no subscriptions, no black boxes.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/optimizer" className="bg-accent text-black px-6 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
              Try the Optimizer
            </Link>
            <Link href="/guides/comfyui-complete-setup" className="border border-border text-muted px-6 py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Visual explanation */}
        <div className="space-y-3">
          {[
            { icon: "🎯", title: "Hardware-First Design", desc: "Everything on NeuralHub is matched to your GPU. 8GB, 12GB, 16GB, 24GB — different settings, different profiles, different exports. One workflow, tuned for your exact card." },
            { icon: "🔧", title: "Real Configs, Not Theory", desc: "Every workflow was built and tested on RTX 5080, RTX 3080, and GTX 1660 Ti. The settings you see are the ones that actually worked — including the ones that failed first." },
            { icon: "⚡", title: "From Zero to Running", desc: "No prerequisites. Pick a workflow, score your hardware, download the JSON, drop it into ComfyUI. First generation in under 5 minutes from a fresh install." },
            { icon: "🧠", title: "Intelligence Layer", desc: "The optimizer engine scores every workflow against your hardware, selects the best performance profile, and applies targeted fixes — tiled VAE, frame reduction, precision switching — automatically." },
          ].map(item => (
            <div key={item.title} className="flex gap-4 bg-card border border-border rounded-xl p-5 hover:border-accent/15 transition-colors">
              <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <div className="font-syne text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="font-mono text-xs text-muted leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Platform Features ────────────────────────────────────────────────────────

function PlatformFeatures() {
  const features = [
    {
      icon: "⚡",
      label: "Workflow Library",
      href: "/workflows",
      color: "#00e5ff",
      title: "ComfyUI workflows, ready to run",
      desc: "Browse video, image, animation, and training workflows. Each one has hardware profiles for 8GB, 12GB, 16GB, and 24GB VRAM. Select yours, configure the parameters, and export a JSON that loads directly into ComfyUI.",
      bullets: ["LTX Video 2.3 chase sequences", "FLUX portrait + LoRA injection", "SDXL batch concept generation", "AnimateDiff seamless loops"],
    },
    {
      icon: "🎛️",
      label: "Optimizer",
      href: "/optimizer",
      color: "#10b981",
      title: "Score every workflow against your GPU",
      desc: "Enter your GPU and the optimizer calls a live scoring engine. Every workflow gets a 0–100 compatibility score. Click Optimize to see exactly which settings were changed, why, and what launch flags to use.",
      bullets: ["Real-time batch scoring", "Quality / Speed / Reliability modes", "Exact settings diff with reasons", "Fix-for-My-PC engine"],
    },
    {
      icon: "📖",
      label: "Guides",
      href: "/guides",
      color: "#a78bfa",
      title: "Hardware-tested, step-by-step guides",
      desc: "Written by someone who actually runs these models on consumer hardware. Not cloud benchmarks, not theoretical setups. ComfyUI complete setup, FLUX LoRA training, LTX Video cinematic sequences — all tested on RTX 5080 and RTX 3080.",
      bullets: ["ComfyUI complete setup guide", "FLUX LoRA training (6 hours)", "LTX Video cinematic sequences", "Dataset curation at scale"],
    },
    {
      icon: "🔁",
      label: "LoRA Library",
      href: "/loras",
      color: "#f97316",
      title: "Custom LoRAs with full training specs",
      desc: "Six trained LoRA models — Fat Bigfoot, Slacker Alien, Highway Ghost, Desert Pursuit, GoPro POV, and ComfyUI Node Graph. Every model ships with trigger words, recommended strength ranges, training specs, and the dataset it was trained on.",
      bullets: ["Character + style LoRAs", "Trigger words + strength ranges", "Full training specs included", "Matching datasets available"],
    },
    {
      icon: "🗃️",
      label: "Datasets",
      href: "/datasets",
      color: "#a3e635",
      title: "Training datasets with captions",
      desc: "The raw material behind every LoRA on this site. Each dataset includes curated images, WD14 or natural language captions, trigger word structure, folder organization for Kohya SS, and training notes from the actual runs.",
      bullets: ["WD14 + natural language captions", "Kohya SS-ready folder structure", "Training notes per dataset", "Linked to trained LoRAs"],
    },
    {
      icon: "🛠️",
      label: "Tools",
      href: "/tools",
      color: "#00e5ff",
      title: "VRAM calculator, benchmarks, captions",
      desc: "Three free tools built for daily AI workflow use. VRAM Calculator estimates memory usage before you run. Benchmark Lookup shows real inference speeds across consumer GPUs. Caption Generator formats training captions in WD14, FLUX, and dataset styles.",
      bullets: ["VRAM usage estimator", "GPU benchmark database", "Multi-format caption generator", "Launch flag recommendations"],
    },
  ];

  return (
    <section className="py-28 bg-surface/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-10">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Platform Overview</p>
          <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
            Six tools. One platform.
          </h2>
          <p className="text-muted max-w-2xl mx-auto leading-relaxed">
            Every section of NeuralHub connects to the others. Your hardware profile from the Optimizer follows you to the Workflow Library. Your LoRAs link to the Datasets that trained them. Everything is integrated by design.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {features.map(f => (
            <Link key={f.href} href={f.href}
              className="bg-card border border-border rounded-2xl p-7 block hover:-translate-y-1 hover:border-accent/20 transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  {f.icon}
                </div>
                <div>
                  <div className="font-mono text-xs tracking-widest uppercase" style={{ color: f.color }}>{f.label}</div>
                  <div className="font-syne text-sm font-bold text-white">{f.title}</div>
                </div>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">{f.desc}</p>
              <ul className="space-y-1.5">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 font-mono text-xs text-muted">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="font-mono text-xs text-muted tracking-wide">Explore →</span>
                <span className="font-mono text-xs group-hover:text-accent transition-colors" style={{ color: f.color }}>Open</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="py-28 px-10 max-w-7xl mx-auto">
      <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// How It Works</p>
      <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
        From GPU to generated image<br />in four steps.
      </h2>
      <p className="text-muted max-w-xl leading-relaxed mb-16">
        NeuralHub is built around a single workflow: know your hardware, find the right workflow, configure it, run it. No surprises.
      </p>

      <div className="grid grid-cols-4 gap-6 relative">
        {/* Connector line */}
        <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {[
          {
            step: "01",
            icon: "🖥️",
            title: "Enter Your GPU",
            desc: "Select your GPU from the dropdown in the Optimizer or Workflow Library. Your hardware profile is saved and used across the entire site.",
            link: "/optimizer",
            linkLabel: "Open Optimizer",
          },
          {
            step: "02",
            icon: "📊",
            title: "Get Your Score",
            desc: "The scoring engine calls the NeuralHub API and returns a compatibility score for every workflow — plus the exact bottlenecks on your hardware.",
            link: "/optimizer",
            linkLabel: "See Scores",
          },
          {
            step: "03",
            icon: "⚙️",
            title: "Optimize Settings",
            desc: "Click Optimize on any workflow. The engine selects the best performance profile and applies hardware-specific adjustments — tiled VAE, frame caps, precision switching.",
            link: "/workflows",
            linkLabel: "Browse Workflows",
          },
          {
            step: "04",
            icon: "⬇️",
            title: "Export & Run",
            desc: "Download your optimized ComfyUI JSON. Drop it into ComfyUI, install the listed custom nodes, and queue the prompt. Your first generation runs in minutes.",
            link: "/workflows",
            linkLabel: "Try a Workflow",
          },
        ].map(item => (
          <div key={item.step} className="relative">
            <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <span className="font-syne text-3xl font-black text-white/10">{item.step}</span>
              </div>
              <h3 className="font-syne text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed flex-1">{item.desc}</p>
              <Link href={item.link} className="mt-4 font-mono text-xs text-accent tracking-widest uppercase hover:underline">
                {item.linkLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Workflow Showcase ─────────────────────────────────────────────────────────

function WorkflowShowcase() {
  const workflows = [
    { id: "ltx-cinematic-chase", title: "LTX Cinematic Chase", category: "Video", vram: "16GB", desc: "Hollywood-style chase clips for Shorts & TikTok. Consistent motion, camera lock, 97 frames.", color: "#00e5ff" },
    { id: "flux-portrait-lora", title: "FLUX Portrait + LoRA", category: "Image", vram: "16GB", desc: "High-fidelity portraits with custom LoRA injection. Sharp detail, consistent character.", color: "#10b981" },
    { id: "sdxl-concept-batch", title: "SDXL Concept Batch", category: "Image", vram: "8GB+", desc: "8 concept variations in one run. Designer-grade iteration speed.", color: "#a3e635" },
    { id: "animatediff-character-loop", title: "AnimateDiff Loop", category: "Animation", vram: "12GB", desc: "Seamless 24-frame loops with LoRA. Built for Instagram Reels format.", color: "#f97316" },
  ];

  return (
    <section className="py-28 bg-surface/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Workflow Library</p>
            <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-3">
              Real workflows.<br />Real output.
            </h2>
            <p className="text-muted max-w-lg leading-relaxed">
              Every workflow is a real ComfyUI node graph — built, broken, and fixed on actual consumer hardware. Not templates. Not demos. Tested pipelines.
            </p>
          </div>
          <Link href="/workflows" className="bg-accent text-black px-6 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap flex-shrink-0">
            See All Workflows →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {workflows.map(wf => (
            <Link key={wf.id} href={`/workflows/${wf.id}`}
              className="bg-card border border-border rounded-xl p-5 block hover:-translate-y-1 hover:border-accent/20 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase"
                  style={{ backgroundColor: `${wf.color}15`, color: wf.color }}>
                  {wf.category}
                </span>
                <span className="font-mono text-xs text-muted">{wf.vram}</span>
              </div>
              <h3 className="font-syne text-sm font-bold text-white mb-2 group-hover:text-accent transition-colors">{wf.title}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed">{wf.desc}</p>
              <div className="mt-4 pt-3 border-t border-border font-mono text-xs text-accent">Configure & Export →</div>
            </Link>
          ))}
        </div>

        {/* Hardware profiles callout */}
        <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-between gap-8">
          <div className="max-w-lg">
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">Hardware Profiles</p>
            <h3 className="font-syne text-xl font-bold text-white mb-2">Every workflow scales to your GPU</h3>
            <p className="font-mono text-xs text-muted leading-relaxed">
              Each workflow has four hardware profiles. Select yours and the settings auto-adjust — resolution, batch size, frame count, precision, and launch flags. One workflow, four GPU tiers.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {[
              { tier: "8GB", color: "#a3e635", label: "GTX 1660 · RTX 3060" },
              { tier: "12GB", color: "#f97316", label: "RTX 3060 · RTX 4070" },
              { tier: "16GB", color: "#00e5ff", label: "RTX 3080 · RTX 5080" },
              { tier: "24GB", color: "#a78bfa", label: "RTX 3090 · RTX 4090" },
            ].map(t => (
              <div key={t.tier} className="text-center px-4 py-3 rounded-xl border"
                style={{ borderColor: `${t.color}25`, backgroundColor: `${t.color}08` }}>
                <div className="font-syne text-lg font-black" style={{ color: t.color }}>{t.tier}</div>
                <div className="font-mono text-xs text-muted mt-1 w-24">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Optimizer Feature ────────────────────────────────────────────────────────

function OptimizerFeature() {
  return (
    <section className="py-28 px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 gap-20 items-start">
        <div>
          <p className="font-mono text-xs text-[#10b981] tracking-widest uppercase mb-4">// Workflow Optimizer</p>
          <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Never run the wrong settings again.
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            The Optimizer is NeuralHub&apos;s intelligence layer. It&apos;s a live API that scores every workflow against your exact GPU, selects the best profile, and explains every change it makes.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            It&apos;s not guessing. It uses a weighted scoring model across VRAM fit, RAM headroom, task suitability, and stability margin. The Fix-for-My-PC engine never says &quot;not supported&quot; — it always tells you exactly what to change.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { label: "Compatibility Score",  desc: "0–100 weighted score: Excellent / Good / Usable / Risky / Not Recommended" },
              { label: "Profile Selection",    desc: "Safe / Balanced / Max Quality — picks the right one for your hardware + priority" },
              { label: "Settings Diff",        desc: "Every change shown with the exact reason — tiled VAE, frame reduction, precision switch" },
              { label: "Fix-for-My-PC",        desc: "Exact actionable fixes, fallback workflows, upgrade path — never a dead end" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0 mt-1.5" />
                <div>
                  <span className="font-syne text-xs font-bold text-white">{item.label} — </span>
                  <span className="font-mono text-xs text-muted">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/optimizer" className="bg-[#10b981] text-black px-8 py-3.5 rounded font-bold text-sm hover:opacity-85 transition-opacity inline-block">
            Open Optimizer →
          </Link>
        </div>

        {/* Mock optimizer output */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="font-mono text-xs text-accent tracking-widest uppercase">Optimization Result</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full border border-[#10b981]/20">low risk</span>
              <span className="font-mono text-xs bg-white/5 text-muted px-3 py-1 rounded-full">balanced profile</span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Score bar */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-1.5">
                <span className="text-muted">Compatibility</span>
                <span className="text-[#10b981]">87/100</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-[#10b981] rounded-full w-[87%] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
            </div>
            {/* Settings */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Optimized Settings</p>
              <div className="space-y-2 font-mono text-xs">
                {[
                  ["resolution", "512x768"],
                  ["frames", "73"],
                  ["steps", "25"],
                  ["vae_mode", "tiled"],
                  ["precision", "fp16"],
                  ["batch_size", "1"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Change */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Changes Applied (2)</p>
              <div className="space-y-2">
                {[
                  { from: "standard", to: "tiled", field: "vae_mode", reason: "Tiled VAE reduces peak VRAM by ~2GB on 16GB cards" },
                  { from: "97", to: "73", field: "frames", reason: "Reduced for decode stability at 16GB" },
                ].map(c => (
                  <div key={c.field} className="bg-card rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1 font-mono text-xs">
                      <span className="text-muted line-through">{c.from}</span>
                      <span className="text-accent">→</span>
                      <span className="text-white font-medium">{c.to}</span>
                    </div>
                    <p className="font-mono text-xs text-muted">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Launch */}
            <div className="bg-[#0d1117] border border-border rounded-xl px-4 py-3 flex items-center gap-2 font-mono text-xs">
              <span className="text-muted">$</span>
              <span className="text-accent">python main.py --gpu-only</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Guides Preview ────────────────────────────────────────────────────────────

function GuidesPreviewSection() {
  const guides = [
    { slug: "comfyui-complete-setup", difficulty: "Beginner", title: "ComfyUI Complete Setup: RTX 5080 Edition", desc: "From zero to a working workflow in 30 minutes. Install, configure, and benchmark.", time: "12 min", tag: "Image Gen", color: "#a3e635" },
    { slug: "train-flux-lora", difficulty: "Intermediate", title: "Train Your First FLUX LoRA in Under 6 Hours", desc: "Dataset prep, Kohya config, training loop, and quality evaluation from scratch.", time: "28 min", tag: "LoRA Training", color: "#f97316" },
    { slug: "ltx-video-cinematic-action", difficulty: "Advanced", title: "LTX Video 2.3: Cinematic Action Sequences", desc: "Build chase scenes with consistent motion, camera lock, and temporal coherence.", time: "35 min", tag: "Video Gen", color: "#a78bfa" },
  ];

  return (
    <section className="py-28 bg-surface/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Guides</p>
            <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-3">
              Guides written by someone<br />who broke it first.
            </h2>
            <p className="text-muted max-w-lg leading-relaxed">
              Not cloud benchmarks or theoretical setups. Every guide is tested on RTX 5080 and RTX 3080 on Windows. The settings that failed are documented too.
            </p>
          </div>
          <Link href="/guides" className="border border-border text-muted px-6 py-3 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors whitespace-nowrap flex-shrink-0">
            All Guides →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {guides.map(g => (
            <Link key={g.slug} href={`/guides/${g.slug}`}
              className="bg-card border border-border rounded-xl p-7 block hover:-translate-y-1 hover:border-accent/20 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase"
                  style={{ backgroundColor: `${g.color}15`, color: g.color }}>
                  {g.difficulty}
                </span>
                <span className="font-mono text-xs text-muted">{g.tag}</span>
              </div>
              <h3 className="font-syne text-sm font-bold text-white mb-2 group-hover:text-accent transition-colors leading-snug">{g.title}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed mb-5">{g.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border font-mono text-xs text-muted">
                <span>⏱ {g.time} read</span>
                <span className="text-accent group-hover:translate-x-1 transition-transform inline-block">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── LoRA Section ──────────────────────────────────────────────────────────────

function LoRASection() {
  return (
    <section className="py-28 px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 gap-20 items-center">
        {/* LoRA cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Fat Bigfoot v4", type: "Character", model: "SDXL", trigger: "fatbigfoot", strength: "0.7–0.9", color: "#00e5ff" },
            { name: "Highway Ghost v3", type: "Style", model: "FLUX", trigger: "highwayghost", strength: "0.6–0.85", color: "#a78bfa" },
            { name: "Slacker Alien v2", type: "Character", model: "SDXL", trigger: "slackeralien", strength: "0.7–0.85", color: "#f97316" },
            { name: "Desert Pursuit v1", type: "Style", model: "FLUX", trigger: "desertpursuit", strength: "0.65–0.85", color: "#a3e635" },
            { name: "GoPro POV v2", type: "Style", model: "SDXL", trigger: "gopropov", strength: "0.55–0.8", color: "#10b981" },
            { name: "Node Graph Concept", type: "Concept", model: "FLUX", trigger: "nodegraph", strength: "0.5–0.75", color: "#00e5ff" },
          ].map(lora => (
            <div key={lora.name} className="bg-card border border-border rounded-xl p-4 hover:border-accent/15 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs tracking-widest uppercase" style={{ color: lora.color }}>{lora.type}</span>
                <span className="font-mono text-xs text-muted">{lora.model}</span>
              </div>
              <div className="font-syne text-sm font-bold text-white mb-2">{lora.name}</div>
              <div className="bg-surface border border-border rounded px-2 py-1 flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted">trigger</span>
                <code className="font-mono text-xs" style={{ color: lora.color }}>{lora.trigger}</code>
              </div>
              <div className="font-mono text-xs text-muted">strength: {lora.strength}</div>
            </div>
          ))}
        </div>

        <div>
          <p className="font-mono text-xs text-[#f97316] tracking-widest uppercase mb-4">// LoRA Library</p>
          <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            LoRAs trained on the same GPU you own.
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            Six custom LoRA models — all trained on RTX 5080 and RTX 3080. Character LoRAs, cinematic style LoRAs, and concept LoRAs. Each one ships with a trigger word, recommended strength range, and the full training spec.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            You can download the LoRA, see exactly what dataset trained it, read the training notes, and replicate the training run yourself. Nothing is hidden.
          </p>
          <div className="flex gap-3">
            <Link href="/loras" className="bg-[#f97316] text-black px-6 py-3 rounded font-bold text-sm hover:opacity-85 transition-opacity">
              Browse LoRAs →
            </Link>
            <Link href="/datasets" className="border border-border text-muted px-6 py-3 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors">
              View Datasets
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pipeline Visual ───────────────────────────────────────────────────────────

function PipelineVisual() {
  const steps = [
    { icon: "🧠", name: "NeuralHub", sub: "Score + Configure" },
    { icon: "⚙️", name: "ComfyUI", sub: "Node Graph" },
    { icon: "🎬", name: "Generate", sub: "LTX / FLUX / SDXL" },
    { icon: "🎞️", name: "Edit", sub: "CapCut / Resolve" },
    { icon: "📱", name: "Publish", sub: "Shorts / Reels" },
  ];

  return (
    <section className="py-28 bg-surface/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-10">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// The Full Pipeline</p>
        <h2 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
          NeuralHub is step one<br />in your content pipeline.
        </h2>
        <p className="text-muted max-w-xl leading-relaxed mb-16">
          From hardware scoring to published video — the whole pipeline runs on local hardware, no cloud required. NeuralHub handles the intelligence layer so ComfyUI can handle the generation.
        </p>
        <div className="bg-gradient-to-br from-accent/3 to-accent-purple/3 border border-border rounded-2xl p-12">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.name} className="flex items-center gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-card border border-border rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
                    {step.icon}
                  </div>
                  <div className="font-syne text-sm font-bold text-white">{step.name}</div>
                  <div className="font-mono text-xs text-muted mt-1 tracking-wide">{step.sub}</div>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-accent/40 text-2xl font-light mb-6">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ComputeBridge ─────────────────────────────────────────────────────────────

function ComputeBridgeSection() {
  return (
    <section className="py-28 px-10 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-2xl overflow-hidden">
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.1),transparent_70%)] pointer-events-none" />
        <div className="grid grid-cols-2 gap-0 relative">
          <div className="p-14 border-r border-accent-purple/15">
            <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-4">// Hardware Partner</p>
            <h2 className="font-syne text-4xl font-black tracking-tight text-white mb-4">
              Know what to buy<br />before you buy it.
            </h2>
            <p className="text-muted leading-relaxed mb-6 max-w-sm">
              ComputeAtlas is an AI workstation planning platform. Tell it what you want to run — FLUX, LTX Video, LoRA training — it tells you exactly which GPU, CPU, and RAM to buy and why.
            </p>
            <Link href="https://computeatlas.ai" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-accent-purple text-white px-8 py-3.5 rounded font-bold text-sm hover:opacity-85 transition-opacity">
              Plan Your AI Rig →
            </Link>
          </div>
          <div className="p-14">
            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-6">What ComputeAtlas does</p>
            <div className="space-y-4">
              {[
                { icon: "🔧", title: "AI Workstation Builder", desc: "Pick GPU, CPU, RAM, NVMe — see power draw and requirements in real time" },
                { icon: "📊", title: "Hardware Estimator", desc: "Input your workload, get exact VRAM and system requirements" },
                { icon: "⚡", title: "Recommended Builds", desc: "Pre-configured rigs for creators, fine-tuning, research, and enterprise" },
                { icon: "🔄", title: "Compare Configs", desc: "Side-by-side hardware comparison before you commit" },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <div className="font-syne text-sm font-bold text-white">{f.title}</div>
                    <div className="font-mono text-xs text-muted mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
