"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, ExternalLink, Award } from "lucide-react";
import { Counter } from "@/components/shared/Counter";

interface CreatorData {
  name: string;
  downloads: number;
  modelCount: number;
  bio: string;
  avatar: string;
  topModelId: string;
  previewUrl: string;
}

export function ArchitectsSpotlight() {
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopCreator() {
      try {
        const res = await fetch("/api/hf-models");
        const models = await res.json();

        if (!Array.isArray(models)) return;

        // Group by author and calculate stats
        const authors: Record<string, { downloads: number; models: any[] }> =
          {};

        models.forEach((m) => {
          if (!authors[m.author]) {
            authors[m.author] = { downloads: 0, models: [] };
          }
          authors[m.author].downloads += m.downloads || 0;
          authors[m.author].models.push(m);
        });

        // Find the top author
        let topAuthor = "";
        let maxDownloads = -1;

        Object.keys(authors).forEach((auth) => {
          if (authors[auth].downloads > maxDownloads) {
            maxDownloads = authors[auth].downloads;
            topAuthor = auth;
          }
        });

        if (topAuthor) {
          const topModel = authors[topAuthor].models.sort(
            (a, b) => (b.downloads || 0) - (a.downloads || 0)
          )[0];

          setCreator({
            name: topAuthor,
            downloads: maxDownloads,
            modelCount: authors[topAuthor].models.length,
            bio: `Master of advanced neural architectures and specialized ${topModel.baseModel || "FLUX"} optimization. Leading the Drift with high-performance creative workflows.`,
            avatar: `https://avatar.vercel.sh/${topAuthor}`,
            topModelId: topModel.id,
            previewUrl: "/featured-creator.png",
          });
        }
      } catch (err) {
        console.error("Failed to fetch featured creator:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopCreator();
  }, []);

  if (loading)
    return (
      <div className="bg-[#0d1117] px-[20px] py-[60px]">
        <div className="mx-auto h-[400px] max-w-[900px] animate-pulse rounded-2xl bg-[#161b22]" />
      </div>
    );

  if (!creator) return null;

  return (
    <section className="border-b border-[#30363d] bg-transparent px-[20px] py-[60px]">
      <div className="mx-auto mb-10 max-w-7xl text-center">
        <h2 className="mb-2 font-syne text-4xl font-black text-white drop-shadow-[0_0_10px_#00f2ff]">
          Architects of the Drift
        </h2>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
          Top-tier creators shaping the future of generative media.
        </p>
      </div>

      <div className="group mx-auto flex max-w-[900px] flex-col overflow-hidden rounded-2xl border border-accent/30 bg-[#161b22] shadow-[0_0_30px_rgba(0,229,255,0.15)] transition-all hover:shadow-[0_0_50px_rgba(0,229,255,0.2)] md:flex-row">
        {/* Creator Visual */}
        <div className="relative min-h-[350px] flex-1 overflow-hidden bg-black">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
          <Image
            src={creator.previewUrl}
            alt="Featured Generation"
            fill
            className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute left-[20px] top-[20px] z-20 rounded bg-accent px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(0,229,255,0.5)]">
            Featured Architect
          </div>
          <div className="absolute bottom-6 left-6 z-20">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <Award className="h-3 w-3 text-accent" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                Top Global Rank
              </span>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex flex-[1.2] flex-col justify-center p-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-accent/20">
              <Image
                src={creator.avatar}
                alt={creator.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white transition-colors group-hover:text-accent">
                @{creator.name}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                <Counter value={creator.downloads} /> Downloads •{" "}
                <Counter value={creator.modelCount} /> LoRAs
              </p>
            </div>
          </div>

          <p className="mb-8 font-mono text-[12px] leading-relaxed text-zinc-400">
            {creator.bio}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/models?query=${creator.name}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              View Portfolio
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href={`/workflows?modelId=${creator.topModelId}`}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              Use Top Model
              <Zap className="h-3 w-3 fill-current" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[900px] justify-center">
        <Link
          href="/monetization/featured"
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:text-accent"
        >
          Apply to be Featured →
        </Link>
      </div>
    </section>
  );
}
