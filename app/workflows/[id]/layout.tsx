import type { Metadata } from "next";
import { WORKFLOWS } from "@/lib/workflowsData";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const workflow = WORKFLOWS.find((w) => w.id === params.id);
  const path = `/workflows/${params.id}`;
  const url = `${SITE_URL}${path}`;

  if (!workflow) {
    return {
      title: "Workflow Not Found | NeuralDrift",
      description: "This workflow ID is not in the NeuralDrift index.",
      robots: { index: false, follow: true },
      alternates: { canonical: url },
    };
  }

  return {
    title: `${workflow.title} | NeuralDrift`,
    description: workflow.description,
    alternates: { canonical: url },
    openGraph: {
      title: workflow.title,
      description: workflow.description,
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
      description: workflow.description,
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
