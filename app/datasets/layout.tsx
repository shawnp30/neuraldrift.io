import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/datasets",
  "Datasets Hub — Training Data for Local AI | NeuralDrift",
  "Explore community datasets for LoRA training and fine-tuning with ComfyUI and open models."
);

export default function DatasetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
