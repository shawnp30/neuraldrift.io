"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const WORKFLOWS = [
  { id: "ltx-cinematic-chase", title: "LTX Cinematic Chase Sequence", category: "Video", difficulty: "Advanced", vram: "12GB+", desc: "Hollywood-style chase clips for Shorts. Consistent motion, camera lock, 97 frames.", tags: ["LTX2", "Action", "Vertical"] },
  { id: "sdxl-concept-batch", title: "SDXL Concept Batch Generator", category: "Image", difficulty: "Beginner", vram: "6GB+", desc: "8 concept art variations per run. Fast iteration for character and environment design.", tags: ["SDXL", "Batch", "Concept Art"] },
  { id: "flux-portrait-lora", title: "FLUX Portrait + LoRA", category: "Image", difficulty: "Intermediate", vram: "10GB+", desc: "High-fidelity portraits with LoRA injection. Face detailing pass, consistent character output.", tags: ["FLUX", "Portrait", "LoRA"] },
  { id: "animatediff-character-loop", title: "AnimateDiff Character Loop", category: "Animation", difficulty: "Intermediate", vram: "8GB+", desc: "Seamless 24-frame loops for Instagram Reels. LoRA character injection compatible.", tags: ["AnimateDiff", "Loop", "Character"] },
];

const CAT_STYLES: Record<string, string> = {
  Video: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Image: "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  Animation: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  Training: "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
};
const DIFF_STYLES: Record<string, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

export function WorkflowsPreview() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="reveal flex items-end justify-between mb-12">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Workflow Library</p>
          <h2 className="font-syne text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight mb-3 leading-tight">
            Pick a workflow.<br />Configure for your GPU. Export.
          </h2>
          <p className="text-muted max-w-xl leading-relaxed">
            Each workflow has 4 hardware profiles, configurable parameters, and exports as a ready-to-run ComfyUI JSON. No node setup. No manual settings.
          </p>
        </div>
        <Link href="/workflows" className="flex-shrink-0 font-mono text-xs text-accent border border-accent/20 px-5 py-2.5 rounded hover:bg-accent/8 transition-colors tracking-widest uppercase">
          All Workflows →
        </Link>
      </div>

      <div className="reveal grid grid-cols-2 gap-5 mb-10">
        {WORKFLOWS.map(wf => (
          <Link key={wf.id} href={`/workflows/${wf.id}`}
            className="bg-card border border-border rounded-xl p-7 hover:border-accent/25 hover:-translate-y-0.5 transition-all duration-200 group block">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-2">
                <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${CAT_STYLES[wf.category]}`}>{wf.category}</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[wf.difficulty]}`}>{wf.difficulty}</span>
              </div>
              <span className="font-mono text-xs text-muted">{wf.vram}</span>
            </div>
            <h3 className="font-syne text-base font-bold text-white mb-2 group-hover:text-accent transition-colors">{wf.title}</h3>
            <p className="font-mono text-xs text-muted leading-relaxed mb-4">{wf.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {wf.tags.map(t => <span key={t} className="font-mono text-xs bg-white/4 text-muted px-2 py-0.5 rounded">{t}</span>)}
            </div>
          </Link>
        ))}
      </div>

      {/* How export works */}
      <div className="reveal bg-card border border-border rounded-2xl p-8">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-6">// How the Export System Works</p>
        <div className="grid grid-cols-5 gap-4 items-center">
          {[
            { step: "1", label: "Select workflow", detail: "Browse by category, VRAM, or difficulty" },
            { step: "2", label: "Choose GPU tier", detail: "8 / 12 / 16 / 24GB — settings auto-adjust" },
            { step: "3", label: "Set parameters", detail: "Prompt, LoRA, steps, seed — all configurable" },
            { step: "4", label: "Export JSON", detail: "Real ComfyUI node graph with your settings baked in" },
            { step: "5", label: "Load & generate", detail: "Drag into ComfyUI and queue — no further setup" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-start gap-3">
              {i > 0 && <div className="hidden" />}
              <div className="text-center w-full">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs flex items-center justify-center mx-auto mb-2">{s.step}</div>
                <div className="font-syne text-xs font-bold text-white mb-1">{s.label}</div>
                <div className="font-mono text-xs text-muted leading-relaxed">{s.detail}</div>
              </div>
              {i < 4 && <div className="text-accent/30 text-sm mt-2 flex-shrink-0 self-start pt-2">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
