"use client";
import { useState } from "react";

export interface HardwareInput {
  gpu_name: string;
  vram_gb: number;
  ram_gb: number;
  storage_free_gb: number;
  priority: "quality" | "speed" | "reliability" | "balanced";
}

interface Props {
  onSubmit: (hardware: HardwareInput) => void;
  loading?: boolean;
}

const GPU_PRESETS = [
  { label: "RTX 5090 (32GB)", gpu_name: "RTX 5090", vram_gb: 32 },
  { label: "RTX 5080 (16GB)", gpu_name: "RTX 5080", vram_gb: 16 },
  { label: "RTX 4090 (24GB)", gpu_name: "RTX 4090", vram_gb: 24 },
  { label: "RTX 4080 (16GB)", gpu_name: "RTX 4080", vram_gb: 16 },
  { label: "RTX 4070 Ti (12GB)", gpu_name: "RTX 4070 Ti", vram_gb: 12 },
  { label: "RTX 4070 (12GB)", gpu_name: "RTX 4070", vram_gb: 12 },
  { label: "RTX 3090 (24GB)", gpu_name: "RTX 3090", vram_gb: 24 },
  { label: "RTX 3080 16GB", gpu_name: "RTX 3080 16GB", vram_gb: 16 },
  { label: "RTX 3080 10GB", gpu_name: "RTX 3080 10GB", vram_gb: 10 },
  { label: "RTX 3060 (12GB)", gpu_name: "RTX 3060", vram_gb: 12 },
  { label: "GTX 1660 Ti (6GB)", gpu_name: "GTX 1660 Ti", vram_gb: 6 },
  { label: "Custom...", gpu_name: "", vram_gb: 0 },
];

const PRIORITY_OPTIONS = [
  { value: "quality",     label: "Max Quality",  desc: "Best possible output", icon: "✦" },
  { value: "balanced",    label: "Balanced",      desc: "Quality + stability",  icon: "◈" },
  { value: "speed",       label: "Speed",         desc: "Fastest generation",   icon: "⚡" },
  { value: "reliability", label: "Reliability",   desc: "Never crashes",        icon: "🛡" },
] as const;

export function HardwareForm({ onSubmit, loading }: Props) {
  const [selectedPreset, setSelectedPreset] = useState("RTX 5080 (16GB)");
  const [form, setForm] = useState<HardwareInput>({
    gpu_name: "RTX 5080",
    vram_gb: 16,
    ram_gb: 64,
    storage_free_gb: 500,
    priority: "balanced",
  });
  const [isCustom, setIsCustom] = useState(false);

  const handlePreset = (label: string) => {
    const preset = GPU_PRESETS.find(p => p.label === label);
    if (!preset) return;
    setSelectedPreset(label);
    if (label === "Custom...") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setForm(prev => ({ ...prev, gpu_name: preset.gpu_name, vram_gb: preset.vram_gb }));
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-syne text-sm font-bold text-white">Your Hardware</h3>
        <p className="font-mono text-xs text-muted mt-0.5">Tell us your GPU and we'll score every workflow</p>
      </div>

      <div className="p-5 space-y-5">
        {/* GPU selector */}
        <div>
          <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-2">GPU</label>
          <select
            value={selectedPreset}
            onChange={e => handlePreset(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors"
          >
            {GPU_PRESETS.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          {isCustom && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="GPU name (e.g. RTX 3070)"
                value={form.gpu_name}
                onChange={e => setForm(prev => ({ ...prev, gpu_name: e.target.value }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent/50"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="VRAM GB"
                  value={form.vram_gb || ""}
                  onChange={e => setForm(prev => ({ ...prev, vram_gb: Number(e.target.value) }))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text font-mono focus:outline-none focus:border-accent/50"
                />
                <span className="font-mono text-xs text-muted whitespace-nowrap">GB VRAM</span>
              </div>
            </div>
          )}
        </div>

        {/* RAM */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs text-accent tracking-widest uppercase">System RAM</label>
            <span className="font-syne text-sm font-bold text-white">{form.ram_gb}GB</span>
          </div>
          <input
            type="range" min={8} max={128} step={8}
            value={form.ram_gb}
            onChange={e => setForm(prev => ({ ...prev, ram_gb: Number(e.target.value) }))}
            className="w-full accent-[#00e5ff]"
          />
          <div className="flex justify-between font-mono text-xs text-muted mt-0.5">
            <span>8GB</span><span>64GB</span><span>128GB</span>
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-mono text-xs text-accent tracking-widest uppercase">Free Storage</label>
            <span className="font-syne text-sm font-bold text-white">{form.storage_free_gb}GB</span>
          </div>
          <input
            type="range" min={0} max={2000} step={50}
            value={form.storage_free_gb}
            onChange={e => setForm(prev => ({ ...prev, storage_free_gb: Number(e.target.value) }))}
            className="w-full accent-[#00e5ff]"
          />
          <div className="flex justify-between font-mono text-xs text-muted mt-0.5">
            <span>0</span><span>500GB</span><span>2TB</span>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-2">Priority</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(prev => ({ ...prev, priority: opt.value }))}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  form.priority === opt.value
                    ? "bg-accent/8 border-accent/20 text-accent"
                    : "bg-surface border-border text-muted hover:text-text hover:border-accent/10"
                }`}
              >
                <div className="font-mono text-sm mb-0.5">{opt.icon} {opt.label}</div>
                <div className="font-mono text-xs opacity-60">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.vram_gb}
          className="w-full bg-accent text-black py-3 rounded-lg font-semibold text-sm hover:opacity-85 transition-opacity disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Score All Workflows →"}
        </button>
      </div>
    </div>
  );
}
