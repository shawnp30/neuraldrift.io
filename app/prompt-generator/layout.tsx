import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Architect | Master Prompt Studio | NeuralDrift",
  description: "Professional-grade prompt engineering for Image, Video, Music, and Lyrics. Optimized for local ComfyUI workflows and high-fidelity generative media.",
  keywords: ["AI Prompt Generator", "ComfyUI Prompts", "Stable Diffusion Prompts", "Video Generation Prompts", "Music AI Prompts", "Prompt Engineering"],
};

export default function PromptGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
