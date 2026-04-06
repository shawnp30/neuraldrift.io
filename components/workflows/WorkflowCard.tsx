'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WorkflowEntry } from '@/lib/workflowsData';
import { DownloadButton } from './DownloadButton';
import { MoveRight, Cpu, Clock, Layers, Zap, Info } from 'lucide-react';

export default function WorkflowCard({ workflow }: { workflow: WorkflowEntry }) {
  const difficultyColors = {
    Beginner: 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20',
    Intermediate: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
    Advanced: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20',
  };

  const difficultyDot = {
    Beginner: '#4ade80',
    Intermediate: '#f59e0b',
    Advanced: '#ef4444',
  };

  return (
    <div className="group relative flex flex-col bg-[#111113] border border-[#2a2a30] rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#7c6af7]/50 hover:shadow-[0_0_40px_rgba(124,106,247,0.1)]">
      {/* ── PREVIEW SECTION ────────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full bg-[#0a0a0b] overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-10" />
        
        {/* Main Proof Image */}
        <Image
          src={workflow.imageUrl}
          alt={workflow.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* OVERLAYS */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-[#0a0a0b]/80 border border-[#22d3ee]/30 rounded text-[#22d3ee] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md z-10">
          {workflow.category}
        </div>
        
        <div className={`absolute top-3 right-3 px-2 py-1 border rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md z-10 ${difficultyColors[workflow.difficulty]}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5" style={{ backgroundColor: difficultyDot[workflow.difficulty] }} />
          {workflow.difficulty}
        </div>

        {/* Hover Hint */}
        <div className="absolute inset-0 bg-[#0a0a0b]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
           <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-[10px] font-mono font-bold tracking-widest flex items-center gap-2">
             <Info size={12} />
             EXPAND ANALYSIS
           </div>
        </div>
      </div>

      {/* ── CONTENT SECTION ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-mono font-bold text-white leading-tight mb-2 group-hover:text-[#7c6af7] transition-colors uppercase tracking-tight">
            {workflow.title}
          </h3>
          <p className="text-[#9a9ca8] text-xs leading-relaxed line-clamp-2 min-h-[3.0rem]">
            {workflow.description}
          </p>
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6 pt-4 border-t border-[#2a2a30]">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#22d3ee]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#7a7c8a] uppercase tracking-wider leading-none mb-1">Model</span>
              <span className="text-[10px] font-mono text-[#e8e8f0] truncate max-w-[80px]" title={workflow.model}>{workflow.model}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#a855f7]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#7a7c8a] uppercase tracking-wider leading-none mb-1">VRAM</span>
              <span className="text-[10px] font-mono text-[#e8e8f0]">{workflow.vram}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#4ade80]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#7a7c8a] uppercase tracking-wider leading-none mb-1">Compute</span>
              <span className="text-[10px] font-mono text-[#e8e8f0] truncate">{workflow.genTime.split(' on')[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#f59e0b]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#7a7c8a] uppercase tracking-wider leading-none mb-1">Version</span>
              <span className="text-[10px] font-mono text-[#e8e8f0]">{workflow.version}</span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto flex flex-col gap-3">
          <DownloadButton workflowId={workflow.id} workflowTitle={workflow.title} />
          
          <Link 
            href={`/workflows/${workflow.id}`}
            className="flex items-center justify-center gap-2 w-full py-2 text-[10px] font-mono font-bold text-[#7a7c8a] hover:text-[#7c6af7] border border-transparent hover:border-[#7c6af7]/20 rounded transition-all group/link"
          >
            DOCUMENTATION & PROMPT
            <MoveRight size={14} className="transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Aesthetic Border Accent */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#7c6af7] group-hover:w-full transition-all duration-500" />
    </div>
  );
}
