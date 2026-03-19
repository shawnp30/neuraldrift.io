const GPUS = [
  { name: "RTX 5080 · Primary", util: 87, vramUsed: 14.2, vramTotal: 16, temp: 74, color: "from-accent-purple to-accent" },
  { name: "RTX 3080 · Laptop", util: 62, vramUsed: 9.9, vramTotal: 16, temp: 68, color: "bg-accent-orange" },
  { name: "GTX 1660 Ti · Aux", util: 4, vramUsed: 0.2, vramTotal: 6, temp: 41, color: "bg-muted" },
];

export function GPUMonitor() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">GPU Monitor</h3>
        <button className="font-mono text-xs text-accent tracking-widest uppercase">Details</button>
      </div>
      {GPUS.map((gpu) => (
        <div key={gpu.name} className="px-5 py-4 border-b border-border last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text font-medium">{gpu.name}</span>
            <span className="font-mono text-xs" style={{ color: gpu.util > 70 ? "#00e5ff" : gpu.util > 30 ? "#f97316" : "#4a5568" }}>{gpu.util > 5 ? `${gpu.util}%` : "Idle"}</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full bg-gradient-to-r ${gpu.color}`} style={{ width: `${gpu.util}%` }} />
          </div>
          <div className="flex gap-4 font-mono text-xs text-muted tracking-wide">
            <span>VRAM {gpu.vramUsed}/{gpu.vramTotal}GB</span>
            <span>Temp {gpu.temp}°C</span>
            <span>Util {gpu.util}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
