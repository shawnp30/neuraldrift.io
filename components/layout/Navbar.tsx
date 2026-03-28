'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioWaveform, Music, BrainCircuit, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import DualTicker from "@/components/DualTicker";


// ─────────────────────────────────────────────────────────────────
// NAV STRUCTURE
// Each top-level item has a label and a children array.
// children = the links that appear inside that dropdown.
// ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    label: 'Learn',
    children: [
      { name: 'Academy',   href: '/tutorials',  desc: 'Video masterclasses' },
      { name: 'Guides',    href: '/guides',      desc: 'Written technical docs' },
      { name: 'GPU Guide', href: '/gpu-guide',   desc: 'What your card can run' },
    ],
  },
  {
    label: 'Create',
    children: [
      { name: 'Workflows',     href: '/workflows',        desc: 'Pre-built ComfyUI JSON' },
      { name: 'LoRA Training', href: '/loras',            desc: 'Custom model creation' },
      { name: 'Prompt Gen',    href: '/prompt-generator', desc: 'Build better prompts' },
      { name: 'Cloud Gens',    href: '/cloud-generators', desc: 'Sora, Veo, Midjourney' },
    ],
  },
  {
    label: 'Tools',
    children: [
      { name: 'Optimizer', href: '/optimizer', desc: 'Hardware scoring' },
      { name: 'Hardware',  href: '/hardware',  desc: 'Compatibility check' },
      { name: 'Datasets',  href: '/datasets',  desc: 'Training repositories' },
      { name: 'Proofs',    href: '/proofs',    desc: 'Verified outputs' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// DROPDOWN COMPONENT
// Receives isOpen/onToggle/onClose from the parent so only one
// dropdown can be open at a time.
// ─────────────────────────────────────────────────────────────────
function Dropdown({
  label,
  children,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  children: { name: string; href: string; desc: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close this dropdown when the user clicks anywhere outside it
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">

      {/* ── Trigger button ── */}
      <button
        onClick={onToggle}
        className="group relative flex items-center gap-1 font-mono text-xs tracking-widest uppercase text-muted hover:text-white transition-colors"
      >
        {label}
        {/*
          ChevronDown rotates 180deg when open.
          isOpen ? 'rotate-180' applies the Tailwind rotate class conditionally.
        */}
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`}
        />
        {/* Underline wipe animation on hover */}
        <span className="
          absolute -bottom-1 left-0 w-full h-[2px] rounded-full
          bg-gradient-to-r from-accent to-accent-purple
          scale-x-0 origin-right
          transition-transform duration-300 ease-out
          group-hover:scale-x-100 group-hover:origin-left
        " />
      </button>

      {/*
        ── Dropdown panel ──
        CSS-only show/hide — no JS animation library needed:
          closed → opacity-0, translate-y-1, pointer-events-none (can't click)
          open   → opacity-100, translate-y-0, pointer-events-auto (clickable)
        The 'transition-all duration-200' smoothly animates between the two states.
      */}
      <div className={`
        absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50
        w-56 rounded-xl border border-border bg-surface
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        transition-all duration-260
        ${isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'}
      `}>
        {/* Small arrow notch pointing up at the trigger */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-surface border-l border-t border-border" />

        <div className="p-2">
          {children.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-card transition-colors group"
            >
              <span className="font-syne text-sm font-bold text-white group-hover:text-accent transition-colors">
                {item.name}
              </span>
              <span className="font-mono text-[10px] text-muted leading-tight">
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
  const [scrolled,   setScrolled]   = useState(false);
  const [isPlaying,  setIsPlaying]  = useState(false);
  // openMenu holds the label string of whichever dropdown is open, or null
  const [openMenu,   setOpenMenu]   = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Scroll listener ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Audio setup ──────────────────────────────────────────────
  // Drop your audio file at: public/sounds/lofi.mp3
  useEffect(() => {
    const audio = new Audio('/sounds/lofi.mp3');
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;

    const startOnInteraction = () => {
      if (!audioRef.current || isPlaying) return;
      audioRef.current.play()
        .then(() => { setIsPlaying(true); fadeIn(); })
        .catch(() => {});
    };

    document.addEventListener('click',   startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click',   startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const fadeIn = () => {
    if (!audioRef.current) return;
    let vol = 0;
    const tick = setInterval(() => {
      if (!audioRef.current) { clearInterval(tick); return; }
      vol = Math.min(vol + 0.02, 0.4);
      audioRef.current.volume = vol;
      if (vol >= 0.4) clearInterval(tick);
    }, 100);
  };

  const fadeOut = (onDone?: () => void) => {
    if (!audioRef.current) return;
    let vol = audioRef.current.volume;
    const tick = setInterval(() => {
      if (!audioRef.current) { clearInterval(tick); return; }
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
      audioRef.current.play()
        .then(() => { setIsPlaying(true); fadeIn(); })
        .catch(() => {});
    }
  };

  // Opens the clicked dropdown, closes it if it was already open
  const toggleMenu = (label: string) =>
    setOpenMenu((prev) => (prev === label ? null : label));

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-black">
        <DualTicker />
      </div>
      <nav className={`
        fixed top-[40px] left-0 right-0 z-50 w-full
        transition-all duration-300
        ${scrolled
          ? 'bg-bg/85 backdrop-blur-xl border-b border-border py-3'
          : 'bg-transparent py-5'}
      `}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link
            href="/"
            onClick={() => { setOpenMenu(null); setMobileOpen(false); }}
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="relative">
              <BrainCircuit size={30} className="text-accent transition-transform duration-500 group-hover:rotate-12" />
              <div className="absolute inset-0 blur-md bg-accent/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="hidden sm:inline font-syne text-xl font-black tracking-tight text-white">
              neural<span className="text-accent">drift</span>
            </span>
          </Link>

          {/* ── Desktop dropdowns ── */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV.map((group) => (
              <Dropdown
                key={group.label}
                label={group.label}
                children={group.children}
                isOpen={openMenu === group.label}
                onToggle={() => toggleMenu(group.label)}
                onClose={() => setOpenMenu(null)}
              />
            ))}
          </div>

          {/* ── Right side: music + CTA + mobile toggle ── */}
          <div className="flex items-center gap-3">

            {/* Music toggle */}
            <button
              onClick={toggleAudio}
              aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
              className="relative flex items-center justify-center w-9 h-9 rounded-full text-muted hover:text-accent hover:bg-white/5 transition-all"
            >
              {isPlaying
                ? <AudioWaveform className="w-4 h-4 animate-pulse text-accent" />
                : <Music className="w-4 h-4" />}
              {isPlaying && (
                <span className="absolute inset-0 rounded-full border border-accent/40 animate-ping" />
              )}
            </button>

            {/* CTA */}
            <Link
              href="/optimizer"
              className="hidden sm:flex px-5 py-2 rounded-full bg-accent text-black text-xs font-bold tracking-widest uppercase hover:opacity-85 transition-opacity"
            >
              CAN I RUN IT?
            </Link>

            {/*
              Mobile hamburger button — only visible below lg (1024px).
              Three bars animate into an X when mobileOpen is true:
              - top bar: rotate-45 + shift down (translate-y-2)
              - middle bar: fade out (opacity-0)
              - bottom bar: -rotate-45 + shift up (-translate-y-2)
            */}
            <button
              onClick={() => { setMobileOpen((p) => !p); setOpenMenu(null); }}
              className="lg:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

          </div>
        </div>
      </nav>

      {/*
        ── Mobile slide-down menu ──
        Sits behind the navbar (z-40 vs nav's z-50).
        max-h animates from 0 → screen height when mobileOpen flips.
        overflow-hidden clips the content during the animation.
      */}
      <div className={`
        lg:hidden fixed top-0 left-0 right-0 z-40 pt-20
        bg-bg/97 backdrop-blur-xl border-b border-border
        transition-all duration-300 overflow-hidden
        ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-6 pb-8 space-y-7">

          {NAV.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              <p className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">
                // {group.label}
              </p>
              {/* Links */}
              <div className="space-y-1 pl-3 border-l border-border">
                {group.children.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-2.5 group"
                  >
                    <span className="font-syne text-sm font-bold text-white group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {item.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/optimizer"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center py-3 rounded-full bg-accent text-black font-bold text-sm tracking-widest uppercase"
          >
            CAN I RUN IT? →
          </Link>

        </div>
      </div>
    </>
  );
}
