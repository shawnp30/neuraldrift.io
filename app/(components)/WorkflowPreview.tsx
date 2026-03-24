"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, LayoutGrid } from "lucide-react";

export interface WorkflowMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  preview_image: string;
  preview_video: string | null;
  download_url: string;
  created_at: string;
}

export default function WorkflowPreview({ workflow }: { workflow: WorkflowMetadata }) {
  return (
    <Link
      href={`/workflows/${workflow.slug}`}
      className="group flex flex-col bg-[#0f172a]/50 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-[#0f172a]/80 transition-all duration-300 shadow-xl"
    >
      <div className="aspect-[16/10] relative overflow-hidden bg-black/50 border-b border-white/5">
        <Image
          src={workflow.preview_image}
          alt={workflow.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {workflow.preview_video && (
            <span className="px-2.5 py-1 text-[10px] font-[800] uppercase tracking-widest text-white bg-indigo-500/80 backdrop-blur-md rounded border border-white/10 shadow-lg">
              Video Demo
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-[800] text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
          {workflow.name}
        </h3>
        
        <p className="text-sm font-[500] text-zinc-400 leading-relaxed mb-6 line-clamp-2 flex-1">
          {workflow.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {workflow.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-[800] rounded bg-white/5 border border-white/10 text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-xs font-[700] text-indigo-400 flex items-center gap-1.5 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            <LayoutGrid className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
