

"use client";
// app/proof/upload/page.tsx
// Upload real screenshots/videos proving your workflows work
// Visit: /proof/upload

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

// All 50 workflow IDs and titles for the selector
const WORKFLOWS = [
  { id: "01-flux-dev-t2i",           title: "FLUX Dev Text-to-Image",         category: "Image" },
  { id: "02-flux-schnell-fast",       title: "FLUX Schnell Ultra-Fast",         category: "Image" },
  { id: "03-sdxl-standard",           title: "SDXL Standard",                   category: "Image" },
  { id: "04-sdxl-portrait",           title: "SDXL Portrait Studio",            category: "Image" },
  { id: "05-sdxl-turbo-fast",         title: "SDXL Turbo — 1-Step",            category: "Image" },
  { id: "06-sd15-classic",            title: "SD 1.5 Classic",                  category: "Image" },
  { id: "07-flux-lora-character",     title: "FLUX Dev + Character LoRA",       category: "Image" },
  { id: "08-sdxl-lora-style",         title: "SDXL + Style LoRA",              category: "Image" },
  { id: "09-sdxl-landscape",          title: "SDXL Landscape & Nature",         category: "Image" },
  { id: "10-sd15-anime",              title: "SD 1.5 Anime (AnythingV5)",       category: "Image" },
  { id: "11-ltx-video-t2v-basic",     title: "LTX Video 2.3 — Basic T2V",      category: "Video" },
  { id: "12-ltx-video-cinematic",     title: "LTX Video — Cinematic 9:16",      category: "Video" },
  { id: "13-ltx-video-action-chase",  title: "LTX Video — Action Chase",        category: "Video" },
  { id: "14-ltx-video-fast-draft",    title: "LTX Video — Fast Draft",          category: "Video" },
  { id: "15-animatediff-simple",      title: "AnimateDiff Simple Loop",          category: "Video" },
  { id: "16-animatediff-character",   title: "AnimateDiff Character Walk",       category: "Video" },
  { id: "17-animatediff-loop",        title: "AnimateDiff Seamless Loop",        category: "Video" },
  { id: "18-animatediff-landscape",   title: "AnimateDiff Landscape Timelapse",  category: "Video" },
  { id: "19-animatediff-product",     title: "AnimateDiff 360 Product Spin",     category: "Video" },
  { id: "20-animatediff-zoom",        title: "AnimateDiff Slow Zoom",            category: "Video" },
  { id: "21-upscale-4x-esrgan",       title: "4x ESRGAN Upscale",               category: "Enhance" },
  { id: "22-upscale-anime",           title: "4x Anime Upscale",                 category: "Enhance" },
  { id: "23-sdxl-img2img",            title: "SDXL Image-to-Image",             category: "Enhance" },
  { id: "24-sd15-style-transfer",     title: "SD 1.5 Style Transfer",            category: "Enhance" },
  { id: "25-sdxl-sketch-to-image",    title: "SDXL Sketch to Photo",             category: "Enhance" },
  { id: "26-sdxl-inpainting",         title: "SDXL Inpainting",                  category: "Enhance" },
  { id: "27-sd15-object-removal",     title: "SD 1.5 Object Removal",            category: "Enhance" },
  { id: "28-sdxl-product-shot",       title: "SDXL Product Photography",         category: "Specialty" },
  { id: "29-sdxl-architecture",       title: "SDXL Architectural Visualization",  category: "Specialty" },
  { id: "30-flux-portrait-v2",        title: "FLUX Portrait v2 — Editorial",     category: "Image" },
  { id: "31-controlnet-canny-sdxl",   title: "ControlNet Canny — SDXL",         category: "ControlNet" },
  { id: "32-controlnet-depth-sdxl",   title: "ControlNet Depth — SDXL",         category: "ControlNet" },
  { id: "33-controlnet-openpose",     title: "ControlNet OpenPose",              category: "ControlNet" },
  { id: "34-controlnet-lineart",      title: "ControlNet Lineart — Anime",       category: "ControlNet" },
  { id: "35-controlnet-tile",         title: "ControlNet Tile Upscale",          category: "ControlNet" },
  { id: "36-sdxl-batch-4",            title: "SDXL Batch ×4 Variations",        category: "Specialty" },
  { id: "37-sdxl-batch-8",            title: "SDXL Batch ×8 Grid",              category: "Specialty" },
  { id: "38-sdxl-logo-design",        title: "SDXL Logo & Brand Design",        category: "Specialty" },
  { id: "39-sdxl-concept-art",        title: "SDXL Character Concept Sheet",     category: "Specialty" },
  { id: "40-flux-realistic-person",   title: "FLUX Realistic Person",            category: "Image" },
  { id: "41-sdxl-interior-design",    title: "SDXL Interior Design",             category: "Specialty" },
  { id: "42-sd15-pixel-art",          title: "SD 1.5 Pixel Art Generator",       category: "Specialty" },
  { id: "43-sdxl-fashion-design",     title: "SDXL Fashion Design",              category: "Specialty" },
  { id: "44-flux-food-photography",   title: "FLUX Food Photography",             category: "Specialty" },
  { id: "45-sdxl-sci-fi-scene",       title: "SDXL Sci-Fi Environment",          category: "Specialty" },
  { id: "46-flux-lora-slacker-alien", title: "FLUX + Slacker Alien LoRA",        category: "Image" },
  { id: "47-sdxl-abstract-art",       title: "SDXL Abstract Art",                category: "Specialty" },
  { id: "48-flux-wildlife-photo",     title: "FLUX Wildlife Photography",         category: "Image" },
  { id: "49-sdxl-night-city",         title: "SDXL Night City Aerial",           category: "Image" },
  { id: "50-flux-dev-portrait-v2",    title: "FLUX Cinematic Portrait",           category: "Image" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Image: "#22c55e", Video: "#38bdf8", Enhance: "#f59e0b",
  ControlNet: "#c084fc", Specialty: "#f472b6",
};

interface Upload {
  workflowId: string;
  workflowTitle: string;
  url: string;
  caption: string;
  type: string;
  uploadedAt: string;
}

const S = {
  page: { background: "#080b0f", minHeight: "100vh", color: "#e8edf2", fontFamily: "var(--font-dm-sans), sans-serif" } as React.CSSProperties,
  nav: { borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,11,15,0.9)", backdropFilter: "blur(20px)", position: "sticky" as const, top: 0, zIndex: 100 },
  container: { maxWidth: 900, margin: "0 auto", padding: "3rem 2rem 5rem" },
  card: { background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1.75rem", marginBottom: "1.5rem" },
  label: { fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6, display: "block" },
  input: { width: "100%", background: "#080b0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "0.7rem 1rem", color: "#e8edf2", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, outline: "none" } as React.CSSProperties,
  select: { width: "100%", background: "#080b0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "0.7rem 1rem", color: "#e8edf2", fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, outline: "none" } as React.CSSProperties,
  btn: { background: "#f59e0b", color: "#000", border: "none", padding: "0.8rem 2rem", borderRadius: 7, fontWeight: 700, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
  btnSecondary: { background: "transparent", color: "#e8edf2", border: "1px solid rgba(255,255,255,0.15)", padding: "0.8rem 2rem", borderRadius: 7, fontWeight: 500, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
};

export default function ProofUploadPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [caption, setCaption] = useState("");
  const [gpuInfo, setGpuInfo] = useState("");
  const [genTime, setGenTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...Array.from(new Set(WORKFLOWS.map(w => w.category)))];
  const filteredWorkflows = categoryFilter === "All" ? WORKFLOWS : WORKFLOWS.filter(w => w.category === categoryFilter);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setStatus(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || !selectedWorkflow) {
      setStatus({ type: "error", msg: "Select a workflow and choose a file first." });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workflowId", selectedWorkflow);
      fd.append("caption", `${caption}${gpuInfo ? ` | GPU: ${gpuInfo}` : ""}${genTime ? ` | Gen time: ${genTime}` : ""}`);

      const res = await fetch("/api/proof/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      const wf = WORKFLOWS.find(w => w.id === selectedWorkflow);
      const newUpload: Upload = {
        workflowId: selectedWorkflow,
        workflowTitle: wf?.title || selectedWorkflow,
        url: data.url,
        caption: data.caption,
        type: file.type,
        uploadedAt: new Date().toLocaleString(),
      };

      setUploads(prev => [newUpload, ...prev]);
      setStatus({ type: "success", msg: `✓ Uploaded! Live at /proof — visible on the gallery page.` });

      // Reset form
      setFile(null);
      setPreview(null);
      setCaption("");
      setGpuInfo("");
      setGenTime("");
      setSelectedWorkflow("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setStatus({ type: "error", msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.1rem", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
          NeuralHub<span style={{ color: "#f59e0b" }}>.ai</span>
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/proof" style={{ color: "#9aafc0", textDecoration: "none", fontSize: 13 }}>View Gallery →</Link>
          <Link href="/workflows" style={{ color: "#9aafc0", textDecoration: "none", fontSize: 13 }}>Workflows</Link>
        </div>
      </nav>

      <div style={S.container}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.7rem", color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            // Proof Upload
          </div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", lineHeight: 1.1, marginBottom: "0.75rem" }}>
            Upload your<br /><span style={{ color: "#f59e0b" }}>workflow outputs.</span>
          </h1>
          <p style={{ color: "#9aafc0", fontSize: "1rem", lineHeight: 1.7, fontWeight: 300, maxWidth: 560 }}>
            Generated something with a NeuralHub workflow? Upload the screenshot or video here.
            It goes live on the <Link href="/proof" style={{ color: "#f59e0b", textDecoration: "none" }}>/proof gallery</Link> instantly.
          </p>
        </div>

        {/* Setup notice */}
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: 13, color: "#9aafc0", lineHeight: 1.7 }}>
          <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#f59e0b", marginRight: 8 }}>⚙️ SETUP</span>
          Uploads require <code style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#f59e0b", fontSize: 11 }}>@vercel/blob</code> and a <code style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#f59e0b", fontSize: 11 }}>BLOB_READ_WRITE_TOKEN</code> env var.
          Run <code style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#f59e0b", fontSize: 11 }}>npm install @vercel/blob</code> then add the token in your Vercel dashboard → Project Settings → Environment Variables.
        </div>

        {/* Upload form */}
        <div style={S.card}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "1.5rem" }}>Upload Output</h2>

          {/* Step 1 — Select workflow */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={S.label}>01 — Which workflow produced this?</label>

            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  style={{ background: categoryFilter === cat ? "rgba(245,158,11,0.15)" : "transparent", border: `1px solid ${categoryFilter === cat ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, color: categoryFilter === cat ? "#f59e0b" : "#7a8a9a", fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, padding: "3px 9px", borderRadius: 4, cursor: "pointer" }}>
                  {cat}
                </button>
              ))}
            </div>

            <select value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)} style={S.select}>
              <option value="">Select a workflow...</option>
              {filteredWorkflows.map(wf => (
                <option key={wf.id} value={wf.id}>[{wf.category}] {wf.title}</option>
              ))}
            </select>

            {selectedWorkflow && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[WORKFLOWS.find(w => w.id === selectedWorkflow)?.category || ""] || "#f59e0b", display: "inline-block" }} />
                <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#5a6a7a" }}>{selectedWorkflow}</span>
              </div>
            )}
          </div>

          {/* Step 2 — Drop zone */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={S.label}>02 — Drop your screenshot or video</label>
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#f59e0b" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, padding: "2.5rem", textAlign: "center", cursor: "pointer",
                background: dragOver ? "rgba(245,158,11,0.04)" : "#080b0f",
                transition: "all 0.2s",
              }}
            >
              {preview ? (
                <div>
                  {file?.type.startsWith("video/") ? (
                    <video src={preview} style={{ maxHeight: 300, maxWidth: "100%", borderRadius: 8 }} controls />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" style={{ maxHeight: 300, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
                  )}
                  <div style={{ marginTop: 10, fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#5a6a7a" }}>
                    {file?.name} — {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#f59e0b" }}>Click to change file</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📸</div>
                  <div style={{ fontSize: 14, color: "#9aafc0", marginBottom: 4 }}>Drag & drop or click to browse</div>
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "#5a6a7a" }}>
                    JPG · PNG · WebP · MP4 — Max 10MB (50MB for video)
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Step 3 — Metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={S.label}>03 — GPU used (optional)</label>
              <input style={S.input} placeholder="e.g. RTX 5080 16GB" value={gpuInfo} onChange={e => setGpuInfo(e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Gen time (optional)</label>
              <input style={S.input} placeholder="e.g. ~47s" value={genTime} onChange={e => setGenTime(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={S.label}>Caption (optional)</label>
            <input style={S.input} placeholder="Describe the prompt or settings used..." value={caption} onChange={e => setCaption(e.target.value)} />
          </div>

          {/* Status message */}
          {status && (
            <div style={{
              padding: "0.8rem 1rem", borderRadius: 7, marginBottom: "1rem", fontSize: 13,
              background: status.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              color: status.type === "success" ? "#22c55e" : "#ef4444",
              fontFamily: "var(--font-jetbrains-mono)",
            }}>
              {status.msg}
            </div>
          )}

          {/* Upload button */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleUpload} disabled={uploading || !file || !selectedWorkflow} style={{
              ...S.btn,
              opacity: (uploading || !file || !selectedWorkflow) ? 0.5 : 1,
              cursor: (uploading || !file || !selectedWorkflow) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {uploading ? "Uploading..." : "Upload Proof →"}
            </button>
            {(file || preview) && (
              <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }} style={S.btnSecondary}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Uploaded this session */}
        {uploads.length > 0 && (
          <div style={S.card}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "1.25rem" }}>
              Uploaded this session ({uploads.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {uploads.map((u, i) => (
                <div key={i} style={{ background: "#080b0f", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {u.type.startsWith("video/") ? (
                    <video src={u.url} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.url} alt={u.workflowTitle} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                  )}
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#e8edf2", marginBottom: 2 }}>{u.workflowTitle}</div>
                    {u.caption && <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "var(--font-jetbrains-mono)" }}>{u.caption}</div>}
                    <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4, fontFamily: "var(--font-jetbrains-mono)" }}>✓ Live on /proof</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Link href="/proof" style={{ background: "#f59e0b", color: "#000", padding: "0.7rem 1.5rem", borderRadius: 7, fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-block" }}>
                View Live Gallery →
              </Link>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ ...S.card, borderColor: "rgba(245,158,11,0.15)" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "1rem" }}>
            Quick start
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              "1. Run any NeuralHub workflow in ComfyUI",
              "2. Save the output image or video from ComfyUI (right-click → Save Image)",
              "3. Come back here, select which workflow you used",
              "4. Drop the file, add optional GPU info and gen time",
              "5. Hit Upload — it appears on /proof immediately",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#9aafc0" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#f59e0b", marginTop: 1, flexShrink: 0 }}>→</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
