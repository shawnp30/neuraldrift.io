'use client';

import { useState, useMemo } from 'react';
import { WORKFLOWS, WorkflowCategory, DifficultyLevel, VRAMTier } from '@/lib/workflowsData';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import { Search, X, Filter, Zap, LayoutGrid, ChevronRight, Sparkles, Cpu } from 'lucide-react';

const CATEGORIES: (WorkflowCategory | 'all')[] = [
  'all',
  'image',
  'video',
  'enhance',
  'controlnet',
  'lora',
  'specialty',
];

const VRAM_TIERS: (VRAMTier | 'all')[] = [
  'all',
  '4GB',
  '6GB',
  '8GB',
  '12GB',
  '16GB',
  '24GB'
];

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [category, setCategory] = useState<WorkflowCategory | 'all'>('all');
  const [vram, setVram] = useState<VRAMTier | 'all'>('all');

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
        w.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesDifficulty = difficulty === 'all' || w.difficulty === difficulty;
      const matchesCategory = category === 'all' || w.category === category;
      const matchesVram = vram === 'all' || w.vram === vram;

      return matchesSearch && matchesDifficulty && matchesCategory && matchesVram;
    });
  }, [search, difficulty, category, vram]);

  const featuredWorkflows = useMemo(() => {
    return filteredWorkflows.filter(w => w.featured).slice(0, 3);
  }, [filteredWorkflows]);

  return (
    <div className="min-h-screen bg-transparent text-[#e8e8f0] pb-20">
      {/* ── HERO HEADER ────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-[#2a2a30]">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
        
        {/* Aesthetic Background Elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#7c6af7]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#22d3ee]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-[#7c6af7]/10 border border-[#7c6af7]/30 rounded-full backdrop-blur-sm">
            <Zap size={14} className="text-[#7c6af7]" />
            <span className="text-[10px] font-mono font-bold text-[#7c6af7] uppercase tracking-widest">
              Production-Grade Optimization
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-mono font-black text-white mb-6 tracking-tighter leading-none uppercase">
            NEURAL<span className="text-[#7c6af7]">DRIFT</span> <br />
            <span className="text-outline-white">HUB</span>
          </h1>
          
          <p className="text-xl text-[#8888a0] max-w-3xl mx-auto mb-12 leading-relaxed font-mono">
            Access 50 high-fidelity ComfyUI frameworks engineered for consistency, speed, and maximum creative control.
          </p>

          {/* TOTAL COUNTER */}
          <div className="flex justify-center py-8 border-y border-[#2a2a30]/50 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-mono font-black text-white">50</span>
              <span className="text-[10px] font-mono font-bold text-[#555565] uppercase tracking-widest mt-1">Verified Workflows</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER SECTION ─────────────────────────────────────────────────── */}
      <section className="sticky top-[64px] z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#2a2a30] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-8">
            
            {/* Top Row: Search & Difficulty */}
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* 🔍 SEARCH BAR */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555565]" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH ARCHITECTURES, MODELS, OR TAGS..."
                  className="w-full bg-[#111113] border border-[#2a2a30] rounded-lg py-4 pl-12 pr-12 text-[#e8e8f0] font-mono text-sm focus:outline-none focus:border-[#7c6af7] focus:ring-1 focus:ring-[#7c6af7]/30 transition-all placeholder:text-[#333340]"
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

              {/* 🟢 DIFFICULTY FILTER */}
              <div className="flex items-center gap-2 bg-[#111113] p-1.5 border border-[#2a2a30] rounded-lg">
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={`px-4 py-2 rounded font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-200 ${
                      difficulty === d 
                        ? (d === 'all' ? 'bg-[#7c6af7] text-white' : d === 'Beginner' ? 'bg-[#4ade80] text-[#0a0a0b]' : d === 'Intermediate' ? 'bg-[#f59e0b] text-[#0a0a0b]' : 'bg-[#ef4444] text-white')
                        : 'text-[#555565] hover:text-[#8888a0]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: Categories & VRAM */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#2a2a30]/30">
              {/* 💊 CATEGORY FILTER */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-[#333340] uppercase tracking-widest mr-2">Category:</span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition-all duration-200 border ${
                      category === cat
                        ? 'bg-[#7c6af7]/10 text-[#7c6af7] border-[#7c6af7]/50 shadow-[0_0_15px_rgba(124,106,247,0.1)]'
                        : 'bg-transparent text-[#555565] border-[#2a2a30] hover:border-[#7c6af7]/30 hover:text-[#8888a0]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 📟 VRAM FILTER */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-[#333340] uppercase tracking-widest mr-2">Memory:</span>
                {VRAM_TIERS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVram(v)}
                    className={`px-3 py-1 rounded border text-[9px] font-mono font-bold uppercase transition-all duration-200 ${
                      vram === v
                        ? 'bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/50'
                        : 'bg-transparent text-[#555565] border-[#202025] hover:border-[#22d3ee]/30 hover:text-[#8888a0]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WORKFLOWS GRID ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* FEATURED SECTION (if no search/filter active) */}
        {search === '' && difficulty === 'all' && category === 'all' && vram === 'all' && (
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles size={20} className="text-[#f59e0b]" />
              <h2 className="text-xl font-mono font-black text-white uppercase tracking-tighter">
                FEATURED ARCHITECTURES
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2a2a30] to-transparent ml-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {WORKFLOWS.filter(w => w.featured).slice(0, 3).map(w => (
                <WorkflowCard key={`featured-${w.id}`} workflow={w} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#2a2a30]/50 font-mono">
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-[#7c6af7]" />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
              Analysis Engine
            </h2>
          </div>
          <div className="text-[10px] font-bold text-[#555565] uppercase tracking-widest">
            Results Found: <span className="text-[#7c6af7] ml-2">{filteredWorkflows.length}</span>
          </div>
        </div>

        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#2a2a30] rounded-2xl text-center bg-[#111113]/30">
            <div className="p-6 bg-[#0a0a0b] rounded-full mb-8 border border-[#2a2a30] shadow-2xl">
              <Filter size={40} className="text-[#333340]" />
            </div>
            <h3 className="text-2xl font-mono font-black text-white mb-4 uppercase tracking-tight">Zero Matches Found</h3>
            <p className="text-[#555565] font-mono text-sm mb-10 max-w-sm mx-auto">
              No architectures match your current deployment criteria. Try loosening your memory or difficulty constraints.
            </p>
            <button 
              onClick={() => {
                setSearch('');
                setDifficulty('all');
                setCategory('all');
                setVram('all');
              }}
              className="px-8 py-3 bg-[#7c6af7] text-white rounded font-mono font-black text-xs hover:bg-[#7c6af7]/80 hover:shadow-[0_0_30px_rgba(124,106,247,0.3)] transition-all uppercase"
            >
              System Reset
            </button>
          </div>
        )}
      </main>

      {/* ── CTA FOOTER ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="relative p-12 bg-[#111113] border border-[#2a2a30] rounded-3xl overflow-hidden group">
          {/* Background FX */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7c6af7]/5 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:bg-[#7c6af7]/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="w-10 h-[1px] bg-[#7c6af7]" />
                <span className="text-[10px] font-mono font-bold text-[#7c6af7] uppercase tracking-widest">Expansion Protocol</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-mono font-black text-white mb-6 uppercase leading-[0.9] tracking-tighter">
                UNLOCK PREMIUM <br /> ARCHITECTURES
              </h2>
              <p className="text-[#555565] font-mono text-sm leading-relaxed">
                Join our elite node-engineering list. Receive 3 exclusive workflows and a 15% discount on the upcoming NeuralDrift Pro Training Program.
              </p>
            </div>
            
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-4 p-2 bg-[#0a0a0b] border border-[#2a2a30] rounded-xl">
                <input 
                  type="email" 
                  placeholder="TERMINAL@EMAIL.COM" 
                  className="bg-transparent border-none px-6 py-4 text-sm font-mono text-[#e8e8f0] focus:outline-none min-w-[300px] placeholder:text-[#22222a]"
                  required
                />
                <button className="bg-[#7c6af7] text-white font-mono font-black px-10 py-4 rounded-lg hover:shadow-[0_0_40px_rgba(124,106,247,0.4)] transition-all uppercase text-xs flex items-center justify-center gap-3">
                  INITIATE
                  <ChevronRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
