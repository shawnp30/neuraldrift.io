import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NeuralDrift — ComfyUI Workflows, Guides, and Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06080d",
          backgroundImage:
            "radial-gradient(circle at 50% 35%, rgba(0,229,160,0.16), rgba(6,8,13,0) 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="5" fill="#00e5a0" opacity={0.9} />
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="#00e5a0"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity={0.5}
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#f5f7fa",
            }}
          >
            Neural<span style={{ color: "#00e5a0" }}>Drift</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: "#a8b0c4",
            letterSpacing: 1,
          }}
        >
          ComfyUI Workflows, Guides &amp; Tools for Local AI
        </div>
      </div>
    ),
    { ...size }
  );
}
