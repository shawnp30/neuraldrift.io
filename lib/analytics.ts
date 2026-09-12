export const ANALYTICS_EVENTS = {
  workflowView: "workflow_view",
  workflowDownload: "workflow_download",
  compatibilityCheck: "compatibility_check",
  compatibilityResult: "compatibility_result",
  tutorialView: "tutorial_view",
  tutorialPlay: "tutorial_play",
  guideView: "guide_view",
  relatedContentClick: "related_content_click",
  labEvidenceView: "lab_evidence_view",
  gpuSelectorChange: "gpu_selector_change",
  categoryFilter: "category_filter",
  searchUsed: "search_used",
  newsletterCtaView: "newsletter_cta_view",
  newsletterSignupAttempt: "newsletter_signup_attempt",
  newsletterSignup: "newsletter_signup",
  affiliateClick: "affiliate_hardware_click",
  cloudGpuCtaClick: "cloud_gpu_click",
  premiumPackInterest: "premium_pack_interest",
  sponsorLinkClick: "sponsor_link_click",
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
export type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    va?: (event: string, properties?: AnalyticsProperties) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined") return;
  window.va?.(event, properties);
  window.gtag?.("event", event, properties);
  window.dispatchEvent(new CustomEvent("neuraldrift:analytics", { detail: { event, properties } }));
}
