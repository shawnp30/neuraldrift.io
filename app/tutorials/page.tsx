"use client";

import Link from "next/link";
import { PlayCircle, FileText, ArrowRight, DollarSign, Workflow, Clock } from "lucide-react";

const VIDEOS = [
  {
    id: "v=Xv3H1zH8D7k", // Replace with desired exact real YouTube ID if needed. Using a standard formatting structure.
    videoId: "mD7_s4HhK8Q", 
    title: "How to Make $10,000/mo with ComfyUI Automations",
    duration: "18:45",
    category: "Monetization",
    description: "Deep dive into setting up passive income streams using SDXL workflows and Print-on-Demand APIs."
  },
  {
    id: "v=Y9n3H2x4C1p",
    videoId: "Bw8O2h0aFk8",
    title: "Train Your First FLUX LoRA in 10 Minutes",
    duration: "12:30",
    category: "Technical Guide",
    description: "Learn how to use Kohya_ss and ComfyUI to instantly clone a character's face with 12GB of VRAM."
  }
];

const GUIDES = [
  {
    slug: "monetizing-comfyui",
    title: "Monetizing Your ComfyUI Workflows",
    icon: <DollarSign className="w-5 h-5 text-amber-500" />,
    color: "amber",
    description: "How to turn a local ComfyUI instance into a high-margin digital business via Fiverr, POD, and digital assets."
  },
  {
    slug: "stable-diffusion-basics",
    title: "Stable Diffusion Basics: The Core Architecture",
    icon: <Workflow className="w-5 h-5 text-sky-400" />,
    color: "sky",
    description: "The ultimate primer on Checkpoints, Nodes, KSamplers, and Latent Space for absolute beginners."
  }
];

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-24 font-sans selection:bg-indigo-500/30">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] text-indigo-400">
          <PlayCircle className="w-8 h-8" />
        </div>
        <p className="text-indigo-400 font-[800] tracking-widest uppercase text-sm mb-4">Neuraldrift Academy</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Learn to <span className="text-indigo-400">Master AI.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Watch premium video masterclasses or read our in-depth technical guides to level up your generative workflows.
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
              Interactive
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {VIDEOS.map((video, idx) => (
              <div key={idx} className="group relative bg-[#0f172a]/50 border border-indigo-500/20 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] flex flex-col">
                
                {/* 16:9 YouTube Embed Wrapper */}
                <div className="relative w-full pt-[56.25%] bg-black">
                  <iframe 
                    className="absolute inset-0 w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                  
                  {/* Overlay Tags (positioned absolute over the video if wanted, but iframe naturally blocks direct z-index overlays easily during playback. Handled below instead) */}
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

        {/* ── WRITTEN GUIDES ── */}
        <section>
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/5">
            <h2 className="text-2xl md:text-3xl font-[800] text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-white" /> Deep Dive Written Guides
            </h2>
            <span className="px-3 py-1 bg-white/5 text-zinc-400 text-xs font-[800] tracking-widest uppercase rounded-full border border-white/10">
              Technical Reads
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDES.map((guide, idx) => {
              const bgClass = guide.color === "amber" ? "hover:border-amber-500/50 hover:bg-amber-500/5" : "hover:border-sky-500/50 hover:bg-sky-500/5";
              const textClass = guide.color === "amber" ? "group-hover:text-amber-400" : "group-hover:text-sky-400";
              const accentBg = guide.color === "amber" ? "bg-amber-500/10 border-amber-500/20" : "bg-sky-500/10 border-sky-500/20";
              
              return (
                <Link 
                  key={idx} 
                  href={`/tutorials/${guide.slug}`}
                  className={`group bg-[#1e293b]/40 border border-white/10 rounded-2xl p-8 transition-all duration-300 ${bgClass}`}
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 shadow-lg ${accentBg}`}>
                    {guide.icon}
                  </div>
                  <h3 className={`text-xl font-[800] text-white mb-3 transition-colors ${textClass}`}>
                    {guide.title}
                  </h3>
                  <p className="text-sm font-[500] text-zinc-400 leading-relaxed mb-8">
                    {guide.description}
                  </p>
                  
                  <div className={`text-xs font-[800] uppercase tracking-widest flex items-center gap-2 transition-colors ${textClass}`}>
                    Read Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
