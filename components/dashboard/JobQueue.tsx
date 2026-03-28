const JOBS = [
  {
    name: "FLUX LoRA — highway_ghost_v3",
    meta: "TRAINING · rank=32 · epoch 7/10 · RTX 5080",
    status: "running",
    progress: 68,
  },
  {
    name: "LTX Video — Desert Pursuit batch",
    meta: "INFERENCE · 12 frames · RTX 3080",
    status: "running",
    progress: 41,
  },
  {
    name: "Dataset caption — subway_breach_set",
    meta: "QUEUED · 1,240 images · WD14 tagger",
    status: "queued",
    progress: 0,
  },
  {
    name: "SDXL — highway_ghost_style_preview",
    meta: "COMPLETE · 8 images · 52s",
    status: "done",
    progress: 100,
  },
];

const STATUS_DOT: Record<string, string> = {
  running: "bg-accent shadow-[0_0_8px_rgba(0,229,255,0.5)] animate-pulse",
  queued: "bg-muted",
  done: "bg-green-400",
  error: "bg-red-500",
};
const BAR_COLOR: Record<string, string> = {
  running: "bg-accent",
  done: "bg-green-400",
  queued: "bg-muted",
  error: "bg-red-500",
};

export function JobQueue() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-syne text-sm font-bold text-white">Job Queue</h3>
        <button className="font-mono text-xs uppercase tracking-widest text-accent">
          View All →
        </button>
      </div>
      {JOBS.map((job) => (
        <div
          key={job.name}
          className="hover:bg-white/2 flex cursor-pointer items-center gap-3.5 border-b border-border px-5 py-3.5 transition-colors last:border-b-0"
        >
          <div
            className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[job.status]}`}
          />
          <div className="min-w-0 flex-1">
            <div className="text-text truncate text-sm font-medium">
              {job.name}
            </div>
            <div className="mt-0.5 font-mono text-xs tracking-wider text-muted">
              {job.meta}
            </div>
          </div>
          <div className="w-20 flex-shrink-0">
            <div className="mb-1 h-0.5 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${BAR_COLOR[job.status]}`}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div
              className={`text-right font-mono text-xs tracking-wide ${job.status === "done" ? "text-green-400" : "text-muted"}`}
            >
              {job.status === "done"
                ? "✓"
                : job.status === "queued"
                  ? "—"
                  : `${job.progress}%`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
