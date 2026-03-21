"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/shared/Logo";

const NAV_LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/loras", label: "LoRA Library" },
  { href: "/workflows", label: "Workflows" },
  { href: "/datasets", label: "Datasets" },
  { href: "/optimizer", label: "Optimizer" },
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
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-10 transition-all duration-300 ${scrolled ? "border-b border-border bg-bg/90 backdrop-blur-xl" : "bg-transparent"}`}
    >
      <Logo />
      <ul className="flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/dashboard"
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-85"
          >
            Get Started
          </Link>
        </li>
      </ul>
    </nav>
  );
}
