// app/optimizer/result/page.tsx
import { Suspense } from 'react'
import ResultClient from './ResultClient'

export const metadata = {
  title: 'Your Personalized AI Workflow | NeuralHub',
  description: 'Workflows matched and scored for your exact GPU VRAM and creative goal.',
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-zinc-500 text-sm animate-pulse">Matching workflows to your hardware…</div>
      </div>
    }>
      <ResultClient />
    </Suspense>
  )
}