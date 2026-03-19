const STATS = [
  { label: "Active Jobs", value: "3", change: "↑ 2 from yesterday", up: true, icon: "⚡", color: "from-accent" },
  { label: "LoRAs Trained", value: "14", change: "↑ +3 this week", up: true, icon: "🔧", color: "from-accent-purple" },
  { label: "Videos Generated", value: "247", change: "↑ 18% vs last week", up: true, icon: "🎬", color: "from-green-500" },
  { label: "VRAM Peak", value: "14.2GB", change: "↓ 16GB budget", up: false, icon: "🖥️", color: "from-accent-orange" },
];

export function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STATS.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg p-5 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${s.color} to-transparent`} />
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-muted tracking-widest uppercase">{s.label}</span>
            <span className="text-base">{s.icon}</span>
          </div>
          <div className="font-syne text-3xl font-black text-white tracking-tight">{s.value}</div>
          <div className={`font-mono text-xs mt-1.5 tracking-wide ${s.up ? "text-green-400" : "text-red-400"}`}>{s.change}</div>
        </div>
      ))}
    </div>
  );
}
