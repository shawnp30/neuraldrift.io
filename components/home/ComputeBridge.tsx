"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function ComputeBridge() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible")
        ),
      { threshold: 0.1 }
    );
    ref.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-10 py-16">
      <div className="reveal from-accent-purple/8 relative overflow-hidden rounded-xl border border-accent-purple/25 bg-gradient-to-br to-accent/5">
        <div className="pointer-events-none absolute left-1/2 top-[-50%] h-[400px] w-[400px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)]" />

        <div className="grid grid-cols-2 gap-0">
          {/* Left: Main CTA */}
          <div className="border-r border-accent-purple/15 p-14">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#a78bfa]">
              // Hardware Partner
            </p>
            <h2 className="relative mb-4 font-syne text-4xl font-black tracking-tight text-white">
              Need a better rig
              <br />
              for these workflows?
            </h2>
            <p className="relative mb-8 max-w-sm font-light leading-relaxed text-muted">
              ComputeAtlas is an AI workstation planning platform. Tell it what
              you want to run — it tells you exactly what hardware to buy.
            </p>
            <Link
              href="https://computeatlas.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="glow-purple relative inline-block rounded bg-accent-purple px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Plan Your AI Rig →
            </Link>
          </div>

          {/* Right: Feature list */}
          <div className="p-14">
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
              What ComputeAtlas does
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: "🔧",
                  title: "Workstation Builder",
                  desc: "Pick GPU, CPU, RAM, NVMe — see power draw and pricing in real time",
                },
                {
                  icon: "📊",
                  title: "Hardware Estimator",
                  desc: "Input your AI workload, get exact VRAM and system requirements",
                },
                {
                  icon: "⚡",
                  title: "Recommended Builds",
                  desc: "Pre-configured rigs for creators, fine-tuning, research, and enterprise",
                },
                {
                  icon: "🔄",
                  title: "Compare Configs",
                  desc: "Side-by-side hardware comparison before you commit",
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-lg">{f.icon}</span>
                  <div>
                    <div className="font-syne text-sm font-bold text-white">
                      {f.title}
                    </div>
                    <div className="mt-0.5 font-mono text-xs leading-relaxed text-muted">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
