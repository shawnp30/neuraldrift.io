"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

const WORKFLOWS = [
  { id: "01-flux-dev-t2i", title: "FLUX Dev Text-to-Image", category: "Image" },
  { id: "02-flux-schnell-fast", title: "FLUX Schnell Ultra-Fast", category: "Image" },
  { id: "03-sdxl-standard", title: "SDXL Standard", category: "Image" },
  { id: "04-sdxl-portrait", title: "SDXL Portrait Studio", category: "Image" },
  { id: "05-sdxl-turbo-fast", title: "SDXL Turbo — 1-Step", category: "Image" },
  { id: "06-sd15-classic", title: "SD 1.5 Classic", category: "Image" },
  { id: "07-flux-lora-character", title: "FLUX Dev + Character LoRA", category: "Image" },
  { id: "08-sdxl-lora-style", title: "SDXL + Style LoRA", category: "Image" },
  { id: "09-sdxl-landscape", title: "SDXL Landscape & Nature", category: "Image" },
  { id: "10-sd15-anime", title: "SD 1.5 Anime (AnythingV5)", category: "Image" },
  { id: "11-ltx-video-t2v-basic", title: "LTX Video 2.3 — Basic T2V", category: "Video" },
  { id: "12-ltx-video-cinematic", title: "LTX Video — Cinematic 9:16", category: "Video" },
  { id: "13-ltx-video-action-chase", title: "LTX Video — Action Chase", category: "Video" },
  { id: "14-ltx-video-fast-draft", title: "LTX Video — Fast Draft", category: "Video" },
  { id: "15-animatediff-simple", title: "AnimateDiff Simple Loop", category: "Video" },
  { id: "16-animatediff-character", title: "AnimateDiff Character Walk", category: "Video" },
  { id: "17-animatediff-loop", title: "AnimateDiff Seamless Loop", category: "Video" },
  { id: "18-animatediff-landscape", title: "AnimateDiff Landscape Timelapse", category: "Video" },
  { id: "19-animatediff-product", title: "AnimateDiff 360 Product Spin", category: "Video" },
  { id: "20-animatediff-zoom", title: "AnimateDiff Slow Zoom", category: "Video" },
  { id: "21-upscale-4x-esrgan", title: "4x ESRGAN Upscale", category: "Enhance" },
  { id: "22-upscale-anime", title: "4x Anime Upscale", category: "Enhance" },
  { id: "23-sdxl-img2img", title: "SDXL Image-to-Image", category: "Enhance" },
  { id: "24-sd15-style-transfer", title: "SD 1.5 Style Transfer", category: "Enhance" },
  { id: "25-sdxl-sketch-to-image", title: "SDXL Sketch to Photo", category: "Enhance" },
  { id: "26-sdxl-inpainting", title: "SDXL Inpainting", category: "Enhance" },
  { id: "27-sd15-object-removal", title: "SD 1.5 Object Removal", category: "Enhance" },
  { id: "28-sdxl-product-shot", title: "SDXL Product Photography", category: "Specialty" },
  { id: "29-sdxl-architecture", title: "SDXL Architectural Visualization", category: "Specialty" },
  { id: "30-flux-portrait-v2", title: "FLUX Portrait v2 — Editorial", category: "Image" },
  { id: "31-controlnet-canny-sdxl", title: "ControlNet Canny — SDXL", category: "ControlNet" },
  { id: "32-controlnet-depth-sdxl", title: "ControlNet Depth — SDXL", category: "ControlNet" },
  { id: "33-controlnet-openpose", title: "ControlNet OpenPose", category: "ControlNet" },
  { id: "34-controlnet-lineart", title: "ControlNet Lineart — Anime", category: "ControlNet" },
  { id: "35-controlnet-tile", title: "ControlNet Tile Upscale", category: "ControlNet" },
  { id: "36-sdxl-batch-4", title: "SDXL Batch ×4 Variations", category: "Specialty" },
  { id: "37-sdxl-batch-8", title: "SDXL Batch ×8 Grid", category: "Specialty" },
  { id: "38-sdxl-logo-design", title: "SDXL Logo & Brand Design", category: "Specialty" },
  { id: "39-sdxl-concept-art", title: "SDXL Character Concept Sheet", category: "Specialty" },
  { id: "40-flux-realistic-person", title: "FLUX Realistic Person", category: "Image" },
  { id: "41-sdxl-interior-design", title: "SDXL Interior Design", category: "Specialty" },
  { id: "42-sd15-pixel-art", title: "SD 1.5 Pixel Art Generator", category: "Specialty" },
  { id: "43-sdxl-fashion-design", title: "SDXL Fashion Design", category: "Specialty" },
  { id: "44-flux-food-photography", title: "FLUX Food Photography", category: "Specialty" },
  { id: "45-sdxl-sci-fi-scene", title: "SDXL Sci-Fi Environment", category: "Specialty" },
  { id: "46-flux-lora-slacker-alien", title: "FLUX + Slacker Alien LoRA", category: "Image" },
  { id: "47-sdxl-abstract-art", title: "SDXL Abstract Art", category: "Specialty" },
  { id: "48-flux-wildlife-photo", title: "FLUX Wildlife Photography", category: "Image" },
  { id: "49-sdxl-night-city", title: "SDXL Night City Aerial", category: "Image" },
  { id: "50-flux-dev-portrait-v2", title: "FLUX Cinematic Portrait", category: "Image" },
];

export default function ProofUploadPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [caption, setCaption] = useState("");
  const [gpuInfo, setGpuInfo] = useState("");
  const [genTime, setGenTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...Array.from(new Set(WORKFLOWS.map((w) => w.category)))];
  const filteredWorkflows = categoryFilter === "All" ? WORKFLOWS : WORKFLOWS.filter((w) => w.category === categoryFilter);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
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

      setStatus({ type: "success", msg: "Upload successful! Live in the Community Proofs gallery." });

      // Reset
      setFile(null); setPreview(null); setCaption(""); setGpuInfo(""); setGenTime(""); setSelectedWorkflow("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setStatus({ type: "error", msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-20 pb-32 font-sans relative">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* ── HEADER ── */}
        <div className="mb-12 text-center">
          <p className="text-sky-400 font-[800] tracking-widest uppercase text-sm mb-4">Verification Layer</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl">
            Upload Workflow <span className="text-sky-400">Proofs</span>
          </h1>
          <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Validate neuraldrift workflows by uploading raw, unedited outputs directly to the global database.
          </p>
        </div>

        {/* ── SETUP NOTICE ── */}
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6 mb-12 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-[800] text-sky-500 mb-1">Developer Setup Required</h4>
            <p className="text-sky-400/80 font-[500] text-sm leading-relaxed">
              Uploads require `@vercel/blob` and a `BLOB_READ_WRITE_TOKEN` environment variable to function correctly. 
              Configure this in your Vercel Project Settings first.
            </p>
          </div>
        </div>

        {/* ── MAIN FORM ── */}
        <div className="bg-[#0f172a]/50 p-8 md:p-12 rounded-3xl border border-indigo-500/10 backdrop-blur-xl shadow-2xl relative">
          
          {/* STEP 1 */}
          <div className="mb-10">
            <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-4">01 — Select Source Workflow</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-[700] transition-all border ${
                    categoryFilter === cat 
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30" 
                      : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-5 py-4 text-white font-[600] outline-none focus:border-indigo-400 transition-colors cursor-pointer appearance-none"
            >
              <option value="">Choose a workflow from the database...</option>
              {filteredWorkflows.map((wf) => (
                <option key={wf.id} value={wf.id}>[{wf.category}] {wf.title}</option>
              ))}
            </select>
          </div>

          {/* STEP 2 */}
          <div className="mb-10">
            <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-4">02 — Drop Media Payload</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragOver ? "border-sky-400 bg-sky-400/5 shadow-[0_0_30px_rgba(56,189,248,0.1)]" : "border-indigo-500/30 bg-black/20 hover:border-indigo-400 hover:bg-black/30"
              }`}
            >
              {preview ? (
                <div className="relative">
                  {file?.type.startsWith("video/") ? (
                    <video src={preview} controls className="max-h-64 mx-auto rounded-xl shadow-lg border border-white/10" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg border border-white/10" />
                  )}
                  <p className="mt-4 font-mono text-xs text-indigo-300/60">{file?.name} — {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB</p>
                  <p className="text-sky-400 font-[700] text-sm mt-2">Click to replace payload.</p>
                </div>
              ) : (
                <div>
                  <UploadCloud className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                  <p className="text-lg font-[700] text-white mb-2">Drag & Drop Output File</p>
                  <p className="text-sm font-[500] text-zinc-500 mb-4">Supports PNG, JPG, WebP, MP4.</p>
                  <p className="text-xs font-mono text-indigo-400/50 uppercase tracking-widest">Max 10MB Images / 50MB Videos</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* STEP 3 & 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-4">03 — Hardware Used</label>
              <input value={gpuInfo} onChange={(e) => setGpuInfo(e.target.value)} placeholder="e.g. RTX 4090 24GB" className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-5 py-4 text-white font-[600] outline-none focus:border-indigo-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-4">04 — Gen Time</label>
              <input value={genTime} onChange={(e) => setGenTime(e.target.value)} placeholder="e.g. 14.5s" className="w-full bg-black/40 border border-indigo-500/20 rounded-xl px-5 py-4 text-white font-[600] outline-none focus:border-indigo-400 transition-colors" />
            </div>
          </div>

          <div className="mb-12">
            <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-4">05 — Metadata / Prompt Details</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Share your exact prompt, settings, or any creative context..." className="w-full h-32 bg-black/40 border border-indigo-500/20 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-indigo-400 transition-colors resize-none leading-relaxed" />
          </div>

          {/* ACTIONS */}
          {status && (
            <div className={`p-5 rounded-xl mb-8 flex items-center gap-3 font-[600] text-sm ${status.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {status.msg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto px-10 py-5 bg-sky-500 hover:bg-sky-400 text-black font-[800] rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Uploading...
                </>
              ) : "Push to Database"}
            </button>
            <Link href="/proofs" className="w-full sm:w-auto px-8 py-5 bg-black/40 hover:bg-black/60 text-white font-[700] rounded-xl transition-colors border border-white/10 text-center text-lg">
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
