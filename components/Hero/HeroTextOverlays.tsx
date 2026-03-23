'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '800'] });

interface HeroTextOverlaysProps {
  scrollYProgress: MotionValue<number>;
}

export default function HeroTextOverlays({ scrollYProgress }: HeroTextOverlaysProps) {
  // Top-Left: Headline (Fades in immediately, stays until midway)
  const hlOpacity = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.5], [0, 1, 1, 0]);
  const hlY = useTransform(scrollYProgress, [0, 0.5], [20, -20]);

  // Top-Right: Subheadline (Appears slightly after headline)
  const shOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.5, 0.6], [0, 1, 1, 0]);
  const shY = useTransform(scrollYProgress, [0.1, 0.6], [20, -20]);

  // Bottom-Left: Microcopy (Fades in midway, leaves near end)
  const mcOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.7, 0.8], [0, 1, 1, 0]);
  const mcY = useTransform(scrollYProgress, [0.3, 0.8], [20, -20]);

  // Bottom-Right: CTAs (Fades in at the end to prompt next action)
  const ctaOpacity = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, [0.6, 1], [20, 0]);

  return (
    <div className={`relative w-full h-full p-6 md:p-12 lg:p-24 pointer-events-none ${outfit.className}`}>
      
      {/* 1. TOP-LEFT: Headline */}
      <motion.div
        style={{ opacity: hlOpacity, y: hlY }}
        className="absolute top-24 left-6 md:left-12 lg:left-24 max-w-sm md:max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[800] text-white leading-tight tracking-tight drop-shadow-2xl">
          neural<span className="text-[#00E5FF]">drift.</span>
          <br />
          Your ai workflow, reimagined.
        </h1>
      </motion.div>

      {/* 2. TOP-RIGHT: Subheadline */}
      <motion.div
        style={{ opacity: shOpacity, y: shY }}
        className="absolute top-32 right-6 md:right-12 lg:right-24 max-w-xs md:max-w-md text-right"
      >
        <p className="text-lg md:text-xl lg:text-2xl font-[600] text-gray-200 leading-relaxed drop-shadow-md">
          Hybrid-electric catamaran · AI energy orchestration · Silent, zero-odour journeys.
        </p>
      </motion.div>

      {/* 3. BOTTOM-LEFT: Microcopy */}
      <motion.div
        style={{ opacity: mcOpacity, y: mcY }}
        className="absolute bottom-32 left-6 md:left-12 lg:left-24 max-w-xs md:max-w-sm"
      >
        <p className="text-base md:text-lg text-gray-400 font-[600] drop-shadow">
          Discover the future of cruising — efficient, silent, beautiful.
        </p>
      </motion.div>

      {/* 4. BOTTOM-RIGHT: CTAs */}
      <motion.div
        style={{ opacity: ctaOpacity, y: ctaY }}
        className="absolute bottom-24 right-6 md:right-12 lg:right-24 flex flex-col sm:flex-row gap-4 pointer-events-auto"
      >
        <a
          href="#modes"
          className="group relative px-6 py-3 bg-white text-black font-[800] rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
        >
          <span className="relative z-10 flex items-center gap-2">
            Discover Modes <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
          <div className="absolute inset-0 bg-[#00E5FF] transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </a>
        
        <a
          href="/contact"
          className="px-6 py-3 border border-gray-600 text-white font-[600] rounded-full hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors duration-300 flex items-center justify-center backdrop-blur-sm bg-black/20"
        >
          Request Info
        </a>
      </motion.div>

    </div>
  );
}
