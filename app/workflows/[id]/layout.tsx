import type { Metadata } from "next";
import { CATALOG, WORKFLOW_ASSETS } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const workflow = CATALOG.find((w) => w.id === params.id);
  const path = `/workflows/${params.id}`;
  const url = `${SITE_URL}${path}`;

  if (!workflow) {
    return {
      title: "Workflow Not Found",
      description: "This workflow ID is not in the NeuralDrift index.",
      robots: { index: false, follow: true },
      alternates: { canonical: url },
    };
  }

  // Name the required model files and their folders: searches for a model
  // filename land on these pages, and the snippet should answer "where does it go".
  const models = WORKFLOW_ASSETS[workflow.id]?.models ?? [];
  const description = models.length
    ? `${workflow.description} Models: ${models.map((m) => `${m.file} → ${m.dir.replace(/^ComfyUI\//, "")}`).join(", ")}.`
    : workflow.description;

  return {
    title: workflow.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: workflow.title,
      description,
      url,
      siteName: "NeuralDrift",
      type: "article",
      images: [
        {
          url: workflow.imageUrl.startsWith("http")
            ? workflow.imageUrl
            : `${SITE_URL}${workflow.imageUrl.startsWith("/") ? workflow.imageUrl : `/${workflow.imageUrl}`}`,
          width: 1200,
          height: 630,
          alt: workflow.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: workflow.title,
      description,
      images: [
        workflow.imageUrl.startsWith("http")
          ? workflow.imageUrl
          : `${SITE_URL}${workflow.imageUrl.startsWith("/") ? workflow.imageUrl : `/${workflow.imageUrl}`}`,
      ],
    },
  };
}

export default function WorkflowDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

