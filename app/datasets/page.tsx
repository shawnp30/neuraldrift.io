"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { HubSidebar } from "@/components/HubSidebar";
import { DatasetHubCard } from "@/components/DatasetHubCard";

export default function DatasetsHubPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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
    if (!d) return false;
    const s = query.toLowerCase();
    return (
      s === "" ||
      (typeof d.id === "string" && d.id.toLowerCase().includes(s)) ||
      (typeof d.name === "string" && d.name.toLowerCase().includes(s)) ||
      (typeof d.description === "string" && d.description.toLowerCase().includes(s)) ||
      (Array.isArray(d.tags) && d.tags.some((t: any) => typeof t === "string" && t.toLowerCase().includes(s)))
    );
  });

  return (
    <main className="min-h-screen bg-[#030712] pb-24 pt-32 text-slate-50">
      <div className="mx-auto flex max-w-[1600px] gap-8 px-6 lg:px-12">
        {/* SIDEBAR */}
        <HubSidebar />

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">
          {/* HEADER */}
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 font-syne text-3xl font-black tracking-tight text-white">
                Datasets
              </h1>
              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
                Training repositories for specialized local AI models
              </p>
            </div>
          </div>

          {/* SEARCH & CONTROLS */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="relative min-w-[300px] flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search datasets..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-3 pl-12 pr-4 font-mono text-xs outline-none transition-all focus:border-accent/40"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button className="p-2 text-zinc-500 transition-colors hover:text-white">
                <TrendingUp className="h-4 w-4" />
              </button>
              <div className="mx-1 h-4 w-px self-center bg-white/10" />
              <button className="p-2 text-zinc-500 transition-colors hover:text-white">
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* LIST GRID */}
          <div className="space-y-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]"
                  />
                ))
              : filteredDatasets.map((dataset) => (
                  <DatasetHubCard key={dataset.id} dataset={dataset} />
                ))}
          </div>
        </div>
      </div>
    </main>
  );
}
