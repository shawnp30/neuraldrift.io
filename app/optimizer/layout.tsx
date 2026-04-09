import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/optimizer",
  "Hardware Optimizer — NeuralDrift",
  "Tune ComfyUI and local AI for your GPU: goals, bottlenecks, and practical launch settings."
);

export default function OptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
