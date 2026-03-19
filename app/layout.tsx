import type { Metadata } from "next";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains-mono",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "NeuralHub.ai — Train. Build. Master AI.",
    template: "%s | NeuralHub.ai",
  },
  description:
    "The hub for building, training, and mastering AI systems. LoRA creation, ComfyUI pipelines, datasets, and optimization — all in one place.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://neuralhub.ai"),
  openGraph: {
    type: "website",
    siteName: "NeuralHub.ai",
    images: [{ url: "/logo/neuralhub-og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  keywords: [
    "AI training",
    "LoRA",
    "ComfyUI",
    "Stable Diffusion",
    "FLUX",
    "LTX Video",
    "AI workflows",
    "model fine-tuning",
    "neural network",
    "GPU AI",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
