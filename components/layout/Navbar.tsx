"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/shared/Logo";

const NAV_LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/loras", label: "LoRA Library" },
  { href: "/workflows", label: "Pipelines" },
  { href: "/datasets", label: "Datasets" },
  { href: "/tools", label: "Tools" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-16 transition-all duration-300 ${scrolled ? "bg-bg/90 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
      <Logo />
      <ul className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-mono text-xs text-muted hover:text-accent tracking-widest transition-colors uppercase">
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/dashboard" className="bg-accent text-black px-5 py-2 rounded text-sm font-semibold hover:opacity-85 transition-opacity">
            Get Started
          </Link>
        </li>
      </ul>
    </nav>
  );
}
