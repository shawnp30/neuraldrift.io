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
    description:
      "42 curated images of Fat Bigfoot in varied settings, poses, and lighting. WD14-captioned with trigger word. Used to train the Fat Bigfoot Character LoRA v4.",
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
    notes:
      "Repeat count: 10. Best results at 8–10 epochs with SDXL + Kohya SS.",
  },
  {
    id: "slacker-alien-dataset",
    name: "Slacker Alien — Character Dataset v2",
    description:
      "38 images of the Slacker Alien character in suburban environments. Diverse angles and expressions. Captioned with WD14 + manual edits.",
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
    notes:
      "Repeat count: 10. 8 epochs optimal. Strong character lock at 0.75 LoRA weight.",
  },
  {
    id: "highway-ghost-style",
    name: "Highway Ghost — Style Dataset v3",
    description:
      "85 cinematic night highway reference images. Rain-soaked asphalt, neon light reflections, motion blur, and dramatic street photography. Used for the Highway Ghost style LoRA.",
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
    notes:
      "FLUX natural language captions. Rank 32, 10 epochs. Style transfers well to LTX Video.",
  },
  {
    id: "desert-pursuit-style",
    name: "Desert Pursuit — Style Dataset v1",
    description:
      "64 golden hour desert chase reference images. Dust trails, dramatic shadows, wide open landscapes, and action cinematography aesthetics.",
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
    description:
      "30 dark tech node graph images. Glowing connections, dark backgrounds, cyan accents. Used to train the Node Graph concept LoRA for tech thumbnails.",
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
    notes:
      "Small dataset — concept LoRAs need fewer images. Rank 8 works best.",
  },
  {
    id: "gopro-pov-style",
    name: "GoPro POV Fisheye — Style Dataset v2",
    description:
      "120 handheld GoPro POV images with fisheye distortion. Action sports, forest runs, vehicle mounts. Covers wide variety of POV angles.",
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
    notes:
      "Larger dataset = subtle style. Use 0.55–0.7 weight for best fisheye effect.",
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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
      <div className="mb-0.5 font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className="font-syne text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function DatasetsPage() {
  const [typeFilter, setTypeFilter] = useState<DatasetType>("All");
  const [modelFilter, setModelFilter] = useState<ModelBase>("All");
  const [search, setSearch] = useState("");

  const filtered = DATASETS.filter((d) => {
    if (typeFilter !== "All" && d.type !== typeFilter) return false;
    if (modelFilter !== "All" && d.baseModel !== modelFilter) return false;
    if (
      search &&
      !d.name.toLowerCase().includes(search.toLowerCase()) &&
      !d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-10 pb-20 pt-24">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
              // Dataset Library
            </p>
            <h1 className="mb-4 font-syne text-5xl font-black tracking-tight text-white">
              Training datasets,
              <br />
              ready to use.
            </h1>
            <p className="max-w-lg leading-relaxed text-muted">
              Every LoRA on neuraldrift.io was trained on one of these datasets.
              Curated, captioned, and structured for Kohya SS. Download and
              start training in minutes.
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="font-syne text-4xl font-black text-white">
              {DATASETS.length}
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted">
              Datasets
            </div>
          </div>
        </div>

        {/* How to use strip */}
        <div className="mb-12 grid grid-cols-4 gap-4">
          {[
            {
              step: "01",
              label: "Download dataset",
              desc: "Get the image + caption ZIP",
            },
            {
              step: "02",
              label: "Check captions",
              desc: "Verify trigger word is first in every .txt",
            },
            {
              step: "03",
              label: "Configure Kohya",
              desc: "Use the linked training guide",
            },
            {
              step: "04",
              label: "Train your LoRA",
              desc: "Follow the guide for optimal settings",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
            >
              <div className="text-white/4 absolute right-3 top-3 font-syne text-4xl font-black">
                {item.step}
              </div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
                {item.step}
              </p>
              <h3 className="mb-1 font-syne text-sm font-bold text-white">
                {item.label}
              </h3>
              <p className="font-mono text-xs leading-relaxed text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-text w-56 rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-sm placeholder-muted transition-colors focus:border-accent/50 focus:outline-none"
          />
          <div className="flex gap-1.5">
            {(
              ["All", "Character", "Style", "Concept", "Video"] as DatasetType[]
            ).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                  typeFilter === t
                    ? "border-accent/20 bg-accent/10 text-accent"
                    : "hover:text-text border-border bg-card text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["All", "FLUX", "SDXL", "LTX", "SD1.5"] as ModelBase[]).map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setModelFilter(m)}
                  className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                    modelFilter === m
                      ? "border-accent-purple/20 bg-accent-purple/10 text-[#a78bfa]"
                      : "hover:text-text border-border bg-card text-muted"
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>
          <span className="ml-auto font-mono text-xs text-muted">
            {filtered.length} datasets
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((ds) => (
            <div
              key={ds.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/20"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${TYPE_STYLES[ds.type]}`}
                  >
                    {ds.type}
                  </span>
                  <span className="rounded-sm bg-white/5 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-muted">
                    {ds.baseModel}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs uppercase tracking-widest ${STATUS_STYLES[ds.status]}`}
                >
                  ● {ds.status}
                </span>
              </div>

              <div className="p-6">
                <h3 className="mb-2 font-syne text-lg font-bold tracking-tight text-white">
                  {ds.name}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted">
                  {ds.description}
                </p>

                {/* Trigger word */}
                <div className="mb-5 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    Trigger Word
                  </span>
                  <code className="font-mono text-sm text-accent">
                    {ds.triggerWord}
                  </code>
                </div>

                {/* Stats */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  <StatBox label="Images" value={String(ds.imageCount)} />
                  <StatBox label="Resolution" value={ds.resolution} />
                  <StatBox label="Captions" value={ds.captionStyle} />
                </div>

                {/* Notes */}
                <div className="mb-5 rounded-lg border border-border bg-surface p-3">
                  <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-muted">
                    Training Notes
                  </p>
                  <p className="font-mono text-xs leading-relaxed text-slate-400">
                    {ds.notes}
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {ds.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/4 rounded px-2 py-0.5 font-mono text-xs tracking-wide text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hardware */}
                <div className="mb-5 flex items-center justify-between font-mono text-xs text-muted">
                  <span>Trained on {ds.hardware}</span>
                  <span>{ds.imageCount} images</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={ds.downloadUrl}
                    className="block flex-1 rounded bg-accent py-2.5 text-center text-sm font-semibold text-black transition-opacity hover:opacity-85"
                  >
                    Download Dataset
                  </a>
                  {ds.guideUrl && (
                    <Link
                      href={ds.guideUrl}
                      className="hover:text-text block flex-1 rounded border border-border py-2.5 text-center font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/20"
                    >
                      Training Guide →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — contribute */}
        <div className="mt-16 rounded-xl border border-accent/15 bg-gradient-to-br from-accent/5 to-transparent p-10 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
            // Coming Soon
          </p>
          <h2 className="mb-3 font-syne text-3xl font-black tracking-tight text-white">
            Community dataset uploads
          </h2>
          <p className="mx-auto mb-6 max-w-lg leading-relaxed text-muted">
            Submit your own curated datasets. Get them verified, listed here,
            and linked to your trained LoRAs.
          </p>
          <Link
            href="/guides/train-flux-lora"
            className="inline-block rounded bg-accent px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
          >
            Start with the Training Guide →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
