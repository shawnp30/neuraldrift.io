"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Video } from "lucide-react";

const CATEGORIES = [
  "All",
  "Image",
  "Video",
  "Enhance",
  "ControlNet",
  "Specialty",
];

const CATEGORY_COLORS: Record<string, string> = {
  Image: "text-green-400 bg-green-500/10 border-green-500/20",
  Video: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  Enhance: "text-amber-400 bg-amber-500/10 border-amber-500/20",
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
      .catch(() => setError("Could not load gallery. API may not be set up yet."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All"
    ? items
    : items.filter((i) => WORKFLOW_CATEGORIES[i.workflowId] === activeCategory);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-16 font-sans pb-24">
      
      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div 
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/95 z-[999] p-4 md:p-12 flex items-center justify-center cursor-zoom-out backdrop-blur-xl"
        >
          <div className="max-w-5xl w-full cursor-default" onClick={(e) => e.stopPropagation()}>
            {lightbox.type?.startsWith("video/") ? (
              <video src={lightbox.url} controls autoPlay className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.url} alt={lightbox.workflowTitle} className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl bg-black" />
            )}
            
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-[#0f172a]/80 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
              <div>
                <h3 className="text-xl md:text-2xl font-[800] text-white">{lightbox.workflowTitle}</h3>
                {lightbox.caption && <p className="text-zinc-400 font-[500] mt-2 text-sm max-w-2xl leading-relaxed">{lightbox.caption}</p>}
                <p className="text-xs text-indigo-400/60 font-mono mt-3 uppercase tracking-widest">{new Date(lightbox.uploadedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <a href={`/workflows/${lightbox.workflowId}.json`} download className="px-6 py-3 bg-indigo-500/20 text-indigo-400 font-[700] rounded-xl hover:bg-indigo-500/30 hover:text-indigo-300 transition-colors border border-indigo-500/30 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Download JSON
                </a>
                <button onClick={() => setLightbox(null)} className="px-6 py-3 bg-white/5 text-white font-[600] rounded-xl hover:bg-white/10 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-16 text-center">
        <p className="text-amber-400 font-[800] tracking-widest uppercase text-sm mb-4">Community Proofs</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl">
          Verified <span className="text-amber-400">Outputs.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Every generation below was created using a Neuraldrift workflow JSON on consumer hardware.
        </p>

        {/* ── STATS & ACTIONS ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="bg-[#0f172a]/50 border border-indigo-500/20 rounded-2xl px-6 py-4 backdrop-blur-md flex items-center gap-4">
            <span className="text-3xl font-[800] text-amber-400">{items.length}</span>
            <span className="text-sm font-[600] text-zinc-500 uppercase tracking-widest">Outputs</span>
          </div>
          <div className="bg-[#0f172a]/50 border border-indigo-500/20 rounded-2xl px-6 py-4 backdrop-blur-md flex items-center gap-4">
            <span className="text-3xl font-[800] text-amber-400">{new Set(items.map((i) => i.workflowId)).size}</span>
            <span className="text-sm font-[600] text-zinc-500 uppercase tracking-widest">Workflows Proven</span>
          </div>
          <Link href="/proofs/upload" className="bg-amber-500 text-black px-8 py-5 rounded-2xl font-[800] hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2">
            Upload Output <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-[700] transition-all duration-300 border ${
                activeCategory === cat 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-105" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat} <span className="opacity-50 ml-1 text-xs">({cat === "All" ? items.length : items.filter((i) => WORKFLOW_CATEGORIES[i.workflowId] === cat).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MASONRY GALLERY ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {loading && (
          <div className="text-center py-24 text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading gallery database...</div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl">
            <p className="text-red-400 font-[700] mb-4 text-xl">{error}</p>
            <p className="text-zinc-400 font-[500] mb-8 leading-relaxed">Setup your Vercel Blob Database and provide the BLOB_READ_WRITE_TOKEN in your environment variables to enable global proofs.</p>
            <Link href="/proofs/upload" className="bg-red-500 text-black px-8 py-4 rounded-xl font-[800] hover:bg-red-400 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] inline-block">Configure Storage</Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-3xl max-w-3xl mx-auto">
            <div className="text-6xl mb-6 opacity-40">📸</div>
            <h3 className="text-2xl font-[800] text-white mb-3">No Outputs Found</h3>
            <p className="text-zinc-500 font-[500] mb-8 max-w-md mx-auto leading-relaxed">No community uploads exist for this category yet. Be the first to verify a workflow!</p>
            <Link href="/proofs/upload" className="bg-white/10 hover:bg-white/20 text-white font-[700] px-8 py-4 rounded-xl transition-all border border-white/10 inline-block shadow-lg">Upload First Output</Link>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filtered.map((item, i) => {
              const category = WORKFLOW_CATEGORIES[item.workflowId] || "Image";
              const catClasses = CATEGORY_COLORS[category] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";

              return (
                <div 
                  key={i} 
                  onClick={() => setLightbox(item)}
                  className="break-inside-avoid bg-[#0f172a]/40 border border-indigo-500/10 rounded-2xl overflow-hidden group cursor-zoom-in hover:border-indigo-500/40 transition-all duration-500 relative shadow-xl hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)]"
                >
                  <div className="relative overflow-hidden bg-black/60 aspect-auto">
                    {item.type?.startsWith("video/") ? (
                      <video src={item.url} muted loop onMouseEnter={(e) => (e.target as HTMLVideoElement).play()} onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.workflowTitle} loading="lazy" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    
                    {item.type?.startsWith("video/") && (
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-[800] tracking-widest text-white border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Video className="w-3.5 h-3.5 text-sky-400" /> VIDEO
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-[800] tracking-widest uppercase border mb-4 shadow-sm ${catClasses}`}>
                      {category}
                    </span>
                    <h3 className="text-base font-[800] text-white leading-snug mb-3 group-hover:text-indigo-400 transition-colors">{item.workflowTitle}</h3>
                    {item.caption && <p className="text-sm text-zinc-400 font-[500] line-clamp-3 leading-relaxed mb-5">{item.caption}</p>}
                    
                    <div className="flex items-center justify-between mt-auto">
                      <a href={`/workflows/${item.workflowId}.json`} download onClick={(e) => e.stopPropagation()} className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-[800] tracking-wide transition-all shadow-sm flex items-center gap-1.5 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500">
                        Get JSON <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
