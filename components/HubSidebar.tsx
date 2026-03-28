"use client";

import {
  Layout,
  Database,
  Tag,
  Globe,
  Filter,
  ChevronDown,
  Search,
  Zap,
  BookOpen,
  Scale,
} from "lucide-react";
import { useState } from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon?: any;
}

interface SidebarSection {
  id: string;
  label: string;
  icon: any;
  items: SidebarItem[];
}

const SECTIONS: SidebarSection[] = [
  {
    id: "tasks",
    label: "Tasks",
    icon: Layout,
    items: [
      { id: "text-to-image", label: "Text-to-Image" },
      { id: "image-to-image", label: "Image-to-Image" },
      { id: "image-to-text", label: "Image-to-Text" },
      { id: "text-generation", label: "Text Generation" },
      { id: "automatic-speech-recognition", label: "Speech Recognition" },
    ],
  },
  {
    id: "libraries",
    label: "Libraries",
    icon: Database,
    items: [
      { id: "pytorch", label: "PyTorch" },
      { id: "transformers", label: "Transformers" },
      { id: "diffusers", label: "Diffusers" },
      { id: "safetensors", label: "Safetensors" },
      { id: "coreml", label: "Core ML" },
    ],
  },
  {
    id: "languages",
    label: "Languages",
    icon: Globe,
    items: [
      { id: "en", label: "English" },
      { id: "zh", label: "Chinese" },
      { id: "fr", label: "French" },
      { id: "ja", label: "Japanese" },
    ],
  },
  {
    id: "licenses",
    label: "Licenses",
    icon: Scale,
    items: [
      { id: "apache-2.0", label: "Apache 2.0" },
      { id: "mit", label: "MIT" },
      { id: "openrail", label: "OpenRAIL" },
      { id: "cc-by-4.0", label: "CC BY 4.0" },
    ],
  },
];

interface HubSidebarProps {
  onFilterChange?: (taskId: string) => void;
  activeFilter?: string;
}

export function HubSidebar({ onFilterChange, activeFilter }: HubSidebarProps) {
  const [expanded, setExpanded] = useState<string[]>(["tasks"]);

  const toggleSection = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-120px)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-black/5 p-6 lg:flex">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
          <Filter className="h-4 w-4 text-accent" /> Filters
        </h2>
        <span className="font-mono text-[10px] uppercase text-zinc-600">
          Source: HuggingFace
        </span>
      </div>

      <div className="space-y-8">
        {SECTIONS.filter((s) => s.id === "tasks").map((section) => (
          <div key={section.id} className="space-y-3">
            <button
              onClick={() => toggleSection(section.id)}
              className="group flex w-full items-center justify-between text-zinc-500 transition-colors hover:text-white"
            >
              <div className="flex items-center gap-2">
                <section.icon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {section.label}
                </span>
              </div>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${expanded.includes(section.id) ? "rotate-180" : ""}`}
              />
            </button>

            {expanded.includes(section.id) && (
              <div className="space-y-1 pl-6">
                <button
                  onClick={() => onFilterChange?.("all")}
                  className={`block w-full py-1.5 text-left font-mono text-[11px] transition-colors ${
                    activeFilter === "all" || !activeFilter
                      ? "font-bold text-accent"
                      : "text-zinc-500 hover:text-accent"
                  }`}
                >
                  All Models
                </button>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onFilterChange?.(item.id)}
                    className={`block w-full py-1.5 text-left font-mono text-[11px] transition-colors ${
                      activeFilter === item.id
                        ? "font-bold text-accent shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                        : "text-zinc-500 hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="cursor-not-allowed space-y-3 border-t border-white/5 pt-4 opacity-50">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Advanced Filters Coming Soon
          </span>
        </div>
      </div>

      <div className="mt-auto border-t border-white/5 pt-8">
        <div className="rounded-2xl border border-accent/10 bg-accent/5 p-4">
          <Zap className="mb-2 h-4 w-4 text-accent" />
          <p className="font-mono text-[10px] leading-relaxed text-zinc-400">
            PRO: Access zero-latency inference for all models.
          </p>
          <button className="mt-3 text-[10px] font-bold uppercase text-accent hover:underline">
            Upgrade Now →
          </button>
        </div>
      </div>
    </aside>
  );
}
