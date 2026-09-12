import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono, Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";


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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
        
        <a href="#main-content" className="skip-link">Skip to content</a><Navbar />
        <main id="main-content" tabIndex={-1} className="relative z-[20]">{children}</main>
        <Footer />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="neuraldrift-ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

