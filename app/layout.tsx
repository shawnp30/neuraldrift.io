import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono, Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";
import { NeuralBackground } from "@/components/shared/NeuralBackground";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-mono",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-crimson-pro",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://neuraldrift.io"),
  title: {
    default: "NeuralDrift — ComfyUI Workflows, Guides, and Tools",
    template: "%s | NeuralDrift",
  },
  description:
    "High-performance ComfyUI workflows, technical AI guides, and hardware optimization tools for local image and video generation. Built for builders.",
  alternates: {
    canonical: "https://neuraldrift.io/",
  },
  openGraph: {
    title: "NeuralDrift — Master Local AI Creation",
    description:
      "ComfyUI workflows, guides, and tools for high-fidelity AI generation.",
    url: "https://neuraldrift.io/",
    siteName: "NeuralDrift",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NeuralDrift — ComfyUI Workflows, Guides & Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuralDrift — ComfyUI Workflows, Guides & Tools",
    description:
      "Free ComfyUI workflows, AI model guides, VRAM calculator and GPU tools for image and video generation",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NeuralDrift",
  url: "https://neuraldrift.io",
  logo: "https://neuraldrift.io/favicon.png",
  sameAs: ["https://github.com/shawnp30/neuraldrift.io"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NeuralDrift",
  url: "https://neuraldrift.io",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://neuraldrift.io/guides?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${ibmPlexMono.variable} ${crimsonPro.variable} scroll-smooth`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-[#06080d] font-sans text-slate-50 antialiased selection:bg-accent/30">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NeuralBackground />
        <Navbar />
        <main className="relative z-[20]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
