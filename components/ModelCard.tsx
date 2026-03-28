"use client";

import { ExternalLink, Database, Cpu, Download, Info } from "lucide-react";
import { motion } from "framer-motion";

interface ModelCardProps {
  model: {
    id: string;
    name: string;
    genre: string;
    base: string;
    trigger?: string;
    strength?: string;
    status?: string;
    description?: string;
    image?: string;
    downloads?: number;
    author?: string;
  };
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="nh-glass-card group relative flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 p-8 transition-all duration-500 hover:bg-[#0f172a]/40 hover:border-accent/40 hover:translate-y-[-4px] shadow-xl overflow-hidden"
    >
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${model.base === "FLUX" ? "bg-accent/10 border-accent/20" : "bg-indigo-500/10 border-indigo-500/20"}`}>
              <Database size={16} className={model.base === "FLUX" ? "text-accent" : "text-indigo-400"} />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 leading-none mb-1">Architecture</p>
              <p className="font-syne font-black text-xs text-white leading-none uppercase">{model.base}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              {model.genre}
            </span>
            {model.status && (
              <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest ${model.status === "Released" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
                <div className={`w-1 h-1 rounded-full ${model.status === "Released" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                {model.status}
              </span>
            )}
          </div>
        </div>

        <h3 className="mb-4 font-syne text-2xl font-black text-white tracking-tight group-hover:text-accent transition-colors leading-tight">
          {model.name}
        </h3>
        
        {model.author && (
          <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Author: <span className="text-zinc-400">{model.author}</span>
          </p>
        )}

        {model.description && (
          <p className="mb-8 line-clamp-3 font-medium text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
            {model.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-3">
            <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Trigger Word</p>
            <p className="font-mono text-[10px] font-bold text-accent truncate">{model.trigger || "OHWX STYLE"}</p>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-3">
            <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Strength</p>
            <p className="font-mono text-[10px] font-bold text-white">{model.strength || "0.65 – 0.8"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={model.id.includes("/") ? `https://huggingface.co/${model.id}` : "#"}
          target={model.id.includes("/") ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-2xl transition-all"
        >
          <Info size={14} className="text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Model Specs</span>
        </a>
        <button className="flex items-center justify-center gap-2 bg-accent text-black font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-all">
          <Download size={14} />
          <span className="font-mono text-[10px] uppercase tracking-widest">Deploy Local</span>
        </button>
      </div>

      {model.downloads && (
        <div className="absolute bottom-4 right-8 flex items-center gap-2 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
          <Cpu size={12} className="text-zinc-500" />
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{model.downloads.toLocaleString()} deploys</span>
        </div>
      )}
    </motion.div>
  );
}
