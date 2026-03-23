'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import HeroCanvas from './HeroCanvas';
import HeroTextOverlays from './HeroTextOverlays';
import '../../styles/hero.css';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll over the entire 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={containerRef} className="relative h-[500vh] w-full bg-black">
      {/* Sticky container pins to the top for 100vh while section scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Subtle background wave overlay */}
        <div className="absolute inset-0 hero-wave-overlay pointer-events-none z-0" />
        
        {/* Canvas for frame animation */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <HeroCanvas scrollYProgress={scrollYProgress} />
        </div>

        {/* Text Overlays in 4 corners */}
        <div className="absolute inset-0 z-20">
          <HeroTextOverlays scrollYProgress={scrollYProgress} />
        </div>
        
        {/* Bottom gradient fade out */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-30" />
      </div>
    </section>
  );
}
