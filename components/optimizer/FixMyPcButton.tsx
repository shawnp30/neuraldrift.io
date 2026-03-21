"use client";
import { useState } from "react";

interface FixAction {
  type: string;
  label: string;
  detail: string;
  impact: string;
}

interface FixResult {
  status: string;
  status_label: string;
  summary: string;
  can_run: boolean;
  actions: FixAction[];
  optimized_settings: Record<string, unknown> | null;
  upgrade_path: {
    needed: boolean;
    current_vram_gb?: number;
    recommended_vram_gb?: number;
    suggested_gpus?: string[];
    computeatlas_url?: string;
  };
}

interface Props {
  workflowId: string;
  hardware: { vram_gb: number; ram_gb: number; gpu_name?: string; storage_free_gb?: number };
  apiBase?: string;
}

const ACTION_ICONS: Record<string, string> = {
  setting_change:      "⚙️",
  launch_flag:         "🚩",
  system_change:       "💻",
  model_variant:       "📦",
  alternative_workflow:"↪️",
  hardware_upgrade:    "🖥️",
};

const STATUS_COLORS: Record<string, string> = {
  no_changes_needed:    "#10b981",
  settings_fix_possible:"#00e5ff",
  workflow_downgrade:   "#f97316",
  hardware_limitation:  "#ef4444",
  cannot_run:           "#7f1d1d",
};

export function FixMyPcButton({ workflowId, hardware, apiBase = (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:5000" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    if (result) { setOpen(true); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/fix-my-pc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_id: workflowId, hardware }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = result ? (STATUS_COLORS[result.status] || "#00e5ff") : "#00e5ff";

  return (
    <>
      <button
        onClick={run}
        disabled={loading}
        className="w-full border border-border text-muted py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:border-accent/30 hover:text-text transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" /> Analyzing...</>
        ) : (
          <><span>🔧</span> Fix for My PC</>
        )}
      </button>

      {error && (
        <p className="font-mono text-xs text-red-400 mt-2 text-center">{error}</p>
      )}

      {/* Modal */}
      {open && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between z-10">
              <div>
                <div
                  className="font-mono text-xs tracking-widest uppercase mb-1"
                  style={{ color: statusColor }}
                >
                  {result.status_label}
                </div>
                <h3 className="font-syne text-base font-bold text-white leading-snug">{result.summary}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-text ml-4 flex-shrink-0 text-lg leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Run status */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                result.can_run
                  ? "bg-[#10b981]/5 border-[#10b981]/20"
                  : "bg-[#ef4444]/5 border-[#ef4444]/20"
              }`}>
                <span className="text-xl">{result.can_run ? "✓" : "✗"}</span>
                <span className="font-mono text-xs" style={{ color: result.can_run ? "#10b981" : "#ef4444" }}>
                  {result.can_run ? "This workflow can run on your hardware" : "Below minimum hardware requirements"}
                </span>
              </div>

              {/* Actions */}
              {result.actions.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
                    {result.can_run ? "Recommended Adjustments" : "Path Forward"}
                  </p>
                  <div className="space-y-2">
                    {result.actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface border border-border rounded-lg px-4 py-3">
                        <span className="text-base flex-shrink-0 mt-0.5">{ACTION_ICONS[action.type] || "→"}</span>
                        <div className="min-w-0">
                          <div className="font-syne text-xs font-bold text-white mb-0.5">{action.label}</div>
                          <div className="font-mono text-xs text-muted leading-relaxed">{action.detail}</div>
                        </div>
                        <span className={`font-mono text-xs flex-shrink-0 px-2 py-0.5 rounded tracking-wide ${
                          action.impact === "High" || action.impact === "Required"
                            ? "bg-[#ef4444]/10 text-[#ef4444]"
                            : "bg-white/5 text-muted"
                        }`}>
                          {action.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimized settings */}
              {result.optimized_settings && (
                <div>
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Optimized Settings</p>
                  <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs space-y-1.5">
                    {Object.entries(result.optimized_settings)
                      .filter(([, v]) => v !== null && v !== undefined)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-muted">{k.replace(/_/g, " ")}</span>
                          <span className="text-accent">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Upgrade path */}
              {result.upgrade_path?.needed && (
                <div className="bg-gradient-to-br from-accent-purple/8 to-transparent border border-accent-purple/20 rounded-xl p-5">
                  <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-2">Upgrade Path</p>
                  <p className="font-mono text-xs text-muted mb-3">
                    Your GPU: <span className="text-white">{result.upgrade_path.current_vram_gb}GB</span>
                    {" → "}
                    Recommended: <span className="text-white">{result.upgrade_path.recommended_vram_gb}GB+</span>
                  </p>
                  {result.upgrade_path.suggested_gpus && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {result.upgrade_path.suggested_gpus.map(gpu => (
                        <span key={gpu} className="font-mono text-xs bg-white/5 text-muted px-2 py-1 rounded">{gpu}</span>
                      ))}
                    </div>
                  )}
                  <a
                    href={result.upgrade_path.computeatlas_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center font-mono text-xs text-[#a78bfa] border border-accent-purple/20 px-4 py-2 rounded hover:bg-accent-purple/8 transition-colors tracking-wider"
                  >
                    Plan upgrade on ComputeAtlas →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
