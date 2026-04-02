import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VRAM Calculator — Can My GPU Run It? | NeuralDrift",
  description: "Free tool to check if your GPU can run Flux, SDXL, LTX Video, ACE-Step and other AI models. Instant results.",
};

export default function VRAMCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
