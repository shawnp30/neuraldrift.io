import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

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

export interface BroadcastLedgerEntry {
  broadcastId: string;
  issueKey: string;
  contentHash: string;
  status: "draft";
  createdAt: string;
}

export type BroadcastLedger = Record<string, BroadcastLedgerEntry>;

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

function getBroadcastLedgerPath(): string {
  return path.join(process.cwd(), ".newsletter-broadcasts.json");
}

async function readBroadcastLedger(): Promise<BroadcastLedger> {
  try {
    const file = await fs.readFile(getBroadcastLedgerPath(), "utf8");
    const parsed = JSON.parse(file) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const ledger = Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(([, value]) => !!value && typeof value === "object")
    ) as BroadcastLedger;
    return ledger;
  } catch {
    return {};
  }
}

async function writeBroadcastLedger(ledger: BroadcastLedger): Promise<void> {
  await fs.mkdir(path.dirname(getBroadcastLedgerPath()), { recursive: true });
  await fs.writeFile(getBroadcastLedgerPath(), JSON.stringify(ledger, null, 2));
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
  env: Record<string, string | undefined> = process.env
): Promise<BroadcastCreationResult> {
  const config = getKitBroadcastConfig(env);
  if (!config) {
    throw new Error("KIT_API_KEY is not configured.");
  }

  const contentHash = getBroadcastHash(input.html);
  const idempotencyKey = buildBroadcastIdempotencyKey(input.issueKey, contentHash);
  const ledger = await readBroadcastLedger();
  const existing = ledger[idempotencyKey];
  if (existing) {
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
    throw new KitBroadcastRequestError(response.status, `Kit broadcast creation failed (${response.status}): ${message.slice(0, 200)}`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  const broadcastId =
    body.id ??
    (typeof body.broadcast === "object" && body.broadcast !== null && "id" in (body.broadcast as Record<string, unknown>)
      ? String((body.broadcast as Record<string, unknown>).id)
      : undefined);
  if (broadcastId === undefined) {
    throw new Error("Kit broadcast response did not include a valid id.");
  }

  const finalized = {
    ok: true as const,
    broadcastId: String(broadcastId),
    status: "draft" as const,
    created: true,
    issueKey: input.issueKey.trim(),
    contentHash,
  };

  ledger[idempotencyKey] = {
    broadcastId: finalized.broadcastId,
    issueKey: finalized.issueKey,
    contentHash,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  await writeBroadcastLedger(ledger);

  return finalized;
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
  env: Record<string, string | undefined> = process.env
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
    const result = await createKitBroadcastDraft(input, fetchImpl, env);
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
    if (error instanceof Error && /KIT_API_KEY/.test(error.message)) {
      return { status: 503, body: { ok: false, error: "unavailable" } };
    }
    return { status: 502, body: { ok: false, error: "unavailable" } };
  }
}
