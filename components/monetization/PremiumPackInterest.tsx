"use client";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function PremiumPackInterest({ packName }: { packName: string }) {
  return (
    <button
      type="button"
      className="nd-button nd-secondary"
      onClick={() => trackEvent(ANALYTICS_EVENTS.premiumPackInterest, { product: packName })}
    >
      Notify me when packs launch
    </button>
  );
}
