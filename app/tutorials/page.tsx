"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, Search, BookOpen, Clock, ArrowRight } from "lucide-react";

// Mock data for tutorials
const VIDEO_TUTORIALS = [
  { id: "tut-1", title: "Mastering ComfyUI for Production Workflows", category: "ComfyUI Basics", duration: "14:20", thumbnail: "/workflow-previews/wf-1.svg", tags: ["UI", "Nodes", "Setup"], level: "Beginner" },
  { id: "tut-2", title: "Training Elite Character LoRAs with FLUX", category: "LoRA Training", duration: "22:45", thumbnail: "/workflow-previews/wf-2.svg", tags: ["FLUX", "Dataset", "Kohya"], level: "Advanced" },
  { id: "tut-3", title: "Optimizing VRAM usage on 8GB Cards", category: "Optimization", duration: "18:10", thumbnail: "/workflow-previews/wf-3.svg", tags: ["VRAM", "Performance", "Tiled VAE"], level: "Intermediate" },
  { id: "tut-4", title: "Advanced Inpainting & Outpainting Techniques", category: "Techniques", duration: "25:30", thumbnail: "/workflow-previews/wf-1.svg", tags: ["Inpainting", "ControlNet", "SDXL"], level: "Advanced" },
];

const TEXT_GUIDES = [
  { id: "guide-1", title: "Getting Started with ComfyUI: Concepts & Nodes", category: "Fundamentals", readTime: "5 min read", description: "The ultimate beginner's guide to understanding node-based generation systems. We break down the absolute basics so you feel right at home.", tags: ["Beginner Friendly", "Concepts"], level: "Beginner" },
  { id: "guide-2", title: "Mastering FLUX Generation: The Definitive Guide", category: "Deep Dive", readTime: "12 min read", description: "From prompt engineering to sampler selection, learn exactly how to get photorealistic results from the FLUX.1 models.", tags: ["FLUX", "Prompting"], level: "Intermediate" },
  { id: "guide-3", title: "Dataset Preparation for Architectural LoRAs", category: "Training", readTime: "8 min read", description: "A comprehensive look into tagging, pairing, and curating your image datasets specifically for high-fidelity architectural rendering.", tags: ["LoRA", "Datasets"], level: "Advanced" },
  { id: "guide-4", title: "Deforum & AnimateDiff: Motion Workflows Explained", category: "Video", readTime: "15 min read", description: "Step-by-step instructions for constructing complex, temporally consistent video animations inside ComfyUI.", tags: ["Animation", "Deforum"], level: "Advanced" },
];

export default function TutorialsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"videos" | "guides">("videos");

  const filterContent = (arr: any[]) => arr.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVideos = filterContent(VIDEO_TUTORIALS);
  const filteredGuides = filterContent(TEXT_GUIDES);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-16">
      
      {/* ── HEADER & SEARCH ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-white mb-4 drop-shadow-xl">
              Learning <span className="text-indigo-400">Center</span>
            </h1>
            <p className="text-lg md:text-xl font-[500] text-zinc-400 leading-relaxed">
              Welcome home. Whether you're a complete beginner learning the absolute basics or an expert optimizing multi-node pipelines, we have comprehensive guides for you.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-indigo-400/70" />
            </div>
            <input
              type="search"
              placeholder="Search guides and videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172a]/60 border border-indigo-500/30 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-xl font-[600]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
          <button 
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-[700] transition-colors ${activeTab === 'videos' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <PlayCircle className="w-5 h-5" /> Video Masterclasses
          </button>
          <button 
            onClick={() => setActiveTab("guides")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-[700] transition-colors ${activeTab === 'guides' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <BookOpen className="w-5 h-5" /> Written Guides
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        
        {/* ── VIDEO SELECTION ────────────────────────────────────────────── */}
        {activeTab === "videos" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-24 bg-[#0f172a]/30 rounded-3xl border border-indigo-500/10"><p className="text-zinc-500 text-lg font-[600]">No video tutorials found matching "{search}".</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((tut) => (
                  <div key={tut.id} className="group flex flex-col bg-[#0f172a]/40 border border-indigo-500/10 hover:border-indigo-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)] hover:-translate-y-1 cursor-pointer">
                    <div className="relative w-full aspect-video bg-[#080b0f] overflow-hidden">
                      <Image src={tut.thumbnail} alt={tut.title} fill style={{ objectFit: "cover" }} className="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" unoptimized />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                          <PlayCircle className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-[800] uppercase tracking-wider text-white">
                        {tut.level}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-[700] text-zinc-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {tut.duration}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs font-[800] uppercase tracking-wider text-indigo-400 mb-2">{tut.category}</span>
                      <h3 className="text-xl font-[800] text-white mb-3 mt-1 leading-snug group-hover:text-cyan-300 transition-colors">{tut.title}</h3>
                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        {tut.tags.map((tag: string) => (
                          <span key={tag} className="text-xs font-[600] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TEXT GUIDES SELECTION ──────────────────────────────────────── */}
        {activeTab === "guides" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredGuides.length === 0 ? (
               <div className="text-center py-24 bg-[#0f172a]/30 rounded-3xl border border-indigo-500/10"><p className="text-zinc-500 text-lg font-[600]">No written guides found matching "{search}".</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGuides.map((guide) => (
                  <div key={guide.id} className="group relative bg-[#0f172a]/40 border border-indigo-500/10 hover:border-indigo-500/40 rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(99,102,241,0.08)] cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-[800] uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{guide.category}</span>
                      <span className="text-xs font-[700] text-zinc-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {guide.readTime}</span>
                    </div>
                    
                    <h3 className="text-2xl font-[800] text-white mb-4 leading-snug group-hover:text-cyan-300 transition-colors pr-8">
                      {guide.title}
                    </h3>
                    
                    <p className="text-zinc-400 font-[500] leading-relaxed mb-8">
                      {guide.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                       <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-[700] px-3 py-1 bg-white/5 border border-white/10 rounded-md text-zinc-300">{guide.level}</span>
                        {guide.tags.map((tag: string) => (
                          <span key={tag} className="text-xs font-[600] px-3 py-1 bg-transparent text-zinc-500">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                        <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
