"use client";

import {
  ArrowLeft,
  ExternalLink,
  Database,
  Info,
  Layers,
  Search,
  Zap,
  Cpu,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModelDetailPage() {
  const params = useParams();
  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
  const modelId = slugArray
    .map((segment) => decodeURIComponent(segment as string))
    .join("/");

  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to find model details if it's a known one or fetch basic info
    // For now, we'll mock the details based on the ID
    const name = modelId.split("/").pop() || modelId;
    const author = modelId.split("/")[0] || "Community";

    setModel({
      id: modelId,
      name: name,
      author: author,
      description:
        "High-performance neural architecture optimized for NeuralDrift workflows. This model has been verified for precision and stability, ensuring seamless integration into your local AI environment.",
      base: modelId.toLowerCase().includes("flux") ? "FLUX" : "SDXL",
      genre: "General",
      downloads: 1240,
      trigger: "NATIVE MODEL",
      strength: "1.0",
      status: "Verified",
    });
    setLoading(false);
  }, [modelId]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent font-mono text-accent">
        Synchronizing Neural Node...
      </div>
    );

  return (
    <main className="min-h-screen bg-transparent pb-32 pt-32 text-slate-50">
      {/* HEADER / NAV */}
      <div className="mx-auto mb-12 max-w-7xl px-6 lg:px-12">
        <Link
          href="/models"
          className="group mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Model Library
        </Link>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl border border-accent/20 bg-accent/10 p-2.5">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                {model.base} Architecture
              </span>
            </div>
            <h1 className="break-all font-syne text-3xl font-black tracking-tight text-white md:text-5xl">
              {model.name}
            </h1>
            <p className="mt-4 font-mono text-sm text-zinc-500">
              Author: <span className="text-accent">{model.author}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <button className="rounded-2xl border border-white/5 bg-white/5 p-4 text-zinc-400 transition-colors hover:text-white">
              <Share2 size={20} />
            </button>
            <a
              href={`https://huggingface.co/${model.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-all hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              Hugging Face
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-3 lg:px-12">
        {/* LEFT COLUMN: SPECS */}
        <div className="space-y-8 lg:col-span-2">
          <div className="nh-glass-card rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 p-10">
            <h2 className="mb-6 font-syne text-xl font-black uppercase tracking-tight text-white">
              Model Description
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-zinc-400">
              {model.description}
            </p>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { label: "Trigger Word", val: model.trigger, icon: Zap },
                {
                  label: "Recommended Weight",
                  val: model.strength,
                  icon: Info,
                },
                { label: "Training Epochs", val: "10-12", icon: Layers },
                { label: "Optimizer", val: "AdamW8bit", icon: Cpu },
              ].map((spec, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/5 bg-white/5 p-5"
                >
                  <spec.icon size={16} className="mb-3 text-accent" />
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    {spec.label}
                  </p>
                  <p className="truncate font-mono text-xs font-bold text-white">
                    {spec.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="nh-glass-card group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <h2 className="mb-6 font-syne text-xl font-black uppercase tracking-tight text-white">
              Deployment Strategy
            </h2>
            <p className="mb-8 font-mono text-sm leading-relaxed text-zinc-500">
              {/* Optimized for local inference via ComfyUI. */}
              <br />
              {/* Ensure rank consistency across all layers. */}
              <br />
              {/* VRAM requirements: 8GB+ for SDXL / 16GB+ for FLUX. */}
            </p>
            <button className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10">
              <Download size={16} className="text-accent" />
              Download Deployment Package (.safetensors)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW/META */}
        <div className="space-y-8">
          <div className="nh-glass-card rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 p-8">
            <div className="group relative mb-6 aspect-square w-full overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-6">
                <div>
                  <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-accent">
                    {/* // Reference Output */}
                  </p>
                  <p className="font-syne text-xs font-black uppercase text-white">
                    NeuralDrift Native Training
                  </p>
                </div>
              </div>
              {/* Use a placeholder image or a generated one if available */}
              <div className="h-full w-full animate-pulse bg-gradient-to-br from-indigo-500/10 to-accent/10" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Base Model
                </span>
                <span className="font-mono text-[10px] font-bold text-white">
                  {model.base}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Genre
                </span>
                <span className="font-mono text-[10px] font-bold text-white">
                  {model.genre}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Total Deploys
                </span>
                <span className="font-mono text-[10px] font-bold text-accent">
                  {model.downloads.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-accent/10 bg-accent/5 p-8 text-center">
            <Zap className="mx-auto mb-4 text-accent" size={24} />
            <h4 className="mb-2 font-syne text-sm font-black uppercase text-white">
              Ready to train?
            </h4>
            <p className="mb-6 text-[11px] leading-relaxed text-zinc-500">
              Use our hardware-aware optimizer to get the best performance for
              your unique local setup.
            </p>
            <Link
              href="/optimizer"
              className="block w-full rounded-xl bg-white py-3 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
            >
              Run Optimizer →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
