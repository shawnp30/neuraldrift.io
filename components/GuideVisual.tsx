"use client";

import React, { useState } from "react";

/**
 * Branded, deterministic guide artwork.
 *
 * Replaces the generic Unsplash stock photography the guide cards used to pull
 * in (a cinema seat, a laptop on a desk, etc.) — imagery that had nothing to do
 * with the guide and cost a third-party network request per card.
 *
 * The output is pure SVG derived from the guide slug, so a given guide always
 * renders the same artwork, it ships with the page, and it matches the site
 * palette instead of fighting it.
 */

// Palette anchors mapped to the site's existing accent colors.
const PALETTES: Record<string, [string, string]> = {
  Beginner: ["#a3e635", "#22d3ee"],
  Intermediate: ["#f97316", "#f59e0b"],
  Advanced: ["#a78bfa", "#7c6af7"],
  Troubleshooting: ["#ef4444", "#f97316"],
  default: ["#7c6af7", "#22d3ee"],
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Pass `image` to use a real render for a guide (any path under /public, any
 * extension). The generated artwork below acts as the backdrop and as the
 * fallback: if the file is missing or fails to decode, the SVG stays visible
 * rather than leaving a broken image.
 */
export function GuideVisual({
  slug,
  variant = "default",
  className = "",
  image,
}: {
  slug: string;
  variant?: string;
  className?: string;
  image?: string;
}) {
  const [renderOk, setRenderOk] = useState(true);
  const seed = hash(slug);
  const [from, to] = PALETTES[variant] ?? PALETTES.default;
  const id = `gv-${seed.toString(36)}`;

  // Deterministic node graph — a nod to ComfyUI's node canvas.
  const nodes = Array.from({ length: 5 }, (_, i) => {
    const s = hash(slug + i);
    return {
      x: 12 + ((s % 70) + i * 4) % 76,
      y: 16 + (Math.floor(s / 7) % 68),
      r: 2.5 + (s % 3),
    };
  });

  return (
    <>
      {/* Real render, layered over the generated artwork. Falls back to the
          SVG automatically if the file is missing or fails to decode. */}
      {image && renderOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={() => setRenderOk(false)}
          className={className}
          style={{ zIndex: 1 }}
        />
      )}
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity="0.20" />
          <stop offset="100%" stopColor={to} stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.75" cy="0.2" r="0.8">
          <stop offset="0%" stopColor={to} stopOpacity="0.32" />
          <stop offset="100%" stopColor={to} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke={from} strokeOpacity="0.12" strokeWidth="0.4" />
        </pattern>
      </defs>

      <rect width="160" height="100" fill="#0a0a0b" />
      <rect width="160" height="100" fill={`url(#${id}-grid)`} />
      <rect width="160" height="100" fill={`url(#${id}-bg)`} />
      <rect width="160" height="100" fill={`url(#${id}-glow)`} />

      {/* Connecting edges */}
      {nodes.slice(0, -1).map((n, i) => (
        <line
          key={`e${i}`}
          x1={n.x}
          y1={n.y}
          x2={nodes[i + 1].x}
          y2={nodes[i + 1].y}
          stroke={to}
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle cx={n.x} cy={n.y} r={n.r + 3} fill={from} fillOpacity="0.10" />
          <circle cx={n.x} cy={n.y} r={n.r} fill={from} fillOpacity="0.85" />
        </g>
      ))}
      </svg>
    </>
  );
}
