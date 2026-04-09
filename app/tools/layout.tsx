import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools",
  "AI Builder Tools — VRAM, Captions & Benchmarks | NeuralDrift",
  "Free utilities for local AI: VRAM calculator, dataset captioning, and GPU benchmark lookup."
);

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
