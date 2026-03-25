"use client";

import Link from "next/link";
import { PlayCircle, FileText, ArrowRight, DollarSign, Workflow, Clock } from "lucide-react";

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
  }
];

// VIDEOS array remains... 
// (Removing the GUIDES array that used to be here since they have their own /guides page now)

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

        {/* ── GUIDES CTA ── */}
        <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-10 md:p-16 text-center">
          <h2 className="text-3xl font-[800] text-white mb-4">Looking for Documentation?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg">
            Our technical guide library contains 13+ in-depth tutorials on installation, VRAM optimization, and custom node management.
          </p>
          <Link 
            href="/guides"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-black font-[800] rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            Visit Knowledge Base <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </div>
    </div>
  );
}
