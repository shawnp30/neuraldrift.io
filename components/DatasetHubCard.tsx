"use client";

import {
  Database,
  Download,
  Heart,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface DatasetProps {
  id: string;
  name: string;
  author?: string;
  description?: string;
  tags?: string[];
  downloads?: string;
  likes?: string;
  updatedAt?: string;
  repoUrl?: string; // Correctly using the dataset repository URL
}

export function DatasetHubCard({ dataset }: { dataset: DatasetProps }) {
  const author = (dataset.name && dataset.name.includes("/"))
    ? dataset.name.split("/")[0]
    : "Official";
  const repoName = (dataset.name && dataset.name.includes("/"))
    ? dataset.name.split("/").pop()
    : dataset.name || "Unknown Dataset";

  return (
    <div className="group flex items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-accent/30">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/5 transition-colors group-hover:bg-accent/10">
        <Database className="h-6 w-6 text-accent" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-tighter text-zinc-500">
            {author}
          </span>
          <span className="text-zinc-700">/</span>
          <h3 className="truncate text-sm font-bold text-white transition-colors group-hover:text-accent">
            {repoName}
          </h3>
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px] uppercase leading-none tracking-widest text-zinc-500">
          {dataset.updatedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-600" /> Updated{" "}
              {dataset.updatedAt}
            </span>
          )}
          {dataset.downloads && (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3 text-zinc-600" /> {dataset.downloads}
            </span>
          )}
          {dataset.likes && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-zinc-600" /> {dataset.likes}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Link
          href={`/datasets/viewer/${encodeURIComponent(dataset.name)}`}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          title="Open Viewer"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          className="rounded-lg border border-accent/20 bg-accent/10 p-2 text-accent transition-all hover:bg-accent/20"
          title="Copy ID"
          onClick={() => navigator.clipboard.writeText(dataset.name)}
        >
          <ShieldCheck className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
