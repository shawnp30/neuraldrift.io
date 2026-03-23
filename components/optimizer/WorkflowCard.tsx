'use client'
import Link from 'next/link'
import { getCompatColor, getScoreBarColor } from '@/lib/workflowMatcher'
import type { WorkflowMatch } from '@/lib/workflowMatcher'

export default function WorkflowCard({ workflow: w, rank }: { workflow: WorkflowMatch; rank: number }) {
  const compatClasses = getCompatColor(w.compatLabel)
  const barColor = getScoreBarColor(w.compatScore)
  const cardBorder = rank === 1 ? 'border-indigo-500/40' : 'border-zinc-800'
  const cardClass = 'rounded-2xl border bg-zinc-900/60 p-5 transition-all hover:border-zinc-600 ' + cardBorder
  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4 mb-3">
      </div>
    </div>
  )
}