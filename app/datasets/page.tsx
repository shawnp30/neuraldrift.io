"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Database, 
  Eye, 
  Activity,
  Box,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const TYPES = ["text", "image", "audio", "video", "multimodal"];

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const filtered = datasets.filter((d: any) => {
    const matchQuery = d.name.toLowerCase().includes(query.toLowerCase()) || 
                       d.description?.toLowerCase().includes(query.toLowerCase());
    const matchType = filterType ? d.tags?.some((t: string) => t.toLowerCase().includes(filterType.toLowerCase())) : true;
    return matchQuery && matchType;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 text-center">
        <p className="text-accent font-[800] text-xs tracking-widest uppercase mb-4">Neural Repository</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-syne font-black tracking-tight text-white mb-6 drop-shadow-xl">
          Hugging Face <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-400">Datasets.</span>
        </h1>
        <p className="text-sm md:text-base font-mono text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate engine for local model training. Explore 200+ trending datasets, verify structure with the integrated viewer, and copy IDs directly into your training pipeline.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <div className="flex flex-wrap gap-4 items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-3xl nh-glass-card">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search community datasets..."
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-mono focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all placeholder:text-zinc-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <select
                className="bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-mono appearance-none focus:border-accent/40 outline-none transition-all cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Modalites</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5 ml-4">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest self-center mr-2">Status</span>
              <div className="w-2 h-2 rounded-full bg-green-500 self-center animate-pulse" />
              <span className="font-mono text-[10px] text-green-500 uppercase tracking-widest self-center">Live Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 min-h-[600px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl h-64 animate-pulse nh-glass-card" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              layout
            >
              {filtered.map((d: any) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white/[0.02] border border-white/10 hover:border-accent/30 rounded-3xl p-8 transition-all nh-glass-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-2 bg-accent/10 rounded-xl border border-accent/20 group-hover:bg-accent/20 transition-colors">
                        <Database className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex gap-2">
                        {d.tags?.slice(0, 2).map((tag: any) => (
                          <span key={tag} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-zinc-500 uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="font-syne text-xl font-black text-white mb-3 break-all line-clamp-1 group-hover:text-accent transition-colors">
                      {d.name.split("/").pop()}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mb-6 tracking-tight uppercase opacity-60">
                      {d.name.includes("/") ? d.name.split("/")[0] : "Official HF"}
                    </p>
                    <p className="text-sm text-zinc-400 line-clamp-3 mb-8 leading-relaxed font-mono">
                      {d.description || "Experimental dataset repository metadata. Scalable training compatible with local Gen-AI pipelines."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/datasets/viewer/${encodeURIComponent(d.name)}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent" />
                        Live Viewer
                      </Link>
                      <button
                        onClick={() => copyToClipboard(d.name)}
                        className={`flex items-center justify-center gap-2 border font-mono text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl transition-all
                          ${copiedId === d.name ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400"}
                        `}
                      >
                        {copiedId === d.name ? <ShieldCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === d.name ? "Copied" : "Copy ID"}
                      </button>
                    </div>
                    <a 
                      href={`https://huggingface.co/datasets/${d.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center justify-center gap-2 text-zinc-600 hover:text-accent transition-colors text-[9px] font-mono uppercase tracking-[0.2em]"
                    >
                      HF Repository <ExternalLink className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl nh-glass-card">
            <Activity className="w-5 h-5 text-indigo-400 mb-4" />
            <h4 className="font-syne text-sm font-bold text-white mb-2 uppercase tracking-widest">Real-time Feed</h4>
            <p className="text-xs text-zinc-500 font-mono leading-relaxed">Synced with Hugging Face Hub v1beta. Metadata refreshes hourly for the best local creation data.</p>
          </div>
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl nh-glass-card">
            <Cpu className="w-5 h-5 text-cyan-400 mb-4" />
            <h4 className="font-syne text-sm font-bold text-white mb-2 uppercase tracking-widest">Training Ready</h4>
            <p className="text-xs text-zinc-500 font-mono leading-relaxed">All listed IDs are compatible with OneTrainer, Kohya_SS, and local SDXL/FLUX training scripts.</p>
          </div>
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl nh-glass-card">
            <Box className="w-5 h-5 text-purple-400 mb-4" />
            <h4 className="font-syne text-sm font-bold text-white mb-2 uppercase tracking-widest">Dataset Mirror</h4>
            <p className="text-xs text-zinc-500 font-mono leading-relaxed">Embeds HF dataset viewer directly into your workflow browser for zero-latency previewing.</p>
          </div>
        </div>
      </div>
      
    </main>
  );
}
