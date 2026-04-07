"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Video,
  Download,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "All",
  "Image",
  "Video",
  "Enhance",
  "ControlNet",
  "Specialty",
];

const CATEGORY_COLORS: Record<string, string> = {
  Image: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Video: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  Enhance: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  ControlNet: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Specialty: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

// Map workflow IDs to categories
const WORKFLOW_CATEGORIES: Record<string, string> = {
  "01-flux-dev-t2i": "Image",
  "02-flux-schnell-fast": "Image",
  "03-sdxl-standard": "Image",
  "04-sdxl-portrait": "Image",
  "05-sdxl-turbo-fast": "Image",
  "06-sd15-classic": "Image",
  "08-sdxl-lora-style": "Image",
  "09-sdxl-landscape": "Image",
  "10-sd15-anime": "Image",
  "11-ltx-video-t2v-basic": "Video",
  "12-ltx-video-cinematic": "Video",
  "13-ltx-video-action-chase": "Video",
  "14-ltx-video-fast-draft": "Video",
  "15-animatediff-simple": "Video",
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
        setError("Could not load gallery. System configuration required.")
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter(
          (i) => WORKFLOW_CATEGORIES[i.workflowId] === activeCategory
        );

  const handleDownload = async (workflowId: string, workflowName: string) => {
    const response = await fetch(`/workflows/${workflowId}.json`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-transparent pb-32 pt-32 font-sans text-slate-50">
      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[999] flex cursor-zoom-out items-center justify-center bg-black/95 p-4 backdrop-blur-3xl md:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-6xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="group/lb relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black shadow-2xl">
                {lightbox.type?.startsWith("video/") ? (
                  <video
                    src={lightbox.url}
                    controls
                    autoPlay
                    className="max-h-[75vh] w-full object-contain"
                  />
                ) : (
                  <Image
                    src={lightbox.url}
                    alt={lightbox.workflowTitle}
                    width={1200}
                    height={900}
                    style={{ maxHeight: "75vh", width: "100%", height: "auto" }}
                    className="object-contain"
                  />
                )}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl md:col-span-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      Verified Output
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      {new Date(lightbox.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="mb-6 font-syne text-3xl font-[900] leading-tight text-white md:text-4xl">
                    {lightbox.workflowTitle}
                  </h3>
                  {lightbox.caption && (
                    <p className="max-w-3xl text-lg font-[500] leading-relaxed text-zinc-400">
                      {lightbox.caption}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 md:col-span-4">
                  <button
                    onClick={() => handleDownload(lightbox.workflowId, lightbox.workflowTitle)}
                    className="group flex flex-1 transform flex-col items-center justify-center gap-3 rounded-[2.5rem] bg-indigo-500 p-8 text-black shadow-[0_20px_40px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-1 hover:bg-indigo-400"
                  >
                    <Download className="h-8 w-8 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-black uppercase tracking-widest">
                      GET JSON
                    </span>
                  </button>
                  <button
                    onClick={() => setLightbox(null)}
                    className="rounded-[2.5rem] border border-white/10 bg-white/5 py-6 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Close Terminal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="mx-auto mb-24 max-w-[1600px] px-6 lg:px-12">
        <div className="flex flex-col items-end justify-between gap-12 lg:flex-row">
          <div className="max-w-3xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-indigo-400">
              <ShieldCheck className="h-5 w-5" /> Operational Sovereignty
            </p>
            <h1 className="mb-8 font-syne text-6xl font-[900] leading-[0.9] tracking-tighter text-white md:text-7xl lg:text-8xl">
              Architectural{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Proofs.
              </span>
            </h1>
            <p className="max-w-2xl text-xl font-[500] leading-relaxed text-zinc-500 md:text-2xl">
              Verified generations from the Neuraldrift community. Every item
              below includes a verified, ready-to-download ComfyUI architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] px-8 py-6 backdrop-blur-md">
              <span className="mb-1 text-4xl font-black leading-none text-white">
                {items.length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Active Proofs
              </span>
            </div>
            <Link
              href="/proofs/upload"
              className="group flex h-[88px] items-center gap-3 rounded-[2rem] bg-white px-10 font-black text-black shadow-2xl transition-all hover:bg-indigo-400"
            >
              UPLOAD OUTPUT{" "}
              <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
            </Link>
          </div>
        </div>

        {/* ── CATEGORY BAR ── */}
        <div className="mt-16 flex flex-wrap items-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeCategory === cat
                  ? "scale-105 border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
              }`}
            >
              {cat}{" "}
              <span className="ml-2 font-mono opacity-30">
                /
                {cat === "All"
                  ? items.length
                  : items.filter(
                      (i) => WORKFLOW_CATEGORIES[i.workflowId] === cat
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── THE GRID ── */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        {loading && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-[2.5rem] border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-4xl rounded-[3rem] border border-rose-500/10 bg-rose-500/5 p-16 text-center shadow-2xl md:p-24">
            <h3 className="mb-6 font-syne text-3xl font-black tracking-tight text-rose-400">
              System Configuration Error
            </h3>
            <p className="mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed text-zinc-400">
              The Engine Room requires a valid{" "}
              <code className="rounded bg-rose-500/10 px-2 py-0.5 text-rose-300">
                BLOB_READ_WRITE_TOKEN
              </code>{" "}
              to access the global proof database.
            </p>
            <Link
              href="/proofs/upload"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-5 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-rose-400"
            >
              Configure Protocol <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mx-auto max-w-5xl rounded-[4rem] border border-white/5 bg-white/[0.02] px-12 py-40 text-center">
            <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Clock className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="mb-6 font-syne text-4xl font-black text-white">
              Database Empty
            </h3>
            <p className="mx-auto mb-12 max-w-md text-lg font-medium leading-relaxed text-zinc-500">
              There are no architectural proofs verified in the{" "}
              <span className="text-white">{activeCategory}</span> sector yet.
            </p>
            <Link
              href="/proofs/upload"
              className="rounded-2xl bg-indigo-500 px-10 py-5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-indigo-400"
            >
              Initialize First Proof
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="columns-1 gap-8 space-y-8 md:columns-2 lg:columns-3 xl:columns-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const category =
                  WORKFLOW_CATEGORIES[item.workflowId] || "Image";
                const catClasses =
                  CATEGORY_COLORS[category] ||
                  "text-zinc-500 bg-white/5 border-white/10";

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.pathname}
                    onClick={() => setLightbox(item)}
                    className="group relative cursor-zoom-in break-inside-avoid overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0f172a]/40 backdrop-blur-sm transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
                  >
                    <div className="relative overflow-hidden bg-black/60">
                      {item.type?.startsWith("video/") ? (
                        <video
                          src={item.url}
                          muted
                          loop
                          onMouseEnter={(e) =>
                            (e.target as HTMLVideoElement).play()
                          }
                          onMouseLeave={(e) =>
                            (e.target as HTMLVideoElement).pause()
                          }
                          className="h-auto w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.workflowTitle}
                          width={800}
                          height={600}
                          style={{ width: "100%", height: "auto" }}
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      )}

                      {/* HOVER OVERLAY */}
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <div className="mb-4 flex translate-y-4 transform gap-3 transition-transform delay-75 duration-500 group-hover:translate-y-0">
                          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-black hover:bg-indigo-400">
                            <Maximize2 className="h-3.5 w-3.5" /> Inspect
                          </button>
                        </div>
                      </div>

                      {/* TYPE INDICATORS */}
                      <div className="pointer-events-none absolute left-6 top-6">
                        {item.type?.startsWith("video/") ? (
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/80 px-4 py-2 text-[8px] font-black tracking-[0.2em] text-white shadow-2xl backdrop-blur-xl">
                            <Video className="h-3 w-3 text-sky-400" /> VIDEO
                            PROOF
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/80 px-4 py-2 text-[8px] font-black tracking-[0.2em] text-white shadow-2xl backdrop-blur-xl">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />{" "}
                            VERIFIED
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      <span
                        className={`mb-6 inline-block rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${catClasses}`}
                      >
                        {category}
                      </span>
                      <h3 className="mb-4 font-syne text-xl font-[900] leading-[1.2] text-white transition-colors group-hover:text-indigo-400">
                        {item.workflowTitle}
                      </h3>
                      {item.caption && (
                        <p className="mb-6 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                          {item.caption}
                        </p>
                      )}

                      <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item.workflowId, item.workflowTitle); }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-colors hover:text-indigo-400"
                        >
                          <Download className="h-4 w-4" /> JSON ARCH
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
