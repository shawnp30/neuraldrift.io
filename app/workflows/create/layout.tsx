import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/workflows/create",
  "Create Workflow — NeuralDrift",
  "Build or adapt a ComfyUI workflow with NeuralDrift tooling and export JSON you can run locally."
);

export default function WorkflowsCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
