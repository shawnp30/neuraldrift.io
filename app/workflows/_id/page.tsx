"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  WORKFLOWS,
  type HardwareTier,
  type WorkflowParam,
} from "@/data/workflows";
import { WORKFLOWS as WORKFLOWS_DATA } from "@/lib/workflowsData";
import { RequirementsPanel } from "@/components/dashboard/RequirementsPanel";

const TIER_ORDER: HardwareTier[] = ["8gb", "12gb", "16gb", "24gb"];

const TIER_STYLES: Record<
  HardwareTier,
  { border: string; bg: string; label: string; dot: string }
> = {
  "8gb": {
    border: "border-[#a3e635]/20",
    bg: "bg-[#a3e635]/5",
    label: "text-[#a3e635]",
    dot: "bg-[#a3e635]",
  },
  "12gb": {
    border: "border-[#f97316]/20",
    bg: "bg-[#f97316]/5",
    label: "text-[#f97316]",
    dot: "bg-[#f97316]",
  },
  "16gb": {
    border: "border-[#00e5ff]/20",
    bg: "bg-[#00e5ff]/5",
    label: "text-[#00e5ff]",
    dot: "bg-[#00e5ff]",
  },
  "24gb": {
    border: "border-[#a78bfa]/20",
    bg: "bg-[#a78bfa]/5",
    label: "text-[#a78bfa]",
    dot: "bg-[#a78bfa]",
  },
};

const DIFF_STYLES: Record<string, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

// Auto-generate hardware profiles for the 50 workflowsData entries
function makeProfiles(vram: string) {
  const vramNum = parseInt(vram);
  const base = {
    steps: 25,
    cfg: 7.0,
    denoise: 1,
    sampler: "dpmpp_2m",
    scheduler: "karras",
    batchSize: 1,
    extraFlags: [] as string[],
    frames: undefined as number | undefined,
    motionScale: undefined as number | undefined,
  };
  return {
    "8gb": {
      tier: "8gb" as HardwareTier,
      label: "8GB Safe",
      vram: "8GB",
      gpuExamples: ["RTX 3070", "RTX 4060", "GTX 1660 Ti"],
      width: 512,
      height: 512,
      ...base,
      extraFlags: ["--lowvram", "--cpu-vae"],
      qualityNote:
        vramNum > 8
          ? `Targets ${vram} VRAM. At 8GB, reduce resolution or steps in ComfyUI.`
          : "Optimised for 8GB cards.",
      estimatedTime: "60–120s",
    },
    "12gb": {
      tier: "12gb" as HardwareTier,
      label: "12GB Balanced",
      vram: "12GB",
      gpuExamples: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 10GB"],
      width: 768,
      height: 768,
      ...base,
      extraFlags: ["--lowvram"],
      qualityNote:
        vramNum > 12
          ? `Targets ${vram} VRAM. At 12GB, reduce steps or resolution.`
          : "Good balance of quality and speed.",
      estimatedTime: "30–60s",
    },
    "16gb": {
      tier: "16gb" as HardwareTier,
      label: "16GB Recommended",
      vram: "16GB",
      gpuExamples: ["RTX 3080 16GB", "RTX 4080", "RTX 5080"],
      width: 1024,
      height: 1024,
      ...base,
      extraFlags: ["--gpu-only"],
      qualityNote: "Full quality. Recommended tier for this workflow.",
      estimatedTime: "15–30s",
    },
    "24gb": {
      tier: "24gb" as HardwareTier,
      label: "24GB Max Quality",
      vram: "24GB",
      gpuExamples: ["RTX 3090", "RTX 4090", "RTX 5090"],
      width: 1024,
      height: 1024,
      ...base,
      steps: 30,
      extraFlags: ["--gpu-only", "--highvram"],
      qualityNote: "Maximum quality. Increase batch size for extra throughput.",
      estimatedTime: "10–20s",
    },
  };
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const richWorkflow = WORKFLOWS.find((w) => w.id === id);
  const simpleWorkflow = !richWorkflow
    ? WORKFLOWS_DATA.find((w) => w.id === id)
    : null;

  const [selectedTier, setSelectedTier] = useState<HardwareTier>("16gb");
  const [activeTab, setActiveTab] = useState<
    "overview" | "configure" | "models" | "troubleshoot"
  >("overview");
  const [paramValues, setParamValues] = useState<
    Record<string, string | number | boolean>
  >(() => {
    const defaults: Record<string, string | number | boolean> = {};
    richWorkflow?.configurableParams.forEach((p) => {
      defaults[p.id] = p.default;
    });
    return defaults;
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportError, setExportError] = useState("");
  const [copied, setCopied] = useState(false);

  const richProfile = useMemo(
    () => richWorkflow?.hardwareProfiles[selectedTier],
    [richWorkflow, selectedTier]
  );
  const simpleProfiles = useMemo(
    () => (simpleWorkflow ? makeProfiles(simpleWorkflow.vram) : null),
    [simpleWorkflow]
  );
  const simpleProfile = simpleProfiles?.[selectedTier];

  if (!richWorkflow && !simpleWorkflow) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-10 pb-20 pt-24 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
            404
          </p>
          <h1 className="mb-4 font-syne text-4xl font-black text-white">
            Workflow not found
          </h1>
          <Link
            href="/workflows"
            className="font-mono text-sm text-accent hover:underline"
          >
            ← Back to workflows
          </Link>
        </main>
      </>
    );
  }

  // Shared export handler — fetches pre-built JSON from public/workflows/
  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      const res = await fetch(`/workflows/${id}.json`);
      if (!res.ok) throw new Error(`File not found (${res.status})`);
      const json = await res.text();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuraldrift_${id}_${selectedTier}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      setExportError("Export failed. Please try again.");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // ── SIMPLE page for the 50 workflowsData entries ─────────────────────────
  if (simpleWorkflow && simpleProfile && simpleProfiles) {
    const tierStyle = TIER_STYLES[selectedTier];
    return (
      <>
        <Navbar />
        <main className="pb-20 pt-20">
          <div className="mx-auto max-w-7xl border-b border-border px-10 pb-8 pt-6">
            <Link
              href="/workflows"
              className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              ← Workflow Library
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-sm bg-[rgba(0,229,255,0.08)] px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-accent">
                    {simpleWorkflow.category}
                  </span>
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${DIFF_STYLES[simpleWorkflow.difficulty] ?? "bg-white/5 text-muted"}`}
                  >
                    {simpleWorkflow.difficulty}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {simpleWorkflow.version}
                  </span>
                </div>
                <h1 className="mb-2 font-syne text-4xl font-black tracking-tight text-white">
                  {simpleWorkflow.title}
                </h1>
                <p className="text-lg font-light text-muted">
                  {simpleWorkflow.description}
                </p>
              </div>
              <div className="ml-8 flex flex-shrink-0 gap-3">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 rounded bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {exporting
                    ? "Building..."
                    : exported
                      ? "✓ Downloaded!"
                      : "⬇ Export ComfyUI JSON"}
                </button>
              </div>
            </div>
            {exportError && (
              <p className="mt-3 font-mono text-xs text-red-400">
                {exportError}
              </p>
            )}
          </div>

          <div className="mx-auto mt-8 grid max-w-7xl grid-cols-[1fr_340px] items-start gap-8 px-10">
            <div className="space-y-8">
              <div>
                <h2 className="mb-3 font-syne text-xl font-bold text-white">
                  About this workflow
                </h2>
                <p className="leading-relaxed text-muted">
                  {simpleWorkflow.longDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {simpleWorkflow.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/4 rounded px-3 py-1.5 font-mono text-xs tracking-wide text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 font-syne text-lg font-bold text-white">
                  Required Model
                </h2>
                <p className="mb-1 font-mono text-sm text-accent">
                  {simpleWorkflow.model}
                </p>
                <p className="font-mono text-xs text-muted">
                  Place in:{" "}
                  <span className="text-text">ComfyUI/models/checkpoints/</span>
                </p>
                {simpleWorkflow.customNodes.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
                      Custom Nodes Required
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {simpleWorkflow.customNodes.map((node) => (
                        <span
                          key={node}
                          className="rounded border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted"
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 font-syne text-lg font-bold text-white">
                  Benchmark (RTX 5080)
                </h2>
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="mb-1 text-muted">Gen Time</p>
                    <p className="text-sm font-bold text-accent">
                      {simpleWorkflow.genTime}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="mb-1 text-muted">Resolution</p>
                    <p className="text-sm font-bold text-white">
                      {simpleWorkflow.resolution}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-syne text-sm font-bold text-white">
                    Hardware Profile
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    Settings adjust to your GPU tier
                  </p>
                </div>
                <div className="space-y-2 p-3">
                  {TIER_ORDER.map((tier) => {
                    const p = simpleProfiles[tier];
                    const style = TIER_STYLES[tier];
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedTier === tier
                            ? `${style.border} ${style.bg}`
                            : "hover:bg-white/2 border-border hover:border-accent/20"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${style.dot}`}
                            />
                            <span
                              className={`font-mono text-xs font-medium ${selectedTier === tier ? style.label : "text-text"}`}
                            >
                              {p.label}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted">
                            {p.estimatedTime}
                          </span>
                        </div>
                        <p className="ml-4 font-mono text-xs leading-relaxed text-muted">
                          {p.gpuExamples.slice(0, 2).join(", ")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`rounded-xl border p-5 ${tierStyle.border} ${tierStyle.bg}`}
              >
                <p
                  className={`mb-3 font-mono text-xs uppercase tracking-widest ${tierStyle.label}`}
                >
                  {simpleProfile.label} — Specs
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <SpecRow
                    label="Resolution"
                    value={`${simpleProfile.width}×${simpleProfile.height}`}
                  />
                  <SpecRow label="Steps" value={String(simpleProfile.steps)} />
                  <SpecRow label="CFG" value={String(simpleProfile.cfg)} />
                  <SpecRow label="Sampler" value={simpleProfile.sampler} />
                  <SpecRow label="Scheduler" value={simpleProfile.scheduler} />
                  <div className="border-t border-white/10 pt-2">
                    <SpecRow
                      label="Flags"
                      value={simpleProfile.extraFlags.join(" ") || "none"}
                    />
                  </div>
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="font-mono text-xs leading-relaxed text-muted">
                    {simpleProfile.qualityNote}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-accent/20 bg-card p-5">
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
                  Export Package
                </p>
                <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-muted">
                  <p>✓ Real ComfyUI node graph JSON</p>
                  <p>✓ Hardware settings baked in</p>
                  <p>✓ Launch flags in metadata note</p>
                  <p>✓ Load directly in ComfyUI</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full rounded bg-accent py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {exporting
                    ? "Building JSON..."
                    : exported
                      ? "✓ Downloaded!"
                      : "⬇ Download ComfyUI JSON"}
                </button>
                {exportError && (
                  <p className="mt-2 font-mono text-xs text-red-400">
                    {exportError}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-accent-purple/15 bg-gradient-to-br from-accent-purple/5 to-transparent p-5">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#a78bfa]">
                  {"// Hardware"}
                </p>
                <p className="mb-3 text-sm leading-relaxed text-muted">
                  Not sure your rig can handle this? Plan your upgrade on
                  ComputeAtlas.
                </p>
                <a
                  href="https://computeatlas.ai/ai-hardware-estimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-accent-purple/8 block rounded border border-accent-purple/20 px-4 py-2 text-center font-mono text-xs tracking-wider text-[#a78bfa] transition-colors"
                >
                  Hardware Estimator →
                </a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── RICH page for the 4 data/workflows.ts entries ────────────────────────
  const workflow = richWorkflow!;
  const profile = richProfile!;
  const primaryModel = workflow.requiredModels.find(
    (m) => m.required && m.type === "checkpoint"
  );
  const tierStyle = TIER_STYLES[selectedTier];

  const handleCopySettings = () => {
    const settings = {
      workflow: workflow.title,
      hardware_tier: selectedTier,
      model: primaryModel?.filename,
      profile: {
        resolution: `${profile.width}×${profile.height}`,
        steps: profile.steps,
        cfg: profile.cfg,
        sampler: profile.sampler,
        scheduler: profile.scheduler,
        denoise: profile.denoise,
        batch_size: profile.batchSize,
        ...(profile.frames && { frames: profile.frames }),
        ...(profile.motionScale && { motion_scale: profile.motionScale }),
      },
      launch_flags: profile.extraFlags.join(" "),
      estimated_time: profile.estimatedTime,
      params: paramValues,
    };
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateParam = (paramId: string, value: string | number | boolean) => {
    setParamValues((prev) => ({ ...prev, [paramId]: value }));
  };

  return (
    <>
      <Navbar />
      <main className="pb-20 pt-20">
        <div className="mx-auto max-w-7xl border-b border-border px-10 pb-8 pt-6">
          <Link
            href="/workflows"
            className="mb-6 inline-block font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            ← Workflow Library
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-sm bg-[rgba(0,229,255,0.08)] px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-accent">
                  {workflow.category}
                </span>
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${DIFF_STYLES[workflow.difficulty]}`}
                >
                  {workflow.difficulty}
                </span>
                <span className="font-mono text-xs text-muted">
                  v{workflow.version}
                </span>
              </div>
              <h1 className="mb-2 font-syne text-4xl font-black tracking-tight text-white">
                {workflow.title}
              </h1>
              <p className="text-lg font-light text-muted">
                {workflow.tagline}
              </p>
            </div>
            <div className="ml-8 flex flex-shrink-0 gap-3">
              <button
                onClick={handleCopySettings}
                className="hover:text-text rounded border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/30"
              >
                {copied ? "✓ Copied" : "Copy Settings"}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 rounded bg-accent px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {exporting
                  ? "Building..."
                  : exported
                    ? "✓ Downloaded!"
                    : "⬇ Export ComfyUI JSON"}
              </button>
            </div>
          </div>
          {exportError && (
            <p className="mt-3 font-mono text-xs text-red-400">{exportError}</p>
          )}
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl grid-cols-[1fr_340px] items-start gap-8 px-10">
          <div>
            <div className="mb-8 flex w-fit gap-1 rounded-lg border border-border bg-surface p-1">
              {(
                ["overview", "configure", "models", "troubleshoot"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${activeTab === tab ? "border border-accent/15 bg-card text-accent" : "hover:text-text text-muted"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="mb-3 font-syne text-xl font-bold text-white">
                    What this workflow does
                  </h2>
                  <p className="leading-relaxed text-muted">
                    {workflow.description}
                  </p>
                </div>
                <div>
                  <h2 className="mb-3 font-syne text-xl font-bold text-white">
                    Who it&apos;s for
                  </h2>
                  <ul className="space-y-2">
                    {workflow.whoItsFor.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <span className="mt-0.5 flex-shrink-0 text-accent">
                          →
                        </span>{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="mb-4 font-syne text-xl font-bold text-white">
                    Setup steps
                  </h2>
                  <div className="space-y-3">
                    {workflow.setupSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="w-6 flex-shrink-0 text-center font-syne text-lg font-black text-accent/40">
                          {i + 1}
                        </span>
                        <p className="pt-0.5 text-sm leading-relaxed text-muted">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workflow.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/4 rounded px-3 py-1.5 font-mono text-xs tracking-wide text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "configure" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-1 font-syne text-lg font-bold text-white">
                    Configure Parameters
                  </h2>
                  <p className="mb-6 font-mono text-xs text-muted">
                    Values shown in the settings summary. Adjust nodes directly
                    in ComfyUI after download.
                  </p>
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
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 font-syne text-lg font-bold text-white">
                    Live Config Preview
                  </h2>
                  <div className="rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-loose text-slate-300">
                    <div>
                      <span className="text-muted">{"// "}{workflow.title}</span>
                    </div>
                    <div>
                      <span className="text-muted">{"// Hardware:"}</span>{" "}
                      <span className="text-accent">
                        {selectedTier} — {profile.label}
                      </span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-[#a78bfa]">model</span> ={" "}
                      <span className="text-[#a3e635]">
                        &quot;{primaryModel?.filename || "model.safetensors"}
                        &quot;
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">steps</span> ={" "}
                      <span className="text-[#f97316]">{profile.steps}</span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">cfg</span> ={" "}
                      <span className="text-[#f97316]">{profile.cfg}</span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">sampler</span> ={" "}
                      <span className="text-[#a3e635]">
                        &quot;{profile.sampler}&quot;
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">scheduler</span> ={" "}
                      <span className="text-[#a3e635]">
                        &quot;{profile.scheduler}&quot;
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">width</span> ={" "}
                      <span className="text-[#f97316]">{profile.width}</span>,{" "}
                      <span className="text-[#a78bfa]">height</span> ={" "}
                      <span className="text-[#f97316]">{profile.height}</span>
                    </div>
                    <div>
                      <span className="text-[#a78bfa]">batch</span> ={" "}
                      <span className="text-[#f97316]">
                        {profile.batchSize}
                      </span>
                    </div>
                    {profile.frames && (
                      <div>
                        <span className="text-[#a78bfa]">frames</span> ={" "}
                        <span className="text-[#f97316]">{profile.frames}</span>
                      </div>
                    )}
                    {paramValues.lora_enabled && (
                      <>
                        <div>&nbsp;</div>
                        <div>
                          <span className="text-[#a78bfa]">lora</span> ={" "}
                          <span className="text-[#a3e635]">
                            &quot;
                            {paramValues.lora_name || "your_lora.safetensors"}
                            &quot;
                          </span>
                        </div>
                        <div>
                          <span className="text-[#a78bfa]">lora_strength</span>{" "}
                          ={" "}
                          <span className="text-[#f97316]">
                            {paramValues.lora_strength}
                          </span>
                        </div>
                      </>
                    )}
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-muted">{"// flags: "}</span>
                      <span className="text-accent">
                        {profile.extraFlags.join(" ") || "none"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">{"// time: "}</span>
                      <span className="text-slate-400">
                        {profile.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="space-y-4">
                <h2 className="mb-4 font-syne text-xl font-bold text-white">
                  Required Models
                </h2>
                {workflow.requiredModels.map((model) => (
                  <div
                    key={model.filename}
                    className={`rounded-xl border bg-card p-5 ${model.required ? "border-border" : "border-border/50 opacity-80"}`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-syne text-base font-bold text-white">
                            {model.name}
                          </h3>
                          <span
                            className={`rounded px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${model.required ? "bg-accent/8 text-accent" : "bg-white/5 text-muted"}`}
                          >
                            {model.required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-accent">
                          {model.filename}
                        </p>
                      </div>
                      <span className="ml-4 flex-shrink-0 font-mono text-xs text-muted">
                        {model.sizeGB}GB
                      </span>
                    </div>
                    {model.notes && (
                      <p className="mb-3 font-mono text-xs leading-relaxed text-muted">
                        {model.notes}
                      </p>
                    )}
                    {model.downloadUrl && (
                      <a
                        href={model.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-accent/8 inline-block rounded border border-accent/20 px-4 py-2 font-mono text-xs tracking-wider text-accent transition-colors"
                      >
                        Download →
                      </a>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted">
                    Total required storage
                  </span>
                  <span className="font-syne text-xl font-black text-white">
                    {workflow.requiredModels
                      .filter((m) => m.required)
                      .reduce((a, m) => a + m.sizeGB, 0)
                      .toFixed(1)}
                    GB
                  </span>
                </div>
              </div>
            )}

            {activeTab === "troubleshoot" && (
              <div className="space-y-3">
                <h2 className="mb-4 font-syne text-xl font-bold text-white">
                  Troubleshooting
                </h2>
                {workflow.troubleshooting.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-[#ef4444]">
                        ✗
                      </span>
                      <h3 className="font-syne text-sm font-bold text-white">
                        {item.problem}
                      </h3>
                    </div>
                    <div className="ml-5 flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-[#10b981]">
                        →
                      </span>
                      <p className="text-sm leading-relaxed text-muted">
                        {item.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="font-syne text-sm font-bold text-white">
                  Hardware Profile
                </h3>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  Settings auto-adjust to your GPU
                </p>
              </div>
              <div className="space-y-2 p-3">
                {TIER_ORDER.map((tier) => {
                  const p = workflow.hardwareProfiles[tier];
                  const style = TIER_STYLES[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedTier === tier ? `${style.border} ${style.bg}` : "hover:bg-white/2 border-border hover:border-accent/20"}`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${style.dot}`}
                          />
                          <span
                            className={`font-mono text-xs font-medium ${selectedTier === tier ? style.label : "text-text"}`}
                          >
                            {p.label}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted">
                          {p.estimatedTime}
                        </span>
                      </div>
                      <p className="ml-4 font-mono text-xs leading-relaxed text-muted">
                        {p.gpuExamples.slice(0, 2).join(", ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 ${tierStyle.border} ${tierStyle.bg}`}
            >
              <p
                className={`mb-3 font-mono text-xs uppercase tracking-widest ${tierStyle.label}`}
              >
                {profile.label} — Specs
              </p>
              <div className="space-y-2 font-mono text-xs">
                <SpecRow
                  label="Resolution"
                  value={`${profile.width}×${profile.height}`}
                />
                <SpecRow label="Steps" value={String(profile.steps)} />
                <SpecRow label="CFG" value={String(profile.cfg)} />
                <SpecRow label="Sampler" value={profile.sampler} />
                <SpecRow label="Scheduler" value={profile.scheduler} />
                <SpecRow label="Denoise" value={String(profile.denoise)} />
                <SpecRow label="Batch" value={String(profile.batchSize)} />
                {profile.frames && (
                  <SpecRow label="Frames" value={String(profile.frames)} />
                )}
                {profile.motionScale && (
                  <SpecRow label="Motion" value={String(profile.motionScale)} />
                )}
                <div className="border-t border-white/10 pt-2">
                  <SpecRow
                    label="Flags"
                    value={profile.extraFlags.join(" ") || "none"}
                  />
                </div>
              </div>
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="font-mono text-xs leading-relaxed text-muted">
                  {profile.qualityNote}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
                Compatible GPUs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.gpuExamples.map((gpu) => (
                  <span
                    key={gpu}
                    className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs text-muted"
                  >
                    {gpu}
                  </span>
                ))}
              </div>
            </div>

            <RequirementsPanel workflowId={workflow.id} />

            <div className="rounded-xl border border-accent/20 bg-card p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
                Export Package
              </p>
              <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-muted">
                <p>✓ Real ComfyUI node graph JSON</p>
                <p>✓ Hardware settings baked in</p>
                <p>✓ Prompts and LoRA injected</p>
                <p>✓ Launch flags in metadata note</p>
                <p>✓ Load directly in ComfyUI</p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full rounded bg-accent py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {exporting
                  ? "Building JSON..."
                  : exported
                    ? "✓ Downloaded!"
                    : "⬇ Download ComfyUI JSON"}
              </button>
              <button
                onClick={handleCopySettings}
                className="hover:text-text mt-2 w-full rounded border border-border py-2.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/20"
              >
                {copied ? "✓ Copied" : "Copy Settings"}
              </button>
              {exportError && (
                <p className="mt-2 font-mono text-xs text-red-400">
                  {exportError}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-accent-purple/15 bg-gradient-to-br from-accent-purple/5 to-transparent p-5">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#a78bfa]">
                // Hardware
              </p>
              <p className="mb-3 text-sm leading-relaxed text-muted">
                Not sure your rig can handle this? Plan your upgrade on
                ComputeAtlas.
              </p>
              <div className="space-y-2">
                <a
                  href="https://computeatlas.ai/ai-hardware-estimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-accent-purple/8 block rounded border border-accent-purple/20 px-4 py-2 text-center font-mono text-xs tracking-wider text-[#a78bfa] transition-colors"
                >
                  Hardware Estimator →
                </a>
                <a
                  href="https://computeatlas.ai/recommended-builds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text block rounded border border-border px-4 py-2 text-center font-mono text-xs tracking-wider text-muted transition-colors hover:border-accent-purple/20"
                >
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
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-widest text-accent">
          {param.label}
        </label>
        {param.type === "range" && (
          <span className="font-syne text-sm font-bold text-white">
            {value}
          </span>
        )}
      </div>
      <p className="mb-2 font-mono text-xs leading-relaxed text-muted">
        {param.description}
      </p>
      {param.type === "text" && (
        <textarea
          rows={3}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="text-text w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed transition-colors focus:border-accent/50 focus:outline-none"
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
          <div className="mt-0.5 flex justify-between font-mono text-xs text-muted">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </>
      )}
      {param.type === "number" && (
        <input
          type="number"
          value={Number(value)}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="text-text w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm transition-colors focus:border-accent/50 focus:outline-none"
        />
      )}
      {param.type === "toggle" && (
        <button
          onClick={() => onChange(!value)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${value ? "border-accent/20 bg-accent/10 text-accent" : "hover:text-text border-border bg-surface text-muted"}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${value ? "bg-accent" : "bg-muted"}`}
          />
          {value ? "Enabled" : "Disabled"}
        </button>
      )}
      <p className="mt-1.5 font-mono text-xs tracking-wide text-muted/50">
        affects: {param.affects}
      </p>
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
