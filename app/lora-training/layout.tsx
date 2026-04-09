import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/lora-training",
  "LoRA Training — Guides & Resources | NeuralDrift",
  "Learn how to train LoRAs for Flux, SDXL, and more with practical dataset and tooling guidance."
);

export default function LoraTrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
