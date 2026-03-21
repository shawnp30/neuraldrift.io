"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function OptimizerFeature() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  const SCORES = [
    { name: "SDXL Concept Batch", score: 98, band: "Excellent", color: "#10b981", canRun: true },
    { name: "Z-Image Turbo", score: 98, band: "Excellent", color: "#10b981", canRun: true },
    { name: "FLUX Portrait + LoRA", score: 93, band: "Excellent", color: "#10b981", canRun: true },
    { name: "AnimateDiff Character Loop", score: 87, band: "Good", color: "#00e5ff", canRun: true },
    { name: "LTX Cinematic Chase", score: 85, band: "Good", color: "#00e5ff", canRun: true },
    { name: "FLUX LoRA Training", score: 42, band: "Risky", color: "#ef4444", canRun: false },
  ];

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="reveal relative bg-gradient-to-br from-accent/5 via-surface to-accent-purple/5 border border-border rounded-3xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.06),transparent_70%)] pointer-events-none" />

        <div className="grid grid-cols-2 gap-0">
          {/* Left: explanation */}
          <div className="p-14 border-r border-border">
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// The Optimizer</p>
            <h2 className="font-syne text-4xl font-black tracking-tight text-white mb-5 leading-tight">
              Know before you run.<br />Every time.
            </h2>
            <p className="text-muted leading-relaxed mb-5">
              The Optimizer is the engine behind NeuralHub. Tell it your GPU — it scores every workflow on a 100-point scale across VRAM fit, RAM, task suitability, and stability headroom.
            </p>
            <p className="text-muted leading-relaxed mb-8">
              Every score comes with the exact settings optimized for your hardware. Every failure comes with a specific fix — not a generic error message, but the exact changes to make it work.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: "Quality", desc: "Best possible output for your GPU" },
                { label: "Balanced", desc: "Quality meets stability" },
                { label: "Reliability", desc: "Never crashes, conservative settings" },
              ].map(p => (
                <div key={p.label} className="bg-surface border border-border rounded-xl p-4 text-center">
                  <div className="font-syne text-sm font-bold text-white mb-1">{p.label}</div>
                  <div className="font-mono text-xs text-muted leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>

            <Link href="/optimizer"
              className="inline-block bg-accent text-black px-8 py-3.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
              Score My Hardware Free →
            </Link>
          </div>

          {/* Right: simulated scores */}
          <div className="p-10">
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono text-xs text-muted tracking-widest uppercase">RTX 5080 (16GB) — All Workflows</p>
              <span className="font-mono text-xs bg-[#10b981]/10 text-[#10b981] px-2 py-1 rounded">5 can run · 1 needs fix</span>
            </div>

            <div className="space-y-3">
              {SCORES.map(wf => (
                <div key={wf.name} className={`bg-surface border rounded-xl px-4 py-3.5 flex items-center gap-4 ${!wf.canRun ? "border-[#ef4444]/20 opacity-80" : "border-border"}`}>
                  {/* Circle score */}
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke={wf.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${(wf.score / 100) * 100.5} 100.5`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold" style={{ color: wf.color }}>
                      {wf.score}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-syne text-xs font-bold text-white mb-1 truncate">{wf.name}</div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${wf.score}%`, backgroundColor: wf.color, boxShadow: `0 0 6px ${wf.color}60` }} />
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono text-xs" style={{ color: wf.color }}>{wf.band}</div>
                    <div className={`font-mono text-xs mt-0.5 ${wf.canRun ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                      {wf.canRun ? "✓ Run now" : "✗ Fix needed"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-border">
              <p className="font-mono text-xs text-muted text-center">Scores update live when you change your GPU selection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
