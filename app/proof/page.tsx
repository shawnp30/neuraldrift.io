"use client";
// app/proof/page.tsx
// Public-facing proof gallery — shows all uploaded workflow outputs
// Images served from Vercel Blob via /api/proof/list

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Image",
  "Video",
  "Enhance",
  "ControlNet",
  "Specialty",
];

const CATEGORY_COLORS: Record<string, string> = {
  Image: "#22c55e",
  Video: "#38bdf8",
  Enhance: "#f59e0b",
  ControlNet: "#c084fc",
  Specialty: "#f472b6",
};

// Map workflow IDs to categories
const WORKFLOW_CATEGORIES: Record<string, string> = {
  "01-flux-dev-t2i": "Image",
  "02-flux-schnell-fast": "Image",
  "03-sdxl-standard": "Image",
  "04-sdxl-portrait": "Image",
  "05-sdxl-turbo-fast": "Image",
  "06-sd15-classic": "Image",
  "07-flux-lora-character": "Image",
  "08-sdxl-lora-style": "Image",
  "09-sdxl-landscape": "Image",
  "10-sd15-anime": "Image",
  "11-ltx-video-t2v-basic": "Video",
  "12-ltx-video-cinematic": "Video",
  "13-ltx-video-action-chase": "Video",
  "14-ltx-video-fast-draft": "Video",
  "15-animatediff-simple": "Video",
  "16-animatediff-character": "Video",
  "17-animatediff-loop": "Video",
  "18-animatediff-landscape": "Video",
  "19-animatediff-product": "Video",
  "20-animatediff-zoom": "Video",
  "21-upscale-4x-esrgan": "Enhance",
  "22-upscale-anime": "Enhance",
  "23-sdxl-img2img": "Enhance",
  "24-sd15-style-transfer": "Enhance",
  "25-sdxl-sketch-to-image": "Enhance",
  "26-sdxl-inpainting": "Enhance",
  "27-sd15-object-removal": "Enhance",
  "28-sdxl-product-shot": "Specialty",
  "29-sdxl-architecture": "Specialty",
  "30-flux-portrait-v2": "Image",
  "31-controlnet-canny-sdxl": "ControlNet",
  "32-controlnet-depth-sdxl": "ControlNet",
  "33-controlnet-openpose": "ControlNet",
  "34-controlnet-lineart": "ControlNet",
  "35-controlnet-tile": "ControlNet",
  "36-sdxl-batch-4": "Specialty",
  "37-sdxl-batch-8": "Specialty",
  "38-sdxl-logo-design": "Specialty",
  "39-sdxl-concept-art": "Specialty",
  "40-flux-realistic-person": "Image",
  "41-sdxl-interior-design": "Specialty",
  "42-sd15-pixel-art": "Specialty",
  "43-sdxl-fashion-design": "Specialty",
  "44-flux-food-photography": "Specialty",
  "45-sdxl-sci-fi-scene": "Specialty",
  "46-flux-lora-slacker-alien": "Image",
  "47-sdxl-abstract-art": "Specialty",
  "48-flux-wildlife-photo": "Image",
  "49-sdxl-night-city": "Image",
  "50-flux-dev-portrait-v2": "Image",
};

interface ProofItem {
  url: string;
  workflowId: string;
  workflowTitle: string;
  caption: string;
  type: string;
  uploadedAt: string;
  pathname: string;
}

export default function ProofGalleryPage() {
  const [items, setItems] = useState<ProofItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<ProofItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proof/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setItems(data.items);
        else if (data.error) setError(data.error);
      })
      .catch(() =>
        setError("Could not load gallery. API may not be set up yet.")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter(
          (i) => WORKFLOW_CATEGORIES[i.workflowId] === activeCategory
        );

  return (
    <div
      style={{
        background: "#080b0f",
        minHeight: "100vh",
        color: "#e8edf2",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900, width: "100%", cursor: "default" }}
          >
            {lightbox.type?.startsWith("video/") ? (
              <video
                src={lightbox.url}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  maxHeight: "75vh",
                  objectFit: "contain",
                }}
                controls
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightbox.url}
                alt={lightbox.workflowTitle}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  maxHeight: "75vh",
                  objectFit: "contain",
                }}
              />
            )}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#fff",
                  }}
                >
                  {lightbox.workflowTitle}
                </div>
                {lightbox.caption && (
                  <div style={{ fontSize: 13, color: "#9aafc0", marginTop: 4 }}>
                    {lightbox.caption}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a
                  href={`/workflows/${lightbox.workflowId}.json`}
                  download
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.3)",
                    padding: "5px 12px",
                    borderRadius: 5,
                    textDecoration: "none",
                  }}
                >
                  ↓ Get JSON
                </a>
                <button
                  onClick={() => setLightbox(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#e8edf2",
                    padding: "5px 12px",
                    borderRadius: 5,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 2rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8,11,15,0.9)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
            }}
          />
          neuraldrift.io<span style={{ color: "#f59e0b" }}>.ai</span>
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            href="/proof/upload"
            style={{
              background: "#f59e0b",
              color: "#000",
              padding: "0.4rem 1rem",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            + Upload Proof
          </Link>
          <Link
            href="/workflows"
            style={{ color: "#9aafc0", textDecoration: "none", fontSize: 13 }}
          >
            Workflows
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: "3.5rem 2rem 2rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          // Proof Gallery
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}
        >
          These workflows actually work.
          <br />
          <span style={{ color: "#f59e0b" }}>Here&apos;s the proof.</span>
        </h1>
        <p
          style={{
            color: "#9aafc0",
            fontSize: "1rem",
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: 560,
            marginBottom: "2rem",
          }}
        >
          Every image and video below was generated using a neuraldrift.io
          workflow JSON in ComfyUI on real consumer hardware. Click any output
          to see the workflow it came from and download the JSON.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {[
            { num: items.length.toString(), label: "outputs uploaded" },
            {
              num: new Set(items.map((i) => i.workflowId)).size.toString(),
              label: "workflows proven",
            },
            {
              num: items
                .filter((i) => i.type?.startsWith("video/"))
                .length.toString(),
              label: "videos",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "0.75rem 1.25rem",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "#f59e0b",
                }}
              >
                {s.num}
              </span>
              <span style={{ fontSize: 12, color: "#7a8a9a" }}>{s.label}</span>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <Link
              href="/proof/upload"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                padding: "0.75rem 1.25rem",
                fontSize: 13,
                color: "#f59e0b",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              + Be the first to upload →
            </Link>
          )}
        </div>

        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background:
                  activeCategory === cat
                    ? "rgba(245,158,11,0.12)"
                    : "transparent",
                border: `1px solid ${activeCategory === cat ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: activeCategory === cat ? "#f59e0b" : "#7a8a9a",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {cat !== "All" && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: CATEGORY_COLORS[cat] || "#f59e0b",
                    display: "inline-block",
                  }}
                />
              )}
              {cat}
              <span style={{ opacity: 0.5, fontSize: 10 }}>
                {cat === "All"
                  ? items.length
                  : items.filter(
                      (i) => WORKFLOW_CATEGORIES[i.workflowId] === cat
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Gallery grid */}
      <section
        style={{ padding: "0 2rem 5rem", maxWidth: 1200, margin: "0 auto" }}
      >
        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "#5a6a7a",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
            }}
          >
            // Loading gallery...
          </div>
        )}

        {/* Error / empty states */}
        {!loading && error && (
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                color: "#ef4444",
                marginBottom: 8,
              }}
            >
              {error}
            </div>
            <p style={{ fontSize: 13, color: "#7a8a9a", marginBottom: "1rem" }}>
              Set up{" "}
              <code
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  color: "#f59e0b",
                }}
              >
                BLOB_READ_WRITE_TOKEN
              </code>{" "}
              in Vercel → Project Settings → Environment Variables to enable
              uploads.
            </p>
            <Link
              href="/proof/upload"
              style={{
                background: "#f59e0b",
                color: "#000",
                padding: "0.6rem 1.25rem",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Set Up Upload →
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: "1rem" }}>📸</div>
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              No outputs yet
            </h3>
            <p
              style={{ color: "#7a8a9a", fontSize: 13, marginBottom: "1.5rem" }}
            >
              {activeCategory === "All"
                ? "Upload your first workflow output to get started."
                : `No ${activeCategory} outputs uploaded yet.`}
            </p>
            <Link
              href="/proof/upload"
              style={{
                background: "#f59e0b",
                color: "#000",
                padding: "0.7rem 1.5rem",
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              + Upload First Output →
            </Link>
          </div>
        )}

        {/* Masonry-style grid */}
        {!loading && !error && filtered.length > 0 && (
          <div
            style={{
              columns: "repeat(auto-fill, minmax(280px, 1fr))",
              columnGap: "1rem",
              gap: "1rem",
            }}
          >
            {filtered.map((item, i) => {
              const category = WORKFLOW_CATEGORIES[item.workflowId] || "Image";
              const catColor = CATEGORY_COLORS[category] || "#f59e0b";
              return (
                <div
                  key={i}
                  onClick={() => setLightbox(item)}
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    overflow: "hidden",
                    cursor: "pointer",
                    breakInside: "avoid",
                    marginBottom: "1rem",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Media */}
                  {item.type?.startsWith("video/") ? (
                    <video
                      src={item.url}
                      style={{ width: "100%", display: "block" }}
                      muted
                      loop
                      onMouseEnter={(e) =>
                        (e.target as HTMLVideoElement).play()
                      }
                      onMouseLeave={(e) =>
                        (e.target as HTMLVideoElement).pause()
                      }
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.workflowTitle}
                      style={{ width: "100%", display: "block" }}
                      loading="lazy"
                    />
                  )}

                  {/* Info */}
                  <div style={{ padding: "10px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: catColor,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 10,
                          color: catColor,
                        }}
                      >
                        {category}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#e8edf2",
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.workflowTitle}
                    </div>
                    {item.caption && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#5a6a7a",
                          fontFamily: "var(--font-jetbrains-mono)",
                          lineHeight: 1.4,
                          marginBottom: 6,
                        }}
                      >
                        {item.caption}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <a
                        href={`/workflows/${item.workflowId}.json`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 10,
                          color: "#f59e0b",
                          textDecoration: "none",
                          border: "1px solid rgba(245,158,11,0.2)",
                          padding: "2px 7px",
                          borderRadius: 3,
                        }}
                      >
                        ↓ JSON
                      </a>
                      {item.type?.startsWith("video/") && (
                        <span
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            fontSize: 9,
                            color: "#38bdf8",
                            border: "1px solid rgba(56,189,248,0.2)",
                            padding: "2px 6px",
                            borderRadius: 3,
                          }}
                        >
                          VIDEO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upload CTA at bottom */}
      {!loading && (
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 5rem" }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.05), transparent)",
              border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 12,
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                Generated something with a neuraldrift.io workflow?
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#9aafc0",
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                Upload your output and it appears in this gallery instantly.
              </p>
            </div>
            <Link
              href="/proof/upload"
              style={{
                background: "#f59e0b",
                color: "#000",
                padding: "0.75rem 1.75rem",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              + Upload Your Output →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
