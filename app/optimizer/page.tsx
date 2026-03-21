"use client";
import { useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HardwareForm, type HardwareInput } from "@/components/optimizer/HardwareForm";
import { CompatibilityBadge } from "@/components/optimizer/CompatibilityBadge";
import { ScoreBar } from "@/components/optimizer/ScoreBar";
import { FixMyPcButton } from "@/components/optimizer/FixMyPcButton";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const FRONTEND_WORKFLOWS = new Set([
  "ltx-cinematic-chase",
  "flux-portrait-lora",
  "sdxl-concept-batch",
  "animatediff-character-loop",
]);

interface WorkflowScore {
  workflow_id: string;
  title: string;
  score: number;
  band: string;
  band_color: string;
  should_run: boolean;
  primary_risk: string | null;
}

interface OptimizeResult {
  workflow_id: string;
  selected_profile: string;
  recommended_settings: Record<string, unknown>;
  applied_adjustments: { field: string; from: unknown; to: unknown; reason: string }[];
  fix_suggestions: string[];
  expected_behavior: { should_run: boolean; risk_level: string; description: string };
  launch_flags: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  video_generation: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  image_generation: "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  training:         "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  animation:        "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
};

const RISK_COLORS: Record<string, string> = {
  low:      "#10b981",
  medium:   "#f97316",
  high:     "#ef4444",
  critical: "#7f1d1d",
};

export default function OptimizerPage() {
  const [hardware, setHardware] = useState<HardwareInput | null>(null);
  const [scores, setScores] = useState<WorkflowScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<OptimizeResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");

  const runBatchScore = useCallback(async (hw: HardwareInput) => {
    setHardware(hw);
    setLoading(true);
    setError("");
    setSelected(null);
    setOptimized(null);
    try {
      const res = await fetch(`${API_BASE}/api/score/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hardware: hw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to score workflows");
      setScores(data.scores);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cannot connect to backend — make sure Flask is running on port 5000");
    } finally {
      setLoading(false);
    }
  }, []);

  const runOptimize = useCallback(async (workflowId: string) => {
    if (!hardware) return;
    setSelected(workflowId);
    setOptimizing(true);
    setOptimized(null);
    try {
      const res = await fetch(`${API_BASE}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: workflowId,
          hardware,
          priority: hardware.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");
      setOptimized(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  }, [hardware]);

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-b from-surface/50 to-transparent">
          <div className="max-w-7xl mx-auto px-10 pt-10 pb-8">
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">// Workflow Optimizer</p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-3">
              Find the best workflow<br />for your hardware.
            </h1>
            <p className="text-muted max-w-xl leading-relaxed">
              Enter your GPU specs — every workflow gets a compatibility score, optimized settings, and a fix if needed. No guessing.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-10 mt-10">
          <div className="grid grid-cols-[320px_1fr] gap-8 items-start">

            {/* LEFT: Hardware form */}
            <div className="sticky top-24">
              <HardwareForm onSubmit={runBatchScore} loading={loading} />
              {error && (
                <div className="mt-3 bg-[#ef4444]/8 border border-[#ef4444]/20 rounded-lg px-4 py-3">
                  <p className="font-mono text-xs text-[#ef4444] leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            {/* RIGHT: Results */}
            <div>
              {/* Empty state */}
              {!loading && scores.length === 0 && (
                <div className="border border-border border-dashed rounded-2xl p-16 text-center">
                  <div className="font-mono text-4xl mb-4 opacity-20">⚡</div>
                  <p className="font-syne text-lg font-bold text-white mb-2">Enter your hardware to get started</p>
                  <p className="font-mono text-xs text-muted">Select your GPU and click Score All Workflows</p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-3 bg-border rounded w-1/3 mb-4" />
                      <div className="h-5 bg-border rounded w-2/3 mb-2" />
                      <div className="h-3 bg-border rounded w-1/2 mb-6" />
                      <div className="h-2 bg-border rounded w-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Scores grid */}
              {!loading && scores.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <p className="font-mono text-xs text-muted tracking-widest uppercase">
                      {scores.length} workflows scored for <span className="text-accent">{hardware?.gpu_name}</span>
                    </p>
                    <p className="font-mono text-xs text-muted">
                      {scores.filter(s => s.should_run).length} can run · {scores.filter(s => !s.should_run).length} need upgrades
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {scores.map(wf => (
                      <div
                        key={wf.workflow_id}
                        className={`bg-card border rounded-xl p-5 transition-all duration-200 cursor-pointer ${
                          selected === wf.workflow_id
                            ? "border-accent/40 bg-accent/3"
                            : "border-border hover:border-accent/20 hover:-translate-y-0.5"
                        } ${!wf.should_run ? "opacity-75" : ""}`}
                        onClick={() => runOptimize(wf.workflow_id)}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-4">
                          <CompatibilityBadge
                            score={wf.score}
                            band={wf.band}
                            bandColor={wf.band_color}
                          />
                          {!wf.should_run && (
                            <span className="font-mono text-xs bg-[#ef4444]/10 text-[#ef4444] px-2 py-0.5 rounded tracking-wide">
                              Below min
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-syne text-sm font-bold text-white mb-2 leading-snug">{wf.title}</h3>

                        {/* Score bar */}
                        <ScoreBar score={wf.score} bandColor={wf.band_color} />

                        {/* Risk */}
                        {wf.primary_risk && (
                          <p className="font-mono text-xs text-muted mt-3 leading-relaxed line-clamp-2 opacity-70">
                            ⚠ {wf.primary_risk}
                          </p>
                        )}

                        {/* CTA */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <button
                            onClick={e => { e.stopPropagation(); runOptimize(wf.workflow_id); }}
                            className="flex-1 bg-accent/10 text-accent border border-accent/20 py-2 rounded font-mono text-xs tracking-widest uppercase hover:bg-accent/15 transition-colors"
                          >
                            {selected === wf.workflow_id && optimizing ? "Optimizing..." : "Optimize →"}
                          </button>
                          {hardware && (
                            <div onClick={e => e.stopPropagation()} className="flex-1">
                              <FixMyPcButton
                                workflowId={wf.workflow_id}
                                hardware={hardware}
                                apiBase={API_BASE}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Optimization result panel */}
                  {selected && optimized && (
                    <div className="bg-card border border-accent/20 rounded-2xl overflow-hidden">
                      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-1">Optimization Result</p>
                          <h3 className="font-syne text-base font-bold text-white">{selected}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs px-3 py-1 rounded-full tracking-widest uppercase`}
                            style={{
                              backgroundColor: `${RISK_COLORS[optimized.expected_behavior.risk_level]}18`,
                              color: RISK_COLORS[optimized.expected_behavior.risk_level],
                              border: `1px solid ${RISK_COLORS[optimized.expected_behavior.risk_level]}30`,
                            }}>
                            {optimized.expected_behavior.risk_level} risk
                          </span>
                          <span className="font-mono text-xs bg-white/5 text-muted px-3 py-1 rounded-full">
                            {optimized.selected_profile} profile
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-0 divide-x divide-border">
                        {/* Settings */}
                        <div className="p-5">
                          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Optimized Settings</p>
                          <div className="space-y-2 font-mono text-xs">
                            {Object.entries(optimized.recommended_settings)
                              .filter(([, v]) => v !== null)
                              .map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                  <span className="text-muted capitalize">{k.replace(/_/g, " ")}</span>
                                  <span className="text-white font-medium">{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Changes applied */}
                        <div className="p-5">
                          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
                            Changes Applied ({optimized.applied_adjustments.length})
                          </p>
                          {optimized.applied_adjustments.length === 0 ? (
                            <p className="font-mono text-xs text-[#10b981]">✓ No changes needed — hardware is optimal</p>
                          ) : (
                            <div className="space-y-3">
                              {optimized.applied_adjustments.map((adj, i) => (
                                <div key={i} className="bg-surface border border-border rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-muted line-through">{String(adj.from)}</span>
                                    <span className="text-accent text-xs">→</span>
                                    <span className="font-mono text-xs text-white font-medium">{String(adj.to)}</span>
                                  </div>
                                  <p className="font-mono text-xs text-muted leading-relaxed">{adj.reason}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Launch + tips */}
                        <div className="p-5">
                          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Launch</p>
                          <div className="bg-[#0d1117] border border-border rounded-lg px-3 py-2 font-mono text-xs text-accent mb-4 flex items-center gap-2">
                            <span className="text-muted">$</span>
                            <span>python main.py {optimized.launch_flags}</span>
                          </div>
                          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">Tips</p>
                          {optimized.fix_suggestions.length === 0 ? (
                            <p className="font-mono text-xs text-[#10b981]">✓ No extra steps needed</p>
                          ) : (
                            <ul className="space-y-2">
                              {optimized.fix_suggestions.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 font-mono text-xs text-muted">
                                  <span className="text-accent flex-shrink-0 mt-0.5">→</span> {tip}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-5 pt-5 border-t border-border">
                            <p className="font-mono text-xs text-muted mb-2 leading-relaxed">
                              {optimized.expected_behavior.description}
                            </p>
                            {FRONTEND_WORKFLOWS.has(selected || "") ? (
                              <Link
                                href={`/workflows/${selected}`}
                                className="block text-center bg-accent text-black py-2.5 rounded font-semibold text-xs hover:opacity-85 transition-opacity"
                              >
                                Open Workflow Configurator →
                              </Link>
                            ) : (
                              <p className="font-mono text-xs text-muted text-center">Configurator coming soon</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
