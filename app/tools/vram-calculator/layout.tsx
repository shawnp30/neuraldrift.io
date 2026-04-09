import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/vram-calculator",
  "VRAM Calculator — Can My GPU Run It? | NeuralDrift",
  "Free tool to check if your GPU can run Flux, SDXL, LTX Video, ACE-Step and other AI models. Instant results."
);

export default function VRAMCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
