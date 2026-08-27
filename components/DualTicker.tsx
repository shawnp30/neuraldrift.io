"use client";

// Blade Runner hologram dual AI ticker
// Drop this file into: /components/DualTicker.tsx

export default function DualTicker() {
  const line1 = [
    "🎬 LTX-2.5 Release: Lightricks ships a 22B open-weights video model with native multishot and 4K HDR...",
    "🛡️ ComfyUI v0.33: Wan 3.0 text/image/audio-to-video and Meshy-7 3D generation land in core...",
    "🎵 ACE-Step 1.5 XL: New 4B-parameter DiT decoder brings higher-fidelity local music generation...",
    "💎 ByteDance vCube: Native video enhance and upscaling to 8K added to ComfyUI...",
    "🤗 Hugging Face: Day-one support for new open-weights releases across major integrations...",
    "🎬 LTX-2.5 Release: Lightricks ships a 22B open-weights video model with native multishot and 4K HDR...", // Duplicate for loop
    "🛡️ ComfyUI v0.33: Wan 3.0 text/image/audio-to-video and Meshy-7 3D generation land in core...",
  ];

  const line2 = [
    "📈 AMD Ryzen 9 9950X3D2: 192MB L3 cache confirmed, launch window still TBD...",
    "🔥 RTX 50 Super Refresh: Nvidia's rumored 24GB RTX 5080 Super still hasn't landed...",
    "💻 Intel Core Ultra Series 3: 18A process commercial PCs now shipping globally...",
    "🏆 NVIDIA Dominance: Team Green continues to hold the majority of AIB GPU share...",
    "🧠 Samsung/SK Hynix: LPDDR6 and HBM4 specs finalized for next-gen AI accelerators...",
    "📈 AMD Ryzen 9 9950X3D2: 192MB L3 cache confirmed, launch window still TBD...", // Duplicate for loop
    "🔥 RTX 50 Super Refresh: Nvidia's rumored 24GB RTX 5080 Super still hasn't landed...",
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
