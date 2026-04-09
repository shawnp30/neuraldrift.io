import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/hardware",
  "Hardware Hub — Can Your PC Run ComfyUI? | NeuralDrift",
  "GPU tiers, VRAM guidance, and practical advice for running ComfyUI workflows on local hardware."
);

export default function HardwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
