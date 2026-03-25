import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar"; 
import { Footer } from "@/components/layout/Footer";
import type { Difficulty } from "@/types";

export const metadata = { title: "Guides" };

const DIFF_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

const GUIDES = [
  { slug: "comfyui-complete-setup", difficulty: "Beginner" as Difficulty, title: "ComfyUI Complete Setup", desc: "Install, configure, and benchmark your first ComfyUI workflow.", time: "12 min", tag: "Image Gen", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" },
  { slug: "custom-nodes", difficulty: "Intermediate" as Difficulty, title: "How to Install, Update, and Fix Custom Nodes", desc: "Master custom node management and troubleshooting", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
  { slug: "gpu-errors", difficulty: "Intermediate" as Difficulty, title: "Fixing GPU Errors", desc: "Solve CUDA not available, out of memory, and GPU detection issues", time: "8 min", tag: "Guide", image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2070&auto=format&fit=crop" },
  { slug: "installation", difficulty: "Beginner" as Difficulty, title: "How to Install ComfyUI Correctly", desc: "Complete installation guide for ComfyUI. Portable and Desktop methods.", time: "15 min", tag: "Guide", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" },
  { slug: "ltx-video-cinematic-action", difficulty: "Advanced" as Difficulty, title: "LTX Video 2.3: Cinematic Action Sequences", desc: "Build chase scenes with consistent motion and camera lock.", time: "35 min", tag: "Video Gen", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" },
  { slug: "model-folders", difficulty: "Beginner" as Difficulty, title: "Where Every Model File Goes", desc: "Complete folder structure for checkpoints, LoRAs, VAEs, and ControlNet", time: "6 min", tag: "Guide", image: "https://images.unsplash.com/photo-1544391682-17173b392231?q=80&w=2070&auto=format&fit=crop" },
  { slug: "model-types", difficulty: "Intermediate" as Difficulty, title: "Stable Diffusion Model Types Explained", desc: "SD1.5 vs SDXL vs LCM vs Turbo vs Flux - which should you use?", time: "10 min", tag: "Guide", image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop" },
  { slug: "performance-optimization", difficulty: "Intermediate" as Difficulty, title: "How to Optimize Performance on Any GPU", desc: "GPU-tier specific optimization for 4GB to 24GB+ VRAM.", time: "12 min", tag: "Guide", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2068&auto=format&fit=crop" },
  { slug: "portable-vs-desktop", difficulty: "Beginner" as Difficulty, title: "Portable vs Desktop: Which Should You Choose?", desc: "Complete decision guide for installation methods", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop" },
  { slug: "train-flux-lora", difficulty: "Intermediate" as Difficulty, title: "Train Your First FLUX LoRA in Under 6 Hours", desc: "Dataset prep, Kohya config, training loop, and evaluation.", time: "28 min", tag: "LoRA Training", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" },
  { slug: "why-choose-desktop", difficulty: "Advanced" as Difficulty, title: "Why Choose ComfyUI Desktop Install", desc: "Deep dive into the power-user installation", time: "7 min", tag: "Guide", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" },
  { slug: "why-choose-portable", difficulty: "Beginner" as Difficulty, title: "Why Choose ComfyUI Portable Version", desc: "Deep dive into the beginner-friendly installation", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop" },
  { slug: "workflow-errors", difficulty: "Beginner" as Difficulty, title: "Understanding and Fixing Workflow Errors", desc: "Solve node not found, black images, and type mismatches", time: "10 min", tag: "Guide", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" }
];

export default function GuidesPage() {
  return (
    <>

      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// All Guides</p>
        <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">Knowledge Base.</h1>
        <p className="text-muted max-w-lg leading-relaxed mb-16">
          Practical, hardware-tested technical documentation for every stage of the AI stack. 
          Looking for video masterclasses? <Link href="/tutorials" className="text-accent hover:underline">Visit the Academy →</Link>
        </p>
        <div className="grid grid-cols-3 gap-5">
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="bg-card border border-border rounded-xl overflow-hidden block hover:-translate-y-1 hover:border-accent/30 transition-all duration-300 shadow-lg group">
              <div className="aspect-[16/9] relative overflow-hidden bg-black/50 border-b border-border">
                <img 
                  src={guide.image} 
                  alt={guide.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-7">
                <span className={`inline-block font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase mb-4 ${DIFF_STYLES[guide.difficulty]}`}>{guide.difficulty}</span>
                <h4 className="font-syne text-lg font-bold text-white mb-2 leading-snug group-hover:text-accent transition-colors">{guide.title}</h4>
                <p className="text-sm text-muted leading-relaxed">{guide.desc}</p>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border font-mono text-xs text-muted tracking-wide">
                  <div className="flex items-center gap-3">
                    <span>⏱ {guide.time}</span><span>·</span><span>{guide.tag}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── ACADEMY CTA ── */}
        <section className="mt-32 bg-accent/5 border border-accent/10 rounded-[2rem] p-10 md:p-16 text-center">
          <h2 className="font-syne text-3xl font-black text-white mb-4">Ready for the Masterclass?</h2>
          <p className="text-muted max-w-xl mx-auto mb-10 text-lg">
            Our Academy features premium video-led education on high-level workflow architecture and monetization strategies.
          </p>
          <Link 
            href="/tutorials"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-light text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-accent/20"
          >
            Enter the Academy <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
