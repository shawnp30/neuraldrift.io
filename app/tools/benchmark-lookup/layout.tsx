import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/tools/benchmark-lookup",
  "GPU Benchmark Lookup — NeuralDrift",
  "Look up inference-oriented GPU benchmarks to sanity-check ComfyUI and local model performance."
);

export default function BenchmarkLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
