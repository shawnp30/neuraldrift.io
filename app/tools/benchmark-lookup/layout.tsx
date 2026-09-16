import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/tools/benchmark-lookup",
  "GPU Benchmark Lookup — NeuralDrift",
  "Look up inference-oriented GPU benchmarks to sanity-check ComfyUI and local model performance."
);

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
};

export default function BenchmarkLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
