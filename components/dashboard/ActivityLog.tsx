const LOG = [
  {
    color: "bg-green-400",
    text: "Inference complete",
    detail: "highway_ghost_style_preview rendered 8 images in 52s",
    time: "4m ago",
  },
  {
    color: "bg-accent",
    text: "Training resumed",
    detail: "highway_ghost_v3 continued from checkpoint epoch 6",
    time: "12m ago",
  },
  {
    color: "bg-accent-orange",
    text: "VRAM warning",
    detail: "RTX 5080 peaked at 15.8GB during batch inference",
    time: "28m ago",
  },
  {
    color: "bg-green-400",
    text: "Model exported",
    detail: "highway_ghost_v3 → /output 847MB .safetensors",
    time: "1h ago",
  },
  {
    color: "bg-accent-purple",
    text: "Workflow saved",
    detail: "desert_pursuit_ltx_v1 — 14 nodes",
    time: "2h ago",
  },
  {
    color: "bg-muted",
    text: "Dataset upload",
    detail: "subway_breach_set: 1,240 images queued for captioning",
    time: "3h ago",
  },
];

export function ActivityLog() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-syne text-sm font-bold text-white">Activity Log</h3>
        <button className="font-mono text-xs uppercase tracking-widest text-muted">
          Clear
        </button>
      </div>
      {LOG.map((l, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 border-b border-border px-5 py-3 last:border-b-0"
        >
          <div
            className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${l.color}`}
          />
          <div className="min-w-0 flex-1">
            <div className="text-text text-xs font-medium">{l.text}</div>
            <div className="mt-0.5 text-xs leading-snug text-muted">
              {l.detail}
            </div>
          </div>
          <span className="mt-0.5 flex-shrink-0 font-mono text-xs tracking-wide text-muted">
            {l.time}
          </span>
        </div>
      ))}
    </div>
  );
}
