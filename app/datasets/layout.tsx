import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/datasets",
  "Datasets Hub — Training Data for Local AI | NeuralDrift",
  "Browse a live discovery interface for third-party training datasets. Dataset availability, licenses, and suitability must be verified with the source."
);

// This hub is a client-side, upstream-fed discovery interface, not a stable
// server-rendered directory. Keep it usable but out of the search index until
// curated primary content and provenance can be published on the page itself.
export const metadata: Metadata = { ...baseMetadata, robots: { index: false, follow: true } };

export default function DatasetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
