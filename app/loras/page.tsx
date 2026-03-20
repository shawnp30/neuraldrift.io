"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

type LoRAType = "Character" | "Style" | "Concept" | "Video" | "All";
type BaseModel = "FLUX" | "SDXL" | "SD1.5" | "LTX" | "All";

interface LoRA {
  id: string;
  name: string;
  description: string;
  type: Exclude<LoRAType, "All">;
  baseModel: Exclude<BaseModel, "All">;
  rank: number;
  triggerWord: string;
  trainingImages: number;
  epochs: number;
  sizeGB: number;
  recommendedStrength: [number, number];
  tags: string[];
  hardware: string;
  trainingTime: string;
  status: "Released" | "Beta" | "WIP";
  downloadUrl: string;
  previewPrompt: string;
}

const LORAS: LoRA[] = [
  {
    id: "fat-bigfoot-v4",
    name: "Fat Bigfoot Character v4",
    description: "Large shaggy bigfoot in tank top, fanny pack, and sunglasses. Stoner/chaotic energy. Consistent across SDXL generations. Best for forest and suburban environments.",
    type: "Character",
    baseModel: "SDXL",
    rank: 16,
    triggerWord: "fatbigfoot",
    trainingImages: 42,
    epochs: 10,
    sizeGB: 0.41,
    recommendedStrength: [0.7, 0.9],
    tags: ["Character", "Bigfoot", "Comedy", "Original IP"],
    hardware: "RTX 5080 16GB",
    trainingTime: "3h 20m",
    status: "Released",
    downloadUrl: "#",
    previewPrompt: "fatbigfoot standing in a forest clearing, tank top, fanny pack, sunglasses, golden hour lighting",
  },
  {
    id: "slacker-alien-v2",
    name: "Slacker Alien Style v2",
    description: "Pale green chubby alien in cargo shorts. Deadpan sarcastic energy. Designed for suburban and mundane settings. Works best with everyday scenarios.",
    type: "Character",
    baseModel: "SDXL",
    rank: 16,
    triggerWord: "slackeralien",
    trainingImages: 38,
    epochs: 8,
    sizeGB: 0.40,
    recommendedStrength: [0.7, 0.85],
    tags: ["Character", "Alien", "Comedy", "Suburban", "Original IP"],
    hardware: "RTX 5080 16GB",
    trainingTime: "2h 50m",
    status: "Released",
    downloadUrl: "#",
    previewPrompt: "slackeralien standing in a suburban backyard, cargo shorts, holding a soda can, overcast lighting",
  },
  {
    id: "highway-ghost-v3",
    name: "Highway Ghost Style v3",
    description: "Cinematic night highway aesthetic LoRA. Rain-soaked asphalt, neon reflections, motion blur. Designed specifically for LTX Video chase sequences.",
    type: "Style",
    baseModel: "FLUX",
    rank: 32,
    triggerWord: "highwayghost",
    trainingImages: 85,
    epochs: 10,
    sizeGB: 0.85,
    recommendedStrength: [0.6, 0.85],
    tags: ["Style", "Cinematic", "Night", "Neon", "Action"],
    hardware: "RTX 5080 16GB",
    trainingTime: "4h 10m",
    status: "Released",
    downloadUrl: "#",
    previewPrompt: "highwayghost, rain soaked highway at night, neon reflections, motion blur, cinematic",
  },
  {
    id: "desert-pursuit-v1",
    name: "Desert Pursuit Cinematics v1",
    description: "Golden hour desert chase aesthetic. Dust trails, dramatic shadows, wide open landscapes. Tuned for LTX Video and FLUX image generation.",
    type: "Style",
    baseModel: "FLUX",
    rank: 32,
    triggerWord: "desertpursuit",
    trainingImages: 64,
    epochs: 8,
    sizeGB: 0.84,
    recommendedStrength: [0.65, 0.85],
    tags: ["Style", "Desert", "Golden Hour", "Action", "Cinematic"],
    hardware: "RTX 5080 16GB",
    trainingTime: "3h 45m",
    status: "Beta",
    downloadUrl: "#",
    previewPrompt: "desertpursuit, golden hour desert highway, dust trail, dramatic shadows, wide angle",
  },
  {
    id: "gopro-pov-v2",
    name: "GoPro POV Fisheye v2",
    description: "Handheld GoPro POV aesthetic with fisheye distortion and motion shake. Built for first-person action sequences. Works with LTX Video and AnimateDiff.",
    type: "Style",
    baseModel: "SDXL",
    rank: 16,
    triggerWord: "gopropov",
    trainingImages: 120,
    epochs: 6,
    sizeGB: 0.39,
    recommendedStrength: [0.55, 0.8],
    tags: ["Style", "POV", "GoPro", "Action", "Fisheye"],
    hardware: "RTX 3080 16GB",
    trainingTime: "2h 10m",
    status: "Released",
    downloadUrl: "#",
    previewPrompt: "gopropov, handheld first person view running through forest, fisheye lens, motion shake",
  },
  {
    id: "comfyui-node-concept",
    name: "ComfyUI Node Graph Aesthetic",
    description: "Dark tech node graph visual style. Glowing connections, dark backgrounds, cyan accents. Great for tech content thumbnails and UI mockups.",
    type: "Concept",
    baseModel: "FLUX",
    rank: 8,
    triggerWord: "nodegraph",
    trainingImages: 30,
    epochs: 6,
    sizeGB: 0.22,
    recommendedStrength: [0.5, 0.75],
    tags: ["Concept", "Tech", "UI", "Dark", "Nodes"],
    hardware: "RTX 3080 16GB",
    trainingTime: "1h 20m",
    status: "Beta",
    downloadUrl: "#",
    previewPrompt: "nodegraph, dark background, glowing cyan node connections, tech aesthetic",
  },
];

const TYPE_STYLES: Record<string, string> = {
  Character: "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  Style: "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  Concept: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  Video: "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
};

const STATUS_STYLES: Record<string, string> = {
  Released: "text-[#10b981]",
  Beta: "text-[#f97316]",
  WIP: "text-muted",
};

export default function LoRAsPage() {
  const [typeFilter, setTypeFilter] = useState<LoRAType>("All");
  const [modelFilter, setModelFilter] = useState<BaseModel>("All");
  const [search, setSearch] = useState("");

  const filtered = LORAS.filter((l) => {
    if (typeFilter !== "All" && l.type !== typeFilter) return false;
    if (modelFilter !== "All" && l.baseModel !== modelFilter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// LoRA Library</p>
            <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
              Custom trained<br />LoRA models.
            </h1>
            <p className="text-muted max-w-lg leading-relaxed">
              Character, style, and concept LoRAs trained on real hardware. Every model includes trigger words, recommended strength ranges, and training specs.
            </p>
          </div>
          <div className="text-right">
            <div className="font-syne text-4xl font-black text-white">{LORAS.length}</div>
            <div className="font-mono text-xs text-muted tracking-widest uppercase">Models Available</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Search LoRAs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 transition-colors font-mono w-64"
          />

          {/* Type filter */}
          <div className="flex gap-2">
            {(["All", "Character", "Style", "Concept", "Video"] as LoRAType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors ${
                  typeFilter === t
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-card border border-border text-muted hover:text-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Model filter */}
          <div className="flex gap-2">
            {(["All", "FLUX", "SDXL", "SD1.5", "LTX"] as BaseModel[]).map((m) => (
              <button
                key={m}
                onClick={() => setModelFilter(m)}
                className={`font-mono text-xs px-3 py-2 rounded-lg tracking-widest uppercase transition-colors ${
                  modelFilter === m
                    ? "bg-accent-purple/10 text-[#a78bfa] border border-accent-purple/20"
                    : "bg-card border border-border text-muted hover:text-text"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* LoRA Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted font-mono text-sm">No LoRAs match your filters.</div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {filtered.map((lora) => (
              <div key={lora.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/20 transition-colors">

                {/* Top bar */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${TYPE_STYLES[lora.type]}`}>
                      {lora.type}
                    </span>
                    <span className="font-mono text-xs bg-white/5 text-muted px-2 py-0.5 rounded-sm tracking-widest uppercase">
                      {lora.baseModel}
                    </span>
                  </div>
                  <span className={`font-mono text-xs tracking-widest uppercase ${STATUS_STYLES[lora.status]}`}>
                    ● {lora.status}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-syne text-lg font-bold text-white mb-2 tracking-tight">{lora.name}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-5">{lora.description}</p>

                  {/* Trigger word */}
                  <div className="bg-surface border border-border rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-muted tracking-widest uppercase">Trigger Word</span>
                    <code className="font-mono text-sm text-accent">{lora.triggerWord}</code>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <StatBox label="Rank" value={`r${lora.rank}`} />
                    <StatBox label="Strength" value={`${lora.recommendedStrength[0]}–${lora.recommendedStrength[1]}`} />
                    <StatBox label="Size" value={`${lora.sizeGB}GB`} />
                    <StatBox label="Images" value={`${lora.trainingImages}`} />
                    <StatBox label="Epochs" value={`${lora.epochs}`} />
                    <StatBox label="Train Time" value={lora.trainingTime} />
                  </div>

                  {/* Preview prompt */}
                  <div className="bg-surface border border-border rounded-lg p-3 mb-5">
                    <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Example Prompt</p>
                    <p className="font-mono text-xs text-slate-400 leading-relaxed">{lora.previewPrompt}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {lora.tags.map((tag) => (
                      <span key={tag} className="font-mono text-xs bg-white/4 text-muted px-2 py-0.5 rounded tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hardware */}
                  <div className="flex items-center justify-between text-xs font-mono text-muted mb-5">
                    <span>Trained on {lora.hardware}</span>
                    <span>{lora.trainingImages} images · {lora.epochs} epochs</span>
                  </div>

                  {/* Download */}
                  <a
                    href={lora.downloadUrl}
                    className="block text-center bg-accent text-black py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
                  >
                    Download .safetensors
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit CTA */}
        <div className="mt-16 bg-gradient-to-br from-accent/5 to-accent-purple/5 border border-accent/15 rounded-xl p-10 text-center">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">// Community</p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-3">Built a LoRA worth sharing?</h2>
          <p className="text-muted max-w-md mx-auto mb-6 text-sm leading-relaxed">
            Submit your trained model to the library. Include trigger word, training specs, and example outputs.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-accent text-black px-6 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
          >
            Submit a LoRA →
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 text-center">
      <div className="font-mono text-xs text-muted tracking-widest uppercase mb-0.5">{label}</div>
      <div className="font-syne text-sm font-bold text-white">{value}</div>
    </div>
  );
}
