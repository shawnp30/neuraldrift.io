"use client";

import { ChevronRight, LayoutGrid, Zap, Filter } from "lucide-react";
import { useState } from "react";

interface GenreSidebarProps {
  title: string;
  genres: string[];
  activeGenre: string;
  onGenreChange: (genre: string) => void;
}

export function GenreSidebar({
  title,
  genres,
  activeGenre,
  onGenreChange,
}: GenreSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      <div className="nh-glass-card rounded-[2rem] border border-white/5 bg-[#0f172a]/20 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/20">
              <Filter size={14} className="text-accent" />
            </div>
            <h3 className="font-syne font-black text-xs uppercase tracking-[0.2em] text-white">
              {title}
            </h3>
          </div>
          <Zap size={12} className="text-zinc-600" />
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onGenreChange("")}
            className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 font-mono text-[11px] uppercase tracking-widest ${
              activeGenre === "" 
                ? "bg-accent text-black font-bold shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid size={13} className={activeGenre === "" ? "text-black" : "text-zinc-600 group-hover:text-accent"} />
              ALL MODELS
            </div>
            {activeGenre === "" && <ChevronRight size={14} />}
          </button>

          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 font-mono text-[11px] uppercase tracking-widest ${
                activeGenre === genre 
                  ? "bg-accent text-black font-bold shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${activeGenre === genre ? "bg-black" : "bg-zinc-700 group-hover:bg-accent"}`} />
                {genre}
              </div>
              {activeGenre === genre && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 px-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-4">Operational Status</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Global Sync: Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">HuggingFace Hub: v1.2</span>
          </div>
        </div>
      </div>

      <div className="nh-glass-card rounded-[2rem] border border-white/10 bg-accent/5 p-8 relative overflow-hidden group">
        <div className="relative z-10">
          <h4 className="font-syne font-black text-sm text-white mb-2 leading-tight">Need a custom<br />private model?</h4>
          <p className="text-[11px] text-zinc-400 font-medium mb-5 leading-relaxed">Leverage our H100 cluster for zero-latency training sessions.</p>
          <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            Deploy Now →
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[50px] -mr-16 -mt-16 group-hover:bg-accent/30 transition-all duration-500" />
      </div>
    </aside>
  );
}
