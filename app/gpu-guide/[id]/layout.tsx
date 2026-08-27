import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const GPU_TITLES: Record<string, { title: string; description: string }> = {
  runpod: {
    title: "RunPod GPU Guide for ComfyUI",
    description:
      "RunPod on-demand GPUs for ComfyUI: pricing snapshot, what runs well, and when cloud pods make sense.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const path = `/gpu-guide/${params.id}`;
  const url = `${SITE_URL}${path}`;
  const meta = GPU_TITLES[params.id];

  if (!meta) {
    return {
      title: "GPU Guide",
      description: "GPU provider overview for ComfyUI builders.",
      robots: { index: false, follow: true },
      alternates: { canonical: url },
    };
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: "NeuralDrift",
      type: "article",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/opengraph-image"],
    },
  };
}

export default function GpuGuideDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
