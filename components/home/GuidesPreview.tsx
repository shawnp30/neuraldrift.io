"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

const GUIDES = [
  { slug: "comfyui-deployment-guide", difficulty: "Intermediate", title: "ComfyUI Deployment Guide: Local to Production", desc: "Master the full lifecycle of ComfyUI deployment from local setup to cloud APIs.", time: "18 min", tag: "Deployment" },
  { slug: "ai-workflow-setup-guide", difficulty: "Advanced", title: "AI Workflow Setup Guide: Node Architectures", desc: "Build scalable, modular AI architectures in ComfyUI for production systems.", time: "22 min", tag: "Workflows" },
  { slug: "comfyui-complete-setup", difficulty: "Beginner", title: "ComfyUI Complete Setup: RTX 5080 Edition", desc: "Install, configure, and benchmark your first ComfyUI workflow with optimal VRAM settings.", time: "12 min", tag: "Image Gen" },
  { slug: "train-flux-lora", difficulty: "Intermediate", title: "Train Your First FLUX LoRA in Under 6 Hours", desc: "Dataset prep, Kohya config, training loop, and quality evaluation from scratch.", time: "28 min", tag: "LoRA Training" },
  { slug: "ltx-video-cinematic-action", difficulty: "Advanced", title: "LTX Video 2.3: Cinematic Action Sequences", desc: "Build chase and action scenes with consistent motion, camera lock, and temporal coherence.", time: "35 min", tag: "Video Gen" },
  { slug: "ai_article_with_images", difficulty: "Advanced", title: "The State of Generative AI: From Legacy to Spatial Control", desc: "Deep dive into generative AI architectures and the shift towards spatial control.", time: "15 min", tag: "Guide" },
];

const DIFF_STYLES: Record<string, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

export function GuidesPreview() {
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
      <p className="reveal font-mono text-xs text-accent tracking-widest uppercase mb-4">{"// Latest Guides"}</p>
      <h2 className="reveal font-syne text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-tight mb-12">
        Start with the essentials.
      </h2>
      <div className="reveal grid grid-cols-3 gap-5">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="bg-card border border-border rounded-lg p-7 block hover:-translate-y-1 hover:border-accent/30 transition-all duration-200"
          >
            <span className={`inline-block font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase mb-4 ${DIFF_STYLES[guide.difficulty]}`}>
              {guide.difficulty}
            </span>
            <h4 className="font-syne text-sm font-bold text-white mb-2 leading-snug">{guide.title}</h4>
            <p className="text-xs text-muted leading-relaxed">{guide.desc}</p>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border font-mono text-xs text-muted tracking-wide">
              <span>⏱ {guide.time}</span>
              <span>·</span>
              <span>{guide.tag}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
