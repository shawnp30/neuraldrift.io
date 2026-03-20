"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WORKFLOWS, type HardwareTier, type WorkflowParam } from "@/data/workflows";

const TIER_ORDER: HardwareTier[] = ["8gb", "12gb", "16gb", "24gb"];

const TIER_STYLES: Record<HardwareTier, { border: string; bg: string; label: string; dot: string }> = {
  "8gb":  { border: "border-[#a3e635]/20", bg: "bg-[#a3e635]/5",  label: "text-[#a3e635]",  dot: "bg-[#a3e635]"  },
  "12gb": { border: "border-[#f97316]/20", bg: "bg-[#f97316]/5",  label: "text-[#f97316]",  dot: "bg-[#f97316]"  },
  "16gb": { border: "border-[#00e5ff]/20", bg: "bg-[#00e5ff]/5",  label: "text-[#00e5ff]",  dot: "bg-[#00e5ff]"  },
  "24gb": { border: "border-[#a78bfa]/20", bg: "bg-[#a78bfa]/5",  label: "text-[#a78bfa]",  dot: "bg-[#a78bfa]"  },
};

const DIFF_STYLES: Record<string, string> = {
  Beginner:     "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced:     "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

// ── Export Engine ─────────────────────────────────────────────────────────────
function buildWorkflowJSON(
  templateId: string,
  tier: HardwareTier,
  params: Record<string, string | number | boolean>,
  workflow: ReturnType<typeof WORKFLOWS[0]["hardwareProfiles"]["8gb"]["tier"]>
): string {
  // In production this would load the actual template JSON
  // For now we produce a clean config object that ComfyUI can use
  const profile = (window as unknown as Record<string, unknown>).__wf_profile as Record<string, unknown> || {};

  const config = {
    _neuralhub: {
      workflow_id: templateId,
      exported_at: new Date().toISOString(),
      hardware_tier: tier,
      generator: "NeuralHub.ai Workflow Configurator",
    },
    checkpoint: {
      ckpt_name: "__REPLACE_WITH_YOUR_MODEL__",
    },
    positive_prompt: params.positive_prompt || "",
    negative_prompt: params.negative_prompt || "",
    sampler: {
      seed: params.seed === -1 ? Math.floor(Math.random() * 9999999999) : params.seed,
      steps: profile.steps,
      cfg: profile.cfg,
      sampler_name: profile.sampler,
      scheduler: profile.scheduler,
      denoise: profile.denoise,
    },
    latent_image: {
      width: profile.width,
      height: profile.height,
      batch_size: profile.batchSize,
    },
    ...(profile.frames !== undefined && {
      video: {
        frames: profile.frames,
        motion_scale: params.motion_scale || profile.motionScale,
      },
    }),
    ...(params.lora_enabled && {
      lora: {
        lora_name: params.lora_name || "your_lora.safetensors",
        strength_model: params.lora_strength || 0.8,
        strength_clip: params.lora_strength || 0.8,
      },
    }),
    launch_flags: profile.extraFlags,
  };

  return JSON.stringify(config, null, 2);
}

// ── Page Component ────────────────────────────────────────────────────────────
export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const workflow = WORKFLOWS.find((w) => w.id === id);

  const [selectedTier, setSelectedTier] = useState<HardwareTier>("16gb");
  const [activeTab, setActiveTab] = useState<"overview" | "configure" | "models" | "troubleshoot">("overview");
  const [paramValues, setParamValues] = useState<Record<string, string | number | boolean>>(() => {
    const defaults: Record<string, string | number | boolean> = {};
    workflow?.configurableParams.forEach((p) => { defaults[p.id] = p.default; });
    return defaults;
  });
  const [exported, setExported] = useState(false);
  const [copied, setCopied] = useState(false);

  const profile = useMemo(() => workflow?.hardwareProfiles[selectedTier], [workflow, selectedTier]);

  if (!workflow || !profile) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-20 px-10 max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">404</p>
          <h1 className="font-syne text-4xl font-black text-white mb-4">Workflow not found</h1>
          <Link href="/workflows" className="text-accent hover:underline font-mono text-sm">← Back to workflows</Link>
        </main>
        <Footer />
      </>
    );
  }

  const handleExport = () => {
    // Store profile for export engine
    (window as unknown as Record<string, unknown>).__wf_profile = profile;

    const json = buildWorkflowJSON(workflow.id, selectedTier, paramValues, profile as unknown as ReturnType<typeof WORKFLOWS[0]["hardwareProfiles"]["8gb"]["tier"]>);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuralhub_${workflow.id}_${selectedTier}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleCopySettings = () => {
    const settings = {
      workflow: workflow.title,
      hardware_tier: selectedTier,
      profile: {
        resolution: `${profile.width}×${profile.height}`,
        steps: profile.steps,
        cfg: profile.cfg,
        sampler: profile.sampler,
        scheduler: profile.scheduler,
        denoise: profile.denoise,
        ...(profile.frames && { frames: profile.frames }),
        ...(profile.motionScale && { motion_scale: profile.motionScale }),
      },
      launch_flags: profile.extraFlags.join(" "),
      params: paramValues,
    };
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateParam = (id: string, value: string | number | boolean) => {
    setParamValues((prev) => ({ ...prev, [id]: value }));
  };

  const tierStyle = TIER_STYLES[selectedTier];

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20">

        {/* ── Header ── */}
        <div className="px-10 max-w-7xl mx-auto pt-6 pb-8 border-b border-border">
          <Link href="/workflows" className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors inline-block mb-6">
            ← Workflow Library
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase bg-[rgba(0,229,255,0.08)] text-accent`}>
                  {workflow.category}
                </span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[workflow.difficulty]}`}>
                  {workflow.difficulty}
                </span>
                <span className="font-mono text-xs text-muted">v{workflow.version}</span>
              </div>
              <h1 className="font-syne text-4xl font-black tracking-tight text-white mb-2">{workflow.title}</h1>
              <p className="text-muted text-lg font-light">{workflow.tagline}</p>
            </div>

            {/* Export buttons */}
            <div className="flex gap-3 flex-shrink-0 ml-8">
              <button
                onClick={handleCopySettings}
                className="border border-border text-muted px-5 py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:border-accent/30 hover:text-text transition-colors"
              >
                {copied ? "✓ Copied" : "Copy Settings"}
              </button>
              <button
                onClick={handleExport}
                className="bg-accent text-black px-6 py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity flex items-center gap-2"
              >
                {exported ? "✓ Downloaded!" : "⬇ Export JSON"}
              </button>
            </div>
          </div>
        </div>

        <div className="px-10 max-w-7xl mx-auto mt-8 grid grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── LEFT: Main content ── */}
          <div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 mb-8 w-fit">
              {(["overview", "configure", "models", "troubleshoot"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded font-mono text-xs tracking-widest uppercase transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-card text-accent border border-accent/15"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-syne text-xl font-bold text-white mb-3">What this workflow does</h2>
                  <p className="text-muted leading-relaxed">{workflow.description}</p>
                </div>

                <div>
                  <h2 className="font-syne text-xl font-bold text-white mb-3">Who it&apos;s for</h2>
                  <ul className="space-y-2">
                    {workflow.whoItsFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-muted text-sm">
                        <span className="text-accent mt-0.5 flex-shrink-0">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="font-syne text-xl font-bold text-white mb-4">Setup steps</h2>
                  <div className="space-y-3">
                    {workflow.setupSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="font-syne text-lg font-black text-accent/40 flex-shrink-0 w-6 text-center">{i + 1}</span>
                        <p className="text-muted text-sm leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag) => (
                    <span key={tag} className="font-mono text-xs bg-white/4 text-muted px-3 py-1.5 rounded tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONFIGURE TAB ── */}
            {activeTab === "configure" && (
              <div className="space-y-5">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-syne text-lg font-bold text-white mb-2">Configurable Parameters</h2>
                  <p className="font-mono text-xs text-muted mb-6">These values will be injected into your exported workflow JSON.</p>
                  <div className="space-y-6">
                    {workflow.configurableParams.map((param) => (
                      <ParamControl
                        key={param.id}
                        param={param}
                        value={paramValues[param.id]}
                        onChange={(v) => updateParam(param.id, v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Live config preview */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-syne text-lg font-bold text-white mb-4">Live Config Preview</h2>
                  <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs text-slate-300 leading-loose">
                    <div><span className="text-muted">// Hardware tier:</span> <span className="text-accent">{selectedTier}</span></div>
                    <div><span className="text-muted">steps:</span> <span className="text-[#f97316]">{profile.steps}</span></div>
                    <div><span className="text-muted">cfg:</span> <span className="text-[#f97316]">{profile.cfg}</span></div>
                    <div><span className="text-muted">sampler:</span> <span className="text-[#a3e635]">&quot;{profile.sampler}&quot;</span></div>
                    <div><span className="text-muted">scheduler:</span> <span className="text-[#a3e635]">&quot;{profile.scheduler}&quot;</span></div>
                    <div><span className="text-muted">width:</span> <span className="text-[#f97316]">{profile.width}</span></div>
                    <div><span className="text-muted">height:</span> <span className="text-[#f97316]">{profile.height}</span></div>
                    <div><span className="text-muted">batch_size:</span> <span className="text-[#f97316]">{profile.batchSize}</span></div>
                    {profile.frames && <div><span className="text-muted">frames:</span> <span className="text-[#f97316]">{profile.frames}</span></div>}
                    {paramValues.lora_enabled && (
                      <>
                        <div><span className="text-muted">lora_name:</span> <span className="text-[#a3e635]">&quot;{paramValues.lora_name || "your_lora.safetensors"}&quot;</span></div>
                        <div><span className="text-muted">lora_strength:</span> <span className="text-[#f97316]">{paramValues.lora_strength}</span></div>
                      </>
                    )}
                    <div><span className="text-muted">launch_flags:</span> <span className="text-accent">&quot;{profile.extraFlags.join(" ")}&quot;</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODELS TAB ── */}
            {activeTab === "models" && (
              <div className="space-y-4">
                <h2 className="font-syne text-xl font-bold text-white mb-4">Required Models</h2>
                {workflow.requiredModels.map((model) => (
                  <div key={model.filename} className={`bg-card border rounded-xl p-5 ${model.required ? "border-border" : "border-border/50 opacity-80"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-syne text-base font-bold text-white">{model.name}</h3>
                          <span className={`font-mono text-xs px-2 py-0.5 rounded tracking-widest uppercase ${
                            model.required ? "bg-accent/8 text-accent" : "bg-white/5 text-muted"
                          }`}>
                            {model.required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-accent">{model.filename}</p>
                      </div>
                      <span className="font-mono text-xs text-muted flex-shrink-0 ml-4">{model.sizeGB}GB</span>
                    </div>
                    {model.notes && (
                      <p className="font-mono text-xs text-muted mb-3 leading-relaxed">{model.notes}</p>
                    )}
                    {model.downloadUrl && (
                      <a
                        href={model.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-mono text-xs text-accent border border-accent/20 px-4 py-2 rounded hover:bg-accent/8 transition-colors tracking-wider"
                      >
                        Download from Hugging Face →
                      </a>
                    )}
                  </div>
                ))}

                {/* Total size */}
                <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted tracking-widest uppercase">Total required storage</span>
                  <span className="font-syne text-xl font-black text-white">
                    {workflow.requiredModels.filter(m => m.required).reduce((a, m) => a + m.sizeGB, 0).toFixed(1)}GB
                  </span>
                </div>
              </div>
            )}

            {/* ── TROUBLESHOOT TAB ── */}
            {activeTab === "troubleshoot" && (
              <div className="space-y-3">
                <h2 className="font-syne text-xl font-bold text-white mb-4">Troubleshooting</h2>
                {workflow.troubleshooting.map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-[#ef4444] flex-shrink-0 mt-0.5">✗</span>
                      <h3 className="font-syne text-sm font-bold text-white">{item.problem}</h3>
                    </div>
                    <div className="flex items-start gap-3 ml-5">
                      <span className="text-[#10b981] flex-shrink-0 mt-0.5">→</span>
                      <p className="text-muted text-sm leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Hardware configurator ── */}
          <div className="space-y-4">

            {/* Hardware profile selector */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-syne text-sm font-bold text-white">Hardware Profile</h3>
                <p className="font-mono text-xs text-muted mt-0.5">Select based on your GPU&apos;s VRAM</p>
              </div>
              <div className="p-3 space-y-2">
                {TIER_ORDER.map((tier) => {
                  const p = workflow.hardwareProfiles[tier];
                  const style = TIER_STYLES[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTier === tier
                          ? `${style.border} ${style.bg}`
                          : "border-border hover:border-accent/20 hover:bg-white/2"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <span className={`font-mono text-xs font-medium ${selectedTier === tier ? style.label : "text-text"}`}>
                            {p.label}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted">{p.estimatedTime}</span>
                      </div>
                      <p className="font-mono text-xs text-muted ml-4 leading-relaxed">{p.gpuExamples.slice(0, 2).join(", ")}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected profile specs */}
            <div className={`border rounded-xl p-5 ${tierStyle.border} ${tierStyle.bg}`}>
              <p className={`font-mono text-xs tracking-widest uppercase mb-3 ${tierStyle.label}`}>
                {profile.label} — Specs
              </p>
              <div className="space-y-2 font-mono text-xs">
                <SpecRow label="Resolution" value={`${profile.width}×${profile.height}`} />
                <SpecRow label="Steps" value={String(profile.steps)} />
                <SpecRow label="CFG" value={String(profile.cfg)} />
                <SpecRow label="Sampler" value={profile.sampler} />
                <SpecRow label="Scheduler" value={profile.scheduler} />
                <SpecRow label="Denoise" value={String(profile.denoise)} />
                <SpecRow label="Batch" value={String(profile.batchSize)} />
                {profile.frames && <SpecRow label="Frames" value={String(profile.frames)} />}
                {profile.motionScale && <SpecRow label="Motion" value={String(profile.motionScale)} />}
                <div className="pt-2 border-t border-white/10">
                  <SpecRow label="Flags" value={profile.extraFlags.join(" ") || "none"} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="font-mono text-xs text-muted leading-relaxed">{profile.qualityNote}</p>
              </div>
            </div>

            {/* Compatible GPUs */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="font-mono text-xs text-muted tracking-widest uppercase mb-3">Compatible GPUs</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.gpuExamples.map((gpu) => (
                  <span key={gpu} className="font-mono text-xs bg-surface border border-border text-muted px-2 py-1 rounded">
                    {gpu}
                  </span>
                ))}
              </div>
            </div>

            {/* Export CTA */}
            <div className="bg-card border border-accent/20 rounded-xl p-5">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">Export Package</p>
              <div className="space-y-2 text-xs text-muted font-mono mb-4 leading-relaxed">
                <p>✓ Customized workflow JSON</p>
                <p>✓ Hardware settings baked in</p>
                <p>✓ Your prompt values injected</p>
                <p>✓ Launch flags included</p>
                <p>✓ Ready to load in ComfyUI</p>
              </div>
              <button
                onClick={handleExport}
                className="w-full bg-accent text-black py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
              >
                {exported ? "✓ Downloaded!" : "⬇ Download Workflow JSON"}
              </button>
              <button
                onClick={handleCopySettings}
                className="w-full mt-2 border border-border text-muted py-2.5 rounded font-mono text-xs tracking-widest uppercase hover:text-text hover:border-accent/20 transition-colors"
              >
                {copied ? "✓ Copied" : "Copy Settings"}
              </button>
            </div>

            {/* Need better hardware */}
            <div className="bg-gradient-to-br from-accent-purple/5 to-transparent border border-accent-purple/15 rounded-xl p-5">
              <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-2">// Hardware</p>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Not sure if your rig can handle this workflow? Use ComputeAtlas to plan an upgrade.
              </p>
              <div className="space-y-2">
                <a href="https://computeatlas.ai/ai-hardware-estimator" target="_blank" rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-[#a78bfa] border border-accent-purple/20 px-4 py-2 rounded hover:bg-accent-purple/8 transition-colors tracking-wider">
                  Hardware Estimator →
                </a>
                <a href="https://computeatlas.ai/recommended-builds" target="_blank" rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-muted border border-border px-4 py-2 rounded hover:text-text hover:border-accent-purple/20 transition-colors tracking-wider">
                  Recommended Builds
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ParamControl({
  param,
  value,
  onChange,
}: {
  param: WorkflowParam;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="font-mono text-xs text-accent tracking-widest uppercase">{param.label}</label>
        {param.type === "range" && (
          <span className="font-syne text-sm font-bold text-white">{value}</span>
        )}
      </div>
      <p className="font-mono text-xs text-muted mb-2 leading-relaxed">{param.description}</p>

      {param.type === "text" && (
        <textarea
          rows={3}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-xs text-text font-mono focus:outline-none focus:border-accent/50 transition-colors resize-none leading-relaxed"
        />
      )}

      {param.type === "range" && (
        <>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={Number(value)}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-[#00e5ff]"
          />
          <div className="flex justify-between font-mono text-xs text-muted mt-0.5">
            <span>{param.min}</span><span>{param.max}</span>
          </div>
        </>
      )}

      {param.type === "number" && (
        <input
          type="number"
          value={Number(value)}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors"
        />
      )}

      {param.type === "toggle" && (
        <button
          onClick={() => onChange(!value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-xs tracking-widest uppercase transition-colors ${
            value
              ? "bg-accent/10 border-accent/20 text-accent"
              : "bg-surface border-border text-muted hover:text-text"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${value ? "bg-accent" : "bg-muted"}`} />
          {value ? "Enabled" : "Disabled"}
        </button>
      )}

      {param.type === "select" && (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text font-mono focus:outline-none focus:border-accent/50 transition-colors"
        >
          {param.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
          ))}
        </select>
      )}

      <p className="font-mono text-xs text-muted/50 mt-1.5 tracking-wide">affects: {param.affects}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
