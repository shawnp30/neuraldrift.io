import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/optimizer/result",
  "Optimizer Results",
  "Saved optimizer recommendations for your GPU and workload goals."
);

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
};

export default function OptimizerResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
