"use client";
import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { WORKFLOWS, type WorkflowCategory, type HardwareTier } from "@/data/workflows";
import { CompatibilityBadge } from "@/components/optimizer/CompatibilityBadge";
import { ScoreBar } from "@/components/optimizer/ScoreBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TIER_LABELS: Record<HardwareTier, string> = {
  "8gb": "8GB", "12gb": "12GB", "16gb": "16GB", "24gb": "24GB",
};
const DIFF_STYLES: Record<string, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};
const TYPE_STYLES: Record<string, string> = {
  Image: "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  Video: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Animation: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  Training: "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  Upscale: "bg-[rgba(163,230,53,0.08)] text-[#a3e635]",
};
const GPU_PRESETS = [
  { label: "Select your GPU...", vram: 0, name: "" },
  { label: "RTX 5090 (32GB)", vram: 32, name: "RTX 5090" },
  { label: "RTX 5080 (16GB)", vram: 16, name: "RTX 5080" },
  { label: "RTX 4090 (24GB)", vram: 24, name: "RTX 4090" },
  { label: "RTX 4080 (16GB)", vram: 16, name: "RTX 4080" },
  { label: "RTX 4070 Ti (12GB)", vram: 12, name: "RTX 4070 Ti" },
  { label: "RTX 4070 (12GB)", vram: 12, name: "RTX 4070" },
  { label: "RTX 3090 (24GB)", vram: 24, name: "RTX 3090" },
  { label: "RTX 3080 16GB", vram: 16, name: "RTX 3080 16GB" },
  { label: "RTX 3080 10GB", vram: 10, name: "RTX 3080 10GB" },
  { label: "RTX 3060 (12GB)", vram: 12, name: "RTX 3060" },
  { label: "GTX 1660 Ti (6GB)", vram: 6, name: "GTX 1660 Ti" },
];

interface ScoreResult {
  workflow_id: string;
  score: number;
  band: string;
  band_color: string;
  should_run: boolean;
  primary_risk: string | null;
}
type FilterCategory = WorkflowCategory | "All";

export default function WorkflowsPage() {
  const [category, setCategory] = useState<FilterCategory>("All");
  const [vramFilter, setVramFilter] = useState<HardwareTier | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedGpu, setSelectedGpu] = useState("Select your GPU...");
  const [scores, setScores] = useState<Record<string, ScoreResult>>({});
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState("");

  const runScores = useCallback(async (gpuLabel: string) => {
    const preset = GPU_PRESETS.find(p => p.label === gpuLabel);
    if (!preset || !preset.vram) return;
    setScoring(true);
    setScoreError("");
    try {
      const res = await fetch(`${API_BASE}/api/score/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hardware: { gpu_name: preset.name, vram_gb: preset.vram, ram_gb: 32, storage_free_gb: 500 } }),
      });
      const data = await res.json();
      const map: Record<string, ScoreResult> = {};
      for (const s of data.scores) map[s.workflow_id] = s;
      setScores(map);
    } catch {
      setScoreError("Could not reach scoring engine");
    } finally {
      setScoring(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("neuralhub_gpu");
    if (saved && saved !== "Select your GPU...") {
      setSelectedGpu(saved);
      runScores(saved);
    }
  }, [runScores]);

  const handleGpuChange = (label: string) => {
    setSelectedGpu(label);
    localStorage.setItem("neuralhub_gpu", label);
    if (label !== "Select your GPU...") runScores(label);
    else setScores({});
  };

  const filtered = WORKFLOWS.filter(w => {
    if (category !== "All" && w.category !== category) return false;
    if (vramFilter !== "All" && !w.hardwareProfiles[vramFilter]) return false;
    if (search && !w.title.toLowerCase().includes(search.toLowerCase()) &&
        !w.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const sorted = Object.keys(scores).length > 0
    ? [...filtered].sort((a, b) => (scores[b.id]?.score ?? 50) - (scores[a.id]?.score ?? 50))
    : filtered;

  const runnable = Object.values(scores).filter(s => s.should_run).length;
  const scoredCount = Object.keys(scores).length;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Workflow Library</p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
              Discover, configure,<br />and export AI workflows.
            </h1>
            <p className="text-muted max-w-lg leading-relaxed">
              Pick a workflow, select your hardware profile, tune the parameters, and download a ready-to-run ComfyUI JSON.
            </p>
          </div>
          <Link href="/workflows/create"
            className="bg-surface border border-border text-muted px-5 py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors whitespace-nowrap">
            + Create Devlog
          </Link>
        </div>

        {/* GPU Selector Banner */}
        <div className={`mb-8 rounded-xl border p-5 transition-all ${scoredCount > 0 ? "bg-gradient-to-r from-accent/5 to-transparent border-accent/20" : "bg-card border-border"}`}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <span className="font-mono text-xs text-accent tracking-widest uppercase whitespace-nowrap">Your GPU</span>
              <select value={selectedGpu} onChange={e => handleGpuChange(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors">
                {GPU_PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
              {scoring && (
                <span className="flex items-center gap-2 font-mono text-xs text-muted whitespace-nowrap">
                  <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Scoring...
                </span>
              )}
            </div>
            {scoredCount > 0 && !scoring && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-syne text-xl font-black text-white">{runnable}</div>
                  <div className="font-mono text-xs text-[#10b981] tracking-wide">Run now</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="font-syne text-xl font-black text-white">{scoredCount - runnable}</div>
                  <div className="font-mono text-xs text-[#f97316] tracking-wide">Need upgrade</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <Link href="/optimizer" className="font-mono text-xs text-accent border border-accent/20 px-4 py-2 rounded hover:bg-accent/8 transition-colors tracking-widest uppercase whitespace-nowrap">
                  Full Optimizer →
                </Link>
              </div>
            )}
            {!scoredCount && !scoring && (
              <p className="font-mono text-xs text-muted">Select your GPU to see live compatibility scores</p>
            )}
            {scoreError && <p className="font-mono text-xs text-[#ef4444]">{scoreError}</p>}
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { step: "01", label: "Pick a workflow", desc: "Browse by category, difficulty, or VRAM" },
            { step: "02", label: "Select hardware profile", desc: "8GB / 12GB / 16GB / 24GB — settings auto-adjust" },
            { step: "03", label: "Configure parameters", desc: "Set prompt, LoRA, motion scale, and more" },
            { step: "04", label: "Export & run", desc: "Download customized ComfyUI JSON" },
          ].map(item => (
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
          <input type="text" placeholder="Search workflows..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono w-56 transition-colors"
          />
          <div className="flex gap-1.5">
            {(["All", "Image", "Video", "Animation", "Training"] as FilterCategory[]).map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${category === c ? "bg-accent/10 text-accent border-accent/20" : "bg-card border-border text-muted hover:text-text"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["All", "8gb", "12gb", "16gb", "24gb"] as const).map(v => (
              <button key={v} onClick={() => setVramFilter(v)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${vramFilter === v ? "bg-accent/10 text-accent border-accent/20" : "bg-card border-border text-muted hover:text-text"}`}>
                {v === "All" ? "All VRAM" : TIER_LABELS[v]}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-muted ml-auto">{sorted.length} workflows</span>
        </div>

        {/* Workflow cards */}
        <div className="grid grid-cols-2 gap-5">
          {sorted.map(wf => {
            const score = scores[wf.id];
            return (
              <Link key={wf.id} href={`/workflows/${wf.id}`}
                className={`bg-card border rounded-xl p-7 block hover:-translate-y-0.5 transition-all duration-200 group ${score && !score.should_run ? "border-[#ef4444]/15" : "border-border hover:border-accent/25"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${TYPE_STYLES[wf.category]}`}>{wf.category}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[wf.difficulty]}`}>{wf.difficulty}</span>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {score
                      ? <CompatibilityBadge score={score.score} band={score.band} bandColor={score.band_color} size="sm" />
                      : <span className="font-mono text-xs text-muted">v{wf.version}</span>
                    }
                  </div>
                </div>
                <h3 className="font-syne text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors tracking-tight">{wf.title}</h3>
                <p className="font-mono text-xs text-muted mb-3">{wf.tagline}</p>
                <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">{wf.description}</p>
                {score && (
                  <div className="mb-4">
                    <ScoreBar score={score.score} bandColor={score.band_color} showLabel={false} />
                    {score.primary_risk && !score.should_run && (
                      <p className="font-mono text-xs text-[#ef4444]/70 mt-1.5">⚠ {score.primary_risk}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  {(Object.keys(wf.hardwareProfiles) as HardwareTier[]).map(tier => (
                    <span key={tier} className="font-mono text-xs bg-surface border border-border text-muted px-2 py-1 rounded tracking-wide">{TIER_LABELS[tier]}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {wf.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-mono text-xs bg-white/4 text-muted px-2 py-0.5 rounded tracking-wide">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="font-mono text-xs text-muted">
                    {wf.requiredModels.filter(m => m.required).length} models · {wf.requiredModels.filter(m => m.required).reduce((a, m) => a + m.sizeGB, 0).toFixed(1)}GB
                  </div>
                  <span className="font-mono text-xs text-accent group-hover:translate-x-1 transition-transform inline-block">
                    {score && !score.should_run ? "Fix for My PC →" : "Configure & Export →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ComputeAtlas */}
        <div className="mt-16 bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-10 border-r border-accent-purple/15">
              <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-3">// Hardware Partner</p>
              <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">Need better hardware<br />for these workflows?</h2>
              <p className="text-muted mb-6 text-sm leading-relaxed">ComputeAtlas is an AI workstation planning platform. Use it to spec the exact hardware you need before you buy.</p>
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
                  { name: "Creator AI Rig", spec: "1x RTX 4090 - Ryzen 9 9950X - 64GB RAM", href: "https://computeatlas.ai/recommended-builds", tag: "Image & Video" },
                  { name: "Fine-Tuning Workstation", spec: "2x RTX 6000 Ada - Threadripper PRO", href: "https://computeatlas.ai/recommended-builds", tag: "Training" },
                ].map(b => (
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
