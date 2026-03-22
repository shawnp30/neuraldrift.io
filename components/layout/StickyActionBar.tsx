// components/layout/StickyActionBar.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function StickyActionBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-400 hidden sm:block">
          Build faster. Generate smarter.
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href="/optimizer"
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-all"
          >
            Generate Workflow
          </Link>
          <Link
            href="/optimizer/fix-my-pc"
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold text-center transition-all"
          >
            Fix My PC
          </Link>
          <Link
            href="/guides"
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold text-center transition-all"
          >
            Browse Guides
          </Link>
        </div>
      </div>
    </div>
  )
}