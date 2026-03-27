"use client";

import React from "react";
import { Zap, Shield, BookOpen, MessageSquare } from "lucide-react";

const FEATURES = [
  {
    icon: < Zap size={32} className="text-accent-cyan" />,
    title: "Ready-Made ComfyUI Workflows",
    description: "Drag-and-drop pipelines for image, video, LoRA training, and more.",
    color: "accent-cyan"
  },
  {
    icon: < Shield size={32} className="text-accent-purple" />,
    title: "GPU Performance Tools",
    description: "VRAM detection, compatibility checks, and benchmark-based suggestions.",
    color: "accent-purple"
  },
  {
    icon: < BookOpen size={32} className="text-accent-cyan" />,
    title: "Local Training and LoRA Guides",
    description: "Step-by-step instructions for fine-tuning models locally.",
    color: "accent-cyan"
  },
  {
    icon: < MessageSquare size={32} className="text-accent-purple" />,
    title: "Prompt Engineering Utilities",
    description: "Structured prompts and generation templates.",
    color: "accent-purple"
  }
];

export const ValueProp = () => {
  return (
    <section className="py-24 bg-[#080b0f] border-t border-white/5">
      <div className="nh-container">
        <div className="text-center mb-16">
          <div className="nh-section-label justify-center mb-4">Core Capabilities</div>
          <h2 className="font-syne text-4xl md:text-5xl font-[800] text-white tracking-tight">
            Your Local AI Workflow Hub
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div 
              key={idx} 
              className="nh-glass-card p-8 rounded-3xl flex flex-col items-start group"
            >
              <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-[800] text-white mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 font-[500] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
