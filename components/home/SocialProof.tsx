"use client";

import React from "react";
import Link from "next/link";
import { Cpu, GitBranch, ShieldCheck } from "lucide-react";

// NOTE: This section previously carried three testimonials attributed to
// unnamed people ("Technical Creator @ AI_Labs"). They were not real, so they
// have been replaced with claims that can actually be verified on this site.
// If/when real, attributable user quotes exist, they can go here instead.
const PILLARS = [
  {
    icon: Cpu,
    title: "Hardware-scored, not hand-waved",
    body: "Every workflow is scored against your actual GPU across VRAM fit, RAM, and stability headroom — with the exact settings to make it run.",
    href: "/optimizer",
    cta: "Score my hardware",
  },
  {
    icon: GitBranch,
    title: "Workflows that import clean",
    body: "Each workflow ships as ready-to-import ComfyUI JSON with its required models, custom nodes, and folder paths listed up front.",
    href: "/workflows",
    cta: "Browse workflows",
  },
  {
    icon: ShieldCheck,
    title: "Open and inspectable",
    body: "The whole site is open source. Every guide, workflow, and benchmark figure can be read, checked, and corrected in public.",
    href: "https://github.com/shawnp30/neuraldrift.io",
    cta: "View the source",
    external: true,
  },
];

export const SocialProof = () => {
  return (
    <section className="border-t border-white/5 bg-transparent py-12">
      <div className="nh-container">
        <div className="mb-12 text-center">
          <div className="nh-section-label mb-4 justify-center">Why builders use it</div>
          <h2 className="font-syne text-4xl font-[800] tracking-tight text-white md:text-5xl">
            Built to be checked, not trusted
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="nh-glass-card group relative flex flex-col rounded-3xl p-10"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                  <Icon size={22} />
                </div>
                <h3 className="mb-4 font-syne text-xl font-[800] leading-snug text-white">
                  {p.title}
                </h3>
                <p className="mb-8 flex-1 text-[15px] font-[500] leading-relaxed text-zinc-400">
                  {p.body}
                </p>
                <Link
                  href={p.href}
                  {...(p.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="font-mono text-xs font-[800] uppercase tracking-widest text-accent transition-opacity hover:opacity-75"
                >
                  {p.cta} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
