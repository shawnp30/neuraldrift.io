import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/gpu-guide",
  "GPU Guide — Cloud & Hardware for ComfyUI | NeuralDrift",
  "Compare GPU and cloud options for running ComfyUI workflows, with pricing context and capability notes."
);

export default function GpuGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
