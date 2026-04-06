"use client";

import React from "react";

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* Base color */}
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#7c6af7] blur-[120px] animate-blob" 
        />
        <div 
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#22d3ee] blur-[120px] animate-blob animation-delay-2000" 
        />
        <div 
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#7c6af7]/30 blur-[100px] animate-blob animation-delay-4000" 
        />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0b_100%)]" />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HeroBackground;
