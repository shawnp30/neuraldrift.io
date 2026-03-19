"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function CodeFeature() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="reveal grid grid-cols-2 gap-20 items-center">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Practical, Not Theoretical</p>
          <h2 className="font-syne text-[clamp(1.8rem,3vw,2.8rem)] font-black tracking-tight mb-4">
            Every guide ships<br />with real code.
          </h2>
          <p className="text-muted leading-relaxed font-light mb-8">
            No fluff. Every article includes tested configs, working scripts, and hardware benchmarks on real consumer GPUs — RTX 3080 to 5090.
          </p>
          <Link href="/guides" className="bg-accent text-black px-6 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity inline-block">
            Browse Code Guides →
          </Link>
        </div>
        <div className="bg-surface border border-border rounded-lg overflow-hidden font-mono text-sm">
          <div className="bg-[#1a2030] px-4 py-2.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-muted text-xs tracking-wider">lora_train.py — NeuralHub Guide #047</span>
          </div>
          <div className="p-6 leading-loose text-xs">
            <div className="text-muted"># LoRA training config — RTX 5080 optimized</div>
            <div><span className="text-[#a78bfa]">from</span> <span className="text-accent">neuralhub</span> <span className="text-[#a78bfa]">import</span> LoRATrainer</div>
            <div>&nbsp;</div>
            <div>trainer = <span className="text-accent">LoRATrainer</span>(</div>
            <div>&nbsp;&nbsp;model=<span className="text-[#a3e635]">&quot;flux-dev&quot;</span>,</div>
            <div>&nbsp;&nbsp;rank=<span className="text-[#f97316]">32</span>,</div>
            <div>&nbsp;&nbsp;alpha=<span className="text-[#f97316]">16</span>,</div>
            <div>&nbsp;&nbsp;dataset=<span className="text-[#a3e635]">&quot;./my_dataset&quot;</span>,</div>
            <div>&nbsp;&nbsp;epochs=<span className="text-[#f97316]">10</span>,</div>
            <div>&nbsp;&nbsp;vram_budget=<span className="text-[#a3e635]">&quot;16GB&quot;</span></div>
            <div>)</div>
            <div>&nbsp;</div>
            <div>trainer.<span className="text-accent">train</span>() <span className="text-muted"># ~4h on RTX 5080</span></div>
            <div>&nbsp;</div>
            <div className="text-slate-400">✓ Epoch 10/10 — Loss: 0.0023</div>
            <div className="text-slate-400">✓ Saved: ./output/my_lora_v1.safetensors</div>
          </div>
        </div>
      </div>
    </section>
  );
}
