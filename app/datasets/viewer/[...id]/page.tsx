"use client";

import { 
  ArrowLeft, 
  ExternalLink, 
  Database,
  Info,
  Layers,
  Search,
  Zap,
  Box,
  Layout,
  Table
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DatasetViewer() {
  const params = useParams();
  
  // params.id is an array for catch-all routes: [...id]
  // We join it back to get the full dataset name (e.g., ["author", "dataset"] -> "author/dataset")
  const idArray = Array.isArray(params.id) ? params.id : [params.id];
  const datasetId = idArray.map(segment => decodeURIComponent(segment as string)).join("/");

  return (
    <main className="min-h-screen bg-transparent text-slate-50 pt-32 pb-32">
      
      {/* HEADER / NAV */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <Link 
          href="/datasets"
          className="group flex items-center gap-2 text-zinc-500 hover:text-accent transition-colors font-mono text-[10px] uppercase tracking-widest mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Neural Repository
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-accent/10 rounded-2xl border border-accent/20">
                <Database className="w-6 h-6 text-accent" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Hugging Face Node</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-syne font-black text-white tracking-tight break-all">
              {datasetId}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <a 
              href={`https://huggingface.co/datasets/${datasetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-mono uppercase tracking-widest transition-all shadow-xl nh-glass-card"
            >
              <ExternalLink className="w-4 h-4 text-accent" />
              Original Hub
            </a>
          </div>
        </div>
      </div>

      {/* VIEWER ENGINE */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="relative group">
          {/* Decorative Corner Accents */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t border-l border-accent/40 rounded-tl-3xl z-10" />
          <div className="absolute -top-px -right-px w-8 h-8 border-t border-r border-accent/40 rounded-tr-3xl z-10" />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b border-l border-accent/40 rounded-bl-3xl z-10" />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r border-accent/40 rounded-br-3xl z-10" />

          {/* SIDEBAR TABS (Visual/Mock) */}
          <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
             {[Table, Layout, Box, Zap].map((Icon, i) => (
               <div key={i} className={`p-3 rounded-2xl border border-white/10 transition-colors cursor-help
                 ${i === 0 ? 'bg-accent/20 border-accent/30 text-accent' : 'bg-white/5 text-zinc-600 hover:text-zinc-400'}
               `}>
                 <Icon className="w-5 h-5" />
               </div>
             ))}
          </div>

          <div className="w-full h-[88vh] bg-black/60 border border-white/10 rounded-3xl overflow-hidden nh-glass-card shadow-2xl relative shadow-accent/5">
            {/* IFRAME LOADING OVERLAY (Static Mock) */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-shimmer" />
            
            <iframe
              src={`https://huggingface.co/datasets/${datasetId}/embed/viewer`}
              className="w-full h-full border-0 grayscale opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-700"
              allow="fullscreen"
              title={`Hugging Face Dataset Viewer: ${datasetId}`}
            />
          </div>

          {/* CAPTION / STATUS BAR */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-4">
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Status: Live Synchronized</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Security: Neural Encryption</span>
               </div>
             </div>
             
             <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.4em] hidden md:block">
               Neural Drift Node // Dataset Mirror System v2.2-stable
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
