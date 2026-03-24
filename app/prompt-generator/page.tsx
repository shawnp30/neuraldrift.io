"use client";

import { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Video, Download, Copy, Check, Wand2 } from "lucide-react";
import Link from "next/link";

const SUGGESTIONS = {
  subject: ["A towering neon-lit mech", "An elegant cyberpunk samurai", "A wise elderly wizard with a glowing staff", "A sleek futuristic sports car", "A mystical glowing jellyfish"],
  environment: ["in a rainy Neo-Tokyo alleyway", "atop a cloud-piercing mountain", "inside a sterile, white hyper-minimalist laboratory", "in a dense, bioluminescent alien jungle", "on the bustling trading floor of a dystopian stock exchange"],
  action: ["running desperately towards the camera", "slowly turning to face the viewer", "shattering into millions of glowing particles", "seamlessly transforming into a flock of ravens", "floating effortlessly in zero gravity"],
};

const OPTIONS = {
  lighting: ["Cinematic Lighting", "Volumetric Fog", "Golden Hour", "Studio Lighting", "Harsh Flash Photography", "Bioluminescent Glow", "Rembrandt Lighting", "Neon Noir", "Soft Diffused Lighting"],
  camera: ["35mm Photography", "Ultra Wide Angle", "Macro Photography", "Drone Flyover", "Low Angle Shot", "Dutch Angle", "Telephoto Lens", "GoPro Footage", "CCTV Footage"],
  style: ["Hyperrealistic", "Anime (Studio Ghibli style)", "Cyberpunk", "Dark Fantasy", "Surrealism", "Minimalist Vector Art", "Oil Painting Masterpiece", "Polaroid Vintage", "Vogue Editorial"],
  motion: ["Slow Tracking Shot", "Fast Paced Pan", "Dolly Zoom (Vertigo Effect)", "Static Shot with Subject Movement", "Handheld Shaky Cam", "Orbiting Drone Shot", "Crash Zoom"]
};

export default function PromptGeneratorPage() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [subject, setSubject] = useState("");
  const [environment, setEnvironment] = useState("");
  const [action, setAction] = useState(""); // Video only
  const [lighting, setLighting] = useState("");
  const [camera, setCamera] = useState("");
  const [style, setStyle] = useState("");
  const [motion, setMotion] = useState(""); // Video only
  
  const [masterPrompt, setMasterPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate the prompt whenever fields change
  useEffect(() => {
    const parts = [];
    
    // Core
    if (subject) parts.push(subject);
    if (mode === "video" && action) parts.push(action);
    if (environment) parts.push(environment);
    
    // Aesthetic Modifiers
    if (lighting) parts.push(lighting);
    if (camera) parts.push(camera);
    if (style) parts.push(style);
    if (mode === "video" && motion) parts.push(motion);
    
    // Base detail boosters
    if (parts.length > 0) {
      parts.push("8k resolution, highly detailed, masterpiece");
    }

    setMasterPrompt(parts.join(", "));
  }, [mode, subject, action, environment, lighting, camera, style, motion]);

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    setSubject(randomItem(SUGGESTIONS.subject));
    setEnvironment(randomItem(SUGGESTIONS.environment));
    setLighting(randomItem(OPTIONS.lighting));
    setCamera(randomItem(OPTIONS.camera));
    setStyle(randomItem(OPTIONS.style));
    if (mode === "video") {
      setAction(randomItem(SUGGESTIONS.action));
      setMotion(randomItem(OPTIONS.motion));
    }
  };

  const handleExportJson = () => {
    const payload = {
      prompt: masterPrompt,
      metadata: {
        mode,
        subject,
        environment,
        lighting,
        camera,
        style,
        ...(mode === "video" && { action, motion })
      },
      comfyui_ready: true
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuraldrift_prompt_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addSuggestion = (setter: React.Dispatch<React.SetStateAction<string>>, text: string) => {
    setter(text);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-24 pb-32 font-sans relative">
      
      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-16 text-center">
        <p className="text-pink-400 font-[800] tracking-widest uppercase text-sm mb-4">Prompt Engineering Studio</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Craft the <span className="text-pink-400">Master Prompt.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Guaranteed cohesion. Build highly-structured prompts for image and video generation in seconds, then export to ComfyUI JSON.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-8">
        
        {/* ── LEFT: INPUTS ── */}
        <div className="w-full lg:w-3/5 space-y-8">
          
          {/* Mode Toggle */}
          <div className="bg-[#0f172a]/50 p-2 rounded-2xl flex border border-indigo-500/20 backdrop-blur-xl">
            <button
              onClick={() => setMode("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-[800] text-sm transition-all ${
                mode === "image" ? "bg-indigo-500 text-white shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <ImageIcon className="w-5 h-5" /> Image Mode
            </button>
            <button
              onClick={() => setMode("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-[800] text-sm transition-all ${
                mode === "video" ? "bg-sky-500 text-white shadow-lg" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Video className="w-5 h-5" /> Video Mode
            </button>
          </div>

          <button 
            onClick={handleRandomize}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-white font-[900] rounded-2xl transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 transform hover:scale-[1.01]"
          >
            <Sparkles className="w-5 h-5 animate-pulse" /> 
            Surprise Me: Generate Instant Prompt
          </button>

          <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl space-y-8 relative">
            
            {/* Subject */}
            <div>
              <label className="block text-pink-400 font-[800] text-xs uppercase tracking-widest mb-3">1. The Subject</label>
              <textarea 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Describe your main character, object, or focal point..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.subject.map((s, i) => (
                  <button key={i} onClick={() => addSuggestion(setSubject, s)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-[600] text-zinc-400 hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Action */}
            {mode === "video" && (
              <div>
                <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /> Action / Motion</label>
                <textarea 
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="What is the subject doing? e.g. 'running desperately', 'shattering into pieces'..."
                  className="w-full h-20 bg-sky-500/5 border border-sky-500/20 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.action.map((s, i) => (
                    <button key={i} onClick={() => addSuggestion(setAction, s)} className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg text-xs font-[600] text-sky-400 hover:text-sky-300 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Environment */}
            <div>
              <label className="block text-amber-400 font-[800] text-xs uppercase tracking-widest mb-3">2. The Environment</label>
              <textarea 
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Where does this take place? e.g. 'in a rainy neon alleyway'..."
                className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.environment.map((s, i) => (
                  <button key={i} onClick={() => addSuggestion(setEnvironment, s)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-[600] text-zinc-400 hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Modifiers Grid */}
            <div className="pt-6 border-t border-white/5">
              <label className="block text-indigo-400 font-[800] text-xs uppercase tracking-widest mb-6">3. Aesthetic Modifiers</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-2">Lighting</label>
                  <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-[600] outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option value="">(None)</option>
                    {OPTIONS.lighting.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-2">Camera / Angle</label>
                  <select value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-[600] outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option value="">(None)</option>
                    {OPTIONS.camera.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-2">Art Style</label>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-[600] outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option value="">(None)</option>
                    {OPTIONS.style.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                
                {mode === "video" && (
                  <div>
                    <label className="block text-sky-500 font-[800] text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1"><Video className="w-3 h-3"/> Camera Motion</label>
                    <select value={motion} onChange={(e) => setMotion(e.target.value)} className="w-full bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-3 text-sky-400 font-[600] outline-none focus:border-sky-500 transition-colors appearance-none">
                      <option value="">(None)</option>
                      {OPTIONS.motion.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT: OUTPUT & ACTIONS ── */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-32">
            
            <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Wand2 className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-[800] text-white">Master Prompt</h3>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6 min-h-[200px] mb-8 shadow-inner font-mono text-sm leading-relaxed text-indigo-200">
                {masterPrompt || <span className="opacity-30">Your generated prompt will appear here... Build it using the inputs on the left.</span>}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleCopy}
                  disabled={!masterPrompt}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-[800] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Copied to Clipboard!" : "Copy Prompt Text"}
                </button>
                
                <button 
                  onClick={handleExportJson}
                  disabled={!masterPrompt}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-[800] rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" /> Export as Workflow JSON
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-zinc-500 font-[500] leading-relaxed">
                  Exported JSON payloads are pre-formatted for Neuraldrift's ComfyUI API nodes. Drop them directly into your workspace.
                </p>
                <Link href="/workflows" className="inline-block mt-3 text-indigo-400 font-[700] text-xs hover:text-indigo-300 transition-colors uppercase tracking-widest">
                  Browse Workflows →
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
