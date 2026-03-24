import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Difficulty } from "@/types";

export const metadata = { title: "Guides" };

const DIFF_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

const GUIDES = [
  { slug: "comfyui-complete-setup", difficulty: "Beginner" as Difficulty, title: "ComfyUI Complete Setup: RTX 5080 Edition", desc: "Install, configure, and benchmark your first ComfyUI workflow.", time: "12 min", tag: "Image Gen" },
  { slug: "train-flux-lora", difficulty: "Intermediate" as Difficulty, title: "Train Your First FLUX LoRA in Under 6 Hours", desc: "Dataset prep, Kohya config, training loop, and evaluation.", time: "28 min", tag: "LoRA Training" },
  { slug: "ltx-video-cinematic-action", difficulty: "Advanced" as Difficulty, title: "LTX Video 2.3: Cinematic Action Sequences", desc: "Build chase and action scenes with consistent motion and camera lock.", time: "35 min", tag: "Video Gen" },
  { slug: "dataset-curation-captioning", difficulty: "Beginner" as Difficulty, title: "Dataset Curation: Captioning at Scale", desc: "Auto-caption 1000+ images with WD14 tagger.", time: "15 min", tag: "Datasets" },
  { slug: "animatediff-character-consistency", difficulty: "Intermediate" as Difficulty, title: "AnimateDiff + LoRA Character Consistency", desc: "Lock a character across frames with motion modules.", time: "22 min", tag: "Animation" },
  { slug: "multi-gpu-inference", difficulty: "Advanced" as Difficulty, title: "Multi-GPU Inference: 3x Speed, Same VRAM", desc: "Route compute across multiple GPUs for parallel batch inference.", time: "40 min", tag: "Optimization" },
];

export default function GuidesPage() {
  return (
    <>

      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// All Guides</p>
        <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">Build Smarter.</h1>
        <p className="text-muted max-w-lg leading-relaxed mb-16">Practical, hardware-tested guides for every stage of the AI workflow stack.</p>
        <div className="grid grid-cols-3 gap-5">
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="bg-card border border-border rounded-lg p-7 block hover:-translate-y-1 hover:border-accent/30 transition-all duration-200">
              <span className={`inline-block font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase mb-4 ${DIFF_STYLES[guide.difficulty]}`}>{guide.difficulty}</span>
              <h4 className="font-syne text-sm font-bold text-white mb-2 leading-snug">{guide.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{guide.desc}</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border font-mono text-xs text-muted tracking-wide">
                <span>⏱ {guide.time}</span><span>·</span><span>{guide.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
