import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/Navbar";
import "@/styles/globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} ${manrope.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased bg-[#030712] text-slate-50 min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">

        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf815_1px,transparent_1px),linear-gradient(to_bottom,#818cf815_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] mix-blend-screen" />
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[130px] mix-blend-screen" />
          <div className="absolute top-[40%] right-[-10%] w-[30vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[150px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[30vw] rounded-full bg-violet-600/10 blur-[140px] mix-blend-screen" />
        </div>

        <Navbar />

        <main className="relative z-10 pt-[140px]">
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  );
}