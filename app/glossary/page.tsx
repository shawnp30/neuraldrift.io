"use client";

import { BookA, Fingerprint, Layers, Cpu, Maximize, Activity } from "lucide-react";

const GLOSSARY_TERMS = [
  {
    id: "cfg-scale",
    term: "CFG Scale (Classifier Free Guidance)",
    icon: <Activity className="w-5 h-5" />,
    definition: "Determines how strictly the AI should follow your text prompt.",
    details: "A high CFG (e.g., 7-10) forces the model to strictly adhere to your prompt, but can cause 'deep fried' artifacts. A low CFG (e.g., 2-4) gives the model more creative freedom and generally produces more realistic images, especially with newer models like SDXL or FLUX.",
    example: "FLUX.1 Dev usually works best with CFG 3.5. SD1.5 prefers CFG 7."
  },
  {
    id: "steps",
    term: "Sampling Steps",
    icon: <Layers className="w-5 h-5" />,
    definition: "The number of iterations the model takes to denoise the image from pure static.",
    details: "More steps generally mean more detail and higher quality, but it takes longer to generate. However, after a certain point (usually 30-40 steps), the image stops changing significantly.",
    example: "Standard generation: 20-30 steps. LCM/Turbo models: 4-8 steps."
  },
  {
    id: "sampler",
    term: "Sampler (e.g., Euler, DPM++ 2M)",
    icon: <Cpu className="w-5 h-5" />,
    definition: "The specific mathematical algorithm used to remove noise during each step.",
    details: "Different samplers produce slightly different textures and details. 'Euler a' adds new noise every step (never truly settles), while 'DPM++ 2M' is highly deterministic and converges quickly on a clean image.",
    example: "DPM++ 2M is the community favorite for SDXL."
  },
  {
    id: "scheduler",
    term: "Scheduler (e.g., Karras, Normal)",
    icon: <Activity className="w-5 h-5" />,
    definition: "The curve or schedule that determines how much noise is removed at each step.",
    details: "A Karras scheduler heavily favors removing noise at the very beginning of the generation, then makes tiny, fine-tuning adjustments at the very end.",
    example: "Pairing 'DPM++ 2M' with 'Karras' is the gold standard for crisp realism."
  },
  {
    id: "vae",
    term: "VAE (Variational Autoencoder)",
    icon: <Fingerprint className="w-5 h-5" />,
    definition: "The translator that converts the AI's internal 'latent' data into the final visible pixels.",
    details: "Without a VAE, your images will look like highly saturated, washed-out messes or completely gray static. Most modern models (like SDXL) have the VAE built-in, but older models required you to load them separately.",
    example: "If your image looks like a deep-fried meme, check your VAE node."
  },
  {
    id: "denoising",
    term: "Denoising Strength",
    icon: <Maximize className="w-5 h-5" />,
    definition: "Used in Image-to-Image. Determines how much the original image is altered.",
    details: "0.0 means the original image is untouched. 1.0 means the original image is completely destroyed and replaced by a brand new generation. 0.3-0.5 is the sweet spot for keeping the structure but changing the style.",
    example: "Set Denoising to 0.4 to turn a photo of yourself into a cyberpunk painting."
  }
];

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-16 font-sans">
      
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
          <BookA className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl">
          AI <span className="text-violet-400">Glossary</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 leading-relaxed mx-auto max-w-2xl">
          The definitive dictionary for ComfyUI and generative AI. Understand exactly what every node, parameter, and slider actually does.
        </p>
      </div>

      {/* ── GLOSSARY LIST ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pb-24">
        <div className="space-y-6">
          {GLOSSARY_TERMS.map((item) => (
            <div 
              key={item.id} 
              className="group bg-[#0f172a]/30 border border-indigo-500/10 rounded-3xl p-8 hover:bg-[#0f172a]/60 hover:border-violet-500/30 transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20 text-violet-400 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-[800] text-white tracking-tight mb-2 group-hover:text-violet-300 transition-colors">
                    {item.term}
                  </h2>
                  <p className="text-lg text-zinc-300 font-[600] mb-4">
                    {item.definition}
                  </p>
                  <p className="text-sm text-zinc-500 font-[500] leading-relaxed mb-6">
                    {item.details}
                  </p>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 border-l-2 border-l-violet-500">
                    <p className="text-xs font-[700] uppercase tracking-widest text-violet-400 mb-1">Rule of Thumb</p>
                    <p className="text-sm font-[600] text-zinc-300">{item.example}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
