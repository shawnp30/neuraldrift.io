"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

type DatasetType = "All" | "Character" | "Style" | "Concept" | "Video";
type ModelBase = "All" | "FLUX" | "SDXL" | "LTX" | "SD1.5";

interface Dataset {
  id: string;
  name: string;
  description: string;
  type: Exclude<DatasetType, "All">;
  baseModel: Exclude<ModelBase, "All">;
  imageCount: number;
  captionStyle: string;
  resolution: string;
  status: "Released" | "Beta" | "WIP";
  triggerWord: string;
  tags: string[];
  downloadUrl: string;
  guideUrl?: string;
  trainedLora?: string;
  hardware: string;
  notes: string;
}

const DATASETS: Dataset[] = [
  {
    id: "fat-bigfoot-dataset",
    name: "Fat Bigfoot — Character Dataset v4",
    description: "42 curated images of Fat Bigfoot in varied settings, poses, and lighting. WD14-captioned with trigger word. Used to train the Fat Bigfoot Character LoRA v4.",
    type: "Character",
    baseModel: "SDXL",
    imageCount: 42,
    captionStyle: "WD14 Tags",
    resolution: "1024×1024",
    status: "Released",
    triggerWord: "fatbigfoot",
    tags: ["Character", "Bigfoot", "Comedy", "Original IP"],
    downloadUrl: "#",
    guideUrl: "/guides/train-flux-lora",
    trainedLora: "fat-bigfoot-v4",
    hardware: "RTX 5080 16GB",
    notes: "Repeat count: 10. Best results at 8–10 epochs with SDXL + Kohya SS.",
  },
  {
    id: "slacker-alien-dataset",
    name: "Slacker Alien — Character Dataset v2",
    description: "38 images of the Slacker Alien character in suburban environments. Diverse angles and expressions. Captioned with WD14 + manual edits.",
    type: "Character",
    baseModel: "SDXL",
    imageCount: 38,
    captionStyle: "WD14 Tags",
    resolution: "1024×1024",
    status: "Released",
    triggerWord: "slackeralien",
    tags: ["Character", "Alien", "Comedy", "Suburban"],
    downloadUrl: "#",
    guideUrl: "/guides/train-flux-lora",
    trainedLora: "slacker-alien-v2",
    hardware: "RTX 5080 16GB",
    notes: "Repeat count: 10. 8 epochs optimal. Strong character lock at 0.75 LoRA weight.",
  },
  {
    id: "highway-ghost-style",
    name: "Highway Ghost — Style Dataset v3",
    description: "85 cinematic night highway reference images. Rain-soaked asphalt, neon light reflections, motion blur, and dramatic street photography. Used for the Highway Ghost style LoRA.",
    type: "Style",
    baseModel: "FLUX",
    imageCount: 85,
    captionStyle: "Natural Language",
    resolution: "1024×1024",
    status: "Released",
    triggerWord: "highwayghost",
    tags: ["Style", "Cinematic", "Night", "Neon", "Action"],
    downloadUrl: "#",
    guideUrl: "/guides/train-flux-lora",
    trainedLora: "highway-ghost-v3",
    hardware: "RTX 5080 16GB",
    notes: "FLUX natural language captions. Rank 32, 10 epochs. Style transfers well to LTX Video.",
  },
  {
    id: "desert-pursuit-style",
    name: "Desert Pursuit — Style Dataset v1",
    description: "64 golden hour desert chase reference images. Dust trails, dramatic shadows, wide open landscapes, and action cinematography aesthetics.",
    type: "Style",
    baseModel: "FLUX",
    imageCount: 64,
    captionStyle: "Natural Language",
    resolution: "1024×1024",
    status: "Beta",
    triggerWord: "desertpursuit",
    tags: ["Style", "Desert", "Golden Hour", "Action", "Cinematic"],
    downloadUrl: "#",
    guideUrl: "/guides/train-flux-lora",
    hardware: "RTX 5080 16GB",
    notes: "Still in beta — works well for still images, video transfer WIP.",
  },
  {
    id: "comfyui-node-concept",
    name: "ComfyUI Node Graph — Concept Dataset",
    description: "30 dark tech node graph images. Glowing connections, dark backgrounds, cyan accents. Used to train the Node Graph concept LoRA for tech thumbnails.",
    type: "Concept",
    baseModel: "FLUX",
    imageCount: 30,
    captionStyle: "WD14 Tags",
    resolution: "1024×1024",
    status: "Beta",
    triggerWord: "nodegraph",
    tags: ["Concept", "Tech", "UI", "Dark", "Nodes"],
    downloadUrl: "#",
    hardware: "RTX 3080 16GB",
    notes: "Small dataset — concept LoRAs need fewer images. Rank 8 works best.",
  },
  {
    id: "gopro-pov-style",
    name: "GoPro POV Fisheye — Style Dataset v2",
    description: "120 handheld GoPro POV images with fisheye distortion. Action sports, forest runs, vehicle mounts. Covers wide variety of POV angles.",
    type: "Style",
    baseModel: "SDXL",
    imageCount: 120,
    captionStyle: "WD14 Tags",
    resolution: "1024×1024",
    status: "Released",
    triggerWord: "gopropov",
    tags: ["Style", "POV", "GoPro", "Action", "Fisheye"],
    downloadUrl: "#",
    hardware: "RTX 3080 16GB",
    notes: "Larger dataset = subtle style. Use 0.55–0.7 weight for best fisheye effect.",
  },
];

const TYPE_STYLES: Record<string, string> = {
  Character: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Style:     "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  Concept:   "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  Video:     "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
};

const STATUS_STYLES: Record<string, string> = {
  Released: "text-[#10b981]",
  Beta:     "text-[#f97316]",
  WIP:      "text-muted",
};

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
      <div className="font-mono text-xs text-muted tracking-widest uppercase mb-0.5">{label}</div>
      <div className="font-syne text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function DatasetsPage() {
  const [typeFilter, setTypeFilter] = useState<DatasetType>("All");
  const [modelFilter, setModelFilter] = useState<ModelBase>("All");
  const [search, setSearch] = useState("");

  const filtered = DATASETS.filter(d => {
    if (typeFilter !== "All" && d.type !== typeFilter) return false;
    if (modelFilter !== "All" && d.baseModel !== modelFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Dataset Library</p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
              Training datasets,<br />ready to use.
            </h1>
            <p className="text-muted max-w-lg leading-relaxed">
              Every LoRA on NeuralHub was trained on one of these datasets. Curated, captioned, and structured for Kohya SS. Download and start training in minutes.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-syne text-4xl font-black text-white">{DATASETS.length}</div>
            <div className="font-mono text-xs text-muted tracking-widest uppercase">Datasets</div>
          </div>
        </div>

        {/* How to use strip */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { step: "01", label: "Download dataset", desc: "Get the image + caption ZIP" },
            { step: "02", label: "Check captions", desc: "Verify trigger word is first in every .txt" },
            { step: "03", label: "Configure Kohya", desc: "Use the linked training guide" },
            { step: "04", label: "Train your LoRA", desc: "Follow the guide for optimal settings" },
          ].map(item => (
            <div key={item.step} className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 font-syne text-4xl font-black text-white/4">{item.step}</div>
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">{item.step}</p>
              <h3 className="font-syne text-sm font-bold text-white mb-1">{item.label}</h3>
              <p className="font-mono text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <input
            type="text"
            placeholder="Search datasets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono w-56 transition-colors"
          />
          <div className="flex gap-1.5">
            {(["All", "Character", "Style", "Concept", "Video"] as DatasetType[]).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${
                  typeFilter === t ? "bg-accent/10 text-accent border-accent/20" : "bg-card border-border text-muted hover:text-text"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["All", "FLUX", "SDXL", "LTX", "SD1.5"] as ModelBase[]).map(m => (
              <button key={m} onClick={() => setModelFilter(m)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors border ${
                  modelFilter === m ? "bg-accent-purple/10 text-[#a78bfa] border-accent-purple/20" : "bg-card border-border text-muted hover:text-text"
                }`}>
                {m}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-muted ml-auto">{filtered.length} datasets</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map(ds => (
            <div key={ds.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-colors">

              {/* Top bar */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${TYPE_STYLES[ds.type]}`}>
                    {ds.type}
                  </span>
                  <span className="font-mono text-xs bg-white/5 text-muted px-2 py-0.5 rounded-sm tracking-widest uppercase">
                    {ds.baseModel}
                  </span>
                </div>
                <span className={`font-mono text-xs tracking-widest uppercase ${STATUS_STYLES[ds.status]}`}>
                  ● {ds.status}
                </span>
              </div>

              <div className="p-6">
                <h3 className="font-syne text-lg font-bold text-white mb-2 tracking-tight">{ds.name}</h3>
                <p className="text-sm text-muted leading-relaxed mb-5">{ds.description}</p>

                {/* Trigger word */}
                <div className="bg-surface border border-border rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted tracking-widest uppercase">Trigger Word</span>
                  <code className="font-mono text-sm text-accent">{ds.triggerWord}</code>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <StatBox label="Images" value={String(ds.imageCount)} />
                  <StatBox label="Resolution" value={ds.resolution} />
                  <StatBox label="Captions" value={ds.captionStyle} />
                </div>

                {/* Notes */}
                <div className="bg-surface border border-border rounded-lg p-3 mb-5">
                  <p className="font-mono text-xs text-muted tracking-widest uppercase mb-1.5">Training Notes</p>
                  <p className="font-mono text-xs text-slate-400 leading-relaxed">{ds.notes}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {ds.tags.map(tag => (
                    <span key={tag} className="font-mono text-xs bg-white/4 text-muted px-2 py-0.5 rounded tracking-wide">{tag}</span>
                  ))}
                </div>

                {/* Hardware */}
                <div className="flex items-center justify-between text-xs font-mono text-muted mb-5">
                  <span>Trained on {ds.hardware}</span>
                  <span>{ds.imageCount} images</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a href={ds.downloadUrl}
                    className="flex-1 block text-center bg-accent text-black py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
                    Download Dataset
                  </a>
                  {ds.guideUrl && (
                    <Link href={ds.guideUrl}
                      className="flex-1 block text-center border border-border text-muted py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors">
                      Training Guide →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — contribute */}
        <div className="mt-16 bg-gradient-to-br from-accent/5 to-transparent border border-accent/15 rounded-xl p-10 text-center">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">// Coming Soon</p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">
            Community dataset uploads
          </h2>
          <p className="text-muted max-w-lg mx-auto leading-relaxed mb-6">
            Submit your own curated datasets. Get them verified, listed here, and linked to your trained LoRAs.
          </p>
          <Link href="/guides/train-flux-lora"
            className="inline-block bg-accent text-black px-8 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity">
            Start with the Training Guide →
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}
