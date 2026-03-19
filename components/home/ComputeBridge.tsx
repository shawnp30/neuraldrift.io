"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function ComputeBridge() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="px-10 max-w-7xl mx-auto py-16">
      <div className="reveal relative bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl p-16 text-center overflow-hidden">
        <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)] pointer-events-none" />
        <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-4 relative">// Powered by ComputeAtlas</p>
        <h2 className="font-syne text-4xl font-black tracking-tight text-white mb-4 relative">
          Need more <span className="text-[#a78bfa]">GPU</span> power?
        </h2>
        <p className="text-muted max-w-lg mx-auto mb-8 leading-relaxed font-light relative">
          When your local rig hits its limits, route heavy training runs and batch inference jobs to ComputeAtlas — our GPU compute partner.
        </p>
        <Link
          href="https://computeatlas.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block bg-accent-purple text-white px-8 py-3.5 rounded font-semibold text-sm glow-purple hover:-translate-y-0.5 transition-transform"
        >
          Explore ComputeAtlas →
        </Link>
      </div>
    </div>
  );
}
