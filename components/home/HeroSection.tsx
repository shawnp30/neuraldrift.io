// components/home/HeroSection.tsx — REPLACE FULL FILE
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GPU_OPTIONS = ["8GB", "12GB", "16GB", "24GB", "48GB+"];
const GOAL_OPTIONS = [
  { value: "video", label: "AI Video" },
  { value: "image", label: "AI Images" },
  { value: "lora", label: "Train LoRA" },
  { value: "upscale", label: "Upscaling" },
];

export default function HeroSection() {
  const [gpu, setGpu] = useState("");
  const [goal, setGoal] = useState("");
  const router = useRouter();

  const handleGenerate = () => {
    if (!gpu || !goal) return;
    router.push(`/optimizer/result?gpu=${gpu}&goal=${goal}`);
  };

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          50+ Optimized Workflows
        </div>

        <h1 className="mb-4 text-5xl font-bold leading-tight text-white md:text-6xl">
          Get the Exact AI Workflow
          <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            for Your PC in Seconds
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-400">
          No guesswork. No wasted VRAM. Personalized to your hardware.
        </p>

        {/* Selector widget */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* GPU Select */}
            <div className="text-left">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Your GPU VRAM
              </label>
              <div className="flex flex-wrap gap-2">
                {GPU_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGpu(g)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      gpu === g
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-indigo-500/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Select */}
            <div className="text-left">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                What do you want to create?
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      goal === g.value
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-indigo-500/50"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!gpu || !goal}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate My Workflow →
          </button>
        </div>

        {/* Trust bar */}
        <p className="mt-5 text-sm text-zinc-600">
          Free · No signup required · Works with ComfyUI
        </p>
      </div>
    </section>
  );
}
