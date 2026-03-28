import {
  Box,
  Download,
  Heart,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import { cleanModelDisplay } from "@/utils/modelNames";
import { useStashStore } from "@/lib/store/useStashStore";

interface ModelProps {
  modelId: string; // The 'author/repo-name'
  displayName: string; // The cleaned title
  author: string; // The author name
  baseModel?: string;
  downloads?: number | string;
  likes?: number | string;
  updatedAt?: string;
  description?: string;
}

export function ModelHubCard({ model }: { model: ModelProps }) {
  // STRICT DATA BINDING OVERRIDE (Task 2 & 3)
  const modelId = model.modelId;
  const author = model.author;
  const displayTitle = model.displayName;

  // SHA Safety Check
  let safeTitle = displayTitle;
  if (/^[a-f0-9]{40}$/.test(safeTitle)) {
    safeTitle = "Error: Mapped to SHA instead of ID";
  }

  const truncatedName =
    safeTitle.length > 30 ? safeTitle.substring(0, 30) + "..." : safeTitle;

  const { toggleStash, isStashed } = useStashStore();
  const stashed = isStashed(modelId);

  return (
    <div className="group relative flex items-center gap-6 rounded-2xl border border-white/5 bg-[#161b22] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/5 transition-all group-hover:border-accent/30 group-hover:bg-accent/10">
        <Box className="h-7 w-7 text-accent" />

        {/* Save to Stash Toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleStash(modelId);
          }}
          className={`absolute -left-2 -top-2 rounded-full border p-1.5 transition-all duration-200 active:scale-125 ${
            stashed
              ? "scale-110 border-accent bg-accent text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              : "border-white/10 bg-[#161b22] text-zinc-600 hover:border-white/20 hover:text-white"
          }`}
          title={stashed ? "Remove from Stash" : "Save to Stash"}
        >
          {stashed ? (
            <BookmarkCheck className="h-3 w-3" />
          ) : (
            <Bookmark className="h-3 w-3" />
          )}
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded border border-accent/20 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-tighter text-accent">
              {author}
            </span>
            <h3
              className="truncate text-base font-black tracking-tight text-white transition-colors group-hover:text-accent"
              title={safeTitle}
            >
              {truncatedName}
            </h3>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
            <span className="text-zinc-800">SOURCE //</span> {modelId}
          </div>
        </div>

        {model.description && (
          <p className="mb-3 line-clamp-2 font-mono text-[11px] leading-relaxed text-zinc-400">
            {model.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase leading-none tracking-widest text-zinc-500">
          <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-[9px] font-bold text-accent">
            {model.baseModel || "FLUX"}
          </span>
          {model.updatedAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-700" />
              {new Date(model.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          {model.downloads && (
            <span className="flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-zinc-700" />
              {model.downloads}
            </span>
          )}
          {model.likes && (
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-zinc-700" />
              {model.likes}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Use in Workflow Button */}
        <Link
          href={`/workflows?model=${encodeURIComponent(modelId)}`}
          className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-accent transition-all hover:bg-accent/20 active:scale-95"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Use in Workflow</span>
        </Link>

        <div className="flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/models/${encodeURIComponent(modelId)}`}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
            title="View Details"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
            title="Copy Model ID"
            onClick={() => {
              navigator.clipboard.writeText(modelId);
            }}
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
