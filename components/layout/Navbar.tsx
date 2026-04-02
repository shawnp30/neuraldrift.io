"use client";

import { useState, useEffect, useRef } from "react";
import { AudioWaveform, Music, BrainCircuit, ChevronDown, Search, X } from "lucide-react";
import Link from "next/link";
import DualTicker from "@/components/DualTicker";

// ─────────────────────────────────────────────────────────────────
// NAV STRUCTURE
// ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    label: "Learn",
    children: [
      { name: "Academy", href: "/tutorials", desc: "Video masterclasses" },
      { name: "Guides", href: "/guides", desc: "Written technical docs" },
      { name: "LTX Video 2.3", href: "/guides/ltx-video-mastery", desc: "SOTA Video generation", badge: "NEW" },
      { name: "ACE-Step 1.5", href: "/guides/ace-step-audio", desc: "Advanced audio synthesis", badge: "NEW" },
      { name: "GPU Guide", href: "/gpu-guide", desc: "What your card can run" },
    ],
  },
  {
    label: "Data-Hub",
    children: [
      { name: "Datasets Hub", href: "/datasets", desc: "Community training data" },
      { name: "Model Library", href: "/models", desc: "Neural architecture hub" },
    ],
  },
  {
    label: "Create",
    children: [
      { name: "Workflows", href: "/workflows", desc: "Pre-built ComfyUI JSON" },
      { name: "Prompt Gen", href: "/prompt-generator", desc: "Build better prompts" },
      { name: "Cloud Gens", href: "/cloud-generators", desc: "Sora, Veo, Midjourney" },
    ],
  },
  {
    label: "Tools",
    children: [
      { name: "VRAM Calculator", href: "/tools/vram-calculator", desc: "Can my GPU run it?" },
      { name: "Benchmark Lookup", href: "/benchmarks", desc: "Compare GPU performance" },
      { name: "Caption Generator", href: "/tools/caption-generator", desc: "Auto-caption your images" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// DROPDOWN COMPONENT
// ─────────────────────────────────────────────────────────────────
function Dropdown({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: { name: string; href: string; desc: string; badge?: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="group relative flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-[#8888a0] transition-colors hover:text-[#e8e8f0]"
      >
        {label}
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#7c6af7]" : ""}`}
        />
        <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 rounded-full bg-gradient-to-r from-[#7c6af7] to-[#22d3ee] transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
      </button>

      <div
        className={`absolute left-1/2 top-full z-50 mt-4 w-60 -translate-x-1/2 rounded-xl border border-[#2a2a30] bg-[#111113] shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        } `}
      >
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#2a2a30] bg-[#111113]" />

        <div className="p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
            >
              <span className="flex items-center justify-between font-syne text-sm font-bold text-[#e8e8f0] transition-colors group-hover:text-[#22d3ee]">
                {item.name}
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                      item.badge.toUpperCase() === "NEW"
                        ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
                        : "bg-[#7c6af7]/10 text-[#7c6af7] border-[#7c6af7]/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] leading-tight text-[#8888a0]">
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN NAVBAR
// ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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

  // Audio setup
  useEffect(() => {
    const audio = new Audio("/sounds/lofi.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const startOnInteraction = () => {
      if (!audioRef.current || isPlaying) return;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          fadeIn();
        })
        .catch(() => {});
    };

    document.addEventListener("click", startOnInteraction, { once: true });
    document.addEventListener("keydown", startOnInteraction, { once: true });

    return () => {
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [isPlaying]);

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

  const toggleMenu = (label: string) =>
    setOpenMenu((prev) => (prev === label ? null : label));

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
        setOpenMenu(null);
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

  // Handle Search filtering across NAV items
  const allSearchableItems = NAV.flatMap((g) => g.children);
  const searchResults = searchQuery
    ? allSearchableItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[60] bg-[#0a0a0b]">
        <DualTicker />
      </div>
      
      <nav
        className={`fixed left-0 right-0 top-[40px] z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-[#2a2a30] bg-[#0a0a0b]/85 py-3 backdrop-blur-xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => {
              setOpenMenu(null);
              setMobileOpen(false);
              setSearchOpen(false);
            }}
            className="group flex flex-shrink-0 items-center gap-2"
          >
            <div className="relative">
              <BrainCircuit
                size={30}
                className="text-[#7c6af7] transition-transform duration-500 group-hover:rotate-12"
              />
              <div className="absolute inset-0 bg-[#7c6af7]/40 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </div>
            <span className="hidden font-syne text-xl font-black tracking-tight text-[#e8e8f0] sm:inline">
              neural<span className="text-[#7c6af7]">drift</span>
            </span>
          </Link>

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
                  placeholder="Search guides & workflows..."
                  className="w-full bg-[#111113] border border-[#2a2a30] rounded-full px-5 py-2 text-xs font-mono text-[#e8e8f0] outline-none focus:border-[#7c6af7] transition-all pl-10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a0]">
                  <Search size={14} />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8888a0] hover:text-[#e8e8f0]"
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

          {/* Desktop Nav Actions */}
          <div className="hidden items-center gap-10 lg:flex">
            {NAV.map((group) => (
              <Dropdown
                key={group.label}
                label={group.label}
                items={group.children}
                isOpen={openMenu === group.label}
                onToggle={() => toggleMenu(group.label)}
                onClose={() => setOpenMenu(null)}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 ml-10">
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
              href="/optimizer"
              className="hidden rounded-full bg-[#7c6af7] px-5 py-2 text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-85 sm:flex"
            >
              CAN I RUN IT?
            </Link>

            <button
              onClick={() => {
                setMobileOpen((p) => !p);
                setOpenMenu(null);
                setSearchOpen(false);
              }}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden z-50 relative"
              aria-label="Toggle menu"
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

      {/* Mobile Menu Slide-down Overlay */}
      <div
        ref={mobileMenuRef}
        className={`fixed left-0 right-0 top-0 bottom-0 z-40 bg-[#0a0a0b]/98 backdrop-blur-xl transition-all duration-300 overflow-hidden lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="h-full pt-28 pb-12 px-6 overflow-y-auto">
          {/* Mobile Search */}
          <div className="mb-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles & workflows..."
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

          <div className="space-y-8">
            {NAV.map((group) => (
              <div key={group.label}>
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#8888a0] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]"></span>
                  {group.label}
                </p>
                <div className="space-y-1 border-l-2 border-[#2a2a30] pl-4">
                  {group.children.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="group flex flex-col py-3 border-b border-[#2a2a30]/50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-syne text-[15px] font-bold text-[#e8e8f0] group-active:text-[#22d3ee] transition-colors">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                              item.badge.toUpperCase() === "NEW"
                                ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
                                : "bg-[#7c6af7]/10 text-[#7c6af7] border-[#7c6af7]/20"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#8888a0] mt-1">
                        {item.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/tools/vram-calculator"
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-2xl bg-[#7c6af7] py-4 text-center text-xs font-black uppercase tracking-widest text-[#0a0a0b] shadow-[0_10px_20px_rgba(124,106,247,0.2)]"
            >
              VRAM CALCULATOR →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
