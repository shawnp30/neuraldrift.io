"use client";

import { useState, useMemo } from "react";
import { 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  Zap,
  Info
} from "lucide-react";
import Link from "next/link";

// --- DATA DEFINITIONS ---

interface Model {
  id: string;
  name: string;
  vramNeeded: number; // base GB in standard precision (FP8/4-bit usually)
  type: "image" | "video" | "audio" | "llm";
  desc: string;
}

const MODELS: Model[] = [
  { id: "flux-dev", name: "Flux Dev", vramNeeded: 12.1, type: "image", desc: "SOTA Open Image Model" },
  { id: "flux-schnell", name: "Flux Schnell", vramNeeded: 6.8, type: "image", desc: "4-step Distilled Image Gen" },
  { id: "sdxl", name: "SDXL 1.0", vramNeeded: 6.5, type: "image", desc: "Standard High Res Diffusion" },
  { id: "sdxl-turbo", name: "SDXL Turbo", vramNeeded: 4.2, type: "image", desc: "Single-step Real-time Gen" },
  { id: "ltx-2.3-22b", name: "LTX Video 2.3 22B", vramNeeded: 24.5, type: "video", desc: "High-Fidelity Video Gen" },
  { id: "ltx-2.3-2b", name: "LTX Video 2.3 2B", vramNeeded: 5.4, type: "video", desc: "Fast Mobile-ready Video" },
  { id: "ace-step-1.5", name: "ACE-Step 1.5", vramNeeded: 8.2, type: "audio", desc: "Audio Synthesis Foundation" },
  { id: "wan-14b", name: "Wan Video 14B", vramNeeded: 16.5, type: "video", desc: "Video-First Latent Diffusion" },
  { id: "animatediff", name: "AnimateDiff", vramNeeded: 9.5, type: "video", desc: "SD1.5 Motion Module Extension" },
  { id: "llama-3.1-8b", name: "Llama 3.1 8B (4-bit)", vramNeeded: 5.5, type: "llm", desc: "Efficient Tech Assistant" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B (4-bit)", vramNeeded: 42.0, type: "llm", desc: "SOTA Open Weights Language" },
  { id: "qwen-2.5-32b", name: "Qwen 2.5 Coder 32B", vramNeeded: 19.5, type: "llm", desc: "Advanced Coding Assistant" },
  { id: "deepseek-r1-32b", name: "DeepSeek R1 32B", vramNeeded: 19.5, type: "llm", desc: "Reasoning-Optimized LLM" },
];

interface GPU {
  id: string;
  name: string;
  vram: number; // GB
  series: string;
}

const GPUS: GPU[] = [
  { id: "5090", name: "RTX 5090", vram: 32, series: "50 Series" },
  { id: "5080", name: "RTX 5080", vram: 16, series: "50 Series" },
  { id: "4090", name: "RTX 4090", vram: 24, series: "40 Series" },
  { id: "4080", name: "RTX 4080 16GB", vram: 16, series: "40 Series" },
  { id: "4070-ti", name: "RTX 4070 Ti 16GB", vram: 16, series: "40 Series" },
  { id: "4070-12", name: "RTX 4070 12GB", vram: 12, series: "40 Series" },
  { id: "4060-ti", name: "RTX 4060 Ti 16GB", vram: 16, series: "40 Series" },
  { id: "4060", name: "RTX 4060 8GB", vram: 8, series: "40 Series" },
  { id: "3090", name: "RTX 3090 24GB", vram: 24, series: "30 Series" },
  { id: "3080-16", name: "RTX 3080 16GB", vram: 16, series: "30 Series" },
  { id: "3080-10", name: "RTX 3080 10GB", vram: 10, series: "30 Series" },
  { id: "a100-40", name: "A100 40GB", vram: 40, series: "Data Center" },
  { id: "a100-80", name: "A100 80GB", vram: 80, series: "Data Center" },
];

// --- COMPONENT ---

export default function VRAMCalculatorPage() {
  const [modelId, setModelId] = useState<string>(MODELS[0].id);
  const [gpuId, setGpuId] = useState<string>(GPUS[2].id);

  const { model, gpu, result } = useMemo(() => {
    const m = MODELS.find((x) => x.id === modelId)!;
    const g = GPUS.find((x) => x.id === gpuId)!;

    // Logic for Status
    let status: "green" | "yellow" | "red" = "green";
    if (m.vramNeeded > g.vram) status = "red";
    else if (m.vramNeeded > g.vram * 0.85) status = "yellow";

    // Recommended Settings & Tips
    let settings = { res: "1024x1024", steps: "20-30", batch: "1", flags: "--gpu-only" };
    let tip = "Standard configuration recommended for stable results.";

    if (m.type === "llm") {
      settings = { res: "N/A (Context 4k)", steps: "Token limit: 128k", batch: "1", flags: "--4-bit --flash-attention" };
    } else if (m.type === "video") {
      settings = { res: "720p", steps: "30-50", batch: "1 (Sequential)", flags: "--low-memory --temp-consistent" };
    }

    if (status === "yellow") {
      settings.flags = "--low-vram --cpu-vae";
      tip = "Close background apps or Chrome to prevent OOM errors during VAE decode.";
    } else if (status === "red") {
      settings.flags = "--medvram-v2 (Slow)";
      tip = "You are over the limit. Consider a GGUF/Quantized version of this model.";
    }

    // Specific tips
    if (m.id === "flux-dev" && g.vram >= 24) {
      tip = "You have enough VRAM for FP16 weights. Use them for higher fidelity.";
    } else if (m.id.startsWith("ltx") && g.vram < 24) {
      tip = "LTX loves memory. Use Tiled VAE Decoding to avoid memory spikes.";
    }

    return { 
      model: m, 
      gpu: g, 
      result: { status, settings, tip } 
    };
  }, [modelId, gpuId]);

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] pt-32 pb-24 px-6 md:px-12 selection:bg-[#7c6af7]/30">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-[#7c6af7] tracking-[0.3em] uppercase mb-4">{"// Neuro-Hardware Diagnostics"}</p>
          <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-6">
            VRAM <span className="text-[#22d3ee]">Calculator</span>
          </h1>
          <p className="text-[#8888a0] max-w-xl text-lg leading-relaxed">
            Determine hardware compatibility for local AI workloads. Instantly calculates memory footprint across architectures.
          </p>
        </div>

        {/* INPUTS GRID */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Model Select */}
          <div className="bg-[#111113] border border-[#2a2a30] p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-12 h-12 text-[#22d3ee]" />
            </div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#8888a0] mb-3">Model Architecture</label>
            <select 
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-[#3f3f46] rounded-xl px-4 py-3 outline-none focus:border-[#7c6af7] transition-all font-mono text-sm"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <p className="mt-3 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{model.desc}</p>
          </div>

          {/* GPU Select */}
          <div className="bg-[#111113] border border-[#2a2a30] p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-12 h-12 text-[#7c6af7]" />
            </div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#8888a0] mb-3">Target Hardware</label>
            <select 
              value={gpuId}
              onChange={(e) => setGpuId(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-[#3f3f46] rounded-xl px-4 py-3 outline-none focus:border-[#7c6af7] transition-all font-mono text-sm"
            >
              {GPUS.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p className="mt-3 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{gpu.series} · {gpu.vram}GB Total</p>
          </div>
        </div>

        {/* RESULTS DASHBOARD */}
        <div className="bg-[#111113] border border-[#2a2a30] p-8 rounded-3xl mb-12 shadow-2xl relative">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            
            <div className="space-y-8">
              {/* STATUS */}
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  {result.status === "green" && (
                    <div className="flex items-center gap-2 text-[#4ade80] font-mono text-xs uppercase tracking-widest font-black bg-[#4ade80]/10 px-3 py-1.5 rounded-full border border-[#4ade80]/20">
                      <CheckCircle2 className="w-4 h-4" /> Ready to Load
                    </div>
                  )}
                  {result.status === "yellow" && (
                    <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest font-black bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4" /> Tight Margin
                    </div>
                  )}
                  {result.status === "red" && (
                    <div className="flex items-center gap-2 text-rose-500 font-mono text-xs uppercase tracking-widest font-black bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-4 h-4" /> Memory Overload
                    </div>
                  )}
                </div>
                <h2 className="text-4xl font-syne font-black text-white tracking-tight">
                  Status: {result.status === "green" ? "Confirmed" : result.status === "yellow" ? "Risk Warning" : "Failed Load"}
                </h2>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#8888a0] mb-2 tracking-widest">Recommended Res</label>
                  <p className="text-white font-mono">{result.settings.res}</p>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#8888a0] mb-2 tracking-widest">Inference Steps</label>
                  <p className="text-white font-mono">{result.settings.steps}</p>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#8888a0] mb-2 tracking-widest">Launch Flags</label>
                  <code className="text-[#22d3ee] font-mono text-sm bg-[#22d3ee]/5 px-2 py-0.5 rounded">{result.settings.flags}</code>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#8888a0] mb-2 tracking-widest">Optimal Batch</label>
                  <p className="text-white font-mono">{result.settings.batch}</p>
                </div>
              </div>

              {/* TIP */}
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex gap-4 items-start">
                <Info className="w-5 h-5 text-[#7c6af7] mt-0.5" />
                <p className="text-sm text-[#8888a0] leading-relaxed italic">{result.tip}</p>
              </div>
            </div>

            {/* VRAM GAUGE */}
            <div className="flex flex-col items-center justify-center p-8 bg-[#0a0a0b] rounded-[40px] border border-white/5 w-64 h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className={`w-40 h-40 rounded-full border-2 border-dashed opacity-20 ${result.status === "red" ? "border-rose-500" : "border-[#7c6af7]"}`} />
              </div>
              <p className="font-mono text-[10px] uppercase text-[#8888a0] mb-2 tracking-tighter">VRAM Utilization</p>
              <div className="font-syne text-5xl font-black text-white">{model.vramNeeded.toFixed(1)}</div>
              <div className="font-mono text-xs text-zinc-500 mt-2">/ {gpu.vram} GB Total </div>
              <div className="mt-4 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${result.status === "green" ? "bg-[#4ade80]" : result.status === "yellow" ? "bg-amber-500" : "bg-rose-500"}`} 
                  style={{ width: `${Math.min((model.vramNeeded / gpu.vram) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* COMPUTEATLAS PARTNER CARD */}
        <div className="bg-gradient-to-br from-[#7c6af7]/20 via-[#111113] to-[#111113] border border-[#7c6af7]/20 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-syne text-2xl font-bold text-white mb-2">Need a GPU upgrade?</h3>
            <p className="text-[#8888a0] max-w-sm mb-0">ComputeAtlas.ai finds the best real-world deals for local AI workstation builds.</p>
          </div>
          <a 
            href="https://computeatlas.ai" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center gap-3 bg-[#7c6af7] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(124,106,247,0.4)] transition-all uppercase tracking-widest"
          >
            Find Deals <ExternalLink className="w-4 h-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Syne:wght@800;Black&display=swap');
        :root {
          --font-fira: 'Fira Code', monospace;
          --font-syne: 'Syne', sans-serif;
        }
        body { font-family: var(--font-fira); }
        .font-syne { font-family: var(--font-syne) !important; }
        .font-mono { font-family: var(--font-fira) !important; }
      `}} />
    </main>
  );
}
