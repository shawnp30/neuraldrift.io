"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function CodeFeature() {
  const ref = useRef<HTMLElement>(null);
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
    <section ref={ref} className="mx-auto max-w-7xl px-10 py-24">
      <div className="reveal grid grid-cols-2 items-center gap-20">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#a3e635]">
            {"// Practical, Not Theoretical"}
          </p>
          <h2 className="mb-4 font-syne text-[clamp(1.8rem,3vw,2.8rem)] font-black tracking-tight">
            Every guide ships
            <br />
            with real code.
          </h2>
          <p className="mb-8 font-light leading-relaxed text-muted">
            No fluff. Every article includes tested configs, working scripts,
            and hardware benchmarks on real consumer GPUs — RTX 3080 to 5090.
          </p>
          <Link
            href="/guides"
            className="inline-block rounded bg-accent px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
          >
            Browse Code Guides →
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-surface font-mono text-sm">
          <div className="flex items-center gap-2 bg-[#1a2030] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-xs tracking-wider text-muted">
              lora_train.py — neuraldrift Guide #047
            </span>
          </div>
          <div className="p-6 text-xs leading-loose">
            <div className="text-muted">
              # LoRA training config — RTX 5080 optimized
            </div>
            <div>
              <span className="text-[#a78bfa]">from</span>{" "}
              <span className="text-accent">neuraldrift</span>{" "}
              <span className="text-[#a78bfa]">import</span> LoRATrainer
            </div>
            <div>&nbsp;</div>
            <div>
              trainer = <span className="text-accent">LoRATrainer</span>(
            </div>
            <div>
              &nbsp;&nbsp;model=
              <span className="text-[#a3e635]">&quot;flux-dev&quot;</span>,
            </div>
            <div>
              &nbsp;&nbsp;rank=<span className="text-[#f97316]">32</span>,
            </div>
            <div>
              &nbsp;&nbsp;alpha=<span className="text-[#f97316]">16</span>,
            </div>
            <div>
              &nbsp;&nbsp;dataset=
              <span className="text-[#a3e635]">&quot;./my_dataset&quot;</span>,
            </div>
            <div>
              &nbsp;&nbsp;epochs=<span className="text-[#f97316]">10</span>,
            </div>
            <div>
              &nbsp;&nbsp;vram_budget=
              <span className="text-[#a3e635]">&quot;16GB&quot;</span>
            </div>
            <div>)</div>
            <div>&nbsp;</div>
            <div>
              trainer.<span className="text-accent">train</span>(){" "}
              <span className="text-muted"># ~4h on RTX 5080</span>
            </div>
            <div>&nbsp;</div>
            <div className="text-slate-400">✓ Epoch 10/10 — Loss: 0.0023</div>
            <div className="text-slate-400">
              ✓ Saved: ./output/my_lora_v1.safetensors
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
