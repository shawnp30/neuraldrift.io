"use client";
import { useEffect, useRef } from "react";

const STEPS = [
  { icon: "✍️", name: "Prompt", sub: "Scene Design" },
  { icon: "⚙️", name: "ComfyUI", sub: "Workflow" },
  { icon: "🎬", name: "LTX Video", sub: "Generation" },
  { icon: "🎞️", name: "CapCut", sub: "Edit + Hook" },
  { icon: "📱", name: "Publish", sub: "Shorts / TikTok" },
];

export function PipelineVisual() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <p className="reveal font-mono text-xs text-accent tracking-widest uppercase mb-4">// Video Pipeline</p>
      <h2 className="reveal font-syne text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-tight mb-12">
        From prompt to publish<br />in under 15 seconds.
      </h2>
      <div className="reveal bg-gradient-to-br from-accent/3 to-accent-purple/3 border border-border rounded-lg p-12">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step.name} className="flex items-center gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
                  {step.icon}
                </div>
                <div className="font-syne text-sm font-bold text-white">{step.name}</div>
                <div className="font-mono text-xs text-muted mt-1 tracking-wide">{step.sub}</div>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-accent/40 text-xl font-light mb-6">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
