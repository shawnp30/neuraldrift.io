'use client';
import { useEffect, useState } from "react";
import styles from "./LiveNewsTicker.module.css";

export default function DualTicker() {
  return (
    <div className="space-y-4">

      {/* Ticker A */}
      <div className="ticker ticker-a">
        <div className="ticker-content">
          <span>ComfyUI: New XL block node update released...</span>
          <span>Stable Diffusion 3.5 is in early leak testing...</span>
          <span>Hugging Face adds automatic model version snapshots...</span>
          <span>Veo 3 improving motion consistency in closed beta...</span>
        </div>
      </div>

      {/* Ticker B */}
      <div className="ticker ticker-b">
        <div className="ticker-content">
          <span>NVIDIA reports 30% training speed boost on H100...</span>
          <span>OpenAI pushes new inference optimizations...</span>
          <span>Luma AI announces new real-time 3D capture...</span>
          <span>Flux.1 adds direct video-to-video node support...</span>
        </div>
      </div>

    </div>
  );
}