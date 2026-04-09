import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/guides",
  "ComfyUI Guides — Technical Docs & Tutorials | NeuralDrift",
  "In-depth ComfyUI guides: setup, custom nodes, performance, and troubleshooting for local AI generation."
);

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
