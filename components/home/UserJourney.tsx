// components/home/UserJourney.tsx
import Link from 'next/link'

const PATHS = [
  {
    level: 'BEGINNER',
    icon: '🚀',
    title: 'Start Here',
    desc: 'New to AI generation? Get a working setup in under 10 minutes.',
    href: '/start-here',
    color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    badge: 'emerald',
  },
  {
    level: 'INTERMEDIATE',
    icon: '⚡',
    title: 'Optimize My Setup',
    desc: 'Already running ComfyUI? Squeeze every last bit of VRAM performance.',
    href: '/optimizer',
    color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
    badge: 'indigo',
  },
  {
    level: 'ADVANCED',
    icon: '🧠',
    title: 'Build Custom Workflow',
    desc: 'Design multi-model pipelines, train LoRAs, automate batch outputs.',
    href: '/workflows/generate',
    color: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
    badge: 'violet',
  },
]

export default function UserJourney() {
  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-2">
        Where do you want to start?
      </h2>
      <p className="text-zinc-500 text-center mb-10">
        Pick your path. We'll get you to results fast.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PATHS.map((p) => (
          <Link
            key={p.level}
            href={p.href}
            className={`group relative rounded-2xl border bg-gradient-to-b p-6 hover:scale-[1.02] transition-all ${p.color}`}
          >
            <div className="text-3xl mb-3">{p.icon}</div>
            <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-1">
              {p.level}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
            <div className="mt-4 text-sm font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Get started →
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}