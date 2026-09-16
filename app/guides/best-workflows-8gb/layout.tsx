import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/guides/best-workflows-8gb",
  "Best ComfyUI Workflows for 8GB VRAM | NeuralDrift",
  "Curated ComfyUI workflows that fit 8GB GPUs, with practical model and settings notes."
);

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
};

export default function BestWorkflows8gbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
