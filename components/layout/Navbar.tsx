"use client";

import { useState, useEffect, useRef } from "react";
import { AudioWaveform, Music, BrainCircuit, ChevronDown } from "lucide-react";
import Link from "next/link";
import DualTicker from "@/components/DualTicker";

// ─────────────────────────────────────────────────────────────────
// NAV STRUCTURE
// Each top-level item has a label and a children array.
// children = the links that appear inside that dropdown.
// ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    label: "Learn",
    children: [
      { name: "Academy", href: "/tutorials", desc: "Video masterclasses" },
      { name: "Guides", href: "/guides", desc: "Written technical docs" },
      { name: "GPU Guide", href: "/gpu-guide", desc: "What your card can run" },
    ],
  },
  {
    label: "Data-Hub",
    children: [
      // ── Model Training feature temporarily disabled ──
      // Uncomment to re-enable Training Studio when ready
      // {
      //   name: "Training Studio",
      //   href: "/lora-training",
      //   desc: "Fine-tune your models",
      // },
      {
        name: "Datasets Hub",
        href: "/datasets",
        desc: "Community training data",
      },
      {
        name: "Model Library",
        href: "/models",
        desc: "Neural architecture hub",
      },
    ],
  },
  {
    label: "Create",
    children: [
      { name: "Workflows", href: "/workflows", desc: "Pre-built ComfyUI JSON" },
      {
        name: "Prompt Gen",
        href: "/prompt-generator",
        desc: "Build better prompts",
      },
      {
        name: "Cloud Gens",
        href: "/cloud-generators",
        desc: "Sora, Veo, Midjourney",
      },
    ],
  },
  {
    label: "Tools",
    children: [
      { name: "Optimizer", href: "/optimizer", desc: "Hardware scoring" },
      { name: "Hardware", href: "/hardware", desc: "Compatibility check" },
      { name: "Proofs", href: "/proofs", desc: "Verified outputs" },
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
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: { name: string; href: string; desc: string }[];
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
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger button ── */}
      <button
        onClick={onToggle}
        className="group relative flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
      >
        {label}
        {/*
          ChevronDown rotates 180deg when open.
          isOpen ? 'rotate-180' applies the Tailwind rotate class conditionally.
        */}
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-accent" : ""}`}
        />
        {/* Underline wipe animation on hover */}
        <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 rounded-full bg-gradient-to-r from-accent to-accent-purple transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
      </button>

      {/*
        ── Dropdown panel ──
        CSS-only show/hide — no JS animation library needed:
          closed → opacity-0, translate-y-1, pointer-events-none (can't click)
          open   → opacity-100, translate-y-0, pointer-events-auto (clickable)
        The 'transition-all duration-200' smoothly animates between the two states.
      */}
      <div
        className={`duration-260 absolute left-1/2 top-full z-50 mt-4 w-56 -translate-x-1/2 rounded-xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        } `}
      >
        {/* Small arrow notch pointing up at the trigger */}
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-surface" />

        <div className="p-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-card"
            >
              <span className="font-syne text-sm font-bold text-white transition-colors group-hover:text-accent">
                {item.name}
              </span>
              <span className="font-mono text-[10px] leading-tight text-muted">
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
  // openMenu holds the label string of whichever dropdown is open, or null
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Scroll listener ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Audio setup ──────────────────────────────────────────────
  // Drop your audio file at: public/sounds/lofi.mp3
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

  // Opens the clicked dropdown, closes it if it was already open
  const toggleMenu = (label: string) =>
    setOpenMenu((prev) => (prev === label ? null : label));

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[60] bg-black">
        <DualTicker />
      </div>
      <nav
        className={`fixed left-0 right-0 top-[40px] z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-bg/85 py-3 backdrop-blur-xl"
            : "bg-transparent py-5"
        } `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* ── Logo ── */}
          <Link
            href="/"
            onClick={() => {
              setOpenMenu(null);
              setMobileOpen(false);
            }}
            className="group flex flex-shrink-0 items-center gap-2"
          >
            <div className="relative">
              <BrainCircuit
                size={30}
                className="text-accent transition-transform duration-500 group-hover:rotate-12"
              />
              <div className="absolute inset-0 bg-accent/40 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </div>
            <span className="hidden font-syne text-xl font-black tracking-tight text-white sm:inline">
              neural<span className="text-accent">drift</span>
            </span>
          </Link>

          {/* ── Desktop dropdowns ── */}
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

          {/* ── Right side: music + CTA + mobile toggle ── */}
          <div className="flex items-center gap-3">
            {/* Music toggle */}
            <button
              onClick={toggleAudio}
              aria-label={
                isPlaying ? "Pause background music" : "Play background music"
              }
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-white/5 hover:text-accent"
            >
              {isPlaying ? (
                <AudioWaveform className="h-4 w-4 animate-pulse text-accent" />
              ) : (
                <Music className="h-4 w-4" />
              )}
              {isPlaying && (
                <span className="absolute inset-0 animate-ping rounded-full border border-accent/40" />
              )}
            </button>

            {/* CTA */}
            <Link
              href="/optimizer"
              className="hidden rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-85 sm:flex"
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
              onClick={() => {
                setMobileOpen((p) => !p);
                setOpenMenu(null);
              }}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 lg:hidden"
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

      {/*
        ── Mobile slide-down menu ──
        Sits behind the navbar (z-40 vs nav's z-50).
        max-h animates from 0 → screen height when mobileOpen flips.
        overflow-hidden clips the content during the animation.
      */}
      <div
        className={`bg-bg/97 fixed left-0 right-0 top-0 z-40 overflow-hidden border-b border-border pt-20 backdrop-blur-xl transition-all duration-300 lg:hidden ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"} `}
      >
        <div className="space-y-7 px-6 pb-8">
          {NAV.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">
                {"// " + group.label}
              </p>
              {/* Links */}
              <div className="space-y-1 border-l border-border pl-3">
                {group.children.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center justify-between py-2.5"
                  >
                    <span className="font-syne text-sm font-bold text-white transition-colors group-hover:text-accent">
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
            className="block w-full rounded-full bg-accent py-3 text-center text-sm font-bold uppercase tracking-widest text-black"
          >
            CAN I RUN IT? →
          </Link>
        </div>
      </div>
    </>
  );
}
