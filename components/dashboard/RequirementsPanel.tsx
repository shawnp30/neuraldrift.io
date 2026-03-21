"use client";
import { useState } from "react";
import { getRequirements } from "@/data/workflows/requirements";

const TYPE_COLORS: Record<string, string> = {
  checkpoint:   "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  unet:         "bg-[rgba(0,229,255,0.08)] text-[#00e5ff]",
  lora:         "bg-[rgba(124,58,237,0.08)] text-[#a78bfa]",
  vae:          "bg-[rgba(16,185,129,0.08)] text-[#10b981]",
  text_encoder: "bg-[rgba(249,115,22,0.08)] text-[#f97316]",
  upscaler:     "bg-[rgba(163,230,53,0.08)] text-[#a3e635]",
  other:        "bg-white/5 text-muted",
};

export function RequirementsPanel({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState<"models" | "nodes" | "structure">("models");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const req = getRequirements(workflowId);

  if (!req) return null;

  const totalGB = req.models.filter(m => m.required).reduce((a, m) => a + m.sizeGB, 0);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 1500);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">Requirements</h3>
        <p className="font-mono text-xs text-muted mt-0.5">
          {req.vramMin}GB min Â· {req.vramRec}GB rec Â· {totalGB.toFixed(1)}GB total
        </p>
      </div>

      {/* VRAM bar */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between font-mono text-xs mb-1.5">
          <span className="text-muted">VRAM</span>
          <span className="text-white">{req.vramMin}â€“{req.vramRec}GB</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-purple"
            style={{ width: `${Math.min((req.vramRec / 32) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pb-3">
        {(["models", "nodes", "structure"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-mono text-xs px-3 py-1.5 rounded tracking-widest uppercase transition-colors capitalize ${
              tab === t
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-muted hover:text-text"
            }`}
          >
            {t === "nodes" ? "Nodes" : t === "structure" ? "Paths" : "Models"}
          </button>
        ))}
      </div>

      {/* Models tab */}
      {tab === "models" && (
        <div className="px-5 pb-5 space-y-2">
          {req.models.map((model) => (
            <div key={model.filename} className={`rounded-lg p-3 border ${model.required ? "border-border bg-surface" : "border-border/40 bg-surface/50 opacity-75"}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded tracking-wide flex-shrink-0 ${TYPE_COLORS[model.type]}`}>
                    {model.type}
                  </span>
                  <span className="font-syne text-xs font-bold text-white truncate">{model.name}</span>
                </div>
                <span className="font-mono text-xs text-muted flex-shrink-0">{model.sizeGB}GB</span>
              </div>
              <p className="font-mono text-xs text-accent/70 mb-1 truncate">{model.filename}</p>
              {model.notes && (
                <p className="font-mono text-xs text-muted mb-2 leading-relaxed">{model.notes}</p>
              )}
              <div className="flex gap-2">
                <a
                  href={model.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent border border-accent/20 px-2 py-1 rounded hover:bg-accent/8 transition-colors tracking-wide"
                >
                  Download â†’
                </a>
                <button
                  onClick={() => copyPath(model.directory + model.filename)}
                  className="font-mono text-xs text-muted border border-border px-2 py-1 rounded hover:text-text transition-colors tracking-wide"
                >
                  {copiedFile === model.directory + model.filename ? "âœ“ Copied" : "Copy path"}
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-border font-mono text-xs">
            <span className="text-muted">Required total</span>
            <span className="text-white font-medium">{totalGB.toFixed(1)}GB</span>
          </div>
        </div>
      )}

      {/* Custom nodes tab */}
      {tab === "nodes" && (
        <div className="px-5 pb-5 space-y-3">
          {req.customNodes.length === 0 ? (
            <div className="text-center py-6">
              <p className="font-mono text-xs text-[#10b981]">âœ“ No custom nodes required</p>
              <p className="font-mono text-xs text-muted mt-1">Built-in ComfyUI nodes only</p>
            </div>
          ) : (
            req.customNodes.map((node) => (
              <div key={node.name} className="bg-surface border border-border rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-syne text-xs font-bold text-white">{node.name}</span>
                </div>
                <p className="font-mono text-xs text-muted mb-2">{node.repo}</p>
                {node.notes && (
                  <p className="font-mono text-xs text-[#f97316] mb-2 leading-relaxed">{node.notes}</p>
                )}
                <a
                  href={node.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent border border-accent/20 px-2 py-1 rounded hover:bg-accent/8 transition-colors tracking-wide inline-block"
                >
                  Install via Manager â†’
                </a>
              </div>
            ))
          )}

          {/* Launch flags */}
          {req.launchFlags.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-3 mt-2">
              <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Launch Flags</p>
              <div className="flex flex-wrap gap-1.5">
                {req.launchFlags.map((flag) => (
                  <span key={flag} className="font-mono text-xs bg-accent/8 text-accent px-2 py-1 rounded">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-surface border border-border rounded-lg p-3">
            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Setup Tips</p>
            <ul className="space-y-1.5">
              {req.tips.map((tip, i) => (
                <li key={i} className="font-mono text-xs text-muted flex items-start gap-1.5 leading-relaxed">
                  <span className="text-accent flex-shrink-0 mt-0.5">â†’</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Folder structure tab */}
      {tab === "structure" && (
        <div className="px-5 pb-5">
          <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre overflow-x-auto">
            {req.folderStructure}
          </div>
          <p className="font-mono text-xs text-muted mt-3 leading-relaxed">
            Place models in the matching folders inside your ComfyUI installation directory.
          </p>
        </div>
      )}
    </div>
  );
}
