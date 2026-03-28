"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const LORAS = [
  {
    id: "highway-ghost-v3",
    name: "Highway Ghost v3",
    type: "Style",
    base: "FLUX",
    trigger: "highwayghost",
    strength: "0.6–0.85",
    status: "Released",
    color: "text-[#a78bfa]",
  },
  {
    id: "desert-pursuit-v1",
    name: "Desert Pursuit v1",
    type: "Style",
    base: "FLUX",
    trigger: "desertpursuit",
    strength: "0.65–0.85",
    status: "Beta",
    color: "text-[#a78bfa]",
  },
];

export function LoRAsPreview() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(
      (e) =>
        e.forEach((x) => x.isIntersecting && x.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-10 py-24">
      <div className="reveal grid grid-cols-[1fr_480px] items-start gap-16">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            {"// Model Library"}
          </p>
          <h2 className="mb-4 font-syne text-[clamp(2rem,3.5vw,3rem)] font-black leading-tight tracking-tight">
            Neural architecture hub
            <br />
            optimized for local AI.
          </h2>
          <p className="mb-5 leading-relaxed text-muted">
            A comprehensive collection of verified models—from FLUX adapters to
            foundation weights. Each architecture includes precision specs, vRAM
            requirements, and optimized deployment JSONs.
          </p>
          <p className="mb-8 leading-relaxed text-muted">
            Seamlessly integrated with our Training Studio and Datasets Hub,
            allowing you to tune, extend, or build on existing nodes with
            verified precision.
          </p>
          <Link
            href="/models"
            className="inline-block rounded border border-accent/20 bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/15"
          >
            Browse Model Library →
          </Link>
        </div>

        <div className="space-y-3">
          {LORAS.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/20"
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-xs tracking-wide ${l.type === "Character" ? "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]" : "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]"}`}
                  >
                    {l.type}
                  </span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-muted">
                    {l.base}
                  </span>
                  <span
                    className={`font-mono text-xs ${l.status === "Released" ? "text-[#10b981]" : "text-[#f97316]"}`}
                  >
                    ● {l.status}
                  </span>
                </div>
                <div className="mb-1 font-syne text-sm font-bold text-white">
                  {l.name}
                </div>
                <div className="font-mono text-xs text-muted">
                  Trigger: <span className="text-accent">{l.trigger}</span> ·
                  Strength: {l.strength}
                </div>
              </div>
              <Link
                href="/models"
                className="whitespace-nowrap font-mono text-xs text-muted transition-colors hover:text-accent"
              >
                View →
              </Link>
            </div>
          ))}
          <Link
            href="/models"
            className="block rounded-xl border border-dashed border-border py-3 text-center font-mono text-xs text-muted transition-colors hover:border-accent/20 hover:text-accent"
          >
            Explore All Models →
          </Link>
        </div>
      </div>
    </section>
  );
}
