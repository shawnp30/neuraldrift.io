import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tutorials/stable-diffusion-basics",
  "Stable Diffusion Basics — ComfyUI Tutorial",
  "A NeuralDrift introduction to Stable Diffusion concepts, core ComfyUI workflow terms, and the next practical learning steps."
);

export default function StableDiffusionBasicsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
