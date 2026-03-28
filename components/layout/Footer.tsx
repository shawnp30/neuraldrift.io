"use client";

import Link from "next/link";
import React from "react";
import { BrainCircuit } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/workflows", label: "Workflows" },
  { href: "/tutorials", label: "Guides" },
  { href: "/datasets", label: "Datasets" },
  { href: "/models", label: "Models" },
  { href: "/hardware", label: "GPU Checker" },
  { href: "mailto:contact@neuraldrift.io", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030712] py-12 pb-16">
      <div className="nh-container">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-[800] text-white"
            >
              <BrainCircuit size={28} className="text-accent-cyan" />
              <span>
                neural<span className="text-accent-cyan">drift</span>
              </span>
            </Link>
            <p className="text-center font-mono text-xs uppercase leading-loose tracking-widest text-zinc-500 md:text-left">
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
                    className="hover:text-accent-cyan font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            © {new Date().getFullYear()} neuraldrift — All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-green-500/10 bg-green-500/5 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-green-500/80">
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
