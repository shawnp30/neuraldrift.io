import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/optimizer/fix-my-pc",
  "Fix My PC — ComfyUI Performance Help | NeuralDrift",
  "Practical steps to stabilize ComfyUI on Windows: drivers, memory, and workflow settings."
);

export default function OptimizerFixMyPcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
