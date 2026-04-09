import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/workflows",
  "ComfyUI Workflows — Ready-to-Run JSON Pipelines | NeuralDrift",
  "Browse curated ComfyUI workflows for image, video, and enhancement. Filter by VRAM, difficulty, and category."
);

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
