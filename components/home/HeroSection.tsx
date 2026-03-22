// components/home/HeroSection.tsx — REPLACE FULL FILE
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GPU_OPTIONS = ['8GB', '12GB', '16GB', '24GB', '48GB+']
const GOAL_OPTIONS = [
  { value: 'video', label: 'AI Video' },
  { value: 'image', label: 'AI Images' },
  { value: 'lora', label: 'Train LoRA' },
  { value: 'upscale', label: 'Upscaling' },
]

export default function HeroSection() {
  const [gpu, setGpu] = useState('')
  const [goal, setGoal] = useState('')
  const router = useRouter()

  const handleGenerate = () => {
    if (!gpu || !goal) return
    router.push(`/optimizer/result?gpu=${gpu}&goal=${goal}`)
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          50+ Optimized Workflows
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
          Get the Exact AI Workflow
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            for Your PC in Seconds
          </span>
        </h1>

        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
          No guesswork. No wasted VRAM. Personalized to your hardware.
        </p>

        {/* Selector widget */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* GPU Select */}
            <div className="text-left">
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2 block">
                Your GPU VRAM
              </label>
              <div className="flex flex-wrap gap-2">
                {GPU_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGpu(g)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      gpu === g
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-indigo-500/50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Select */}
            <div className="text-left">
              <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2 block">
                What do you want to create?
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      goal === g.value
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-indigo-500/50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!gpu || !goal}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-all"
          >
            Generate My Workflow →
          </button>
        </div>

        {/* Trust bar */}
        <p className="mt-5 text-sm text-zinc-600">
          Free · No signup required · Works with ComfyUI
        </p>
      </div>
    </section>
  )
}