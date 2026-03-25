"use client";

import Link from "next/link";
import { CloudRain, Video, Image as ImageIcon, Sparkles, BookOpen, Layers, DollarSign, Target } from "lucide-react";

const PLATFORMS = [
  {
    name: "Midjourney v6",
    type: "Image",
    company: "Midjourney",
    description: "The undisputed king of artistic, conceptual, and highly-detailed photorealistic static images. If you need a still frame with perfect aesthetic composition, this is the gold standard.",
    accuracyVerdict: "9.5/10 — Industry leader for prompt adherence and micro-details.",
    bestFor: "Concept Art, Photorealism, Editorial Fashion, Text rendering.",
    pricing: "Basic ($10/mo) • Standard ($30/mo) • Pro ($60/mo)",
    promptingGuide: [
      "Use natural, descriptive language.",
      "Detail the focal point immediately.",
      "Specify aesthetic terms (e.g., 'editorial photography', 'macro shot', 'minimalist').",
      "Use parameters like --ar 16:9 for aspect ratio or --style raw for less stylization."
    ],
    example: "Editorial photography of a futuristic fashion model wearing a holographic jacket, dramatic studio lighting, harsh shadows, Vogue style, ultra-detailed --ar 4:5 --style raw --v 6"
  },
  {
    name: "Sora",
    type: "Video",
    company: "OpenAI",
    description: "The heaviest lifter in AI video. Known for extreme temporal consistency, cinematic camera movements, and world-model simulation capabilities.",
    accuracyVerdict: "9/10 — Peerless temporal consistency, but struggles with complex physics interactions.",
    bestFor: "Cinematic establishing shots, Drone flyovers, Complex character movements.",
    pricing: "Included in ChatGPT Plus / Pro ($20/mo to $200/mo APIs limits).",
    promptingGuide: [
      "Start with the core action and subject.",
      "Define the camera movement explicitly (e.g., 'A slow tracking shot', 'drone flyover').",
      "Specify the film stock or lighting (e.g., 'Shot on 35mm film', 'golden hour lighting').",
      "End with environmental context to ground the scene."
    ],
    example: "A cinematic tracking shot following a neon-lit cyberpunk car speeding down a wet Tokyo street at midnight, reflections of pink and cyan lights on the puddles, hyper-realistic, shot on RED monstro."
  },
  {
    name: "Veo 3",
    type: "Video",
    company: "Google",
    description: "Highly realistic, physically accurate video generation. Google's answer to Sora, focusing extremely heavily on how objects interact and move within space.",
    accuracyVerdict: "8.5/10 — Phenomenal liquid and cloth physics, highly responsive to natural text.",
    bestFor: "Physics simulations (water, fire), Close-up macro action, Fluid dynamics.",
    pricing: "Varies via Google Vertex AI / Workspace integration.",
    promptingGuide: [
      "Focus heavily on the physics and movement.",
      "Use descriptive verbs for action (e.g., 'water splashing', 'fabric billowing').",
      "Keep the prompt linear: Subject -> Action -> Environment -> Lighting.",
      "Veo 3 responds well to natural language rather than keyword dumping."
    ],
    example: "A close-up shot of a glass of milk spilling on a marble countertop in slow motion, morning sunlight streaming through a window, highly detailed liquid simulation."
  },
  {
    name: "Runway Gen-3 Alpha",
    type: "Video",
    company: "Runway",
    description: "Fast, highly controllable video generation. The best choice for editors who need image-to-video looping, rapid iteration, and direct VFX integrations.",
    accuracyVerdict: "8/10 — Incredible Image-to-Video fidelity, sometimes hallucinates on Text-to-Video.",
    bestFor: "Image-to-Video motion, Fast Drafts, Stylized VFX, Commercial B-Roll.",
    pricing: "Standard ($15/mo) • Pro ($35/mo) • Unlimited ($95/mo)",
    promptingGuide: [
      "Specify motion speed (e.g., 'slow motion', 'timelapse').",
      "Detail the camera angle (e.g., 'low angle', 'birds-eye view').",
      "Keep subjects relatively simple for best temporal consistency.",
      "Use image-to-video for maximum control over the initial composition."
    ],
    example: "A low angle shot of an astronaut walking slowly across a desolate martian landscape, dust blowing in the wind, cinematic depth of field, 24fps."
  }
];

export default function CloudGeneratorsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-24 font-sans">
      
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
      </div>

      {/* ── PLATFORM DRILLDOWNS ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 mb-32">
        {PLATFORMS.map((plat) => (
          <div key={plat.name} className="bg-[#080b0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-indigo-500/30 transition-colors duration-500 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none mix-blend-screen" />
            
            <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-10 lg:gap-16 relative z-10">
              
              {/* Left Column (Info & Stats) */}
              <div className="w-full lg:w-[45%]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${plat.type === "Video" ? "bg-sky-500/20 text-sky-400" : "bg-green-500/20 text-green-400"}`}>
                    {plat.type === "Video" ? <Video className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-[800] text-white">{plat.name}</h3>
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
                  <p className="text-sm font-mono text-indigo-200/90 leading-relaxed">"{plat.example}"</p>
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
                <p className="text-sm font-[500] text-zinc-300 leading-relaxed">What is the subject doing? Use precise verbs. "Walking briskly", "staring intensely", "shattering into pieces".</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-violet-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> 3. Camera / Format</h3>
                <p className="text-sm font-[500] text-zinc-300 leading-relaxed">Dictate the view. "Medium shot", "macro photography", "drone tracking shot", "GoPro footage". This defines the spatial relationship.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-pink-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /> 4. The Environment</h3>
                <p className="text-sm font-[500] text-zinc-300 leading-relaxed">Where is the subject? "A rainy cyberpunk alley", "a sterile minimal laboratory", "an endless desert at dusk".</p>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-green-400 font-[800] uppercase tracking-widest text-xs mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> 5. Lighting / Quality</h3>
                <p className="text-sm font-[500] text-zinc-300 leading-relaxed">Lighting makes or breaks the execution. "Volumetric fog", "cinematic rim lighting", "harsh flash photography", "8k resolution".</p>
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
