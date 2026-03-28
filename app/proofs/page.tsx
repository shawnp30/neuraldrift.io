"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ExternalLink, 
  Video, 
  Download, 
  Maximize2, 
  ShieldCheck, 
  CheckCircle2, 
  PlusCircle,
  Clock
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
  "01-flux-dev-t2i": "Image", "02-flux-schnell-fast": "Image", "03-sdxl-standard": "Image",
  "04-sdxl-portrait": "Image", "05-sdxl-turbo-fast": "Image", "06-sd15-classic": "Image",
  "07-flux-lora-character": "Image", "08-sdxl-lora-style": "Image", "09-sdxl-landscape": "Image",
  "10-sd15-anime": "Image", "11-ltx-video-t2v-basic": "Video", "12-ltx-video-cinematic": "Video",
  "13-ltx-video-action-chase": "Video", "14-ltx-video-fast-draft": "Video", "15-animatediff-simple": "Video",
  "16-animatediff-character": "Video", "17-animatediff-loop": "Video", "18-animatediff-landscape": "Video",
  "19-animatediff-product": "Video", "20-animatediff-zoom": "Video", "21-upscale-4x-esrgan": "Enhance",
  "22-upscale-anime": "Enhance", "23-sdxl-img2img": "Enhance", "24-sd15-style-transfer": "Enhance",
  "25-sdxl-sketch-to-image": "Enhance", "26-sdxl-inpainting": "Enhance", "27-sd15-object-removal": "Enhance",
  "28-sdxl-product-shot": "Specialty", "29-sdxl-architecture": "Specialty", "30-flux-portrait-v2": "Image",
  "31-controlnet-canny-sdxl": "ControlNet", "32-controlnet-depth-sdxl": "ControlNet", "33-controlnet-openpose": "ControlNet",
  "34-controlnet-lineart": "ControlNet", "35-controlnet-tile": "ControlNet", "36-sdxl-batch-4": "Specialty",
  "37-sdxl-batch-8": "Specialty", "38-sdxl-logo-design": "Specialty", "39-sdxl-concept-art": "Specialty",
  "40-flux-realistic-person": "Image", "41-sdxl-interior-design": "Specialty", "42-sd15-pixel-art": "Specialty",
  "43-sdxl-fashion-design": "Specialty", "44-flux-food-photography": "Specialty", "45-sdxl-sci-fi-scene": "Specialty",
  "46-flux-lora-slacker-alien": "Image", "47-sdxl-abstract-art": "Specialty", "48-flux-wildlife-photo": "Image",
  "49-sdxl-night-city": "Image", "50-flux-dev-portrait-v2": "Image",
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
      .catch(() => setError("Could not load gallery. System configuration required."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? items
    : items.filter((i) => WORKFLOW_CATEGORIES[i.workflowId] === activeCategory);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 font-sans pb-32 overflow-hidden">
      
      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-black/95 z-[999] p-4 md:p-12 flex items-center justify-center cursor-zoom-out backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-6xl w-full cursor-default" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group/lb rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                {lightbox.type?.startsWith("video/") ? (
                  <video src={lightbox.url} controls autoPlay className="w-full max-h-[75vh] object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lightbox.url} alt={lightbox.workflowTitle} className="w-full max-h-[75vh] object-contain" />
                )}
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verified Output</span>
                    <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">{new Date(lightbox.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-[900] text-white mb-6 leading-tight font-syne">{lightbox.workflowTitle}</h3>
                  {lightbox.caption && <p className="text-zinc-400 font-[500] text-lg max-w-3xl leading-relaxed">{lightbox.caption}</p>}
                </div>
                
                <div className="md:col-span-4 flex flex-col gap-4">
                  <a 
                    href={`/workflows/${lightbox.workflowId}.json`} 
                    download 
                    className="flex-1 flex flex-col items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-black p-8 rounded-[2.5rem] transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(99,102,241,0.3)] group"
                  >
                    <Download className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-sm uppercase tracking-widest">GET JSON</span>
                  </a>
                  <button 
                    onClick={() => setLightbox(null)} 
                    className="py-6 bg-white/5 border border-white/10 text-white font-bold rounded-[2.5rem] hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
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
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-24">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
          <div className="max-w-3xl">
            <p className="text-indigo-400 font-black tracking-[0.3em] uppercase text-xs mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> Operational Sovereignty
            </p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-[900] tracking-tighter text-white mb-8 leading-[0.9] font-syne">
              Architectural <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Proofs.</span>
            </h1>
            <p className="text-xl md:text-2xl font-[500] text-zinc-500 leading-relaxed max-w-2xl">
              Verified generations from the Neuraldrift community. Every item below includes a verified, ready-to-download ComfyUI architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] px-8 py-6 backdrop-blur-md flex flex-col">
              <span className="text-4xl font-black text-white leading-none mb-1">{items.length}</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Proofs</span>
            </div>
            <Link href="/proofs/upload" className="group h-[88px] px-10 bg-white text-black rounded-[2rem] font-black hover:bg-indigo-400 transition-all shadow-2xl flex items-center gap-3">
              UPLOAD OUTPUT <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── CATEGORY BAR ── */}
        <div className="mt-16 flex flex-wrap items-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                activeCategory === cat 
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)] scale-105" 
                  : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
              }`}
            >
              {cat} <span className="opacity-30 ml-2 font-mono">/{cat === "All" ? items.length : items.filter((i) => WORKFLOW_CATEGORIES[i.workflowId] === cat).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── THE GRID ── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] h-[400px] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[3rem] p-16 md:p-24 text-center max-w-4xl mx-auto shadow-2xl">
            <h3 className="text-3xl font-black text-rose-400 mb-6 font-syne tracking-tight">System Configuration Error</h3>
            <p className="text-zinc-400 font-medium mb-12 text-lg leading-relaxed max-w-2xl mx-auto">
              The Engine Room requires a valid <code className="bg-rose-500/10 px-2 py-0.5 rounded text-rose-300">BLOB_READ_WRITE_TOKEN</code> to access the global proof database.
            </p>
            <Link href="/proofs/upload" className="bg-white text-black px-10 py-5 rounded-2xl font-black hover:bg-rose-400 transition-colors inline-flex items-center gap-2 uppercase tracking-widest text-xs">
              Configure Protocol <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-40 bg-white/[0.02] border border-white/5 rounded-[4rem] max-w-5xl mx-auto px-12">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10">
              <Clock className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-4xl font-black text-white mb-6 font-syne">Database Empty</h3>
            <p className="text-zinc-500 font-medium mb-12 max-w-md mx-auto leading-relaxed text-lg">
              There are no architectural proofs verified in the <span className="text-white">{activeCategory}</span> sector yet.
            </p>
            <Link href="/proofs/upload" className="bg-indigo-500 text-black px-10 py-5 rounded-2xl font-black hover:bg-indigo-400 transition-all uppercase tracking-widest text-xs">
              Initialize First Proof
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const category = WORKFLOW_CATEGORIES[item.workflowId] || "Image";
                const catClasses = CATEGORY_COLORS[category] || "text-zinc-500 bg-white/5 border-white/10";

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.pathname} 
                    onClick={() => setLightbox(item)}
                    className="break-inside-avoid relative group cursor-zoom-in rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0f172a]/40 backdrop-blur-sm transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
                  >
                    <div className="relative overflow-hidden bg-black/60">
                      {item.type?.startsWith("video/") ? (
                        <video 
                          src={item.url} 
                          muted 
                          loop 
                          onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} 
                          onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} 
                          className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.url} 
                          alt={item.workflowTitle} 
                          loading="lazy" 
                          className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                      )}

                      {/* HOVER OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                        <div className="flex gap-3 mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          <button className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-indigo-400">
                             <Maximize2 className="w-3.5 h-3.5" /> Inspect
                          </button>
                        </div>
                      </div>

                      {/* TYPE INDICATORS */}
                      <div className="absolute top-6 left-6 pointer-events-none">
                        {item.type?.startsWith("video/") ? (
                          <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl text-[8px] font-black tracking-[0.2em] text-white border border-white/10 flex items-center gap-2 shadow-2xl">
                            <Video className="w-3 h-3 text-sky-400" /> VIDEO PROOF
                          </div>
                        ) : (
                          <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-xl text-[8px] font-black tracking-[0.2em] text-white border border-white/10 flex items-center gap-2 shadow-2xl">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> VERIFIED
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border mb-6 ${catClasses}`}>
                        {category}
                      </span>
                      <h3 className="text-xl font-[900] text-white leading-[1.2] mb-4 group-hover:text-indigo-400 transition-colors font-syne">{item.workflowTitle}</h3>
                      {item.caption && <p className="text-zinc-500 font-medium text-sm line-clamp-2 leading-relaxed mb-6 group-hover:text-zinc-400 transition-colors">{item.caption}</p>}
                      
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <a 
                          href={`/workflows/${item.workflowId}.json`} 
                          download 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                        >
                          <Download className="w-4 h-4" /> JSON ARCH
                        </a>
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
