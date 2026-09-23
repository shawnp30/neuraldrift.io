import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tutorials/monetizing-comfyui",
  "Monetizing ComfyUI — Practical Tutorial",
  "A NeuralDrift guide to evaluating practical ComfyUI service workflows, delivery requirements, and responsible commercial-use considerations."
);

export default function MonetizingComfyUILayout({ children }: { children: React.ReactNode }) {
  return children;
}
