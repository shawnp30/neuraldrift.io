'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Download, 
  Copy, 
  Check, 
  Cpu, 
  Clock, 
  Maximize, 
  BarChart3, 
  Info,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  Layers,
  LayoutGrid,
  Sparkles,
  Search,
} from 'lucide-react';
import { WORKFLOWS, WorkflowEntry } from '@/lib/workflowsData';
import { DownloadButton } from '@/components/workflows/DownloadButton';
import { WorkflowGraphViewer } from '@/components/workflows/WorkflowGraphViewer';
import WorkflowCard from '@/components/workflows/WorkflowCard';

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowEntry | null>(null);
  const [previewMode, setPreviewMode] = useState<'proof' | 'nodes'>('proof');

  useEffect(() => {
    const found = WORKFLOWS.find(w => w.id === params.id);
    if (found) setWorkflow(found);

    // Block browser default: prevent dropped files from opening in a new tab
    const blockDrop = (e: DragEvent) => { e.preventDefault(); };
    window.addEventListener('dragover', blockDrop);
    window.addEventListener('drop', blockDrop);
    return () => {
      window.removeEventListener('dragover', blockDrop);
      window.removeEventListener('drop', blockDrop);
    };
  }, [params.id]);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-mono font-black text-white mb-4 uppercase tracking-tighter leading-none">Access Denied</h1>
          <p className="text-[#555565] mb-8 font-mono text-sm uppercase tracking-widest">Workflow Index: {params.id}</p>
          <Link href="/workflows" className="px-6 py-2 bg-[#7c6af7]/10 border border-[#7c6af7]/30 text-[#7c6af7] font-mono font-black text-xs uppercase hover:bg-[#7c6af7] hover:text-white transition-all">
            ← SYSTEM RESET
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(workflow.proofPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyJSON = async () => {
    try {
      // Use workflowJsonUrl if set, otherwise fall back to the local public path
      const jsonUrl = workflow.workflowJsonUrl || `/workflows/${workflow.id}.json`;
      const res = await fetch(jsonUrl);
      if (!res.ok) throw new Error('Workflow JSON not found');
      const json = await res.json();
      navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const relatedWorkflows = WORKFLOWS
    .filter(w => w.id !== workflow.id && (w.category === workflow.category))
    .slice(0, 3);

  const difficultyColors = {
    Beginner: 'text-[#4ade80]',
    Intermediate: 'text-[#f59e0b]',
    Advanced: 'text-[#ef4444]',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] pb-24 pt-32">
      {/* ── BACKGROUND FX ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 bg-grid opacity-5 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#7c6af7]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ── BREADCRUMBS ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/workflows" className="flex items-center gap-2 text-[#555565] hover:text-[#7c6af7] font-mono text-[10px] font-bold uppercase tracking-widest transition-all group">
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            LIBRARY
          </Link>
          <div className="w-[1px] h-3 bg-[#2a2a30]" />
          <span className="text-[#333340] font-mono text-[10px] uppercase font-bold tracking-widest">{workflow.category} architecture</span>
        </div>

        {/* ── MAIN CONTENT GRID (40/60) ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* 🟢 LEFT COLUMN: TECH SPECS & REQS (4/12) */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            
            {/* 1. PRIMARY INFO */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-mono font-black text-white uppercase tracking-tighter leading-tight">
                {workflow.title}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className={`px-2 py-0.5 bg-[#111113] border border-[#2a2a30] rounded text-[9px] font-mono font-bold uppercase tracking-widest ${difficultyColors[workflow.difficulty]}`}>
                  {workflow.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-[#111113] border border-[#2a2a30] rounded text-[9px] font-mono font-bold uppercase tracking-widest text-[#22d3ee]">
                  {workflow.vram} MIN
                </span>
              </div>
              <p className="text-[#8888a0] font-mono text-sm leading-relaxed pt-2">
                {workflow.description}
              </p>
            </div>

            {/* 2. TECH METRICS */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#111113] border border-[#2a2a30] rounded-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-black text-[#333340] uppercase tracking-widest mb-1">Architecture</span>
                <span className="text-xs font-mono font-bold text-white uppercase">{workflow.category}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-black text-[#333340] uppercase tracking-widest mb-1">Compute Cost</span>
                <span className="text-xs font-mono font-bold text-white uppercase">{workflow.genTime.split(' on')[0]}</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[9px] font-mono font-black text-[#333340] uppercase tracking-widest mb-1">Base Resolution</span>
                <span className="text-xs font-mono font-bold text-white uppercase">{workflow.resolution}</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[9px] font-mono font-black text-[#333340] uppercase tracking-widest mb-1">Status</span>
                <span className="text-xs font-mono font-bold text-[#4ade80] uppercase flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  VERIFIED
                </span>
              </div>
            </div>

            {/* 3. PRO TIP (EMPHASIZED) */}
            <div className="relative p-6 bg-gradient-to-br from-[#1c1c20] to-[#111113] border border-[#7c6af7]/30 rounded-xl overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={40} className="text-[#7c6af7]" />
               </div>
               <h3 className="text-[10px] font-mono font-black text-[#7c6af7] uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Terminal size={14} />
                 PRO TIP
               </h3>
               <p className="text-xs text-white leading-relaxed font-mono italic">
                 &quot;{workflow.proTip}&quot;
               </p>
            </div>

            {/* 4. MODEL REQUIREMENTS */}
            <div className="space-y-4 pt-4">
               <div className="flex items-center gap-3">
                 <Cpu size={16} className="text-[#22d3ee]" />
                 <h3 className="text-[10px] font-mono font-black text-white uppercase tracking-widest">Model Dependencies</h3>
               </div>
               <div className="space-y-3">
                 {workflow.modelPaths.map((m, i) => (
                   <a 
                    key={i}
                    href={m.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-[#111113]/50 border border-[#2a2a30] hover:border-[#7c6af7]/50 rounded-lg group/model transition-all"
                   >
                     <div className="flex items-center justify-between mb-1">
                       <span className="text-[11px] font-mono font-bold text-[#e8e8f0] group-hover:text-white truncate">{m.file}</span>
                       <ExternalLink size={12} className="text-[#333340] group-hover:text-[#7c6af7]" />
                     </div>
                     <span className="text-[9px] font-mono text-[#555565] uppercase tracking-tighter truncate block">{m.dir}</span>
                   </a>
                 ))}
               </div>
            </div>

            {/* 5. CUSTOM NODES */}
            <div className="space-y-4 pt-4">
               <div className="flex items-center gap-3">
                 <Layers size={16} className="text-[#a855f7]" />
                 <h3 className="text-[10px] font-mono font-black text-white uppercase tracking-widest">Expansion Nodes</h3>
               </div>
               <div className="flex flex-wrap gap-2">
                 {workflow.customNodes.length > 0 ? workflow.customNodes.map((node, i) => (
                   <a 
                    key={i}
                    href={`https://github.com/search?q=${node}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#111113] border border-[#2a2a30] hover:border-[#a855f7]/50 rounded text-[10px] font-mono font-bold text-[#8888a0] hover:text-white transition-all uppercase"
                   >
                     {node}
                   </a>
                 )) : (
                   <span className="text-[10px] font-mono text-[#555565] uppercase italic font-bold">Standard Native Nodes Only</span>
                 )}
               </div>
            </div>

          </div>

          {/* 🟦 RIGHT COLUMN: ANALYSIS & DOWNLOAD (8/12) */}
          <div className="lg:col-span-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000">
            
            {/* 1. VISUAL ANALYSIS PANEL */}
            <div className="bg-[#111113] border border-[#2a2a30] rounded-2xl overflow-hidden shadow-2xl">
              {/* Header / Mode Switch */}
              <div className="flex items-center justify-between p-4 bg-[#0a0a0b] border-b border-[#2a2a30]">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#2a2a30]/50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b/50] animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest">LIVE_ANALYSIS</span>
                </div>
                
                <div className="flex gap-2 p-1 bg-[#111113] border border-[#2a2a30] rounded-lg">
                   <button 
                    onClick={() => setPreviewMode('proof')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold text-[10px] uppercase transition-all tracking-widest ${previewMode === 'proof' ? 'bg-[#7c6af7] text-white shadow-lg' : 'text-[#555565] hover:text-[#8888a0]'}`}
                   >
                     <Sparkles size={14} />
                     PROOFS
                   </button>
                   <button 
                    onClick={() => setPreviewMode('nodes')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold text-[10px] uppercase transition-all tracking-widest ${previewMode === 'nodes' ? 'bg-[#7c6af7] text-white shadow-lg' : 'text-[#555565] hover:text-[#8888a0]'}`}
                   >
                     <LayoutGrid size={14} />
                     GRAPH
                   </button>
                </div>
              </div>

              {/* Display Area */}
              <div className="relative w-full bg-[#0a0a0b] group" style={{ minHeight: '420px' }}>
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                
                {previewMode === 'proof' ? (
                  <img 
                    src={workflow.imageUrl}
                    alt={`${workflow.title} Proof`}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                    style={{ minHeight: '420px', maxHeight: '520px' }}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ minHeight: '420px' }}>
                    <WorkflowGraphViewer workflowTitle={workflow.title} />
                  </div>
                )}

                {/* Aesthetic HUD Overlays */}
                <div className="absolute top-6 left-6 pointer-events-none select-none">
                  <div className="flex flex-col gap-1">
                    <div className="h-1 w-12 bg-[#7c6af7]" />
                    <span className="text-[9px] font-mono font-black text-[#7c6af7] uppercase tracking-[0.3em]">SECURE_VIEW</span>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 pointer-events-none select-none text-right">
                  <span className="text-[9px] font-mono font-black text-[#333340] uppercase tracking-[0.3em] block mb-1">COORDINATES</span>
                  <span className="text-[11px] font-mono font-bold text-[#555565]">{workflow.resolution} | 30_STEPS</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-8 bg-gradient-to-br from-[#111113] to-[#0a0a0b] flex flex-col sm:flex-row gap-6 items-center border-t border-[#2a2a30]">
                 <div className="flex-1 w-full">
                    <DownloadButton workflowId={workflow.id} workflowTitle={workflow.title} size="large" />
                 </div>
                 <div className="w-full sm:w-auto">
                    <button 
                      onClick={handleCopyJSON}
                      className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-4 border border-[#2a2a30] rounded-xl font-mono font-bold text-xs text-[#555565] hover:border-[#7c6af7]/50 hover:text-white transition-all uppercase"
                    >
                      {copiedJSON ? <Check size={16} className="text-[#4ade80]" /> : <Copy size={16} />}
                      {copiedJSON ? 'EXTRACTED' : 'COPY SCHEMATIC'}
                    </button>
                 </div>
              </div>
            </div>

            {/* 2. PROOF PROMPT PANEL */}
            <div className="bg-[#111113] border border-[#2a2a30] rounded-2xl overflow-hidden">
               <div className="p-4 border-b border-[#2a2a30] flex items-center justify-between">
                  <h3 className="text-[10px] font-mono font-black text-[#22d3ee] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={14} />
                    VALIDATION PROMPT
                  </h3>
                  <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 text-[9px] font-mono font-bold text-[#555565] hover:text-[#7c6af7] transition-all uppercase"
                  >
                    {copiedPrompt ? <Check size={12} className="text-[#4ade80]" /> : <Copy size={12} />}
                    {copiedPrompt ? 'COMMAND_SENT' : 'COPY_STRING'}
                  </button>
               </div>
               <div className="p-10 bg-[#0a0a0b] text-center">
                  <div className="max-w-2xl mx-auto">
                    <p className="text-[#e8e8f0] text-lg italic leading-relaxed font-serif text-outline-1">
                      &quot;{workflow.proofPrompt}&quot;
                    </p>
                  </div>
               </div>
            </div>

            {/* 3. EXTENDED DOCUMENTATION */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Search size={20} className="text-[#7c6af7]" />
                <h3 className="text-xl font-mono font-black text-white uppercase tracking-tighter">Architecture Manual</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2a2a30] to-transparent ml-4" />
              </div>
              <div className="prose prose-invert max-w-none">
                 <p className="text-[#8888a0] text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono uppercase tracking-[0.02em] opacity-80">
                    {workflow.longDescription}
                 </p>
              </div>
            </div>

            {/* 4. TAGS */}
            <div className="flex flex-wrap gap-2 pt-6">
              {workflow.tags.map((tag, i) => (
                <Link 
                  key={i} 
                  href={`/workflows?search=${tag}`}
                  className="px-3 py-1 bg-[#0a0a0b] border border-[#2a2a30] hover:border-[#7c6af7]/50 rounded text-[9px] font-mono font-bold text-[#333340] hover:text-[#7c6af7] uppercase tracking-widest transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* ── RELATED ARCHITECTURES ────────────────────────────────────────── */}
        <section className="mt-40 border-t border-[#2a2a30] pt-24">
          <div className="flex items-center justify-between mb-12 font-mono">
            <div className="flex items-center gap-4">
              <LayoutGrid size={24} className="text-[#7c6af7]" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                SIMILAR <span className="text-[#7c6af7]">CIRCUITS</span>
              </h2>
            </div>
            <Link href="/workflows" className="text-[10px] font-black text-[#555565] hover:text-white uppercase tracking-[0.3em] transition-all">
              FULL_INDEX &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {relatedWorkflows.map((w) => (
              <WorkflowCard key={`related-${w.id}`} workflow={w} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
