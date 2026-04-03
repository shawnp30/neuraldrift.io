'use client';

import { useState, useMemo } from 'react';
import { WORKFLOWS, WorkflowCategory, DifficultyLevel } from '@/lib/workflowsData';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import { Search, X, Filter, Zap, LayoutGrid, ChevronRight } from 'lucide-react';

const CATEGORIES: (WorkflowCategory | 'all')[] = [
  'all',
  'image',
  'video',
  'enhance',
  'controlnet',
  'lora',
  'specialty',
];

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [category, setCategory] = useState<WorkflowCategory | 'all'>('all');

  // Deduplicate and filter workflows
  const filteredWorkflows = useMemo(() => {
    // 1. Deduplicate by ID
    const uniqueMap = new Map();
    WORKFLOWS.forEach(w => {
      if (!uniqueMap.has(w.id)) {
        uniqueMap.set(w.id, w);
      }
    });
    const uniqueWorkflows = Array.from(uniqueMap.values());

    // 2. Filter
    return uniqueWorkflows.filter(w => {
      const matchesSearch = 
        w.title.toLowerCase().includes(search.toLowerCase()) ||
        w.description.toLowerCase().includes(search.toLowerCase()) ||
        w.model.toLowerCase().includes(search.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesDifficulty = difficulty === 'all' || w.difficulty === difficulty;
      const matchesCategory = category === 'all' || w.category === category;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [search, difficulty, category]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] pb-20">
      {/* ── HERO HEADER ────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 overflow-hidden border-b border-[#2a2a30]">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-[#7c6af7]/10 border border-[#7c6af7]/30 rounded-full">
            <Zap size={14} className="text-[#7c6af7]" />
            <span className="text-[10px] font-mono font-bold text-[#7c6af7] uppercase tracking-widest">
              Production-Tested Library
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-mono font-black text-white mb-4 tracking-tighter leading-none uppercase">
            ComfyUI Workflow Library
          </h1>
          <p className="text-lg text-[#8888a0] max-w-2xl mx-auto mb-10 leading-relaxed">
            50 professional workflows optimized for high-fidelity generation. 
            Download, drag into ComfyUI, and start building.
          </p>

          {/* TOTAL COUNTER */}
          <div className="flex items-center justify-center gap-6 py-4 border-y border-[#2a2a30]/50 max-w-md mx-auto mb-12">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-mono font-black text-white">50</span>
              <span className="text-[10px] font-mono font-bold text-[#8888a0] uppercase tracking-wider">Workflows</span>
            </div>
            <div className="w-[1px] h-8 bg-[#2a2a30]" />
            <div className="flex flex-col items-center">
              <span className="text-3xl font-mono font-black text-[#22d3ee]">100%</span>
              <span className="text-[10px] font-mono font-bold text-[#8888a0] uppercase tracking-wider">Node Compatibility</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER SECTION ─────────────────────────────────────────────────── */}
      <section className="sticky top-[64px] z-50 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-[#2a2a30] py-6 mb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          
          {/* 🟢 DIFFICULTY FILTER */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setDifficulty('all')}
              className={`min-w-[120px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 border ${
                difficulty === 'all' 
                  ? 'bg-[#7c6af7] text-white border-[#7c6af7] shadow-[0_0_20px_rgba(124,106,247,0.4)]' 
                  : 'bg-[#111113] text-[#8888a0] border-[#2a2a30] hover:border-[#7c6af7]/50'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setDifficulty('Beginner')}
              className={`min-w-[120px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 border flex items-center justify-center gap-2 ${
                difficulty === 'Beginner' 
                  ? 'bg-[#4ade80] text-white border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.4)]' 
                  : 'bg-[#111113] text-[#8888a0] border-[#2a2a30] hover:border-[#4ade80]/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              BEGINNER
            </button>
            <button
              onClick={() => setDifficulty('Intermediate')}
              className={`min-w-[120px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 border flex items-center justify-center gap-2 ${
                difficulty === 'Intermediate' 
                  ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#111113] text-[#8888a0] border-[#2a2a30] hover:border-[#f59e0b]/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              INTERMEDIATE
            </button>
            <button
              onClick={() => setDifficulty('Advanced')}
              className={`min-w-[120px] px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all duration-300 border flex items-center justify-center gap-2 ${
                difficulty === 'Advanced' 
                  ? 'bg-[#ef4444] text-white border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                  : 'bg-[#111113] text-[#8888a0] border-[#2a2a30] hover:border-[#ef4444]/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              ADVANCED
            </button>
          </div>

          {/* 💊 CATEGORY FILTER */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 border ${
                  category === cat
                    ? 'bg-[#7c6af7] text-white border-[#7c6af7]'
                    : 'bg-[#111113] text-[#8888a0] border-[#2a2a30] hover:border-[#7c6af7]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 🔍 SEARCH BAR */}
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a0]" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, model, tags, or description..."
              className="w-full bg-[#111113] border border-[#2a2a30] rounded-lg py-4 pl-12 pr-12 text-[#e8e8f0] font-mono text-sm focus:outline-none focus:border-[#7c6af7] focus:ring-1 focus:ring-[#7c6af7] transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888a0] hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW GRID ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a30]/50 font-mono">
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-[#7c6af7]" />
            <h2 className="text-sm font-bold text-[#8888a0] uppercase tracking-widest">
              Workflow Gallery
            </h2>
          </div>
          <div className="text-[11px] text-[#8888a0]">
            Showing <span className="text-white font-bold">{filteredWorkflows.length}</span> of <span className="text-white font-bold">50</span> workflows
          </div>
        </div>

        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#2a2a30] rounded-xl text-center">
            <div className="p-4 bg-[#111113] rounded-full mb-6 border border-[#2a2a30]">
              <Filter size={32} className="text-[#8888a0]" />
            </div>
            <h3 className="text-xl font-mono font-bold text-white mb-2 uppercase">No Workflows Matched</h3>
            <p className="text-[#8888a0] text-sm mb-8">Try removing a filter or adjusting your search terms.</p>
            <button 
              onClick={() => {
                setSearch('');
                setDifficulty('all');
                setCategory('all');
              }}
              className="px-6 py-2 bg-[#7c6af7]/10 border border-[#7c6af7]/50 rounded text-[11px] font-mono font-bold text-[#7c6af7] hover:bg-[#7c6af7] hover:text-white transition-all uppercase"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* ── CTA FOOTER ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mt-20 pt-20 border-t border-[#2a2a30]">
        <div className="bg-gradient-to-br from-[#111113] to-[#0a0a0b] border border-[#2a2a30] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Zap size={200} />
          </div>
          
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-mono font-black text-white mb-4 uppercase leading-none">
              Not finding what you need?
            </h2>
            <p className="text-[#8888a0] font-mono text-sm leading-relaxed">
              We release 5 new production-tested workflows every Monday. Subscribe to get our latest technical optimization guides delivered to your inbox.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input 
              type="email" 
              placeholder="ENTER EMAIL ADDRESS" 
              className="bg-[#0a0a0b] border border-[#2a2a30] rounded px-6 py-3 text-sm font-mono text-[#e8e8f0] focus:outline-none focus:border-[#7c6af7] min-w-[280px]"
            />
            <button className="bg-white text-black font-mono font-black px-8 py-3 rounded hover:bg-[#7c6af7] hover:text-white transition-all uppercase text-sm flex items-center justify-center gap-2 group/btn">
              Join Hub
              <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
