import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";
import Background from "@/components/Background";
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains-mono",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "neuraldrift — Train. Build. Master AI.",
    template: "%s | neuraldrift",
  },
  description:
    "The hub for building, training, and mastering AI systems. LoRA creation, ComfyUI pipelines, datasets, and optimization — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} ${manrope.variable} scroll-smooth`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-[#0d1117] font-sans text-slate-50 antialiased selection:bg-accent/30">
        <Background />
        <Navbar />
        <main className="relative z-10 pt-[140px]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
