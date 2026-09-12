import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";
import { TUTORIALS, tutorialDurationIso } from "@/lib/tutorials";
import { RelatedContent } from "@/components/RelatedContent";
import { getRelatedGuides, getRelatedWorkflows } from "@/lib/relationships";

export function generateStaticParams() {
  return TUTORIALS.map((tutorial) => ({ slug: tutorial.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tutorial = TUTORIALS.find((item) => item.slug === params.slug);
  if (!tutorial) return {};
  return pageMeta(`/tutorials/${tutorial.slug}`, `${tutorial.title} — ComfyUI Tutorial`, tutorial.description);
}

export default function TutorialPage({ params }: { params: { slug: string } }) {
  const tutorial = TUTORIALS.find((item) => item.slug === params.slug);
  if (!tutorial) notFound();

  const related = CATALOG.filter((workflow) => {
    const text = `${workflow.title} ${workflow.description} ${workflow.model} ${workflow.tags.join(" ")}`;
    return tutorial.title.toLowerCase().split(" ").some((word) => word.length > 3 && text.toLowerCase().includes(word));
  }).slice(0, 3);
  const relatedGuides = getRelatedGuides(tutorial);
  const relatedWorkflows = getRelatedWorkflows(tutorial);
  const videoObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: tutorial.title,
    description: tutorial.description,
    thumbnailUrl: `https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`,
    ...(tutorialDurationIso(tutorial.duration) ? { duration: tutorialDurationIso(tutorial.duration) } : {}),
    embedUrl: `https://www.youtube.com/embed/${tutorial.videoId}`,
    isPartOf: { "@type": "WebSite", name: "NeuralDrift", url: "https://neuraldrift.io" },
  };

  return (
    <article className="nd-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObject) }} />
      <div className="nd-shell nd-page">
        <Link className="nd-text-link" href="/tutorials">← All tutorials</Link>
        <header className="nd-section">
          <p className="nd-eyebrow">CURATED EXTERNAL RESOURCE / {tutorial.category}</p>
          <h1>{tutorial.title}</h1>
          <p className="nd-lead">{tutorial.description}</p>
          <p className="nd-subtle">This video is hosted on YouTube and was not produced by NeuralDrift. Verify current software and model requirements with the creator.</p>
        </header>
        <div className="nd-detail-grid">
          <section>
            <div className="nd-video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${tutorial.videoId}?rel=0`}
                title={tutorial.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <section className="nd-section nd-prose">
              <h2>What you will learn</h2>
              <p>{tutorial.description}</p>
              <h2>Before you start</h2>
              <ul><li>Have ComfyUI installed using the official documentation.</li><li>Check the video description for the creator&apos;s current model and custom-node requirements.</li><li>Use the NeuralDrift compatibility pages to distinguish tested evidence from catalog estimates.</li></ul>
            </section>
          </section>
          <aside className="nd-card nd-card-body">
            <p className="nd-eyebrow">NEXT STEPS</p>
            <h2>Continue learning</h2>
            <Link className="nd-text-link" href="/guides">Read written guides →</Link>
            <Link className="nd-text-link" href="/workflows">Find a downloadable workflow →</Link>
            <Link className="nd-text-link" href="/hardware">Check your hardware →</Link>
            {related.length > 0 && <><h3 className="nd-section-title">Related workflows</h3>{related.map((workflow) => <Link className="nd-text-link" key={workflow.id} href={`/workflows/${workflow.id}`}>{workflow.title} →</Link>)}</>}
          </aside>
        </div>
        <RelatedContent workflows={relatedWorkflows} guides={relatedGuides} title="Try this in NeuralDrift" />
      </div>
    </article>
  );
}
