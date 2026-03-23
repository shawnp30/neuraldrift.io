'use client';

import { useRef, useEffect, useState } from 'react';
import { MotionValue, useTransform } from 'framer-motion';

const FRAME_COUNT = 120;
const FRAME_START = 1;

interface HeroCanvasProps {
  scrollYProgress: MotionValue<number>;
}

export default function HeroCanvas({ scrollYProgress }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Transform scroll progress to frame index mapping
  const frameIndex = useTransform(scrollYProgress, [0, 1], [FRAME_START, FRAME_COUNT]);

  useEffect(() => {
    // Preload all frames to memory
    const preloadImages = () => {
      let loaded = 0;
      for (let i = FRAME_START; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/images/neuraldrift/hero/${i}.webp`;
        img.onload = () => {
          loaded++;
          setImagesLoaded(loaded);
        };
        // Fallback or handle error if needed, for now just assign
        imagesRef.current[i] = img;
      }
    };
    preloadImages();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const renderCurrentFrame = () => {
      const idx = Math.min(
        FRAME_COUNT,
        Math.max(FRAME_START, Math.round(frameIndex.get()))
      );
      
      const img = imagesRef.current[idx];
      
      if (img && img.complete && img.naturalWidth > 0) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Match canvas logical size to physical
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // 'contain' sizing logic
        const scale = Math.min(rect.width / img.width, rect.height / img.height);
        const drawWidth = img.width * scale * dpr;
        const drawHeight = img.height * scale * dpr;
        
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }
      
      animationFrameId = requestAnimationFrame(renderCurrentFrame);
    };

    renderCurrentFrame();

    return () => cancelAnimationFrame(animationFrameId);
  }, [frameIndex, imagesLoaded]); // Re-run if images load late

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full hero-canvas-blur object-contain"
        role="img"
        aria-label="3D interaction of neuraldrift yacht"
      />
      {/* Loading state if first few frames aren't ready */}
      {imagesLoaded < 10 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-500 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
        </div>
      )}
    </>
  );
}
