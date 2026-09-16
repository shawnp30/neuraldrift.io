import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const baseMetadata = pageMeta(
  "/workflows/create",
  "Create Workflow — NeuralDrift",
  "Build or adapt a ComfyUI workflow with NeuralDrift tooling and export JSON you can run locally."
);

export const metadata: Metadata = {
  ...baseMetadata,
  robots: { index: false, follow: true },
};

export default function WorkflowsCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
