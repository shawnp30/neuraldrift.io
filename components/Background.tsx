"use client";

import { useEffect, useRef } from "react";

export default function Background() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef<HTMLDivElement>(null);
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    const updateGlow = () => {
      if (glowRef.current) {
        // Smooth easing
        currentPos.current.x = lerp(currentPos.current.x, mouseRef.current.x, 0.1);
        currentPos.current.y = lerp(currentPos.current.y, mouseRef.current.y, 0.1);
        glowRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
      }
      animationFrame = requestAnimationFrame(updateGlow);
    };

    window.addEventListener("mousemove", handleMouseMove);
    updateGlow(); // start animation loop

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
      {/* Grid and gradient background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf815_1px,transparent_1px),linear-gradient(to_bottom,#818cf815_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] mix-blend-screen" />
      {/* Color blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[130px] mix-blend-screen" />
      <div className="absolute top-[40%] right-[-10%] w-[30vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[150px] mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[30vw] rounded-full bg-violet-600/10 blur-[140px] mix-blend-screen" />
      {/* Glow following mouse */}
      <div
        ref={glowRef}
        className="fixed z-0 pointer-events-none transition-all duration-500 ease-out"
      >
        <div className="w-2 h-2 rounded-full bg-indigo-500 blur-[2px] opacity-70" />
        <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-[8px]" />
      </div>
    </div>
  );
}