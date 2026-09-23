import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/models",
  "Models Hub — Local AI Model Discovery | NeuralDrift",
  "Browse a live discovery interface for third-party local AI models. Verify model availability, licenses, and compatibility with the original source."
);

// Results are loaded from a live third-party feed after the page loads. Until
// individual, server-rendered model records exist, this is a useful human
// discovery tool rather than a stable search landing page.
export const metadata: Metadata = { ...baseMetadata, robots: { index: false, follow: true } };

export default function ModelsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
