"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Layers, Cpu, ChevronDown, Menu } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import type { Difficulty } from "@/types";

import { DynamicCTA } from "@/components/DynamicCTA";

const DIFF_STYLES: Record<Difficulty, { badge: string; icon: React.ReactNode; color: string }> = {
  Beginner: { 
    badge: "bg-[rgba(163,230,53,0.1)] text-[#a3e635] border border-[rgba(163,230,53,0.2)]", 
    icon: <Zap size={14} />,
    color: "#a3e635"
  },
  Intermediate: { 
    badge: "bg-[rgba(249,115,22,0.1)] text-[#f97316] border border-[rgba(249,115,22,0.2)]", 
    icon: <Layers size={14} />,
    color: "#f97316"
  },
  Advanced: { 
    badge: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border border-[rgba(124,58,237,0.2)]", 
    icon: <Cpu size={14} />,
    color: "#a78bfa"
  },
};

const GUIDES = [
  // --- FOUNDATION SERIES ---
  { 
    slug: "comfyui-complete-setup", 
    difficulty: "Beginner" as Difficulty, 
    title: "ComfyUI Complete Setup", 
    desc: "Install, configure, and benchmark your first ComfyUI node network.", 
    time: "12 min", 
    tag: "Foundation", 
    image: "/images/learn/beginner.png",
    minVram: 8,
    modelId: "sdxl"
  },
  { 
    slug: "installation", 
    difficulty: "Beginner" as Difficulty, 
    title: "ComfyUI Installation Guide", 
    desc: "Complete setup for Windows/Linux. Portable vs Desktop methods.", 
    time: "15 min", 
    tag: "Foundation", 
    image: "/images/learn/intermediate.png",
    minVram: 4,
    modelId: "sdxl-turbo"
  },
  // --- FLUX MASTERCLASS ---
  { 
    slug: "train-flux-lora", 
    difficulty: "Intermediate" as Difficulty, 
    title: "Train Your First FLUX LoRA", 
    desc: "Dataset preparation, Kohya_ss configuration, and evaluation loop.", 
    time: "28 min", 
    tag: "Flux Masterclass", 
    image: "/images/workflows/thumbs/flux.png",
    minVram: 16,
    modelId: "flux-dev"
  },
  { 
    slug: "model-types", 
    difficulty: "Intermediate" as Difficulty, 
    title: "Neural Architecture Guide", 
    desc: "SDXL vs Flux vs DeepSeek. Choose the right core for your pipeline.", 
    time: "10 min", 
    tag: "Flux Masterclass", 
    image: "/images/workflows/thumbs/sdxl.png",
    minVram: 12,
    modelId: "flux-dev"
  },
  // --- CINEMATIC VIDEO ---
  { 
    slug: "ltx-video-cinematic-action", 
    difficulty: "Advanced" as Difficulty, 
    title: "LTX Video: Cinematic Action", 
    desc: "Building consistent motion and camera lock with LTX-Video-2.3.", 
    time: "35 min", 
    tag: "Video Engine", 
    image: "/images/workflows/thumbs/ltx-video.png",
    minVram: 24,
    modelId: "ltx-2.3-22b"
  },
  { 
    slug: "ace-step-1-5-comfyui", 
    difficulty: "Intermediate" as Difficulty, 
    title: "Audio Ace: Spatial Synthesis", 
    desc: "Master the bridge between Audio Ace and ComfyUI for AV generation.", 
    time: "15 min", 
    tag: "Audio Engine", 
    image: "/images/workflows/thumbs/animatediff.png",
    minVram: 8,
    modelId: "ace-step-1.5"
  }
];

const CATEGORIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export default function GuidesPage() {
  const [activeSection, setActiveSection] = useState<string>("Beginner");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = CATEGORIES.map(id => document.getElementById(id.toLowerCase()));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(CATEGORIES[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-[#0a0a0b] min-h-screen text-white font-sans selection:bg-[#7c6af7]/30">
      <Navbar />

      {/* SEO STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": GUIDES.map((g, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `https://neuraldrift.io/guides/${g.slug}`,
              "name": g.title,
              "description": g.desc
            }))
          })
        }}
      />

      {/* ── HIGH-IMPACT HERO ── */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        {/* Main Image Asset */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/learn/hero.png" 
            alt="Guides Hero" 
            fill
            className="object-cover opacity-30 mix-blend-screen scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-10 max-w-4xl opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#7c6af7] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-bold">Knowledge Authority Hub</span>
          </div>
          <h1 className="font-syne text-7xl md:text-8xl font-[900] tracking-tighter text-white mb-6 leading-[0.85]">
            MASTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">AI STACK.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#8888a0] font-medium max-w-2xl mx-auto leading-relaxed">
            From node architecture to production cloud deployment. 
            Structured, hardware-verified guides for the engineering era of AI.
          </p>
        </div>
      </section>

      {/* ── MOBILE CATEGORY DROPDOWN ── */}
      <div className="lg:hidden sticky top-16 z-40 px-5 py-4 bg-bg/80 backdrop-blur-xl border-b border-border">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-card border border-border text-sm font-bold"
        >
          <div className="flex items-center gap-3">
            <span className="text-accent">{DIFF_STYLES[activeSection as Difficulty].icon}</span>
            {activeSection}
          </div>
          <ChevronDown className={`transition-transform duration-300 ${isMobileMenuOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isMobileMenuOpen && (
          <div className="absolute top-full left-5 right-5 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden nh-animate-fade-in group">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToSection(cat)}
                className={`w-full px-6 py-4 text-left text-sm font-bold border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${activeSection === cat ? "text-accent" : "text-muted"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="lg:grid lg:grid-cols-[260px_1fr] gap-16 items-start">
          
          {/* ── STICKY SIDEBAR (Desktop) ── */}
          <aside className="hidden lg:block sticky top-32">
            <div className="space-y-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-6">Experience Level</p>
                <nav className="flex flex-col gap-2">
                  {CATEGORIES.map(cat => {
                    const isActive = activeSection === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => scrollToSection(cat)}
                        className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? "bg-accent/10 border border-accent/20 text-accent" 
                            : "hover:bg-white/5 text-muted hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-accent" : "text-muted group-hover:text-white"}>
                            {DIFF_STYLES[cat].icon}
                          </span>
                          <span className="text-sm font-bold">{cat}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
                <p className="font-mono text-[9px] uppercase tracking-widest text-accent mb-3">{"// Hardware"}</p>
                <p className="text-xs text-muted leading-relaxed mb-5">Unsure about your VRAM capabilities for these guides?</p>
                <Link href="/hardware" className="text-[10px] font-bold text-accent hover:underline flex items-center gap-2">
                  Check Estimator <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </aside>

          {/* ── GUIDES FEED ── */}
          <div className="space-y-32">
            {CATEGORIES.map(difficulty => {
              const filtered = GUIDES.filter(g => g.difficulty === difficulty);
              return (
                <section key={difficulty} id={difficulty.toLowerCase()} className="scroll-mt-32">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-accent">
                        {DIFF_STYLES[difficulty].icon}
                      </div>
                      <div>
                        <h2 className="font-syne text-3xl font-black text-white">{difficulty}</h2>
                        <p className="text-sm text-muted">Core documentation for {difficulty.toLowerCase()} users.</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted">{filtered.length} Guides</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {filtered.map((guide) => (
                      <div 
                        key={guide.slug} 
                        className="group bg-[#111113] hover:bg-[#151518] border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[#7c6af7]/30 shadow-2xl relative"
                      >
                        {/* Dynamic glow overlay based on difficulty */}
                        <div 
                          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" 
                          style={{ backgroundColor: DIFF_STYLES[difficulty].color }}
                        />

                        <Link href={`/guides/${guide.slug}`} className="block aspect-[16/10] relative overflow-hidden bg-black/50 border-b border-white/5">
                          <Image 
                            src={guide.image} 
                            alt={guide.title} 
                            fill
                            className="object-cover group-hover:scale-105 transition-all duration-700 opacity-80" 
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                             <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full tracking-widest uppercase backdrop-blur-md shadow-lg ${DIFF_STYLES[guide.difficulty].badge}`}>
                               {DIFF_STYLES[guide.difficulty].icon} {guide.difficulty}
                             </span>
                             <span className="inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full tracking-widest uppercase bg-black/40 text-blue-400 border border-blue-400/20 backdrop-blur-md">
                               <Cpu size={10} /> {guide.minVram}GB+ VRAM
                             </span>
                          </div>
                        </Link>

                        <div className="p-8">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-[10px] text-[#7c6af7] tracking-widest uppercase">{guide.tag}</span>
                            <span className="text-[#8888a0] text-[10px] font-bold">·</span>
                            <span className="text-[#8888a0] text-[10px] font-bold">⏱ {guide.time}</span>
                          </div>
                          <Link href={`/guides/${guide.slug}`}>
                            <h4 className="font-syne text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#7c6af7] transition-colors leading-tight">
                              {guide.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-[#8888a0] leading-relaxed line-clamp-2">{guide.desc}</p>
                          
                          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                            <Link href={`/hardware?model=${guide.modelId}`} className="text-[10px] font-bold text-[#f59e0b] hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest relative z-20">
                              <Zap size={10} /> Check Compatibility
                            </Link>
                            <Link href={`/guides/${guide.slug}`}>
                              <ArrowRight className="w-4 h-4 text-[#7c6af7] group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* ── ACADEMY FOOTER ── */}
            <div className="mt-20">
              <DynamicCTA 
                title="Ready for the Masterclass?"
                description="Our Academy features premium video-led education on high-level workflow architecture and stabilization strategies. Step into the engineering era of AI."
                ctaText="ENTER THE ACADEMY"
                ctaHref="/tutorials"
                variant="violet"
                tag="// Next Stage Education"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
