'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  LayoutGrid
} from 'lucide-react';
import { WORKFLOWS, WorkflowEntry } from '@/lib/workflowsData';
import { DownloadButton } from '@/components/workflows/DownloadButton';
import { ModelPanel } from '@/components/workflows/ModelPanel';
import WorkflowCard from '@/components/workflows/WorkflowCard';

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowEntry | null>(null);

  useEffect(() => {
    const found = WORKFLOWS.find(w => w.id === params.id);
    if (found) {
      setWorkflow(found);
    }
  }, [params.id]);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-mono font-black text-white mb-4 uppercase">Workflow Not Found</h1>
          <p className="text-[#8888a0] mb-8 font-mono">ID: {params.id}</p>
          <Link href="/workflows" className="text-[#7c6af7] hover:underline font-mono text-sm underline-offset-4">
            ← BACK TO LIBRARY
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyPrompt = () => {
    const promptText = `Cinematic portrait of a weathered astronaut in a retro 1960s spacesuit, dramatic rim lighting, film grain, analog photography`;
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyJSON = async () => {
    try {
      const res = await fetch(`/workflows/${workflow.id}.json`);
      const json = await res.json();
      navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const relatedWorkflows = WORKFLOWS
    .filter(w => w.id !== workflow.id && (w.category === workflow.category || w.tags.some(t => workflow.tags.includes(t))))
    .slice(0, 3);

  const difficultyColors = {
    Beginner: 'text-[#4ade80]',
    Intermediate: 'text-[#f59e0b]',
    Advanced: 'text-[#ef4444]',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] pb-24 pt-24">
      {/* ── SECTION 1: HERO / HEADER ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/workflows" className="inline-flex items-center gap-2 text-[#8888a0] hover:text-white transition-colors font-mono text-xs uppercase mb-10 group">
          <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Workflows
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-mono font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {workflow.title}
          </h1>
          <p className="text-xl text-[#8888a0] max-w-3xl leading-relaxed mb-8">
            {workflow.description}
          </p>
          
          <div className="flex flex-wrap gap-4">
             <div className="px-3 py-1 bg-[#22d3ee]/10 border border-[#22d3ee]/20 rounded text-[#22d3ee] text-[11px] font-mono font-bold uppercase tracking-widest backdrop-blur-sm">
              {workflow.category}
            </div>
            <div className={`px-3 py-1 bg-[#111113] border border-[#2a2a30] rounded text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${difficultyColors[workflow.difficulty]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {workflow.difficulty}
            </div>
            <div className="px-3 py-1 bg-[#111113] border border-[#2a2a30] rounded text-[11px] font-mono font-bold uppercase tracking-widest text-[#8888a0]">
              {workflow.vram} VRAM
            </div>
            <div className="px-3 py-1 bg-[#111113] border border-[#2a2a30] rounded text-[11px] font-mono font-bold uppercase tracking-widest text-[#8888a0] flex items-center gap-2">
              <Clock size={12} />
              {workflow.genTime.split(' RTX')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: TWO-COLUMN LAYOUT ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-10 gap-10">
        
        {/* LEFT COLUMN: PREVIEW + DOWNLOAD (60%) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111113] border border-[#2a2a30] rounded-lg overflow-hidden group">
            <div className="relative aspect-video w-full bg-[#0a0a0b] border-b border-[#2a2a30]">
               <div className="absolute inset-0 bg-grid opacity-10" />
               <Image
                src={`/workflow-previews/${workflow.id}.svg`}
                alt={workflow.title}
                fill
                className="object-contain p-4"
                onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="p-8 space-y-6">
              <DownloadButton workflowId={workflow.id} workflowTitle={workflow.title} />
              
              <div className="flex items-center gap-4 py-2">
                <div className="p-2 bg-[#7c6af7]/10 rounded border border-[#7c6af7]/20 text-[#7c6af7]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-[11px] font-mono text-[#8888a0] leading-normal uppercase">
                  Drag the downloaded .json file directly into ComfyUI to load the full node graph instantly.
                </p>
              </div>

              <button 
                onClick={handleCopyJSON}
                className="w-full flex items-center justify-center gap-2 py-4 border border-[#2a2a30] rounded-lg font-mono font-bold text-xs text-[#8888a0] hover:bg-[#1a1a1c] hover:text-white transition-all uppercase"
              >
                {copiedJSON ? (
                  <><Check size={14} className="text-[#4ade80]" /> JSON COPIED</>
                ) : (
                  <><Copy size={14} /> COPY WORKFLOW JSON</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INFO PANELS (40%) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Panel 1: SPECS */}
          <div className="bg-[#111113] border border-[#2a2a30] rounded-lg divide-y divide-[#2a2a30]">
            <div className="p-4 bg-[#111113]/50">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={14} className="text-[#7c6af7]" />
                Workflow Specs
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Type', value: workflow.category, icon: Zap },
                { label: 'Model', value: workflow.model, icon: Cpu },
                { label: 'VRAM Required', value: workflow.vram, icon: Maximize },
                { label: 'Gen Time', value: workflow.genTime, icon: Clock },
                { label: 'Resolution', value: workflow.resolution, icon: Maximize },
                { label: 'Difficulty', value: workflow.difficulty, icon: Info },
                { label: 'Version', value: workflow.version, icon: Terminal },
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-[#8888a0] uppercase tracking-wider">{spec.label}</span>
                  <span className={`text-[12px] font-bold ${spec.label === 'Difficulty' ? difficultyColors[workflow.difficulty] : 'text-[#e8e8f0]'}`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: REQUIRED MODELS */}
          <ModelPanel modelFilename={workflow.model} />

          {/* Panel 3: REQUIRED NODES */}
          <div className="bg-[#111113] border border-[#2a2a30] rounded-lg">
            <div className="p-4 border-b border-[#2a2a30] bg-[#111113]/50">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-[#7c6af7]" />
                Required Custom Nodes
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {workflow.customNodes.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-[11px] font-mono text-[#8888a0] uppercase">Install via Manager or git clone:</p>
                  <ul className="space-y-3">
                    {workflow.customNodes.map((node, idx) => (
                      <li key={idx}>
                        <a 
                          href={`https://github.com/search?q=${node}&type=repositories`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 group/node"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />
                          <span className="text-[12px] font-mono font-bold text-[#e8e8f0] group-hover:text-[#7c6af7] transition-colors">{node}</span>
                          <ExternalLink size={10} className="text-[#8888a0] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded">
                  <Check size={16} className="text-[#4ade80]" />
                  <span className="text-[11px] font-mono font-bold text-[#4ade80] uppercase">
                    Uses only built-in ComfyUI nodes. No extras needed.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Panel 4: HOW TO RUN */}
          <div className="bg-[#111113] border border-[#2a2a30] rounded-lg">
            <div className="p-4 border-b border-[#2a2a30] bg-[#111113]/50">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Play size={14} className="text-[#7c6af7]" />
                How To Run
              </h3>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {[
                  'Download the .json workflow',
                  'Download all required models to the paths shown above',
                  'Open ComfyUI in browser',
                  'Drag the .json onto the canvas',
                  'All nodes connect automatically',
                  'Set your prompt and hit Queue'
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[10px] font-mono font-bold text-[#7c6af7] mt-0.5">{i + 1}.</span>
                    <span className="text-[12px] text-[#e8e8f0] leading-tight">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: ABOUT / DESCRIPTION ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="bg-[#111113] border border-[#2a2a30] rounded-lg">
          <div className="p-5 border-b border-[#2a2a30]">
             <h3 className="text-xs font-mono font-bold text-[#8888a0] uppercase tracking-[0.2em]">About This Workflow</h3>
          </div>
          <div className="p-8">
            <p className="text-[#8888a0] text-sm md:text-base leading-relaxed md:leading-[1.8] whitespace-pre-wrap">
              {workflow.longDescription}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: PROOF TEST PROMPT ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="bg-[#111113] border border-[#2a2a30] rounded-lg overflow-hidden group">
          <div className="p-5 border-b border-[#2a2a30] flex items-center justify-between bg-[#111113]/50">
             <h3 className="text-xs font-mono font-bold text-[#f59e0b] uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={14} />
                Proof Test Prompt
             </h3>
             <span className="text-[10px] font-mono text-[#8888a0] uppercase">Use this to verify the workflow</span>
          </div>
          <div className="p-8 relative">
            <div className="absolute top-4 right-4 z-10">
               <button 
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 bg-[#0a0a0b] border border-[#2a2a30] px-4 py-2 rounded font-mono text-[10px] font-bold text-[#8888a0] hover:text-white hover:border-[#7c6af7] transition-all uppercase"
               >
                 {copiedPrompt ? <Check size={12} className="text-[#4ade80]" /> : <Copy size={12} />}
                 {copiedPrompt ? 'COPIED' : 'COPY PROMPT'}
               </button>
            </div>
            
            <div className="bg-[#0a0a0b] border border-[#2a2a30] rounded-lg p-6 md:p-10 font-mono text-center">
               <div className="max-w-2xl mx-auto">
                <span className="text-[#7c6af7] text-2xl opacity-40 mb-2 block leading-none">╔{"═".repeat(40)}╗</span>
                <p className="text-[#e8e8f0] text-sm md:text-lg italic leading-relaxed py-2">
                  &quot;Cinematic portrait of a weathered astronaut in a retro 1960s spacesuit, dramatic rim lighting, film grain, analog photography&quot;
                </p>
                <span className="text-[#7c6af7] text-2xl opacity-40 mt-2 block leading-none font-black">╚{"═".repeat(40)}╝</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: TAGS ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-wrap gap-2">
          {workflow.tags.map((tag, i) => (
            <Link 
              key={i} 
              href={`/workflows?tag=${tag.toLowerCase()}`}
              className="px-4 py-1.5 bg-[#111113] border border-[#2a2a30] rounded text-[10px] font-mono font-bold text-[#8888a0] uppercase tracking-wider hover:border-[#7c6af7] hover:text-white transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* ── SECTION 6: RELATED WORKFLOWS ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a30]/50 font-mono">
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-[#7c6af7]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              More workflows like this →
            </h2>
          </div>
          <Link href="/workflows" className="text-[11px] text-[#7c6af7] hover:underline uppercase font-bold tracking-widest">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedWorkflows.map((w) => (
            <WorkflowCard key={w.id} workflow={w} />
          ))}
        </div>
      </div>

    </div>
  );
}
