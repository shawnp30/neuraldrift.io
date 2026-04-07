"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Database,
  Cpu,
  Play,
  Image as ImageIcon,
  RefreshCw,
  Box,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  Terminal,
  Search,
} from "lucide-react";

/**
 * SECTION 5 — UI Components for the LoRA Training Section
 * Comprehensive UI for Model Selection, Dataset Generation, and Training.
 */
export default function LoraTrainingPage() {
  const [hfLoras, setHfLoras] = useState<any[]>([]);
  const [baseModel, setBaseModel] = useState(
    "black-forest-labs/FLUX.1-schnell"
  );
  const [selectedLora, setSelectedLora] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Dataset Gen State
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("cinematic photography");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [datasetPath, setDatasetPath] = useState("");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // Training State
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchLoras();
  }, []);

  const fetchLoras = async () => {
    setSyncing(true);
    try {
      // Trigger sync API
      const res = await fetch("/api/sync");
      const data = await res.json();

      // Load from public data
      const jsonRes = await fetch("/data/hf_loras.json");
      const loras = await jsonRes.json();
      setHfLoras(loras);
    } catch (err) {
      console.error("Failed to sync loras:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateDataset = async () => {
    if (!category) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/lora-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count, style }),
      });
      const data = await res.json();
      setDatasetPath(data.path);

      // Fetch metadata
      const metaRes = await fetch(`${data.path}/metadata.json`);
      const meta = await metaRes.json();
      setGeneratedImages(meta);
    } catch (err) {
      console.error("Dataset Error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const startTraining = () => {
    setTraining(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTraining(false);
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-transparent pb-24 pt-32 text-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* HEADER */}
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-white/5 pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 flex items-center gap-4 font-syne text-4xl font-black tracking-tight text-white">
              <Cpu className="h-10 w-10 text-accent" /> LoRA Training Studio
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
              End-to-End Model Fine-Tuning & Deployment Pipeline
            </p>
          </div>

          <button
            onClick={fetchLoras}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />{" "}
            Sync Repos
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: CONFIGURATION */}
          <div className="space-y-8 lg:col-span-4">
            {/* A. MODEL SOURCE PANEL */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <Box className="h-4 w-4 text-accent" /> 01. Model Source
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                    Base Model (HF Hub)
                  </label>
                  <select
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-accent/40"
                  >
                    <option value="black-forest-labs/FLUX.1-schnell">
                      FLUX.1 Schnell
                    </option>
                    <option value="black-forest-labs/FLUX.1-dev">
                      FLUX.1 Dev
                    </option>
                    <option value="stabilityai/stable-diffusion-xl-base-1.0">
                      SDXL Base
                    </option>
                    <option value="runwayml/stable-diffusion-v1-5">
                      SD 1.5
                    </option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                    Reference Adapter
                  </label>
                  <select
                    value={selectedLora}
                    onChange={(e) => setSelectedLora(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-accent/40"
                  >
                    <option value="">None (Train from scratch)</option>
                    {hfLoras.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90">
                  <Zap className="h-3 w-3" /> Verification Merge
                </button>
              </div>
            </div>

            {/* B. DATASET GENERATION PANEL */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                <Database className="h-4 w-4 text-accent" /> 02. Dataset Gen
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. cyber_samurai"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-accent/40"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                      Count
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                      Seed Style
                    </label>
                    <select className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white">
                      <option>Photography</option>
                      <option>Digital Art</option>
                      <option>Oil Painting</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateDataset}
                  disabled={generating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                >
                  {generating ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  {generating ? "Generating..." : "Generate Training Data"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DATASET VIEWER & TRAINING */}
          <div className="space-y-8 lg:col-span-8">
            {/* C. DATASET VIEWER */}
            <div className="min-h-[400px] rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                  <ImageIcon className="h-4 w-4 text-accent" /> Dataset Preview
                </h2>
                {datasetPath && (
                  <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />{" "}
                      Loaded
                    </span>
                    <button className="flex items-center gap-1 transition-colors hover:text-white">
                      <Download className="h-3 w-3" /> Export ZIP
                    </button>
                  </div>
                )}
              </div>

              {generatedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                  {generatedImages.map((img, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-black/40"
                    >
                      <Image
                        src={`/api/images/${category}/${img.image}`}
                        alt={img.caption || "Training image"}
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="line-clamp-2 font-mono text-[9px] italic leading-tight text-zinc-300">
                          {img.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-zinc-600">
                  <Database className="mb-4 h-12 w-12 opacity-20" />
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    No images generated yet
                  </p>
                </div>
              )}
            </div>

            {/* D. TRAINING LAUNCHER */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-2 font-syne text-xl font-black text-white">
                    Ready to Launch Fine-Tuning
                  </h2>
                  <p className="font-mono text-xs italic text-zinc-500">
                    Training will utilize peft / diffusers on available GPU
                    clusters (Auto-select: A100/4090).
                  </p>

                  {training && (
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase text-zinc-400">
                        <span className="flex items-center gap-2">
                          <Terminal className="h-3 w-3 text-accent" /> Training
                          in progress...
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 font-mono text-[9px] uppercase text-zinc-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" /> ETA: 4m 23s
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3" /> GPU: RTX 4090
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3" /> Loss: 0.042
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={startTraining}
                  disabled={training || !datasetPath}
                  className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 transition-all ${training ? "animate-pulse border-accent" : "border-white/10 hover:border-accent hover:bg-accent/5"}`}
                >
                  <Play
                    className={`h-8 w-8 ${training ? "fill-accent text-accent" : "text-white group-hover:text-accent"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
