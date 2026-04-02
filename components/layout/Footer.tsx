"use client";

import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-[#1a1e2e] py-12 bg-[#06080d]">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Brand Col */}
          <div className="flex flex-col">
            <Link
              href="/"
              className="flex items-center gap-3 text-white no-underline group"
            >
              <div className="relative flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                  <circle cx="16" cy="16" r="5" fill="#00e5a0" opacity=".8" />
                  <circle
                    cx="16"
                    cy="16"
                    r="9"
                    stroke="#00e5a0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity=".3"
                    className="group-hover:animate-spin-slow origin-center"
                  />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-syne)] text-[0.95rem] font-[800] uppercase tracking-[0.12em]">
                Neural<span className="text-[#00e5a0]">Drift</span>
              </span>
            </Link>
            <p className="text-xs text-[#55575f] leading-[1.7] mt-4 max-w-[280px] font-mono">
              Open workflows for local AI creation. Built by the community, for the
              community. No ads. No tracking.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="flex flex-col">
            <h4 className="font-[family-name:var(--font-syne)] font-[600] text-[0.72rem] tracking-[0.06em] uppercase text-[#8b8d97] mb-4">
              Platform
            </h4>
            <Link href="/workflows" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Workflows</Link>
            <Link href="/tutorials" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Learning Paths</Link>
            <Link href="/models" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Model Library</Link>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Showcase</Link>
          </div>

          {/* Links Col 2 */}
          <div className="flex flex-col">
            <h4 className="font-[family-name:var(--font-syne)] font-[600] text-[0.72rem] tracking-[0.06em] uppercase text-[#8b8d97] mb-4">
              Resources
            </h4>
            <Link href="/guides" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">ComfyUI Docs</Link>
            <Link href="/gpu-guide" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">GPU Compatibility</Link>
            <Link href="/guides/custom-nodes" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Custom Nodes</Link>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">API Reference</Link>
          </div>

          {/* Links Col 3 */}
          <div className="flex flex-col">
            <h4 className="font-[family-name:var(--font-syne)] font-[600] text-[0.72rem] tracking-[0.06em] uppercase text-[#8b8d97] mb-4">
              Community
            </h4>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Discord</Link>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">GitHub</Link>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Contribute</Link>
            <Link href="#" className="block text-[0.7rem] text-[#55575f] py-1 hover:text-[#00e5a0] transition-colors duration-200">Changelog</Link>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[#1a1e2e] flex flex-col md:flex-row justify-between items-center text-[0.62rem] text-[#55575f] gap-4">
          <span>© {new Date().getFullYear()} NeuralDrift. Open source under MIT.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-[#00e5a0] transition-colors duration-200">Privacy</Link>
            <span>·</span>
            <Link href="#" className="hover:text-[#00e5a0] transition-colors duration-200">Terms</Link>
            <span>·</span>
            <Link href="#" className="hover:text-[#00e5a0] transition-colors duration-200">RSS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
