const MODELS = [
  { icon: "🎬", name: "highway_ghost_v3.safetensors", sub: "FLUX LoRA · rank 32 · 847MB · trained 2h ago", tag: "LORA", tagColor: "bg-accent/8 text-accent", bg: "bg-accent/10" },
  { icon: "👾", name: "fat_bigfoot_character_v4", sub: "SDXL LoRA · rank 16 · 412MB · trained 6h ago", tag: "LORA", tagColor: "bg-accent/8 text-accent", bg: "bg-accent-purple/10" },
  { icon: "🛸", name: "slacker_alien_style_v2", sub: "SDXL LoRA · rank 16 · 398MB · trained yesterday", tag: "LORA", tagColor: "bg-accent/8 text-accent", bg: "bg-accent-orange/10" },
  { icon: "⚡", name: "ltx-video-2.3-distilled.gguf", sub: "Base Model · LTX Video · 8.4GB · downloaded 2d ago", tag: "VIDEO", tagColor: "bg-accent-orange/8 text-orange-400", bg: "bg-accent/10" },
  { icon: "🧠", name: "flux1-dev-fp8.safetensors", sub: "Base Model · FLUX · 12.1GB · downloaded 3d ago", tag: "BASE", tagColor: "bg-accent-purple/8 text-purple-400", bg: "bg-accent-purple/10" },
];

export function ModelList() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">Recent Models</h3>
        <button className="font-mono text-xs text-accent tracking-widest uppercase">Library →</button>
      </div>
      {MODELS.map((m) => (
        <div key={m.name} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-white/2 transition-colors cursor-pointer">
          <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center text-xl flex-shrink-0`}>{m.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text font-medium truncate">{m.name}</div>
            <div className="font-mono text-xs text-muted mt-0.5 tracking-wide">{m.sub}</div>
          </div>
          <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest flex-shrink-0 ${m.tagColor}`}>{m.tag}</span>
        </div>
      ))}
    </div>
  );
}
