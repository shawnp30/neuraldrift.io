const JOBS = [
  { name: "FLUX LoRA — highway_ghost_v3", meta: "TRAINING · rank=32 · epoch 7/10 · RTX 5080", status: "running", progress: 68 },
  { name: "LTX Video — Desert Pursuit batch", meta: "INFERENCE · 12 frames · RTX 3080", status: "running", progress: 41 },
  { name: "Dataset caption — subway_breach_set", meta: "QUEUED · 1,240 images · WD14 tagger", status: "queued", progress: 0 },
  { name: "AnimateDiff — fat_bigfoot_loop_v2", meta: "COMPLETE · 24 frames · 4m 11s", status: "done", progress: 100 },
  { name: "SDXL — slacker_alien_concept_sheet", meta: "COMPLETE · 8 images · 52s", status: "done", progress: 100 },
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">Job Queue</h3>
        <button className="font-mono text-xs text-accent tracking-widest uppercase">View All →</button>
      </div>
      {JOBS.map((job) => (
        <div key={job.name} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-white/2 transition-colors cursor-pointer">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[job.status]}`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text truncate font-medium">{job.name}</div>
            <div className="font-mono text-xs text-muted mt-0.5 tracking-wider">{job.meta}</div>
          </div>
          <div className="w-20 flex-shrink-0">
            <div className="h-0.5 bg-border rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full ${BAR_COLOR[job.status]}`} style={{ width: `${job.progress}%` }} />
            </div>
            <div className={`font-mono text-xs text-right tracking-wide ${job.status === "done" ? "text-green-400" : "text-muted"}`}>
              {job.status === "done" ? "✓" : job.status === "queued" ? "—" : `${job.progress}%`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
