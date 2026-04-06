"use client";

import Link from "next/link";

const EXPECTATIONS = [
  {
    step: "01",
    title: "Generate",
    description:
      "Start with workflows, tools, or guided pages built to help you create music, images, video, characters, datasets, and training assets without setup friction.",
  },
  {
    step: "02",
    title: "Refine",
    description:
      "Adjust prompts, captions, LoRA settings, hardware-fit choices, and creative direction in one place instead of bouncing between scattered tools.",
  },
  {
    step: "03",
    title: "Export",
    description:
      "Move directly into ComfyUI, your workstation, or any external pipeline with production-ready outputs that are structured to keep momentum high.",
  },
];

const EXAMPLE_FLOW = [
  "Pick a workflow or creative tool that matches the idea you want to explore.",
  "Customize the prompt, settings, or dataset details without digging through technical setup.",
  "Export the result into ComfyUI or your own pipeline and keep building from there.",
];

export function ExpectationSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/6 bg-[#0a0d13] py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[8%] top-12 h-40 w-40 rounded-full bg-accent-cyan/8 blur-[110px]" />
        <div className="absolute bottom-0 right-[10%] h-52 w-52 rounded-full bg-accent-purple/10 blur-[130px]" />
      </div>

      <div className="nh-container relative z-10">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent-cyan">
            <span className="h-2 w-2 rounded-full bg-accent-cyan" />
            What To Expect
          </div>
          <h2 className="font-syne text-4xl font-[800] leading-tight tracking-tight text-white md:text-5xl">
            One place to create, refine, and ship AI work.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-300">
            NeuralDrift is a complete creative AI environment designed for people who want to build, experiment, and produce without technical barriers. The platform brings music generation, image and video creation, character design, dataset building, LoRA workflows, and automation tools into one unified space. Everything is structured for speed and simplicity: generate content, refine it, and export directly to ComfyUI, your workstation, or any external pipeline. Whether you&apos;re a beginner or an advanced builder, NeuralDrift gives you the freedom to explore ideas and turn them into production-ready assets with minimal effort.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  Workflow Preview
                </p>
                <h3 className="mt-2 font-syne text-2xl font-[800] text-white">
                  A fast first run
                </h3>
              </div>
              <div className="rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-cyan">
                Example
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#05070b]">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  NeuralDrift Session
                </span>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    Start Here
                  </p>
                  <h3 className="mt-3 font-syne text-xl font-[800] text-white">
                    FLUX Food Photography
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Build a polished food image, tune the creative direction,
                    then export the setup for ComfyUI or your own local stack.
                  </p>
                </div>

                <div className="space-y-3">
                  {EXAMPLE_FLOW.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3"
                    >
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-purple">
                        Step 0{index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-sm md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                Your Experience
              </p>
              <div className="mt-5 space-y-4">
                {EXPECTATIONS.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-2xl border border-white/8 bg-[#0d1219] px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent-cyan/20 bg-accent-cyan/10 font-mono text-xs font-[700] text-accent-cyan">
                        {item.step}
                      </span>
                      <h3 className="font-syne text-xl font-[800] text-white">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 pl-12 text-sm leading-6 text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-7 md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                For New And Advanced Builders
              </p>
              <p className="mt-4 text-base leading-7 text-zinc-300">
                Start simple if you&apos;re new. Go deeper if you already know
                your tools. The point is the same either way: less setup drag,
                more finished work.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/workflows"
                  className="rounded-xl bg-accent-cyan px-5 py-3 text-center text-sm font-[800] text-black transition-transform hover:scale-[1.01]"
                >
                  Explore Workflows
                </Link>
                <Link
                  href="/guides"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center text-sm font-[700] text-white transition-colors hover:bg-white/[0.07]"
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
