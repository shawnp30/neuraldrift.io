export const QUALITY_SUFFIX: Record<string, string> = {
  draft: "sharp, detailed",
  standard: "highly detailed, masterpiece, sharp focus",
  cinematic: "cinematic 8K, film grain, award-winning photography",
  ultra: "8K UHD, hyperrealistic, Unreal Engine 5, global illumination, subsurface scattering, photorealistic masterpiece",
};
export const QUALITY_TIERS = ["draft", "standard", "cinematic", "ultra"] as const;
export type QualityTier = typeof QUALITY_TIERS[number];

export const SUGGESTIONS = {
  subject: [
    "Cyberpunk Samurai", "Neon-lit Mech Warrior", "Elderly Wizard", 
    "Floating Astronaut", "Ancient Dragon", "Shadow Creature", 
    "Gleaming Roman Legionnaire", "Deep-sea Leviathan", "Chrome Android"
  ],
  environment: [
    "Rain-soaked Neo-Tokyo", "Sterile Brutalist Spacecraft", 
    "Deep Bioluminescent Jungle", "Ruined Victorian Mansion",
    "Flooded Cyberpunk Megacity", "Infinite White Void",
    "Post-apocalyptic Wasteland", "Orbiting Space Station"
  ],
  action: [
    "Running desperately through smoke", "Shattering into prismatic fragments", 
    "Floating effortlessly in zero gravity", "Turning slowly to face the camera",
    "Dissolving gracefully into mist", "Executing a spinning aerial kick",
    "Falling in extreme slow motion", "Staring menacingly into the lens"
  ],
  audio_genre: [
    // Hip Hop & R&B
    "90s Boom Bap Rap", "Modern Trap", "UK Drill", "G-Funk / West Coast Hip Hop",
    "Neo-Soul", "Contemporary R&B", "Vintage Motown Soul", "Jazz-infused Hip Hop",
    "Cloud Rap", "Grime", "Phonk / Drift Phonk", "2020s Melodic Trap",
    // Electronic & Dance
    "Acid House / Techno", "Progressive House", "Deep House / Minimal", "Drum & Bass (Liquid)",
    "Drum & Bass (Neurofunk)", "Hardstyle / Rawstyle", "Psytrance", "Synthwave / Outrun",
    "Darkwave / EBM", "Hyperpop / Glitchcore", "Ambient Chillout", "Space Ambient",
    // Rock & Metal
    "Thrash Metal (80s Era)", "Djent / Progressive Metal", "Grunge / Alt Rock",
    "Hardcore Punk", "Shoegaze / Dream Pop", "Post-Rock / Cinematic Instrumental",
    // Jazz & Soul
    "Lofi / Chillhop", "Dreamy Jazzhop", "Acid Jazz", "Classic Reggae Dub",
    "Vintage Comedic Soul Parody", "1970s Blaxploitation Funk", "1980s Smooth R&B / Slow Jam",
    // Classical & Cinematic
    "Neo-Classical / Minimalist Piano", "Orchestral / Epic Film Score",
    "Horror Soundscape / Dark Ambient", "Baroque / Harpsichord Lead",
    // Folk & Country
    "Bluegrass / Americana", "Dark Folk / Gothic Country", "Indie Folk / Acoustic Strumming",
  ],
  audio_instruments: [
    "Heavy 808 sub-bass with distortion (Tuned to C)",
    "SP-1200 sampled drum break / vinyl crackle",
    "Smooth Fender Rhodes Mark I electric piano",
    "Vintage Moog Minimoog D analog basslines",
    "Classic Roland TR-808 / TR-909 drum set",
    "Distorted Acid TB-303 / Korg MS-20 synth",
    "Gibson Les Paul through Marshall JCM800 stack",
    "Fender Stratocaster with heavy chorus and delay",
    "Yamaha DX7 FM bell pads and digital plucks",
    "Prophet-5 polysynth pads / warm oscillating filters",
    "Mellotron flutes and atmospheric strings",
    "Ludwig Vistalite acoustic drum kit / room mics",
    "Jazzy upright bass and muted trumpet",
    "Ethereal shimmering pads and choir stabs",
    "Funky slap bass and Isaac Hayes style wah-wah",
    "Saturated tape-hiss and analog saturation",
    "Grand Piano / Felt Piano with mechanical noise",
    "Granular synthesized soundscapes / textures",
  ],
  audio_vocals: [
    "Deep baritone male rap vocal (aggressive flow)",
    "High-pitched soul female vocal / runs",
    "Smooth androgynous R&B harmonies",
    "Raspy old-school gravelly 'Tom Waits' style",
    "Whispered intimate vocal delivery",
    "Melodic autotuned 'Travis Scott' style trap vocal",
    "Soulful gospel-style choir background",
    "Spoken word / poetical narration",
    "Operatic high-soprano overlays",
    "Gritty / distorted industrial underground vocal",
    "Breathy and ethereal jazz vocal",
    "Classic 70s Soul Crooner / High Falsetto",
    "Vocoder-processed robotic voice (Daft Punk style)",
    "Hardcore Metal growls / guttural screams",
    "Clean crystalline pop soprano",
  ],
  lyric_themes: [
    "Betrayal and revenge", "Midnight city survival", "Rebellion against the system",
    "Heartbreak in a digital age", "Lost ambition and regret", "Euphoric late-night dancing",
    "Underworld power and control", "Fading memories of a hometown",
    "Absurd modern complaints as a vintage soul ballad", "Crude internet humor in 1980s R&B style"
  ],
  lyric_imagery: [
    "Neon reflecting in rain puddles", "Smoke filling a sterile room", 
    "Shattered glass on an empty street", "A fading polaroid",
    "Wolves howling at a blood moon", "Gunpowder and expensive perfume",
    "Digital static and glitching screens", "Wide-collar velvet suits, afros, disco balls"
  ]
};

export const OPTIONS = {
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
    "1970s Vintage Analog & Warmth",
    "1980s Drum Machines & Synth Pop",
    "1990s CD Quality / Boom Bap / Grunge",
    "2000s Early Digital Sound / Autotune",
    "2010s Streaming Era / EDM Peak",
    "2020s Modern Horizon / Present Day",
    "Pre-recording Era (Classical / Folk)",
    "Post-Apocalyptic / Futuristic",
  ],
  audio_purpose: [
    "Studio Production / Radio-Ready Song",
    "Movie Score - Horror / Thriller",
    "Movie Score - Comedy / Lighthearted",
    "Movie Score - Romance / Emotional",
    "Movie Score - Epic Cinematic / Action",
    "Commercial / Advertisement Intro",
    "Podcast Background Music Bed",
    "Podcast / Talk Show Title Theme",
    "Live News / Interview Bed",
    "Video Game Dynamic Soundtrack",
    "Elevator Music / Corporate Muzak",
  ],
  cinematic_effects: [
    "Slow Creeping Build-Up (Tension)",
    "Sudden Intense Climax / Impact",
    "Heartfelt Sweeping Emotional Peak",
    "Over-the-Top Slapstick / Goofy",
    "Subtle Mood-Setting / Low Tension",
    "High-Octane Action Chase Sequence",
    "Eerie Unsettling Dissonance",
    "Melancholic Tear-Jerker / Somber",
    "Triumphant Heroic Fanfare",
    "Stealthy / Suspenseful Sneaking",
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
  lyric_perspectives: ["1st Person (I/We)", "2nd Person (You)", "3rd Person (He/She/They)"],
  lyric_lengths: ["Short (1-2 mins)", "Standard (3 mins)", "Long (4+ mins)"],
  lyric_vocal_genders: [
    "Male Vocals",
    "Female Vocals",
    "Male Rapper",
    "Female Rapper",
    "Duet (Male & Female Vocals)",
    "Choir / Ensemble",
    "Androgynous Vocals"
  ],
  lyric_flow_styles: ["Choppy and percussive", "Smooth and legato", "Triplet-heavy", "Conversational", "Rapid-fire syncopated"],
  lyric_rhyme_densities: ["Low (AABB/ABAB)", "Medium (Internal & end rhymes)", "High (Multisyllabic/Dense)"],
  lyric_hook_types: ["Anthem", "Emotional", "Melodic", "Hard-hitting"],
  lyric_structures: [
    "Hook + Verse + Hook",
    "Hook + Verse + Verse + Hook",
    "Intro + Hook + Verse + Hook + Bridge + Hook",
    "Verse + Pre-Chorus + Chorus + Verse + Chorus",
    "Freestyle (Extended Verse)",
    "Drill Breakdown (Intro -> Hook -> Verse -> Hook)",
    "R&B Slow Jam Showcase",
    "Metal Core (Build -> Verse -> Chorus -> Breakdown)"
  ]
};

export const REFERENCE_ARTISTS = [
  "Hans Zimmer", "Daft Punk", "John Williams", "Trent Reznor",
  "Burial", "Flying Lotus", "Kendrick Lamar", "Max Richter",
  "Ennio Morricone", "Aphex Twin", "Brian Eno",
];

export const getSuggestedBPM = (genre: string) => {
  const g = genre.toLowerCase();
  if (g.includes("drill") || g.includes("dubstep") || g.includes("riddim")) return "140 - 150 BPM";
  if (g.includes("dnb") || g.includes("drum and bass") || g.includes("drum & bass")) return "170 - 175 BPM";
  if (g.includes("house")) return "120 - 128 BPM";
  if (g.includes("techno") || g.includes("trance")) return "130 - 145 BPM";
  if (g.includes("trap") || g.includes("hip hop") || g.includes("rap")) return "80 - 100 BPM (or 140+ Double Time)";
  if (g.includes("r&b") || g.includes("soul") || g.includes("lofi") || g.includes("chill") || g.includes("slow jam")) return "60 - 90 BPM";
  if (g.includes("funk") || g.includes("disco")) return "100 - 120 BPM";
  if (g.includes("pop") || g.includes("synth")) return "100 - 125 BPM";
  if (g.includes("rock") || g.includes("metal") || g.includes("punk")) return "110 - 160 BPM";
  if (g.includes("reggaeton") || g.includes("dancehall")) return "90 - 100 BPM";
  return "Auto / Vibe-dependent";
};

export const ACE_POOLS = {
  GENRE: [
    "country ballad", "red dirt americana", "cinematic post-rock",
    "lo-fi hip hop", "dark ambient", "neo-soul", "jazz fusion",
    "synthwave", "blues rock", "celtic folk", "trap soul",
    "orchestral film score", "indie folk", "acid jazz", "reggaeton",
    "bluegrass", "bossa nova", "psychedelic rock", "drill", "gospel",
    "dark trap", "afrobeats", "cumbia", "flamenco", "chillwave",
    "vaporwave", "doom metal", "surf rock", "new jack swing",
    "memphis rap", "cloud rap", "ambient techno", "post-punk",
    "shoegaze", "samba", "mandopop", "k-indie", "zydeco",
    "appalachian folk", "outlaw country", "chicago blues",
    "smooth jazz", "conscious hip hop", "emo rap", "hyperpop",
    "prairie folk", "midwest emo", "southern gothic"
  ],
  BPM: [
    "45 BPM — dirge slow", "55 BPM — funeral slow",
    "60 BPM — slow ballad", "72 BPM — slow groove",
    "78 BPM — laid back", "85 BPM — hip hop pocket",
    "90 BPM — mid tempo", "92 BPM — mid pocket",
    "96 BPM — country sweet spot", "100 BPM — driving",
    "104 BPM — pushing forward", "110 BPM — uptempo",
    "116 BPM — dance floor", "120 BPM — pop standard",
    "128 BPM — house tempo", "132 BPM — tech house",
    "140 BPM — energetic", "150 BPM — drum and bass",
    "160 BPM — fast", "170 BPM — jungle",
    "174 BPM — hardstyle", "180 BPM — hardcore punk"
  ],
  INSTRUMENTS: [
    "acoustic guitar fingerpicking", "12-string acoustic guitar",
    "baritone guitar", "pedal steel guitar", "lap steel guitar",
    "dobro slide guitar", "resonator guitar", "weissenborn",
    "fiddle", "upright bass", "fretless bass",
    "fingerstyle bass guitar", "washtub bass",
    "brushed snare drum", "cajon", "tabla",
    "vintage moog bassline", "prophet-5 synth lead",
    "mellotron strings", "wurlitzer electric piano",
    "rhodes electric piano", "clavinet", "hammond organ",
    "church pipe organ", "jazz trumpet", "flugelhorn",
    "soprano saxophone", "bass clarinet", "contrabass clarinet",
    "cello section", "orchestral strings", "vibraphone",
    "glockenspiel", "marimba", "hang drum", "hammered dulcimer",
    "mountain dulcimer", "appalachian dulcimer", "jaw harp",
    "hurdy gurdy", "banjo", "sitar", "oud", "erhu", "koto",
    "theremin", "steel drum", "dulcimer"
  ],
  TEXTURE: [
    "open field natural reverb", "concert hall bloom",
    "tape warmth", "vinyl crackle", "room sound slight breeze",
    "late night studio ambience", "cathedral reverb",
    "dry close mic", "lo-fi cassette texture", "analog warmth",
    "outdoor live recording", "intimate bedroom recording",
    "large venue bloom", "dense fog ambience",
    "sunrise outdoor warmth", "underground club pressure",
    "rooftop city reverb", "rain on glass texture",
    "desert heat shimmer", "church basement intimacy",
    "broadcast radio warmth", "1970s studio console grit",
    "8-track tape saturation", "spring reverb twang",
    "plate reverb bloom", "ambient field recording",
    "subway tunnel echo", "campfire outdoor natural",
    "abandoned warehouse decay"
  ],
  MOOD: [
    "melancholic longing", "triumphant resolution",
    "anxious tension", "euphoric release", "nostalgic warmth",
    "menacing dread", "peaceful surrender",
    "desperate urgency", "bittersweet reflection",
    "quiet determination", "joyful abandon",
    "existential unease", "tender intimacy",
    "righteous anger", "hypnotic trance",
    "childlike wonder", "world-weary exhaustion",
    "electric anticipation", "sacred reverence",
    "chaotic energy"
  ],
  ERA: [
    "1950s mono recording", "1960s analog warmth",
    "1970s funk era console", "1980s drum machine gated reverb",
    "1990s golden age hip hop", "2000s ProTools era",
    "2010s streaming era polish", "2020s bedroom pop era",
    "timeless acoustic", "modern hybrid production"
  ],
  MIX_POSITION: [
    "wide stereo field", "mono centered punchy",
    "intimate dry mix", "wet heavily processed",
    "live room bleed and air", "studio isolated tracks",
    "mid-heavy presence mix", "airy high shelf open",
    "deep low end centered", "telephone lo-fi filtered"
  ],
  NEGATIVE_PROMPTS: [
    "no synth", "no drum machine", "no electric guitar",
    "no auto-tune", "no reverb wash", "no orchestra",
    "no choir", "no trap hi-hats", "no bass drop",
    "no distortion", "no reverb", "no delay",
    "no compression artifacts", "no clipping",
    "no pitch correction", "no quantization",
    "no sample pack loops", "no generic beats",
    "no commercial polish", "no trap 808s",
    "no dubstep drops", "no EDM buildups",
    "no autogenerated melody", "no muzak"
  ],
  VOCAL_CHARACTER: [
    "weathered male gravelly low register",
    "warm female alto", "breathy indie female",
    "deep baritone soul", "raspy tenor",
    "operatic soprano", "smooth R&B male",
    "country female twang", "gospel choir texture",
    "whispered ASMR intimate", "spoken word poet",
    "bluegrass high lonesome tenor", "mariachi tenor",
    "bel canto classical tenor", "delta blues growl",
    "jazz scat texture", "children's choir innocence",
    "elderly weathered female", "androgynous ethereal",
    "drill rap cadence texture", "duet male and female harmony"
  ]
};

export const ACE_LYRIC_POOLS = {
  LANGUAGES: ["English", "Spanish", "French", "Japanese", "Korean", "Chinese", "Portuguese", "German", "Italian", "Russian"],
  EMOTIONS: ["sad", "angry", "hopeful", "joyful", "melancholic", "determined", "desperate", "tender", "aggressive", "peaceful"],
  THEMES: [
    "redemption", "heartbreak", "revenge", "freedom",
    "addiction", "faith", "loss", "rage", "nostalgia",
    "survival", "love found", "love lost", "identity",
    "home", "escape", "war", "nature", "city life",
    "poverty", "success", "paranoia", "peace"
  ],
  STRUCTURAL_TAGS: ["intro", "verse", "chorus", "bridge", "hook", "pre-chorus", "interlude", "outro"],
  VOCAL_STYLES: [
    "Modern Pop", "90s Boom Bap Rap", "Melodic RnB", "Traditional Country", 
    "Outlaw Country", "Dark Synth Pop", "Aggressive Industrial", "Ethereal Dream Pop",
    "Gospel Choir Soul", "Nu-Metal Energy", "Bossa Nova Smooth", "Classical Operatic",
    "Jazz Crooner", "Delta Blues Growl", "Retrowave / Vaporwave"
  ]
};

export const ANIME_POOLS = {
  STYLES: [
    "Studio Ghibli (Painterly/Nature)",
    "Makoto Shinkai (Vibrant/Clouds)",
    "90s Retro (Akira/Cyberpunk)",
    "Modern Shonen (High-Contrast/Action)",
    "Kyoto Animation (Soft/Detail)",
    "TRIGGER Style (Geometric/Fluorescent)",
    "Studio MAPPA (Gritty/Modern)",
    "Flat Cel Shaded (Classic TV)",
    "Oil Paint Anime (Thick Brush)",
    "Sketch / Lineart Style",
    "Ukiyo-e Inspired",
    "Grimdark Seinen (Berserk Style)"
  ],
  MODELS: [
    { 
      name: "Pony Diffusion V6 XL", 
      useCase: "Best for stylized characters and anatomical accuracy.", 
      link: "https://civitai.com/models/257749/pony-diffusion-v6-xl",
      qualityTags: "score_9, score_8_up, score_7_up, masterpiece, source_anime"
    },
    { 
      name: "Animagine XL V3.1", 
      useCase: "Best for high-fidelity official character consistency.", 
      link: "https://civitai.com/models/260267/animagine-xl-v31",
      qualityTags: "masterpiece, best quality, ultra-detailed"
    },
    { 
      name: "Counterfeit-V3.0", 
      useCase: "Best for soft, detailed painterly backgrounds.", 
      link: "https://civitai.com/models/4468/counterfeit-v30",
      qualityTags: "masterpiece, best quality"
    },
    { 
      name: "MeinaMix", 
      useCase: "Best for bright modern anime looks (SD1.5).", 
      link: "https://civitai.com/models/7240/meinamix",
      qualityTags: "masterpiece, 8k wallpaper"
    }
  ],
  LORAS: [
    { name: "Detail Tweaker XL", useCase: "Enhance complex textures and line weight." },
    { name: "Concept Art / Ghibli Style", useCase: "Force painterly environmental foliage." },
    { name: "90s Retro Aesthetic", useCase: "Apply grain and chromatic aberration." },
    { name: "Anime Screencap Effect", useCase: "Add cinematic SUBTITLES and cinematic bars." }
  ],
  MOTION: [
    "High Action (Fluid 24fps)",
    "Traditional (On 2s / 12fps)",
    "Glitchy / Stylized Cuts",
    "Subtle Idle / Breathing"
  ],
  ACTIONS: [
    "70s Retro Mecha Transformation Sequence",
    "70s Dramatic Silhouette against Sunrise",
    "70s Shojo Soft-Focus Poetic Close-Up",
    "80s High-Speed Futuristic Motorcycle Slide",
    "80s Kinetic Gunfight with Shell Casings",
    "80s Neon Cyberpunk City Skyline Jump",
    "90s High-Octane Martial Arts Energy Clash",
    "90s Shonen Power-Up Scream with Aura",
    "90s Magical Girl Transformation Sequence",
    "90s Urban Rooftop Parkour Chase",
    "2000s Complex Magical Circle Combat",
    "2000s Dynamic Sword Clash with Sparks",
    "2000s High-Intensity Impact Frame Flash",
    "2000s Extreme Determination Eye Close-Up",
    "Explosive Energy Blast (Ki)",
    "Sakuga Highlight High-Speed Chase",
    "Dimensional Gate / Portal Tear",
    "Impact Frame (B&W Flashing)",
  ],
  FRAMING: [
    "Dutchman Angle (Dynamic Tilt)",
    "Impact Frame (High Contrast Flash)",
    "Extreme Foreshortening (Power Shot)",
    "Worm's Eye View (Looking Up)",
    "Bird's Eye View (Looking Down)",
    "Cinematic Profile Side-Shot",
    "Extreme Close-Up (Eye Detail)",
    "Cowboy Shot (Mid-Thigh Up)",
    "Rule of Thirds Cinematic",
    "Wide-Angle Environmental Shot"
  ],
  VFX: [
    "Motion Blur / Speed Lines",
    "Chromatic Aberration (RGB Shift)",
    "Glowing Particle Effects",
    "Screen Tones / Manga Hatching",
    "Dynamic Lens Flare",
    "Heat Haze / Distortion",
    "Flying Debris / Dust Motes",
    "Energy Auras / Lightning Sparks",
    "Vignette / Film Grain",
    "Sakuga Particle Dispersion"
  ]
};

export const ACE_LYRIC_TEMPLATES = [
  {
    id: "cyber-void",
    name: "Cybernetic Void",
    genre: "Dark Techno / Industrial",
    theme: "Digital isolation",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[heavy synth bass sequence]", emotion: "determined" },
      { type: "verse", lyrics: "Neon rain on the silicon street,\nHeartbeat syncs to the city's beat.\nScanning the horizon for a glitch in the void,\nDigital memories of a life destroyed.", emotion: "aggressive" },
      { type: "chorus", lyrics: "We are the ghosts in the mainframe,\nSearching for a soul, avoiding the blame.\nElectric blood and a heart of lead,\nWhere do the dreams go when the system is dead?", emotion: "desperate" },
      { type: "outro", lyrics: "[fading digital glitch error]", emotion: "melancholic" }
    ]
  },
  {
    id: "dust-diesel",
    name: "Dust & Diesel",
    genre: "Outlaw Country / Southern Rock",
    theme: "Road-weary freedom",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[twangy slide guitar swell]", emotion: "peaceful" },
      { type: "verse", lyrics: "Woke up in Reno with the sun in my eyes,\nTrading my soul for the desert skies.\nThis old Ford pickup's seen better years,\nRunning on grit and a fountain of tears.", emotion: "melancholic" },
      { type: "chorus", lyrics: "Dust and diesel on a Saturday night,\nChasing the horizon to stay in the light.\nNo home behind me, no roots below,\nWherever the wind and the highway go.", emotion: "determined" },
      { type: "outro", lyrics: "[fading harmonica solo]", emotion: "peaceful" }
    ]
  },
  {
    id: "epic-redemption",
    name: "Redemption Arc",
    genre: "Epic Orchestral / Trailer",
    theme: "Rising from defeat",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[low thunderous taiko drum hits]", emotion: "aggressive" },
      { type: "verse", lyrics: "The silver curtain falls on the end of the age,\nA broken king on a hollow stage.\nBut from the ashes, the fire will grow,\nMore than the winter of defeat can know.", emotion: "desperate" },
      { type: "chorus", lyrics: "Rise from the shadows, reclaim the throne,\nA kingdom of steel, built on bone.\nThe sky is burning, the oceans will roar,\nWe are become what we were before.", emotion: "hopeful" },
      { type: "outro", lyrics: "[grand orchestral finale]", emotion: "joyful" }
    ]
  },
  {
    id: "neo-vapor",
    name: "Neo-Vapor",
    genre: "Retrowave / Dream Pop",
    theme: "Nostalgic longing",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[shimmering 80s pads and bells]", emotion: "peaceful" },
      { type: "verse", lyrics: "Midnight mirrors, a reflection of blue,\nChasing the echoes of a memory of you.\nPink clouds drifting over the bay,\nSearching for words I never could say.", emotion: "melancholic" },
      { type: "chorus", lyrics: "Lost in the vapor, a pastel sunrise,\nLooking for truth in your electric eyes.\nRetro love in a digital dream,\nNothing is ever as real as it seems.", emotion: "tender" },
      { type: "outro", lyrics: "[reverb-heavy synth fade]", emotion: "melancholic" }
    ]
  },
  {
    id: "red-state-parody",
    name: "Red State Anthem",
    genre: "Funny Country / Southern Anthem",
    theme: "Right-wing Satire / Parody",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[heavy motorcycle engine revving, electric guitar riff]", emotion: "joyful" },
      { type: "verse", lyrics: "Got my tractor in the driveway, got my eagle in the yard,\nWriting 'Freedom' on my mailbox with a permanent marker card.\nThey told me keep it quiet, but the pickup's way too loud,\nI'm just a simple man, standing tall and feeling proud.", emotion: "joyful" },
      { type: "chorus", lyrics: "God, guns, and gasoline, that's the only way to be,\nLiving life in logic while they're lost across the sea.\nPut a flag on the moon, put a flag on my truck,\nIf you don't like the diesel, then you're running out of luck.", emotion: "aggressive" },
      { type: "outro", lyrics: "[big country stadium finish with fireworks sounds]", emotion: "joyful" }
    ]
  },
  {
    id: "blue-state-parody",
    name: "Blue Wave Blues",
    genre: "Emo / Indie / Political Satire",
    theme: "Left-wing Satire / Parody",
    language: "English",
    sections: [
      { type: "intro", lyrics: "[sad acoustic guitar with vinyl crackle]", emotion: "melancholic" },
      { type: "verse", lyrics: "My soy latte's lukewarm, like the policy we passed,\nI'm reading theory in the basement, hope the feeling's gonna last.\nI knitted you a scarf from the recycled hopes of youth,\nWaiting for a TikTok to tell me what's the truth.", emotion: "melancholic" },
      { type: "chorus", lyrics: "Oh, the existential dread of a decentralized parade,\nWe're protesting the sunrise in the organic garden shade.\nWrite a poem for the planet, put it in a glass jar,\nWondering if the carbon tax will let me drive my car.", emotion: "desperate" },
      { type: "outro", lyrics: "[fading out with a single, lonely wind chime]", emotion: "melancholic" }
    ]
  }
];

export const ACE_LYRIC_SEED_BANK = {
  OPENING: [
    "Neon rain on the silicon street,",
    "Woke up at midnight with fire in my chest,",
    "The silver curtain falls on the edge of the age,",
    "Midnight mirrors, a reflection of blue,",
    "Shadows dancing on the concrete wall,",
    "The wind is howling like a ghost in the trees,",
    "Static in the wires, a digital soul,",
    "Behind the mountains where the thunder roars,",
    "Got my tractor in the driveway, feeling mighty large,",
    "My soy latte's lukewarm, like the policy we passed,"
  ],
  IMAGERY: [
    "Scanning the spectrum for a sign of light,",
    "Dust on my boots and a hole in my heart,",
    "The sky is burning with a violet glow,",
    "Chasing the echoes of a memory of you,",
    "Iron and ivory, a kingdom of bone,",
    "Cold coffee and a pack of lies,",
    "Digital dreams in a pastel sunrise,",
    "The ocean is deep and the stars are blind,",
    "Writing 'Freedom' on my mailbox with a marker card,",
    "Knitting scarves from the recycled hopes of youth,"
  ],
  HOOKS: [
    "We are the ghosts in the mainframe,",
    "God, guns, and whiskey on a Saturday night,",
    "Rise from the ashes, reclaim the throne,",
    "Lost in the vapor, an electric dream,",
    "The cycle is broken, the end is near,",
    "Living for the moments we can't repeat,",
    "No way home and no roots below,",
    "The light that burns is the light that leads,",
    "God, guns, and gasoline, that's the only way to be,",
    "Oh, the existential dread of a decentralized parade,"
  ],
  CLOSING: [
    "Where do the dreams go when the system is dead?",
    "Wherever the wind and the highway go.",
    "The king is dead, long live the king.",
    "Nothing is ever as real as it seems.",
    "Scanning the void for another glitch.",
    "The silence is louder than the thunder could be.",
    "Fading out to a digital error.",
    "The sun will rise on a different world.",
    "If you don't like the diesel, you're out of luck.",
    "Wondering if the carbon tax will let me drive my car."
  ]
};




