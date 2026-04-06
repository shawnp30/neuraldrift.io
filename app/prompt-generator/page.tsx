"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Sparkles, Image as ImageIcon, Video, Download, Copy, Check, Wand2, Music, Mic, ChevronDown, CheckCircle, Eye, BoxSelect, History, Settings, Loader2, Save, X, BookOpen
} from "lucide-react";
import Link from "next/link";
import { COMMUNITY_PROMPTS } from "./data";
import { QUALITY_TIERS, QUALITY_SUFFIX, SUGGESTIONS, OPTIONS, REFERENCE_ARTISTS, getSuggestedBPM, QualityTier, ACE_POOLS, ACE_LYRIC_POOLS, ACE_LYRIC_TEMPLATES, ACE_LYRIC_SEED_BANK, ANIME_POOLS } from "./options";


type Mode = "image" | "video" | "music" | "lyrics";
type ExportFormat = "json" | "text" | "a1111" | "api" | "link" | "ace" | "lyrics";
type LyricSectionType = "intro" | "verse" | "chorus" | "bridge" | "hook" | "pre-chorus" | "interlude" | "outro";
interface LyricSection {
  id: string;
  type: LyricSectionType;
  lyrics: string;
  emotion?: string;
  isAiAssistOpen: boolean;
  aiAssistPrompt: string;
}
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
      <label className={cn("font-[800] text-[10px] uppercase tracking-widest mb-2", vColor.split(' ')[0])}>{label}</label>
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
    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl shadow-sm">
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
    <div className="bg-[#0f111a] border-x border-t border-[#1f2330] last:border-b rounded-none first:rounded-t-2xl last:rounded-b-2xl shadow-inner flex flex-col relative group">
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
  const [lyricSections, setLyricSections] = useState<LyricSection[]>([]);
  const [lyricLanguage, setLyricLanguage] = useState("English");
  const [lyricVocalStyle, setLyricVocalStyle] = useState("Modern Pop");
  const [lyricVocalGender, setLyricVocalGender] = useState("male");
  const [lyricThematicDirection, setLyricThematicDirection] = useState("");
  const [isGeneratingSectionId, setIsGeneratingSectionId] = useState<string | null>(null);

  // Anime state
  const [animeStyles, setAnimeStyles] = useState<string[]>([]);
  const [animeModel, setAnimeModel] = useState(ANIME_POOLS.MODELS[0].name);
  const [animeLora, setAnimeLora] = useState("");
  const [animeAction, setAnimeAction] = useState("");
  const [animeFraming, setAnimeFraming] = useState("");
  const [animeVfx, setAnimeVfx] = useState("");
  const [animeMotion, setAnimeMotion] = useState(ANIME_POOLS.MOTION[1]);
  const [useDanbooru, setUseDanbooru] = useState(false);
  const [useProNarrative, setUseProNarrative] = useState(false);

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
        // Parse the generated lyrics into the sections state
        const lines = data.lyrics.split("\n");
        const newSections: LyricSection[] = [];
        let currentSection: LyricSection | null = null;

        lines.forEach((line: string) => {
          const tagMatch = line.match(/^\[(intro|verse|chorus|bridge|hook|pre-chorus|interlude|outro).*?\]/i);
          if (tagMatch) {
            if (currentSection) newSections.push(currentSection);
            currentSection = {
              id: Math.random().toString(36).substr(2, 9),
              type: tagMatch[1].toLowerCase() as LyricSectionType,
              lyrics: "",
              isAiAssistOpen: false,
              aiAssistPrompt: ""
            };
          } else if (currentSection && line.trim()) {
            currentSection.lyrics += line + "\n";
          }
        });
        if (currentSection) newSections.push(currentSection);
        
        if (newSections.length > 0) {
          setLyricSections(newSections);
        } else {
          // Fallback: Just set the raw prompt if parsing fails or return format is weird
          setMasterPrompt(data.lyrics);
        }
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

  const handleAiGenerateSection = async (sectionId: string) => {
    const section = lyricSections.find(s => s.id === sectionId);
    if (!section || !section.aiAssistPrompt.trim()) return;
    
    setIsGeneratingSectionId(sectionId);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ 
          message: `Generate only lyrics for a [${section.type}] section. Theme: ${lyricThematicDirection}. Focus: ${section.aiAssistPrompt}. Emotion: ${section.emotion || 'neutral'}. Language: ${lyricLanguage}.`, 
          mode: "lyrics" 
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setLyricSections(prev => prev.map(s => 
        s.id === sectionId ? { ...s, lyrics: data.lyrics.replace(/\[.*?\]/g, "").trim() } : s
      ));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingSectionId(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("nd_prompt_history");
    if (saved) { try { setHistory(JSON.parse(saved)); } catch(e){} }
  }, []);

  useEffect(() => {
    setAceGenre(""); setAceBpm(""); setAceInstruments(""); setAceTexture(""); setAceMood("");
    setAceEra(""); setAceMix(""); setAceVocals(""); setAceActiveNegatives([]); setAceLora("");
    setFilmStock(""); setCustomNarrative("");
    setLyricSections([]); setLyricThematicDirection("");
  }, [mode]);

  useEffect(() => {
    if (isAiGenerating) return; // Don't override if AI is currently writing

    const parts: string[] = [];
    if (mode === "lyrics") {
      parts.push(`[language: ${lyricLanguage.toLowerCase()}]`);
      
      lyricSections.forEach(section => {
        parts.push(`\n[${section.type}]`);
        if (section.emotion) parts.push(`[emotion: ${section.emotion}]`);
        parts.push(section.lyrics || "(Instrumental)");
      });

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
    } else if (mode === "video" || mode === "image") {
       // VISUAL MODES (Anime Architect + Cinematic)
       const selectedModelObj = ANIME_POOLS.MODELS.find(m => m.name === animeModel);
       const isVid = mode === "video";
       
       if (useProNarrative) {
         // PRO NARRATIVE ENGINE
         const narrative = [
           `A masterpiece high-fidelity anime ${isVid ? 'film sequence' : 'illustration'} of ${subject || 'a mysterious character'}`,
           animeAction ? `engaged in ${animeAction.toLowerCase()}` : "in a powerful stance",
           isVid && motion ? `with ${motion.toLowerCase()} movement` : "",
           animeFraming ? `captured with a ${animeFraming.toLowerCase()}` : "cinematically framed",
           `set within a detailed ${environment || 'world'} during ${timeOfDay || 'dramatic lighting'}`,
           `illuminated by ${lighting || 'ambient'} light to create a ${mood || 'striking'} atmosphere`,
           animeVfx ? `featuring ${animeVfx.toLowerCase()} to enhance the visual impact` : "",
           `Rendered in the distinct aesthetic of ${animeStyles.length > 0 ? animeStyles.join(' and ') : 'modern high-end anime'}`,
           isVid && animeMotion ? `Animation style: ${animeMotion}` : "",
           useDanbooru ? selectedModelObj?.qualityTags : "",
           animeLora ? `<lora:${animeLora}:0.8>` : "",
           QUALITY_SUFFIX[qualityTier]
         ].filter(Boolean).join(". ") + ".";
         
         setMasterPrompt(`${narrative} ${isVid ? '--style cinematic' : '--ar 16:9 --style raw'}`);
       } else {
         // STANDARD MODE
         const animeTags = [
           animeAction,
           animeFraming,
           animeVfx,
           ...animeStyles,
           isVid ? animeMotion : "",
           useDanbooru ? selectedModelObj?.qualityTags : "",
           animeLora ? `<lora:${animeLora}:0.8>` : ""
         ].filter(Boolean);

         const visualParts = [
           subject || "Artistic vision",
           ...animeTags,
           isVid ? motion : "",
           style,
           camera,
           lighting,
           colorPalette,
           colorGrade,
           mood,
           detail,
           QUALITY_SUFFIX[qualityTier]
         ].filter(Boolean);
         
         setMasterPrompt(`${visualParts.join(", ")} ${isVid ? '--style cinematic' : '--ar 16:9 --style raw'}`);
       }
     }
  }, [mode, qualityTier, subject, action, environment, timeOfDay, mood, lighting, camera, style, colorPalette, composition, detail, motion, colorGrade, aceGenre, aceBpm, aceInstruments, aceTexture, aceMood, aceEra, aceMix, aceVocals, aceDuration, aceLora, aceActiveNegatives, aceSampleMode, aceIsInstrumental, filmStock, customNarrative, lyricSections, lyricLanguage, lyricVocalStyle, lyricVocalGender, lyricThematicDirection, isAiGenerating, negativePrompt, animeStyles, animeModel, animeLora, animeAction, animeFraming, animeVfx, animeMotion, useDanbooru, useProNarrative]);

  const handleRandomizeAnime = (includeGlobal: boolean = false) => {
    // Pick 1-2 random styles
    const randomStyles = [...ANIME_POOLS.STYLES].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
    setAnimeStyles(randomStyles);

    // Pick random action, framing, vfx
    setAnimeAction(ANIME_POOLS.ACTIONS[Math.floor(Math.random() * ANIME_POOLS.ACTIONS.length)]);
    setAnimeFraming(ANIME_POOLS.FRAMING[Math.floor(Math.random() * ANIME_POOLS.FRAMING.length)]);
    setAnimeVfx(ANIME_POOLS.VFX[Math.floor(Math.random() * ANIME_POOLS.VFX.length)]);

    if (includeGlobal) {
      setSubject(SUGGESTIONS.subject[Math.floor(Math.random() * SUGGESTIONS.subject.length)]);
      setEnvironment(SUGGESTIONS.environment[Math.floor(Math.random() * SUGGESTIONS.environment.length)]);
      setLighting(OPTIONS.lighting[Math.floor(Math.random() * OPTIONS.lighting.length)]);
      setMood(OPTIONS.mood[Math.floor(Math.random() * OPTIONS.mood.length)]);
    }
  };

  // Scene-to-Workflow Engine
  async function handleDownloadWorkflow() {
    try {
      const templateName = mode === "video" ? "animatediff-character-loop.json" : "flux-portrait-lora.json";
      const response = await fetch(`/workflows/templates/${templateName}`);
      if (!response.ok) throw new Error("Template not found");
      
      let workflowJson = await response.text();
      
      // Basic substitution map
      const subs: Record<string, string | number> = {
        "__POSITIVE_PROMPT__": masterPrompt,
        "__NEGATIVE_PROMPT__": negativePrompt,
        "__LORA_NAME__": animeLora || "flux_realism_lora.safetensors",
        "__LORA_STRENGTH__": 0.8,
        "__WIDTH__": 1024,
        "__HEIGHT__": 1024,
        "__SEED__": Math.floor(Math.random() * 1000000),
        "__STEPS__": 20,
        "__CFG__": 1.0,
        "__SAMPLER__": "euler",
        "__SCHEDULER__": "simple",
        "__DENOISE__": 1.0,
        "__HARDWARE_TIER__": "Expert (24GB VRAM)",
        "__FRAMES__": 16,
        "__MODEL_FILENAME__": mode === "video" ? "sd_v1-5_pruned_noema.safetensors" : "flux1-dev-fp8.safetensors"
      };

      // Apply substitutions with proper escaping
      Object.entries(subs).forEach(([key, val]) => {
        const regex = new RegExp(key, "g");
        const safeVal = typeof val === 'string' 
          ? JSON.stringify(val).slice(1, -1) // Escape for JSON but remove surrounding quotes
          : String(val);
        workflowJson = workflowJson.replace(regex, safeVal);
      });

      // Trigger download
      const blob = new Blob([workflowJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuraldrift_${mode}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Workflow export failed:", err);
      alert("Failed to export workflow. Please check console.");
    }
  }

  useEffect(() => {
    let score = 0;
    const countFilled = (arr: any[]) => arr.filter(Boolean).length;
    if (mode === "lyrics") {
      score += (lyricSections.length > 0 ? 30 : 0);
      score += (lyricThematicDirection ? 20 : 0);
      score += (lyricSections.filter(s => s.lyrics).length * 10);
    } else if (mode === "music") {
      score += countFilled([aceGenre, aceInstruments, aceBpm, aceTexture, aceVocals]) * 15;
    } else {
      score += countFilled([subject, environment, lighting, camera, style]) * 15;
      if (subject.length > 20) score += 10;
      if (qualityTier === "cinematic" || qualityTier === "ultra") score += 10;
    }
    setQualityScore(Math.min(score, 100));
  }, [masterPrompt, mode, qualityTier, subject, environment, lighting, camera, style, lyricSections, lyricLanguage, lyricThematicDirection, aceGenre, aceInstruments, aceBpm, aceTexture, aceVocals]);

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

  const handleLoadTemplate = (templateId: string) => {
    const template = ACE_LYRIC_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setLyricLanguage(template.language);
    setLyricThematicDirection(template.theme);
    if ((template as any).style) setLyricVocalStyle((template as any).style);
    
    const newSections: LyricSection[] = template.sections.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      type: s.type as LyricSectionType,
      lyrics: s.lyrics,
      emotion: s.emotion,
      isAiAssistOpen: false,
      aiAssistPrompt: ""
    }));
    setLyricSections(newSections);
  };

  const handleRandomize = () => {
    const r = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    if (mode === "lyrics") {
      const themes = ACE_LYRIC_POOLS.THEMES;
      const theme = r(themes);
      setLyricThematicDirection(theme);
      setLyricLanguage(r(ACE_LYRIC_POOLS.LANGUAGES));
      setLyricVocalStyle(r(ACE_LYRIC_POOLS.VOCAL_STYLES));
      setLyricVocalGender(r(["male", "female", "vocalist"]));
      
      const presets = [
        ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
        ["intro", "verse", "verse", "hook", "verse", "hook", "outro"],
        ["verse", "chorus", "verse", "chorus", "outro"]
      ] as LyricSectionType[][];
      
      const structure = r(presets);
      const newSections: LyricSection[] = structure.map(type => {
        let randomLyrics = "";
        if (type === "intro") randomLyrics = `[${r(["ambient swell", "gentle piano", "drum intro", "distorted noise"])}]`;
        else if (type === "outro") randomLyrics = `[${r(["fading echo", "sudden cutoff", "vocal adlibs", "instrumental tail"])}]`;
        else if (type === "chorus" || type === "hook") randomLyrics = r(ACE_LYRIC_SEED_BANK.HOOKS) + "\n" + r(ACE_LYRIC_SEED_BANK.HOOKS);
        else {
          randomLyrics = r(ACE_LYRIC_SEED_BANK.OPENING) + "\n" + r(ACE_LYRIC_SEED_BANK.IMAGERY) + "\n" + r(ACE_LYRIC_SEED_BANK.CLOSING);
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          type,
          lyrics: randomLyrics,
          emotion: r(ACE_LYRIC_POOLS.EMOTIONS),
          isAiAssistOpen: false,
          aiAssistPrompt: ""
        };
      });
      setLyricSections(newSections);
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
    <div className="min-h-screen bg-[#08090d] text-slate-200 pt-32 pb-32 font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#1f2330] pb-6">
            <div>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">{"//"} THE CREATIVE COMMAND CENTER</p>
              <h1 className="font-syne text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1] m-0">
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

                    {/* Anime Technical Stack Reference */}
                    {animeStyles.length > 0 && (mode === "image" || mode === "video") && (
                      <div className="bg-gradient-to-br from-[#1a1c25] to-[#12151c] border border-pink-500/20 rounded-2xl p-5 mb-4 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <ImageIcon size={40} className="text-pink-400" />
                        </div>
                        <label className="text-pink-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                           <CheckCircle size={12} /> Anime Technical Stack
                        </label>
                        <div className="space-y-3">
                           <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                              <span className="text-[9px] text-pink-400 uppercase font-black block mb-1">Recommended Checkpoint</span>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-white font-mono">{animeModel}</span>
                                <a 
                                  href={ANIME_POOLS.MODELS.find(m => m.name === animeModel)?.link} 
                                  target="_blank" rel="noreferrer" 
                                  className="text-[9px] bg-pink-500/20 text-pink-400 px-2 py-1 rounded hover:bg-pink-500/30 transition-all font-bold"
                                >
                                  VIEW ON CIVITAI
                                </a>
                              </div>
                           </div>
                           {animeLora && (
                             <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                               <span className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Active LoRA Reference</span>
                               <span className="text-xs text-indigo-300 font-mono">{animeLora} (Strength: 0.8)</span>
                             </div>
                           )}
                           {mode === "video" && (
                             <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                               <span className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Motion Intent</span>
                               <span className="text-xs text-blue-300 font-mono">{animeMotion}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    )}

                    <div className="bg-[#12151c] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
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
                  <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="bg-[#12151c] border border-[#1f2330] rounded-2xl p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <ComboboxField 
                            label="Target Language" 
                            value={lyricLanguage} 
                            onChange={setLyricLanguage} 
                            options={ACE_LYRIC_POOLS.LANGUAGES} 
                            variant="purple" 
                          />
                          <ComboboxField 
                            label="Global Vocal Style" 
                            value={lyricVocalStyle} 
                            onChange={setLyricVocalStyle} 
                            options={ACE_LYRIC_POOLS.VOCAL_STYLES} 
                            variant="purple" 
                          />
                          <div className="space-y-4">
                            <label className="text-zinc-500 font-[800] text-[10px] uppercase tracking-widest block">Voice Gender</label>
                            <div className="flex bg-[#0a0c10] border border-[#1f2330] p-1 rounded-xl">
                              {(["male", "female", "vocalist"] as const).map(g => (
                                <button
                                  key={g}
                                  onClick={() => setLyricVocalGender(g)}
                                  className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                    lyricVocalGender === g ? "bg-purple-600 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"
                                  )}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-1.5 w-full">
                          <label className="text-zinc-500 font-[800] text-[10px] uppercase tracking-widest flex items-center gap-2">
                             Thematic Direction
                          </label>
                          <input 
                            type="text"
                            value={lyricThematicDirection}
                            onChange={(e) => setLyricThematicDirection(e.target.value)}
                            placeholder="e.g. redemption, heartbreak, revenge..."
                            className="w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-4 py-3 text-white font-[600] text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <label className="text-zinc-500 font-[800] text-[10px] uppercase tracking-widest block mb-4 italic">No-API Template Gallery</label>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6">
                           {ACE_LYRIC_TEMPLATES.filter(t => !t.id.includes('parody')).map(t => (
                             <button
                               key={t.id}
                               onClick={() => handleLoadTemplate(t.id)}
                               className="flex-shrink-0 w-64 bg-[#0a0c10] border border-[#1f2330] hover:border-purple-500/50 rounded-2xl p-4 text-left transition-all group relative overflow-hidden"
                             >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <Music size={40} className="text-purple-400" />
                                </div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{t.name}</h4>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-tight mb-2">{t.genre}</p>
                                <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2">{t.theme}</p>
                             </button>
                           ))}
                        </div>

                        <label className="text-red-400/80 font-[800] text-[10px] uppercase tracking-widest block mb-4 italic flex items-center gap-2">
                          <Mic size={12} /> Satire & Parody Engine (User Choice)
                        </label>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                           {ACE_LYRIC_TEMPLATES.filter(t => t.id.includes('parody')).map(t => (
                             <button
                               key={t.id}
                               onClick={() => handleLoadTemplate(t.id)}
                               className="flex-shrink-0 w-64 bg-red-500/5 border border-red-500/20 hover:border-red-500/50 rounded-2xl p-4 text-left transition-all group relative overflow-hidden"
                             >
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                   <Sparkles size={40} className="text-red-400" />
                                </div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{t.name}</h4>
                                <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight mb-2">{t.genre}</p>
                                <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2">{t.theme}</p>
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <label className="text-zinc-500 font-[800] text-[10px] uppercase tracking-widest block mb-4">Structure Templates (Manual)</label>
                        <div className="flex flex-wrap gap-2">
                           {[
                             { name: "Standard", struct: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"] },
                             { name: "Hip Hop", struct: ["intro", "verse", "verse", "hook", "verse", "hook", "outro"] },
                             { name: "Ballad", struct: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"] },
                             { name: "Punk", struct: ["verse", "chorus", "verse", "chorus", "outro"] },
                             { name: "Instrumental", struct: ["intro", "interlude", "outro"] }
                           ].map(p => (
                             <button
                               key={p.name}
                               onClick={() => {
                                 const news = p.struct.map(type => ({
                                   id: Math.random().toString(36).substr(2, 9),
                                   type: type as LyricSectionType,
                                   lyrics: "",
                                   isAiAssistOpen: false,
                                   aiAssistPrompt: ""
                                 }));
                                 setLyricSections(news as LyricSection[]);
                               }}
                               className="px-4 py-2 bg-[#0a0c10] border border-[#1f2330] rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:border-purple-500/50 transition-all uppercase tracking-tighter"
                             >
                               {p.name}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>

                    {/* Section Builder */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                          <Mic size={14} className="text-purple-400" /> Song Structure Architecture
                        </label>
                        <div className="relative group">
                          <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            Add Section <ChevronDown size={14} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-[#181b24] border border-[#1f2330] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            {ACE_LYRIC_POOLS.STRUCTURAL_TAGS.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  const news: LyricSection = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    type: tag as LyricSectionType,
                                    lyrics: "",
                                    isAiAssistOpen: false,
                                    aiAssistPrompt: ""
                                  };
                                  setLyricSections([...lyricSections, news]);
                                }}
                                className="w-full px-4 py-3 text-left text-[10px] font-bold text-zinc-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Reorder.Group axis="y" values={lyricSections} onReorder={setLyricSections} className="space-y-4">
                        {lyricSections.map((section) => {
                          const borderColorClass = {
                            intro: "border-l-zinc-500",
                            outro: "border-l-zinc-500",
                            verse: "border-l-blue-500",
                            chorus: "border-l-cyan-500",
                            bridge: "border-l-purple-500",
                            hook: "border-l-yellow-500",
                            "pre-chorus": "border-l-teal-500",
                            interlude: "border-l-zinc-700"
                          }[section.type];

                          return (
                            <Reorder.Item key={section.id} value={section}>
                              <div className={cn(
                                "bg-[#12151c] border border-[#1f2330] border-l-4 rounded-2xl p-5 shadow-xl transition-all",
                                borderColorClass
                              )}>
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors">
                                      <BoxSelect size={16} />
                                    </div>
                                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#52525b]">
                                      [{section.type}]
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                       onClick={() => {
                                         setLyricSections(lyricSections.map(s => s.id === section.id ? { ...s, isAiAssistOpen: !s.isAiAssistOpen } : s));
                                       }}
                                       className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all", section.isAiAssistOpen ? "bg-purple-500 text-white" : "bg-[#0a0c10] border border-[#1f2330] text-zinc-600 hover:text-zinc-400")}
                                    >
                                       AI ASSIST
                                    </button>
                                    <button 
                                      onClick={() => setLyricSections(lyricSections.filter(s => s.id !== section.id))}
                                      className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>

                                {section.isAiAssistOpen && (
                                  <div className="mb-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Section Assistant</span>
                                       {isGeneratingSectionId === section.id && <Loader2 className="animate-spin text-purple-400" size={12} />}
                                    </div>
                                    <textarea 
                                      value={section.aiAssistPrompt}
                                      onChange={(e) => setLyricSections(lyricSections.map(s => s.id === section.id ? { ...s, aiAssistPrompt: e.target.value } : s))}
                                      placeholder="Describe what this section should feel like..."
                                      className="w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-4 py-3 text-white font-[600] text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800 h-20"
                                    />
                                    <button 
                                      onClick={() => handleAiGenerateSection(section.id)}
                                      disabled={isAiGenerating || !!isGeneratingSectionId}
                                      className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                      Generate Suggestions
                                    </button>
                                  </div>
                                )}

                                <div className="space-y-4">
                                  <textarea 
                                    value={section.lyrics}
                                    onChange={(e) => setLyricSections(lyricSections.map(s => s.id === section.id ? { ...s, lyrics: e.target.value } : s))}
                                    placeholder={`Write your lyrics for [${section.type}]...`}
                                    className="w-full bg-[#0a0c10] border border-[#1f2330] rounded-xl px-5 py-4 text-white font-[600] text-base focus:border-purple-500/30 outline-none transition-all placeholder:text-zinc-800 min-h-[140px] font-mono leading-relaxed"
                                  />
                                  
                                  <div className="flex flex-wrap gap-2">
                                     {ACE_LYRIC_POOLS.EMOTIONS.map(emo => (
                                       <button
                                         key={emo}
                                         onClick={() => {
                                           setLyricSections(lyricSections.map(s => s.id === section.id ? { ...s, emotion: s.emotion === emo ? undefined : emo } : s));
                                         }}
                                         className={cn(
                                           "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border",
                                           section.emotion === emo 
                                             ? "bg-zinc-100 border-zinc-100 text-black shadow-lg shadow-white/5" 
                                             : "bg-[#0a0c10] border-[#1f2330] text-zinc-600 hover:text-zinc-400"
                                         )}
                                       >
                                         {emo}
                                       </button>
                                     ))}
                                  </div>
                                </div>
                              </div>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                    </div>
                  </div>

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

                    <div className="flex flex-col border border-[#1f2330] rounded-2xl shadow-2xl">
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
                           Load src_audio in ComfyUI for cover/remix mode. For painting, enable is_repaint in your server settings node.
                         </p>
                      </div>
                   </div>
                 </div>
                 ) : (
                   <div className="flex flex-col gap-4">
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

                     <CollapsibleSection title="Anime Architect — Styles & Technical Stack" step={stepNum(3)} colorClass="text-pink-400">
                        <div className="space-y-8">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-tight">One-Click Anime Randomizer</h3>
                                  <p className="text-[9px] text-zinc-500 uppercase font-medium">Instantly blend top anime presets</p>
                               </div>
                               <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleRandomizeAnime(false)}
                                    className="bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 px-3 py-2 rounded-xl text-[10px] font-black uppercase text-pink-400 transition-all flex items-center gap-2"
                                  >
                                    <Sparkles size={12} /> Anime Only
                                  </button>
                                  <button 
                                    onClick={() => handleRandomizeAnime(true)}
                                    className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-400 transition-all flex items-center gap-2"
                                  >
                                    <Wand2 size={12} /> Randomize All
                                  </button>
                               </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                              <label className="text-pink-400 font-[800] text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} /> Danbooru Tag Optimizer
                              </label>
                              <button 
                                onClick={() => setUseDanbooru(!useDanbooru)}
                                className={cn(
                                  "w-10 h-5 rounded-full p-1 transition-colors duration-200",
                                  useDanbooru ? "bg-pink-500" : "bg-zinc-800"
                                )}
                              >
                                <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", useDanbooru ? "translate-x-5" : "translate-x-0")} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                              <label className="text-indigo-400 font-[800] text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} /> Pro Narrative Mode (Verbose)
                              </label>
                              <button 
                                onClick={() => setUseProNarrative(!useProNarrative)}
                                className={cn(
                                  "w-10 h-5 rounded-full p-1 transition-colors duration-200",
                                  useProNarrative ? "bg-indigo-500" : "bg-zinc-800"
                                )}
                              >
                                <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", useProNarrative ? "translate-x-5" : "translate-x-0")} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-4">Top Anime Aesthetics (Intertwine-able)</label>
                            <div className="grid grid-cols-2 gap-2">
                               {ANIME_POOLS.STYLES.slice(0, 10).map((s, i) => (
                                 <button
                                   key={s}
                                   onClick={() => {
                                     if (animeStyles.includes(s)) setAnimeStyles(animeStyles.filter(x => x !== s));
                                     else setAnimeStyles([...animeStyles, s]);
                                   }}
                                   className={cn(
                                     "px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border text-left flex justify-between items-center group",
                                     animeStyles.includes(s) 
                                      ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20" 
                                      : "bg-[#0a0c10] border-[#1f2330] text-zinc-500 hover:text-zinc-300"
                                   )}
                                 >
                                   <span className="truncate">{s}</span>
                                   {i < 5 && <CheckCircle size={10} className={cn(animeStyles.includes(s) ? "text-white" : "text-pink-500/40")} />}
                                 </button>
                               ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                             <div>
                               <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-3 text-pink-400">Target Checkpoint</label>
                               <div className="space-y-4">
                                  {ANIME_POOLS.MODELS.map(m => (
                                    <button
                                      key={m.name}
                                      onClick={() => setAnimeModel(m.name)}
                                      className={cn(
                                        "w-full px-4 py-3 rounded-xl border text-left transition-all group",
                                        animeModel === m.name ? "bg-white/5 border-pink-500/50" : "bg-black/20 border-[#1f2330] opacity-60 hover:opacity-100"
                                      )}
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                         <span className={cn("text-[10px] font-black uppercase tracking-widest", animeModel === m.name ? "text-white" : "text-zinc-400")}>{m.name}</span>
                                         <a href={m.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-white/10 rounded transition-colors"><Download size={12} className="text-pink-500" /></a>
                                      </div>
                                      <p className="text-[9px] text-zinc-600 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">{m.useCase}</p>
                                    </button>
                                  ))}
                               </div>
                             </div>

                             <div className="space-y-6">
                                <ComboboxField 
                                  label="Anime LoRA" 
                                  value={animeLora} 
                                  onChange={setAnimeLora} 
                                  options={ANIME_POOLS.LORAS.map(l => l.name)} 
                                  variant="purple" 
                                />
                                <ComboboxField 
                                  label="Action / Combat Sequence" 
                                  value={animeAction} 
                                  onChange={setAnimeAction} 
                                  options={ANIME_POOLS.ACTIONS} 
                                  variant="pink" 
                                />
                                <ComboboxField 
                                  label="Action Shot / Framing" 
                                  value={animeFraming} 
                                  onChange={setAnimeFraming} 
                                  options={ANIME_POOLS.FRAMING} 
                                  variant="indigo" 
                                />
                                <ComboboxField 
                                  label="Visual Effects (VFX)" 
                                  value={animeVfx} 
                                  onChange={setAnimeVfx} 
                                  options={ANIME_POOLS.VFX} 
                                  variant="blue" 
                                />
                                {mode === "video" && (
                                  <ComboboxField 
                                    label="Motion Style" 
                                    value={animeMotion} 
                                    onChange={setAnimeMotion} 
                                    options={ANIME_POOLS.MOTION} 
                                    variant="blue" 
                                  />
                                )}
                                <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl">
                                   <p className="text-[9px] text-zinc-500 leading-relaxed">
                                      <strong className="text-pink-400 uppercase tracking-widest mb-1 block">Pro Tip:</strong>
                                      For perfect anime video, use <span className="text-white">AnimateDiff-Lightning</span> with the <span className="text-white">Traditional (On 2s)</span> motion style to simulate hand-drawn frames.
                                   </p>
                                </div>
                             </div>
                          </div>
                        </div>
                     </CollapsibleSection>

                     <CollapsibleSection title="Atmosphere & Photographic Control" step={stepNum(4)} colorClass="text-indigo-400">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                          <ComboboxField label="Lighting / Atmosphere" value={lighting} onChange={setLighting} options={OPTIONS.lighting} variant="slate" />
                          <ComboboxField label="Camera / Lens Ref" value={camera} onChange={setCamera} options={OPTIONS.camera} variant="slate" />
                          <ComboboxField label="Time of Day" value={timeOfDay} onChange={setTimeOfDay} options={OPTIONS.timeOfDay} variant="slate" />
                          <ComboboxField label="Film Stock / Grain" value={filmStock} onChange={setFilmStock} options={OPTIONS.filmStock} variant="slate" />
                          <ComboboxField label="Color Palette / Tone" value={colorPalette} onChange={setColorPalette} options={OPTIONS.colorPalette} variant="slate" />
                          <ComboboxField label="Composition / Frame" value={composition} onChange={setComposition} options={OPTIONS.composition} variant="slate" />
                          <ComboboxField label="Art Style / Movement" value={style} onChange={setStyle} options={OPTIONS.style} variant="slate" />
                          {mode === "image" && <ComboboxField label="Pro Detail / Sharpness" value={detail} onChange={setDetail} options={OPTIONS.detail} variant="slate" />}
                        </div>
                     </CollapsibleSection>

                     {mode === "video" && (
                       <CollapsibleSection title="Camera Motion & Color Grade" step={stepNum(5)} colorClass="text-blue-400">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <ComboboxField label="Camera Motion" value={motion} onChange={setMotion} options={OPTIONS.motion} variant="blue" />
                            <ComboboxField label="Color Grade Reference" value={colorGrade} onChange={setColorGrade} options={OPTIONS.colorGrade} variant="blue" />
                         </div>
                       </CollapsibleSection>
                     )}

                    <CollapsibleSection title="Negative Prompt — Avoid / Exclude" colorClass="text-red-400">
                        <ComboboxField label="What should NOT appear" value={negativePrompt} onChange={setNegativePrompt} options={["ugly, deformed, low quality, watermark, text"]} variant="slate" />
                    </CollapsibleSection>
                   </div>
                 )}
               </div>
             </div>

             <div className="w-full lg:w-[40%]">
              <div className="sticky top-[40px] flex flex-col gap-4">
                
                {/* Anime Technical Stack Reference */}
                {(mode === "image" || mode === "video") && animeStyles.length > 0 && (
                  <div className="bg-gradient-to-br from-[#1a1c25] to-[#12151c] border border-pink-500/20 rounded-2xl p-5 mb-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ImageIcon size={40} className="text-pink-400" />
                    </div>
                    <label className="text-pink-400/80 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                       <CheckCircle size={12} /> Anime Technical Stack
                    </label>
                    <div className="space-y-3">
                       <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                          <span className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Recommended Checkpoint</span>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white font-mono">{animeModel}</span>
                            {ANIME_POOLS.MODELS.find(m => m.name === animeModel)?.link && (
                              <a 
                                href={ANIME_POOLS.MODELS.find(m => m.name === animeModel)?.link} 
                                target="_blank" rel="noreferrer" 
                                className="text-[9px] bg-pink-500/20 text-pink-400 px-2 py-1 rounded hover:bg-pink-500/30 transition-all font-bold"
                              >
                                VIEW ON CIVITAI
                              </a>
                            )}
                          </div>
                       </div>
                       {animeLora && (
                         <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                           <span className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Active LoRA Reference</span>
                           <span className="text-xs text-indigo-300 font-mono">{animeLora} (Strength: 0.8)</span>
                         </div>
                       )}
                       {mode === "video" && (
                         <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                           <span className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Motion Intent</span>
                           <span className="text-xs text-blue-300 font-mono">{animeMotion}</span>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {mode === "music" || mode === "lyrics" ? (
                  <>
                    {/* ACE-Step Condensed Caption (NEW) */}
                    {mode === "lyrics" && (
                       <div className="bg-gradient-to-br from-[#1a1c25] to-[#12151c] border border-cyan-500/20 rounded-2xl p-5 shadow-inner relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Sparkles size={40} className="text-cyan-400" />
                          </div>
                          <label className="text-cyan-400/80 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                             <CheckCircle size={12} /> Optimized ACE-Step Caption
                          </label>
                          <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-cyan-200/90 leading-relaxed min-h-[50px] shadow-lg">
                            A {lyricVocalGender === 'vocalist' ? 'vocalist' : `${lyricVocalGender} voice`} performing a {lyricVocalStyle.toLowerCase()} song in {lyricLanguage} about {lyricThematicDirection.toLowerCase() || 'a creative vision'}, featuring high-fidelity production.
                          </div>
                          <button 
                            onClick={() => {
                              const caption = `A ${lyricVocalGender === 'vocalist' ? 'vocalist' : `${lyricVocalGender} voice`} performing a ${lyricVocalStyle.toLowerCase()} song in ${lyricLanguage} about ${lyricThematicDirection.toLowerCase() || 'a creative vision'}, featuring high-fidelity production.`;
                              navigator.clipboard.writeText(caption);
                              setCopiedFormat("ace");
                              setTimeout(() => setCopiedFormat(null), 2000);
                            }}
                            className="mt-3 w-full bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 py-2.5 rounded-xl text-[10px] font-black uppercase text-cyan-400 transition-all flex items-center justify-center gap-2"
                          >
                             {copiedFormat === "ace" ? <Check size={14} /> : <Copy size={14} />}
                             {copiedFormat === "ace" ? "COPIED CAPTION" : "Copy Concise Caption"}
                          </button>
                        </div>
                    )}

                    {/* BLOCK 1 - ACE CAPTION / LYRICS */}
                    <div className="bg-[#0a0c10] border-2 border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                      <div className="bg-cyan-500/10 px-5 py-4 border-b border-cyan-500/20 flex justify-between items-center">
                        <span className="font-mono text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                          {mode === "music" ? "PASTE THIS INTO COMFYUI → caption field" : "PASTE THIS INTO COMFYUI → lyrics field"}
                        </span>
                        {mode === "lyrics" && <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-tighter">ACE-Step 1.5 Compatible</span>}
                      </div>
                      
                      <div className="p-6">
                        <div className="font-mono text-lg text-cyan-300 leading-relaxed whitespace-pre-wrap break-words min-h-[120px]">
                          {mode === "music" ? (aceCaption || <span className="text-cyan-900 italic">Configure parameters to generate ACE caption...</span>) : (masterPrompt || <span className="text-cyan-900 italic">Architecture lyrics to see output...</span>)}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(mode === "music" ? aceCaption : masterPrompt);
                            setCopiedFormat(mode === "music" ? "text" : "lyrics");
                            setTimeout(() => setCopiedFormat(null), 2000);
                          }}
                          className={cn(
                            "w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] uppercase tracking-widest text-xs",
                            mode === "music" ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                          )}
                        >
                          {(copiedFormat === "text" || copiedFormat === "lyrics") ? <CheckCircle size={18} /> : <Copy size={18} />}
                          {(copiedFormat === "text" || copiedFormat === "lyrics") ? "COPIED TO CLIPBOARD" : mode === "music" ? "COPY ACE CAPTION" : "COPY LYRICS FOR COMFYUI"}
                        </button>
                      </div>
                    </div>

                    {mode === "music" && (
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
                    )}

                    <div className="px-2">
                       <CollapsibleSection title={mode === "music" ? "ACE-Step ComfyUI Settings Reference" : "ACE-Step Lyric Formatting Rules"} colorClass="text-zinc-600">
                          {mode === "music" ? (
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
                          ) : (
                            <div className="font-mono text-[9px] text-zinc-500 space-y-2 pt-2 uppercase tracking-tighter font-bold">
                               <p className="text-cyan-500/80 leading-relaxed border-l border-cyan-500/30 pl-2">
                                 - [section] tags must be on their own line<br/>
                                 - language tag at top is mandatory<br/>
                                 - emotion tags are inline [emotion: sad]<br/>
                                 - empty sections = instrumental
                               </p>
                            </div>
                          )}
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
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <button onClick={handleDownloadWorkflow} className="relative w-full bg-[#0a0c10] hover:bg-[#12151c] border border-indigo-500/30 text-indigo-400 rounded-xl py-4 flex flex-col items-center justify-center gap-1 transition-all font-bold text-[11px] uppercase tracking-wider shadow-2xl">
                          <div className="flex items-center gap-2">
                            {copiedFormat === "json" ? <Check size={16} className="text-white" /> : <Download size={16} className="text-indigo-400 group-hover:animate-bounce" />}
                            <span>Download High-Fidelity Workflow</span>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-medium lowercase tracking-normal">Bakes this scene into a master .json graph</span>
                        </button>
                      </div>
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
