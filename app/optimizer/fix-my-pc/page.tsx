import Link from 'next/link'

export const metadata = {
  title: 'Fix My PC Optimizer | neuraldrift',
  description: 'Learn how to optimize your PC and overcome VRAM limitations for AI workflows.'
}

export default function FixMyPcPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link
            href="/optimizer"
            className="text-zinc-600 hover:text-zinc-400 text-sm mb-6 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to Optimizer
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💻</span>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Fix My PC
            </h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Running into VRAM bottlenecks or slow generation times? Here are strategies to optimize your setup for modern AI workflows.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <h2 className="text-xl font-bold text-white mb-2">1. Use Lower Precision Models (Quantization)</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              If you lack the VRAM for full FP16 models, consider using quantized versions (GGUF or NF4). These can drastically reduce memory footprint with minimal impact on final quality. FLUX Dev inside ComfyUI works wonderfully as an 8-bit GGUF on standard consumer cards.
            </p>
            <Link href="/guides" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Browse Guides on GGUF and optimization →
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <h2 className="text-xl font-bold text-white mb-2">2. Optimize ComfyUI Arguments</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Adding arguments like <code className="bg-zinc-800 px-1 py-0.5 rounded text-indigo-300">--lowvram</code> or <code className="bg-zinc-800 px-1 py-0.5 rounded text-indigo-300">--medvram</code> to your ComfyUI startup bat script can prevent Out of Memory (OOM) errors by more aggressively offloading weights to system RAM, though it will mildly slow down generation speeds.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <h2 className="text-xl font-bold text-white mb-2">3. Hardware Upgrades</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Local AI is heavily dependent on VRAM bandwidth and capacity. If you're consistently hitting bounds on 8GB cards, upgrading to a 16GB tier (such as the RTX 4070 Ti Super or 5080) or an enthusiast 24GB card (RTX 3090/4090) is the best reliable long-term solution.
            </p>
            <a href="https://computeatlas.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Plan your hardware upgrade with ComputeAtlas.ai ↗
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
