"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function OptimizerFeature() {
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

  const SCORES = [
    {
      name: "SDXL Concept Batch",
      score: 98,
      band: "Excellent",
      color: "#10b981",
      canRun: true,
    },
    {
      name: "Z-Image Turbo",
      score: 98,
      band: "Excellent",
      color: "#10b981",
      canRun: true,
    },
    {
      name: "FLUX Portrait + LoRA",
      score: 93,
      band: "Excellent",
      color: "#10b981",
      canRun: true,
    },
    {
      name: "AnimateDiff Character Loop",
      score: 87,
      band: "Good",
      color: "#00e5ff",
      canRun: true,
    },
    {
      name: "LTX Cinematic Chase",
      score: 85,
      band: "Good",
      color: "#00e5ff",
      canRun: true,
    },
    {
      name: "FLUX LoRA Training",
      score: 42,
      band: "Risky",
      color: "#ef4444",
      canRun: false,
    },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-10 py-24">
      <div className="reveal relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/5 via-surface to-accent-purple/5">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(0,229,255,0.06),transparent_70%)]" />

        <div className="grid grid-cols-2 gap-0">
          {/* Left: explanation */}
          <div className="border-r border-border p-14">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
              // The Optimizer
            </p>
            <h2 className="mb-5 font-syne text-4xl font-black leading-tight tracking-tight text-white">
              Know before you run.
              <br />
              Every time.
            </h2>
            <p className="mb-5 leading-relaxed text-muted">
              The Optimizer is the engine behind neuraldrift.io. Tell it your
              GPU — it scores every workflow on a 100-point scale across VRAM
              fit, RAM, task suitability, and stability headroom.
            </p>
            <p className="mb-8 leading-relaxed text-muted">
              Every score comes with the exact settings optimized for your
              hardware. Every failure comes with a specific fix — not a generic
              error message, but the exact changes to make it work.
            </p>

            <div className="mb-8 grid grid-cols-3 gap-3">
              {[
                { label: "Quality", desc: "Best possible output for your GPU" },
                { label: "Balanced", desc: "Quality meets stability" },
                {
                  label: "Reliability",
                  desc: "Never crashes, conservative settings",
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className="rounded-xl border border-border bg-surface p-4 text-center"
                >
                  <div className="mb-1 font-syne text-sm font-bold text-white">
                    {p.label}
                  </div>
                  <div className="font-mono text-xs leading-relaxed text-muted">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/optimizer"
              className="inline-block rounded bg-accent px-8 py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-85"
            >
              Score My Hardware Free →
            </Link>
          </div>

          {/* Right: simulated scores */}
          <div className="p-10">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                RTX 5080 (16GB) — All Workflows
              </p>
              <span className="rounded bg-[#10b981]/10 px-2 py-1 font-mono text-xs text-[#10b981]">
                5 can run · 1 needs fix
              </span>
            </div>

            <div className="space-y-3">
              {SCORES.map((wf) => (
                <div
                  key={wf.name}
                  className={`flex items-center gap-4 rounded-xl border bg-surface px-4 py-3.5 ${!wf.canRun ? "border-[#ef4444]/20 opacity-80" : "border-border"}`}
                >
                  {/* Circle score */}
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <svg
                      viewBox="0 0 40 40"
                      className="h-full w-full -rotate-90"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke={wf.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${(wf.score / 100) * 100.5} 100.5`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold"
                      style={{ color: wf.color }}
                    >
                      {wf.score}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 truncate font-syne text-xs font-bold text-white">
                      {wf.name}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${wf.score}%`,
                          backgroundColor: wf.color,
                          boxShadow: `0 0 6px ${wf.color}60`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div
                      className="font-mono text-xs"
                      style={{ color: wf.color }}
                    >
                      {wf.band}
                    </div>
                    <div
                      className={`mt-0.5 font-mono text-xs ${wf.canRun ? "text-[#10b981]" : "text-[#ef4444]"}`}
                    >
                      {wf.canRun ? "✓ Run now" : "✗ Fix needed"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <p className="text-center font-mono text-xs text-muted">
                Scores update live when you change your GPU selection
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
