'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outfit } from 'next/font/google';
import { AudioWaveform, Play, Pause, Music } from 'lucide-react';
import '../styles/hero.css';

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '800'] });

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll detection for blurring background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Audio lifecycle
  useEffect(() => {
    // 1. Initialize audio
    const audio = new Audio('/sounds/background-music.mp3');
    audio.loop = true;
    audio.volume = 0; // Prepare for fade in
    audioRef.current = audio;

    // 2. Autoplay attempt with soft fade
    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        fadeInAudio();
      } catch (err) {
        console.log("Autoplay blocked by browser. User must interact to play audio.", err);
      }
    };
    attemptAutoplay();

    // 3. Cleanup on unmount (navigation to another page)
    return () => {
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
      if (vol < 0.3) { // Soft max volume
        vol += 0.05;
        audioRef.current.volume = Math.min(vol, 0.3);
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-md border-b border-white/5 py-4' 
          : 'bg-transparent py-6'
      } ${outfit.className}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <a href="/" className="text-2xl font-[800] tracking-tight text-white flex items-center">
            neural<span className="text-[#00E5FF]">drift</span>
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* Elegant Play/Pause Background Music Toggle */}
          <button
            onClick={toggleAudio}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-[#00E5FF] hover:bg-white/5 transition-all focus:outline-none"
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
                  <AudioWaveform className="w-5 h-5 animate-pulse text-[#00E5FF]" />
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
                className="absolute inset-0 rounded-full border border-[#00E5FF]"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
            )}
          </button>

          {/* Primary Navbar CTA */}
          <a
            href="#contact"
            className="hidden md:flex px-5 py-2 text-sm font-[600] text-white bg-white/5 border border-white/10 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-full transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
