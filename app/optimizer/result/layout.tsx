import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/optimizer/result",
  "Optimizer Results — NeuralDrift",
  "Saved optimizer recommendations for your GPU and workload goals."
);

export default function OptimizerResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
