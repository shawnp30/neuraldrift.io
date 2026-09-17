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

const ISSUE_002: NewsletterIssue = {
  slug: "fasth3-8-step-v2-rtx-5080-status-unverified",
  issueNumber: 2,
  title: "FastH3 8-Step V2 Is Real — Its RTX 5080 Status Is Unverified",
  subject: "FastH3 8-Step V2 Is Real - Its RTX 5080 Status Is Unverified",
  description:
    "We reviewed current official FastVideo and ComfyUI documentation for FastH3 8-Step V2. NeuralDrift has not tested it on the RTX 5080 Lab machine.",
  publishedAt: "2026-09-16",
  sections: [
    {
      heading: "FastH3 8-Step V2: documented, not tested",
      status: "upstream",
      statusLabel: "Upstream release — requirements documented, not execution-tested",
      body: [
          "FastVideo (Hao AI Lab @ UCSD) released FastH3 8-Step V2, an 8-transformer-forward MiniMax-H3 distillation using data-free DMD2 and VSA-H3 sparse attention. We reviewed the official FastVideo model card and the current official ComfyUI documentation in detail.",
          "The original FastVideo repository reports roughly 35B BF16 parameters, which gives a roughly 70GB weight-size calculation. That calculation is not an official minimum-VRAM requirement or a NeuralDrift measurement. Current official ComfyUI documentation provides native FastH3 templates and a separately named pruned INT8 diffusion model, but does not state RTX 5080 compatibility or required VRAM. NeuralDrift has not attempted a run, so its local fit, generation time, and A/V sync remain unverified. Full sourcing and the GPU compatibility matrix are on the Lab writeup below.",
      ],
    },
    {
        heading: "What the current docs say compared with base H3",
      status: "upstream",
      statusLabel: "Upstream claim — verified against the official model card",
      body: [
          "Current official ComfyUI documentation lists FastH3 text-to-video and image-to-video templates with optional first/last-frame conditioning; it says Ref2VA was not distilled. Base MiniMax-H3 also supports reference-to-video and has its own native ComfyUI templates. These are upstream capability statements, not NeuralDrift execution results.",
      ],
    },
  ],
  relatedLinks: [
    { label: "FastH3 8-Step V2 — full Lab writeup", href: "/lab/fasth3-8-step-v2" },
    { label: "Setup guide: running FastH3 today", href: "/guides/fasth3-8-step-v2-comfyui" },
    { label: "GPU compatibility methodology", href: "/compatibility" },
    { label: "Cloud GPU options", href: "/gpu-guide" },
  ],
};

export const NEWSLETTER_ISSUES: NewsletterIssue[] = [ISSUE_001, ISSUE_002];

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
