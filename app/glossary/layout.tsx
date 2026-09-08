import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/glossary",
  "Glossary — NeuralDrift",
  "Definitions for ComfyUI, diffusion, and local AI terms used across NeuralDrift guides."
);

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
