"use client";

// Blade Runner hologram dual AI ticker
// Drop this file into: /components/DualTicker.tsx

export default function DualTicker() {
  const line1 = [
    "⚡ RTX 5080 — Primary test rig",
    "🔧 ComfyUI — Workflow engine",
    "🎬 LTX Video 2.3 — Cinematic generation",
    "🧠 FLUX Dev/Schnell — Image models",
    "📦 6 LoRA Models — Ready to download",
    "⚙️ 50 ComfyUI Workflows — Plug & play",
    "📧 15+ Subscribers — Weekly drops",
    "🎯 0 Ads — Just signal",
    "⚡ RTX 5080 — Primary test rig", // Duplicated for seamless loop
    "🔧 ComfyUI — Workflow engine",
    "🎬 LTX Video 2.3 — Cinematic generation",
    "🧠 FLUX Dev/Schnell — Image models",
  ];

  const line2 = [
    "Stable Diffusion 3.5 Turbo hits 30% faster sampling...",
    "ComfyUI nodes updated: new ControlNet preprocessor fixes...",
    "Hugging Face releases Safetensors 0.5 with integrity checks...",
    "Fooocus expands modular pipeline support...",
    "Runway Gen-3 motion test leaks show major realism jump...",
    "NVIDIA H20 benchmarks surface: huge speed bump for SDXL...",
    "Stable Diffusion 3.5 Turbo hits 30% faster sampling...", // Duplicated
    "ComfyUI nodes updated: new ControlNet preprocessor fixes...",
  ];

  return (
    <div className="w-full border-b border-slate-800 bg-black/20 backdrop-blur-md overflow-hidden">
      {/* Top ticker */}
      <div className="ticker-row text-cyan-300 text-[10px] tracking-widest hologram">
        <div className="ticker-track animate-ticker-speed">
          {line1.map((t, i) => (
            <span key={i} className="px-12 opacity-90 uppercase font-mono">{t}</span>
          ))}
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="ticker-row text-fuchsia-300 text-[10px] tracking-widest hologram">
        <div className="ticker-track animate-ticker-speed-reverse">
          {line2.map((t, i) => (
            <span key={i} className="px-12 opacity-90 uppercase font-mono">{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-row {
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          padding: 6px 0;
        }
        .ticker-track {
          display: inline-block;
          white-space: nowrap;
        }
        @keyframes ticker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes ticker-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        /* Adjust speed: higher = slower */
        .animate-ticker-speed {
          animation: ticker 120s linear infinite;
        }
        .animate-ticker-speed-reverse {
          animation: ticker-reverse 140s linear infinite;
        }

        /* Blade Runner hologram glow */
        .hologram {
          text-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
        }
      `}</style>
    </div>
  );
}
