"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  { slug: "comfyui-complete-setup", difficulty: "Beginner" as Difficulty, title: "ComfyUI Complete Setup", desc: "Install, configure, and benchmark your first ComfyUI workflow.", time: "12 min", tag: "Image Gen", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" },
  { slug: "installation", difficulty: "Beginner" as Difficulty, title: "How to Install ComfyUI Correctly", desc: "Complete installation guide for ComfyUI. Portable and Desktop methods.", time: "15 min", tag: "Guide", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" },
  { slug: "model-folders", difficulty: "Beginner" as Difficulty, title: "Where Every Model File Goes", desc: "Complete folder structure for checkpoints, LoRAs, VAEs, and ControlNet", time: "6 min", tag: "Guide", image: "https://images.unsplash.com/photo-1544391682-17173b392231?q=80&w=2070&auto=format&fit=crop" },
  { slug: "portable-vs-desktop", difficulty: "Beginner" as Difficulty, title: "Portable vs Desktop: Which Should You Choose?", desc: "Complete decision guide for installation methods", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop" },
  { slug: "why-choose-portable", difficulty: "Beginner" as Difficulty, title: "Why Choose ComfyUI Portable Version", desc: "Deep dive into the beginner-friendly installation", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop" },
  { slug: "workflow-errors", difficulty: "Beginner" as Difficulty, title: "Understanding and Fixing Workflow Errors", desc: "Solve node not found, black images, and type mismatches", time: "10 min", tag: "Guide", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" },
  
  { slug: "custom-nodes", difficulty: "Intermediate" as Difficulty, title: "Custom Nodes: Install & Fix", desc: "Master custom node management and troubleshooting", time: "5 min", tag: "Guide", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
  { slug: "gpu-errors", difficulty: "Intermediate" as Difficulty, title: "Fixing GPU Errors", desc: "Solve CUDA not available, out of memory, and GPU detection issues", time: "8 min", tag: "Guide", image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=2070&auto=format&fit=crop" },
  { slug: "model-types", difficulty: "Intermediate" as Difficulty, title: "SD Model Types Explained", desc: "SD1.5 vs SDXL vs LCM vs Turbo vs Flux - which should you use?", time: "10 min", tag: "Guide", image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop" },
  { slug: "performance-optimization", difficulty: "Intermediate" as Difficulty, title: "Optimize Performance on Any GPU", desc: "GPU-tier specific optimization for 4GB to 24GB+ VRAM.", time: "12 min", tag: "Guide", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2068&auto=format&fit=crop" },
  { slug: "train-flux-lora", difficulty: "Intermediate" as Difficulty, title: "Train Your First FLUX LoRA", desc: "Dataset prep, Kohya config, training loop, and evaluation.", time: "28 min", tag: "LoRA Training", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" },
  { slug: "comfyui-deployment-guide", difficulty: "Intermediate" as Difficulty, title: "ComfyUI Deployment Guide", desc: "Master the full lifecycle of ComfyUI deployment from local setup to cloud APIs.", time: "18 min", tag: "Deployment", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" },

  { slug: "ltx-video-cinematic-action", difficulty: "Advanced" as Difficulty, title: "LTX Video: Cinematic Action", desc: "Build chase scenes with consistent motion and camera lock.", time: "35 min", tag: "Video Gen", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" },
  { slug: "why-choose-desktop", difficulty: "Advanced" as Difficulty, title: "Why Choose Desktop Install", desc: "Deep dive into the power-user installation with full system access.", time: "7 min", tag: "Guide", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" },
  { slug: "ai-workflow-setup-guide", difficulty: "Advanced" as Difficulty, title: "AI Workflow Setup Guide", desc: "Build scalable, modular AI architectures in ComfyUI for production systems.", time: "22 min", tag: "Workflows", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop" },
  { slug: "ace-step-1-5-comfyui", difficulty: "Intermediate" as Difficulty, title: "Audio Ace: ComfyUI Integration", desc: "Master the bridge between Audio Ace and ComfyUI for seamless AV generation.", time: "15 min", tag: "Audio Gen", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" }
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
    <div className="bg-bg min-h-screen text-white font-sans">
      <Navbar />

      {/* ── HIGH-IMPACT HERO ── */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-border">
        {/* Main Image Asset */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/guides-hero.png" 
            alt="Guides Hero" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10 text-center px-10 max-w-4xl nh-animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent font-bold">The Knowledge Base</span>
          </div>
          <h1 className="font-syne text-6xl md:text-8xl font-[900] tracking-tighter text-white mb-6 leading-none">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-purple">Stack.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            From your first node to production-scale cloud deployments. 
            Structured, hardware-tested guides for the engineering era of AI.
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
                      <Link 
                        key={guide.slug} 
                        href={`/guides/${guide.slug}`} 
                        className="group bg-card/40 hover:bg-card border border-border rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-accent/30 shadow-2xl relative"
                      >
                        {/* Dynamic glow overlay based on difficulty */}
                        <div 
                          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" 
                          style={{ backgroundColor: DIFF_STYLES[difficulty].color }}
                        />

                        <div className="aspect-[16/10] relative overflow-hidden bg-black/50 border-b border-border">
                          <img 
                            src={guide.image} 
                            alt={guide.title} 
                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                          />
                          <div className="absolute top-4 left-4">
                             <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full tracking-widest uppercase backdrop-blur-md shadow-lg ${DIFF_STYLES[guide.difficulty].badge}`}>
                               {DIFF_STYLES[guide.difficulty].icon} {guide.difficulty}
                             </span>
                          </div>
                        </div>

                        <div className="p-8">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-[10px] text-accent tracking-widest uppercase">{guide.tag}</span>
                            <span className="text-muted text-[10px] font-bold">·</span>
                            <span className="text-muted text-[10px] font-bold">⏱ {guide.time}</span>
                          </div>
                          <h4 className="font-syne text-xl font-bold text-white mb-3 tracking-tight group-hover:text-accent transition-colors">
                            {guide.title}
                          </h4>
                          <p className="text-sm text-muted leading-relaxed line-clamp-2">{guide.desc}</p>
                          
                          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                            <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">Learn More</span>
                            <ArrowRight className="w-4 h-4 text-accent" />
                          </div>
                        </div>
                      </Link>
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
