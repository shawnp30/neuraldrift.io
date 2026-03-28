"use client";

import { useState, useMemo, useRef } from "react";
import {
  Folder,
  FileJson,
  ChevronRight,
  ChevronDown,
  Download,
  ExternalLink,
  Search,
  Activity,
  Cpu,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { WorkflowNode } from "@/lib/github";
import { getWorkflowMeta, getCategoryColor } from "@/lib/workflowMeta";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─── Thumbnail path helper ───────────────────────────────────────────
function getThumbPath(category: string): string {
  return `/images/workflows/thumbs/${category}.png`;
}
function getMapPath(category: string): string {
  return `/images/workflows/maps/${category}.png`;
}

// ─── Main Component ──────────────────────────────────────────────────
interface WorkflowExplorerProps {
  initialTree: WorkflowNode[];
}

export default function WorkflowExplorer({
  initialTree,
}: WorkflowExplorerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    workflows: true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const selectedFile = useMemo(() => {
    const findFile = (nodes: WorkflowNode[]): WorkflowNode | null => {
      for (const node of nodes) {
        if (node.path === selectedPath) return node;
        if (node.children) {
          const found = findFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFile(initialTree);
  }, [selectedPath, initialTree]);

  const meta = selectedFile ? getWorkflowMeta(selectedFile.name) : null;

  return (
    <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:px-12">
      {/* ═══ SIDEBAR: File Tree ═══ */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 font-mono text-sm text-[#F3F4F6] outline-none transition-all placeholder:text-zinc-500 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          />
        </div>

        <div className="nh-glass-card max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center gap-2 px-2">
            <Layers className="h-4 w-4 text-accent" />
            <span className="font-syne text-xs font-bold uppercase tracking-widest text-zinc-300">
              Repository
            </span>
          </div>
          <div className="space-y-1">
            {initialTree.length > 0 ? (
              initialTree.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  expandedFolders={expandedFolders}
                  onToggle={toggleFolder}
                  onSelect={setSelectedPath}
                  selectedPath={selectedPath}
                  searchQuery={searchQuery}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/5 px-4 py-8 text-center">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  Syncing Repository...
                </p>
                <p className="font-mono text-xs leading-relaxed text-[#F3F4F6]">
                  No workflows found in{" "}
                  <code className="text-indigo-400">public/workflows/</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN: Content Area ═══ */}
      <div className="min-h-[400px] flex-1">
        <AnimatePresence mode="wait">
          {selectedFile && meta ? (
            <motion.div
              key={selectedFile.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="nh-glass-card flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-8 lg:p-12"
            >
              {/* ── Header ── */}
              <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl border border-accent/20 bg-accent/10 p-2.5">
                      <FileJson className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-syne text-2xl font-black text-white lg:text-3xl">
                        {selectedFile.name.replace(".json", "")}
                      </h2>
                      <p className="font-mono text-sm tracking-tight text-zinc-400">
                        {selectedFile.path}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={selectedFile.downloadUrl}
                    download={selectedFile.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-black transition-all hover:bg-accent/90"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </a>
                  {selectedFile.downloadUrl?.startsWith("http") && (
                    <a
                      href={`https://github.com/shawnp30/neuraldrift.io/blob/main/${selectedFile.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition-all hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* ── Workflow Description ── */}
              <div className="mb-10 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.categoryColor} ${meta.categoryBg}`}
                  >
                    {meta.categoryLabel}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    // Pipeline Overview
                  </span>
                </div>
                <p className="text-[15px] font-medium leading-relaxed text-[#F3F4F6]">
                  {meta.description}
                </p>
              </div>

              {/* ── Metadata Cards ── */}
              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                  <Cpu className="mb-3 h-5 w-5 text-indigo-400" />
                  <h4 className="mb-1 font-syne text-sm font-bold uppercase tracking-wide text-white">
                    Optimization
                  </h4>
                  <p className="font-mono text-xs text-zinc-300">
                    Tuned for RTX 40+ Series
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                  <Activity className="mb-3 h-5 w-5 text-cyan-400" />
                  <h4 className="mb-1 font-syne text-sm font-bold uppercase tracking-wide text-white">
                    Performance
                  </h4>
                  <p className="font-mono text-xs text-zinc-300">
                    Real-time inference compatible
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                  <Layers className="mb-3 h-5 w-5 text-purple-400" />
                  <h4 className="mb-1 font-syne text-sm font-bold uppercase tracking-wide text-white">
                    Version
                  </h4>
                  <p className="font-mono text-xs text-zinc-300">
                    Latest Push / Main Branch
                  </p>
                </div>
              </div>

              {/* ── Visual Workflow Map ── */}
              <WorkflowMap
                category={meta.category}
                filename={selectedFile.name}
              />
            </motion.div>
          ) : (
            <div className="nh-glass-card flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Folder className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="mb-2 font-syne text-xl font-bold tracking-tight text-white">
                Select a Workflow
              </h3>
              <p className="max-w-xs font-mono text-sm text-[#F3F4F6]">
                Browse the repository on the left to explore pre-built ComfyUI
                pipelines and optimized local workflows.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Visual Workflow Map Component ───────────────────────────────────
function WorkflowMap({
  category,
  filename,
}: {
  category: string;
  filename: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const mapSrc = getMapPath(category);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/5 bg-[#0a0e17]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Visual Workflow Map
        </span>
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-[10px] text-zinc-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-white/10" />
          <button
            onClick={handleReset}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Reset View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        className="relative h-[380px] cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          }}
        >
          <Image
            src={mapSrc}
            alt={`${filename} visual workflow map`}
            width={900}
            height={380}
            className="pointer-events-none select-none rounded-lg"
            style={{ objectFit: "contain" }}
            draggable={false}
            unoptimized
          />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
}

// ─── Tree Node (Sidebar File Item) ──────────────────────────────────
function TreeNode({
  node,
  expandedFolders,
  onToggle,
  onSelect,
  selectedPath,
  searchQuery,
  depth = 0,
}: {
  node: WorkflowNode;
  expandedFolders: Record<string, boolean>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  selectedPath: string | null;
  searchQuery: string;
  depth?: number;
}) {
  const isExpanded = expandedFolders[node.path];
  const isSelected = selectedPath === node.path;
  const isDir = node.type === "dir";
  const catInfo = !isDir ? getCategoryColor(node.name) : null;

  const matchesSearch =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.children &&
      node.children.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));

  if (!matchesSearch) return null;

  return (
    <div className="select-none">
      <div
        onClick={() => (isDir ? onToggle(node.path) : onSelect(node.path))}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-all ${isSelected ? "border-accent/20 bg-accent/10 font-bold text-accent" : "text-zinc-300 hover:bg-white/5"} ${depth > 0 ? "ml-4" : ""} `}
      >
        <span className="flex w-4 shrink-0 items-center justify-center">
          {isDir ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : null}
        </span>

        {/* Thumbnail or icon */}
        {isDir ? (
          <Folder className="h-4 w-4 shrink-0 text-indigo-400" />
        ) : catInfo ? (
          <div
            className={`h-6 w-6 shrink-0 overflow-hidden rounded-md border border-white/10 ${catInfo.bg}`}
          >
            <Image
              src={getThumbPath(getWorkflowMeta(node.name).category)}
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <FileJson className="h-4 w-4 shrink-0 text-zinc-400" />
        )}

        <span
          className={`truncate font-mono text-xs ${isSelected ? "text-white" : "text-zinc-200"}`}
        >
          {node.name.replace(".json", "")}
        </span>

        {/* Category badge */}
        {!isDir && catInfo && (
          <span
            className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider ${catInfo.text} ${catInfo.bg}`}
          >
            {catInfo.label}
          </span>
        )}
      </div>

      {isDir && isExpanded && node.children && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              expandedFolders={expandedFolders}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedPath={selectedPath}
              searchQuery={searchQuery}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
