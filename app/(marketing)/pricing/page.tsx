import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | NeuralDrift",
  description: "Simple pricing for premium workflows and tools.",
};

export default function PricingPage() {
  return (
    <div className="nh-section flex min-h-[70vh] flex-col items-center justify-center pt-32">
      <div className="nh-container w-full max-w-6xl text-center">
        <div className="nh-section-label mb-6 justify-center">
          <span className="nh-nl-dot"></span> Plans & Pricing{" "}
          <span className="nh-nl-dot"></span>
        </div>
        <h1 className="nh-h2 mb-6">Unlock Full Power</h1>
        <p className="mx-auto mb-16 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Get unlimited access to premium workflows, advanced hardware
          calculator metrics, and priority support.
        </p>

        <div className="mx-auto grid max-w-4xl gap-8 text-left md:grid-cols-2">
          <div className="nh-newsletter-box !p-10 !text-left">
            <h3 className="mb-2 text-2xl font-bold text-white">Hobbyist</h3>
            <p className="mb-6 font-mono text-sm text-zinc-400">Free Forever</p>
            <div className="mb-8 text-4xl font-bold text-white">
              $0<span className="text-lg font-normal text-zinc-500">/mo</span>
            </div>
            <ul className="mb-8 space-y-4 text-sm text-zinc-300">
              <li>✓ Basic Workflows</li>
              <li>✓ Standard GPU Calculator</li>
              <li>✓ Community Access</li>
            </ul>
            <button className="h-12 w-full rounded-xl border border-white/10 bg-white/5 font-bold text-white transition-colors hover:bg-white/10">
              Current Plan
            </button>
          </div>

          <div className="nh-newsletter-box relative border-accent/30 !p-10 !text-left">
            <div className="absolute right-0 top-0 rounded-bl-xl bg-accent px-4 py-1 text-[10px] font-bold uppercase text-black">
              Pro
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">Architect</h3>
            <p className="mb-6 font-mono text-sm text-accent">Full Access</p>
            <div className="mb-8 text-4xl font-bold text-white">
              $15<span className="text-lg font-normal text-zinc-500">/mo</span>
            </div>
            <ul className="mb-8 space-y-4 text-sm text-zinc-300">
              <li>✓ All Premium Workflows</li>
              <li>✓ Advanced Cluster Estimator</li>
              <li>✓ VIP Support Channel</li>
            </ul>
            <button className="h-12 w-full rounded-xl bg-accent font-bold text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-colors hover:bg-accent/90">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
