import React from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/changelog",
  "Changelog",
  "Recent updates and new workflows added to NeuralDrift."
);

export default function ChangelogPage() {
  return (
    <div className="nh-section flex min-h-[70vh] flex-col items-center pt-32">
      <div className="nh-container w-full max-w-4xl">
        <div className="nh-section-label mb-6">
          <span className="nh-nl-dot"></span> Changelog
        </div>
        <h1 className="nh-h2 mb-12">Latest Updates</h1>

        <div className="ml-4 space-y-12 border-l border-zinc-800 pl-8">
          <div className="relative">
            <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-accent" />
            <h3 className="mb-2 text-xl font-bold text-white">
              Search &amp; Performance Cleanup
            </h3>
            <p className="mb-4 font-mono text-xs text-accent">April 2026</p>
            <p className="leading-relaxed text-zinc-400">
              Fixed redirect and routing issues affecting Google indexing,
              resolved Lighthouse-flagged performance and accessibility
              issues (LCP, render-blocking fonts, image loading), and
              trimmed redundant content across the site.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-accent" />
            <h3 className="mb-2 text-xl font-bold text-white">
              Live Background &amp; Visual Polish
            </h3>
            <p className="mb-4 font-mono text-xs text-accent">April 2026</p>
            <p className="leading-relaxed text-zinc-400">
              Replaced the static hero background with a live animated
              neural background, and cleaned up footer and navigation
              labeling site-wide.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-accent" />
            <h3 className="mb-2 text-xl font-bold text-white">
              NeuralDrift v2.0 Platform Launch
            </h3>
            <p className="mb-4 font-mono text-xs text-accent">April 2026</p>
            <p className="leading-relaxed text-zinc-400">
              Complete platform overhaul featuring our new interactive GPU
              calculator, premium animated UI, and an expanded library of
              optimized ComfyUI workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
