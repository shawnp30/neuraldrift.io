"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, FileText, ArrowRight, DollarSign, Workflow, Clock, Filter, Zap } from "lucide-react";

import { DynamicCTA } from "@/components/DynamicCTA";
import { TUTORIALS, tutorialDurationIso } from "@/lib/tutorials";

const CATEGORIES = ["All", "Beginner", "Masterclass", "Technical Guide", "Creative", "Advanced"] as const;

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredVideos = activeCategory === "All"
    ? TUTORIALS
    : TUTORIALS.filter((v) => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-transparent text-slate-50 pt-32 pb-24 font-sans selection:bg-transparent/30">

      {/* SEO STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": TUTORIALS.map((v, i) => ({
              "@type": "VideoObject",
              "position": i + 1,
              "name": v.title,
              "description": v.description,
              "thumbnailUrl": `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`,
              ...(tutorialDurationIso(v.duration) ? { "duration": tutorialDurationIso(v.duration) } : {}),
              "embedUrl": `https://www.youtube.com/embed/${v.videoId}`
            }))
          })
        }}
      />

      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-[#7c6af7]/10 border border-[#7c6af7]/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(124,106,247,0.15)] text-[#7c6af7]">
          <PlayCircle className="w-8 h-8" />
        </div>
        <p className="text-[#7c6af7] font-[800] tracking-widest uppercase text-sm mb-4">Neuraldrift Academy</p>
        <h1 className="font-syne text-5xl md:text-7xl font-[900] tracking-tight text-white mb-6 drop-shadow-xl leading-[0.85]">
          ACADEMY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">MASTERCLASS.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-[#8888a0] max-w-2xl mx-auto leading-relaxed">
          Premium video-led education for mastering generative AI, workflow architecture, and monetization strategies.
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
            {filteredVideos.map((video) => (
              <article key={video.slug} className="group relative bg-[#111113] border border-white/5 rounded-3xl overflow-hidden hover:border-[#7c6af7]/30 transition-all duration-500 shadow-xl flex flex-col">

                {/* 16:9 YouTube Embed Wrapper */}
                <div className="relative w-full pt-[56.25%] bg-black overflow-hidden">
                  <iframe
                    className="absolute inset-0 w-full h-full border-0 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                    src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-t-3xl" />
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-[800] tracking-widest uppercase text-[#7c6af7] bg-[#7c6af7]/10 px-3 py-1 rounded-full border border-[#7c6af7]/20">
                      {video.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-[600] text-[#8888a0]">
                      <Clock className="w-4 h-4" /> {video.duration}
                    </span>
                  </div>
                  <h3 className="font-syne text-xl md:text-2xl font-[800] text-white mb-3 group-hover:text-[#7c6af7] transition-colors leading-tight"><Link href={`/tutorials/${video.slug}`}>{video.title}</Link></h3>
                  <p className="text-sm font-[500] text-[#8888a0] leading-relaxed mb-8 flex-1">{video.description}</p>
                  
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                    <Link href="/hardware" className="text-[10px] font-bold text-[#f59e0b] hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest">
                       <Zap size={10} /> Check Gear Compatibility
                    </Link>
                    <ArrowRight className="w-5 h-5 text-[#7c6af7] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
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
