const MODELS = [
  {
    icon: "🎬",
    name: "highway_ghost_v3.safetensors",
    sub: "FLUX LoRA · rank 32 · 847MB · trained 2h ago",
    tag: "LORA",
    tagColor: "bg-accent/8 text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: "🎨",
    name: "highway_ghost_style_v3",
    sub: "FLUX LoRA · rank 32 · 280MB · trained 12h ago",
    tag: "LORA",
    tagColor: "bg-accent/8 text-accent",
    bg: "bg-accent-purple/10",
  },
  {
    icon: "⚡",
    name: "ltx-video-2.3-distilled.gguf",
    sub: "Base Model · LTX Video · 8.4GB · downloaded 2d ago",
    tag: "VIDEO",
    tagColor: "bg-accent-orange/8 text-orange-400",
    bg: "bg-accent/10",
  },
  {
    icon: "🧠",
    name: "flux1-dev-fp8.safetensors",
    sub: "Base Model · FLUX · 12.1GB · downloaded 3d ago",
    tag: "BASE",
    tagColor: "bg-accent-purple/8 text-purple-400",
    bg: "bg-accent-purple/10",
  },
];

export function ModelList() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-syne text-sm font-bold text-white">
          Recent Models
        </h3>
        <button className="font-mono text-xs uppercase tracking-widest text-accent">
          Library →
        </button>
      </div>
      {MODELS.map((m) => (
        <div
          key={m.name}
          className="hover:bg-white/2 flex cursor-pointer items-center gap-3 border-b border-border px-5 py-3 transition-colors last:border-b-0"
        >
          <div
            className={`h-9 w-9 rounded-lg ${m.bg} flex flex-shrink-0 items-center justify-center text-xl`}
          >
            {m.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-text truncate text-sm font-medium">
              {m.name}
            </div>
            <div className="mt-0.5 font-mono text-xs tracking-wide text-muted">
              {m.sub}
            </div>
          </div>
          <span
            className={`flex-shrink-0 rounded-sm px-2 py-0.5 font-mono text-xs tracking-widest ${m.tagColor}`}
          >
            {m.tag}
          </span>
        </div>
      ))}
    </div>
  );
}
