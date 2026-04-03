"use client";

// Blade Runner hologram dual AI ticker
// Drop this file into: /components/DualTicker.tsx

export default function DualTicker() {
  const line1 = [
    "🚀 Gemma 4 Release: Google DeepMind launches vision/audio-capable models on Hugging Face...",
    "🛡️ ComfyUI Stability Phase: Feature freeze through April to prioritize core robustness...",
    "🎬 OmniWeaving: Tencent Hunyuan team bridges gap in multimodal video synthesis...",
    "💎 Civitai Airship: New 4K upscaling and frame interpolation for local gens...",
    "🤗 Hugging Face: Day-one support for Gemma 4 across all major integrations...",
    "🚀 Gemma 4 Release: Google DeepMind launches vision/audio-capable models on Hugging Face...", // Duplicate for loop
    "🛡️ ComfyUI Stability Phase: Feature freeze through April to prioritize core robustness...",
  ];

  const line2 = [
    "📈 AMD Ryzen 9 9950X3D2: Teased with massive 192MB L3 Cache for April launch...",
    "🔥 RTX 50-Series: New rumors surface regarding Blackwell-based high-end architecture...",
    "💻 Intel Core Ultra Series 3: 18A process commercial PCs now shipping globally...",
    "🏆 NVIDIA Dominance: Team Green maintains massive AIB market lead in Q1 2026...",
    "🧠 Samsung/SK Hynix: LPDDR6 and HBM4 specs finalized for next-gen AI accelerators...",
    "📈 AMD Ryzen 9 9950X3D2: Teased with massive 192MB L3 Cache for April launch...", // Duplicate for loop
    "🔥 RTX 50-Series: New rumors surface regarding Blackwell-based high-end architecture...",
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
