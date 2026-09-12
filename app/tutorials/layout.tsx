import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tutorials",
  "ComfyUI Video Tutorials — Curated Learning Resources",
  "Curated external ComfyUI tutorials with practical summaries, prerequisites, and links to NeuralDrift workflows and guides."
);

export default function TutorialsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
