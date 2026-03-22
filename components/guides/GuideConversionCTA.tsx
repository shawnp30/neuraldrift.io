// components/guides/GuideConversionCTA.tsx
import Link from 'next/link'

interface Props {
  workflowId?: string
  workflowName?: string
}

export default function GuideConversionCTA({
  workflowId,
  workflowName = 'This Workflow',
}: Props) {
  return (
    <div className="mt-16 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-8 text-center">
      <div className="text-2xl mb-2">👉</div>
      <h3 className="text-xl font-bold text-white mb-2">
        Want this setup pre-built?
      </h3>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm">
        Download the ready-to-import ComfyUI workflow JSON — optimized and
        node-connected.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {workflowId ? (
          
            href={`/workflows/${workflowId}`}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
          >
            Download {workflowName} →
          </a>
        ) : (
          <Link
            href="/workflows/generate"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
          >
            Generate Workflow for My PC →
          </Link>
        )}
        <Link
          href="/guides"
          className="px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold transition-all"
        >
          Browse All Guides
        </Link>
      </div>
    </div>
  )
}