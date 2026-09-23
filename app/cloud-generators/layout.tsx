import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/cloud-generators",
  "Cloud Generator Reference — NeuralDrift",
  "A legacy cloud-generator reference awaiting source review and current provider verification."
);

export const metadata: Metadata = { ...baseMetadata, robots: { index: false, follow: true } };

export default function CloudGeneratorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
