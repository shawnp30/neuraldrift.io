// components/optimizer/WorkflowCard.tsx
'use client'

import Link from 'next/link'
import { getCompatColor, getScoreBarColor, type WorkflowMatch } from '@/lib/workflowMatcher'

export default function WorkflowCard({ workflow: w, rank }: { workflow: WorkflowMatch; rank: number }) {
  const compatClasses = getCompatColor(w.compatLabel)
  const barColor = getScoreBarColor(w.compatScore)
  const cardBorder = rank === 1 ? 'border-indigo-500/40' : 'border-zinc-800'
  const cardClass = 'rounded-2xl border bg-zinc-900/60 p-5 transition-all hover:border-zinc-600 ' + cardBorder

  return (
    <div className={cardClass}>

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {rank === 1 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              Best Match
            </span>
          )}
          <span className={'text-xs font-semibold px-2 py-0.5 rounded-full border ' + compatClasses}>
            {w.compatLabel}
          </span>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
            {w.difficulty}
          </span>
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{w.estimatedTime}</span>
      </div>

      <h2 className="text-lg font-bold text-white mb-1">{w.name}</h2>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">{w.desc}</p>

      <div className="flex gap-4 text-xs text-zinc-600 mb-4">
        <span>Model: <span className="text-zinc-400">{w.model}</span></span>
        <span>Steps: <span className="text-zinc-400">{w.steps}</span></span>
        <span>CFG: <span className="text-zinc-400">{w.cfg}</span></span>
        <span>VRAM: <span className="text-zinc-400">{w.vramRequired}GB</span></span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-600 mb-1">
          <span>Hardware compatibility</span>
          <span className="text-zinc-400 font-medium">{w.compatScore}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={'h-full rounded-full transition-all ' + barColor}
            style={{ width: `${w.compatScore}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        
          href={'/workflows/' + w.filename + '.json'}
          download
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-all"
        >
          Download JSON
        </a>
        {w.guideSlug && (
          <Link
            href={'/guides/' + w.guideSlug}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-all"
          >
            View Guide
          </Link>
        )}
        
          href={'/workflows/' + w.filename + '.json'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-all"
        >
          Preview
        </a>
      </div>

    </div>
  )
}