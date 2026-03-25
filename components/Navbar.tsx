'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outfit } from 'next/font/google';
import { AudioWaveform, Play, Pause, Music, BrainCircuit } from 'lucide-react';
import '../styles/hero.css';

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '800'] });

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const audio = new Audio('/sounds/lofi.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.autoplay = true;
    audioRef.current = audio;

    const attemptAutoplay = async () => {
      if (!audioRef.current || isPlaying) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        fadeInAudio();
        // Cleanup listeners once successfully playing
        document.removeEventListener('click', attemptAutoplay);
        document.removeEventListener('keydown', attemptAutoplay);
        document.removeEventListener('scroll', attemptAutoplay);
      } catch (err) {
        // Silently catch autoplay rejections
      }
    };

    attemptAutoplay(); // Try immediately

    // Attach to first interactions to bypass browser autoplay blocks globally
    document.addEventListener('click', attemptAutoplay, { once: true });
    document.addEventListener('keydown', attemptAutoplay, { once: true });
    document.addEventListener('scroll', attemptAutoplay, { once: true });

    return () => {
      document.removeEventListener('click', attemptAutoplay);
      document.removeEventListener('keydown', attemptAutoplay);
      document.removeEventListener('scroll', attemptAutoplay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const fadeInAudio = () => {
    if (!audioRef.current) return;
    let vol = 0;
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      if (vol < 0.4) {
        vol += 0.02; // Slower, calmer fade
        audioRef.current.volume = Math.min(vol, 0.4);
      } else {
        clearInterval(fadeInterval);
      }
    }, 100);
  };

  const fadeOutAudio = (callback?: () => void) => {
    if (!audioRef.current) return;
    let vol = audioRef.current.volume;
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }
      if (vol > 0.05) {
        vol -= 0.05;
        audioRef.current.volume = Math.max(vol, 0);
      } else {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        clearInterval(fadeInterval);
        if (callback) callback();
      }
    }, 100);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeOutAudio(() => setIsPlaying(false));
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        fadeInAudio();
      });
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full font-sans">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.05)] py-4' 
            : 'bg-transparent py-6'
        } ${outfit.className}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between w-full relative z-10">
          
          {/* Brand/Logo (Left) */}
          <div className="flex items-center gap-2">
            <a href="/" className="text-2xl md:text-3xl font-[800] tracking-tight text-white flex items-center gap-2 group drop-shadow-md">
              <div className="relative">
                <BrainCircuit size={32} className="text-indigo-400 transition-transform duration-500 group-hover:rotate-12" />
                <div className="absolute inset-0 blur-md bg-indigo-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="hidden sm:inline">neural<span className="text-indigo-400">drift</span></span>
            </a>
          </div>

          {/* Center Links */}
          <div className="hidden lg:flex flex-wrap flex-1 items-center justify-center gap-4 xl:gap-6 px-4">
            {[
              { name: 'Academy', href: '/tutorials' },
              { name: 'Guides', href: '/guides' },
              { name: 'Workflows', href: '/workflows' },
              { name: 'Hardware', href: '/hardware' },
              { name: 'GPU Guide', href: '/gpu-guide' },
              { name: 'LoRA Training', href: '/loras' },
              { name: 'Optimizer', href: '/optimizer' },
              { name: 'Proofs', href: '/proofs' },
              { name: 'Prompt Gen', href: '/prompt-generator' },
              { name: 'Cloud Gens', href: '/cloud-generators' },
              { name: 'User Uploads', href: '/admin/upload-workflow' },
            ].map(link => (
              <a 
                key={link.name} 
                href={link.href}
                className="group relative text-[13px] xl:text-sm font-[700] tracking-wide text-zinc-300 hover:text-white transition-colors"
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 block whitespace-nowrap">
                  {link.name}
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            
            {/* Elegant Play/Pause Background Music Toggle */}
            <button
              onClick={toggleAudio}
              aria-label={isPlaying ? "Pause background music" : "Play background music"}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-indigo-400 hover:bg-white/5 transition-all focus:outline-none"
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    <AudioWaveform className="w-5 h-5 animate-pulse text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="paused"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Soft pulse effect when playing */}
              {isPlaying && (
                <motion.div 
                  className="absolute inset-0 rounded-full border border-indigo-500/50"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                />
              )}
            </button>

            {/* Primary Navbar CTA */}
            <a
              href="/contact"
              className="hidden sm:flex px-6 py-2.5 text-xs uppercase tracking-widest font-[800] text-black bg-white hover:bg-indigo-400 hover:text-white rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(129,140,248,0.4)]"
            >
              Contact
            </a>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
