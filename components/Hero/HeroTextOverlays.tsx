'use client';

import { motion } from 'framer-motion';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '800'] });

export default function HeroTextOverlays() {
  return (
    <div className={`relative w-full h-full p-6 md:p-12 lg:p-24 flex flex-col items-center justify-center pt-32 ${outfit.className}`}>
      
      {/* ── MASSIVE CENTERED BRANDING ── */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 relative"
        >
          {/* Subtle background glow behind the main text */}
          <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[140px] font-[800] tracking-tighter text-white leading-[0.9] drop-shadow-2xl font-syne relative z-10 selection:bg-indigo-500/30">
            neural<span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-indigo-500 to-cyan-400">drift.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-[700] tracking-tight text-white/90 mb-6 drop-shadow-xl col-span-2">
            Your AI workflow, <br className="md:hidden" />
            <span className="text-indigo-300">reimagined.</span>
          </h2>
          
          <p className="text-lg md:text-xl font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-6">
            The ultimate hub dedicated to guiding, teaching, and helping you build, train, and master <span className="text-white font-[700]">ComfyUI</span> workflows. Run local AI beautifully.
          </p>
        </motion.div>

        {/* Action Buttons (Pointer events restored here) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="/tutorials"
            className="group relative px-8 py-4 bg-white text-black font-[800] tracking-widest uppercase text-sm rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(129,140,248,0.4)] transition-all duration-500"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Learning <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay" />
          </a>

          <a
            href="/hardware"
            className="group px-8 py-4 bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white font-[700] tracking-widest uppercase text-sm rounded-full transition-all duration-500 backdrop-blur-md"
          >
            Check Hardware
          </a>
        </motion.div>
      </div>
    </div>
  );
}
