import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { getNewsletterIssues } from "@/lib/newsletterIssues";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

export const metadata = pageMeta(
  "/newsletter",
  "NeuralDrift Weekly — Local AI & ComfyUI Newsletter",
  "Weekly execution-focused updates on ComfyUI workflows, GPU compatibility, local AI models, video, audio, and practical creator tools."
);

const SECTION_LINKS = [
  { label: "Workflows", href: "/workflows", description: "The full ComfyUI workflow catalog, filterable by GPU and VRAM." },
  { label: "Compatibility", href: "/compatibility", description: "How NeuralDrift decides TESTED vs. ESTIMATED vs. UNKNOWN." },
  { label: "Guides", href: "/guides", description: "Installation, model folders, custom nodes, and troubleshooting." },
  { label: "Tutorials", href: "/tutorials", description: "Step-by-step video tutorials for ComfyUI and local generation." },
  { label: "Lab", href: "/lab", description: "The transparent index of recorded local execution evidence." },
];

export default function NewsletterPage() {
  const issues = getNewsletterIssues();
  const latest = issues[0];

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <p className="nd-eyebrow">NEURALDRIFT WEEKLY</p>
          <h1>Execution-tested, not upstream-repeated.</h1>
          <p className="nd-lead">
            Execution-tested workflows, hardware compatibility findings, ComfyUI changes,
            and practical local-AI guidance, delivered weekly. Every issue draws directly
            from what NeuralDrift has actually run — not from what a vendor claims.
          </p>
          <div className="nd-actions">
            {latest && (
              <Link className="nd-button" href={`/newsletter/${latest.slug}`}>
                Read the latest issue →
              </Link>
            )}
            <Link className="nd-text-link" href="/lab">See the execution evidence →</Link>
          </div>
        </header>

        <section className="nd-grid nd-section">
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">CADENCE</p>
            <h2>Weekly</h2>
            <p>One issue a week. No daily filler, no engagement-bait re-sends.</p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">STANDARD</p>
            <h2>Tested vs. watching</h2>
            <p>
              If we didn&apos;t run it, we don&apos;t call it execution-tested. Every issue is
              explicit about what NeuralDrift has verified locally versus what&apos;s still
              upstream news or a project we&apos;re watching.
            </p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">FORMAT</p>
            <h2>Practical, not promotional</h2>
            <p>Workflow changes, compatibility findings, and setup guidance you can act on the same day.</p>
          </div>
        </section>

        <section className="nd-section">
          <NewsletterSignup source="newsletter" />
        </section>

        <section className="nd-section" aria-labelledby="latest-issue">
          <div className="nd-actions">
            <div>
              <p className="nd-eyebrow">{issues.length > 1 ? "LATEST ISSUE" : "ISSUE ARCHIVE"}</p>
              <h2 id="latest-issue">{issues.length > 1 ? "Read the latest issue" : "The first issue"}</h2>
            </div>
          </div>
          {issues.length ? (
            <div className="nd-grid">
              {issues.map((issue) => (
                <article className="nd-card nd-card-body" key={issue.slug}>
                  <p className="nd-eyebrow">ISSUE #{issue.issueNumber} · {issue.publishedAt}</p>
                  <h3>
                    <Link href={`/newsletter/${issue.slug}`}>{issue.title}</Link>
                  </h3>
                  <p>{issue.description}</p>
                  <Link className="nd-text-link" href={`/newsletter/${issue.slug}`}>
                    Read issue →
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="nd-subtle">The first issue is being prepared. Check back soon.</p>
          )}
        </section>

        <section className="nd-section" aria-labelledby="explore-neuraldrift">
          <p className="nd-eyebrow">EXPLORE NEURALDRIFT</p>
          <h2 id="explore-neuraldrift">Where this newsletter&apos;s material actually lives</h2>
          <div className="nd-grid">
            {SECTION_LINKS.map((section) => (
              <article className="nd-card nd-card-body" key={section.href}>
                <h3>
                  <Link href={section.href}>{section.label}</Link>
                </h3>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
