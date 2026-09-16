import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/lora-training",
  "LoRA Training — Guides & Resources | NeuralDrift",
  "Learn how to train LoRAs for Flux, SDXL, and more with practical dataset and tooling guidance."
);

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
};

export default function LoraTrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
