"use client";

import { useEffect, useState } from "react";
import { useStashStore } from "@/lib/store/useStashStore";
import { ModelHubCard } from "@/components/ModelHubCard";
import { LayoutGrid, Library, Ghost, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

export default function StashPage() {
  const { stash, toggleStash } = useStashStore();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStashMetadata() {
      if (stash.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/hf-models/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: stash }),
        });
        const data = await res.json();
        setModels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load stash:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStashMetadata();
  }, [stash]);

  return (
    <main className="min-h-screen bg-[#0d1117] pb-24 pt-32 text-slate-50">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* HEADER */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg border border-accent/20 bg-accent/10 p-2">
                <Library className="h-5 w-5 text-accent" />
              </div>
              <h1 className="font-syne text-4xl font-black tracking-tight text-white">
                Drift Stash
              </h1>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              Your personalized collection of saved architectures & LoRAs
            </p>
          </div>

          {stash.length > 0 && (
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#161b22] px-6 py-3">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Saved Models
                </div>
                <div className="text-xl font-black text-white">
                  {stash.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#161b22]"
              />
            ))}
          </div>
        ) : stash.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#161b22]/30 px-6 py-32 text-center">
            <div className="mb-8 rounded-full border border-white/10 bg-white/5 p-8">
              <Ghost className="h-12 w-12 text-zinc-700" />
            </div>
            <h3 className="mb-4 text-2xl font-black text-white">
              Your stash is empty
            </h3>
            <p className="mb-10 max-w-md font-mono text-xs uppercase leading-relaxed tracking-widest text-zinc-500">
              Explore the Library to find high-performance models for your next
              generative session.
            </p>

            <Link
              href="/models"
              className="inline-flex items-center gap-3 rounded-xl bg-accent px-10 py-5 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              Browse Library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {models.map((model) => (
              <ModelHubCard key={model.modelId} model={model} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
