'use client'
import Link from 'next/link'
import { getCompatColor, getScoreBarColor } from '@/lib/workflowMatcher'
import type { WorkflowMatch } from '@/lib/workflowMatcher'

export default function WorkflowCard({ workflow: w, rank }: { workflow: WorkflowMatch; rank: number }) {
  const compatClasses = getCompatColor(w.compatLabel)
  const barColor = getScoreBarColor(w.compatScore)
  const cardBorder = rank === 1 ? 'border-indigo-500/40' : 'border-zinc-800'
  const cardClass = 'rounded-2xl border bg-zinc-900/60 transition-all hover:border-zinc-600 overflow-hidden flex flex-col relative ' + cardBorder

  return (
    <div className={cardClass}>
      {/* Top visually colored score bar marker */}
      <div className={`absolute top-0 left-0 h-1 w-full ${barColor}`} style={{ opacity: w.compatScore / 100 }} />
      
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${compatClasses}`}>
                {w.compatLabel} Match
              </span>
              <span className="text-zinc-500 text-xs font-mono">{w.compatScore}/100</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {w.name}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
              {w.desc}
            </p>
          </div>
          {w.guideSlug && (
            <Link 
              href={`/guides/${w.guideSlug}`}
              className="shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors text-center"
            >
              Get Workflow
            </Link>
          )}
        </div>
        
        {/* Technical specs grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-zinc-800/50">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Model</p>
            <p className="text-zinc-300 text-sm font-mono max-w-[120px] truncate" title={w.model}>{w.model}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">VRAM Req</p>
            <p className="text-zinc-300 text-sm font-mono">{w.vramRequired}GB</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Time (Est)</p>
            <p className="text-zinc-300 text-sm font-mono">{w.estimatedTime}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Difficulty</p>
            <p className="text-zinc-300 text-sm">{w.difficulty}</p>
          </div>
        </div>
      </div>
    </div>
  )
}