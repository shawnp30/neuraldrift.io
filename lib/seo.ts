import type { Metadata } from "next";

export const SITE_URL = "https://neuraldrift.io";

/**
 * Consistent title, description, canonical, and social URLs for App Router pages.
 * Root layout sets metadataBase; we still use absolute URLs for canonical / openGraph.url
 * so Search Console and scrapers see a single explicit URL.
 */
export function pageMeta(path: string, title: string, description: string): Metadata {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_URL}${normalized}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "NeuralDrift",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}
