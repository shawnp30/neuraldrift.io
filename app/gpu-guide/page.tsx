'use client';


import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect, useRef } from "react";

// ─── COMPUTEATLAS AD COMPONENTS ───

function ComputeAtlasBanner({ variant = "default" }) {
  const [hovered, setHovered] = useState(false);
  
  if (variant === "upgrade") {
    return (
      <a
        href="https://www.computeatlas.ai/recommended-builds"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block", textDecoration: "none", marginBottom: 28,
          padding: "20px 24px", borderRadius: 12,
          background: hovered 
            ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(245,158,11,0.15))" 
            : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(245,158,11,0.08))",
          border: `1px solid ${hovered ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.15)"}`,
          transition: "all 0.3s",
          transform: hovered ? "translateY(-1px)" : "none",
          boxShadow: hovered ? "0 8px 32px rgba(139,92,246,0.12)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: 10, 
            background: "linear-gradient(135deg, #8b5cf6, #f59e0b)", 
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif" }}>Ready to upgrade?</span>
              <span style={{ 
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, 
                background: "rgba(139,92,246,0.2)", color: "#a78bfa", 
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
              }}>PARTNER</span>
            </div>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>
              ComputeAtlas.ai builds AI-optimized workstations purpose-built for ComfyUI, Flux, and LLM workflows. See recommended builds →
            </p>
          </div>
          <div style={{ 
            padding: "8px 16px", borderRadius: 8, 
            background: hovered ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.12)", 
            color: "#a78bfa", fontSize: 13, fontWeight: 600, 
            fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}>
            View Builds
          </div>
        </div>
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <a
        href="https://www.computeatlas.ai"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block", textDecoration: "none", marginBottom: 48,
          padding: "16px 20px", borderRadius: 10,
          background: hovered ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.04)",
          border: `1px solid ${hovered ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.1)"}`,
          transition: "all 0.25s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ 
            padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, 
            background: "rgba(139,92,246,0.15)", color: "#a78bfa", 
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
          }}>AD</span>
          <span style={{ fontSize: 14, color: "#d1d5db", fontFamily: "'Space Grotesk', sans-serif" }}>
            Need a full AI rig? <span style={{ color: "#a78bfa", fontWeight: 600 }}>ComputeAtlas.ai</span> — AI workstation builder with recommended builds, GPU comparison, and hardware estimator.
          </span>
        </div>
      </a>
    );
  }

  // variant === "hero" — big banner
  return (
    <a
      href="https://www.computeatlas.ai"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", textDecoration: "none", marginTop: 48, marginBottom: 16,
        borderRadius: 16, overflow: "hidden", position: "relative",
        background: "linear-gradient(135deg, #1a0a2e 0%, #0d1a2e 50%, #1a1a0d 100%)",
        border: `1px solid ${hovered ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.15)"}`,
        transition: "all 0.3s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 48px rgba(139,92,246,0.15)" : "none",
      }}
    >
      {/* Decorative grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* Glow accents */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 200, height: 200,
        background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: -30, left: -30, width: 160, height: 160,
        background: "radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)",
        borderRadius: "50%",
      }} />
      
      <div style={{ position: "relative", padding: "36px 32px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, boxShadow: "0 8px 24px rgba(139,92,246,0.3)",
          }}>🖥️</div>
        </div>
        
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ 
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", 
              color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace",
            }}>POWERED BY OUR PARTNER</span>
          </div>
          <h3 style={{ 
            fontSize: 24, fontWeight: 700, color: "#f0f0f0", margin: "0 0 8px 0", 
            fontFamily: "'Playfair Display', serif", lineHeight: 1.2,
          }}>
            Build Your AI Workstation
          </h3>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif", maxWidth: 440 }}>
            ComputeAtlas.ai helps you spec the perfect AI rig. GPU builder, side-by-side comparison, VRAM estimator, and curated builds for every budget.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {["AI Workstation Builder", "GPU Compare Tool", "Hardware Estimator", "Curated Builds"].map((f, i) => (
              <span key={i} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: "rgba(139,92,246,0.1)", color: "#c4b5fd",
                fontFamily: "'JetBrains Mono', monospace",
              }}>{f}</span>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{
            padding: "12px 24px", borderRadius: 10,
            background: hovered ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: hovered ? "0 4px 20px rgba(139,92,246,0.4)" : "0 2px 8px rgba(139,92,246,0.2)",
            transition: "all 0.2s",
          }}>
            Explore ComputeAtlas →
          </div>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>
            computeatlas.ai
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── GPU DATABASE ───
const GPU_DATA = {
  // Desktop GPUs
  "RTX 5090": { vram: 32, arch: "Blackwell", tier: "flagship", type: "desktop", tdp: 575, bus: "PCIe 5.0", msrp: "$1,999",
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Full model, no quantization needed. Fast batch generation." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Multiple LoRAs stacked. Train custom LoRAs locally." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "High-res video at full quality. Extended clip lengths." },
      { name: "Llama 3.3 70B (Q4)", type: "LLM", notes: "Full 70B quantized fits. Fast inference." },
      { name: "Whisper Large V3", type: "Audio", notes: "Real-time transcription with headroom to spare." },
    ],
    verdict: "The absolute beast. Nothing in consumer-land touches this. Run anything you want — full Flux, 70B LLMs quantized, video gen, multi-LoRA stacks. You have zero limitations for local AI work.",
    canHandle: true,
  },
  "RTX 5080": { vram: 16, arch: "Blackwell", tier: "high-end", type: "desktop", tdp: 360, bus: "PCIe 5.0", msrp: "$999",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Runs great with FP8 quantization. Near-lossless quality." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Comfortable with 2-3 LoRAs stacked." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "Short clips work well. Medium res recommended." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Full precision. Blazing fast inference." },
      { name: "Whisper Large V3", type: "Audio", notes: "No issues. Plenty of VRAM." },
    ],
    verdict: "Sweet spot for serious AI creators. 16GB VRAM handles Flux, SDXL, video gen, and 8B LLMs without breaking a sweat. You'll only hit walls on unquantized 70B+ models.",
    canHandle: true,
  },
  "RTX 5070 Ti": { vram: 16, arch: "Blackwell", tier: "upper-mid", type: "desktop", tdp: 300, bus: "PCIe 5.0", msrp: "$749",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Solid performance with quantization." },
      { name: "SDXL", type: "Image Gen", notes: "Great performance. LoRA stacking works." },
      { name: "LTX Video Distilled", type: "Video Gen", notes: "Use distilled variant for best results." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Full precision, good speed." },
      { name: "Whisper Medium", type: "Audio", notes: "Recommended over Large for speed balance." },
    ],
    verdict: "Great mid-range AI card. Same 16GB as the 5080 means same model compatibility, just slightly slower throughput. Excellent value for ComfyUI workflows.",
    canHandle: true,
  },
  "RTX 5070": { vram: 12, arch: "Blackwell", tier: "mid", type: "desktop", tdp: 250, bus: "PCIe 5.0", msrp: "$549",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Runs well. Avoid heavy LoRA stacks." },
      { name: "Flux.1 Schnell (Q4)", type: "Image Gen", notes: "Needs aggressive quantization. Noticeable quality loss." },
      { name: "SD 1.5", type: "Image Gen", notes: "Runs perfectly. Fast." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Quantized fits. Decent speed." },
      { name: "Whisper Medium", type: "Audio", notes: "Works well within VRAM budget." },
    ],
    verdict: "12GB is workable but you'll feel the squeeze on newer models like Flux. SDXL is your sweet spot. Video gen will be limited. Consider cloud GPU for heavy jobs.",
    canHandle: true,
  },
  "RTX 4090": { vram: 24, arch: "Ada Lovelace", tier: "flagship", type: "desktop", tdp: 450, bus: "PCIe 4.0", msrp: "$1,599",
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Runs at full FP16. Excellent speed." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Stack LoRAs freely. Train them too." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "Handles full quality. Longer clips possible." },
      { name: "Llama 3.3 70B (Q4)", type: "LLM", notes: "Tight fit but works with 4-bit quantization." },
      { name: "Whisper Large V3", type: "Audio", notes: "No issues whatsoever." },
    ],
    verdict: "Still the king for most AI creators. 24GB VRAM means Flux at full precision, video gen, and even 70B LLMs quantized. If you already own one, there's little reason to upgrade yet.",
    canHandle: true,
  },
  "RTX 4080 Super": { vram: 16, arch: "Ada Lovelace", tier: "high-end", type: "desktop", tdp: 320, bus: "PCIe 4.0", msrp: "$999",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Good with quantization. Slightly slower than 4090." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Handles 2-3 LoRAs comfortably." },
      { name: "LTX Video Distilled", type: "Video Gen", notes: "Use distilled models. Short clips." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Full precision. Fast." },
      { name: "Whisper Large V3", type: "Audio", notes: "Fits fine." },
    ],
    verdict: "Solid 16GB card for AI work. Handles the core ComfyUI workflow — SDXL, Flux quantized, 8B LLMs. You'll want cloud for anything bigger than that.",
    canHandle: true,
  },
  "RTX 4070 Ti Super": { vram: 16, arch: "Ada Lovelace", tier: "upper-mid", type: "desktop", tdp: 285, bus: "PCIe 4.0", msrp: "$799",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Works with quantization." },
      { name: "SDXL", type: "Image Gen", notes: "Great performance." },
      { name: "SD 1.5", type: "Image Gen", notes: "Blazing fast." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Good inference speed." },
      { name: "Whisper Medium", type: "Audio", notes: "Recommended for best speed/quality balance." },
    ],
    verdict: "16GB at a lower price point. Same model compatibility as 4080 Super, just with less compute throughput. Great value for ComfyUI-focused workflows.",
    canHandle: true,
  },
  "RTX 4070": { vram: 12, arch: "Ada Lovelace", tier: "mid", type: "desktop", tdp: 200, bus: "PCIe 4.0", msrp: "$549",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Runs well at default settings." },
      { name: "Flux.1 Schnell (Q4)", type: "Image Gen", notes: "Heavy quantization required. Quality trade-off." },
      { name: "SD 1.5", type: "Image Gen", notes: "Perfect. Fast." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Quantized only." },
    ],
    verdict: "12GB is the minimum for modern AI gen. SDXL works, Flux needs heavy quantization. You can produce content but you'll hit VRAM walls on newer, larger models.",
    canHandle: true,
  },
  "RTX 4060 Ti 16GB": { vram: 16, arch: "Ada Lovelace", tier: "mid", type: "desktop", tdp: 165, bus: "PCIe 4.0", msrp: "$449",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Fits in VRAM but generation is slow." },
      { name: "SDXL", type: "Image Gen", notes: "Works. Slower than higher-tier cards." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Full precision fits. Moderate speed." },
    ],
    verdict: "The 16GB version is surprisingly capable for the price. VRAM matches high-end cards — you just pay in generation speed. Budget-friendly entry into serious AI work.",
    canHandle: true,
  },
  "RTX 4060 Ti 8GB": { vram: 8, arch: "Ada Lovelace", tier: "mid", type: "desktop", tdp: 160, bus: "PCIe 4.0", msrp: "$399",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Works fine." },
      { name: "SDXL (optimized)", type: "Image Gen", notes: "Tight. Use --lowvram flags." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Heavily quantized only." },
    ],
    verdict: "8GB is getting tight for modern AI. SD 1.5 is comfortable, SDXL requires optimization tricks. Flux and video gen are essentially off the table. Consider cloud GPU for heavier work.",
    canHandle: "limited",
  },
  "RTX 4060": { vram: 8, arch: "Ada Lovelace", tier: "entry", type: "desktop", tdp: 115, bus: "PCIe 4.0", msrp: "$299",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Primary use case. Works well." },
      { name: "SDXL (optimized)", type: "Image Gen", notes: "Possible with --lowvram. Slow." },
      { name: "Whisper Small", type: "Audio", notes: "Smaller model fits." },
    ],
    verdict: "Entry-level for AI. SD 1.5 is your main tool here. SDXL is possible but painful. Flux, video gen, and large LLMs need cloud compute. Good for learning the basics.",
    canHandle: "limited",
  },
  "RTX 3090": { vram: 24, arch: "Ampere", tier: "flagship", type: "desktop", tdp: 350, bus: "PCIe 4.0", msrp: "$1,499 (launch)",
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "24GB VRAM fits full model. Slower than 40-series but works." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Comfortable. LoRA training possible." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "Works. Expect longer render times vs newer cards." },
      { name: "Llama 3.3 70B (Q4)", type: "LLM", notes: "Fits quantized. Slower inference." },
    ],
    verdict: "Still a powerhouse thanks to 24GB VRAM. Model compatibility matches the 4090 — you just wait longer. Excellent used-market value for AI creators on a budget.",
    canHandle: true,
  },
  "RTX 3080 Ti": { vram: 12, arch: "Ampere", tier: "high-end", type: "desktop", tdp: 350, bus: "PCIe 4.0", msrp: "$1,199 (launch)",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Works at default settings." },
      { name: "SD 1.5", type: "Image Gen", notes: "Fast and comfortable." },
      { name: "Flux.1 Schnell (Q4)", type: "Image Gen", notes: "Heavy quantization needed." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Quantized fits." },
    ],
    verdict: "12GB holds it back from flagship territory. SDXL works, but Flux and video gen need quantization or cloud. Still useful for core ComfyUI workflows.",
    canHandle: true,
  },
  "RTX 3080 16GB": { vram: 16, arch: "Ampere", tier: "high-end", type: "desktop/laptop", tdp: 320, bus: "PCIe 4.0", msrp: "Varies",
    models: [
      { name: "Flux.1 Dev (FP8)", type: "Image Gen", notes: "Quantized fits. Slower than 40-series." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Comfortable with 2-3 LoRAs." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "Full precision. Moderate speed." },
      { name: "Whisper Large V3", type: "Audio", notes: "Fits in VRAM." },
    ],
    verdict: "The 16GB variant is a hidden gem. Same VRAM as RTX 4080 Super means same model compatibility, just older architecture. Great for laptop AI rigs.",
    canHandle: true,
  },
  "RTX 3080 10GB": { vram: 10, arch: "Ampere", tier: "high-end", type: "desktop", tdp: 320, bus: "PCIe 4.0", msrp: "$699 (launch)",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Tight but works." },
      { name: "SD 1.5", type: "Image Gen", notes: "Comfortable." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Quantized fits." },
    ],
    verdict: "10GB is awkward — more than 8 but not enough for 16GB-class models. SDXL works, Flux doesn't realistically fit. Solid for SD 1.5 and basic workflows.",
    canHandle: "limited",
  },
  "RTX 3070": { vram: 8, arch: "Ampere", tier: "mid", type: "desktop", tdp: 220, bus: "PCIe 4.0", msrp: "$499 (launch)",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Primary tool. Works well." },
      { name: "SDXL (optimized)", type: "Image Gen", notes: "Tight. --lowvram flags needed." },
    ],
    verdict: "8GB Ampere. SD 1.5 is your home base. SDXL is possible with optimization. Modern models like Flux and video gen need cloud. Still useful for learning and lighter workflows.",
    canHandle: "limited",
  },
  "RTX 3060 12GB": { vram: 12, arch: "Ampere", tier: "entry", type: "desktop", tdp: 170, bus: "PCIe 4.0", msrp: "$329 (launch)",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "12GB VRAM is the saving grace. Works at defaults." },
      { name: "SD 1.5", type: "Image Gen", notes: "Comfortable and fast enough." },
      { name: "Flux.1 Schnell (Q4)", type: "Image Gen", notes: "Heavy quantization. Slow but functional." },
      { name: "Llama 3.1 8B (Q4)", type: "LLM", notes: "Quantized fits." },
    ],
    verdict: "The budget AI card legend. 12GB VRAM punches way above its price class. SDXL works, even heavily quantized Flux is possible. Slow but surprisingly capable.",
    canHandle: true,
  },
  "RTX 3060 Ti": { vram: 8, arch: "Ampere", tier: "mid", type: "desktop", tdp: 200, bus: "PCIe 4.0", msrp: "$399 (launch)",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Works great." },
      { name: "SDXL (optimized)", type: "Image Gen", notes: "Tight. Use optimizations." },
    ],
    verdict: "Faster compute than the 3060 but only 8GB VRAM, which is the bottleneck for AI. Ironically less capable for AI than the cheaper 3060 12GB.",
    canHandle: "limited",
  },
  "GTX 1660 Ti": { vram: 6, arch: "Turing", tier: "legacy", type: "desktop/laptop", tdp: 120, bus: "PCIe 3.0", msrp: "$279 (launch)",
    models: [
      { name: "SD 1.5 (optimized)", type: "Image Gen", notes: "Possible with --lowvram. Slow." },
    ],
    verdict: "6GB VRAM is below the practical minimum for most modern AI models. SD 1.5 with heavy optimization is about all you can do. Cloud GPU is strongly recommended for any real AI work.",
    canHandle: "limited",
  },
  "GTX 1660 Super": { vram: 6, arch: "Turing", tier: "legacy", type: "desktop", tdp: 125, bus: "PCIe 3.0", msrp: "$229 (launch)",
    models: [
      { name: "SD 1.5 (optimized)", type: "Image Gen", notes: "Barely. Very slow." },
    ],
    verdict: "Same 6GB limitation as the 1660 Ti. You can technically run SD 1.5 but it's not a pleasant experience. Time to upgrade or use cloud compute.",
    canHandle: "limited",
  },
  "GTX 1650": { vram: 4, arch: "Turing", tier: "legacy", type: "desktop/laptop", tdp: 75, bus: "PCIe 3.0", msrp: "$149 (launch)",
    models: [],
    verdict: "4GB VRAM cannot run modern AI generation models. Even SD 1.5 will struggle or fail. You need cloud GPU services (RunPod, Vast.ai) or a hardware upgrade to do AI generation.",
    canHandle: false,
  },
  "GTX 1050 Ti": { vram: 4, arch: "Pascal", tier: "legacy", type: "desktop/laptop", tdp: 75, bus: "PCIe 3.0", msrp: "$139 (launch)",
    models: [],
    verdict: "Not viable for AI generation. 4GB VRAM and Pascal architecture are too old and too limited. Use cloud GPU services or upgrade your hardware.",
    canHandle: false,
  },
  "Intel Arc A770": { vram: 16, arch: "Alchemist", tier: "mid", type: "desktop", tdp: 225, bus: "PCIe 4.0", msrp: "$349",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Works via DirectML or IPEX. Slower than equivalent NVIDIA." },
      { name: "SDXL", type: "Image Gen", notes: "Possible but driver/software support is inconsistent." },
    ],
    verdict: "16GB VRAM is great on paper, but Intel GPU support in ComfyUI and most AI tools is still rough. You'll spend more time debugging drivers than generating. NVIDIA is strongly recommended for AI work.",
    canHandle: "limited",
  },
  "RX 7900 XTX": { vram: 24, arch: "RDNA 3", tier: "flagship", type: "desktop", tdp: 355, bus: "PCIe 4.0", msrp: "$999",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Works via ROCm on Linux. Windows support is limited." },
      { name: "SD 1.5", type: "Image Gen", notes: "Works with DirectML or ROCm." },
      { name: "Flux.1 Dev", type: "Image Gen", notes: "24GB VRAM fits it. ROCm required." },
    ],
    verdict: "24GB VRAM is fantastic, but AMD GPU support in AI tools is a constant uphill battle. ROCm on Linux works decently. Windows is painful. If you're Linux-savvy, it's viable. Otherwise, NVIDIA saves you headaches.",
    canHandle: "limited",
  },
  "RX 7800 XT": { vram: 16, arch: "RDNA 3", tier: "upper-mid", type: "desktop", tdp: 263, bus: "PCIe 4.0", msrp: "$499",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "ROCm on Linux. Inconsistent on Windows." },
      { name: "SD 1.5", type: "Image Gen", notes: "Works via DirectML." },
    ],
    verdict: "Same AMD software story — hardware is capable but the ecosystem fights you. 16GB VRAM would be great on an NVIDIA card. On AMD, expect to troubleshoot frequently.",
    canHandle: "limited",
  },
  "Apple M1 (8GB)": { vram: 8, arch: "Apple Silicon", tier: "entry", type: "laptop", tdp: 20, bus: "Unified Memory", msrp: "Varies",
    models: [
      { name: "SD 1.5", type: "Image Gen", notes: "Works via MPS backend. Slow but functional." },
    ],
    verdict: "8GB unified memory is shared with the OS, leaving ~5-6GB for AI. SD 1.5 works slowly. SDXL and newer models don't realistically fit. Good for experimenting, not production.",
    canHandle: "limited",
  },
  "Apple M2 Pro (16GB)": { vram: 16, arch: "Apple Silicon", tier: "mid", type: "laptop", tdp: 30, bus: "Unified Memory", msrp: "Varies",
    models: [
      { name: "SDXL", type: "Image Gen", notes: "Works via MPS. Slower than discrete GPU." },
      { name: "SD 1.5", type: "Image Gen", notes: "Comfortable." },
      { name: "Llama 3.1 8B", type: "LLM", notes: "MLX framework. Good for inference." },
    ],
    verdict: "16GB unified memory with Apple's MPS backend handles SDXL and smaller LLMs. Not as fast as NVIDIA but surprisingly capable for a laptop. MLX ecosystem is maturing.",
    canHandle: true,
  },
  "Apple M3 Max (36GB)": { vram: 36, arch: "Apple Silicon", tier: "high-end", type: "laptop", tdp: 40, bus: "Unified Memory", msrp: "Varies",
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Fits in unified memory. MPS backend." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Very comfortable." },
      { name: "Llama 3.3 70B (Q4)", type: "LLM", notes: "Via MLX. Fits in 36GB unified." },
      { name: "Whisper Large V3", type: "Audio", notes: "No issues." },
    ],
    verdict: "36GB unified memory is a beast for Apple Silicon. Flux, large LLMs, SDXL — all fit. Slower than a 4090 per-generation but the model compatibility is incredible for a laptop.",
    canHandle: true,
  },
  "Apple M4 Max (48GB)": { vram: 48, arch: "Apple Silicon", tier: "flagship", type: "laptop", tdp: 45, bus: "Unified Memory", msrp: "Varies",
    models: [
      { name: "Flux.1 Dev", type: "Image Gen", notes: "Plenty of room. Full quality." },
      { name: "SDXL + LoRAs", type: "Image Gen", notes: "Stack whatever you want." },
      { name: "Llama 3.3 70B", type: "LLM", notes: "Near full precision via MLX." },
      { name: "LTX Video 2.3", type: "Video Gen", notes: "Works via MPS. Slower but functional." },
      { name: "Whisper Large V3", type: "Audio", notes: "No issues." },
    ],
    verdict: "48GB unified memory rivals workstation GPUs for model compatibility. The MLX ecosystem makes this a legitimate AI development machine. Slower than desktop NVIDIA but remarkably capable.",
    canHandle: true,
  },
};

const CPU_DATA = {
  "Ryzen 9 9950X3D": { cores: 16, threads: 32, tier: "flagship", gen: "Zen 5", socket: "AM5", notes: "Top-tier. No CPU bottleneck for any AI workload. Fast model loading." },
  "Ryzen 9 9950X": { cores: 16, threads: 32, tier: "flagship", gen: "Zen 5", socket: "AM5", notes: "Excellent. Handles multi-tasking during generation with ease." },
  "Ryzen 9 9900X": { cores: 12, threads: 24, tier: "high-end", gen: "Zen 5", socket: "AM5", notes: "Great for AI workflows. No bottleneck with any consumer GPU." },
  "Ryzen 7 9700X": { cores: 8, threads: 16, tier: "mid", gen: "Zen 5", socket: "AM5", notes: "Solid. Handles ComfyUI + browser + monitoring fine." },
  "Ryzen 9 7950X3D": { cores: 16, threads: 32, tier: "flagship", gen: "Zen 4", socket: "AM5", notes: "Still top-tier. 3D V-Cache helps with some inference tasks." },
  "Ryzen 9 7950X": { cores: 16, threads: 32, tier: "flagship", gen: "Zen 4", socket: "AM5", notes: "Excellent all-rounder for AI workstations." },
  "Ryzen 7 7800X3D": { cores: 8, threads: 16, tier: "mid", gen: "Zen 4", socket: "AM5", notes: "Gaming-focused but handles AI fine. 8 cores is sufficient." },
  "Ryzen 7 7700X": { cores: 8, threads: 16, tier: "mid", gen: "Zen 4", socket: "AM5", notes: "Good balance. No issues with AI generation workloads." },
  "Ryzen 5 7600X": { cores: 6, threads: 12, tier: "entry", gen: "Zen 4", socket: "AM5", notes: "Budget-friendly. 6 cores is the minimum for comfortable AI multitasking." },
  "Ryzen 9 5950X": { cores: 16, threads: 32, tier: "flagship", gen: "Zen 3", socket: "AM4", notes: "Still capable. No bottleneck for AI generation." },
  "Ryzen 9 5900X": { cores: 12, threads: 24, tier: "high-end", gen: "Zen 3", socket: "AM4", notes: "Great. Plenty of headroom." },
  "Ryzen 7 5800X": { cores: 8, threads: 16, tier: "mid", gen: "Zen 3", socket: "AM4", notes: "Solid choice. Handles ComfyUI workflows without issue." },
  "Ryzen 5 5600X": { cores: 6, threads: 12, tier: "entry", gen: "Zen 3", socket: "AM4", notes: "Minimum viable for AI work. May lag during heavy multitasking." },
  "Core i9-14900K": { cores: 24, threads: 32, tier: "flagship", gen: "Raptor Lake", socket: "LGA 1700", notes: "Powerful but check for microcode stability updates." },
  "Core i9-13900K": { cores: 24, threads: 32, tier: "flagship", gen: "Raptor Lake", socket: "LGA 1700", notes: "Same performance tier. Ensure BIOS is updated." },
  "Core i7-14700K": { cores: 20, threads: 28, tier: "high-end", gen: "Raptor Lake", socket: "LGA 1700", notes: "Excellent for AI. No bottleneck." },
  "Core i7-13700K": { cores: 16, threads: 24, tier: "high-end", gen: "Raptor Lake", socket: "LGA 1700", notes: "Great balance of cores and speed." },
  "Core i5-14600K": { cores: 14, threads: 20, tier: "mid", gen: "Raptor Lake", socket: "LGA 1700", notes: "Good mid-range. Handles AI fine." },
  "Core i5-13600K": { cores: 14, threads: 20, tier: "mid", gen: "Raptor Lake", socket: "LGA 1700", notes: "Budget king for AI rigs." },
  "Core i5-12400": { cores: 6, threads: 12, tier: "entry", gen: "Alder Lake", socket: "LGA 1700", notes: "Budget option. Functional but minimal multitasking headroom." },
  "Core Ultra 9 285K": { cores: 24, threads: 24, tier: "flagship", gen: "Arrow Lake", socket: "LGA 1851", notes: "Latest Intel. Great for AI workstations." },
  "Core Ultra 7 265K": { cores: 20, threads: 20, tier: "high-end", gen: "Arrow Lake", socket: "LGA 1851", notes: "Solid performer for AI workflows." },
  "Apple M1": { cores: 8, threads: 8, tier: "entry", gen: "Apple Silicon", socket: "SoC", notes: "Unified architecture. Good for lightweight AI via MLX." },
  "Apple M2 Pro": { cores: 12, threads: 12, tier: "mid", gen: "Apple Silicon", socket: "SoC", notes: "Capable. Handles ComfyUI on macOS." },
  "Apple M3 Max": { cores: 16, threads: 16, tier: "high-end", gen: "Apple Silicon", socket: "SoC", notes: "Excellent for MLX-based AI workflows." },
  "Apple M4 Max": { cores: 16, threads: 16, tier: "flagship", gen: "Apple Silicon", socket: "SoC", notes: "Best Apple Silicon for AI. MLX optimized." },
};

const RAM_OPTIONS = ["8 GB", "16 GB", "32 GB", "64 GB", "128 GB"];
const RAM_NOTES = {
  "8 GB": { viable: false, note: "8GB system RAM is not enough for AI generation. Your OS alone uses 3-4GB, leaving almost nothing for model loading and processing. Upgrade to at least 16GB, ideally 32GB." },
  "16 GB": { viable: true, note: "Minimum viable. You can run AI tools but expect slowdowns if you have a browser, ComfyUI, and monitoring open simultaneously. 32GB is recommended." },
  "32 GB": { viable: true, note: "Sweet spot for AI creators. Comfortable multitasking with ComfyUI, browser, Discord, and system monitoring all running. This is what we recommend." },
  "64 GB": { viable: true, note: "Excellent. Run multiple AI tools simultaneously, keep large datasets in memory, and never worry about RAM. Great for serious workflows." },
  "128 GB": { viable: true, note: "Overkill for most AI generation but useful if you're running local LLMs that offload to system RAM, or working with massive datasets." },
};

// ─── CLOUD PROVIDERS ───
const CLOUD_PROVIDERS = [
  {
    name: "Comfy Cloud",
    tag: "Official",
    tagColor: "#10b981",
    icon: "☁️",
    subtitle: "Official ComfyUI Cloud Platform",
    description: "Official ComfyUI cloud — run in browser, zero setup",
    pricing: "Pay-per-GPU-use (idle is free)",
    gpus: "Server-grade (unspecified, managed)",
    url: "https://comfycloud.com",
    features: ["Zero setup", "Native ComfyUI", "Pay only when running"],
  },
  {
    name: "RunPod",
    tag: "Best Value",
    tagColor: "#f59e0b",
    icon: "🖥️",
    subtitle: "GPU Pods on Demand",
    description: "GPU pods on demand — ComfyUI template, per-second billing",
    pricing: "RTX 4090: ~$0.34/hr · A100 80GB: ~$1.89/hr · H100: ~$2.49/hr",
    gpus: "RTX 4090 · A100 40/80GB · H100 · B200 · L40S",
    url: "https://runpod.io",
    features: ["Per-second billing", "ComfyUI templates", "Serverless API"],
  },
  {
    name: "Vast.ai",
    tag: "Cheapest",
    tagColor: "#06b6d4",
    icon: "💰",
    subtitle: "Cheapest GPU Marketplace",
    description: "Marketplace of rental GPUs — cheapest hourly rates",
    pricing: "RTX 4090: ~$0.20–0.55/hr (varies by host)",
    gpus: "RTX 4090 · A100 · 3090 · community GPUs",
    url: "https://vast.ai",
    features: ["Community marketplace", "Lowest prices", "Flexible configs"],
  },
];

// ─── COMPONENTS ───

function ChevronDown({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalLink({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
    </svg>
  );
}

function Dropdown({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, minWidth: 220 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, color: value ? "#f0f0f0" : "#6b7280", fontSize: 15, cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s",
          ...(open ? { borderColor: "#f59e0b", boxShadow: "0 0 0 2px rgba(245,158,11,0.15)" } : {}),
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", opacity: 0.5 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 50,
          background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          maxHeight: 280, overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 16px", border: "none",
                background: opt === value ? "rgba(245,158,11,0.1)" : "transparent",
                color: opt === value ? "#f59e0b" : "#d1d5db", fontSize: 14, cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (opt !== value) e.target.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (opt !== value) e.target.style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ canHandle }) {
  if (canHandle === true) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(16,185,129,0.12)", color: "#10b981", fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }}></span>
      AI Ready
    </span>
  );
  if (canHandle === "limited") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }}></span>
      Limited
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }}></span>
      Not Viable
    </span>
  );
}

function HardwareDetail({ gpu, cpu, ram, onBack }) {
  const gpuData = GPU_DATA[gpu];
  const cpuData = CPU_DATA[cpu];
  const ramData = RAM_NOTES[ram];

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#9ca3af", fontSize: 14,
        cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 24, transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.target.style.borderColor = "#f59e0b"; e.target.style.color = "#f59e0b"; }}
      onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#9ca3af"; }}
      >
        ← Back to selector
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#f0f0f0", margin: 0, fontFamily: "'Playfair Display', serif" }}>{gpu}</h2>
          <StatusBadge canHandle={gpuData.canHandle} />
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>
          <span>{gpuData.vram}GB VRAM</span>
          <span>·</span>
          <span>{gpuData.arch}</span>
          <span>·</span>
          <span>{gpuData.type}</span>
          <span>·</span>
          <span>{gpuData.tdp}W TDP</span>
          {gpuData.msrp && <><span>·</span><span>{gpuData.msrp}</span></>}
        </div>
      </div>

      {/* Verdict */}
      <div style={{
        padding: 24, borderRadius: 12, marginBottom: 28,
        background: gpuData.canHandle === true ? "rgba(16,185,129,0.06)" : gpuData.canHandle === "limited" ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.06)",
        border: `1px solid ${gpuData.canHandle === true ? "rgba(16,185,129,0.15)" : gpuData.canHandle === "limited" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: gpuData.canHandle === true ? "#10b981" : gpuData.canHandle === "limited" ? "#f59e0b" : "#ef4444", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          {gpuData.canHandle === true ? "✓ Verdict: Go for it" : gpuData.canHandle === "limited" ? "⚠ Verdict: Proceed with caution" : "✕ Verdict: Not recommended"}
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d1d5db", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{gpuData.verdict}</p>
      </div>

      {/* Models */}
      {gpuData.models.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#f0f0f0", marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>What you can run</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gpuData.models.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 18px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
              }}>
                <span style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
                  background: m.type === "Image Gen" ? "rgba(168,85,247,0.12)" : m.type === "Video Gen" ? "rgba(59,130,246,0.12)" : m.type === "LLM" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                  color: m.type === "Image Gen" ? "#a855f7" : m.type === "Video Gen" ? "#3b82f6" : m.type === "LLM" ? "#10b981" : "#f59e0b",
                }}>
                  {m.type}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#f0f0f0", fontSize: 15, marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>{m.name}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>{m.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gpuData.models.length === 0 && (
        <div style={{
          padding: 32, borderRadius: 12, background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.12)", textAlign: "center", marginBottom: 28,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
          <h3 style={{ color: "#ef4444", fontSize: 18, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>No viable AI models</h3>
          <p style={{ color: "#9ca3af", fontSize: 14, maxWidth: 400, margin: "0 auto", lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
            This GPU cannot run modern AI generation models. Check the cloud GPU section below for affordable alternatives.
          </p>
        </div>
      )}

      {/* CPU & RAM */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>CPU: {cpu}</h4>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{cpuData.cores} cores · {cpuData.threads} threads · {cpuData.gen}</div>
          <p style={{ fontSize: 14, color: "#d1d5db", margin: 0, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>{cpuData.notes}</p>
        </div>
        <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>RAM: {ram}</h4>
          <span style={{
            display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
            background: ramData.viable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            color: ramData.viable ? "#10b981" : "#ef4444",
          }}>
            {ramData.viable ? "Sufficient" : "Insufficient"}
          </span>
          <p style={{ fontSize: 14, color: "#d1d5db", margin: 0, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>{ramData.note}</p>
        </div>
      </div>

      {/* If not viable, push cloud hard */}
      {(gpuData.canHandle === false || !ramData.viable) && (
        <div style={{
          padding: 24, borderRadius: 12, background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(59,130,246,0.08))",
          border: "1px solid rgba(245,158,11,0.15)", marginBottom: 28,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>💡 Don't have the right hardware? Use cloud GPUs</h3>
          <p style={{ color: "#d1d5db", fontSize: 14, margin: 0, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
            You don't need expensive hardware to create with AI. Cloud GPU services like RunPod and Vast.ai let you rent an RTX 4090 for as little as $0.20/hr. Check the providers below.
          </p>
        </div>
      )}

      {/* ComputeAtlas upgrade CTA — shown when hardware is limited or not viable */}
      {(gpuData.canHandle === false || gpuData.canHandle === "limited") && (
        <ComputeAtlasBanner variant="upgrade" />
      )}
    </div>
  );
}

function CloudCard({ provider }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={provider.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", textDecoration: "none", padding: 24,
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 14, transition: "all 0.25s", cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 36 }}>{provider.icon}</div>
        <span style={{
          padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: `${provider.tagColor}20`, color: provider.tagColor,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {provider.tag}
        </span>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>{provider.name}</h3>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>{provider.description}</p>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Pricing</div>
        <div style={{ fontSize: 13, color: "#d1d5db", fontFamily: "'Space Grotesk', sans-serif" }}>{provider.pricing}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>GPUs</div>
        <div style={{ fontSize: 13, color: "#d1d5db", fontFamily: "'Space Grotesk', sans-serif" }}>{provider.gpus}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {provider.features.map((f, i) => (
          <span key={i} style={{
            padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: "rgba(255,255,255,0.04)", color: "#9ca3af",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {f}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, color: hovered ? "#f59e0b" : "#6b7280", fontSize: 13, fontWeight: 600, transition: "color 0.2s", fontFamily: "'JetBrains Mono', monospace" }}>
        Visit {provider.name} <ExternalLink />
      </div>
    </a>
  );
}

// ─── MAIN ───
export default function GPUComputePage() {
  const [gpu, setGpu] = useState("");
  const [cpu, setCpu] = useState("");
  const [ram, setRam] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const canLookup = gpu && cpu && ram;

  const handleLookup = () => {
    if (canLookup) setShowDetail(true);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d1a", color: "#f0f0f0",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, animation: mounted ? "fadeSlideIn 0.5s ease" : "none" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 20, marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulseGlow 2s ease infinite" }}></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>GPU COMPUTE</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 12, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
            Can your hardware<br />
            <span style={{ color: "#f59e0b" }}>handle AI?</span>
          </h1>
          <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Select your GPU, CPU, and RAM below. We'll show you exactly what AI models your hardware can run — and what it can't.
          </p>
        </div>

        {/* SECTION 1: Hardware Selector */}
        {!showDetail ? (
          <div style={{ animation: mounted ? "fadeSlideIn 0.6s ease" : "none" }}>
            <div style={{
              padding: 32, background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, marginBottom: 48,
            }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                <Dropdown label="GPU" options={Object.keys(GPU_DATA)} value={gpu} onChange={setGpu} placeholder="Select your GPU" />
                <Dropdown label="CPU" options={Object.keys(CPU_DATA)} value={cpu} onChange={setCpu} placeholder="Select your CPU" />
                <Dropdown label="RAM" options={RAM_OPTIONS} value={ram} onChange={setRam} placeholder="Select RAM" />
              </div>
              <button
                onClick={handleLookup}
                disabled={!canLookup}
                style={{
                  width: "100%", padding: "14px 24px",
                  background: canLookup ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.04)",
                  border: "none", borderRadius: 10, color: canLookup ? "#0d0d1a" : "#4b5563",
                  fontSize: 16, fontWeight: 700, cursor: canLookup ? "pointer" : "not-allowed",
                  fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
              >
                {canLookup ? "→ Check my hardware" : "Select GPU, CPU, and RAM to continue"}
              </button>
            </div>

            {/* Quick VRAM reference */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Quick VRAM Reference</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { vram: "4–6 GB", status: "🔴", label: "Not viable for modern AI" },
                  { vram: "8 GB", status: "🟡", label: "SD 1.5 only. Very limited." },
                  { vram: "10–12 GB", status: "🟡", label: "SDXL works. Flux is tight." },
                  { vram: "16 GB", status: "🟢", label: "Sweet spot. Flux + SDXL." },
                  { vram: "24+ GB", status: "🟢", label: "Run anything. Full models." },
                ].map((r, i) => (
                  <div key={i} style={{
                    padding: "12px 16px", background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 16 }}>{r.status}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f0f0f0", fontFamily: "'JetBrains Mono', monospace" }}>{r.vram}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Space Grotesk', sans-serif" }}>{r.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ComputeAtlas inline ad — shown on selector page */}
            <ComputeAtlasBanner variant="inline" />
          </div>
        ) : (
          <div style={{ marginBottom: 48 }}>
            <HardwareDetail gpu={gpu} cpu={cpu} ram={ram} onBack={() => setShowDetail(false)} />
          </div>
        )}

        {/* SECTION 2: Cloud GPU Providers */}
        <div style={{ animation: mounted ? "fadeSlideIn 0.7s ease" : "none" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f0f0f0", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
              No GPU? No problem.
            </h2>
            <p style={{ color: "#6b7280", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
              Rent cloud GPUs by the second. Zero setup, pay only for what you use.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14 }}>
              {["Zero Setup", "Pay Per Second", "Scale on Demand"].map((t, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {CLOUD_PROVIDERS.map((p, i) => <CloudCard key={i} provider={p} />)}
          </div>
        </div>

        {/* ComputeAtlas hero banner — always visible */}
        <ComputeAtlasBanner variant="hero" />

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 12, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>
            Prices and specs are approximate and subject to change. Last updated March 2026.
          </p>
        </div>
      </div>
    </div>
  );
}