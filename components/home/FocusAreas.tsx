"use client";
import { useEffect, useRef } from "react";

const AREAS = [
  { icon: "🧠", title: "AI Model Training", desc: "End-to-end training guides for image, video, and language models with hardware-tuned configs.", tag: "Training" },
  { icon: "🔧", title: "LoRA Creation", desc: "Build style, character, and concept LoRAs from scratch. Dreambooth, Kohya, and custom pipelines.", tag: "Fine-tuning" },
  { icon: "⚡", title: "Workflow Pipelines", desc: "ComfyUI node graphs, AnimateDiff chains, LTX Video flows — shareable and version-controlled.", tag: "ComfyUI" },
  { icon: "🗃️", title: "Dataset Tooling", desc: "Curate, caption, tag, and structure training datasets for maximum model quality.", tag: "Datasets" },
  { icon: "📦", title: "Tooling & Scripts", desc: "Open-source utilities for batch inference, VRAM optimization, model merging, and quantization.", tag: "Utilities" },
  { icon: "🚀", title: "Optimization & Deploy", desc: "GGUF, ONNX, TensorRT conversions. Serve models locally or in the cloud at scale.", tag: "Deployment" },
];

export function FocusAreas() {
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
      <p className="reveal font-mono text-xs text-accent tracking-widest uppercase mb-4">// Focus Areas</p>
      <h2 className="reveal font-syne text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-tight mb-4">
        Everything you need to go<br />from 0 to deployed.
      </h2>
      <p className="reveal text-muted max-w-lg leading-relaxed font-light mb-16">
        From dataset curation to model optimization — every layer of the AI stack, documented and ready.
      </p>
      <div className="reveal grid grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {AREAS.map((area) => (
          <div key={area.title} className="bg-card p-9 group hover:bg-[#151e2d] transition-colors relative overflow-hidden cursor-default">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-2xl block mb-4">{area.icon}</span>
            <h3 className="font-syne text-sm font-bold text-white mb-2">{area.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{area.desc}</p>
            <span className="inline-block mt-4 font-mono text-xs text-accent bg-accent/7 px-2.5 py-1 rounded-sm tracking-widest uppercase">
              {area.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
