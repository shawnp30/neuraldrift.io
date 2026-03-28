"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, FileText, ArrowRight, DollarSign, Workflow, Clock, Filter } from "lucide-react";

import { DynamicCTA } from "@/components/DynamicCTA";

const CATEGORIES = ["All", "Beginner", "Masterclass", "Technical Guide", "Creative", "Advanced"] as const;

const VIDEOS = [
  {
    id: "v=Xv3H1zH8D7k",
    videoId: "AbBcfjIYhTg",
    title: "ComfyUI Beginner Guide",
    duration: "25:10",
    category: "Masterclass",
    description: "Deep dive into setup and basic node architecture by Olivio Sarikas. Perfect for those looking to understand the core engine before scaling."
  },
  {
    id: "v=Y9n3H2x4C1p",
    videoId: "2XN2J3T-BFA",
    title: "ComfyUI Advanced Latent Workflows",
    duration: "34:20",
    category: "Technical Guide",
    description: "Learn how to push the boundaries of Latent noise injection and node manipulation from Latent Vision."
  },
  {
    id: "v=23VkGD4uwk",
    videoId: "23VkGD-4uwk",
    title: "ComfyUI for Beginners — Full Guide",
    duration: "39:00",
    category: "Beginner",
    description: "Sebastian Kamph walks through everything from installation to your first image generation. Covers nodes, connections, color-coding, Text2Image, and key sampler parameters."
  },
  {
    id: "v=HkoRkNLWQzY",
    videoId: "HkoRkNLWQzY",
    title: "ComfyUI Full Course — From Scratch",
    duration: "5:00:00",
    category: "Masterclass",
    description: "A comprehensive 5-hour course taking you from zero to proficient. Covers every major node type, workflow patterns, model management, and advanced techniques."
  },
  {
    id: "v=Zko_s2LO9Wo",
    videoId: "Zko_s2LO9Wo",
    title: "ComfyUI Introduction & Installation",
    duration: "15:00",
    category: "Beginner",
    description: "Quick-start guide covering ComfyUI installation, initial configuration, and your first text-to-image workflow. Ideal if you want to get up and running fast."
  },
  {
    id: "v=aW1U8QEak0",
    videoId: "-aW1U8QEak0",
    title: "FLUX LoRA Explained — Best Settings & New UI",
    duration: "18:00",
    category: "Technical Guide",
    description: "Deep dive into FLUX LoRA models — how to load them, optimal settings for quality vs speed, and navigating the updated ComfyUI interface for LoRA workflows."
  },
  {
    id: "v=WHuhxKk40k4",
    videoId: "WHuhxKk40k4",
    title: "How to Use FLUX ControlNet Union Pro",
    duration: "20:00",
    category: "Technical Guide",
    description: "Master ControlNet Union Pro for FLUX — learn to combine multiple conditioning types (canny, depth, pose) in a single unified workflow for precise image control."
  },
  {
    id: "v=KinUqRWG8q4",
    videoId: "KinUqRWG8q4",
    title: "IPAdapter & LoRA for FLUX — Full Setup",
    duration: "22:00",
    category: "Technical Guide",
    description: "Complete installation and usage tutorial for IPAdapter and LoRA with FLUX models. Covers model downloads, node setup, and combining style transfer with fine-tuned weights."
  },
  {
    id: "v=o7sCHUJNkJI",
    videoId: "o7sCHUJNkJI",
    title: "Install & Use FLUX Tools: Fill, Redux, Depth, Canny",
    duration: "19:00",
    category: "Technical Guide",
    description: "Walkthrough of the FLUX Tools suite — Fill for inpainting, Redux for image variations, and Depth/Canny for structural control. Practical workflows included."
  },
  {
    id: "v=9onDeEWWvU",
    videoId: "9-onDeEWWvU",
    title: "Master FLUX Kontext — Inpainting & Consistency",
    duration: "16:00",
    category: "Advanced",
    description: "Advanced techniques for FLUX Kontext including precision inpainting, multi-subject editing, and maintaining character consistency across generations."
  },
  {
    id: "v=YOGDSdLW0rg",
    videoId: "YOGDSdLW0rg",
    title: "Sketch to Image with SDXL or FLUX",
    duration: "14:00",
    category: "Creative",
    description: "Turn rough sketches into polished AI art using ControlNet sketch conditioning. Works with both SDXL and FLUX pipelines — great for concept artists and designers."
  },
  {
    id: "v=ddYbhv3WgWw",
    videoId: "ddYbhv3WgWw",
    title: "Animations with IPAdapter & ComfyUI",
    duration: "18:00",
    category: "Creative",
    description: "Create smooth AI animations using IPAdapter for style-consistent frame generation. Covers AnimateDiff integration, keyframe control, and export workflows."
  }
];

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredVideos = activeCategory === "All"
    ? VIDEOS
    : VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-24 font-sans selection:bg-indigo-500/30">

      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] text-indigo-400">
          <PlayCircle className="w-8 h-8" />
        </div>
        <p className="text-indigo-400 font-[800] tracking-widest uppercase text-sm mb-4">Neuraldrift Academy</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Academy <span className="text-indigo-400">Masterclass.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Premium video-led education for mastering generative AI, workflow architecture, and monetization strategies.
          Looking for technical documentation? <Link href="/guides" className="text-indigo-400 hover:underline">Browse our Guides →</Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">

        {/* ── VIDEO TUTORIALS ── */}
        <section>
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
            <h2 className="text-2xl md:text-3xl font-[800] text-white flex items-center gap-3">
              <PlayCircle className="w-7 h-7 text-indigo-400" /> Premium Video Suite
            </h2>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-[800] tracking-widest uppercase rounded-full border border-indigo-500/20">
              {filteredVideos.length} Videos
            </span>
          </div>

          {/* ── CATEGORY FILTERS ── */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <Filter className="w-4 h-4 text-zinc-500 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-[700] tracking-wider uppercase rounded-full border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    : "bg-white/[0.02] text-zinc-500 border-white/5 hover:text-zinc-300 hover:border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {filteredVideos.map((video, idx) => (
              <div key={video.id} className="group relative bg-[#0f172a]/50 border border-indigo-500/20 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] flex flex-col">

                {/* 16:9 YouTube Embed Wrapper */}
                <div className="relative w-full pt-[56.25%] bg-black">
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-[800] tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {video.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-[600] text-zinc-500">
                      <Clock className="w-4 h-4" /> {video.duration}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-[800] text-white mb-3 group-hover:text-indigo-300 transition-colors">{video.title}</h3>
                  <p className="text-sm font-[500] text-zinc-400 leading-relaxed mb-6 flex-1">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── GUIDES CTA ── */}
        <div className="mt-20">
          <DynamicCTA
            title="Download Professional Workflows."
            description="Our technical guide library is only the beginning. Visit the Architecture Library to download verified JSON files directly into your local ComfyUI environment."
            ctaText="BROWSE WORKFLOWS"
            ctaHref="/workflows"
            variant="cyan"
            tag="// Architecture Library"
          />
        </div>

      </div>
    </div>
  );
}
