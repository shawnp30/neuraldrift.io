"use client"
import Navbar from "@/components/layout/Navbar";



const NODES = [
  {
    step: 1,
    name: "Load Checkpoint",
    node: "CheckpointLoaderSimple",
    purpose: "Loads the base model into memory. This is always your first node.",
    inputs: ["ckpt_name: your model filename"],
    outputs: ["MODEL", "CLIP", "VAE"],
    notes: "Use FP8 versions for 16GB VRAM. FP16 for 24GB+.",
    settings: null,
  },
  {
    step: 2,
    name: "Load LoRA (optional)",
    node: "LoraLoader",
    purpose: "Injects your LoRA weights into the base model. Skip if not using a LoRA.",
    inputs: ["MODEL (from checkpoint)", "CLIP (from checkpoint)", "lora_name", "strength_model", "strength_clip"],
    outputs: ["MODEL", "CLIP"],
    notes: "Start at 0.8 strength. Go higher for stronger character lock, lower for subtle style.",
    settings: {
      strength_model: "0.6–1.0",
      strength_clip: "0.6–1.0",
    },
  },
  {
    step: 3,
    name: "CLIP Text Encode (Positive)",
    node: "CLIPTextEncode",
    purpose: "Encodes your positive prompt into a format the model understands.",
    inputs: ["CLIP (from checkpoint or LoRA)", "text: your prompt"],
    outputs: ["CONDITIONING"],
    notes: "For FLUX: keep prompts descriptive and natural language. For SDXL: use comma-separated tags.",
    settings: null,
  },
  {
    step: 4,
    name: "CLIP Text Encode (Negative)",
    node: "CLIPTextEncode",
    purpose: "Tells the model what to avoid generating.",
    inputs: ["CLIP", "text: negative prompt"],
    outputs: ["CONDITIONING"],
    notes: "For FLUX: negative prompts have less effect. For SDXL: use detailed negative prompts.",
    settings: null,
  },
  {
    step: 5,
    name: "Empty Latent Image",
    node: "EmptyLatentImage",
    purpose: "Creates a blank canvas in latent space at your target resolution.",
    inputs: ["width", "height", "batch_size"],
    outputs: ["LATENT"],
    notes: "SDXL: 1024x1024. LTX Video: 768x512 (landscape) or 512x768 (vertical). Always use multiples of 64.",
    settings: {
      width: "512–2048",
      height: "512–2048",
      batch_size: "1–8",
    },
  },
  {
    step: 6,
    name: "KSampler",
    node: "KSampler",
    purpose: "The core generation node. This is where denoising happens — the model iteratively refines the latent.",
    inputs: ["MODEL", "positive CONDITIONING", "negative CONDITIONING", "LATENT"],
    outputs: ["LATENT"],
    notes: "This node has the most impact on output quality and speed.",
    settings: {
      seed: "Fixed for reproducibility, randomize for variety",
      steps: "20–30 (quality), 4–8 (speed with Schnell/distilled)",
      cfg: "1.0 (FLUX Schnell), 3.0–3.5 (FLUX Dev), 6.0–8.0 (SDXL)",
      sampler_name: "euler (FLUX), dpmpp_2m (SDXL), euler_ancestral (creative)",
      scheduler: "simple (FLUX), karras (SDXL), beta (LTX Video)",
      denoise: "1.0 (text-to-image), 0.5–0.8 (img2img)",
    },
  },
  {
    step: 7,
    name: "VAE Decode",
    node: "VAEDecode",
    purpose: "Converts the latent output back into a viewable image.",
    inputs: ["LATENT (from KSampler)", "VAE (from checkpoint)"],
    outputs: ["IMAGE"],
    notes: "If you see color artifacts, your VAE is mismatched. Download the correct VAE for your model.",
    settings: null,
  },
  {
    step: 8,
    name: "Save Image",
    node: "SaveImage",
    purpose: "Saves the final image to disk.",
    inputs: ["IMAGE (from VAE Decode)", "filename_prefix"],
    outputs: ["Saved file"],
    notes: "Files save to ComfyUI/output/ by default. Use subfolders: 'flux/portrait_' for organization.",
    settings: {
      filename_prefix: "ComfyUI or custom prefix",
    },
  },
];

const BUILDS = [
  {
    id: "highway-ghost",
    title: "Highway Ghost — LTX Chase Build",
    status: "Complete",
    statusColor: "text-[#10b981]",
    date: "March 2025",
    model: "LTX Video 2.3",
    description: "A first-person motorcycle chase sequence built for YouTube Shorts. Developed over 3 sessions, 47 test renders.",
    devlog: [
      {
        session: 1,
        title: "Initial concept and prompt testing",
        notes: "Started with wide establishing shots. CFG 3.0 was too static — bumped motion scale to 1.3. Realized 97 frames was the sweet spot for ~4 second clips on RTX 5080. First frame conditioning between clips was the key breakthrough for continuity.",
        iterations: 12,
        breakthrough: "First frame conditioning eliminates character drift between clips",
      },
      {
        session: 2,
        title: "Camera movement refinement",
        notes: "Low tracking shot language wasn't working consistently. Added 'camera mounted to car hood' style descriptions. Motion blur in the prompt helped a lot. Switched scheduler from karras to beta — much smoother motion.",
        iterations: 22,
        breakthrough: "Scheduler switch to beta eliminated stuttery motion artifacts",
      },
      {
        session: 3,
        title: "Assembly and color grade",
        notes: "Assembled 5 clips in CapCut. Added Cinematic LUT at 60%. The crossfade between clips 3 and 4 needed to be 4 frames minimum — anything less showed a hard cut. Final video: 14 seconds, exported 1080p.",
        iterations: 13,
        breakthrough: "4-frame crossfade hides the transition artifacts completely",
      },
    ],
    finalConfig: {
      steps: 25,
      cfg: 3.0,
      denoise: 1.0,
      sampler: "euler",
      scheduler: "beta",
      resolution: "512x768",
      frames: 97,
      motionScale: 1.3,
    },
  },
  {
    id: "fat-bigfoot-loop",
    title: "Fat Bigfoot GoPro Loop — AnimateDiff Build",
    status: "Complete",
    statusColor: "text-[#10b981]",
    date: "March 2025",
    model: "AnimateDiff + SDXL",
    description: "Seamless looping animation for the Fat Bigfoot character. Stoner chaos energy in a forest setting. Built for Instagram Reels loop format.",
    devlog: [
      {
        session: 1,
        title: "Character LoRA testing",
        notes: "Fat Bigfoot LoRA at 0.9 was too dominant — broke the background. Dropped to 0.75. Fisheye lens simulation in the prompt worked better than expected. The key phrase was 'handheld shaky GoPro footage' for the right movement feel.",
        iterations: 8,
        breakthrough: "LoRA at 0.75 keeps character without breaking environment",
      },
      {
        session: 2,
        title: "Loop seamlessness",
        notes: "AnimateDiff default 16 frames didn't loop cleanly. Switched to 24 frames with context_length 16. Added the loop conditioning node. Had to match first and last frame manually in CapCut — added 2 frame crossfade.",
        iterations: 19,
        breakthrough: "24 frames + context_length 16 creates clean loop point",
      },
    ],
    finalConfig: {
      steps: 20,
      cfg: 7.0,
      denoise: 1.0,
      sampler: "dpmpp_2m",
      scheduler: "karras",
      resolution: "512x512",
      frames: 24,
      motionScale: 1.0,
    },
  },
];

export default function WorkflowCreatorPage() {
  return (
    <>

      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">{"// Workflow Creator"}</p>
          <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">
            Build custom<br />ComfyUI workflows.
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            Node-by-node breakdowns of every workflow in the library. Includes dev logs, iteration notes, and the exact settings that worked.
          </p>
        </div>

        {/* NODE REFERENCE */}
        <div className="mb-20">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">{"// Node Reference Guide"}</p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-10">
            The standard node chain — explained.
          </h2>

          <div className="space-y-4">
            {NODES.map((node) => (
              <div key={node.step} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[72px_1fr]">
                  {/* Step number */}
                  <div className="bg-surface border-r border-border flex items-center justify-center">
                    <span className="font-syne text-2xl font-black text-accent">0{node.step}</span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-syne text-base font-bold text-white">{node.name}</h3>
                        <p className="font-mono text-xs text-accent/60 tracking-wide mt-0.5">{node.node}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted leading-relaxed mb-4">{node.purpose}</p>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Inputs */}
                      <div>
                        <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Inputs</p>
                        <ul className="space-y-1">
                          {node.inputs.map((input, i) => (
                            <li key={i} className="font-mono text-xs text-slate-400 flex items-start gap-1.5">
                              <span className="text-accent mt-0.5">→</span> {input}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Outputs */}
                      <div>
                        <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Outputs</p>
                        <ul className="space-y-1">
                          {node.outputs.map((output, i) => (
                            <li key={i} className="font-mono text-xs text-[#a3e635] flex items-start gap-1.5">
                              <span className="mt-0.5">←</span> {output}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Settings or Notes */}
                      <div>
                        {node.settings ? (
                          <>
                            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Key Settings</p>
                            <div className="space-y-1">
                              {Object.entries(node.settings).map(([k, v]) => (
                                <div key={k} className="font-mono text-xs">
                                  <span className="text-muted">{k}: </span>
                                  <span className="text-[#f97316]">{v}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-xs text-muted tracking-widest uppercase mb-2">Notes</p>
                            <p className="font-mono text-xs text-slate-400 leading-relaxed">{node.notes}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {node.settings && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="font-mono text-xs text-slate-400 leading-relaxed">{node.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUILD DEVLOGS */}
        <div>
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-6">{"// Build Dev Logs"}</p>
          <h2 className="font-syne text-3xl font-black tracking-tight text-white mb-10">
            Real builds, real iterations.
          </h2>

          <div className="space-y-8">
            {BUILDS.map((build) => (
              <div key={build.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Build header */}
                <div className="p-8 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`font-mono text-xs tracking-widest uppercase ${build.statusColor}`}>
                          ● {build.status}
                        </span>
                        <span className="font-mono text-xs text-muted tracking-wide">{build.date}</span>
                        <span className="font-mono text-xs bg-accent/8 text-accent px-2 py-0.5 rounded tracking-wide">
                          {build.model}
                        </span>
                      </div>
                      <h3 className="font-syne text-2xl font-bold text-white tracking-tight mb-2">{build.title}</h3>
                      <p className="text-sm text-muted leading-relaxed max-w-2xl">{build.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_280px]">
                  {/* Dev log sessions */}
                  <div className="p-8 border-r border-border">
                    <p className="font-mono text-xs text-muted tracking-widest uppercase mb-6">Session Log</p>
                    <div className="space-y-6">
                      {build.devlog.map((session) => (
                        <div key={session.session} className="relative pl-6 border-l border-border">
                          <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-accent/20 border border-accent/40" />
                          <div className="mb-1 flex items-center gap-3">
                            <span className="font-mono text-xs text-accent tracking-wider">Session {session.session}</span>
                            <span className="font-mono text-xs text-muted">{session.iterations} renders</span>
                          </div>
                          <h4 className="font-syne text-sm font-bold text-white mb-2">{session.title}</h4>
                          <p className="text-xs text-muted leading-relaxed mb-3">{session.notes}</p>
                          <div className="bg-[#a3e635]/5 border border-[#a3e635]/15 rounded p-3">
                            <p className="font-mono text-xs text-[#a3e635] leading-relaxed">
                              💡 {session.breakthrough}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final config */}
                  <div className="p-8">
                    <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Final Config</p>
                    <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs space-y-2">
                      {Object.entries(build.finalConfig).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-muted capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-accent">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}

