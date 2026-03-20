"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { WORKFLOWS, type WorkflowCategory, type HardwareTier } from "@/data/workflows";

const TIER_LABELS: Record<HardwareTier, string> = {
  "8gb": "8GB",
  "12gb": "12GB",
  "16gb": "16GB",
  "24gb": "24GB",
};

const DIFF_STYLES: Record<string, string> = {
  Beginner:     "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced:     "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

const TYPE_STYLES: Record<string, string> = {
  Image:     "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  Video:     "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Animation: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  Training:  "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  Upscale:   "bg-[rgba(163,230,53,0.08)] text-[#a3e635]",
};

type FilterCategory = WorkflowCategory | "All";

export default function WorkflowsPage() {
  const [category, setCategory] = useState<FilterCategory>("All");
  const [vramFilter, setVramFilter] = useState<HardwareTier | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = WORKFLOWS.filter((w) => {
    if (category !== "All" && w.category !== category) return false;
    if (vramFilter !== "All" && !w.hardwareProfiles[vramFilter]) return false;
    if (search && !w.title.toLowerCase().includes(search.toLowerCase()) &&
        !w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Workflow Library</p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
              Discover, configure,<br />and export AI workflows.
            </h1>
            <p className="text-muted max-w-lg leading-relaxed">
              Pick a workflow, select your hardware profile, tune the parameters, and download a ready-to-run ComfyUI JSON. No manual config required.
            </p>
          </div>
          <Link href="/workflows/create"
            className="bg-surface border border-border text-muted px-5 py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors whitespace-nowrap">
            + Create Devlog
          </Link>
        </div>

        {/* How it works strip */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { step: "01", label: "Pick a workflow", desc: "Browse by category, difficulty, or VRAM requirement" },
            { step: "02", label: "Select hardware profile", desc: "8GB / 12GB / 16GB / 24GB — settings auto-adjust" },
            { step: "03", label: "Configure parameters", desc: "Set prompt, LoRA, motion scale, and more" },
            { step: "04", label: "Export & run", desc: "Download customized ComfyUI JSON, load and generate" },
          ].map((item) => (
            <div key={item.step} className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 font-syne text-4xl font-black text-white/4">{item.step}</div>
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">{item.step}</p>
              <h3 className="font-syne text-sm font-bold text-white mb-1">{item.label}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono w-56 transition-colors"
          />
          <div className="flex gap-1.5">
            {(["All", "Image", "Video", "Animation", "Training"] as FilterCategory[]).map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${
                  category === c ? "bg-accent/10 text-accent border-accent/20" : "bg-card border-border text-muted hover:text-text"
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["All", "8gb", "12gb", "16gb", "24gb"] as const).map((v) => (
              <button key={v} onClick={() => setVramFilter(v)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${
                  vramFilter === v ? "bg-accent/10 text-accent border-accent/20" : "bg-card border-border text-muted hover:text-text"
                }`}>
                {v === "All" ? "All VRAM" : TIER_LABELS[v]}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-muted ml-auto">{filtered.length} workflows</span>
        </div>

        {/* Workflow cards */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((wf) => (
            <Link key={wf.id} href={`/workflows/${wf.id}`}
              className="bg-card border border-border rounded-xl p-7 block hover:border-accent/25 hover:-translate-y-0.5 transition-all duration-200 group">

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${TYPE_STYLES[wf.category]}`}>
                    {wf.category}
                  </span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[wf.difficulty]}`}>
                    {wf.difficulty}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted">v{wf.version}</span>
              </div>

              <h3 className="font-syne text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors tracking-tight">
                {wf.title}
              </h3>
              <p className="font-mono text-xs text-muted mb-4">{wf.tagline}</p>
              <p className="text-sm text-muted leading-relaxed mb-5 line-clamp-2">{wf.description}</p>

              {/* Hardware tiers */}
              <div className="flex gap-2 mb-5">
                {(Object.keys(wf.hardwareProfiles) as HardwareTier[]).map((tier) => (
                  <span key={tier} className="font-mono text-xs bg-surface border border-border text-muted px-2 py-1 rounded tracking-wide">
                    {TIER_LABELS[tier]}
                  </span>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {wf.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="font-mono text-xs bg-white/4 text-muted px-2 py-0.5 rounded tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="font-mono text-xs text-muted">
                  {wf.requiredModels.filter(m => m.required).length} required models ·{" "}
                  {wf.requiredModels.filter(m => m.required).reduce((a, m) => a + m.sizeGB, 0).toFixed(1)}GB
                </div>
                <span className="font-mono text-xs text-accent group-hover:translate-x-1 transition-transform inline-block">
                  Configure & Export →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ComputeAtlas */}
        <div className="mt-16 bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-10 border-r border-accent-purple/15">
              <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-3">// Hardware Partner</p>
              <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">
                Need better hardware<br />for these workflows?
              </h2>
              <p className="text-muted mb-6 text-sm leading-relaxed">
                ComputeAtlas is an AI workstation planning platform. Use it to spec the exact hardware you need — GPU, CPU, RAM, storage — before you buy.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="https://computeatlas.ai/ai-hardware-estimator" target="_blank"
                  className="inline-block bg-accent-purple text-white px-5 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
                  Estimate My Hardware →
                </Link>
                <Link href="https://computeatlas.ai/recommended-builds" target="_blank"
                  className="inline-block bg-white/5 border border-white/10 text-muted px-5 py-2.5 rounded font-semibold text-sm hover:text-text transition-colors">
                  View Recommended Builds
                </Link>
              </div>
            </div>
            <div className="p-10">
              <p className="font-mono text-xs text-muted tracking-widest uppercase mb-5">Relevant builds for these workflows</p>
              <div className="space-y-3">
                {[
                  { name: "Creator AI Rig", spec: "1× RTX 4090 · Ryzen 9 9950X · 64GB RAM", href: "https://computeatlas.ai/recommended-builds", tag: "Image & Video" },
                  { name: "Fine-Tuning Workstation", spec: "2× RTX 6000 Ada · Threadripper PRO", href: "https://computeatlas.ai/recommended-builds", tag: "Training" },
                ].map((b) => (
                  <Link key={b.name} href={b.href} target="_blank"
                    className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent-purple/30 transition-colors group">
                    <div>
                      <div className="font-syne text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors">{b.name}</div>
                      <div className="font-mono text-xs text-muted mt-0.5">{b.spec}</div>
                    </div>
                    <span className="font-mono text-xs bg-accent-purple/10 text-[#a78bfa] px-2 py-0.5 rounded tracking-wide flex-shrink-0 ml-3">{b.tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
