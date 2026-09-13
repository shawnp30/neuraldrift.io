// Provider-neutral newsletter subscription logic. Kept framework-agnostic (no next/server
// imports) so it can be unit tested directly and swapped to a different ESP later.

export const NEWSLETTER_SOURCES = [
  "homepage",
  "guides",
  "tutorials",
  "workflow_detail",
  "lab",
  "unknown",
] as const;

export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

export function isValidSource(value: unknown): value is NewsletterSource {
  return typeof value === "string" && (NEWSLETTER_SOURCES as readonly string[]).includes(value);
}

const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= EMAIL_MAX_LENGTH && EMAIL_REGEX.test(value);
}

export interface BeehiivConfig {
  apiKey: string;
  publicationId: string;
  listId?: string;
}

export function getBeehiivConfig(env: Record<string, string | undefined> = process.env): BeehiivConfig | null {
  const apiKey = env.BEEHIIV_API_KEY;
  const publicationId = env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) return null;
  return { apiKey, publicationId, listId: env.BEEHIIV_NEWSLETTER_LIST_ID || undefined };
}

export type NewsletterSubscribeOutcome = "subscribed" | "invalid" | "rate_limited" | "provider_error";

export interface SubscribeInput {
  email: string;
  source: NewsletterSource;
  referringSite?: string;
}

export async function subscribeToBeehiiv(
  input: SubscribeInput,
  config: BeehiivConfig,
  fetchImpl: typeof fetch = fetch
): Promise<NewsletterSubscribeOutcome> {
  const body: Record<string, unknown> = {
    email: input.email,
    reactivate_existing: false,
    send_welcome_email: false,
    utm_source: "neuraldrift",
    utm_medium: "website",
    utm_campaign: "neuraldrift_weekly",
  };
  if (input.referringSite) body.referring_site = input.referringSite;
  if (config.listId) body.newsletter_list_ids = [config.listId];

  let response: Response;
  try {
    response = await fetchImpl(`https://api.beehiiv.com/v2/publications/${config.publicationId}/subscriptions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return "provider_error";
  }

  if (response.ok) return "subscribed";
  if (response.status === 400 || response.status === 422) return "invalid";
  if (response.status === 429) return "rate_limited";
  return "provider_error"; // 401, 404, 5xx, and anything else unexpected
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

// In-memory only: resets on cold start and is per server instance, but that's enough
// to blunt a basic retry loop without adding an external store.
export function createFixedWindowRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, RateLimitState>();
  return {
    check(key: string): boolean {
      const now = Date.now();
      const state = hits.get(key);
      if (!state || now >= state.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (state.count >= limit) return false;
      state.count += 1;
      return true;
    },
  };
}

export interface SubscribeResponse {
  status: number;
  body: { ok: boolean; error?: "invalid_request" | "rate_limited" | "unavailable" | "provider_error" };
}

interface HeaderReader {
  get(name: string): string | null;
}

const MAX_BODY_BYTES = 2000;
const subscribeRateLimiter = createFixedWindowRateLimiter(5, 60_000);

// Framework-agnostic core of POST /api/newsletter/subscribe. Kept free of any next/server
// import so it can be exercised directly in tests without pulling in the Next.js runtime.
export async function handleNewsletterSubscribe(raw: string, headers: HeaderReader): Promise<SubscribeResponse> {
  if (raw.length > MAX_BODY_BYTES) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  const { email, source, company } = parsed as Record<string, unknown>;

  // Honeypot: only bots fill a hidden field, so a "success" response with no
  // real subscribe call keeps them from learning they were caught.
  if (typeof company === "string" && company.trim().length > 0) {
    return { status: 200, body: { ok: true } };
  }

  if (!isValidEmail(email)) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  const resolvedSource = source === undefined ? "unknown" : source;
  if (!isValidSource(resolvedSource)) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!subscribeRateLimiter.check(ip)) {
    return { status: 429, body: { ok: false, error: "rate_limited" } };
  }

  const config = getBeehiivConfig();
  if (!config) {
    return { status: 503, body: { ok: false, error: "unavailable" } };
  }

  const referringSite = headers.get("origin") || headers.get("referer") || undefined;
  const outcome = await subscribeToBeehiiv({ email, source: resolvedSource, referringSite }, config);

  if (outcome === "subscribed") return { status: 200, body: { ok: true } };
  if (outcome === "invalid") return { status: 400, body: { ok: false, error: "invalid_request" } };
  if (outcome === "rate_limited") return { status: 429, body: { ok: false, error: "rate_limited" } };
  return { status: 502, body: { ok: false, error: "provider_error" } };
}
