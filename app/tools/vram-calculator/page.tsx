"use client";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

// ── Data ────────────────────────────────────────────────────────────────────

const MODELS = [
  { id: "flux-dev-fp16", name: "FLUX Dev FP16", base: 24.0, type: "Image" },
  { id: "flux-dev-fp8", name: "FLUX Dev FP8", base: 12.1, type: "Image" },
  { id: "flux-dev-gguf-q4", name: "FLUX Dev GGUF Q4", base: 7.2, type: "Image" },
  { id: "flux-schnell-fp8", name: "FLUX Schnell FP8", base: 12.1, type: "Image" },
  { id: "flux-schnell-gguf", name: "FLUX Schnell GGUF Q4", base: 7.0, type: "Image" },
  { id: "sdxl-fp16", name: "SDXL 1.0 FP16", base: 6.5, type: "Image" },
  { id: "sdxl-fp8", name: "SDXL 1.0 FP8", base: 4.2, type: "Image" },
  { id: "sd15-fp16", name: "SD 1.5 FP16", base: 2.1, type: "Image" },
  { id: "sd15-fp8", name: "SD 1.5 FP8", base: 1.4, type: "Image" },
  { id: "ltx-video", name: "LTX Video 2.3", base: 8.4, type: "Video" },
  { id: "ltx-video-gguf", name: "LTX Video GGUF Q4", base: 5.1, type: "Video" },
  { id: "animatediff-sdxl", name: "AnimateDiff + SDXL", base: 9.2, type: "Animation" },
  { id: "animatediff-sd15", name: "AnimateDiff + SD1.5", base: 4.8, type: "Animation" },
  { id: "wan-21-14b", name: "Wan 2.1 14B", base: 18.5, type: "Video" },
  { id: "hunyuan-video", name: "HunyuanVideo", base: 22.0, type: "Video" },
];

const RESOLUTIONS = [
  { id: "512", label: "512×512", mult: 0.7 },
  { id: "768", label: "768×512", mult: 0.85 },
  { id: "1024", label: "1024×1024", mult: 1.0 },
  { id: "1280", label: "1280×720", mult: 1.15 },
  { id: "1536", label: "1536×1536", mult: 1.45 },
  { id: "2048", label: "2048×2048", mult: 2.1 },
];

const GPUS = [
  // Your rigs
  { name: "RTX 5080", vram: 16, yours: true },
  { name: "RTX 3080 16GB", vram: 16, yours: true },
  { name: "GTX 1660 Ti", vram: 6, yours: true },
  // RTX 50 series
  { name: "RTX 5090", vram: 32, yours: false },
  { name: "RTX 5070 Ti", vram: 16, yours: false },
  { name: "RTX 5070", vram: 12, yours: false },
  // RTX 40 series
  { name: "RTX 4090", vram: 24, yours: false },
  { name: "RTX 4080 Super", vram: 16, yours: false },
  { name: "RTX 4080", vram: 16, yours: false },
  { name: "RTX 4070 Ti Super", vram: 16, yours: false },
  { name: "RTX 4070 Ti", vram: 12, yours: false },
  { name: "RTX 4070 Super", vram: 12, yours: false },
  { name: "RTX 4070", vram: 12, yours: false },
  { name: "RTX 4060 Ti 16GB", vram: 16, yours: false },
  { name: "RTX 4060 Ti", vram: 8, yours: false },
  { name: "RTX 4060", vram: 8, yours: false },
  // RTX 30 series
  { name: "RTX 3090 Ti", vram: 24, yours: false },
  { name: "RTX 3090", vram: 24, yours: false },
  { name: "RTX 3080 Ti", vram: 12, yours: false },
  { name: "RTX 3080 10GB", vram: 10, yours: false },
  { name: "RTX 3070 Ti", vram: 8, yours: false },
  { name: "RTX 3070", vram: 8, yours: false },
  { name: "RTX 3060 Ti", vram: 8, yours: false },
  { name: "RTX 3060", vram: 12, yours: false },
  { name: "RTX 3060M", vram: 6, yours: false },
  // RTX 20 series
  { name: "RTX 2080 Ti", vram: 11, yours: false },
  { name: "RTX 2080 Super", vram: 8, yours: false },
  { name: "RTX 2070 Super", vram: 8, yours: false },
  { name: "GTX 1080 Ti", vram: 11, yours: false },
];

const BUILD_RECS = [
  {
    tier: "Budget Builder",
    range: "Under 12GB VRAM",
    gpu: "RTX 3060 12GB or RTX 4060 Ti 8GB",
    cpu: "Ryzen 5 7600X or Intel i5-13600K",
    ram: "32GB DDR5",
    notes: "Good for SD1.5, SDXL at reduced resolution, AnimateDiff. Struggles with FLUX.",
    maxVram: 12,
    color: "border-[#a3e635]/20 bg-[#a3e635]/3",
    labelColor: "text-[#a3e635]",
  },
  {
    tier: "Mid-Range Rig",
    range: "12–16GB VRAM",
    gpu: "RTX 4070 Ti / RTX 3080 16GB / RTX 4080",
    cpu: "Ryzen 7 7700X or Intel i7-13700K",
    ram: "64GB DDR5",
    notes: "Handles FLUX FP8, SDXL full resolution, LTX Video. Sweet spot for most workflows.",
    maxVram: 16,
    color: "border-[#f97316]/20 bg-[#f97316]/3",
    labelColor: "text-[#f97316]",
  },
  {
    tier: "Pro Build",
    range: "24GB VRAM",
    gpu: "RTX 4090 or RTX 3090",
    cpu: "Ryzen 9 7900X or Intel i9-13900K",
    ram: "64GB DDR5",
    notes: "FLUX FP16, HunyuanVideo, Wan 2.1 14B, large batch generation. No compromises.",
    maxVram: 24,
    color: "border-accent/20 bg-accent/3",
    labelColor: "text-accent",
  },
  {
    tier: "Beast Mode",
    range: "32GB+ VRAM",
    gpu: "RTX 5090 or dual GPU setup",
    cpu: "Ryzen 9 9950X3D (your chip!)",
    ram: "128GB DDR5",
    notes: "Everything runs. Multi-model pipelines, full-res video, massive batches. Future-proof.",
    maxVram: 99,
    color: "border-[#a78bfa]/20 bg-[#a78bfa]/3",
    labelColor: "text-[#a78bfa]",
  },
];

// ── VRAM estimation ──────────────────────────────────────────────────────────

function estimateVRAM(
  modelId: string,
  batchSize: number,
  resolutionMult: number,
  loraCount: number,
  loraStrength: number
): number {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return 0;

  let vram = model.base;

  // Resolution scaling (non-linear)
  vram *= resolutionMult;

  // Batch size scaling (sub-linear — shared weights)
  vram += (batchSize - 1) * model.base * 0.35;

  // LoRA overhead
  if (loraCount > 0) {
    const loraOverhead = loraCount * 0.4 * loraStrength;
    vram += loraOverhead;
  }

  // Overhead buffer (activations, gradients, OS)
  vram *= 1.12;

  return Math.round(vram * 10) / 10;
}

function getLaunchFlags(vram: number, availableVRAM: number): string[] {
  const flags: string[] = [];
  if (vram > availableVRAM * 0.9) flags.push("--lowvram");
  if (vram > availableVRAM * 1.1) flags.push("--cpu-vae");
  if (vram < availableVRAM * 0.7) flags.push("--highvram");
  if (vram > availableVRAM) flags.push("--disable-smart-memory");
  if (flags.length === 0) flags.push("--gpu-only");
  return flags;
}

function getStatus(vram: number, gpuVRAM: number): "green" | "yellow" | "red" {
  if (vram <= gpuVRAM * 0.85) return "green";
  if (vram <= gpuVRAM * 1.05) return "yellow";
  return "red";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function VRAMCalculatorPage() {
  const [modelId, setModelId] = useState("flux-dev-fp8");
  const [batchSize, setBatchSize] = useState(1);
  const [resolutionId, setResolutionId] = useState("1024");
  const [loraCount, setLoraCount] = useState(0);
  const [loraStrength, setLoraStrength] = useState(0.8);

  const resolution = RESOLUTIONS.find((r) => r.id === resolutionId)!;
  const estimatedVRAM = useMemo(
    () => estimateVRAM(modelId, batchSize, resolution.mult, loraCount, loraStrength),
    [modelId, batchSize, resolutionId, loraCount, loraStrength, resolution.mult]
  );

  const selectedModel = MODELS.find((m) => m.id === modelId)!;
  const overBudgetGPUs = GPUS.filter((g) => estimatedVRAM > g.vram);
  const recBuild = BUILD_RECS.find((b) => estimatedVRAM <= b.maxVram) || BUILD_RECS[BUILD_RECS.length - 1];

  const yourRigs = GPUS.filter((g) => g.yours);
  const otherGPUs = GPUS.filter((g) => !g.yours);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Tools</p>
          <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
            VRAM Calculator
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            Estimate exactly how much VRAM your AI workflow needs. Adjust model, resolution, batch size, and LoRA settings to see real-time estimates.
          </p>
        </div>

        <div className="grid grid-cols-[420px_1fr] gap-8 items-start">

          {/* ── LEFT: Controls ── */}
          <div className="space-y-5">

            {/* Model */}
            <div className="bg-card border border-border rounded-xl p-6">
              <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-4">
                01 — Select Model
              </label>
              <div className="space-y-1">
                {["Image", "Video", "Animation"].map((type) => (
                  <div key={type}>
                    <p className="font-mono text-xs text-muted tracking-widest uppercase px-2 py-2">{type}</p>
                    {MODELS.filter((m) => m.type === type).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModelId(m.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          modelId === m.id
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "text-muted hover:text-text hover:bg-white/4"
                        }`}
                      >
                        <span>{m.name}</span>
                        <span className="font-mono text-xs opacity-60">{m.base}GB base</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-card border border-border rounded-xl p-6">
              <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-4">
                02 — Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setResolutionId(r.id)}
                    className={`py-2.5 rounded-lg font-mono text-xs transition-colors ${
                      resolutionId === r.id
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "bg-surface border border-border text-muted hover:text-text"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch size */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="font-mono text-xs text-accent tracking-widest uppercase">
                  03 — Batch Size
                </label>
                <span className="font-syne text-2xl font-black text-white">{batchSize}</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full accent-[#00e5ff]"
              />
              <div className="flex justify-between font-mono text-xs text-muted mt-1">
                <span>1</span><span>4</span><span>8</span>
              </div>
            </div>

            {/* LoRA */}
            <div className="bg-card border border-border rounded-xl p-6">
              <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-4">
                04 — LoRA Injection
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-xs text-muted">LoRA Count</span>
                    <span className="font-syne font-black text-white">{loraCount}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={loraCount}
                    onChange={(e) => setLoraCount(Number(e.target.value))}
                    className="w-full accent-[#00e5ff]"
                  />
                  <div className="flex justify-between font-mono text-xs text-muted mt-1">
                    <span>0</span><span>5</span>
                  </div>
                </div>
                {loraCount > 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-xs text-muted">Avg Strength</span>
                      <span className="font-syne font-black text-white">{loraStrength.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={loraStrength}
                      onChange={(e) => setLoraStrength(Number(e.target.value))}
                      className="w-full accent-[#00e5ff]"
                    />
                    <div className="flex justify-between font-mono text-xs text-muted mt-1">
                      <span>0.1</span><span>1.0</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="space-y-5">

            {/* VRAM estimate hero */}
            <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent to-transparent" />
              <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Estimated VRAM Required</p>
              <div className="flex items-end gap-3 mb-1">
                <span className="font-syne text-7xl font-black text-white tracking-tight leading-none">
                  {estimatedVRAM}
                </span>
                <span className="font-syne text-3xl font-black text-muted mb-2">GB</span>
              </div>
              <p className="font-mono text-xs text-muted mt-2 tracking-wide">
                {selectedModel.name} · {resolution.label} · Batch {batchSize}
                {loraCount > 0 ? ` · ${loraCount} LoRA${loraCount > 1 ? "s" : ""} @ ${loraStrength}` : ""}
              </p>

              {/* Bar */}
              <div className="mt-6">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((estimatedVRAM / 32) * 100, 100)}%`,
                      background: estimatedVRAM > 24
                        ? "#ef4444"
                        : estimatedVRAM > 16
                        ? "#f97316"
                        : "#00e5ff",
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-xs text-muted mt-1">
                  <span>0GB</span><span>8GB</span><span>16GB</span><span>24GB</span><span>32GB</span>
                </div>
              </div>
            </div>

            {/* Your Rigs */}
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Your Rigs</p>
              <div className="space-y-3">
                {yourRigs.map((gpu) => {
                  const status = getStatus(estimatedVRAM, gpu.vram);
                  const flags = getLaunchFlags(estimatedVRAM, gpu.vram);
                  return (
                    <div key={gpu.name} className={`rounded-lg p-4 border ${
                      status === "green" ? "border-[#10b981]/20 bg-[#10b981]/5" :
                      status === "yellow" ? "border-[#f97316]/20 bg-[#f97316]/5" :
                      "border-[#ef4444]/20 bg-[#ef4444]/5"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            status === "green" ? "bg-[#10b981]" :
                            status === "yellow" ? "bg-[#f97316]" : "bg-[#ef4444]"
                          }`} />
                          <span className="font-syne text-sm font-bold text-white">{gpu.name}</span>
                          <span className="font-mono text-xs text-muted">{gpu.vram}GB VRAM</span>
                        </div>
                        <span className={`font-mono text-xs tracking-widest uppercase px-2 py-0.5 rounded ${
                          status === "green" ? "bg-[#10b981]/10 text-[#10b981]" :
                          status === "yellow" ? "bg-[#f97316]/10 text-[#f97316]" :
                          "bg-[#ef4444]/10 text-[#ef4444]"
                        }`}>
                          {status === "green" ? "✓ Runs" : status === "yellow" ? "⚠ Tight" : "✗ OOM"}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {flags.map((flag) => (
                          <span key={flag} className="font-mono text-xs bg-black/30 text-accent px-2 py-0.5 rounded tracking-wider">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full GPU compatibility */}
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Full GPU Compatibility</p>
              <div className="grid grid-cols-2 gap-1.5">
                {otherGPUs.map((gpu) => {
                  const status = getStatus(estimatedVRAM, gpu.vram);
                  return (
                    <div key={gpu.name} className="flex items-center justify-between px-3 py-2 rounded bg-surface border border-border">
                      <span className="font-mono text-xs text-muted">{gpu.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted">{gpu.vram}GB</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          status === "green" ? "bg-[#10b981]" :
                          status === "yellow" ? "bg-[#f97316]" : "bg-[#ef4444]"
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border font-mono text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Runs fine</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]" />Tight fit</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />OOM risk</span>
              </div>
            </div>

            {/* Recommended Build */}
            <div className={`border rounded-xl p-6 ${recBuild.color}`}>
              <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: recBuild.labelColor.replace("text-[", "").replace("]", "") }}>
                Recommended Build for {estimatedVRAM}GB
              </p>
              <h3 className="font-syne text-xl font-black text-white mb-1">{recBuild.tier}</h3>
              <p className="font-mono text-xs text-muted mb-4">{recBuild.range}</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex gap-3">
                  <span className="text-muted w-10 flex-shrink-0">GPU</span>
                  <span className="text-text">{recBuild.gpu}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted w-10 flex-shrink-0">CPU</span>
                  <span className="text-text">{recBuild.cpu}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted w-10 flex-shrink-0">RAM</span>
                  <span className="text-text">{recBuild.ram}</span>
                </div>
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  <span className="text-muted w-10 flex-shrink-0">Note</span>
                  <span className="text-muted leading-relaxed">{recBuild.notes}</span>
                </div>
              </div>
              <a
                href="https://computeatlas.ai/recommended-builds"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center border border-white/10 text-muted py-2 rounded text-xs font-mono tracking-widest uppercase hover:text-text hover:border-white/20 transition-colors"
              >
                Plan this build on ComputeAtlas →
              </a>
            </div>

            {/* ComputeAtlas CTA if over 16GB */}
            {estimatedVRAM > 16 && (
              <div className="bg-gradient-to-br from-accent-purple/8 to-accent/5 border border-accent-purple/25 rounded-xl p-6">
                <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-2">// Hardware Upgrade Path</p>
                <h3 className="font-syne text-xl font-black text-white mb-2">
                  Your rig needs {estimatedVRAM}GB — time to plan an upgrade.
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  ComputeAtlas is an AI workstation planning platform. Input your target workloads and it recommends exact hardware — GPU, CPU, RAM, and storage — before you buy.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="https://computeatlas.ai/ai-hardware-estimator"
                    target="_blank"
                    className="inline-block bg-accent-purple text-white px-5 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
                  >
                    Use Hardware Estimator →
                  </Link>
                  <Link
                    href="https://computeatlas.ai/recommended-builds"
                    target="_blank"
                    className="inline-block bg-white/5 border border-white/10 text-muted px-5 py-2.5 rounded font-semibold text-sm hover:text-text transition-colors"
                  >
                    Browse Recommended Builds
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
