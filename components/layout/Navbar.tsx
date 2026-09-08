"use client";

import { useState, useEffect, useRef } from "react";
import { AudioWaveform, Music, BrainCircuit, Search, X } from "lucide-react";
import Link from "next/link";


// ─────────────────────────────────────────────────────────────────
// PRIMARY NAV LINKS — flat, focused on the core visitor journey
// ─────────────────────────────────────────────────────────────────
const PRIMARY_LINKS = [
  { label: "Workflows", href: "/workflows" },
  { label: "Compatibility", href: "/compatibility" },
  { label: "Guides", href: "/guides" },
];

// Searchable pages — includes secondary pages so search still finds them
const SEARCHABLE_PAGES = [
  { name: "Workflows", href: "/workflows", desc: "Browse ComfyUI workflow catalog" },
  { name: "Compatibility", href: "/compatibility", desc: "GPU compatibility evidence" },
  { name: "Guides", href: "/guides", desc: "Setup and troubleshooting guides" },
  { name: "Installation Guide", href: "/guides/installation", desc: "Install ComfyUI step by step" },
  { name: "Model Folders", href: "/guides/model-folders", desc: "Where to place model files" },
  { name: "Custom Nodes", href: "/guides/custom-nodes", desc: "Install and manage custom nodes" },
  { name: "GPU Errors", href: "/guides/gpu-errors", desc: "Fix VRAM and GPU errors" },
  { name: "Workflow Errors", href: "/guides/workflow-errors", desc: "Troubleshoot workflow failures" },
  { name: "LTX Video 2.3", href: "/guides/ltx-video-cinematic-action", desc: "Cinematic video generation" },
  { name: "ACE-Step 1.5", href: "/guides/ace-step-1-5-comfyui", desc: "Audio synthesis in ComfyUI" },
  { name: "RTX 5080 Evidence", href: "/hardware/rtx-5080", desc: "Execution records for RTX 5080" },
  { name: "Hardware Hub", href: "/hardware", desc: "GPU capability overview" },
  { name: "Model Library", href: "/models", desc: "Browse available models" },
  { name: "Datasets", href: "/datasets", desc: "Community training data" },
];

// ─────────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Audio setup: One instance, single mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/sounds/lofi.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const fadeIn = () => {
    if (!audioRef.current) return;
    let vol = 0;
    const tick = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(tick);
        return;
      }
      vol = Math.min(vol + 0.02, 0.4);
      audioRef.current.volume = vol;
      if (vol >= 0.4) clearInterval(tick);
    }, 100);
  };

  const fadeOut = (onDone?: () => void) => {
    if (!audioRef.current) return;
    let vol = audioRef.current.volume;
    const tick = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(tick);
        return;
      }
      vol = Math.max(vol - 0.05, 0);
      audioRef.current.volume = vol;
      if (vol <= 0) {
        audioRef.current.pause();
        clearInterval(tick);
        onDone?.();
      }
    }, 100);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      fadeOut(() => setIsPlaying(false));
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          fadeIn();
        })
        .catch(() => {});
    }
  };

  // Search logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement.focus();
    return () => document.removeEventListener('keydown', handleTab);
  }, [mobileOpen]);

  // Search filtering
  const searchResults = searchQuery
    ? SEARCHABLE_PAGES.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[60] bg-[#0a0a0b]">
        
      </div>
      
      <nav
        className={`fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.08] bg-[#070b12]/80 py-3.5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link
            href="/"
            aria-label="NeuralDrift Home"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(false);
            }}
            className="group flex flex-shrink-0 items-center gap-2.5"
          >
            <div className="relative flex items-center justify-center">
              <BrainCircuit
                size={28}
                className="text-[#5eead4] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              />
              <div className="absolute inset-0 bg-[#5eead4]/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </div>
            <span className="hidden font-syne text-xl font-extrabold tracking-tight text-[#f8fafc] sm:inline">
              neural<span className="text-[#5eead4]">drift</span>
            </span>
          </Link>

          {/* Desktop Nav — flat links */}
          <div className="hidden items-center gap-8 lg:flex ml-10">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative font-mono text-[12.5px] font-semibold uppercase tracking-wider text-[#94a3b8] transition-colors hover:text-[#f8fafc] focus-visible:outline-none focus-visible:text-[#5eead4]"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-right scale-x-0 rounded-full bg-gradient-to-r from-[#5eead4] to-[#38bdf8] transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 justify-end max-w-sm ml-auto mr-8 relative" ref={searchContainerRef}>
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#8888a0] hover:text-[#22d3ee] transition-colors"
                aria-label="Open search"
              >
                <Search size={18} />
              </button>
            ) : (
              <div className="relative w-full group animate-in fade-in slide-in-from-right-4 duration-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workflows & guides..."
                  className="w-full bg-[#111113] border border-[#2a2a30] rounded-full px-5 py-2 text-xs font-mono text-[#e8e8f0] outline-none focus:border-[#7c6af7] transition-all pl-10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a0]">
                  <Search size={14} />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8888a0] hover:text-[#e8e8f0]"
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>

                {searchQuery && (
                  <div className="absolute top-full mt-2 w-full bg-[#111113] border border-[#2a2a30] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden py-2 max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((res) => (
                        <Link
                          key={res.href}
                          href={res.href}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="block px-4 py-3 border-b border-[#2a2a30]/50 last:border-0 hover:bg-white/5 transition-colors"
                        >
                          <div className="text-[#e8e8f0] text-sm font-bold font-syne">{res.name}</div>
                          <div className="text-[#8888a0] text-[10px] font-mono mt-0.5">{res.desc}</div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-[#8888a0] text-xs font-mono">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-6">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              aria-label={isPlaying ? "Pause background music" : "Play background music"}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#8888a0] transition-all hover:bg-white/5 hover:text-[#7c6af7]"
            >
              {isPlaying ? (
                <AudioWaveform className="h-4 w-4 animate-pulse text-[#7c6af7]" />
              ) : (
                <Music className="h-4 w-4" />
              )}
              {isPlaying && (
                <span className="absolute inset-0 animate-ping rounded-full border border-[#7c6af7]/40" />
              )}
            </button>

            <Link
              href="/#gpu-finder"
              className="hidden rounded-full bg-gradient-to-r from-[#5eead4] to-[#2dd4bf] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#04121a] shadow-[0_2px_14px_rgba(94,234,212,0.25)] transition-all hover:from-[#7ff0df] hover:to-[#5eead4] hover:shadow-[0_4px_20px_rgba(94,234,212,0.45)] hover:-translate-y-0.5 sm:flex items-center"
            >
              CHECK MY GPU
            </Link>

            <button
              onClick={() => {
                setMobileOpen((p) => !p);
                setSearchOpen(false);
              }}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden z-50 relative"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "scale-x-0 opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-5 bg-white transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed left-0 right-0 top-0 bottom-0 z-40 bg-[#0a0a0b]/98 backdrop-blur-xl transition-all duration-300 overflow-hidden lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
        {...(!mobileOpen ? { inert: "" as any } : {})}
      >
        <div className="h-full pt-28 pb-12 px-6 overflow-y-auto">
          {/* Mobile Search */}
          <div className="mb-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows & guides..."
              className="w-full bg-[#111113] border border-[#2a2a30] rounded-xl px-5 py-4 text-sm font-mono text-[#e8e8f0] outline-none focus:border-[#7c6af7] transition-all pl-12"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a0]">
              <Search size={18} />
            </div>
            
            {searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-[#111113] border border-[#2a2a30] rounded-xl shadow-xl overflow-hidden py-2 z-10 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <Link
                      key={res.href}
                      href={res.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setSearchQuery("");
                      }}
                      className="block px-4 py-3 border-b border-[#2a2a30]/50 last:border-0 hover:bg-white/5"
                    >
                      <div className="text-[#e8e8f0] text-sm font-bold font-syne">{res.name}</div>
                      <div className="text-[#8888a0] text-[10px] font-mono mt-1">{res.desc}</div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-[#8888a0] text-xs font-mono">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Primary Links */}
          <div className="space-y-1 mb-8">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8888a0] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]"></span>
              Navigate
            </p>
            <div className="space-y-1 border-l-2 border-[#2a2a30] pl-4">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 border-b border-[#2a2a30]/50 last:border-0 font-syne text-[15px] font-bold text-[#e8e8f0] active:text-[#22d3ee] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/#gpu-finder"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-xl bg-gradient-to-r from-[#5eead4] to-[#2dd4bf] py-4 text-center text-xs font-bold uppercase tracking-widest text-[#04121a] shadow-[0_8px_24px_rgba(94,234,212,0.3)]"
            >
              CHECK MY GPU →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}


