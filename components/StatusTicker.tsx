"use client";

import styles from "./LiveNewsTicker.module.css";

const statusItems = [
  "⚡ RTX 5080 — Primary test rig",
  "🔧 ComfyUI — Workflow engine",
  "🎬 LTX Video 2.3 — Cinematic generation",
  "🧠 FLUX Dev/Schnell — Image models",
  "📦 6 LoRA Models — Ready to download",
  "⚙️ 50 ComfyUI Workflows — Plug & play",
  "📧 15+ Subscribers — Weekly drops",
  "🎯 0 Ads — Just signal",
];

export default function StatusTicker() {
  // Double the items to ensure seamless loop if track is short
  const displayItems = [...statusItems, ...statusItems];

  return (
    <div
      className={styles.siteTicker}
      style={{ background: "#0a0a0a", borderBottom: "none" }}
    >
      <div className={styles.tickerTrack}>
        {displayItems.map((item, i) => (
          <span key={i} style={{ color: "#818cf8", fontWeight: 500 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
