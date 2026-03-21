"use client";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/workflows", label: "Workflows" },
  { href: "/loras", label: "LoRAs" },
  { href: "/datasets", label: "Datasets" },
  { href: "/optimizer", label: "Optimizer" },
  { href: "/tools", label: "Tools" },
  { href: "https://computeatlas.ai", label: "ComputeAtlas" },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-10 max-w-7xl mx-auto flex items-center justify-between">
      <Logo />
      <ul className="flex gap-8">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-mono text-xs text-muted hover:text-accent tracking-widest transition-colors uppercase">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs text-muted tracking-widest">© {new Date().getFullYear()} NeuralHub.ai</p>
    </footer>
  );
}
