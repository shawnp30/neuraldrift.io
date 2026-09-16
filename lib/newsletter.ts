// Provider-neutral newsletter subscription logic. Kept framework-agnostic (no next/server
// imports) so it can be unit tested directly and swapped to a different ESP later.

export const NEWSLETTER_SOURCES = [
  "homepage",
  "guides",
  "tutorials",
  "workflow_detail",
  "lab",
  "newsletter",
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

export interface KitConfig {
  apiKey: string;
  formId: string;
}

export function getKitConfig(env: Record<string, string | undefined> = process.env): KitConfig | null {
  const apiKey = env.KIT_API_KEY;
  const formId = env.KIT_FORM_ID;
  if (env.NEXT_PUBLIC_NEWSLETTER_PROVIDER !== "kit" || !apiKey || !formId || !/^\d+$/.test(formId)) return null;
  return { apiKey, formId };
}

export type NewsletterSubscribeOutcome = "subscribed" | "invalid" | "rate_limited" | "provider_error";

export interface SubscribeInput {
  email: string;
  source: NewsletterSource;
  referringSite?: string;
}

interface KitSubscriberResponse {
  subscriber?: { id?: number | string };
}

export async function subscribeToKit(
  input: SubscribeInput,
  config: KitConfig,
  fetchImpl: typeof fetch = fetch
): Promise<NewsletterSubscribeOutcome> {
  const headers = { "content-type": "application/json", "X-Kit-Api-Key": config.apiKey };
  try {
    // Step 1: Kit V4's subscriber endpoint is an upsert — it creates a new subscriber
    // or hands back the existing one, so this covers both first-time and returning
    // emails. A subscriber must exist before they can be attached to a form.
    const createResponse = await fetchImpl("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: input.email }),
      signal: AbortSignal.timeout(10000),
    });
    if (!createResponse.ok) {
      console.error(`Kit subscriber request failed: status ${createResponse.status}`);
      return mapKitFailure(createResponse.status);
    }

    const created = (await createResponse.json()) as KitSubscriberResponse;
    const subscriberId = created.subscriber?.id;
    if (subscriberId === undefined) {
      console.error("Kit subscriber request failed: response had no subscriber id");
      return "provider_error";
    }

    // Step 2: attach the subscriber to the NeuralDrift Weekly form by id. Re-adding an
    // already-subscribed id is idempotent on Kit's side, so this is safe to repeat.
    const formBody: Record<string, unknown> = {};
    if (input.referringSite) formBody.referrer = input.referringSite;
    const formResponse = await fetchImpl(`https://api.kit.com/v4/forms/${config.formId}/subscribers/${subscriberId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(formBody),
      signal: AbortSignal.timeout(10000),
    });
    if (!formResponse.ok) {
      console.error(`Kit form assignment failed: status ${formResponse.status}`);
      return mapKitFailure(formResponse.status);
    }
  } catch {
    return "provider_error";
  }

  return "subscribed";
}

function mapKitFailure(status: number): NewsletterSubscribeOutcome {
  if (status === 400 || status === 422) return "invalid";
  if (status === 429) return "rate_limited";
  return "provider_error"; // Auth, missing form, network, and server errors remain private.
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

  const config = getKitConfig();
  if (!config) {
    return { status: 503, body: { ok: false, error: "unavailable" } };
  }

  const referringSite = headers.get("origin") || headers.get("referer") || undefined;
  const outcome = await subscribeToKit({ email, source: resolvedSource, referringSite }, config);

  if (outcome === "subscribed") return { status: 200, body: { ok: true } };
  if (outcome === "invalid") return { status: 400, body: { ok: false, error: "invalid_request" } };
  if (outcome === "rate_limited") return { status: 429, body: { ok: false, error: "rate_limited" } };
  return { status: 502, body: { ok: false, error: "provider_error" } };
}
