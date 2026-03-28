"use client";

import { useEffect, useState } from "react";
import { FEATURED_LORAS } from "@/data/loras";
import { GenreSidebar } from "@/components/GenreSidebar";
import { VideoHero } from "@/components/VideoHero";
import { ModelCard } from "@/components/ModelCard";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import { DynamicCTA } from "@/components/DynamicCTA";

const GENRES = ["Character", "Style", "Object", "Concept", "Cinematic"];

export default function LorasPage() {
  const [hfModels, setHfModels] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hf-models")
      .then((r) => r.json())
      .then((data) => {
        setHfModels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load HF models:", err);
        setLoading(false);
      });
  }, []);

  const allModels = [
    ...FEATURED_LORAS.map(m => ({
      ...m,
      author: "NeuralHub Official",
      downloads: 1240, // Mock downloads for featured
    })),
    ...hfModels.map(m => ({
      id: m.id,
      name: m.id.split("/").pop() || m.id,
      genre: m.tags?.includes("style") ? "Style" : m.tags?.includes("character") ? "Character" : "Object",
      base: m.tags?.includes("flux") ? "FLUX" : "SDXL",
      author: m.id.split("/")[0],
      downloads: m.downloads,
      description: `Community-trained LoRA adapter by ${m.id.split("/")[0]}. Optimized for local training pipelines.`,
    }))
  ];

  const filteredModels = allModels.filter(m => {
    const matchesGenre = activeGenre === "" || m.genre === activeGenre;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#030712] pb-32 pt-20 text-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* HERO SECTION */}
        <div className="mb-16">
          <VideoHero 
            title="Inject Logic Into Flux Training."
            description="Precision-trained LoRAs for high-fidelity AI systems. Every model in our library is verified for rank-density and epoch consistency, ensuring zero-latency injection into your ComfyUI pipelines."
            videoUrl="https://www.youtube.com/embed/70H08FTYyN4"
            thumbnail="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop"
            ctaText="DEPLOY LOCAL TRAINER"
            onCtaClick={() => window.open("/guides/train-flux-lora", "_self")}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
          <GenreSidebar 
            title="Model Categories"
            genres={GENRES}
            activeGenre={activeGenre}
            onGenreChange={setActiveGenre}
          />

          {/* MAIN CONTENT */}
          <div className="flex-1">
            
            {/* CONTROLS */}
            <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div className="relative flex-1 min-w-[320px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Query global repository..."
                  className="w-full rounded-2xl border border-white/5 bg-[#0f172a]/40 py-4 pl-12 pr-4 font-mono text-xs outline-none transition-all placeholder:text-zinc-700 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Active Sync</span>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-widest">LIVE DATA</span>
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
                  {filteredModels.map((model) => (
                    <ModelCard key={model.id} model={model} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filteredModels.length === 0 && (
              <div className="py-32 text-center rounded-[3rem] border border-dashed border-white/5 bg-[#0f172a]/20">
                <p className="font-syne text-xl font-bold text-zinc-600 mb-2">No matching models found.</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">Try adjusting your filters or search query.</p>
              </div>
            )}

            {/* CTA SECTION */}
            <div className="mt-20">
              <DynamicCTA 
                title="The Gold Standard of Local Diffusion Training."
                description="Join 12,000+ engineers training private concepts. Our platform provides the dataset tools, hardware orchestration, and verified adapters to scale your generative intelligence."
                ctaText="START TRAINING NOW"
                ctaHref="/guides/train-flux-lora"
                variant="emerald"
                tag="// Operational Hook"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
