"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  GPUS, 
  BENCHMARKS, 
  MODELS, 
  CLOUD_PROVIDERS, 
  BUDGET_RECOMMENDATIONS,
  type BudgetTier
} from "@/lib/hardware/registry";
import { 
  Cpu, 
  Zap, 
  Monitor, 
  Laptop, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  BarChart3,
  Rocket
} from "lucide-react";
import Link from "next/link";

export default function HardwareHubPage() {
  const [selectedGpu, setSelectedGpu] = useState(Object.keys(GPUS)[0]);
  const [isLaptop, setIsLaptop] = useState(false);
  const [budget, setBudget] = useState<"$500" | "$1500" | "$3000">("$1500");

  const gpuData = GPUS[selectedGpu];
  const budgetData = BUDGET_RECOMMENDATIONS[budget];

  const score = useMemo(() => {
    let base = gpuData.vram * 3.5; // VRAM is king
    if (gpuData.tier === "flagship") base += 20;
    if (gpuData.tier === "high-end") base += 10;
    if (isLaptop) base *= 0.85; // Mobile penalty
    return Math.min(Math.round(base), 100);
  }, [gpuData, isLaptop]);

  const grade = useMemo(() => {
    if (score >= 90) return { label: "S-TIER", color: "text-[#22d3ee]", glow: "shadow-[0_0_20px_rgba(34,211,238,0.2)]" };
    if (score >= 70) return { label: "A-TIER", color: "text-[#10b981]", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]" };
    if (score >= 50) return { label: "B-TIER", color: "text-[#f59e0b]", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" };
    return { label: "C-TIER", color: "text-[#ef4444]", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" };
  }, [score]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] pb-24 selection:bg-[#7c6af7]/30">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#7c6af7]/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 group cursor-default">
              <span className="w-2 h-2 rounded-full bg-[#7c6af7] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 group-hover:text-white transition-colors">
                Neuro-Hardware Capability Hub
              </span>
            </div>
            <h1 className="font-syne text-7xl font-black tracking-tight text-white mb-6 leading-[0.9]">
              CAN YOU <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">RUN IT?</span>
            </h1>
            <p className="max-w-xl text-[#8888a0] text-lg leading-relaxed mb-10">
              The definitive diagnostic for ComfyUI hardware. Score your machine, calculate VRAM resolution ceilings, and discover your strategic upgrade path.
            </p>
          </div>
        </div>
      </section>

      {/* DIAGNOSTIC CENTER */}
      <section className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* LEFT: CALCULATOR */}
        <div className="space-y-6">
          <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Zap className="w-32 h-32 text-[#7c6af7]" />
            </div>
            
            <h3 className="font-syne text-xl font-bold text-white mb-8 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#7c6af7]" />
              Capability Diagnostic
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* GPU SELECT */}
              <div className="space-y-3">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Current / Target GPU</label>
                <select 
                  value={selectedGpu}
                  onChange={(e) => setSelectedGpu(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:border-[#7c6af7] transition-all outline-none"
                >
                  {Object.keys(GPUS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* BUDGET SELECT */}
              <div className="space-y-3">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Upgrade Budget</label>
                <div className="flex bg-[#0a0a0b] border border-white/10 rounded-xl p-1">
                  {(["$500", "$1500", "$3000"] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBudget(b)}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all ${
                        budget === b ? "bg-[#7c6af7] text-white" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* LAPTOP TOGGLE */}
              <div 
                onClick={() => setIsLaptop(!isLaptop)}
                className={`col-span-1 md:col-span-2 flex items-center justify-between p-4 rounded-xl border border-dashed transition-all cursor-pointer ${
                  isLaptop ? "border-[#7c6af7] bg-[#7c6af7]/5" : "border-white/10 bg-white/2 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isLaptop ? "bg-[#7c6af7]/20 text-[#7c6af7]" : "bg-white/5 text-zinc-500"}`}>
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Running on Laptop?</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Calculates mobile TDP and thermal scaling penalties</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${isLaptop ? "bg-[#7c6af7]" : "bg-white/10"}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isLaptop ? "left-6" : "left-1"}`} />
                </div>
              </div>
            </div>

            {/* MONETIZATION RESULTS */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/3 to-transparent border border-white/5">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-8 h-8 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <span className="font-mono text-[10px] uppercase text-[#f59e0b] tracking-[0.2em] mb-1 block">Strategic Recommendation</span>
                  <h4 className="font-syne text-lg font-bold text-white mb-2">
                    {isLaptop 
                      ? (gpuData.vram < 12 ? "Laptop Path: Hybrid Cloud" : "Laptop Path: Local Power") 
                      : budgetData.label}
                  </h4>
                  <p className="text-sm text-[#8888a0] leading-relaxed mb-4">
                    {budget === "$500" 
                      ? "At this price, local hardware is a 'Dead-End' for Flux and Video. We recommend offloading 100% of your inference to Cloud Pods for a professional experience."
                      : (isLaptop && gpuData.vram < 12)
                        ? "Your current laptop is below the 12GB 'Utility Floor'. We suggest local generation for light tasks and using Cloud Pods for high-fidelity professional work."
                        : budgetData.recommendation}
                  </p>
                  <a 
                    href={budget === "$500" ? CLOUD_PROVIDERS[0].url : budgetData.atlas_link}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#7c6af7] text-white px-6 py-2.5 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    {budget === "$500" ? "PROVISION CLOUD RIG" : "VIEW LOCAL BUILDS"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* COMPATIBILITY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELS.map(m => {
              const isComp = gpuData.vram >= m.vramNeeded;
              const isTight = gpuData.vram >= m.vramNeeded * 0.8 && gpuData.vram < m.vramNeeded;
              return (
                <div key={m.id} className="bg-[#111113] border border-white/5 rounded-2xl p-5 group hover:border-[#7c6af7]/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      m.type === "image" ? "bg-amber-500/10 text-amber-500" :
                      m.type === "video" ? "bg-blue-500/10 text-blue-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {m.type}
                    </span>
                    {isComp ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isTight ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <h4 className="font-syne font-bold text-white mb-1">{m.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{m.vramNeeded}GB VRAM REQ</p>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">{isComp ? "Ready Local" : isTight ? "Use --low-vram" : "Requires Cloud"}</span>
                    {!isComp && (
                      <Link href={CLOUD_PROVIDERS[0].url} className="text-[10px] text-[#7c6af7] font-bold hover:underline">RENT POD →</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: TIER LIST & SCORE */}
        <div className="space-y-6">
          {/* GRADE DISPLAY */}
          <div className={`bg-[#111113] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden transition-all ${grade.glow}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7c6af7] to-transparent opacity-50" />
            <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-[0.3em] mb-4 block">Inference Potential</span>
            <div className={`font-syne text-8xl font-black mb-2 ${grade.color}`}>
              {grade.label}
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7c6af7] to-[#22d3ee] transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="font-mono text-xs text-white">{score}/100</span>
            </div>
            <p className="text-xs text-[#8888a0] leading-relaxed italic">
              &quot;Based on core VRAM throughput and thermal architectural efficiency.&quot;
            </p>
          </div>

          {/* PARTNER CARD */}
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6">
            <h4 className="font-syne font-bold text-amber-500 mb-2 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Build with ComputeAtlas
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Don&apos;t guess on your next AI rig. Get a precision-engineered workstation guaranteed to run Flux at peak-fidelity.
            </p>
            <a 
              href="https://computeatlas.ai" 
              className="group flex items-center justify-between bg-white text-black px-4 py-3 rounded-xl font-bold text-xs hover:bg-amber-500 hover:text-white transition-all"
            >
              EXPLORE PRO BUILDS
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* CLOUD PARTNERS */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest px-2">Cloud Power Backup</p>
            {CLOUD_PROVIDERS.map(p => (
              <a 
                key={p.id}
                href={p.url}
                target="_blank"
                className="block bg-white/2 border border-white/5 rounded-2xl p-4 hover:border-[#7c6af7]/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-[10px] font-mono text-[#7c6af7] uppercase tracking-widest">{p.tag}</span>
                </div>
                <h4 className="font-syne font-bold text-white text-sm">{p.name}</h4>
                <p className="text-[10px] text-zinc-500 mb-3">{p.pricing}</p>
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">LAUNCH PORTAL →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BENCHMARK DATA SECTION */}
      <section className="max-w-7xl mx-auto px-10 mt-20">
        <div className="mb-10">
          <h2 className="font-syne text-3xl font-black text-white mb-2">Real-World <span className="text-[#7c6af7]">Benchmarks</span></h2>
          <p className="text-[#8888a0] text-sm font-mono tracking-widest uppercase">Verified Inference Speeds (img/m)</p>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#111113]">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="bg-white/2 text-zinc-500 border-b border-white/5">
                <th className="px-6 py-4 font-bold uppercase tracking-widest">GPU</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Model</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Res</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Speed</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Precision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {BENCHMARKS.map((b, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-white font-bold">{b.gpu}</td>
                  <td className="px-6 py-4 text-zinc-400">{b.model}</td>
                  <td className="px-6 py-4 text-zinc-400">{b.resolution}</td>
                  <td className="px-6 py-4 text-[#10b981] font-bold">{b.imagesPerMinute || b.framesPerSecond} {b.imagesPerMinute ? "img/m" : "fps"}</td>
                  <td className="px-6 py-4 text-zinc-500">{b.precision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
