"use client";

import { useState } from "react";
import Link from "next/link";

export function GuideQuickActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  return (
    <div className="space-y-3">
      <Link
        href="/workflows"
        className="flex items-center gap-2 text-xs text-[#8888a0] hover:text-[#22d3ee] transition-colors"
      >
        <span className="text-[#22d3ee]">☇</span> Browse Workflows
      </Link>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-xs text-[#8888a0] hover:text-[#4ade80] transition-colors"
      >
        <span className="text-[#4ade80]">↑</span> {copied ? "Link copied!" : "Share Guide"}
      </button>
    </div>
  );
}
