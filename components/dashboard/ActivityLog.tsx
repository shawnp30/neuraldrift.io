const LOG = [
  { color: "bg-green-400", text: "AnimateDiff job complete", detail: "fat_bigfoot_loop_v2 rendered 24 frames in 4m 11s", time: "4m ago" },
  { color: "bg-accent", text: "Training resumed", detail: "highway_ghost_v3 continued from checkpoint epoch 6", time: "12m ago" },
  { color: "bg-accent-orange", text: "VRAM warning", detail: "RTX 5080 peaked at 15.8GB during batch inference", time: "28m ago" },
  { color: "bg-green-400", text: "Model exported", detail: "slacker_alien_style_v2 → /output 398MB .safetensors", time: "1h ago" },
  { color: "bg-accent-purple", text: "Workflow saved", detail: "desert_pursuit_ltx_v1 — 14 nodes", time: "2h ago" },
  { color: "bg-muted", text: "Dataset upload", detail: "subway_breach_set: 1,240 images queued for captioning", time: "3h ago" },
];

export function ActivityLog() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">Activity Log</h3>
        <button className="font-mono text-xs text-muted tracking-widest uppercase">Clear</button>
      </div>
      {LOG.map((l, i) => (
        <div key={i} className="flex items-start gap-2.5 px-5 py-3 border-b border-border last:border-b-0">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${l.color}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-text font-medium">{l.text}</div>
            <div className="text-xs text-muted mt-0.5 leading-snug">{l.detail}</div>
          </div>
          <span className="font-mono text-xs text-muted tracking-wide flex-shrink-0 mt-0.5">{l.time}</span>
        </div>
      ))}
    </div>
  );
}
