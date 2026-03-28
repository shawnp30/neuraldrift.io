"use client";

import { ExternalLink, Database, Eye, Copy, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    author: string;
    description: string;
    tags?: string[];
    downloads?: number;
  };
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(dataset.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="nh-glass-card group relative flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 p-8 transition-all duration-500 hover:bg-[#0f172a]/40 hover:border-accent/40 hover:translate-y-[-4px] shadow-xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
              <Database size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 leading-none mb-1">Repository</p>
              <p className="font-syne font-black text-xs text-white leading-none uppercase">HF HUB</p>
            </div>
          </div>
          <div className="flex gap-2">
            {dataset.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <h3 className="mb-3 font-syne text-2xl font-black text-white tracking-tight group-hover:text-accent transition-colors leading-tight truncate">
          {dataset.name}
        </h3>
        
        <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          Curator: <span className="text-zinc-400">{dataset.author}</span>
        </p>

        <p className="mb-8 line-clamp-3 font-medium text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {dataset.description || "High-density neural repository optimized for local model training and hardware-accelerated inference."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Link
            href={`/datasets/viewer/${encodeURIComponent(dataset.id)}`}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-2xl transition-all"
          >
            <Eye size={14} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Live Preview</span>
          </Link>
          <button
            onClick={copyId}
            className={`flex-1 flex items-center justify-center gap-2 border font-bold py-3.5 px-6 rounded-2xl transition-all ${
              copied ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
          >
            {copied ? <ShieldCheck size={14} /> : <Copy size={14} />}
            <span className="font-mono text-[10px] uppercase tracking-widest">{copied ? "Copied" : "Copy ID"}</span>
          </button>
        </div>
        <a
          href={`https://huggingface.co/datasets/${dataset.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-accent text-black font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-all"
        >
          <ExternalLink size={14} />
          <span className="font-mono text-[10px] uppercase tracking-widest">Open Repository</span>
        </a>
      </div>
    </motion.div>
  );
}
