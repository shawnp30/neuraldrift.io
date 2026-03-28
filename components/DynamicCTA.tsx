"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, BookOpen, Layers, Cpu } from "lucide-react";

interface DynamicCTAProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  tag?: string;
  variant?: "indigo" | "emerald" | "amber" | "cyan" | "violet";
}

const VARIANTS = {
  indigo: {
    bg: "from-indigo-500/10 to-transparent",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    button: "bg-indigo-500 hover:bg-indigo-400",
    glow: "bg-indigo-500/20",
    icon: <Sparkles className="w-5 h-5" />,
  },
  emerald: {
    bg: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    button: "bg-emerald-500 hover:bg-emerald-400",
    glow: "bg-emerald-500/20",
    icon: <Zap className="w-5 h-5" />,
  },
  amber: {
    bg: "from-amber-500/10 to-transparent",
    border: "border-amber-500/20",
    text: "text-amber-400",
    button: "bg-amber-500 hover:bg-amber-400",
    glow: "bg-amber-500/20",
    icon: <BookOpen className="w-5 h-5" />,
  },
  cyan: {
    bg: "from-cyan-500/10 to-transparent",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    button: "bg-cyan-500 hover:bg-cyan-400",
    glow: "bg-cyan-500/20",
    icon: <Layers className="w-5 h-5" />,
  },
  violet: {
    bg: "from-violet-500/10 to-transparent",
    border: "border-violet-500/20",
    text: "text-violet-400",
    button: "bg-violet-500 hover:bg-violet-400",
    glow: "bg-violet-500/20",
    icon: <Cpu className="w-5 h-5" />,
  },
};

export const DynamicCTA: React.FC<DynamicCTAProps> = ({
  title,
  description,
  ctaText,
  ctaHref,
  tag = "// Operational Hook",
  variant = "indigo",
}) => {
  const styles = VARIANTS[variant];

  return (
    <section className={`relative overflow-hidden rounded-[3rem] border ${styles.border} bg-gradient-to-br ${styles.bg} p-12 md:p-20 group`}>
      {/* Background Animated Glow */}
      <div className={`absolute -top-24 -right-24 w-96 h-96 ${styles.glow} rounded-full blur-[120px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000 pointer-events-none`} />
      
      <div className="relative z-10 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-6"
        >
          <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${styles.text}`}>
            {styles.icon}
          </div>
          <span className={`font-mono text-xs ${styles.text} tracking-[0.3em] uppercase font-bold`}>
            {tag}
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-syne text-4xl md:text-5xl font-black text-white mb-8 leading-[1.1] tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 font-medium text-lg md:text-xl mb-12 leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
        >
          <Link 
            href={ctaHref}
            className={`inline-flex items-center gap-3 ${styles.button} text-black font-black py-5 px-10 rounded-2xl hover:scale-[1.02] transition-all shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] active:scale-95 group/btn`}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Decorative Node Elements (matching site theme) */}
      <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-4 opacity-10">
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <div className="h-[1px] w-24 bg-white/50" />
        <div className="w-2 h-2 rounded-full border border-white" />
        <div className="h-[1px] w-12 bg-white/50" />
        <div className="w-3 h-3 rounded-full bg-white/50" />
      </div>
    </section>
  );
};
