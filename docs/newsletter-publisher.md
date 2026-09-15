# NeuralDrift Weekly broadcast publisher

This publisher is intentionally content-neutral infrastructure. It validates a finished issue, returns a dry-run preview, and creates a Kit draft only when an operator explicitly authorizes the action.

## Handoff contract

RESEARCH
→ WRITE
→ VALIDATE
→ DRY RUN
→ CREATE DRAFT
→ APPROVE
→ SCHEDULE / SEND

The automation pipeline may research, draft, validate, and dry-run a newsletter. It may create a Kit draft only when configured to do so and when an operator approves the action.

The automation must never:
- automatically send a broadcast
- automatically schedule a broadcast without explicit approval
- expose Kit credentials or publisher secrets
- invent newsletter content
- claim tests or validation that did not run

## Internal payload

```json
{
  "issueKey": "2026-W38",
  "subject": "NeuralDrift Weekly",
  "previewText": "This week in AI tooling and creative workflows.",
  "html": "<html><body>...</body></html>"
}
```

## Server-side validation

- `issueKey` is required and must match a safe format.
- `subject` is required and length-limited.
- `previewText` is optional but length-limited.
- `html` is required and capped to a safe maximum size.
- Unknown JSON fields are rejected.
- Requests larger than the maximum request envelope are rejected.

## Dry-run behavior

The dry-run endpoint validates the payload and returns a normalized preview without hitting Kit. It includes:
- `issueKey`
- `subject`
- `previewText`
- `contentLength`
- `contentHash`
- `provider`

It does not return the API key or auth secret.

## Draft creation behavior

The draft-creation endpoint requires a bearer token in the `Authorization` header using `NEURALDRIFT_PUBLISHER_SECRET`.

It creates a draft through Kit's v4 broadcast API by posting to `/v4/broadcasts` with:
- `subject`
- `content`
- `preview_text`
- `public: false`
- `send_at: null`

This creates a draft only; it does not send or schedule the email.

## Idempotency

The publisher calculates a deterministic idempotency key using:
`issueKey + normalized content hash`

If an exact duplicate is seen, the service returns the existing broadcast metadata instead of creating a second draft.

The idempotency ledger is stored in Supabase (`newsletter_broadcasts`), accessed only through a server-only secret key. See [Deployment requirements](#deployment-requirements) below.

## Deployment requirements

The broadcast publisher requires the following server-side environment variables:

- `KIT_API_KEY` — Kit V4 API key.
- `NEURALDRIFT_PUBLISHER_SECRET` — bearer token required to call the dry-run/draft-creation endpoints.
- `NEURALDRIFT_SUPABASE_SECRET_KEY` — a manually managed, server-only Supabase credential (a modern `sb_secret_...` secret key, or a legacy `service_role` JWT) used only for the `newsletter_broadcasts` idempotency ledger.
- Either `NEURALDRIFT_SUPABASE_URL` (if the publisher's Supabase project differs from the public client project) or the existing `NEXT_PUBLIC_SUPABASE_URL` (reused automatically when `NEURALDRIFT_SUPABASE_URL` is not set).

`SUPABASE_SERVICE_ROLE_KEY` is **not** used by the broadcast publisher. It historically came from a Vercel Supabase Marketplace integration; that integration variable is not required, and must not be relied on, for this feature.

If any required variable is missing or the Supabase idempotency backend is unreachable, the publisher fails closed (returns a sanitized `503`/`unavailable` response) and never calls Kit.

## Security notes

- `KIT_API_KEY` remains server-only.
- `NEURALDRIFT_PUBLISHER_SECRET` is server-only and is sent as a bearer token.
- `NEURALDRIFT_SUPABASE_SECRET_KEY` is server-only and is never exposed to client code or logged.
- No secrets are logged or returned to callers.
- Only minimal broadcast metadata is returned to the caller.
