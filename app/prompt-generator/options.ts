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
