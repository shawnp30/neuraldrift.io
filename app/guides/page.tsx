import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { getGuides } from "@/lib/guides";
import { TUTORIALS } from "@/lib/tutorials";

export const metadata = pageMeta(
  "/guides",
  "NeuralDrift Learning Hub — ComfyUI Guides & Video Tutorials",
  "Learn ComfyUI with practical written guides and step-by-step video tutorials for workflows, models, hardware, and troubleshooting.",
);

export default function GuidesPage() {
  const guides = getGuides();
  const featuredTutorials = TUTORIALS.slice(0, 4);

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <p className="nd-eyebrow">NEURALDRIFT LEARNING HUB</p>
          <h1>Make your next run easier.</h1>
          <p className="nd-lead">
            Learn ComfyUI with practical written guides and step-by-step video
            tutorials built around real workflows, hardware compatibility, and
            local AI.
          </p>
          <div className="nd-actions">
            <Link className="nd-button" href="/guides/installation">
              Start with installation
            </Link>
            <Link className="nd-button nd-secondary" href="/tutorials">
              Watch video tutorials
            </Link>
            <Link className="nd-text-link" href="/workflows">
              Find a workflow →
            </Link>
            <Link className="nd-text-link" href="/newsletter">
              Get NeuralDrift Weekly →
            </Link>
          </div>
        </header>

        <section className="nd-grid nd-section" aria-label="Learning paths">
          <article className="nd-card nd-card-body">
            <p className="nd-eyebrow">WRITTEN GUIDES</p>
            <h2>{guides.length} practical guides</h2>
            <p>
              Installation, model setup, hardware, workflow troubleshooting,
              and other hands-on ComfyUI references.
            </p>
            <Link className="nd-text-link" href="#written-guides">
              Browse written guides →
            </Link>
          </article>
          <article className="nd-card nd-card-body">
            <p className="nd-eyebrow">VIDEO TUTORIALS</p>
            <h2>{TUTORIALS.length} curated tutorials</h2>
            <p>
              Step-by-step video learning for beginners, FLUX, ControlNet,
              workflow architecture, and creative techniques.
            </p>
            <Link className="nd-text-link" href="/tutorials">
              View all video tutorials →
            </Link>
          </article>
        </section>

        <section className="nd-section" aria-labelledby="video-tutorials">
          <div className="nd-actions">
            <div>
              <p className="nd-eyebrow">VIDEO TUTORIALS</p>
              <h2 id="video-tutorials">Start learning by watching</h2>
            </div>
            <Link className="nd-text-link" href="/tutorials">
              View all video tutorials →
            </Link>
          </div>
          <div className="nd-grid">
            {featuredTutorials.map((tutorial) => (
              <article className="nd-card nd-card-body" key={tutorial.slug}>
                <p className="nd-eyebrow">{tutorial.category} · {tutorial.duration}</p>
                <h3>
                  <Link href={`/tutorials/${tutorial.slug}`}>{tutorial.title}</Link>
                </h3>
                <p>{tutorial.description}</p>
                <Link className="nd-text-link" href={`/tutorials/${tutorial.slug}`}>
                  Open tutorial →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="written-guides" className="nd-section" aria-labelledby="written-guides-title">
          <p className="nd-eyebrow">WRITTEN GUIDES</p>
          <h2 id="written-guides-title">Practical references for your next run</h2>
          <div className="nd-grid">
            {guides.map((guide) => (
              <article key={guide.slug} className="nd-card nd-card-body">
                <h3>
                  <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                </h3>
                <p>{guide.description}</p>
                <Link className="nd-text-link" href={`/guides/${guide.slug}`}>
                  Read guide →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
