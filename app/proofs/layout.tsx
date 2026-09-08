import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/proofs",
  "Community Proof Gallery — NeuralDrift",
  "See verified outputs and prompts from NeuralDrift workflows shared by the community."
);

export default function ProofsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
