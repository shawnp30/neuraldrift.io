"use client";

import Image from "next/image";
import { Play, Info, ArrowRight } from "lucide-react";
import { useState } from "react";

interface VideoHeroProps {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  ctaText: string;
  onCtaClick?: () => void;
}

export function VideoHero({
  title,
  description,
  videoUrl,
  thumbnail,
  ctaText,
  onCtaClick,
}: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/40 p-1 backdrop-blur-3xl shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Info size={14} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Operational Briefing
            </span>
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            {title.split(" ").map((word, i) => 
              word.toLowerCase() === "training" || word.toLowerCase() === "datasets" ? 
              <span key={i} className="text-accent">{word} </span> : word + " "
            )}
          </h2>
          <p className="text-zinc-400 font-medium text-lg mb-10 leading-relaxed max-w-xl">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onCtaClick}
              className="flex items-center gap-2 bg-accent text-black font-bold py-4 px-8 rounded-2xl hover:opacity-90 transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              {ctaText}
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/10 transition-all"
            >
              <Play size={18} fill="currentColor" />
              WATCH MASTERCLASS
            </button>
          </div>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer" onClick={() => setIsPlaying(true)}>
          {!isPlaying ? (
            <>
              <Image
                src={thumbnail}
                alt="Video Thumbnail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)]">
                    <Play size={24} fill="black" className="ml-1" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">Coming Next:</p>
                <p className="text-white font-bold tracking-tight">Advanced Optimization Workflow v2.4</p>
              </div>
            </>
          ) : (
            <iframe 
              src={`${videoUrl}?autoplay=1`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-accent/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
    </section>
  );
}
