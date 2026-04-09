import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/prompt-generator",
  "AI Prompt Studio — Image, Video & Audio Prompts | NeuralDrift",
  "Professional-grade prompt engineering for image, video, music, and lyrics. Optimized for ComfyUI and local generation."
);

export default function PromptGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
