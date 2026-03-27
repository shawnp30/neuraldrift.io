"use client";

import { useState, useMemo } from "react";
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
  Layers
} from "lucide-react";
import { WorkflowNode } from "@/lib/github";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowExplorerProps {
  initialTree: WorkflowNode[];
}

export default function WorkflowExplorer({ initialTree }: WorkflowExplorerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "workflows": true
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Flatten tree for searching if needed, but for now we'll just filter files in the UI
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

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-8 min-h-[600px]">
      
      {/* SIDEBAR: File Tree */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all placeholder:text-zinc-600"
          />
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-y-auto max-h-[70vh] nh-glass-card">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="font-syne text-xs font-bold uppercase tracking-widest text-white/60">Repository</span>
          </div>
          <div className="space-y-1">
            {initialTree.length > 0 ? (
              initialTree.map(node => (
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
              <div className="py-8 px-4 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Syncing Repository...</p>
                <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                  No workflows found in <code className="text-indigo-400">public/workflows/</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN: Content Area */}
      <div className="flex-1 min-h-[400px]">
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div 
              key={selectedFile.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 lg:p-12 nh-glass-card h-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20">
                      <FileJson className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-syne font-black text-white">{selectedFile.name.replace(".json", "")}</h2>
                      <p className="text-sm font-mono text-zinc-500 tracking-tight">{selectedFile.path}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a 
                    href={selectedFile.downloadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-black px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </a>
                  <a 
                    href={`https://github.com/shawnp30/neuraldrift.io/blob/main/${selectedFile.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <Cpu className="w-5 h-5 text-indigo-400 mb-3" />
                  <h4 className="font-syne text-sm font-bold text-white mb-1 uppercase tracking-wide">Optimization</h4>
                  <p className="text-xs text-zinc-500 font-mono">Tuned for RTX 40+ Series</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <Activity className="w-5 h-5 text-cyan-400 mb-3" />
                  <h4 className="font-syne text-sm font-bold text-white mb-1 uppercase tracking-wide">Performance</h4>
                  <p className="text-xs text-zinc-500 font-mono">Real-time inference compatible</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <Layers className="w-5 h-5 text-purple-400 mb-3" />
                  <h4 className="font-syne text-sm font-bold text-white mb-1 uppercase tracking-wide">Version</h4>
                  <p className="text-xs text-zinc-500 font-mono">Latest Push / Main Branch</p>
                </div>
              </div>

              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Raw Workflow Preview</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                    <div className="w-2 h-2 rounded-full bg-green-500/20" />
                  </div>
                </div>
                <div className="font-mono text-xs text-zinc-500 leading-relaxed overflow-y-auto max-h-[300px] border-l border-white/10 pl-4 py-2">
                  {`// This workflow is synchronized directly with shawnp30/neuraldrift.io`}
                  <br />
                  {`// Download to view full node graph structure in ComfyUI`}
                  <br />
                  {`// Path: ${selectedFile.path}`}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] border border-white/10 border-dashed rounded-3xl nh-glass-card">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Folder className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-syne font-bold text-white mb-2 tracking-tight">Select a Workflow</h3>
              <p className="text-sm text-zinc-500 max-w-xs font-mono">
                Browse the repository on the left to explore pre-built ComfyUI pipelines and optimized local workflows.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TreeNode({ 
  node, 
  expandedFolders, 
  onToggle, 
  onSelect, 
  selectedPath,
  searchQuery,
  depth = 0
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

  // Filter based on search query (crude but effective for file tree)
  const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (node.children && node.children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));

  if (!matchesSearch) return null;

  return (
    <div className="select-none">
      <div 
        onClick={() => isDir ? onToggle(node.path) : onSelect(node.path)}
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all border border-transparent
          ${isSelected ? "bg-accent/10 border-accent/20 text-accent font-bold" : "hover:bg-white/5 text-zinc-400"}
          ${depth > 0 ? "ml-4" : ""}
        `}
      >
        <span className="w-4 flex items-center justify-center">
          {isDir ? (
            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : null}
        </span>
        {isDir ? <Folder className="w-4 h-4 text-indigo-400" /> : <FileJson className="w-4 h-4 text-zinc-500" />}
        <span className={`text-xs font-mono truncate ${isSelected ? "text-white" : ""}`}>
          {node.name.replace(".json", "")}
        </span>
      </div>

      {isDir && isExpanded && node.children && (
        <div className="mt-1">
          {node.children.map(child => (
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
