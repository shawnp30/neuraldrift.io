import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/train",
  "Training Workspace — NeuralDrift",
  "A local training workspace that requires configuration and evidence review before it can be promoted as public search content."
);

export const metadata: Metadata = { ...baseMetadata, robots: { index: false, follow: true } };

export default function TrainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
