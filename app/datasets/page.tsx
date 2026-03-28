"use client";

import { useEffect, useState } from "react";
import { GenreSidebar } from "@/components/GenreSidebar";
import { VideoHero } from "@/components/VideoHero";
import { DatasetCard } from "@/components/DatasetCard";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import { DynamicCTA } from "@/components/DynamicCTA";

const DATASET_GENRES = [
  "text-to-image",
  "stable-diffusion",
  "diffusers",
  "lora",
  "flux",
  "sdxl",
  "text-to-video",
];

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hf-datasets")
      .then((r) => r.json())
      .then((data) => {
        setDatasets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load datasets:", err);
        setLoading(false);
      });
  }, []);

  const filteredDatasets = datasets.filter((d: any) => {
    const genre = activeGenre.toLowerCase();
    const matchesGenre =
      activeGenre === "" ||
      d.tags?.some((t: string) => t.toLowerCase().includes(genre)) ||
      d.pipeline_tag?.toLowerCase().includes(genre) ||
      d.id.toLowerCase().includes(genre);
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      d.id.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query) ||
      d.tags?.some((t: string) => t.toLowerCase().includes(query));
    return matchesGenre && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#030712] pb-32 pt-20 text-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* HERO SECTION */}
        <div className="mb-16">
          <VideoHero 
            title="The Fuel for Neural Architectures."
            description="Explore 200+ curated repositories for local model training. From high-density image datasets for FLUX LoRAs to massive text corpora for LLM fine-tuning — all IDs are verified and ready for zero-latency streaming."
            videoUrl="https://www.youtube.com/embed/S_8qM7M0C_E"
            thumbnail="https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=2000&auto=format&fit=crop"
            ctaText="BROWSE REPOSITORY"
            onCtaClick={() => document.getElementById("dataset-grid")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
          <GenreSidebar 
            title="Dataset Genres"
            genres={DATASET_GENRES}
            activeGenre={activeGenre}
            onGenreChange={setActiveGenre}
          />

          {/* MAIN CONTENT */}
          <div className="flex-1">
            
            {/* CONTROLS */}
            <div id="dataset-grid" className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div className="relative flex-1 min-w-[320px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Query global dataset hub..."
                  className="w-full rounded-2xl border border-white/5 bg-[#0f172a]/40 py-4 pl-12 pr-4 font-mono text-xs outline-none transition-all placeholder:text-zinc-700 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Active Sync</span>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-indigo-500 uppercase tracking-widest">HF SYNC</span>
                </div>
              </div>
            </div>

            {/* RESULTS GRID */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="nh-glass-card h-[400px] animate-pulse rounded-[2.5rem] border border-white/5 bg-white/[0.02]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                <AnimatePresence mode="popLayout">
                  {filteredDatasets.map((d: any) => (
                    <DatasetCard 
                      key={d.id} 
                      dataset={{
                        id: d.id,
                        name: d.id.split("/").pop() || d.id,
                        author: d.id.split("/")[0],
                        description: d.description,
                        tags: d.tags,
                        downloads: d.downloads
                      }} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filteredDatasets.length === 0 && (
              <div className="py-32 text-center rounded-[3rem] border border-dashed border-white/5 bg-[#0f172a]/20">
                <p className="font-syne text-xl font-bold text-zinc-600 mb-2">No matching datasets found.</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">Try adjusting your filters or search query.</p>
              </div>
            )}

            {/* CTA SECTION */}
            <div className="mt-20">
              <DynamicCTA 
                title="The Foundations of Neural Intelligence."
                description="Start with the best data to achieve the best results. Our dataset hub bridges the gap between massive open-source repositories and your local training environment."
                ctaText="LEARN DATA CURATION"
                ctaHref="/guides"
                variant="indigo"
                tag="// Dataset Hook"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
