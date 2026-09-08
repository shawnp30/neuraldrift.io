'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getMatches,
  type VramTier,
  type GoalType,
} from '@/lib/workflowMatcher'
import WorkflowCard from '@/components/optimizer/WorkflowCard'

const GOAL_LABELS: Record<GoalType, string> = {
  video: 'AI Video',
  image: 'AI Images',
  lora: 'LoRA Training',
  upscale: 'Upscaling',
}

const GOAL_ICONS: Record<GoalType, string> = {
  video: '🎬',
  image: '🖼️',
  lora: '🧬',
  upscale: '🔍',
}

export default function ResultClient() {
  const params = useSearchParams()
  const router = useRouter()

  const vram = (params.get('gpu') ?? '8GB') as VramTier
  const goal = (params.get('goal') ?? 'image') as GoalType
  const matches = getMatches(vram, goal)

  return (
    <main className="min-h-screen bg-transparent px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="text-zinc-600 hover:text-zinc-400 text-sm mb-6 flex items-center gap-1 transition-colors"
          >
            Back
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

        {matches.length === 0 ? (
          <NoMatches vram={vram} goal={goal} />
        ) : (
          <div className="space-y-4 mb-12">
            {matches.map((w, i) => (
              <WorkflowCard key={w.id} workflow={w} rank={i + 1} />
            ))}
          </div>
        )}

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
              Start Over
            </Link>
            <Link
              href="/optimizer/fix-my-pc"
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-all"
            >
              Fix My PC
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function NoMatches({ vram, goal }: { vram: VramTier; goal: GoalType }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center mb-12">
      <div className="text-3xl mb-3">⚠️</div>
      <h2 className="text-lg font-bold text-white mb-2">
        No workflows confirmed for {vram} + {GOAL_LABELS[goal]}
      </h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
        Your VRAM may be below the minimum for this goal. Try the PC optimizer to find workarounds.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/optimizer/fix-my-pc"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          Fix My PC
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
