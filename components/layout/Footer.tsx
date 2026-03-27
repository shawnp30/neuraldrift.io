"use client";

import Link from "next/link";
import React from "react";
import { BrainCircuit } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/workflows", label: "Workflows" },
  { href: "/tutorials", label: "Guides" },
  { href: "/hardware", label: "Tools" },
  { href: "/hardware", label: "GPU Checker" },
  { href: "mailto:contact@neuraldrift.io", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="bg-[#030712] border-t border-white/5 py-12 pb-16">
      <div className="nh-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 font-[800] text-xl text-white">
              <BrainCircuit size={28} className="text-accent-cyan" />
              <span>
                neural<span className="text-accent-cyan">drift</span>
              </span>
            </Link>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest leading-loose text-center md:text-left">
              Local AI Workflow Architecture <br />
              Built for precision.
            </p>
          </div>

          <nav>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-accent-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            © {new Date().getFullYear()} neuraldrift — All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-green-500/80">
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
