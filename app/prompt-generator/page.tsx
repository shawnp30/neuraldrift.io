"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  Sparkles, Image as ImageIcon, Video, Download, Copy, Check, Wand2, Music, MinusCircle
} from "lucide-react";
import Link from "next/link";

// ── QUALITY TIERS ───────────────────────────────────────────────
const QUALITY_SUFFIX: Record<string, string> = {
  draft: "sharp, detailed",
  standard: "highly detailed, masterpiece, sharp focus",
  cinematic: "cinematic 8K, film grain, award-winning photography",
  ultra: "8K UHD, hyperrealistic, Unreal Engine 5, global illumination, subsurface scattering, photorealistic masterpiece",
};
const QUALITY_TIERS = ["draft", "standard", "cinematic", "ultra"] as const;
type QualityTier = typeof QUALITY_TIERS[number];

// ── SUGGESTIONS (free-text pill options) ─────────────────────────
const SUGGESTIONS = {
  subject: [
    "A battle-scarred chrome android standing in the rain",
    "A colossal interstellar dreadnought exiting hyperspace",
    "A neon-lit mech warrior with glowing plasma cannons",
    "A cloaked sorceress drawing runes of light in the air",
    "A towering ancient dragon with iridescent obsidian scales",
    "A wise elderly wizard with a glowing crystalline staff",
    "A pale figure standing motionless in a distant doorway",
    "A distorted shadow creature with no discernible form",
    "A lone wolf howling atop a snow-capped volcanic peak",
    "A bioluminescent deep-sea creature rising from the abyss",
    "A cyberpunk street artist tagging a brutalist concrete wall",
    "An elegant cyberpunk samurai with a monofilament blade",
    "A surreal melting clock face half-buried in desert sand",
    "A woman dissolving upward into shards of mirror glass",
    "Crystalline geometric megastructures of impossible scale",
    "Interconnected nodes of a pulsing neural network",
    "A stoic Roman legionnaire in gleaming lorica segmentata",
    "A samurai standing in morning fog, katana slowly drawn",
    "An astronaut floating through a corridor of nebula debris",
    "A macro close-up of a dewdrop suspended on a spider web",
  ],
  environment: [
    "in a rain-soaked Neo-Tokyo alleyway lined with holographic signs",
    "atop a cloud-piercing obsidian mountain at dusk",
    "inside a decaying Victorian mansion with shattered stained glass",
    "in a dense bioluminescent alien jungle at midnight",
    "on the surface of a ringed gas giant with city-sized storms",
    "in a sterile brutalist concrete megastructure",
    "beneath a collapsed freeway overpass in a post-apocalyptic city",
    "inside a server room filled with columns of pulsing blue light",
    "on a black sand beach beneath active volcanic eruptions",
    "in a field of giant glowing mushrooms beneath a twin moon sky",
    "on the crumbling rooftop of a skyscraper in a flooded megacity",
    "inside a cathedral forged entirely from bone and quartz crystal",
    "in a hyper-minimalist infinite white void room",
    "within a massive glacier cave with deep cerulean ice walls",
    "above the clouds in a drifting antique steam-powered airship",
    "on a burning bridge suspended over a sea of liquid copper",
    "inside a pocket dimension where space folds at the edges",
    "in the wreckage of a crashed alien spacecraft deep in a jungle",
  ],
  action: [
    "running desperately through smoke towards the camera",
    "slowly turning to face the viewer with unsettling stillness",
    "shattering into millions of glowing prismatic fragments",
    "seamlessly morphing into a flock of black ravens mid-flight",
    "floating effortlessly in zero gravity, arms outstretched",
    "drawing a blazing blade from a collapsing dimensional rift",
    "falling in extreme slow motion through shattered glass",
    "surfing a collapsing tidal wave of liquid chrome",
    "executing a spinning aerial kick with motion blur trails",
    "dissolving into mist and reforming ten feet away",
    "pressing palms against an invisible glass wall in panic",
    "ascending a spiral staircase that curves into infinity",
    "being consumed by an advancing wall of absolute shadow",
  ],
  audio_genre: [
    "90s Boom Bap Rap", "Modern Trap", "UK Drill", "G-Funk / West Coast Hip Hop",
    "Neo-Soul", "Contemporary R&B", "Vintage Motown Soul", "Jazz-infused Hip Hop",
    "Lofi / Chillhop", "Dreamy Jazzhop", "Acid Jazz", "Acid House / Techno",
    "Classic Reggae Dub", "Modern Dubstep Roots", "Ambient Chillout", "Space Ambient",
    "Phonk / Drift", "Cloud Rap", "Grime", "Boom Bap Jazz Fusion",
  ],
  audio_instruments: [
    "Heavy 808 sub-bass with distortion",
    "SP-1200 sampled drum break / vinyl crackle",
    "Smooth Fender Rhodes electric piano",
    "Vintage Moog Minimoog basslines",
    "Classic Roland TR-808 percussion set",
    "Distorted Acid TB-303 synthesizer",
    "Soulful brass section with Motown reverb",
    "Dub echo / delay drenched percussion",
    "Jazzy upright bass and muted trumpet",
    "Ethereal shimmering pads and choir stabs",
    "Gritty electric guitar with wah-wah pedal",
    "Saturated tape-hiss and analog warmth",
  ],
  audio_vocals: [
    "Deep baritone male rap vocal",
    "High-pitched soul female vocal / runs",
    "Smooth androgynous R&B harmony",
    "Raspy old-school gravelly voice",
    "Whispered intimate vocal delivery",
    "Aggressive rhythmic rap flow",
    "Melodic autotuned trap vocal",
    "Soulful gospel-style choir background",
    "Spoken word / poetical narration",
    "Operatic high-soprano overlays",
    "Gritty / distorted underground vocal",
    "Breathy and ethereal jazz vocal",
  ],
};

// ── SELECT OPTIONS (dropdown values) ────────────────────────────
const OPTIONS = {
  lighting: [
    "Cinematic dramatic side lighting",
    "Volumetric fog god rays",
    "Golden hour backlit silhouette",
    "Studio three-point professional lighting",
    "Harsh flash photography",
    "Bioluminescent ambient glow",
    "Rembrandt chiaroscuro shadow",
    "Neon noir reflections on wet pavement",
    "Soft diffused cloudy overcast",
    "Hard rim back-lighting",
    "Underwater caustic light shafts",
    "Candlelight flickering warm glow",
    "Harsh midday sun with deep cast shadows",
    "Moonlit cool blue ambient",
    "Practical neon sign color spill",
  ],
  camera: [
    "Arri Alexa LF / Cinema 4K",
    "RED V-Raptor / 8K RAW",
    "Panavision Anamorphic lenses",
    "Leica M11 / Summilux 35mm",
    "35mm anamorphic / film grain",
    "Hasselblad H6D / Medium format",
    "GoPro Hero 12 / HyperSmooth POV",
    "CCTV security grainy aesthetic",
    "Drone / High-altitude 4K gimbal",
    "Macro extreme close-up / 100mm lens",
    "Soviet-era Helios 44-2 / swirly bokeh",
    "Kodak Super 8 vintage home movie",
  ],
  filmStock: [
    "Kodak Portra 400 / Vivid skin tones",
    "Fujifilm Superia / Green-heavy shadows",
    "Kodak Vision3 500T / Cinematic blue tint",
    "Ilford HP5 Plus / High-contrast B&W",
    "Kodak Gold 200 / Warm nostalgic glow",
    "CineStill 800T / Halation red glow",
    "Expired Agfa film / Muted / Yellowed",
    "Modern digital pristine / No noise",
  ],
  style: [
    "High-fashion Vogue editorial",
    "Ethereal Brutalist architecture",
    "Surreal Neo-Futurism",
    "Hyper-realistic CGI Unreal Engine 5",
    "Dark Fantasy Oil Painting",
    "Cyberpunk Neon Noir",
    "Studio Ghibli / Whimsical Anime",
    "16-bit Pixel Art / Retro Gaming",
    "National Geographic / Raw Wildlife",
    "Blade Runner 2049 atmosphere",
    "Wes Anderson / Symmetrical Pastel",
    "A24 / Atmospheric Indie Film",
  ],
  motion: [
    "Slow cinematic push-in",
    "Rapid kinetic whip pan",
    "Dolly zoom Vertigo effect",
    "Static camera with subject motion only",
    "Handheld shaky documentary cam",
    "Smooth orbiting drone shot",
    "Crash zoom punch-in",
    "Slow-motion 240fps extreme",
    "Reverse motion playback",
    "Continuous unbroken long take",
    "Snap cut match action",
    "Spiral rotating crane shot",
  ],
  colorPalette: [
    "Warm amber and gold",
    "Cool desaturated blue-grey",
    "High contrast black and white",
    "Neon electric saturated",
    "Earth tones clay and terracotta",
    "Pastel soft washed-out",
    "Deep jewel tones emerald and violet",
    "Sepia aged vintage tone",
    "Monochromatic deep crimson",
    "Teal and orange blockbuster grade",
    "Muted desaturated bleach bypass",
    "Vivid complementary contrast",
  ],
  mood: [
    "Ethereal and otherworldly",
    "Oppressive and claustrophobic",
    "Serene and deeply peaceful",
    "Chaotic and overwhelming",
    "Melancholic and nostalgic",
    "Euphoric and transcendent",
    "Mysterious and uncertain",
    "Desolate and abandoned",
    "Intimate and tender",
    "Triumphant and powerful",
    "Dread and psychological horror",
    "Dreamlike and surreal",
  ],
  timeOfDay: [
    "Dawn first light pale sky",
    "Golden hour sunrise warm glow",
    "Harsh white noon sun",
    "Blue hour magic pre-dusk",
    "Dusk twilight fading light",
    "Deep midnight pitch black",
    "Stormy overcast brooding grey",
    "Clear cold starlit night",
    "Blood red volcanic sunset",
    "Foggy grey morning mist",
  ],
  composition: [
    "Rule of thirds offset subject",
    "Dead center perfect symmetry",
    "Leading diagonal lines",
    "Foreground frame within frame",
    "Vast negative space minimal",
    "Birds-eye overhead top-down",
    "Worms-eye extreme upward",
    "Asymmetric dynamic tension",
    "Golden spiral ratio",
    "Strong silhouette against sky",
  ],
  detail: [
    "Ultra sharp tack-focus",
    "Shallow depth of field bokeh",
    "Film grain 35mm texture",
    "Subsurface scattering skin",
    "Volumetric light god rays",
    "Chromatic aberration fringe",
    "Practical lens flare",
    "Deep focus everything sharp",
  ],
  colorGrade: [
    "Blade Runner neon cyan and magenta",
    "Saving Private Ryan desaturated grit",
    "The Matrix digital green tint",
    "Vintage Kodak Portra warm grain",
    "Teal-orange summer blockbuster",
    "Kubrick cold symmetrical blue",
    "Wong Kar-wai warm red and amber",
    "Se7en yellow-green gritty shadows",
  ],
  audio_tempo: [
    "Slow & atmospheric 60 BPM",
    "Mid-tempo groove 90 BPM",
    "Driving 120 BPM",
    "Fast & energetic 140 BPM",
    "Presto 180+ BPM frantic",
    "Largo 40 BPM meditative",
    "Audio-reactive variable pacing",
    "Rubato free expressive tempo",
  ],
  audio_ambience: [
    "Heavy cathedral reverb",
    "Vinyl crackle analog warmth",
    "Clean clinical dry studio",
    "Live concert hall bloom",
    "Underwater muffled and wobbly",
    "VHS tape saturation distortion",
    "Lo-fi cassette tape hiss",
    "8D spatial immersive audio",
    "Open air outdoor natural",
    "Tight dead room no reverb",
  ],
  audio_era: [
    "80s analog synth and drum machine",
    "90s alternative grunge raw",
    "Early 2000s digital production",
    "Modern trap and 808 bass",
    "Retro-futurist 70s space age",
    "Classical baroque period",
    "50s jazz club atmosphere",
    "60s psychedelic rock fuzz",
  ],
  audio_key: [
    "A minor — melancholic and emotional",
    "C major — bright and clear",
    "D Dorian — funky and mysterious",
    "E Phrygian — dark and Spanish",
    "B Phrygian dominant — epic oriental",
    "F Lydian — dreamy and floating",
    "G Mixolydian — bluesy rock",
    "C# minor — intense and dramatic",
  ],
};

const REFERENCE_ARTISTS = [
  "Hans Zimmer", "Daft Punk", "John Williams", "Trent Reznor",
  "Burial", "Flying Lotus", "Kendrick Lamar", "Max Richter",
  "Ennio Morricone", "Aphex Twin", "Brian Eno",
];

// ── SELECT FIELD COMPONENT ────────────────────────────────────────
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  variant?: "indigo" | "sky" | "emerald";
}

function SelectField({ label, value, onChange, options, variant = "indigo" }: SelectFieldProps) {
  const labelClass =
    variant === "sky" ? "text-sky-400" :
    variant === "emerald" ? "text-emerald-400" :
    "text-indigo-400";
  const focusClass =
    variant === "sky" ? "focus:border-sky-500" :
    variant === "emerald" ? "focus:border-emerald-500" :
    "focus:border-indigo-500";

  return (
    <div>
      <label className={`block ${labelClass} font-[800] text-[10px] uppercase tracking-widest mb-2`}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 font-[600] outline-none ${focusClass} transition-colors appearance-none`}
      >
        <option value="">(None)</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

// ── PILL BUTTON ───────────────────────────────────────────────────
interface PillProps {
  text: string;
  onClick: () => void;
  variant?: "default" | "sky" | "emerald";
  key?: string | number; // Added to resolve TS key mapping issue
}

function Pill({ text, onClick, variant = "default" }: PillProps) {
  const cls =
    variant === "sky" ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20 text-sky-400 hover:text-sky-300" :
    variant === "emerald" ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:text-emerald-300" :
    "bg-white/5 hover:bg-white/10 border-white/5 text-zinc-400 hover:text-white";
  return (
    <button onClick={onClick} className={`px-3 py-1.5 border rounded-lg text-xs font-[600] transition-colors ${cls}`}>
      {text}
    </button>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function PromptGeneratorPage() {
  const [mode, setMode] = useState<"image" | "video" | "music">("image");
  const [qualityTier, setQualityTier] = useState<QualityTier>("cinematic");

  // Visual state
  const [subject, setSubject] = useState("");
  const [environment, setEnvironment] = useState("");
  const [action, setAction] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [lighting, setLighting] = useState("");
  const [camera, setCamera] = useState("");
  const [style, setStyle] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [mood, setMood] = useState("");
  const [composition, setComposition] = useState("");
  const [detail, setDetail] = useState("");
  const [motion, setMotion] = useState("");
  const [colorGrade, setColorGrade] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  // Music state
  const [audioGenre, setAudioGenre] = useState("");
  const [audioInstruments, setAudioInstruments] = useState("");
  const [audioVocals, setAudioVocals] = useState("");
  const [audioTempo, setAudioTempo] = useState("");
  const [audioAmbience, setAudioAmbience] = useState("");
  const [audioReferenceArtist, setAudioReferenceArtist] = useState("");
  const [audioEra, setAudioEra] = useState("");
  const [audioKey, setAudioKey] = useState("");

  const [filmStock, setFilmStock] = useState("");
  const [customNarrative, setCustomNarrative] = useState("");

  const [masterPrompt, setMasterPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  // Clear mode-specific fields when switching
  useEffect(() => {
    setAction(""); setMotion(""); setColorGrade(""); setDetail(""); setNegativePrompt("");
    setAudioVocals(""); setFilmStock(""); setCustomNarrative("");
  }, [mode]);

  // Build prompt
  useEffect(() => {
    const parts: string[] = [];
    if (mode === "music") {
      if (audioGenre) parts.push(`Genre: ${audioGenre}`);
      if (audioVocals) parts.push(`Vocals: ${audioVocals}`);
      if (audioInstruments) parts.push(`Instrumentation: ${audioInstruments}`);
      if (audioTempo) parts.push(`Tempo: ${audioTempo}`);
      if (audioAmbience) parts.push(`Mix Atmosphere: ${audioAmbience}`);
      if (audioReferenceArtist) parts.push(`Style Reference: ${audioReferenceArtist}`);
      if (audioEra) parts.push(`Production Era: ${audioEra}`);
      if (audioKey) parts.push(`Harmonic Key: ${audioKey}`);
      if (customNarrative) parts.push(`Narrative Focus: ${customNarrative}`);
      if (parts.length > 0) parts.push("high-fidelity professional studio master, crystalline clarity, award-winning sound engineering");
    } else {
      if (subject) parts.push(subject);
      if (customNarrative) parts.push(`Scene Narrative: ${customNarrative}`);
      if (mode === "video" && action) parts.push(action);
      if (environment) parts.push(environment);
      if (timeOfDay) parts.push(timeOfDay);
      if (mood) parts.push(mood);
      if (lighting) parts.push(lighting);
      if (camera) parts.push(camera);
      if (filmStock) parts.push(`Film Stock: ${filmStock}`);
      if (style) parts.push(style);
      if (colorPalette) parts.push(colorPalette);
      if (composition) parts.push(composition);
      if (mode === "image" && detail) parts.push(detail);
      if (mode === "video" && motion) parts.push(motion);
      if (mode === "video" && colorGrade) parts.push(colorGrade);
      if (parts.length > 0) parts.push(QUALITY_SUFFIX[qualityTier]);
    }
    setMasterPrompt(parts.join(", "));
  }, [mode, qualityTier, subject, action, environment, timeOfDay, mood, lighting, camera, style, colorPalette, composition, detail, motion, colorGrade, audioGenre, audioInstruments, audioTempo, audioAmbience, audioReferenceArtist, audioEra, audioKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    const r = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    if (mode === "music") {
      setAudioGenre(r(SUGGESTIONS.audio_genre));
      setAudioInstruments(r(SUGGESTIONS.audio_instruments));
      setAudioVocals(r(SUGGESTIONS.audio_vocals));
      setAudioTempo(r(OPTIONS.audio_tempo));
      setAudioAmbience(r(OPTIONS.audio_ambience));
      setAudioReferenceArtist(r(REFERENCE_ARTISTS));
      setAudioEra(r(OPTIONS.audio_era));
      setAudioKey(r(OPTIONS.audio_key));
    } else {
      setSubject(r(SUGGESTIONS.subject));
      setEnvironment(r(SUGGESTIONS.environment));
      setTimeOfDay(r(OPTIONS.timeOfDay));
      setMood(r(OPTIONS.mood));
      setLighting(r(OPTIONS.lighting));
      setCamera(r(OPTIONS.camera));
      setFilmStock(r(OPTIONS.filmStock));
      setStyle(r(OPTIONS.style));
      setColorPalette(r(OPTIONS.colorPalette));
      setComposition(r(OPTIONS.composition));
      setQualityTier(r([...QUALITY_TIERS]));
      if (mode === "video") {
        setAction(r(SUGGESTIONS.action));
        setMotion(r(OPTIONS.motion));
        setColorGrade(r(OPTIONS.colorGrade));
      }
      if (mode === "image") {
        setDetail(r(OPTIONS.detail));
      }
    }
  };

  const handleExportJson = () => {
    const payload: Record<string, unknown> = {
      prompt: masterPrompt,
      ...(negativePrompt && { negative_prompt: negativePrompt }),
      quality_tier: qualityTier,
      metadata: {
        mode, subject, environment, lighting, camera, style,
        colorPalette, mood, timeOfDay, composition, filmStock, customNarrative,
        ...(mode === "image" && { detail }),
        ...(mode === "video" && { action, motion, colorGrade }),
        ...(mode === "music" && { audioGenre, audioInstruments, audioVocals, audioTempo, audioAmbience, audioReferenceArtist, audioEra, audioKey }),
      },
      comfyui_ready: true,
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

  const stepNum = (n: number) => (
    <span className="text-zinc-700 font-mono font-black text-xs mr-2">0{n} /</span>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-24 pb-32 font-sans relative">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 mb-16 text-center">
        <p className="text-pink-400 font-[800] tracking-widest uppercase text-sm mb-4">// Prompt Engineering Studio</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] tracking-tight text-white mb-6 drop-shadow-xl leading-tight">
          Craft the <span className="text-pink-400">Master Prompt.</span>
        </h1>
        <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Build granular, structured prompts for image, video, and music generation. Every field compounds into a precision output — export to ComfyUI JSON in one click.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-8">

        {/* LEFT: INPUTS */}
        <div className="w-full lg:w-3/5 space-y-6">

          {/* Mode Toggle */}
          <div className="bg-[#0f172a]/50 p-2 rounded-2xl flex flex-col sm:flex-row border border-indigo-500/20 backdrop-blur-xl">
            {([
              { key: "image", label: "Image Mode", Icon: ImageIcon, active: "bg-indigo-500" },
              { key: "video", label: "Video Mode", Icon: Video, active: "bg-sky-500" },
              { key: "music", label: "Music Mode", Icon: Music, active: "bg-emerald-500" },
            ] as const).map(({ key, label, Icon, active }) => (
              <button key={key}
                onClick={() => setMode(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-[800] text-sm transition-all ${mode === key ? `${active} text-white shadow-lg` : "text-zinc-500 hover:text-white"}`}
              >
                <Icon className="w-5 h-5" /> {label}
              </button>
            ))}
          </div>

          {/* Quality Tier (image + video only) */}
          {mode !== "music" && (
            <div className="bg-[#0f172a]/50 border border-white/5 rounded-2xl p-4 backdrop-blur-xl">
              <label className="block text-zinc-500 font-[800] text-[10px] uppercase tracking-widest mb-3">Quality Tier</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {QUALITY_TIERS.map((key) => (
                  <button key={key} onClick={() => setQualityTier(key)}
                    className={`py-2 px-3 rounded-xl font-[800] text-xs transition-all border capitalize ${
                      qualityTier === key
                        ? key === "draft" ? "bg-zinc-500/20 border-zinc-400 text-zinc-200"
                          : key === "standard" ? "bg-indigo-500/20 border-indigo-400 text-indigo-200"
                          : key === "cinematic" ? "bg-violet-500/20 border-violet-400 text-violet-200"
                          : "bg-amber-500/20 border-amber-400 text-amber-200"
                        : "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
                    }`}
                  >{key}</button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">{QUALITY_SUFFIX[qualityTier]}</p>
            </div>
          )}

          {/* Randomize */}
          <button
            onClick={handleRandomize}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-white font-[900] rounded-2xl transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 transform hover:scale-[1.01]"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            Surprise Me — Generate Full Prompt
          </button>

          {/* MAIN INPUT CARD */}
          <div className="bg-[#0f172a]/80 p-8 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl space-y-10">

            {mode === "music" ? (
              <>
                {/* Genre */}
                <div>
                  <label className="block text-emerald-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(1)} Genre & Style
                  </label>
                  <textarea value={audioGenre} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAudioGenre(e.target.value)}
                    placeholder="Describe the musical genre or style..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.audio_genre.map((s) => <Pill key={s} text={s} onClick={() => setAudioGenre(s)} variant="emerald" />)}
                  </div>
                </div>

                {/* Instruments */}
                <div>
                  <label className="block text-emerald-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(2)} Production & Instruments
                  </label>
                  <textarea value={audioInstruments} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAudioInstruments(e.target.value)}
                    placeholder="Describe the production textures... e.g. '808 sub-bass, vinyl crackle'..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.audio_instruments.map((s) => <Pill key={s} text={s} onClick={() => setAudioInstruments(s)} variant="emerald" />)}
                  </div>
                </div>

                {/* Vocals */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-emerald-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(3)} Vocals & Delivery
                  </label>
                  <textarea value={audioVocals} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAudioVocals(e.target.value)}
                    placeholder="Describe the vocal style... e.g. 'Deep male baritone rap, soulful high female adlibs'..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.audio_vocals.map((s) => <Pill key={s} text={s} onClick={() => setAudioVocals(s)} variant="emerald" />)}
                  </div>
                </div>

                {/* Reference Artist */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-emerald-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(4)} Reference Artist
                  </label>
                  <input type="text" value={audioReferenceArtist} onChange={(e) => setAudioReferenceArtist(e.target.value)}
                    placeholder="e.g. Hans Zimmer, Burial, Flying Lotus..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white font-[500] outline-none focus:border-emerald-500 transition-colors"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {REFERENCE_ARTISTS.map((s) => <Pill key={s} text={s} onClick={() => setAudioReferenceArtist(s)} variant="emerald" />)}
                  </div>
                </div>

                {/* Rhythm, Texture & Identity */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-emerald-400 font-[800] text-xs uppercase tracking-widest mb-6">
                    {stepNum(5)} Technical Audio Specifications
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField label="Tempo / BPM" value={audioTempo} onChange={setAudioTempo} options={OPTIONS.audio_tempo} variant="emerald" />
                    <SelectField label="Mixing Atmosphere" value={audioAmbience} onChange={setAudioAmbience} options={OPTIONS.audio_ambience} variant="emerald" />
                    <SelectField label="Production Era" value={audioEra} onChange={setAudioEra} options={OPTIONS.audio_era} variant="emerald" />
                    <SelectField label="Key / Scale" value={audioKey} onChange={setAudioKey} options={OPTIONS.audio_key} variant="emerald" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Subject */}
                <div>
                  <label className="block text-pink-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(1)} Focal Subject
                  </label>
                  <textarea value={subject} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSubject(e.target.value)}
                    placeholder="Describe your main character, object, or focal point..."
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.subject.map((s) => <Pill key={s} text={s} onClick={() => setSubject(s)} />)}
                  </div>
                </div>

                {/* Narrative Detail */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-indigo-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(2)} Creative Narrative / Story
                  </label>
                  <textarea value={customNarrative} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCustomNarrative(e.target.value)}
                    placeholder="Add specific storytelling details or unique elements..."
                    className="w-full h-20 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Video Action */}
                {mode === "video" && (
                  <div className="pt-6 border-t border-white/5">
                    <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-3">
                      {stepNum(3)} Dynamic Action
                    </label>
                    <textarea value={action} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAction(e.target.value)}
                      placeholder="What is the subject doing? e.g. 'running desperately', 'shattering into pieces'..."
                      className="w-full h-20 bg-sky-500/5 border border-sky-500/20 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-sky-500 transition-colors resize-none"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SUGGESTIONS.action.map((s) => <Pill key={s} text={s} onClick={() => setAction(s)} variant="sky" />)}
                    </div>
                  </div>
                )}

                {/* Environment */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-violet-400 font-[800] text-xs uppercase tracking-widest mb-3">
                    {stepNum(mode === "video" ? 4 : 3)} The Environment
                  </label>
                  <textarea value={environment} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEnvironment(e.target.value)}
                    placeholder="Where does this take place? e.g. 'in a rain-soaked neon alleyway'..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.environment.map((s) => <Pill key={s} text={s} onClick={() => setEnvironment(s)} />)}
                  </div>
                </div>

                {/* Aesthetic & Atmosphere */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-indigo-400 font-[800] text-xs uppercase tracking-widest mb-6">
                    {stepNum(mode === "video" ? 5 : 4)} Master Visual Settings
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField label="Time of Day" value={timeOfDay} onChange={setTimeOfDay} options={OPTIONS.timeOfDay} />
                    <SelectField label="Mood / Atmosphere" value={mood} onChange={setMood} options={OPTIONS.mood} />
                    <SelectField label="Lighting / Studio" value={lighting} onChange={setLighting} options={OPTIONS.lighting} />
                    <SelectField label="Professional Gear" value={camera} onChange={setCamera} options={OPTIONS.camera} />
                    {mode !== "music" && (
                      <SelectField label="Film Stock / Grain" value={filmStock} onChange={setFilmStock} options={OPTIONS.filmStock} />
                    )}
                    <SelectField label="Color Palette / Tone" value={colorPalette} onChange={setColorPalette} options={OPTIONS.colorPalette} />
                    <SelectField label="Composition / Frame" value={composition} onChange={setComposition} options={OPTIONS.composition} />
                    <SelectField label="Art Style / Movement" value={style} onChange={setStyle} options={OPTIONS.style} />
                    {mode === "image" && (
                      <SelectField label="Pro Detail / Sharpness" value={detail} onChange={setDetail} options={OPTIONS.detail} />
                    )}
                  </div>
                </div>

                {/* Video: Camera Motion + Color Grade */}
                {mode === "video" && (
                  <div className="pt-6 border-t border-white/5">
                    <label className="block text-sky-400 font-[800] text-xs uppercase tracking-widest mb-6">
                      {stepNum(5)} Camera Motion & Color Grade
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <SelectField label="Camera Motion" value={motion} onChange={setMotion} options={OPTIONS.motion} variant="sky" />
                      <SelectField label="Color Grade Reference" value={colorGrade} onChange={setColorGrade} options={OPTIONS.colorGrade} variant="sky" />
                    </div>
                  </div>
                )}

                {/* Negative Prompt */}
                <div className="pt-6 border-t border-white/5">
                  <label className="block text-red-400/80 font-[800] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MinusCircle className="w-3.5 h-3.5" /> Negative Prompt — Avoid / Exclude
                  </label>
                  <textarea value={negativePrompt} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNegativePrompt(e.target.value)}
                    placeholder="What should NOT appear: blurry, watermark, low quality, extra limbs, text..."
                    className="w-full h-16 bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4 text-white font-[500] outline-none focus:border-red-500/50 transition-colors resize-none text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: OUTPUT */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-32 space-y-4">
            <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500" />

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Wand2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-[800] text-white">Master Prompt</h3>
                  {mode !== "music" && (
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-[700] capitalize">{qualityTier} Quality Tier</p>
                  )}
                </div>
              </div>

              {/* Prompt output */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6 min-h-[160px] mb-4 shadow-inner font-mono text-sm leading-relaxed text-indigo-200">
                {masterPrompt || (
                  <span className="opacity-30">Your prompt builds here as you fill in the fields on the left...</span>
                )}
              </div>

              {/* Negative prompt preview */}
              {negativePrompt && mode !== "music" && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-4">
                  <p className="text-[10px] text-red-400/70 font-[800] uppercase tracking-widest mb-1">Negative Prompt</p>
                  <p className="font-mono text-xs text-red-300/60 leading-relaxed">{negativePrompt}</p>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={handleCopy} disabled={!masterPrompt}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-[800] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Copied to Clipboard!" : "Copy Prompt Text"}
                </button>

                <button onClick={handleExportJson} disabled={!masterPrompt}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-[800] rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Download className="w-5 h-5" /> Export as ComfyUI JSON
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-zinc-500 font-[500] leading-relaxed">
                  Exports include negative prompt, quality tier, and full field metadata — drop directly into any ComfyUI text encoder node.
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
