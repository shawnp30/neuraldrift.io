import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/proofs/upload",
  "Upload Proof — NeuralDrift",
  "Submit an output and prompt to the NeuralDrift proof gallery."
);

export default function ProofsUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
