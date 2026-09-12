"use client";

import { getActiveOffer } from "@/lib/monetization";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function CloudGpuFallback() {
  const offer = getActiveOffer("cloud_gpu");
  if (!offer) return null;

  return (
    <aside className="nd-card nd-card-body" aria-label="Cloud GPU option">
      <p className="nd-eyebrow">OPTIONAL CLOUD PATH</p>
      <h2>Need more VRAM?</h2>
      <p>Run this workflow on cloud hardware when your local system is blocked or insufficient.</p>
      <a
        className="nd-button nd-secondary"
        href={offer.destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(ANALYTICS_EVENTS.cloudGpuCtaClick, { offerId: offer.id, provider: offer.merchant })}
      >
        Run on {offer.merchant} →
      </a>
      <p className="nd-subtle">{offer.disclosure}</p>
    </aside>
  );
}
