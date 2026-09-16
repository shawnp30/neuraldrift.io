// Small helper for links that travel FROM a NeuralDrift Weekly email back TO the site.
// Do not use this for normal on-site navigation — only for URLs embedded in an
// actual sent issue (Kit broadcast) or previewed as if they were.
import { SITE_URL } from "@/lib/seo";

const UTM_SOURCE = "neuraldrift_weekly";
const UTM_MEDIUM = "email";

export function newsletterCampaign(issueNumber: number): string {
  return `issue_${String(issueNumber).padStart(3, "0")}`;
}

export interface NewsletterLinkOptions {
  issueNumber: number;
  content?: string;
}

export function buildNewsletterUrl(path: string, options: NewsletterLinkOptions): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", UTM_MEDIUM);
  url.searchParams.set("utm_campaign", newsletterCampaign(options.issueNumber));
  if (options.content) url.searchParams.set("utm_content", options.content);
  return url.toString();
}
