"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { HubSidebar } from "@/components/HubSidebar";
import { ModelHubCard } from "@/components/ModelHubCard";

const CATEGORIES = [
  "All",
  "Image Generation",
  "Creative Text",
  "Audio & Speech",
  "Advanced Vision",
];

const mapCategory = (tag: string) => {
  if (!tag) return "Other";
  const t = tag.toLowerCase();
  if (
    ["text-to-image", "image-to-image", "controlnet", "diffusers"].includes(t)
  )
    return "Image Generation";
  if (
    [
      "text-generation",
      "text2text-generation",
      "translation",
      "summarization",
      "conversational",
    ].includes(t)
  )
    return "Creative Text";
  if (
    [
      "audio-classification",
      "automatic-speech-recognition",
      "text-to-speech",
      "audio-to-audio",
    ].includes(t)
  )
    return "Audio & Speech";
  if (
    [
      "image-classification",
      "object-detection",
      "image-segmentation",
      "zero-shot-image-classification",
      "depth-estimation",
      "mask-generation",
    ].includes(t)
  )
    return "Advanced Vision";
  return "Other";
};

export default function ModelsHubPage() {
  const [models, setModels] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTask, setActiveTask] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/hf-models")
      .then((r) => r.json())
      .then((data) => {
        setModels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load models:", err);
        setLoading(false);
      });
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, query, activeTask]);

  const filteredModels = models.filter((m) => {
    const matchesQuery = (m.displayName || m.modelId)
      .toLowerCase()
      .includes(query.toLowerCase());

    const modelCat = mapCategory(m.pipeline_tag);
    const matchesCategory =
      selectedCategory === "All" || modelCat === selectedCategory;

    const matchesTask = activeTask === "all" || m.pipeline_tag === activeTask;

    return matchesQuery && matchesCategory && matchesTask;
  });

  const displayModels = filteredModels.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-transparent pb-24 pt-32 text-slate-50">
      <div className="mx-auto flex max-w-[1600px] gap-8 px-6 lg:px-12">
        {/* SIDEBAR */}
        <HubSidebar
          activeFilter={activeTask}
          onFilterChange={(id) => setActiveTask(id)}
        />

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">
          {/* HEADER */}
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 font-syne text-4xl font-black tracking-tight text-white">
                Model Library
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                Advanced neural architectures from the Hugging Face ecosystem
              </p>
            </div>
          </div>

          {/* CATEGORY NAV */}
          <div className="mb-10 flex flex-wrap gap-2 border-b border-white/5 pb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? "bg-accent text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH & CONTROLS */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="relative min-w-[300px] flex-1">
              <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search models..."
                className="w-full rounded-2xl border border-white/5 bg-[#161b22] py-4 pl-14 pr-6 font-mono text-xs outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex rounded-2xl border border-white/5 bg-[#161b22] p-1.5">
              <button className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                <TrendingUp className="h-4 w-4" />
              </button>
              <div className="mx-1.5 h-5 w-px self-center bg-white/5" />
              <button className="rounded-xl p-2.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* LIST GRID */}
          <div className="grid gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#161b22]"
                  />
                ))
              : displayModels.map((model) => (
                  <ModelHubCard
                    key={model.modelId}
                    model={{
                      ...model,
                      downloads: model.downloads?.toLocaleString(),
                      likes: model.likes?.toLocaleString(),
                      updatedAt: model.updatedAt,
                    }}
                  />
                ))}

            {!loading && filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#161b22]/30 px-6 py-20 text-center">
                <div className="mb-6 rounded-full bg-accent/10 p-6 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                  <Search className="h-10 w-10 text-accent" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white">
                  No models found in the Drift
                </h3>
                <p className="mb-8 max-w-md font-mono text-xs uppercase leading-relaxed tracking-widest text-zinc-500">
                  We couldn&apos;t find that specific model, but the Drift is
                  always expanding. Check out these trending architectures
                  instead:
                </p>

                <div className="mb-10 flex flex-wrap justify-center gap-3">
                  {["FLUX.1-dev", "Pony Diffusion", "SDXL LoRAs"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 transition-all hover:border-accent/40 hover:text-accent"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <Link
                  href="/community/requests"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-105 active:scale-95"
                >
                  Request a Model
                  <Zap className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* LOAD MORE */}
          {!loading && filteredModels.length > visibleCount && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                Load More Models
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
