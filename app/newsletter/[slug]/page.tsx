import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { NEWSLETTER_ISSUES, getNewsletterIssueBySlug, getNewsletterIssues, type NewsletterSectionStatus } from "@/lib/newsletterIssues";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

interface Props {
  params: { slug: string };
}

const STATUS_STYLES: Record<NewsletterSectionStatus, string> = {
  tested: "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]",
  watching: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]",
  upstream: "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#22d3ee]",
};

export function generateStaticParams() {
  return NEWSLETTER_ISSUES.map((issue) => ({ slug: issue.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const issue = getNewsletterIssueBySlug(params.slug);
  if (!issue) {
    return {
      title: "Issue Not Found | NeuralDrift Weekly",
      robots: { index: false, follow: true },
    };
  }
  const base = pageMeta(`/newsletter/${issue.slug}`, `${issue.title} | NeuralDrift Weekly`, issue.description);
  return { ...base, openGraph: { ...base.openGraph, type: "article" } };
}

export default function NewsletterIssuePage({ params }: Props) {
  const issue = getNewsletterIssueBySlug(params.slug);
  if (!issue) notFound();

  const issues = getNewsletterIssues();
  const currentIndex = issues.findIndex((i) => i.slug === issue.slug);
  const olderIssue = issues[currentIndex + 1];
  const newerIssue = currentIndex > 0 ? issues[currentIndex - 1] : undefined;

  return (
    <div className="bg-transparent min-h-screen text-[#e8e8f0] selection:bg-transparent/30 selection:text-white">
      <main className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-[720px] mx-auto w-full">
          <Link href="/newsletter" className="text-sm text-[#8888a0] hover:text-[#22d3ee] transition-colors">
            ← NeuralDrift Weekly
          </Link>

          <header className="mt-8 mb-16">
            <p className="font-mono text-[10px] text-[#7c6af7] tracking-widest uppercase mb-4">
              ISSUE #{issue.issueNumber} · {issue.publishedAt}
            </p>
            <h1 className="font-syne text-4xl md:text-5xl font-black text-[#e8e8f0] mb-6 tracking-tight leading-[1.1]">
              {issue.title}
            </h1>
            <p className="text-xl text-[#8888a0] leading-relaxed">{issue.description}</p>
          </header>

          <article>
            {issue.sections.map((section) => (
              <section key={section.heading} className="mb-14">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="font-syne text-2xl md:text-3xl font-bold text-[#e8e8f0] tracking-tight">
                    {section.heading}
                  </h2>
                  {section.status && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full border font-mono text-[10px] tracking-widest uppercase ${STATUS_STYLES[section.status]}`}
                    >
                      {section.statusLabel || section.status}
                    </span>
                  )}
                </div>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-[18px] leading-[1.8] text-[#e8e8f0]/90 mb-5 font-sans antialiased">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>

          {issue.relatedLinks.length > 0 && (
            <section className="mt-4 pt-12 border-t border-[#2a2a30]">
              <p className="font-mono text-[10px] text-[#7c6af7] tracking-widest uppercase mb-4">GO DEEPER</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issue.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block p-5 rounded-2xl border border-[#2a2a30] bg-[#111113] hover:border-[#7c6af7]/40 transition-all text-[#e8e8f0] font-semibold"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
              {issue.kitUrl && (
                <a
                  href={issue.kitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-[#8888a0] hover:text-[#22d3ee] transition-colors"
                >
                  View the original emailed issue ↗
                </a>
              )}
            </section>
          )}

          <div className="mt-16">
            <NewsletterSignup source="newsletter" variant="panel" />
          </div>

          <nav className="mt-16 pt-12 border-t border-[#2a2a30] flex flex-col md:flex-row justify-between gap-6">
            {olderIssue ? (
              <Link href={`/newsletter/${olderIssue.slug}`} className="flex-1 p-6 rounded-2xl border border-[#2a2a30] bg-[#111113] hover:border-[#7c6af7]/40 transition-all group">
                <span className="block font-mono text-[10px] text-[#8888a0] uppercase tracking-widest mb-2 group-hover:text-[#7c6af7] transition-colors">← Older issue</span>
                <span className="block text-lg font-bold text-[#e8e8f0] line-clamp-1">{olderIssue.title}</span>
              </Link>
            ) : <div className="flex-1" />}
            {newerIssue ? (
              <Link href={`/newsletter/${newerIssue.slug}`} className="flex-1 p-6 rounded-2xl border border-[#2a2a30] bg-[#111113] hover:border-[#4ade80]/40 transition-all group text-right">
                <span className="block font-mono text-[10px] text-[#8888a0] uppercase tracking-widest mb-2 group-hover:text-[#4ade80] transition-colors">Newer issue →</span>
                <span className="block text-lg font-bold text-[#e8e8f0] line-clamp-1">{newerIssue.title}</span>
              </Link>
            ) : <div className="flex-1" />}
          </nav>
        </div>
      </main>
    </div>
  );
}
