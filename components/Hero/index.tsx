'use client';

import HeroTextOverlays from './HeroTextOverlays';
import '../../styles/hero.css';

export default function Hero() {
  return (
    <section className="relative h-screen w-full bg-[#0a0a0f] overflow-hidden">
      {/* Subtle background wave overlay */}
      <div className="absolute inset-0 hero-wave-overlay pointer-events-none z-0 opacity-40 mix-blend-screen" />
      
      {/* Background Graphic instead of Brain Animation */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-20 pointer-events-none">
         <div className="w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      {/* Text Overlays animating in on load */}
      <div className="absolute inset-0 z-20">
        <HeroTextOverlays />
      </div>
      
      {/* Bottom gradient fade out */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-30" />
    </section>
  );
}
