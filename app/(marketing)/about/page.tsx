import React from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/about",
  "About NeuralDrift",
  "Learn more about the mission behind NeuralDrift — ComfyUI workflows, guides, and tools for local AI."
);

export default function AboutPage() {
  return (
    <div className="nh-section flex min-h-[70vh] flex-col items-center justify-center">
      <div className="nh-container text-center">
        <div className="nh-section-label mb-6 justify-center">
          <span className="nh-nl-dot"></span> About Us{" "}
          <span className="nh-nl-dot"></span>
        </div>
        <h1 className="nh-h2 mb-6">Built for Creators</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-400">
          NeuralDrift is dedicated to providing high-performance ComfyUI
          workflows, technical AI guides, and hardware optimization tools for
          local generation.
        </p>
      </div>
    </div>
  );
}
