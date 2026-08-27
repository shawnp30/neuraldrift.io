"use client";

import Link from "next/link";
import { CloudRain, Video, Image as ImageIcon, Sparkles, BookOpen, Layers, DollarSign, Target, AlertTriangle } from "lucide-react";

// Verified August 2026. Cloud model versions move fast — re-check before relying on
// version numbers or pricing tiers.
const LAST_VERIFIED = "August 2026";

const PLATFORMS = [
  {
    name: "Midjourney V8.2",
    type: "Image",
    company: "Midjourney",
    status: "current" as const,
    description: "Still the strongest option for artistic, conceptual, and editorial-grade stills. V8.2 (default since July 2026) pushes harder on aesthetics and personalization, and cuts down the low-quality misses earlier versions produced.",
    accuracyVerdict: "Excellent prompt adherence and micro-detail. Personalization profiles now meaningfully shape output style.",
    bestFor: "Concept art, photorealism, editorial fashion, in-image text.",
    pricing: "Basic / Standard / Pro / Mega tiers — check midjourney.com for current rates.",
    promptingGuide: [
      "Use natural, descriptive language — not comma-separated keyword dumps.",
      "Lead with the focal point, then work outward to context.",
      "Specify aesthetic terms ('editorial photography', 'macro shot', 'minimalist').",
      "Use --ar for aspect ratio and --style raw when you want less Midjourney house-style."
    ],
    example: "Editorial photography of a futuristic fashion model wearing a holographic jacket, dramatic studio lighting, harsh shadows, Vogue style, ultra-detailed --ar 4:5 --style raw"
  },
  {
    name: "Seedance 2.0",
    type: "Video",
    company: "ByteDance",
    status: "current" as const,
    description: "Currently sitting at the top of the independent Artificial Analysis video leaderboard. Strong all-round motion quality and prompt adherence, and the model most likely to get a shot right on the first generation.",
    accuracyVerdict: "Top-ranked on independent benchmarks as of mid-2026. Very strong first-try hit rate.",
    bestFor: "General-purpose text-to-video, motion-heavy shots, fast iteration.",
    pricing: "Available via ByteDance / partner APIs — pricing varies by provider.",
    promptingGuide: [
      "Describe the action first, then the camera, then the setting.",
      "Keep one clear subject per shot — multi-subject prompts drift.",
      "Name the shot type explicitly ('medium tracking shot', 'static wide').",
      "Add lighting last; it anchors the overall look without fighting the motion."
    ],
    example: "A medium tracking shot of a lone cyclist riding along a coastal cliff road at sunrise, sea mist in the air, warm rim lighting, cinematic."
  },
  {
    name: "Veo 3.1",
    type: "Video",
    company: "Google",
    status: "current" as const,
    description: "The strongest all-rounder for narrative work. Leads on prompt adherence, generates native synchronized audio, and outputs up to 4K in both landscape and portrait — which makes it the safest default for story-driven sequences.",
    accuracyVerdict: "Best-in-class prompt adherence. Native audio and 4K output are the differentiators.",
    bestFor: "Narrative scenes, establishing shots, physics-heavy action, anything needing sound.",
    pricing: "Via Google Vertex AI / Gemini plans — metered by generation.",
    promptingGuide: [
      "Write in plain natural language; Veo responds poorly to keyword spam.",
      "Use precise verbs for physics ('water splashing', 'fabric billowing').",
      "Keep it linear: Subject → Action → Environment → Lighting.",
      "Describe the audio you want — Veo 3.1 generates it natively."
    ],
    example: "A close-up of a glass of milk spilling across a marble countertop in slow motion, morning sunlight through a window, detailed liquid simulation, soft ambient kitchen sound."
  },
  {
    name: "Runway Gen-4.5",
    type: "Video",
    company: "Runway",
    status: "current" as const,
    description: "The professional's control surface. Gen-4 added native audio, and the Gen-4.x line remains the pick when you need real directorial control — camera moves, motion brush, and reference-driven character consistency across shots.",
    accuracyVerdict: "Not the raw quality leader anymore, but unmatched for granular creative control.",
    bestFor: "Image-to-video, character consistency across cuts, VFX work, commercial B-roll.",
    pricing: "Standard / Pro / Unlimited tiers — check runwayml.com for current rates.",
    promptingGuide: [
      "Specify motion speed ('slow motion', 'timelapse').",
      "Detail the camera angle ('low angle', 'bird's-eye view').",
      "Use image-to-video when composition matters more than novelty.",
      "Lean on Motion Brush for targeted movement instead of over-describing it in text."
    ],
    example: "A low angle shot of an astronaut walking slowly across a desolate martian landscape, dust blowing in the wind, cinematic depth of field, 24fps."
  },
  {
    name: "Kling 3.0",
    type: "Video",
    company: "Kuaishou",
    status: "current" as const,
    description: "The go-to for character dialogue work. Kling 3.0 added multilingual lip sync, which makes it the practical choice when a person on screen actually has to speak convincingly.",
    accuracyVerdict: "Strong human motion and facial work; multilingual lip sync is the standout feature.",
    bestFor: "Talking-head shots, character dialogue, human motion, localized content.",
    pricing: "Credit-based tiers via klingai.com.",
    promptingGuide: [
      "Describe the performance, not just the appearance ('speaking earnestly', 'laughing mid-sentence').",
      "Supply a reference image for character consistency wherever possible.",
      "Keep camera movement modest — Kling favors subject motion over camera motion.",
      "For lip sync, provide clean audio and a front-facing subject."
    ],
    example: "A medium close-up of a woman in a cafe speaking earnestly to camera, natural window light, shallow depth of field, subtle head movement."
  },
  {
    name: "Sora",
    type: "Video",
    company: "OpenAI",
    status: "discontinued" as const,
    description: "OpenAI shut Sora down. The web and app experiences went dark on April 26, 2026, and the Sora API is scheduled to be discontinued on September 24, 2026. If you have work still stored in Sora, export it before that date — OpenAI has said the data will be permanently deleted afterward.",
    accuracyVerdict: "No longer available. Listed here only so anyone still searching for it gets a straight answer.",
    bestFor: "Nothing — migrate to Veo 3.1, Seedance 2.0, or Runway Gen-4.5 above.",
    pricing: "Discontinued.",
    promptingGuide: [
      "Sora is being retired — don't build a workflow on it.",
      "For cinematic establishing shots, Veo 3.1 is the closest replacement.",
      "For raw quality and first-try hit rate, try Seedance 2.0.",
      "For directorial control over camera and character, use Runway Gen-4.5."
    ],
    example: "Export any remaining Sora work at sora.chatgpt.com/sunset before the API shutdown."
  }
];

export default function CloudGeneratorsPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-50 pt-32 pb-24 font-sans">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-20 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] text-indigo-400">
          <CloudRain className="w-8 h-8" />
        </div>
        <p className="text-indigo-400 font-[800] tracking-widest uppercase text-sm mb-4">The Omniverse Guide</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Cloud-Based <br/><span className="text-indigo-400">AI Mastery.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Comprehensive knowledge on closed-source models. Discover which platform is best for your specific use case, what it costs, and precisely how to command it.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Model lineup verified {LAST_VERIFIED}
        </p>
      </div>

      {/* ── PLATFORM DRILLDOWNS ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 mb-32">
        {PLATFORMS.map((plat) => (
          <div key={plat.name} className={`bg-[#080b0f] border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-500 relative ${plat.status === "discontinued" ? "border-amber-500/30 opacity-90" : "border-white/10 hover:border-indigo-500/30"}`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none mix-blend-screen" />

            {plat.status === "discontinued" && (
              <div className="relative z-10 flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-8 py-4 md:px-12">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-sm font-[700] text-amber-200">
                  Discontinued by {plat.company} — do not build new workflows on this.
                </p>
              </div>
            )}

            <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-10">

              {/* Left Column (Info & Stats) */}
              <div className="w-full lg:w-[45%]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${plat.status === "discontinued" ? "bg-amber-500/20 text-amber-400" : plat.type === "Video" ? "bg-sky-500/20 text-sky-400" : "bg-green-500/20 text-green-400"}`}>
                    {plat.type === "Video" ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>
                  <h3 className={`text-3xl md:text-4xl font-[800] ${plat.status === "discontinued" ? "text-zinc-400 line-through decoration-amber-500/50" : "text-white"}`}>{plat.name}</h3>
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">Built By {plat.company}</p>
                <p className="text-zinc-300 font-[500] leading-relaxed mb-8 text-lg">{plat.description}</p>
                
                {/* Metrics Grid */}
                <div className="space-y-4">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-indigo-400 font-[800] text-sm uppercase tracking-widest mb-2">
                      <Target className="w-4 h-4" /> Accuracy & Verdict
                    </div>
                    <p className="text-sm font-[600] text-zinc-300 leading-relaxed">{plat.accuracyVerdict}</p>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-violet-400 font-[800] text-sm uppercase tracking-widest mb-2">
                      <Sparkles className="w-4 h-4" /> Best For
                    </div>
                    <p className="text-sm font-[600] text-zinc-300 leading-relaxed">{plat.bestFor}</p>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-emerald-400 font-[800] text-sm uppercase tracking-widest mb-2">
                      <DollarSign className="w-4 h-4" /> Pricing Structure
                    </div>
                    <p className="text-sm font-[600] text-zinc-300 leading-relaxed">{plat.pricing}</p>
                  </div>
                </div>
              </div>

              {/* Right Column (Prompt Guide) */}
              <div className="w-full lg:w-[55%] bg-black/50 rounded-3xl p-8 md:p-10 border border-white/5 shadow-inner flex flex-col">
                <h4 className="flex items-center gap-2 text-indigo-400 font-[800] text-sm uppercase tracking-widest mb-8">
                  <Layers className="w-5 h-5" /> Prompting Strategy
                </h4>
                
                <ul className="space-y-5 mb-8 flex-1">
                  {plat.promptingGuide.map((guide, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-[800] text-xs mt-0.5 border border-indigo-500/20">
                        {idx + 1}
                      </div>
                      <span className="text-base font-[500] text-zinc-300 leading-relaxed pt-0.5">{guide}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-auto">
                  <p className="text-xs font-[800] text-indigo-400 uppercase tracking-widest mb-3">Master Example</p>
                  <p className="text-sm font-mono text-indigo-200/90 leading-relaxed">&quot;{plat.example}&quot;</p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ── PROMPT ANATOMY (Moved lower down to serve as global instruction) ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="bg-[#0f172a] border border-indigo-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-[800] text-white mb-8 flex items-center gap-3 relative z-10">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            The Anatomy of a Cohesive Prompt
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-indigo-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> 1. The Subject</h3>
                <p className="text-sm font-[500] text-zinc-300 leading-relaxed">The core focus of your generation. Be specific about attributes like clothing, material, age, ethnicity, and positioning.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-sky-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /> 2. The Action (Video)</h3>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">What is the subject doing? Use precise verbs. &quot;Walking briskly&quot;, &quot;staring intensely&quot;, &quot;shattering into pieces&quot;.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-violet-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> 3. Camera / Format</h3>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">Dictate the view. &quot;Medium shot&quot;, &quot;macro photography&quot;, &quot;drone tracking shot&quot;, &quot;GoPro footage&quot;. This defines the spatial relationship.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-pink-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /> 4. The Environment</h3>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">Where is the subject? &quot;A rainy cyberpunk alley&quot;, &quot;a sterile minimal laboratory&quot;, &quot;an endless desert at dusk&quot;.</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-green-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> 5. Lighting / Quality</h3>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">Lighting makes or breaks the execution. &quot;Volumetric fog&quot;, &quot;cinematic rim lighting&quot;, &quot;harsh flash photography&quot;, &quot;8k resolution&quot;.</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-cyan-400 border border-indigo-400 p-6 rounded-2xl text-black">
                <h3 className="text-black font-[900] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> Put into Practice</h3>
                <p className="text-sm font-[700] text-black/80 leading-relaxed">We built a tool that combines these 5 pillars automatically for you.</p>
                <Link href="/prompt-generator" className="inline-block mt-4 text-white font-[800] bg-black hover:bg-black/80 px-6 py-3 rounded-xl text-sm transition-colors shadow-lg">Launch Prompt Generator →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
