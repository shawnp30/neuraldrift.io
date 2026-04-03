'use client';
import Link from 'next/link';
import Image from 'next/image';
import { WorkflowEntry } from '@/lib/workflowsData';
import { DownloadButton } from './DownloadButton';
import { MoveRight, Cpu, Clock, Layers, Zap } from 'lucide-react';

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
    <div className="group relative flex flex-col bg-[#111113] border border-[#2a2a30] rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#7c6af7]/50 hover:shadow-[0_0_30px_rgba(124,106,247,0.15)]">
      {/* ── PREVIEW SECTION ────────────────────────────────────────────────── */}
      <div className="relative aspect-video w-full bg-[#0a0a0b] overflow-hidden">
        {/* We use an image if available, fallback to a styled placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-grid opacity-20" />
        
        <Image
          src={`/workflow-previews/${workflow.id}.svg`}
          alt={workflow.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Simple fallback if SVG is missing
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "absolute inset-0 flex flex-col items-center justify-center p-6 text-center";
              fallback.innerHTML = `
                <div class="text-[#7c6af7]/20 font-mono text-[80px] font-black uppercase select-none leading-none mb-2">NEURAL</div>
                <div class="text-[#8888a0] font-mono text-xs uppercase tracking-[0.3em] font-bold">${workflow.category}</div>
              `;
              parent.appendChild(fallback);
            }
          }}
        />

        {/* OVERLAYS */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-[#0a0a0b]/80 border border-[#22d3ee]/30 rounded text-[#22d3ee] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm">
          {workflow.category}
        </div>
        
        <div className={`absolute top-3 right-3 px-2 py-1 border rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm ${difficultyColors[workflow.difficulty]}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5" style={{ backgroundColor: difficultyDot[workflow.difficulty] }} />
          {workflow.difficulty}
        </div>
      </div>

      {/* ── CONTENT SECTION ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3">
          <h3 className="text-lg font-mono font-bold text-[#e8e8f0] leading-tight mb-1 group-hover:text-white transition-colors uppercase">
            {workflow.title}
          </h3>
          <p className="text-[#8888a0] text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {workflow.description}
          </p>
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 pt-4 border-t border-[#2a2a30]">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#7c6af7]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8888a0] uppercase tracking-tighter leading-none mb-1">Model</span>
              <span className="text-[11px] font-mono text-[#e8e8f0] truncate max-w-[80px]" title={workflow.model}>{workflow.model}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#7c6af7]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8888a0] uppercase tracking-tighter leading-none mb-1">VRAM Req</span>
              <span className="text-[11px] font-mono text-[#e8e8f0]">{workflow.vram}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#7c6af7]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8888a0] uppercase tracking-tighter leading-none mb-1">Gen Time</span>
              <span className="text-[11px] font-mono text-[#e8e8f0]">{workflow.genTime.split(' on')[0]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#7c6af7]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8888a0] uppercase tracking-tighter leading-none mb-1">Node Count</span>
              <span className="text-[11px] font-mono text-[#e8e8f0]">{workflow.customNodes.length > 0 ? workflow.customNodes.length + 8 : 'Native'}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-auto space-y-2">
          <DownloadButton workflowId={workflow.id} workflowTitle={workflow.title} />
          
          <Link 
            href={`/workflows/${workflow.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-[11px] font-mono font-bold text-[#8888a0] hover:text-white transition-colors group/link"
          >
            VIEW DETAILS
            <MoveRight size={14} className="transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
