"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Image as ImageIcon, Video, Download, Copy, Check, Wand2, Music, Mic, ChevronDown, CheckCircle, Eye, BoxSelect, History, Settings, Loader2, Save, X
} from "lucide-react";
import Link from "next/link";
import { COMMUNITY_PROMPTS } from "./data";
import { QUALITY_TIERS, QUALITY_SUFFIX, SUGGESTIONS, OPTIONS, REFERENCE_ARTISTS, getSuggestedBPM, QualityTier, ACE_POOLS } from "./options";


type Mode = "image" | "video" | "music" | "lyrics";
type ExportFormat = "json" | "text" | "a1111" | "api" | "link" | "ace";
type ViewTab = "builder" | "gallery" | "history";
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");

// ── UI COMPONENTS ──────────────────────────────────────
function ComboboxField({ label, value, onChange, options = [], variant = "slate", placeholder = "Select or type custom value..." }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const vColor = variant === "blue" ? "text-blue-400 focus-within:border-blue-500" :
                 variant === "teal" ? "text-indigo-400 focus-within:border-indigo-500" :
                 variant === "purple" ? "text-violet-400 focus-within:border-violet-500" :
                 "text-zinc-400 focus-within:border-zinc-500";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className={cn("block font-[800] text-[10px] uppercase tracking-widest mb-2", vColor.split(' ')[0])}>{label}</label>
      <div className={cn("flex items-center w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-4 py-3 transition-colors", vColor.split(' ')[1])}>
        <input 
           type="text" value={value} 
           onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
           onFocus={() => setIsOpen(true)}
           placeholder={placeholder}
           className="w-full bg-transparent text-zinc-200 font-[600] text-sm outline-none placeholder:text-zinc-600"
        />
        <ChevronDown className="w-4 h-4 text-zinc-500 cursor-pointer ml-2" onClick={() => setIsOpen(!isOpen)} />
      </div>
      
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[#12151c] border border-[#1f2330] rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {options.map((opt: string) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className="px-5 py-3.5 text-sm text-zinc-300 hover:bg-[#1f2330] hover:text-white cursor-pointer border-b border-[#1f2330]/50 last:border-0 transition-colors leading-relaxed">
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title, step, defaultOpen = false, colorClass = "text-zinc-200", children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1f2330]/50 transition-colors text-left">
        <span className={cn("font-[800] text-xs uppercase tracking-widest", colorClass)}>{step} {title}</span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && <div className="px-6 pb-6 pt-2 border-t border-[#1f2330]/50">{children}</div>}
    </div>
  );
}

function SettingsModal({ isOpen, onClose, apiKey, setApiKey }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#12151c] border border-[#1f2330] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1f2330] flex justify-between items-center bg-[#181b24]">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white uppercase tracking-widest text-xs">Engine Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
        </div>
          <div className="p-8 space-y-6">
          <div>
            <label className="block text-indigo-400 font-[800] text-[10px] uppercase tracking-widest mb-3">Gemini API Key (BYOK)</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-4 py-4 text-white font-mono text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-700"
            />
            <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Don&apos;t have a key?</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] bg-indigo-500 text-[#08090d] px-3 py-1.5 rounded-lg font-black hover:saturate-150 transition-all"
              >
                GET FREE KEY
              </a>
            </div>
            <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed italic text-center">
              * Your key is used ONLY locally to power the AI Architect.
            </p>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-indigo-500 text-[#08090d] font-black rounded-xl hover:saturate-150 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <Save size={16} /> Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
}

function VUMeter({ active = true }: { active?: boolean }) {
  return (
    <div className="flex gap-0.5 h-3 items-end">
      {[...Array(8)].map((_, i) => (
        <motion.div
           key={i}
           animate={active ? { height: [2, 8, 4, 12, 6, 10, 2][Math.floor(Math.random() * 7)] } : { height: 2 }}
           transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
           className={cn(
             "w-1 rounded-full",
             i > 5 ? "bg-red-500" : i > 3 ? "bg-violet-500" : "bg-indigo-500"
           )}
        />
      ))}
    </div>
  );
}

function StudioModule({ title, step, defaultOpen = false, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0f111a] border-x border-t border-[#1f2330] last:border-b rounded-none first:rounded-t-2xl last:rounded-b-2xl overflow-hidden shadow-inner flex flex-col relative group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 to-violet-500/50 opacity-30" />
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left bg-gradient-to-r from-black/20 to-transparent">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded bg-black border border-white/5 flex items-center justify-center font-mono text-[10px] text-zinc-500 font-bold group-hover:text-indigo-400 transition-colors">
             {step}
           </div>
           <div>
             <span className="font-[900] text-[10px] uppercase tracking-[0.2em] text-white/90">{title}</span>
             <div className="mt-1"><VUMeter active={isOpen} /></div>
           </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-600 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && (
        <div className="px-8 pb-8 pt-2 bg-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
           {children}
        </div>
      )}
    </div>
  );
}

// ── MAIN APPLICATION ──────────────────────────────────────
export default function PromptGenerator() {
  const [view, setView] = useState<ViewTab>("builder");
  const [mode, setMode] = useState<Mode>("image");
  const [qualityTier, setQualityTier] = useState<QualityTier>("cinematic");
  const [history, setHistory] = useState<any[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);

  const [qualityScore, setQualityScore] = useState(0);

  // Visual state
  const [subject, setSubject] = useState(""); const [environment, setEnvironment] = useState("");
  const [action, setAction] = useState(""); const [timeOfDay, setTimeOfDay] = useState("");
  const [lighting, setLighting] = useState(""); const [camera, setCamera] = useState("");
  const [style, setStyle] = useState(""); const [colorPalette, setColorPalette] = useState("");
  const [mood, setMood] = useState(""); const [composition, setComposition] = useState("");
  const [detail, setDetail] = useState(""); const [motion, setMotion] = useState("");
  const [colorGrade, setColorGrade] = useState(""); const [negativePrompt, setNegativePrompt] = useState("");
  const [filmStock, setFilmStock] = useState(""); const [customNarrative, setCustomNarrative] = useState("");

  // ACE-Step 1.5 Music state
  const [aceSampleMode, setAceSampleMode] = useState(false);
  const [aceIsInstrumental, setAceIsInstrumental] = useState(false);
  const [aceGenre, setAceGenre] = useState("");
  const [aceBpm, setAceBpm] = useState("");
  const [aceInstruments, setAceInstruments] = useState("");
  const [aceTexture, setAceTexture] = useState("");
  const [aceMood, setAceMood] = useState("");
  const [aceEra, setAceEra] = useState("");
  const [aceMix, setAceMix] = useState("");
  const [aceVocals, setAceVocals] = useState("");
  const [aceDuration, setAceDuration] = useState("120s");
  const [aceLora, setAceLora] = useState("");
  const [aceActiveNegatives, setAceActiveNegatives] = useState<string[]>([]);
  const [aceCaption, setAceCaption] = useState("");

  // Lyrics state
  const [lyricGenre, setLyricGenre] = useState(""); const [lyricSubstyle, setLyricSubstyle] = useState("");
  const [lyricLanguage, setLyricLanguage] = useState("English"); const [lyricLength, setLyricLength] = useState("");
  const [lyricMood, setLyricMood] = useState(""); const [lyricThemes, setLyricThemes] = useState("");
  const [lyricPerspective, setLyricPerspective] = useState(""); const [lyricReferenceVibe, setLyricReferenceVibe] = useState("");
  const [lyricImagery, setLyricImagery] = useState(""); const [lyricVocalGender, setLyricVocalGender] = useState("");
  const [lyricVocalTone, setLyricVocalTone] = useState(""); const [lyricFlowStyle, setLyricFlowStyle] = useState("");
  const [lyricRhymeDensity, setLyricRhymeDensity] = useState(""); const [lyricTempo, setLyricTempo] = useState("");
  const [lyricHookType, setLyricHookType] = useState(""); const [lyricStructure, setLyricStructure] = useState("");
  const [lyricCinematicEffect, setLyricCinematicEffect] = useState("");
  const [lyricDynamics, setLyricDynamics] = useState({ aggression: 5, melodicity: 5, wordiness: 5, emotionalIntensity: 5, bounce: 5, darkness: 5, complexity: 5 });

  const [masterPrompt, setMasterPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [seedInput, setSeedInput] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("nd_gemini_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    localStorage.setItem("nd_gemini_key", apiKey);
  }, [apiKey]);

  const handleAiGenerate = async () => {
    if (!seedInput.trim()) return;
    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ message: seedInput, mode }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (mode === "lyrics") {
        setMasterPrompt(data.lyrics);
      } else {
        // Auto-sync JSON response to UI fields
        if (data.subject) setSubject(data.subject);
        if (data.composition) setComposition(data.composition);
        if (data.camera) setCamera(data.camera);
        if (data.lighting) setLighting(data.lighting);
        if (data.color) setColorPalette(data.color);
        if (data.style) setStyle(data.style);
        
        // Video specific
        if (data.scene) setSubject(data.scene);
        if (data.shotSetup) setComposition(data.shotSetup);
        if (data.technical) setCamera(data.technical);
        
        // Music specific
        if (data.genre) setAceGenre(data.genre);
        if (data.instrumentation) setAceInstruments(data.instrumentation);
        if (data.vocals) setAceVocals(data.vocals);
        if (data.technical) setAceBpm(data.technical);
        if (data.production) setAceTexture(data.production);
        if (data.mood) setAceMood(data.mood);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("nd_prompt_history");
    if (saved) { try { setHistory(JSON.parse(saved)); } catch(e){} }
  }, []);

  useEffect(() => {
    setAction(""); setMotion(""); setColorGrade(""); setDetail(""); setNegativePrompt("");
    setAceGenre(""); setAceBpm(""); setAceInstruments(""); setAceTexture(""); setAceMood("");
    setAceEra(""); setAceMix(""); setAceVocals(""); setAceActiveNegatives([]); setAceLora("");
    setFilmStock(""); setCustomNarrative("");
    setLyricGenre(""); setLyricSubstyle(""); setLyricMood(""); setLyricThemes("");
    setLyricImagery(""); setLyricReferenceVibe(""); setLyricVocalGender(""); setLyricCinematicEffect("");
  }, [mode]);

  useEffect(() => {
    if (isAiGenerating) return; // Don't override if AI is currently writing

    const parts: string[] = [];
    if (mode === "lyrics") {
      parts.push("ACT AS AN ELITE MULTI-PLATINUM LYRICIST. Write a complete set of highly creative, unrestricted lyrics based on these precision parameters:");
      parts.push(`\n[SONG METADATA]`);
      parts.push(`- Genre/Style: ${lyricGenre} ${lyricSubstyle ? `(${lyricSubstyle})` : ""}`);
      if (lyricVocalGender) parts.push(`- Vocal Identity: ${lyricVocalGender} (${lyricVocalTone})`);
      if (lyricTempo) parts.push(`- Pacing/BPM: ${lyricTempo}`);
      
      parts.push(`\n[CREATIVE DIRECTION]`);
      if (lyricMood) parts.push(`- Mood/Atmosphere: ${lyricMood}`);
      if (lyricPerspective) parts.push(`- Perspective: ${lyricPerspective}`);
      if (lyricThemes) parts.push(`- Core Themes/Narrative: ${lyricThemes}`);
      if (lyricImagery) parts.push(`- Required Imagery: ${lyricImagery}`);

      parts.push(`\n[TECHNICAL SPECIFICATIONS]`);
      if (lyricFlowStyle) parts.push(`- Flow Style: ${lyricFlowStyle}`);
      if (lyricRhymeDensity) parts.push(`- Rhyme Density: ${lyricRhymeDensity}`);
      if (lyricHookType) parts.push(`- Chorus/Hook Type: ${lyricHookType}`);
      if (lyricStructure) parts.push(`- Song Structure: ${lyricStructure}`);
      if (lyricCinematicEffect) parts.push(`- Cinematic Arc: ${lyricCinematicEffect}`);

      parts.push("\nWrite the lyrics now. Use labeled sections like [Verse], [Chorus], and [Bridge]. Do not include explanations.");
      setMasterPrompt(parts.join("\n"));
    } else if (mode === "music") {
      parts.push(`ACT AS A PROFESSIONAL MUSIC PRODUCER. Generate a high-fidelity audio output based on this technical production brief:`);
      
      parts.push(`\n[VIBE & GENRE]`);
      parts.push(`- Genre/Subgenre: ${aceGenre}`);
      if (aceEra) parts.push(`- Production Era: ${aceEra}`);
      if (aceMood) parts.push(`- Mood/Emotion: ${aceMood}`);
      
      parts.push(`\n[TECHNICAL SPECS]`);
      if (aceBpm) parts.push(`- Tempo/BPM: ${aceBpm}`);
      if (aceDuration) parts.push(`- Duration: ${aceDuration}`);

      parts.push(`\n[INSTRUMENTATION & PRODUCTION]`);
      if (aceInstruments) parts.push(`- Primary Instruments: ${aceInstruments}`);
      if (aceTexture) parts.push(`- Mix Atmosphere/Texture: ${aceTexture}`);
      if (aceMix) parts.push(`- Mix Position: ${aceMix}`);

      parts.push(`\n[VOCAL DIRECTION]`);
      if (aceIsInstrumental) parts.push(`- Vocal Profile: Instrumental (No vocals)`);
      else if (aceVocals) parts.push(`- Identity & Delivery: ${aceVocals}`);
      
      if (aceActiveNegatives.length > 0) {
        parts.push(`\n[NEGATIVE PROMPTS / AVOID]`);
        parts.push(`- Exclude: ${aceActiveNegatives.join(", ")}`);
      }

      setMasterPrompt(parts.join("\n"));

      // Build aceCaption explicitly
      if (aceSampleMode) {
         setAceCaption(`Generate a ${aceGenre || 'song'}, ${aceMood ? aceMood + ' ' : ''}${aceIsInstrumental ? 'instrumental only' : aceVocals ? aceVocals : 'vocals'}, ${aceDuration}, ${aceEra || 'modern'} sound`.replace(/,\s*,/g, ',').replace(/\s+/g, ' '));
      } else {
         const aceParts = [
           aceGenre, aceInstruments, aceBpm, aceTexture, aceMood,
           aceEra, aceMix,
           aceIsInstrumental ? "no vocals, instrumental only" : aceVocals,
           ...aceActiveNegatives,
           aceLora ? `lora style: ${aceLora}` : "",
           aceDuration ? `duration ${aceDuration.replace('s', ' seconds')}` : "",
           "studio master", "high fidelity"
         ].filter(Boolean);
         setAceCaption(aceParts.join(", "));
      }
    } else if (mode === "video") {
      // VIDEO Format: [Scene action], [camera movement], [camera/lens], [FPS], [lighting], [color grade]
      const videoParts = [
        subject || "Cinematic scene",
        action,
        motion,
        camera,
        "24fps",
        lighting,
        colorGrade,
        "2.39:1 aspect ratio"
      ].filter(Boolean);
      setMasterPrompt(`${videoParts.join(", ")} --style cinematic`);
    } else {
      // IMAGE Format: [Subject], [style], [camera specs], [lighting], [color palette], [mood] --ar 16:9
      const imgParts = [
        subject || "Artistic portrait",
        style,
        camera,
        lighting,
        colorPalette,
        mood,
        detail,
        QUALITY_SUFFIX[qualityTier]
      ].filter(Boolean);
      setMasterPrompt(`${imgParts.join(", ")} --ar 16:9 --style raw`);
    }
  }, [mode, qualityTier, subject, action, environment, timeOfDay, mood, lighting, camera, style, colorPalette, composition, detail, motion, colorGrade, aceGenre, aceBpm, aceInstruments, aceTexture, aceMood, aceEra, aceMix, aceVocals, aceDuration, aceLora, aceActiveNegatives, aceSampleMode, aceIsInstrumental, filmStock, customNarrative, lyricGenre, lyricSubstyle, lyricLanguage, lyricLength, lyricMood, lyricThemes, lyricPerspective, lyricReferenceVibe, lyricImagery, lyricVocalGender, lyricVocalTone, lyricFlowStyle, lyricRhymeDensity, lyricHookType, lyricStructure, lyricDynamics, lyricTempo, lyricCinematicEffect, isAiGenerating, negativePrompt]);

  useEffect(() => {
    let score = 0;
    const countFilled = (arr: any[]) => arr.filter(Boolean).length;
    if (mode === "lyrics") {
      score += countFilled([lyricGenre, lyricMood, lyricThemes, lyricImagery, lyricHookType]) * 15;
    } else if (mode === "music") {
      score += countFilled([aceGenre, aceInstruments, aceBpm, aceTexture, aceVocals]) * 15;
    } else {
      score += countFilled([subject, environment, lighting, camera, style]) * 15;
      if (subject.length > 20) score += 10;
      if (qualityTier === "cinematic" || qualityTier === "ultra") score += 10;
    }
    setQualityScore(Math.min(score, 100));
  }, [masterPrompt, mode, qualityTier, subject, environment, lighting, camera, style, lyricGenre, lyricMood, lyricThemes, lyricImagery, lyricHookType, aceGenre, aceInstruments, aceBpm, aceTexture, aceVocals]);

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopiedFormat("text");
    setTimeout(() => setCopiedFormat(null), 2000);
    const entry = { id: Date.now(), mode, prompt: masterPrompt };
    const newHistory = [entry, ...history].slice(0, 15);
    setHistory(newHistory);
    localStorage.setItem("nd_prompt_history", JSON.stringify(newHistory));
  };
  
  const handleExportJson = () => {
    const payload = mode === "music" ? {
      caption: aceCaption,
      mode: "ace-step-1.5",
      is_instrumental: aceIsInstrumental,
      sample_mode: aceSampleMode,
      duration: aceDuration,
      lora: aceLora,
      negative_prompts: aceActiveNegatives,
      raw_meta: {
        genre: aceGenre,
        bpm: aceBpm,
        instruments: aceInstruments,
        texture: aceTexture,
        mood: aceMood,
        era: aceEra,
        mix: aceMix,
        vocals: aceVocals
      }
    } : { prompt: masterPrompt, mode, ...(negativePrompt && { negative_prompt: negativePrompt }) };
    
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedFormat("json");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleRandomize = () => {
    const r = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    if (mode === "lyrics") {
      setLyricGenre(r(SUGGESTIONS.audio_genre)); setLyricThemes(r(SUGGESTIONS.lyric_themes));
      setLyricMood(r(OPTIONS.mood)); setLyricVocalTone(r(SUGGESTIONS.audio_vocals));
      setLyricHookType(r(OPTIONS.lyric_hook_types));
    } else if (mode === "music") {
      setAceGenre(r(ACE_POOLS.GENRE));
      setAceBpm(r(ACE_POOLS.BPM));
      setAceInstruments(r(ACE_POOLS.INSTRUMENTS));
      setAceTexture(r(ACE_POOLS.TEXTURE));
      setAceMood(r(ACE_POOLS.MOOD));
      setAceEra(r(ACE_POOLS.ERA));
      setAceMix(r(ACE_POOLS.MIX_POSITION));
      if (!aceIsInstrumental) setAceVocals(r(ACE_POOLS.VOCAL_CHARACTER));
      
      const shuffled = [...ACE_POOLS.NEGATIVE_PROMPTS].sort(() => 0.5 - Math.random());
      setAceActiveNegatives(shuffled.slice(0, Math.floor(Math.random() * 3) + 1));
      
      const durations = ["30s", "60s", "90s", "120s", "180s", "240s"];
      setAceDuration(r(durations));
    } else {
      setSubject(r(SUGGESTIONS.subject)); setEnvironment(r(SUGGESTIONS.environment));
      setLighting(r(OPTIONS.lighting)); setCamera(r(OPTIONS.camera)); setStyle(r(OPTIONS.style));
    }
  };

  const estimatorStats = () => {
    if (mode === "music" || mode === "lyrics") return { vram: "~4GB", time: "5-10 seconds", tier: "🟢 GTX 1660+" };
    if (qualityTier === "ultra") return { vram: "~12GB", time: "30-45 seconds", tier: "🔴 RTX 4070+" };
    return { vram: "~8GB", time: "15-25 seconds", tier: "🟡 RTX 3060+" };
  };

  const stepNum = (n: number) => <span className="text-slate-500 font-mono font-black text-xs mr-2">0{n} /</span>;

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-200 pt-12 pb-32 font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#1f2330] pb-6">
            <div>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">{"//"} THE CREATIVE COMMAND CENTER</p>
              <h1 className="font-syne text-4xl md:text-6xl font-black tracking-tight text-white m-0">
                AI Architect<span className="text-zinc-700">.</span> 
              </h1>
              <p className="text-zinc-500 text-xs mt-3 max-w-md leading-relaxed font-[500]">
                Engineered for precision prompt synthesis across image, video, and audio domains.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-[#12151c] border border-[#1f2330] rounded-xl text-zinc-500 hover:text-indigo-400 transition-colors shadow-lg">
                <Settings size={18} />
              </button>
              <div className="flex bg-[#12151c] border border-[#1f2330] p-1.5 rounded-xl shadow-lg">
                {(["builder", "gallery", "history"] as ViewTab[]).map(t => (
                  <button key={t} onClick={() => setView(t)} className={cn(
                  "px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  view === t ? "bg-indigo-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                )}>
                    {t} {t === "history" && `(${history.length})`}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} apiKey={apiKey} setApiKey={setApiKey} />

        {view === "builder" && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[60%] flex flex-col gap-6">

              <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Wand2 size={80} />
                </div>
                <label className="block text-purple-400 font-[800] text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles size={12} /> AI Architect (Creative Engine)
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder="Describe your creative vision in plain English..."
                    className="flex-1 bg-[#0a0c10] border border-[#1f2330] rounded-xl px-5 py-4 text-white font-[600] text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                  />
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !apiKey}
                    className={cn(
                      "px-8 py-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black rounded-xl hover:saturate-150 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-500/20 disabled:grayscale disabled:opacity-50",
                    )}
                  >
                    {isAiGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 size={16} />}
                    {isAiGenerating ? "ARCHITECTING..." : "GENERATE"}
                  </button>
                </div>
                {!apiKey && <p className="mt-3 text-[10px] text-red-400/80 uppercase tracking-widest font-bold">Please add your Gemini API Key in Settings to enable AI Architect</p>}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-1 bg-[#12151c] border border-[#1f2330] p-1.5 rounded-xl">
                  {([ { key: "image", icon: ImageIcon }, { key: "video", icon: Video }, { key: "music", icon: Music }, { key: "lyrics", icon: Mic } ] as const).map(m => (
                    <button key={m.key} onClick={() => setMode(m.key)} className={cn(
                      "flex-1 flex justify-center items-center py-4 rounded-lg text-white transition-all font-[800] text-xs uppercase tracking-widest gap-2",
                      mode === m.key ? "bg-[#1f2330] text-indigo-400 shadow-md border border-indigo-500/20" : "text-zinc-500 hover:text-white"
                    )}>
                      <m.icon size={16} /> {m.key}
                    </button>
                  ))}
                </div>
                
                <button onClick={handleRandomize} className="px-8 py-4 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 hover:bg-indigo-500/20 text-white font-[900] rounded-xl transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
                  <Sparkles size={16} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                  SURPRISE ME
                </button>
              </div>

              {(mode === "image" || mode === "video") && (
                 <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-6">
                  <label className="block text-indigo-400 font-[800] text-[10px] uppercase tracking-widest mb-4">Master Quality Output</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {QUALITY_TIERS.map((key) => (
                      <button key={key} onClick={() => setQualityTier(key)} className={cn(
                        "py-3 px-3 rounded-xl font-[800] text-xs transition-all border capitalize",
                        qualityTier === key ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400" : "bg-[#0a0c10] border-[#1f2330] text-zinc-500 hover:text-white"
                      )}>{key}</button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono leading-relaxed bg-[#0a0c10] p-3 rounded-lg border border-[#1f2330]">{QUALITY_SUFFIX[qualityTier]}</p>
                </div>
              )}

              <div className="space-y-4">
                
                {mode === "lyrics" ? (
                  <>
                    <CollapsibleSection title="Purpose, Genre & Style" step={stepNum(1)} defaultOpen={true} colorClass="text-purple-400">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <ComboboxField label="Genre" value={lyricGenre} onChange={setLyricGenre} options={SUGGESTIONS.audio_genre} variant="purple" />
                          <ComboboxField label="Vocal Identity" value={lyricVocalGender} onChange={setLyricVocalGender} options={OPTIONS.lyric_vocal_genders} variant="purple" />
                          <ComboboxField label="Tone" value={lyricVocalTone} onChange={setLyricVocalTone} options={SUGGESTIONS.audio_vocals} variant="purple" />
                          <ComboboxField label="Mood" value={lyricMood} onChange={setLyricMood} options={OPTIONS.mood} variant="purple" />
                          <ComboboxField label="Perspective" value={lyricPerspective} onChange={setLyricPerspective} options={OPTIONS.lyric_perspectives} variant="purple" />
                        </div>
                        <div className="pt-6 border-t border-[#1f2330]">
                          <ComboboxField label="Core Themes & Story (Type custom if needed)" value={lyricThemes} onChange={setLyricThemes} options={SUGGESTIONS.lyric_themes} variant="purple" />
                        </div>
                        <div className="pt-6 border-t border-[#1f2330]">
                          <ComboboxField label="Required Imagery (Type custom if needed)" value={lyricImagery} onChange={setLyricImagery} options={SUGGESTIONS.lyric_imagery} variant="purple" />
                        </div>
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Technical Construction" step={stepNum(2)} colorClass="text-teal-400">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <ComboboxField label="Hook Type" value={lyricHookType} onChange={setLyricHookType} options={OPTIONS.lyric_hook_types} variant="teal" />
                        <ComboboxField label="Structure Preset" value={lyricStructure} onChange={setLyricStructure} options={OPTIONS.lyric_structures} variant="teal" />
                        <ComboboxField label="Flow Style" value={lyricFlowStyle} onChange={setLyricFlowStyle} options={OPTIONS.lyric_flow_styles} variant="teal" />
                        <ComboboxField label="Rhyme Density" value={lyricRhymeDensity} onChange={setLyricRhymeDensity} options={OPTIONS.lyric_rhyme_densities} variant="teal" />
                        <ComboboxField label="Cinematic Arc / Pacing" value={lyricCinematicEffect} onChange={setLyricCinematicEffect} options={OPTIONS.cinematic_effects} variant="teal" />
                        <ComboboxField label="Target Tempo / BPM" value={lyricTempo} onChange={setLyricTempo} options={OPTIONS.audio_tempo} variant="teal" placeholder="e.g. 140 BPM, or leave blank..." />
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Expressive Dynamics (1-10)" step={stepNum(3)} colorClass="text-purple-400">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        {(Object.keys(lyricDynamics) as Array<keyof typeof lyricDynamics>).map(key => (
                            <div key={key}>
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-slate-500 font-[800] text-[10px] uppercase tracking-widest">{String(key).replace(/([A-Z])/g, ' $1').trim()}</label>
                                <span className="text-purple-400 font-mono text-xs font-bold">{lyricDynamics[key]}</span>
                              </div>
                              <input type="range" min="1" max="10" value={lyricDynamics[key]} onChange={(e: any) => setLyricDynamics({...lyricDynamics, [key]: parseInt(e.target.value)})} className="w-full h-1.5 bg-[#1f2330] rounded-lg appearance-none cursor-pointer accent-purple-500" />
                            </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  </>
                ) : mode === "music" ? (
                  <div className="flex flex-col gap-4">
                    {/* Mode Toggle & Info */}
                    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-cyan-400 font-[800] text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <Settings size={12} /> Sample Mode (Let ACE-Step LM decide)
                        </label>
                        <button 
                          onClick={() => setAceSampleMode(!aceSampleMode)}
                          className={cn(
                            "w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out",
                            aceSampleMode ? "bg-cyan-500" : "bg-zinc-700"
                          )}
                        >
                          <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-200", aceSampleMode ? "translate-x-6" : "translate-x-0")} />
                        </button>
                      </div>
                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                         <p className="text-[10px] text-cyan-400/80 leading-relaxed uppercase font-bold tracking-tight">
                           {aceSampleMode ? "ON: Enter a simple query. ACE-Step will architect the rest." : "OFF: Manual mode enabled. You control every technical parameter."}
                         </p>
                      </div>
                    </div>

                    <div className="flex flex-col border border-[#1f2330] rounded-2xl overflow-hidden shadow-2xl">
                    <StudioModule title="Compositional Architecture" step="01" defaultOpen={true}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <ComboboxField label="Genre / Style" value={aceGenre} onChange={setAceGenre} options={ACE_POOLS.GENRE} variant="teal" />
                          <ComboboxField label="Tempo / BPM" value={aceBpm} onChange={setAceBpm} options={ACE_POOLS.BPM} variant="teal" />
                        </div>
                        <div className="pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <ComboboxField label="Production Era" value={aceEra} onChange={setAceEra} options={ACE_POOLS.ERA} variant="teal" />
                           <ComboboxField label="Mood / Emotion" value={aceMood} onChange={setAceMood} options={ACE_POOLS.MOOD} variant="teal" />
                        </div>
                      </div>
                    </StudioModule>

                    <StudioModule title="Instrument & Texture" step="02">
                      <div className="space-y-6">
                        <ComboboxField label="Primary Instrumentation" value={aceInstruments} onChange={setAceInstruments} options={ACE_POOLS.INSTRUMENTS} variant="teal" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                           <ComboboxField label="Atmosphere / Texture" value={aceTexture} onChange={setAceTexture} options={ACE_POOLS.TEXTURE} variant="teal" />
                           <ComboboxField label="Mix Positioning" value={aceMix} onChange={setAceMix} options={ACE_POOLS.MIX_POSITION} variant="teal" />
                        </div>
                      </div>
                    </StudioModule>

                    <StudioModule title="Vocal Configuration" step="03">
                       <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <label className="text-zinc-400 font-[800] text-[10px] uppercase tracking-widest">Instrumental Only (No Vocals)</label>
                            <button 
                              onClick={() => setAceIsInstrumental(!aceIsInstrumental)}
                              className={cn(
                                "w-10 h-5 rounded-full p-1 transition-colors duration-200",
                                aceIsInstrumental ? "bg-indigo-500" : "bg-zinc-800"
                              )}
                            >
                              <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", aceIsInstrumental ? "translate-x-5" : "translate-x-0")} />
                            </button>
                         </div>
                         {!aceIsInstrumental && (
                           <div className="pt-4 animate-in fade-in zoom-in-95">
                              <ComboboxField label="Vocal Character" value={aceVocals} onChange={setAceVocals} options={ACE_POOLS.VOCAL_CHARACTER} variant="teal" />
                           </div>
                         )}
                       </div>
                    </StudioModule>

                    <StudioModule title="ACE-Step Extensions" step="04">
                      <div className="space-y-8">
                        <div>
                          <label className="block text-zinc-400 font-[800] text-[10px] uppercase tracking-widest mb-4">Negative Constraints (Excluded from generation)</label>
                          <div className="flex flex-wrap gap-2">
                            {ACE_POOLS.NEGATIVE_PROMPTS.map(neg => (
                              <button
                                key={neg}
                                onClick={() => {
                                  if (aceActiveNegatives.includes(neg)) {
                                    setAceActiveNegatives(aceActiveNegatives.filter(n => n !== neg));
                                  } else {
                                    setAceActiveNegatives([...aceActiveNegatives, neg]);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                  aceActiveNegatives.includes(neg) 
                                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" 
                                    : "bg-[#0a0c10] border-[#1f2330] text-zinc-600 hover:text-zinc-400"
                                )}
                              >
                                {neg}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                          <label className="block text-zinc-400 font-[800] text-[10px] uppercase tracking-widest mb-4">Track Duration</label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {["30s", "60s", "90s", "120s", "180s", "240s"].map(d => (
                              <button
                                key={d}
                                onClick={() => setAceDuration(d)}
                                className={cn(
                                  "py-2 rounded-lg text-[10px] font-black transition-all border",
                                  aceDuration === d 
                                    ? "bg-indigo-500 border-indigo-500 text-white" 
                                    : "bg-[#0a0c10] border-[#1f2330] text-zinc-500 hover:text-white"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                           <label className="block text-zinc-400 font-[800] text-[10px] uppercase tracking-widest mb-3">ACE LoRA style reference (optional)</label>
                           <input 
                              type="text"
                              value={aceLora}
                              onChange={(e) => setAceLora(e.target.value)}
                              placeholder="e.g. my-country-lora, artist-style-v1"
                              className="w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-4 py-3 text-white font-[600] text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-800"
                           />
                        </div>
                      </div>
                    </StudioModule>
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-4">
                     <BoxSelect className="w-5 h-5 text-amber-500/40 shrink-0 mt-0.5" />
                     <div>
                        <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest mb-1">Editing Guidance</p>
                        <p className="text-[9px] text-zinc-600 leading-relaxed font-medium capitalize">
                          Load src_audio in ComfyUI for cover/remix mode. for painting, enable is_repaint in your server settings node.
                        </p>
                     </div>
                  </div>
                </div>
                ) : (
                  <>
                     <CollapsibleSection title="Focal Subject & Narrative" step={stepNum(1)} defaultOpen={true} colorClass="text-purple-400">
                      <div className="space-y-6">
                        <ComboboxField label="Focal Subject (Type detailed prompt or select template)" value={subject} onChange={setSubject} options={SUGGESTIONS.subject} variant="purple" />
                        <ComboboxField label="Creative Narrative / Story" value={customNarrative} onChange={setCustomNarrative} options={[]} variant="purple" />
                        {mode === "video" && (
                          <div className="pt-6 border-t border-[#1f2330]">
                             <ComboboxField label="Dynamic Action" value={action} onChange={setAction} options={SUGGESTIONS.action} variant="blue" />
                          </div>
                        )}
                      </div>
                     </CollapsibleSection>

                     <CollapsibleSection title="The Environment" step={stepNum(2)} colorClass="text-purple-400">
                        <ComboboxField label="Environment Details" value={environment} onChange={setEnvironment} options={SUGGESTIONS.environment} variant="purple" />
                     </CollapsibleSection>

                     <CollapsibleSection title="Master Visual Settings" step={stepNum(3)} colorClass="text-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <ComboboxField label="Time of Day" value={timeOfDay} onChange={setTimeOfDay} options={OPTIONS.timeOfDay} variant="slate" />
                          <ComboboxField label="Mood / Atmosphere" value={mood} onChange={setMood} options={OPTIONS.mood} variant="slate" />
                          <ComboboxField label="Lighting / Studio" value={lighting} onChange={setLighting} options={OPTIONS.lighting} variant="slate" />
                          <ComboboxField label="Professional Gear" value={camera} onChange={setCamera} options={OPTIONS.camera} variant="slate" />
                          <ComboboxField label="Film Stock / Grain" value={filmStock} onChange={setFilmStock} options={OPTIONS.filmStock} variant="slate" />
                          <ComboboxField label="Color Palette / Tone" value={colorPalette} onChange={setColorPalette} options={OPTIONS.colorPalette} variant="slate" />
                          <ComboboxField label="Composition / Frame" value={composition} onChange={setComposition} options={OPTIONS.composition} variant="slate" />
                          <ComboboxField label="Art Style / Movement" value={style} onChange={setStyle} options={OPTIONS.style} variant="slate" />
                          {mode === "image" && <ComboboxField label="Pro Detail / Sharpness" value={detail} onChange={setDetail} options={OPTIONS.detail} variant="slate" />}
                        </div>
                     </CollapsibleSection>

                     {mode === "video" && (
                       <CollapsibleSection title="Camera Motion & Color Grade" step={stepNum(4)} colorClass="text-blue-400">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <ComboboxField label="Camera Motion" value={motion} onChange={setMotion} options={OPTIONS.motion} variant="blue" />
                            <ComboboxField label="Color Grade Reference" value={colorGrade} onChange={setColorGrade} options={OPTIONS.colorGrade} variant="blue" />
                         </div>
                       </CollapsibleSection>
                     )}

                     <CollapsibleSection title="Negative Prompt — Avoid / Exclude" colorClass="text-red-400">
                         <ComboboxField label="What should NOT appear" value={negativePrompt} onChange={setNegativePrompt} options={["ugly, deformed, low quality, watermark, text"]} variant="slate" />
                     </CollapsibleSection>
                  </>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[40%]">
              <div className="sticky top-[40px] flex flex-col gap-4">
                
                {mode === "music" ? (
                  <>
                    {/* BLOCK 1 - ACE CAPTION */}
                    <div className="bg-black border-2 border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                      <div className="bg-cyan-500/10 px-5 py-4 border-b border-cyan-500/20 flex justify-between items-center">
                        <span className="font-mono text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                          PASTE THIS INTO COMFYUI → caption field
                        </span>
                      </div>
                      
                      <div className="p-6">
                        <div className="font-mono text-xl text-cyan-300 leading-relaxed break-words min-h-[120px]">
                          {aceCaption || <span className="text-cyan-900 italic">Configure parameters to generate ACE caption...</span>}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aceCaption);
                            setCopiedFormat("ace");
                            setTimeout(() => setCopiedFormat(null), 2000);
                          }}
                          className="w-full bg-cyan-500 text-black py-4 font-black rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-widest text-xs"
                        >
                          {copiedFormat === "ace" ? <CheckCircle size={18} /> : <Copy size={18} />}
                          {copiedFormat === "ace" ? "COPIED TO CLIPBOARD" : "COPY ACE CAPTION"}
                        </button>
                      </div>
                    </div>

                    {/* BLOCK 2 - SUNO / UDIO */}
                    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl overflow-hidden flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                      <div className="bg-[#181b24] px-5 py-4 border-b border-[#1f2330] flex justify-between items-center">
                        <span className="font-syne text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          FOR SUNO / UDIO / REFERENCE
                        </span>
                      </div>
                      
                      <div className="p-6">
                        <div className="font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">
                          {masterPrompt || <span className="text-zinc-700 italic">Structured prompt format...</span>}
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <button 
                          onClick={handleCopy}
                          className="w-full bg-[#1f2330] hover:bg-[#252a3a] text-zinc-300 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-[#2f354a] text-[10px] uppercase tracking-widest"
                        >
                          {copiedFormat === "text" ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                          {copiedFormat === "text" ? "COPIED" : "COPY FULL PROMPT"}
                        </button>
                      </div>
                    </div>

                    <div className="px-2">
                       <CollapsibleSection title="ACE-Step ComfyUI Settings Reference" colorClass="text-zinc-600">
                          <div className="font-mono text-[10px] text-zinc-500 space-y-1.5 pt-2">
                             <div className="flex justify-between"><span>temperature:</span> <span className="text-zinc-300">0.85</span></div>
                             <div className="flex justify-between"><span>dit_guidance_scale:</span> <span className="text-zinc-300">7.5</span></div>
                             <div className="flex justify-between"><span>dit_inference_steps:</span> <span className="text-zinc-300">60</span></div>
                             <div className="flex justify-between"><span>thinking:</span> <span className="text-cyan-500 font-bold">ON</span></div>
                             <div className="flex justify-between"><span>use_cot_caption:</span> <span className="text-cyan-500 font-bold">ON</span></div>
                             <div className="flex justify-between"><span>use_cot_language:</span> <span className="text-cyan-500 font-bold">ON</span></div>
                             <div className="flex justify-between"><span>lm_cfg_scale:</span> <span className="text-zinc-300">2.0</span></div>
                             <div className="flex justify-between"><span>lm_top_p:</span> <span className="text-zinc-300">0.90</span></div>
                             <div className="flex justify-between"><span>lm_top_k:</span> <span className="text-zinc-300">0</span></div>
                             <div className="flex justify-between"><span>seed:</span> <span className="text-zinc-300">-1 (random)</span></div>
                             <div className="flex justify-between"><span>dit_infer_method:</span> <span className="text-zinc-300">ode</span></div>
                             <div className="flex justify-between"><span>is_instrumental:</span> <span className={cn(aceIsInstrumental ? "text-indigo-400" : "text-zinc-600")}>{aceIsInstrumental ? "TRUE" : "FALSE"}</span></div>
                          </div>
                       </CollapsibleSection>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50">
                      <div className="bg-[#181b24] px-5 py-4 border-b border-[#1f2330] flex justify-between items-center">
                        <span className="font-[family-name:var(--font-syne)] text-sm font-bold text-white flex items-center gap-2">
                          <Eye size={16} className="text-indigo-400" /> Live Compilation
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-widest">{mode} pipeline</span>
                      </div>
                      
                      <div className="p-6 flex-1 min-h-[220px]">
                        <div className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                          {masterPrompt || <span className="text-slate-600 italic">Populate granular fields to build the prompt...</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-5 flex flex-col items-center text-center">
                        <div className="relative w-16 h-16 mb-3">
                          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#1f2330" strokeWidth="6" fill="none" />
                            <circle cx="50" cy="50" r="40" stroke={qualityScore > 75 ? "#2dd4bf" : qualityScore > 40 ? "#fbbf24" : "#f87171"} strokeWidth="6" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * qualityScore) / 100} className="transition-all duration-700 ease-out" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-white">{qualityScore}</div>
                        </div>
                        <div className="font-bold text-[10px] text-white uppercase tracking-widest mb-1">Density Score</div>
                        <div className="text-[9px] text-slate-500 leading-tight">Fill more parameters to increase prompt density.</div>
                      </div>
                      
                      <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-5 flex flex-col justify-center">
                        <div className="font-bold text-[10px] text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
                          <BoxSelect size={12} className="text-purple-400" /> System Estimator
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs border-b border-[#1f2330] pb-1"><span className="text-slate-500">VRAM</span><span className="text-white font-bold">{estimatorStats().vram}</span></div>
                          <div className="flex justify-between text-xs border-b border-[#1f2330] pb-1"><span className="text-slate-500">Est Time</span><span className="text-purple-400 font-bold">{estimatorStats().time}</span></div>
                          <div className="flex justify-between text-xs pt-1"><span className="text-slate-500">Hardware</span><span className="text-slate-300 text-[10px]">{estimatorStats().tier}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button onClick={handleCopy} className="bg-[#181b24] hover:bg-[#1f2330] border border-[#1f2330] hover:border-purple-400/50 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all group font-bold text-[10px] uppercase tracking-wider">
                        {copiedFormat === "text" ? <Check size={14} className="text-teal-400" /> : <Copy size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />}
                        Copy Prompt Text
                      </button>
                      <button onClick={handleExportJson} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:saturate-150 border border-transparent text-white rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.2)] font-bold text-[10px] uppercase tracking-wider">
                        {copiedFormat === "json" ? <Check size={14} className="text-white" /> : <Download size={14} className="text-white" />}
                        ComfyUI JSON
                      </button>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-slate-500 text-center mt-2 px-6">JSON payloads include exact UI metadata perfect for REST APIs or complex nodes.</p>

              </div>
            </div>
          </div>
        )}

        {view === "history" && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[50vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-[family-name:var(--font-syne)] font-bold text-white">Local Generation History</h2>
              <button onClick={() => { localStorage.removeItem("nd_prompt_history"); setHistory([]); }} className="text-xs text-red-400 hover:text-white transition-colors uppercase font-bold tracking-widest">Clear History</button>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border border-[#1f2330] rounded-2xl bg-[#12151c]">No prompt history found.</div>
            ) : (
               history.map((h, i) => (
                <div key={i} className="bg-[#12151c] border border-[#1f2330] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#181b24] transition-colors">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <History size={12} /> {new Date(h.id).toLocaleString()} · {h.mode}
                    </div>
                    <div className="font-mono text-xs text-slate-200 line-clamp-2">{h.prompt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === "gallery" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {COMMUNITY_PROMPTS.slice(0, 12).map((cp, idx) => (
              <div key={idx} className="bg-[#12151c] border border-[#1f2330] rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="h-28 w-full opacity-60" style={{ background: cp.background }} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-slate-300 font-bold uppercase mb-2">{cp.author}</div>
                  <div className="font-mono text-[10px] text-slate-400 line-clamp-4 flex-1">{cp.prompt}</div>
                  <div className="text-[10px] text-slate-500 flex gap-3 mt-4 pt-4 border-t border-[#1f2330]">
                    <span>↓ {cp.downloads}</span><span>★ {cp.stars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
