import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/caption-generator",
  "Dataset Caption Generator — NeuralDrift",
  "Auto-caption training images for LoRA and fine-tunes using vision captioning models."
);

export default function CaptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
