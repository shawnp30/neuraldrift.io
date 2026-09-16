import { buildNewsletterUrl } from "@/lib/newsletter/utm";

export type NewsletterSectionStatus = "tested" | "watching" | "upstream";

export interface NewsletterSection {
  heading: string;
  status?: NewsletterSectionStatus;
  statusLabel?: string;
  body: string[];
}

export interface NewsletterRelatedLink {
  label: string;
  href: string;
}

export interface NewsletterIssue {
  slug: string;
  issueNumber: number;
  title: string;
  subject: string;
  description: string;
  publishedAt: string;
  sections: NewsletterSection[];
  relatedLinks: NewsletterRelatedLink[];
  kitUrl?: string;
}

const ISSUE_001: NewsletterIssue = {
  slug: "comfyui-035-local-video-audio-tools",
  issueNumber: 1,
  title: "ComfyUI 0.35 Lands — Plus New Local Video & Audio Tools",
  subject: "ComfyUI 0.35 Lands - Plus New Local Video & Audio Tools",
  description:
    "ComfyUI 0.35 shipped upstream, NeuralDrift has current RTX 5080 execution records for AnimateDiff and ACE-Step audio workflows, and three local video/audio projects are worth watching.",
  publishedAt: "2026-09-15",
  sections: [
    {
      heading: "ComfyUI 0.35 landed upstream",
      status: "upstream",
      statusLabel: "Upstream release — not independently execution-tested",
      body: [
        "ComfyUI 0.35 shipped this week. As with any point release, node behavior and default settings can shift under existing graphs, so treat this as upstream release news rather than a NeuralDrift-verified compatibility statement.",
        "We haven't re-run every catalog workflow against 0.35 yet. The execution records linked below reflect the ComfyUI and PyTorch versions actually used at test time — check the \"Testing & source information\" section on any workflow page before assuming a new release changes nothing.",
      ],
    },
    {
      heading: "Local video: AnimateDiff stays current on RTX 5080",
      status: "tested",
      statusLabel: "NeuralDrift-tested — RTX 5080, current evidence",
      body: [
        "Five AnimateDiff graphs in the catalog — ambient motion, loop-oriented, landscape drift, product rotation, and slow zoom — have current, successful execution records on an RTX 5080. These are the workflows behind this issue's \"local video tools\" claim; nothing here is a catalog estimate.",
        "Each record lists the settings and environment used for its own run. Use those records to assess fit for your hardware rather than treating the five graphs as a VRAM ranking.",
      ],
    },
    {
      heading: "Local audio: ACE-Step 1.5 turbo",
      status: "tested",
      statusLabel: "NeuralDrift-tested — RTX 5080, current evidence",
      body: [
        "The ACE-Step 1.5 turbo checkpoint graph — generating audio from musical tags and lyrics — also has a current, successful RTX 5080 execution record in the catalog. Pair it with the ACE-Step 1.5 guide in Guides if you're setting it up for the first time.",
      ],
    },
    {
      heading: "Being watched: SolarWM, AuK, FireRedAudio",
      status: "watching",
      statusLabel: "Community reports — not run or verified by NeuralDrift",
      body: [
        "Three more local video/audio projects came up this week in community discussion: SolarWM (local video/world-model tooling), AuK, and FireRedAudio (an open local text-to-speech/audio project). None of these have been installed, run, or execution-tested by NeuralDrift yet.",
        "We're listing them because they're relevant to this issue's theme, not because we're vouching for their claims. If we run them locally and get a real result — success or failure — it'll show up in the Lab with an execution record, the same as everything else on this site.",
      ],
    },
  ],
  relatedLinks: [
    { label: "Browse AnimateDiff workflows", href: "/workflows?category=video" },
    { label: "ACE-Step 1.5 setup guide", href: "/guides/ace-step-1-5-comfyui" },
    { label: "NeuralDrift Lab — execution evidence", href: "/lab" },
    { label: "GPU compatibility methodology", href: "/compatibility" },
  ],
};

export const NEWSLETTER_ISSUES: NewsletterIssue[] = [ISSUE_001];

export function getNewsletterIssues(): NewsletterIssue[] {
  return [...NEWSLETTER_ISSUES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getLatestNewsletterIssue(): NewsletterIssue | undefined {
  return getNewsletterIssues()[0];
}

export function getNewsletterIssueBySlug(slug: string): NewsletterIssue | undefined {
  return NEWSLETTER_ISSUES.find((issue) => issue.slug === slug);
}

export function newsletterIssueReadOnlineUrl(issue: NewsletterIssue): string {
  return buildNewsletterUrl(`/newsletter/${issue.slug}`, { issueNumber: issue.issueNumber, content: "read_online" });
}
