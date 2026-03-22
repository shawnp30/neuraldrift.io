"use client";
// components/WorkflowGPUBanner.tsx
// Add this ABOVE the workflow card grid on /workflows
// It makes the GPU selector impossible to miss and shows compatibility
// before the user has to hunt for a dropdown

import { useState } from "react";

const GPUS = [
  { label: "RTX 5090 (32GB)", id: "rtx5090", vram: 32 },
  { label: "RTX 5080 (16GB)", id: "rtx5080", vram: 16 },
  { label: "RTX 4090 (24GB)", id: "rtx4090", vram: 24 },
  { label: "RTX 4080 (16GB)", id: "rtx4080", vram: 16 },
  { label: "RTX 4070 Ti (12GB)", id: "rtx4070ti", vram: 12 },
  { label: "RTX 4070 (12GB)", id: "rtx4070", vram: 12 },
  { label: "RTX 3090 (24GB)", id: "rtx3090", vram: 24 },
  { label: "RTX 3080 16GB", id: "rtx3080_16", vram: 16 },
  { label: "RTX 3080 10GB", id: "rtx3080_10", vram: 10 },
  { label: "RTX 3060 (12GB)", id: "rtx3060", vram: 12 },
  { label: "GTX 1660 Ti (6GB)", id: "gtx1660ti", vram: 6 },
];

// What each VRAM tier can run
function getCompatibility(vram: number) {
  return {
    sdxl: vram >= 8,
    flux_schnell: vram >= 12,
    flux_dev: vram >= 16,
    ltx_video: vram >= 12,
    animatediff: vram >= 8,
    lora_training: vram >= 12,
    canRunAll: vram >= 16,
    canRunCount: [vram >= 8, vram >= 12, vram >= 16, vram >= 12, vram >= 8, vram >= 12].filter(Boolean).length,
  };
}

export default function WorkflowGPUBanner({
  onGPUChange,
}: {
  onGPUChange?: (gpuId: string, vram: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const gpu = GPUS.find((g) => g.id === selected);
  const compat = gpu ? getCompatibility(gpu.vram) : null;

  function handleSelect(id: string) {
    setSelected(id);
    const g = GPUS.find((g) => g.id === id);
    if (g && onGPUChange) onGPUChange(g.id, g.vram);
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)",
      border: "1px solid rgba(245,158,11,0.2)",
      borderRadius: 14, padding: "1.75rem 2rem", marginBottom: "2.5rem",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>⚡</div>
        <div>
          <div style={{ fontFamily: "'Oxanium', monospace", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
            Select your GPU first
          </div>
          <div style={{ fontSize: 12, color: "#7a8a9a", marginTop: 2 }}>
            Every workflow will show live compatibility and auto-adjust settings for your card
          </div>
        </div>
      </div>

      {/* GPU selector grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 8, marginBottom: selected ? "1.5rem" : 0
      }}>
        {GPUS.map((g) => {
          const c = getCompatibility(g.vram);
          const isSelected = selected === g.id;
          return (
            <button
              key={g.id}
              onClick={() => handleSelect(g.id)}
              style={{
                background: isSelected ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSelected ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                textAlign: "left", transition: "all 0.15s",
              }}
            >
              <div style={{
                fontFamily: "monospace", fontSize: 12, fontWeight: 600,
                color: isSelected ? "#f59e0b" : "#e8edf2", marginBottom: 4
              }}>
                {g.label.split(" (")[0]}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#4a5a6a", fontFamily: "monospace" }}>
                  {g.vram}GB VRAM
                </span>
                <span style={{
                  fontSize: 10, fontFamily: "monospace",
                  color: c.canRunAll ? "#22c55e" : c.canRunCount >= 4 ? "#f59e0b" : "#7a8a9a"
                }}>
                  {c.canRunCount}/6 workflows
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compatibility panel — shows after GPU selection */}
      {selected && compat && gpu && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1.25rem",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem",
            flexWrap: "wrap"
          }}>
            <span style={{
              fontFamily: "monospace", fontSize: 12, color: "#f59e0b",
              background: "rgba(245,158,11,0.08)", padding: "3px 10px", borderRadius: 4,
              border: "1px solid rgba(245,158,11,0.2)"
            }}>
              {gpu.label}
            </span>
            <span style={{
              fontFamily: "monospace", fontSize: 12,
              color: compat.canRunAll ? "#22c55e" : "#f59e0b",
              background: compat.canRunAll ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
              padding: "3px 10px", borderRadius: 4,
              border: `1px solid ${compat.canRunAll ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`
            }}>
              {compat.canRunCount} of 6 workflows compatible
            </span>
            <a
              href="/optimizer"
              style={{
                fontSize: 12, color: "#7a8a9a",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 4
              }}
            >
              Full score breakdown in Optimizer →
            </a>
          </div>

          {/* Per-workflow compat chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { name: "SDXL", ok: compat.sdxl },
              { name: "FLUX Schnell", ok: compat.flux_schnell },
              { name: "FLUX Dev", ok: compat.flux_dev },
              { name: "LTX Video", ok: compat.ltx_video },
              { name: "AnimateDiff", ok: compat.animatediff },
              { name: "LoRA Training", ok: compat.lora_training },
            ].map((item) => (
              <span
                key={item.name}
                style={{
                  fontFamily: "monospace", fontSize: 11,
                  padding: "3px 9px", borderRadius: 4,
                  background: item.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                  border: `1px solid ${item.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                  color: item.ok ? "#22c55e" : "#7a8a9a",
                }}
              >
                {item.ok ? "✓" : "✗"} {item.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
