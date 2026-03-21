"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const LORAS = [
  { id: "fat-bigfoot-v4", name: "Fat Bigfoot v4", type: "Character", base: "SDXL", trigger: "fatbigfoot", strength: "0.7–0.9", status: "Released", color: "text-[#00e5ff]" },
  { id: "slacker-alien-v2", name: "Slacker Alien v2", type: "Character", base: "SDXL", trigger: "slackeralien", strength: "0.7–0.85", status: "Released", color: "text-[#00e5ff]" },
  { id: "highway-ghost-v3", name: "Highway Ghost v3", type: "Style", base: "FLUX", trigger: "highwayghost", strength: "0.6–0.85", status: "Released", color: "text-[#a78bfa]" },
  { id: "desert-pursuit-v1", name: "Desert Pursuit v1", type: "Style", base: "FLUX", trigger: "desertpursuit", strength: "0.65–0.85", status: "Beta", color: "text-[#a78bfa]" },
];

export function LoRAsPreview() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 px-10 max-w-7xl mx-auto">
      <div className="reveal grid grid-cols-[1fr_480px] gap-16 items-start">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// LoRA Library</p>
          <h2 className="font-syne text-[clamp(2rem,3.5vw,3rem)] font-black tracking-tight mb-4 leading-tight">
            Custom-trained models<br />with full training specs.
          </h2>
          <p className="text-muted leading-relaxed mb-5">
            Every LoRA was trained from scratch — not downloaded and rehosted. Character LoRAs, style LoRAs, concept LoRAs. Each includes the trigger word, strength range, dataset size, epoch count, and training hardware.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            The linked datasets are also available — if you want to retrain, extend, or build on an existing model, the original training data is downloadable.
          </p>
          <Link href="/loras" className="inline-block bg-accent/10 text-accent border border-accent/20 px-6 py-3 rounded font-mono text-xs tracking-widest uppercase hover:bg-accent/15 transition-colors">
            Browse All LoRAs →
          </Link>
        </div>

        <div className="space-y-3">
          {LORAS.map(l => (
            <div key={l.id} className="bg-card border border-border rounded-xl p-5 grid grid-cols-[1fr_auto] gap-4 items-center hover:border-accent/20 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded text-xs tracking-wide ${l.type === "Character" ? "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]" : "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]"}`}>{l.type}</span>
                  <span className="font-mono text-xs bg-white/5 text-muted px-1.5 py-0.5 rounded">{l.base}</span>
                  <span className={`font-mono text-xs ${l.status === "Released" ? "text-[#10b981]" : "text-[#f97316]"}`}>● {l.status}</span>
                </div>
                <div className="font-syne text-sm font-bold text-white mb-1">{l.name}</div>
                <div className="font-mono text-xs text-muted">Trigger: <span className="text-accent">{l.trigger}</span> · Strength: {l.strength}</div>
              </div>
              <Link href="/loras" className="font-mono text-xs text-muted hover:text-accent transition-colors whitespace-nowrap">
                View →
              </Link>
            </div>
          ))}
          <Link href="/loras"
            className="block text-center border border-dashed border-border text-muted font-mono text-xs py-3 rounded-xl hover:border-accent/20 hover:text-accent transition-colors">
            + 2 more models
          </Link>
        </div>
      </div>
    </section>
  );
}
