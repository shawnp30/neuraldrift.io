"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WORKFLOWS, getWorkflowsByCategory } from "@/lib/workflowsData";

// ── GPU options for the compatibility dropdown ─────────────────────────────
const GPU_OPTIONS = [
  { label: "Select your GPU...", value: "" },
  { label: "GTX 1660 Ti — 6GB", value: 6 },
  { label: "RTX 3060 — 12GB", value: 12 },
  { label: "RTX 3080 — 16GB", value: 16 },
  { label: "RTX 3090 — 24GB", value: 24 },
  { label: "RTX 4070 — 12GB", value: 12 },
  { label: "RTX 4080 — 16GB", value: 16 },
  { label: "RTX 4090 — 24GB", value: 24 },
  { label: "RTX 5080 — 16GB", value: 16 },
  { label: "RTX 5090 — 32GB", value: 32 },
];

const CATEGORIES = ["ALL", "Image", "Video", "Enhance", "ControlNet", "Specialty"];

const CAT_COLORS: Record<string, string> = {
  Image:      "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Video:      "text-sky-400 border-sky-400/30 bg-sky-400/10",
  Enhance:    "text-amber-400 border-amber-400/30 bg-amber-400/10",
  ControlNet: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Specialty:  "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner:     "text-green-400 border-green-400/25 bg-green-400/10",
  Intermediate: "text-amber-400 border-amber-400/25 bg-amber-400/10",
  Advanced:     "text-red-400 border-red-400/25 bg-red-400/10",
};

function vramScore(gpuVram: number, wfVram: number): "ok" | "tight" | "no" {
  if (gpuVram === 0) return "ok";
  const num = parseInt(String(wfVram));
  if (isNaN(num) || gpuVram >= num) return "ok";
  if (gpuVram >= num - 2) return "tight";
  return "no";
}

export default function WorkflowsPage() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("ALL");
  const [gpuVram, setGpuVram]   = useState(0);

  const filtered = WORKFLOWS.filter((wf) => {
    const matchCat  = category === "ALL" || wf.category === category;
    const matchSrch = !search ||
      wf.title.toLowerCase().includes(search.toLowerCase()) ||
      wf.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSrch;
  });

  return (
    <div className="min-h-screen bg-bg text-text">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
          // Workflow Library
        </p>
        <h1 className="font-syne text-4xl md:text-5xl font-black text-white mb-4">
          Discover, configure,<br />and export AI workflows.
        </h1>
        <p className="text-muted max-w-xl leading-relaxed mb-8">
          Pick a workflow, select your hardware profile, tune the parameters,
          and download a ready-to-run ComfyUI JSON.
        </p>

        {/* GPU selector + create devlog */}
        <div className="rounded-xl border border-border bg-card p-5 mb-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <span className="font-mono text-xs text-accent tracking-widest uppercase whitespace-nowrap">
              Your GPU
            </span>
            <select
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors"
              onChange={(e) => setGpuVram(Number(e.target.value))}
            >
              {GPU_OPTIONS.map((g) => (
                <option key={g.label} value={g.value ?? ""}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted font-mono">
            {gpuVram
              ? `Showing compatibility for ${gpuVram}GB VRAM`
              : "Select your GPU to see live compatibility scores"}
          </span>
          <Link
            href="/proof/upload"
            className="ml-auto bg-surface border border-border text-muted px-5 py-2.5 rounded font-mono text-xs hover:border-accent/40 hover:text-accent transition-colors"
          >
            + Upload Proof
          </Link>
        </div>

        {/* How it works steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { n: "01", t: "Pick a workflow",       d: "Browse by category, difficulty, or VRAM" },
            { n: "02", t: "Select hardware profile", d: "8GB / 12GB / 16GB / 24GB — settings auto-adjust" },
            { n: "03", t: "Configure parameters",   d: "Set prompt, LoRA, motion scale, and more" },
            { n: "04", t: "Export & run",           d: "Download customized ComfyUI JSON" },
          ].map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-xl p-5">
              <div className="font-syne font-black text-6xl text-border leading-none mb-2 select-none">
                {s.n}
              </div>
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-1">{s.t}</p>
              <p className="text-xs text-muted leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Search + category filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors w-56"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-lg font-mono text-xs transition-colors border ${
                  category === c
                    ? "bg-accent text-black border-accent"
                    : "bg-card border-border text-muted hover:border-accent/40 hover:text-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="ml-auto font-mono text-xs text-muted">
            {filtered.length} / {WORKFLOWS.length} workflows
          </span>
        </div>
      </div>

      {/* ── WORKFLOW GRID ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-mono text-muted text-sm">No workflows match your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((wf) => {
              const score = vramScore(gpuVram, wf.vram as unknown as number);
              const previewSrc = `/workflow-previews/${wf.id}.svg`;

              return (
                <Link
                  key={wf.id}
                  href={`/workflows/${wf.id}`}
                  className="bg-card border border-border rounded-xl overflow-hidden block hover:-translate-y-0.5 transition-all duration-200 group hover:border-accent/25"
                >
                  {/* ── Preview image ── */}
                  <div className="relative w-full aspect-[4/3] bg-[#080b0f] overflow-hidden">
                    <Image
                      src={previewSrc}
                      alt={`${wf.title} — example output`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                    {/* VRAM badge overlay */}
                    {gpuVram > 0 && (
                      <div
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] border backdrop-blur-sm ${
                          score === "ok"    ? "bg-green-900/80 text-green-400 border-green-400/30"  :
                          score === "tight" ? "bg-amber-900/80 text-amber-400 border-amber-400/30" :
                                             "bg-red-900/80 text-red-400 border-red-400/30"
                        }`}
                      >
                        {score === "ok" ? "✓ Compatible" : score === "tight" ? "⚠ Tight" : "✗ Needs more VRAM"}
                      </div>
                    )}
                    {/* Featured badge */}
                    {wf.featured && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded font-mono text-[10px] bg-amber-900/80 text-amber-400 border border-amber-400/30 backdrop-blur-sm">
                        ★ Featured
                      </div>
                    )}
                  </div>

                  {/* ── Card body ── */}
                  <div className="p-5">
                    {/* Category + VRAM row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${CAT_COLORS[wf.category] ?? "text-muted border-border bg-surface"}`}>
                        {wf.category}
                      </span>
                      <span className="font-mono text-[10px] text-muted">
                        {wf.vram}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-syne text-sm font-bold text-white mb-1 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                      {wf.title}
                    </h3>

                    {/* Model */}
                    <p className="font-mono text-[10px] text-muted mb-2 truncate">
                      {wf.model}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
                      {wf.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {wf.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[wf.difficulty] ?? "text-muted border-border"}`}>
                          {wf.difficulty}
                        </span>
                        {wf.genTime && (
                          <span className="font-mono text-[9px] text-muted">
                            {wf.genTime}
                          </span>
                        )}
                      </div>
                      <a
                        href={`/public/workflows/${wf.id}.json`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[10px] text-accent hover:text-white transition-colors"
                        title="Download JSON"
                      >
                        ↓ JSON
                      </a>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
