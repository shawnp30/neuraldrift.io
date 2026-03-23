// app/optimizer/result/ResultClient.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getMatches,
  getCompatColor,
  getScoreBarColor,
  type VramTier,
  type GoalType,
  type WorkflowMatch,
} from '@/lib/workflowMatcher'

const GOAL_LABELS: Record<GoalType, string> = {
  video:   'AI Video',
  image:   'AI Images',
  lora:    'LoRA Training',
  upscale: 'Upscaling',
}

const GOAL_ICONS: Record<GoalType, string> = {
  video:   '🎬',
  image:   '🖼️',
  lora:    '🧬',
  upscale: '🔍',
}

export default function ResultClient() {
  const params = useSearchParams()
  const router = useRouter()

  const vram = (params.get('gpu') ?? '8GB') as VramTier
  const goal = (params.get('goal') ?? 'image') as GoalType
  const matches = getMatches(vram, goal)

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-16">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="text-zinc-600 hover:text-zinc-400 text-sm mb-6 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{GOAL_ICONS[goal]}</span>
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                Matched for your setup
              </p>
              <h1 className="text-2xl font-bold text-white">
                {GOAL_LABELS[goal]} · {vram} VRAM
              </h1>
            </div>
          </div>

          <p className="text-zinc-400 text-sm">
            {matches.length} workflow{matches.length !== 1 ? 's' : ''} ranked by
            compatibility — highest score first.
          </p>
        </div>

        {/* ── Workflow Cards ── */}
        {matches.length === 0 ? (
          <NoMatches vram={vram} goal={goal} />
        ) : (
          <div className="space-y-4 mb-12">
            {matches.map((w, i) => (
              <WorkflowCard key={w.id} workflow={w} rank={i + 1} />
            ))}
          </div>
        )}

        {/* ── Secondary CTAs ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Not what you needed?</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              Try a different GPU tier or creative goal.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold text-center transition-all"
            >
              ← Start Over
            </Link>
            <Link
              href="/optimizer/fix-my-pc"
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-all"
            >
              Fix My PC →
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}

// ─── Workflow Card ────────────────────────────────────────────────────────────

function WorkflowCard({ workflow: w, rank }: { workflow: WorkflowMatch; rank: number }) {
  const compatClasses = getCompatColor(w.compatLabel)
  const barColor = getScoreBarColor(w.compatScore)

  return (
    <div className={`rounded-2xl border bg-zinc-900/60 p-5 transition-all hover:border-zinc-600 ${
      rank === 1 ? 'border-indigo-500/40' : 'border-zinc-800'
    }`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {rank === 1 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              ⚡ Best Match
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${compatClasses}`}>
            {w.compatLabel}
          </span>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
            {w.difficulty}
          </span>
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{w.estimatedTime}</span>
      </div>

      {/* Name + desc */}
      <h2 className="text-lg font-bold text-white mb-1">{w.name}</h2>
      <p className="text-sm text-zinc-400 leading-relaxed mb-4">{w.desc}</p>

      {/* Specs row */}
      <div className="flex gap-4 text-xs text-zinc-600 mb-4">
        <span>Model: <span className="text-zinc-400">{w.model}</span></span>
        <span>Steps: <span className="text-zinc-400">{w.steps}</span></span>
        <span>CFG: <span className="text-zinc-400">{w.cfg}</span></span>
        <span>VRAM: <span className="text-zinc-400">{w.vramRequired}GB</span></span>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-600 mb-1">
          <span>Hardware compatibility</span>
          <span className="text-zinc-400 font-medium">{w.compatScore}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${w.compatScore}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        
          href={`/public/workflows/${w.filename}.json`}
          download
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-all"
        >
          Download JSON
        </a>
        {w.guideSlug && (
          <Link
            href={`/guides/${w.guideSlug}`}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-all"
          >
            View Guide
          </Link>
        )}
        
          href={`/public/workflows/${w.filename}.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-all"
          title="Preview JSON"
        >
          { }
        </a>
      </div>

    </div>
  )
}

// ─── No Matches Fallback ──────────────────────────────────────────────────────

function NoMatches({ vram, goal }: { vram: VramTier; goal: GoalType }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center mb-12">
      <div className="text-3xl mb-3">⚠️</div>
      <h2 className="text-lg font-bold text-white mb-2">
        No workflows confirmed for {vram} + {GOAL_LABELS[goal]}
      </h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
        Your VRAM may be below the minimum for this goal. Try the PC optimizer
        to find workarounds, or browse lower-requirement options.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/optimizer/fix-my-pc"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          Fix My PC →
        </Link>
        <Link
          href="/guides/fix-out-of-memory"
          className="px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold transition-all"
        >
          Out of Memory Fix Guide
        </Link>
      </div>
    </div>
  )
}