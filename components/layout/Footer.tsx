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
    <footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-border px-10 py-12">
      <Logo />
      <ul className="flex gap-8">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs tracking-widest text-muted">
        © {new Date().getFullYear()} neuraldrift.io.ai
      </p>
    </footer>
  );
}
