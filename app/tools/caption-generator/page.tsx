"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";

type CaptionStyle = "wd14" | "natural" | "flux" | "training";

const STYLE_INFO: Record<
  CaptionStyle,
  { label: string; desc: string; example: string }
> = {
  wd14: {
    label: "WD14 / Danbooru Tags",
    desc: "Comma-separated tag format. Best for SDXL and SD1.5 LoRA training with Kohya.",
    example:
      "1girl, blonde hair, blue eyes, outdoor, sunlight, smile, solo, looking at viewer",
  },
  natural: {
    label: "Natural Language",
    desc: "Full sentence descriptions. Best for FLUX training and general captioning.",
    example:
      "A young woman with blonde hair and blue eyes smiling outdoors in warm sunlight.",
  },
  flux: {
    label: "FLUX Optimized",
    desc: "Descriptive natural language with emphasis on lighting, mood, and technical detail.",
    example:
      "Portrait of a young blonde woman with striking blue eyes, photographed outdoors in warm golden sunlight, natural smile, shallow depth of field.",
  },
  training: {
    label: "Training Dataset",
    desc: "Trigger word + tags format. Ready to paste into .txt files alongside your training images.",
    example:
      "mycharacterv1, 1girl, blonde hair, blue eyes, outdoor, sunlight, smile, solo",
  },
};

const QUICK_TEMPLATES = [
  {
    category: "Character — Portrait",
    prompts: [
      "Close-up portrait, facing camera, neutral expression, studio lighting",
      "Side profile, natural lighting, outdoor background",
      "3/4 angle, smiling, golden hour, shallow depth of field",
      "Looking away, dramatic lighting, dark background",
    ],
  },
  {
    category: "Character — Full Body",
    prompts: [
      "Full body standing, front view, plain background",
      "Walking pose, outdoor setting, casual clothing",
      "Action pose, dynamic angle, motion blur",
      "Seated, relaxed pose, indoor environment",
    ],
  },
  {
    category: "Style — Cinematic",
    prompts: [
      "Wide establishing shot, golden hour, film grain",
      "Low angle tracking shot, motion blur, neon lighting",
      "Aerial drone shot, expansive landscape, sunset",
      "Close-up detail shot, bokeh background, natural light",
    ],
  },
  {
    category: "Environment",
    prompts: [
      "Forest clearing, dappled sunlight, lush green foliage",
      "Urban street, rain-soaked asphalt, neon reflections",
      "Desert highway, golden dust, dramatic sky",
      "Suburban backyard, overcast day, mundane setting",
    ],
  },
];

function generateCaption(
  description: string,
  style: CaptionStyle,
  triggerWord: string,
): string {
  const desc = description.trim();
  if (!desc) return "";

  // Parse the description into components
  const lines = desc.split("\n").filter((l) => l.trim());

  if (style === "wd14") {
    // Convert to comma-separated tags
    const tags = lines
      .join(", ")
      .split(/[,.\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 1 && t.length < 40)
      .map((t) => t.replace(/\s+/g, " "));
    return [...new Set(tags)].join(", ");
  }

  if (style === "natural") {
    return lines
      .map((l) => {
        const s = l.trim();
        return s.endsWith(".") ? s : s + ".";
      })
      .join(" ");
  }

  if (style === "flux") {
    const content = lines.join(", ");
    return `${content}, photorealistic, high detail, professional photography.`;
  }

  if (style === "training") {
    const tags = lines
      .join(", ")
      .split(/[,.\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 1 && t.length < 40);
    const uniqueTags = [...new Set(tags)].join(", ");
    return triggerWord ? `${triggerWord}, ${uniqueTags}` : uniqueTags;
  }

  return desc;
}

function generateBatch(
  descriptions: string[],
  style: CaptionStyle,
  triggerWord: string,
): string[] {
  return descriptions.map((d) => generateCaption(d, style, triggerWord));
}

export default function CaptionGeneratorPage() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [style, setStyle] = useState<CaptionStyle>("wd14");
  const [triggerWord, setTriggerWord] = useState("");
  const [input, setInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [output, setOutput] = useState("");
  const [batchOutput, setBatchOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    if (mode === "single") {
      setOutput(generateCaption(input, style, triggerWord));
    } else {
      const lines = batchInput.split("\n\n").filter((l) => l.trim());
      setBatchOutput(generateBatch(lines, style, triggerWord));
    }
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const copyAllBatch = () => {
    const text = batchOutput.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const applyTemplate = (prompt: string) => {
    if (mode === "single") {
      setInput(prompt);
    } else {
      setBatchInput((prev) => (prev ? prev + "\n\n" + prompt : prompt));
    }
  };

  return (
    <>

      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
            {"// Tools"}
          </p>
          <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
            Caption Generator
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            Generate training-ready captions in WD14, natural language, FLUX, or
            dataset format. Paste your image descriptions and get formatted
            captions instantly.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-8">
          {/* ── LEFT: Main tool ── */}
          <div className="space-y-5">
            {/* Mode + Style */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                {/* Mode toggle */}
                <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setMode("single")}
                    className={`px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-colors ${
                      mode === "single"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMode("batch")}
                    className={`px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-colors ${
                      mode === "batch"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    Batch
                  </button>
                </div>

                <p className="font-mono text-xs text-muted">
                  {mode === "single"
                    ? "Generate one caption at a time"
                    : "Separate descriptions with blank lines"}
                </p>
              </div>

              {/* Style selector */}
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-3">
                Caption Style
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(Object.keys(STYLE_INFO) as CaptionStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      style === s
                        ? "bg-accent/8 border-accent/20 text-accent"
                        : "bg-surface border-border text-muted hover:text-text hover:border-accent/10"
                    }`}
                  >
                    <div className="font-mono text-xs font-medium mb-1">
                      {STYLE_INFO[s].label}
                    </div>
                    <div className="font-mono text-xs opacity-60 leading-relaxed">
                      {STYLE_INFO[s].desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Trigger word */}
              {(style === "training" || style === "wd14") && (
                <div className="mb-4">
                  <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-2">
                    Trigger Word (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mycharacterv1"
                    value={triggerWord}
                    onChange={(e) => setTriggerWord(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono transition-colors"
                  />
                </div>
              )}

              {/* Input */}
              <label className="font-mono text-xs text-accent tracking-widest uppercase block mb-2">
                {mode === "single"
                  ? "Image Description"
                  : "Image Descriptions (separate with blank lines)"}
              </label>
              {mode === "single" ? (
                <textarea
                  rows={6}
                  placeholder="Describe your image in plain English. Include subject, pose, expression, clothing, environment, lighting..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono transition-colors resize-none leading-relaxed"
                />
              ) : (
                <textarea
                  rows={10}
                  placeholder={
                    "Image 1: Woman with blonde hair outdoors in sunlight\n\nImage 2: Side profile, looking away, dramatic lighting\n\nImage 3: Full body shot, walking pose, city background"
                  }
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono transition-colors resize-none leading-relaxed"
                />
              )}

              <button
                onClick={handleGenerate}
                className="w-full mt-4 bg-accent text-black py-3 rounded-lg font-semibold text-sm hover:opacity-85 transition-opacity"
              >
                Generate Captions →
              </button>
            </div>

            {/* Output */}
            {(output || batchOutput.length > 0) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-xs text-accent tracking-widest uppercase">
                    Output
                  </p>
                  {mode === "batch" && batchOutput.length > 0 && (
                    <button
                      onClick={copyAllBatch}
                      className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors"
                    >
                      {copied ? "✓ Copied All" : "Copy All"}
                    </button>
                  )}
                </div>

                {mode === "single" && output && (
                  <div className="relative">
                    <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm text-slate-300 leading-relaxed pr-20">
                      {output}
                    </div>
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="absolute top-3 right-3 font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                )}

                {mode === "batch" && batchOutput.length > 0 && (
                  <div className="space-y-3">
                    {batchOutput.map((caption, i) => (
                      <div key={i} className="relative">
                        <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed pr-16">
                          <span className="text-muted mr-2">#{i + 1}</span>
                          {caption}
                        </div>
                        <button
                          onClick={() => copyToClipboard(caption, i)}
                          className="absolute top-3 right-3 font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors"
                        >
                          {copiedIndex === i ? "✓" : "Copy"}
                        </button>
                      </div>
                    ))}
                    <p className="font-mono text-xs text-muted text-right tracking-wide">
                      {batchOutput.length} captions generated
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Example output */}
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
                Example Output — {STYLE_INFO[style].label}
              </p>
              <div className="bg-surface border border-border rounded-lg p-4 font-mono text-sm text-slate-400 leading-relaxed">
                {STYLE_INFO[style].example}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Templates ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
                Quick Templates
              </p>
              <p className="font-mono text-xs text-muted mb-4 leading-relaxed">
                Click any template to add it to your input. Build complete
                dataset captions fast.
              </p>

              <div className="space-y-5">
                {QUICK_TEMPLATES.map((section) => (
                  <div key={section.category}>
                    <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2 border-b border-border pb-2">
                      {section.category}
                    </p>
                    <div className="space-y-1.5">
                      {section.prompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => applyTemplate(prompt)}
                          className="w-full text-left font-mono text-xs text-muted hover:text-accent hover:bg-accent/5 px-3 py-2.5 rounded-lg transition-colors leading-relaxed border border-transparent hover:border-accent/10"
                        >
                          + {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
                Tips
              </p>
              <div className="space-y-3 font-mono text-xs text-muted leading-relaxed">
                <p>
                  → For LoRA training, use{" "}
                  <span className="text-accent">WD14</span> or{" "}
                  <span className="text-accent">Training Dataset</span> format
                </p>
                <p>
                  → Add your trigger word to every caption so the model learns
                  the association
                </p>
                <p>
                  → Describe variety: different angles, lighting, and
                  expressions = better LoRA
                </p>
                <p>
                  → <span className="text-accent">FLUX Optimized</span> works
                  best for FLUX Dev and Schnell inference
                </p>
                <p>
                  → Aim for 15–50 images with consistent captions for character
                  LoRAs
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
