import crypto from "node:crypto";

export const KIT_BROADCAST_API_BASE = "https://api.kit.com/v4";
export const MAX_BROADCAST_REQUEST_BYTES = 250_000;
export const MAX_BROADCAST_SUBJECT_LENGTH = 150;
export const MAX_BROADCAST_PREVIEW_LENGTH = 200;
export const MAX_BROADCAST_HTML_BYTES = 200_000;
export const MAX_BROADCAST_ISSUE_KEY_LENGTH = 64;

export interface KitBroadcastConfig {
  apiKey: string;
}

export interface NewsletterBroadcastInput {
  issueKey: string;
  subject: string;
  previewText?: string;
  html: string;
}

export interface BroadcastDryRunResult {
  ok: true;
  dryRun: true;
  issueKey: string;
  subject: string;
  previewText: string;
  contentLength: number;
  contentHash: string;
  provider: "kit";
}

export interface BroadcastCreationResult {
  ok: true;
  broadcastId: string;
  status: "draft" | "duplicate";
  created: boolean;
  issueKey: string;
  contentHash: string;
  duplicate?: boolean;
}

export type BroadcastIdempotencyStatus = "reserved" | "completed";

export interface BroadcastIdempotencyRecord {
  issueKey: string;
  contentHash: string;
  broadcastId?: string;
  status: BroadcastIdempotencyStatus;
  createdAt: string;
}

export interface BroadcastReservation {
  record: BroadcastIdempotencyRecord | null;
  created: boolean;
}

export interface BroadcastIdempotencyStore {
  get(issueKey: string, contentHash: string): Promise<BroadcastIdempotencyRecord | null>;
  reserve(issueKey: string, contentHash: string): Promise<BroadcastReservation>;
  complete(issueKey: string, contentHash: string, broadcastId: string): Promise<BroadcastIdempotencyRecord>;
  release(issueKey: string, contentHash: string): Promise<void>;
}

export class NewsletterBroadcastValidationError extends Error {
  constructor(
    public readonly code: "invalid_request" | "unknown_fields" | "missing_secret" | "unavailable",
    message: string
  ) {
    super(message);
    this.name = "NewsletterBroadcastValidationError";
  }
}

export class KitBroadcastRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "KitBroadcastRequestError";
  }
}

const ALLOWED_BROADCAST_KEYS = new Set(["issueKey", "subject", "previewText", "html"]);

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim();
}

export function getPublisherSecret(env: Record<string, string | undefined> = process.env): string | undefined {
  return env.NEURALDRIFT_PUBLISHER_SECRET?.trim();
}

export function getKitBroadcastConfig(env: Record<string, string | undefined> = process.env): KitBroadcastConfig | null {
  const apiKey = env.KIT_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey };
}

export function normalizeIssueKey(issueKey: string): string {
  return issueKey.trim().replace(/\s+/g, "").toLowerCase();
}

export function getBroadcastHash(html: string): string {
  return crypto.createHash("sha256").update(html, "utf8").digest("hex");
}

export function buildBroadcastIdempotencyKey(issueKey: string, contentHash: string): string {
  return `${normalizeIssueKey(issueKey)}:${contentHash}`;
}

export class BroadcastPersistenceUnavailableError extends Error {
  constructor(message = "Broadcast idempotency storage is unavailable.") {
    super(message);
    this.name = "BroadcastPersistenceUnavailableError";
  }
}

class SupabaseBroadcastIdempotencyStore implements BroadcastIdempotencyStore {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string
  ) {}

  private getBaseUrl(): string {
    return `${this.url.replace(/\/$/, "")}/rest/v1/newsletter_broadcasts`;
  }

  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extra,
    };
  }

  private mapRow(row: Record<string, unknown> | null): BroadcastIdempotencyRecord | null {
    if (!row) return null;

    const issueKey = typeof row.issue_key === "string" ? row.issue_key : null;
    const contentHash = typeof row.content_hash === "string" ? row.content_hash : null;
    const broadcastId = typeof row.broadcast_id === "string" ? row.broadcast_id : undefined;
    const status = row.status === "completed" || row.status === "reserved" ? row.status : "reserved";
    const createdAt = typeof row.created_at === "string" ? row.created_at : new Date().toISOString();

    if (!issueKey || !contentHash) return null;

    return {
      issueKey,
      contentHash,
      broadcastId,
      status,
      createdAt,
    };
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...this.buildHeaders(),
        ...(init.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Broadcast idempotency storage request failed (${response.status}): ${text.slice(0, 200)}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    const payload = await response.text();
    if (!payload) {
      return null as T;
    }

    return JSON.parse(payload) as T;
  }

  async get(issueKey: string, contentHash: string): Promise<BroadcastIdempotencyRecord | null> {
    const url = `${this.getBaseUrl()}?issue_key=eq.${encodeURIComponent(issueKey)}&content_hash=eq.${encodeURIComponent(contentHash)}&select=issue_key,content_hash,broadcast_id,status,created_at`;
    const rows = await this.request<Array<Record<string, unknown>>>(url, {
      method: "GET",
      headers: this.buildHeaders(),
    });
    return rows && rows[0] ? this.mapRow(rows[0]) : null;
  }

  async reserve(issueKey: string, contentHash: string): Promise<BroadcastReservation> {
    const existing = await this.get(issueKey, contentHash);
    if (existing) {
      return { created: false, record: existing };
    }

    const now = new Date().toISOString();
    const rows = await this.request<Array<Record<string, unknown>>>(this.getBaseUrl(), {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        issue_key: issueKey,
        content_hash: contentHash,
        status: "reserved",
        broadcast_id: null,
        created_at: now,
        updated_at: now,
      }),
    }).catch((error) => {
      if (error instanceof Error && /409|duplicate|already exists/i.test(error.message)) {
        return null;
      }
      throw error;
    });

    if (!rows) {
      const record = await this.get(issueKey, contentHash);
      return { created: false, record };
    }

    const record = Array.isArray(rows) ? rows[0] ?? null : null;
    return {
      created: true,
      record: this.mapRow(record),
    };
  }

  async complete(issueKey: string, contentHash: string, broadcastId: string): Promise<BroadcastIdempotencyRecord> {
    const now = new Date().toISOString();
    const query = `?issue_key=eq.${encodeURIComponent(issueKey)}&content_hash=eq.${encodeURIComponent(contentHash)}`;
    const rows = await this.request<Array<Record<string, unknown>>>(`${this.getBaseUrl()}${query}`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        broadcast_id: broadcastId,
        status: "completed",
        updated_at: now,
      }),
    });

    const record = Array.isArray(rows) ? rows[0] ?? null : null;
    const mapped = this.mapRow(record);
    if (!mapped) {
      throw new Error("Broadcast completion did not return an idempotency record.");
    }

    return mapped;
  }

  async release(issueKey: string, contentHash: string): Promise<void> {
    const query = `?issue_key=eq.${encodeURIComponent(issueKey)}&content_hash=eq.${encodeURIComponent(contentHash)}`;
    await this.request<void>(`${this.getBaseUrl()}${query}`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
  }
}

export function createBroadcastIdempotencyStore(
  env: Record<string, string | undefined> = process.env
): BroadcastIdempotencyStore | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return new SupabaseBroadcastIdempotencyStore(supabaseUrl, serviceRoleKey);
}

export function validateNewsletterBroadcastInput(value: unknown): NewsletterBroadcastInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new NewsletterBroadcastValidationError("invalid_request", "Request body must be a JSON object.");
  }

  const record = value as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter((key) => !ALLOWED_BROADCAST_KEYS.has(key));
  if (unknownFields.length > 0) {
    throw new NewsletterBroadcastValidationError("unknown_fields", `Unexpected input fields: ${unknownFields.join(", ")}`);
  }

  const issueKey = normalizeString(record.issueKey);
  if (!issueKey || issueKey.length > MAX_BROADCAST_ISSUE_KEY_LENGTH) {
    throw new NewsletterBroadcastValidationError("invalid_request", "issueKey is required and must be shorter than 64 characters.");
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(issueKey)) {
    throw new NewsletterBroadcastValidationError("invalid_request", "issueKey contains unsupported characters.");
  }

  const subject = normalizeString(record.subject);
  if (!subject || subject.length > MAX_BROADCAST_SUBJECT_LENGTH) {
    throw new NewsletterBroadcastValidationError("invalid_request", "subject is required and must be shorter than 150 characters.");
  }

  const html = normalizeString(record.html);
  if (!html || html.length === 0 || Buffer.byteLength(html, "utf8") > MAX_BROADCAST_HTML_BYTES) {
    throw new NewsletterBroadcastValidationError("invalid_request", "html is required and must be below the maximum request size.");
  }

  const previewText = normalizeString(record.previewText ?? "");
  if (previewText && previewText.length > MAX_BROADCAST_PREVIEW_LENGTH) {
    throw new NewsletterBroadcastValidationError("invalid_request", "previewText exceeds the maximum allowed length.");
  }

  return {
    issueKey,
    subject,
    previewText: previewText || undefined,
    html,
  };
}

export function buildBroadcastDryRun(input: NewsletterBroadcastInput): BroadcastDryRunResult {
  const html = input.html;
  const previewText = input.previewText ?? "";
  const contentHash = getBroadcastHash(html);

  return {
    ok: true,
    dryRun: true,
    issueKey: input.issueKey.trim(),
    subject: input.subject,
    previewText,
    contentLength: Buffer.byteLength(html, "utf8"),
    contentHash,
    provider: "kit",
  };
}

export function getPublisherAuthErrorMessage(): string {
  return "Missing or invalid publisher authorization.";
}

export function isPublisherAuthorized(
  headers: { get(name: string): string | null } | Headers,
  env: Record<string, string | undefined> = process.env
): boolean {
  const expected = getPublisherSecret(env);
  if (!expected) return false;

  const raw = headers.get("authorization");
  if (!raw) return false;
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  if (!match) return false;

  const provided = match[1].trim();
  if (provided.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export async function createKitBroadcastDraft(
  input: NewsletterBroadcastInput,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
  store: BroadcastIdempotencyStore | null = createBroadcastIdempotencyStore(process.env)
): Promise<BroadcastCreationResult> {
  const config = getKitBroadcastConfig(env);
  if (!config) {
    throw new Error("KIT_API_KEY is not configured.");
  }

  if (!store) {
    throw new BroadcastPersistenceUnavailableError();
  }

  const normalizedIssueKey = normalizeIssueKey(input.issueKey);
  const contentHash = getBroadcastHash(input.html);

  const existing = await store.get(normalizedIssueKey, contentHash);
  if (existing && existing.broadcastId) {
    return {
      ok: true,
      broadcastId: existing.broadcastId,
      status: "duplicate",
      created: false,
      issueKey: input.issueKey.trim(),
      contentHash,
      duplicate: true,
    };
  }

  const reservation = await store.reserve(normalizedIssueKey, contentHash);
  const reservationRecord = reservation.record;

  if (reservationRecord && reservationRecord.status === "completed" && reservationRecord.broadcastId) {
    return {
      ok: true,
      broadcastId: reservationRecord.broadcastId,
      status: "duplicate",
      created: false,
      issueKey: input.issueKey.trim(),
      contentHash,
      duplicate: true,
    };
  }

  if (!reservation.created) {
    return {
      ok: true,
      broadcastId: reservationRecord?.broadcastId ?? existing?.broadcastId ?? "",
      status: "duplicate",
      created: false,
      issueKey: input.issueKey.trim(),
      contentHash,
      duplicate: true,
    };
  }

  try {
    const response = await fetchImpl(`${KIT_BROADCAST_API_BASE}/broadcasts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": config.apiKey,
      },
      body: JSON.stringify({
        subject: input.subject,
        content: input.html,
        preview_text: input.previewText ?? "",
        public: false,
        send_at: null,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const message = await response.text();
      await store.release(normalizedIssueKey, contentHash);
      throw new KitBroadcastRequestError(response.status, `Kit broadcast creation failed (${response.status}): ${message.slice(0, 200)}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    const broadcastId =
      body.id ??
      (typeof body.broadcast === "object" && body.broadcast !== null && "id" in (body.broadcast as Record<string, unknown>)
        ? String((body.broadcast as Record<string, unknown>).id)
        : undefined);
    if (broadcastId === undefined) {
      await store.release(normalizedIssueKey, contentHash);
      throw new Error("Kit broadcast response did not include a valid id.");
    }

    await store.complete(normalizedIssueKey, contentHash, String(broadcastId));

    return {
      ok: true,
      broadcastId: String(broadcastId),
      status: "draft",
      created: true,
      issueKey: input.issueKey.trim(),
      contentHash,
    };
  } catch (error) {
    await store.release(normalizedIssueKey, contentHash).catch(() => undefined);
    throw error;
  }
}

export async function handleNewsletterBroadcastDryRun(
  raw: string,
  headers: { get(name: string): string | null } | Headers = new Headers(),
  env: Record<string, string | undefined> = process.env
): Promise<{ status: number; body: BroadcastDryRunResult | { ok: false; error: "invalid_request" | "unknown_fields" | "missing_secret" | "unavailable" | "forbidden" } }> {
  if (!isPublisherAuthorized(headers, env)) {
    return { status: 401, body: { ok: false, error: "forbidden" } };
  }

  if (raw.length > MAX_BROADCAST_REQUEST_BYTES) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const input = validateNewsletterBroadcastInput(parsed);
    const result = buildBroadcastDryRun(input);
    return { status: 200, body: result };
  } catch (error) {
    if (error instanceof NewsletterBroadcastValidationError) {
      return { status: 400, body: { ok: false, error: error.code } };
    }
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }
}

export async function handleCreateNewsletterBroadcastDraft(
  raw: string,
  headers: { get(name: string): string | null } | Headers,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
  store: BroadcastIdempotencyStore | null = createBroadcastIdempotencyStore(process.env)
): Promise<{
  status: number;
  body: BroadcastCreationResult | { ok: false; error: "invalid_request" | "unknown_fields" | "missing_secret" | "unavailable" | "forbidden" };
}> {
  if (!isPublisherAuthorized(headers, env)) {
    return { status: 401, body: { ok: false, error: "forbidden" } };
  }

  if (raw.length > MAX_BROADCAST_REQUEST_BYTES) {
    return { status: 400, body: { ok: false, error: "invalid_request" } };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const input = validateNewsletterBroadcastInput(parsed);
    const result = await createKitBroadcastDraft(input, fetchImpl, env, store);
    return { status: result.duplicate ? 200 : 201, body: result };
  } catch (error) {
    if (error instanceof NewsletterBroadcastValidationError) {
      return { status: 400, body: { ok: false, error: error.code } };
    }
    if (error instanceof KitBroadcastRequestError) {
      if (error.status === 400 || error.status === 422) return { status: 400, body: { ok: false, error: "invalid_request" } };
      if (error.status === 401 || error.status === 403) return { status: 401, body: { ok: false, error: "forbidden" } };
      if (error.status === 429) return { status: 429, body: { ok: false, error: "unavailable" } };
      return { status: 502, body: { ok: false, error: "unavailable" } };
    }
    if (error instanceof BroadcastPersistenceUnavailableError || (error instanceof Error && /KIT_API_KEY/.test(error.message))) {
      return { status: 503, body: { ok: false, error: "unavailable" } };
    }
    return { status: 502, body: { ok: false, error: "unavailable" } };
  }
}
