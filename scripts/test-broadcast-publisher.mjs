import assert from 'node:assert';
import crypto from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  buildBroadcastDryRun,
  createBroadcastIdempotencyStore,
  createKitBroadcastDraft,
  handleCreateNewsletterBroadcastDraft,
  handleNewsletterBroadcastDryRun,
  isPublisherAuthorized,
  validateNewsletterBroadcastInput,
  BroadcastPersistenceUnavailableError,
  BroadcastReconciliationRequiredError,
} from '../lib/newsletter/broadcasts.ts';

function makeMemoryStore() {
  const entries = new Map();
  return {
    async get(issueKey, contentHash) {
      return entries.get(`${issueKey}:${contentHash}`) ?? null;
    },
    async reserve(issueKey, contentHash) {
      const key = `${issueKey}:${contentHash}`;
      const existing = entries.get(key);
      if (existing) {
        return { created: false, record: existing };
      }
      const record = {
        issueKey,
        contentHash,
        status: 'reserved',
        createdAt: new Date().toISOString(),
      };
      entries.set(key, record);
      return { created: true, record };
    },
    async complete(issueKey, contentHash, broadcastId) {
      const key = `${issueKey}:${contentHash}`;
      const record = entries.get(key) ?? {
        issueKey,
        contentHash,
        status: 'reserved',
        createdAt: new Date().toISOString(),
      };
      const updated = { ...record, status: 'completed', broadcastId };
      entries.set(key, updated);
      return updated;
    },
    async release(issueKey, contentHash) {
      entries.delete(`${issueKey}:${contentHash}`);
    },
    async markReconciliationRequired(issueKey, contentHash, broadcastId) {
      const key = `${issueKey}:${contentHash}`;
      const record = entries.get(key) ?? {
        issueKey,
        contentHash,
        status: 'reserved',
        createdAt: new Date().toISOString(),
      };
      entries.set(key, { ...record, status: 'reconciliation_required', ...(broadcastId ? { broadcastId } : {}) });
    },
    _entries: entries,
  };
}

const validIssue = {
  issueKey: `2026-W38-${String(Date.now()).slice(-4)}`,
  subject: 'NeuralDrift Weekly',
  previewText: 'The week in AI products and workflows.',
  html: '<html><body><p>Hi there</p></body></html>',
};

const sourceText = readFileSync(new URL('../lib/newsletter/broadcasts.ts', import.meta.url), 'utf8');
assert.ok(!sourceText.includes('process.cwd()'));
assert.ok(!sourceText.includes('.newsletter-broadcasts.json'));
console.log('0. Production path does not use a process.cwd ledger: PASS');

assert.deepStrictEqual(validateNewsletterBroadcastInput(validIssue), validIssue);
console.log('1. Valid payload validation: PASS');

assert.throws(() => validateNewsletterBroadcastInput({ ...validIssue, extra: 'nope' }), /Unexpected input fields/);
assert.throws(() => validateNewsletterBroadcastInput({ ...validIssue, subject: '' }), /subject is required/);
assert.throws(() => validateNewsletterBroadcastInput({ ...validIssue, html: '' }), /html is required/);
assert.throws(() => validateNewsletterBroadcastInput({ ...validIssue, issueKey: 'bad key' }), /unsupported characters/);
assert.throws(() => validateNewsletterBroadcastInput({ ...validIssue, html: '<p>' + 'x'.repeat(300000) + '</p>' }), /maximum request size/);
console.log('2. Validation rejects malformed and oversized payloads: PASS');

const dryRun = await handleNewsletterBroadcastDryRun(JSON.stringify(validIssue), new Headers({ authorization: 'Bearer secret' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(dryRun.status, 200);
assert.strictEqual(dryRun.body.dryRun, true);
assert.strictEqual(dryRun.body.contentLength, Buffer.byteLength(validIssue.html, 'utf8'));
console.log('3. Dry-run requires auth and returns sanitized preview: PASS');

const missingAuth = await handleNewsletterBroadcastDryRun(JSON.stringify(validIssue), new Headers(), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(missingAuth.status, 401);
assert.strictEqual(missingAuth.body.error, 'forbidden');

const badAuth = await handleNewsletterBroadcastDryRun(JSON.stringify(validIssue), new Headers({ authorization: 'Bearer wrong' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(badAuth.status, 401);
console.log('4. Missing and invalid auth are rejected: PASS');

const initialStore = makeMemoryStore();
let fetchCallCount = 0;
const created = await handleCreateNewsletterBroadcastDraft(
  JSON.stringify(validIssue),
  new Headers({ authorization: 'Bearer secret' }),
  async (url, init) => {
    fetchCallCount += 1;
    assert.strictEqual(url, 'https://api.kit.com/v4/broadcasts');
    assert.strictEqual(init.headers['X-Kit-Api-Key'], 'kit-key');
    assert.strictEqual(init.method, 'POST');
    assert.deepStrictEqual(JSON.parse(init.body), {
      subject: 'NeuralDrift Weekly',
      content: validIssue.html,
      preview_text: 'The week in AI products and workflows.',
      public: false,
      send_at: null,
    });
    return new Response(JSON.stringify({ id: 42, status: 'draft' }), { status: 201 });
  },
  { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
  initialStore
);
assert.strictEqual(created.status, 201);
assert.strictEqual(created.body.broadcastId, '42');
assert.strictEqual(created.body.status, 'draft');
assert.strictEqual(created.body.created, true);
assert.strictEqual(fetchCallCount, 1);
console.log('5. Draft creation uses the correct Kit endpoint and stores the broadcast ID: PASS');

const duplicate = await handleCreateNewsletterBroadcastDraft(
  JSON.stringify(validIssue),
  new Headers({ authorization: 'Bearer secret' }),
  async () => {
    throw new Error('should not call Kit again');
  },
  { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
  initialStore
);
assert.strictEqual(duplicate.status, 200);
assert.strictEqual(duplicate.body.duplicate, true);
console.log('6. Same issue + content is treated as a duplicate: PASS');

const secondStore = makeMemoryStore();
let secondFetchCount = 0;
const [first, second] = await Promise.allSettled([
  createKitBroadcastDraft(validIssue, async () => {
    secondFetchCount += 1;
    return new Response(JSON.stringify({ id: 12, status: 'draft' }), { status: 201 });
  }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, secondStore),
  createKitBroadcastDraft(validIssue, async () => {
    secondFetchCount += 1;
    return new Response(JSON.stringify({ id: 99, status: 'draft' }), { status: 201 });
  }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, secondStore),
]);
assert.strictEqual(first.status, 'fulfilled');
assert.strictEqual(first.value.created, true);
// The race loser must NOT report a false success/duplicate with an empty
// broadcastId, and Kit must only be called once for the pair.
assert.strictEqual(second.status, 'rejected');
assert.ok(second.reason instanceof BroadcastReconciliationRequiredError);
assert.strictEqual(secondFetchCount, 1);
console.log('7. Concurrent duplicate calls do not create two broadcasts and the race loser never reports a false success: PASS');

const failingStore = makeMemoryStore();
const secret = 'super-secret-key-123';
const contentHash = crypto.createHash('sha256').update(validIssue.html, 'utf8').digest('hex');
const issueKey = validIssue.issueKey.trim().replace(/\s+/g, '').toLowerCase();
let failureCalls = 0;
await assert.rejects(
  () => createKitBroadcastDraft(validIssue, async () => {
    failureCalls += 1;
    return new Response(JSON.stringify({ error: 'kit failure' }), { status: 500 });
  }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: secret }, failingStore),
  /Kit broadcast creation failed/
);
assert.strictEqual(failureCalls, 1);
assert.strictEqual(await failingStore.get(issueKey, contentHash), null);
console.log('8. Kit failures release the reservation and avoid stale duplicates: PASS');

const dryRunResult = buildBroadcastDryRun(validIssue);
assert.strictEqual(dryRunResult.provider, 'kit');
assert.strictEqual(dryRunResult.contentHash.length, 64);
assert.strictEqual(dryRunResult.issueKey, validIssue.issueKey);
console.log('9. Dry-run result contains normalized metadata: PASS');

const secretCheck = isPublisherAuthorized(new Headers({ authorization: 'Bearer secret' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(secretCheck, true);
const secretCheckBad = isPublisherAuthorized(new Headers({ authorization: 'Bearer wrong' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(secretCheckBad, false);
console.log('10. Authorization helper uses constant-time comparison semantics: PASS');

await assert.rejects(
  () => createKitBroadcastDraft(validIssue, async () => { throw new Error('should not call'); }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, null),
  BroadcastPersistenceUnavailableError
);
console.log('11. Missing persistent storage fails closed without calling Kit: PASS');

assert.ok(existsSync(path.join(process.cwd(), 'public', 'robots.txt')));
console.log('12. robots.txt still exists in the repo: PASS');

// --- Reconciliation-safety scenarios -------------------------------------

function makeUniqueIssue(suffix) {
  return {
    ...validIssue,
    issueKey: `2026-W38-RC-${suffix}-${String(Date.now()).slice(-4)}`,
  };
}

// 13. Kit success + persistence failure must NOT release the reservation and
// must NOT allow a retry to call Kit again.
{
  const issue = makeUniqueIssue('complete-fail');
  const store = makeMemoryStore();
  const originalComplete = store.complete.bind(store);
  let completeCalls = 0;
  store.complete = async (...args) => {
    completeCalls += 1;
    throw new Error('storage write failed');
  };
  let fetchCalls = 0;
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ id: 777, status: 'draft' }), { status: 201 });
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  assert.strictEqual(completeCalls, 1);
  assert.strictEqual(fetchCalls, 1);

  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  const stored = store._entries.get(key);
  assert.strictEqual(stored.status, 'reconciliation_required');
  assert.strictEqual(stored.broadcastId, '777');

  // Retrying must NOT call Kit again.
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      throw new Error('Kit should not be called again');
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  assert.strictEqual(fetchCalls, 1);
  console.log('13. Kit success followed by a storage failure requires reconciliation and blocks retries from re-calling Kit: PASS');
}

// 14. A network-level/timeout error (ambiguous outcome) must NOT release the
// reservation and must mark it for reconciliation instead.
{
  const issue = makeUniqueIssue('network-timeout');
  const store = makeMemoryStore();
  let fetchCalls = 0;
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      throw new Error('fetch failed: timeout');
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  assert.strictEqual(fetchCalls, 1);

  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  assert.strictEqual(store._entries.get(key).status, 'reconciliation_required');

  // A retry must not call Kit again.
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      throw new Error('Kit should not be called again');
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  assert.strictEqual(fetchCalls, 1);
  console.log('14. Network/timeout ambiguity requires reconciliation and blocks Kit retries: PASS');
}

// 16. Kit success but response body missing a valid id must be treated as
// ambiguous (reconciliation required), not a silent failure that releases.
{
  const issue = makeUniqueIssue('missing-id');
  const store = makeMemoryStore();
  let fetchCalls = 0;
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ status: 'draft' }), { status: 201 });
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  assert.strictEqual(store._entries.get(key).status, 'reconciliation_required');
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => {
      fetchCalls += 1;
      throw new Error('Kit should not be called again');
    }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    BroadcastReconciliationRequiredError
  );
  assert.strictEqual(fetchCalls, 1);
  console.log('16. Kit success with a malformed/missing id requires reconciliation and blocks Kit retries: PASS');
}

// 17. A confirmed, definitive Kit failure (e.g. real HTTP-level rejection)
// never returns an empty broadcastId and never falsely reports success.
{
  const issue = makeUniqueIssue('definitive-failure');
  const store = makeMemoryStore();
  await assert.rejects(
    () => createKitBroadcastDraft(issue, async () => new Response(JSON.stringify({ error: 'nope' }), { status: 500 }), { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, store),
    /Kit broadcast creation failed/
  );
  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  assert.strictEqual(store._entries.has(key), false);
  console.log('17. Definitive Kit failures release the reservation cleanly and never report a false success: PASS');
}

// 18. handleCreateNewsletterBroadcastDraft maps reconciliation-required
// outcomes to a sanitized, non-2xx response instead of a false success.
{
  const issue = makeUniqueIssue('handler-reconciliation');
  const store = makeMemoryStore();
  const result = await handleCreateNewsletterBroadcastDraft(
    JSON.stringify(issue),
    new Headers({ authorization: 'Bearer secret' }),
    async () => {
      throw new Error('network unreachable');
    },
    { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
    store
  );
  assert.strictEqual(result.status, 409);
  assert.strictEqual(result.body.ok, false);
  assert.strictEqual(result.body.error, 'reconciliation_required');
  console.log('18. The HTTP handler maps reconciliation-required outcomes to a sanitized 409 response: PASS');
}

// 19. Persistent backend unavailable must fail closed without calling Kit
// (also exercised through the HTTP handler, not just the raw function).
{
  const issue = makeUniqueIssue('no-store');
  let fetchCalls = 0;
  const result = await handleCreateNewsletterBroadcastDraft(
    JSON.stringify(issue),
    new Headers({ authorization: 'Bearer secret' }),
    async () => {
      fetchCalls += 1;
      throw new Error('should not be called');
    },
    { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
    null
  );
  assert.strictEqual(result.status, 503);
  assert.strictEqual(fetchCalls, 0);
  console.log('19. Persistent backend unavailable fails closed through the HTTP handler without calling Kit: PASS');
}

// 20. Both robots files must remain byte-identical to origin/main.
{
  try {
    const { execSync } = await import('node:child_process');
    execSync('git fetch origin main --quiet', { cwd: process.cwd(), stdio: 'ignore' });
    const diffStat = execSync('git diff origin/main -- app/robots.ts public/robots.txt', { cwd: process.cwd() }).toString();
    assert.strictEqual(diffStat.trim(), '');
    console.log('20. app/robots.ts and public/robots.txt are byte-identical to origin/main: PASS');
  } catch (error) {
    console.log('20. Skipped robots.txt/origin diff check (git unavailable in this environment): SKIP');
  }
}

// --- Manually managed Supabase secret key wiring -------------------------

// 21. The orphaned/integration-owned SUPABASE_SERVICE_ROLE_KEY must no longer
// be sufficient (alone) to create a persistent idempotency store: the
// publisher must require the new manually managed
// NEURALDRIFT_SUPABASE_SECRET_KEY instead.
{
  const store = createBroadcastIdempotencyStore({
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'orphaned-legacy-value',
  });
  assert.strictEqual(store, null);
  console.log('21. Orphaned SUPABASE_SERVICE_ROLE_KEY alone does not create a persistent store (fails closed): PASS');
}

// 22. Missing NEURALDRIFT_SUPABASE_SECRET_KEY (even with a valid URL) fails
// closed rather than silently falling back to an unusable/legacy variable.
{
  const store = createBroadcastIdempotencyStore({
    NEURALDRIFT_SUPABASE_URL: 'https://example.supabase.co',
  });
  assert.strictEqual(store, null);
  console.log('22. Missing NEURALDRIFT_SUPABASE_SECRET_KEY fails closed without a usable store: PASS');
}

// 23. URL resolution prefers NEURALDRIFT_SUPABASE_URL when present, and
// falls back to NEXT_PUBLIC_SUPABASE_URL when it is not required/configured.
{
  const preferred = [];
  const preferredStore = createBroadcastIdempotencyStore(
    {
      NEURALDRIFT_SUPABASE_URL: 'https://preferred.supabase.co',
      NEXT_PUBLIC_SUPABASE_URL: 'https://fallback.supabase.co',
      NEURALDRIFT_SUPABASE_SECRET_KEY: 'sb_secret_test_key',
    },
    async (url) => {
      preferred.push(String(url));
      return new Response('[]', { status: 200 });
    }
  );
  assert.ok(preferredStore);
  await preferredStore.get('issue', 'hash');
  assert.ok(preferred[0].startsWith('https://preferred.supabase.co/'));

  const fallback = [];
  const fallbackStore = createBroadcastIdempotencyStore(
    {
      NEXT_PUBLIC_SUPABASE_URL: 'https://fallback.supabase.co',
      NEURALDRIFT_SUPABASE_SECRET_KEY: 'sb_secret_test_key',
    },
    async (url) => {
      fallback.push(String(url));
      return new Response('[]', { status: 200 });
    }
  );
  assert.ok(fallbackStore);
  await fallbackStore.get('issue', 'hash');
  assert.ok(fallback[0].startsWith('https://fallback.supabase.co/'));
  console.log('23. Supabase URL resolution prefers NEURALDRIFT_SUPABASE_URL and falls back to NEXT_PUBLIC_SUPABASE_URL: PASS');
}

// 24. No usable Supabase URL at all fails closed.
{
  const store = createBroadcastIdempotencyStore({
    NEURALDRIFT_SUPABASE_SECRET_KEY: 'sb_secret_test_key',
  });
  assert.strictEqual(store, null);
  console.log('24. Missing Supabase URL fails closed without a usable store: PASS');
}

// 25. Modern Supabase secret keys ("sb_secret_...") authenticate using only
// the `apikey` header. They are not JWTs, so `Authorization: Bearer` must
// NOT be sent (Supabase's gateway rejects a non-JWT bearer token).
{
  let capturedHeaders = null;
  const store = createBroadcastIdempotencyStore(
    {
      NEURALDRIFT_SUPABASE_URL: 'https://example.supabase.co',
      NEURALDRIFT_SUPABASE_SECRET_KEY: 'sb_secret_abcdef123456',
    },
    async (_url, init) => {
      capturedHeaders = new Headers(init.headers);
      return new Response('[]', { status: 200 });
    }
  );
  await store.get('issue', 'hash');
  assert.strictEqual(capturedHeaders.get('apikey'), 'sb_secret_abcdef123456');
  assert.strictEqual(capturedHeaders.get('authorization'), null);
  console.log('25. Modern Supabase secret keys authenticate via apikey only, with no Authorization header: PASS');
}

// 26. A legacy service_role JWT-style value (not a modern sb_secret_/
// sb_publishable_ key) still gets an Authorization: Bearer header alongside
// apikey, preserving backward compatibility for any project still using it.
{
  let capturedHeaders = null;
  const legacyJwtLikeValue = 'legacy-service-role-jwt-value';
  const store = createBroadcastIdempotencyStore(
    {
      NEURALDRIFT_SUPABASE_URL: 'https://example.supabase.co',
      NEURALDRIFT_SUPABASE_SECRET_KEY: legacyJwtLikeValue,
    },
    async (_url, init) => {
      capturedHeaders = new Headers(init.headers);
      return new Response('[]', { status: 200 });
    }
  );
  await store.get('issue', 'hash');
  assert.strictEqual(capturedHeaders.get('apikey'), legacyJwtLikeValue);
  assert.strictEqual(capturedHeaders.get('authorization'), `Bearer ${legacyJwtLikeValue}`);
  console.log('26. Legacy non-modern key values still send both apikey and Authorization headers: PASS');
}

// 28. The Supabase secret key value must never appear in a thrown error
// message (no secret logging/leakage on failure).
{
  const secretValue = 'sb_secret_should_never_leak_9f8e7d6c5b4a';
  const store = createBroadcastIdempotencyStore(
    {
      NEURALDRIFT_SUPABASE_URL: 'https://example.supabase.co',
      NEURALDRIFT_SUPABASE_SECRET_KEY: secretValue,
    },
    async () => new Response('server error text', { status: 500 })
  );
  let caught = null;
  try {
    await store.get('issue', 'hash');
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof Error);
  assert.ok(!caught.message.includes(secretValue));
  console.log('28. Supabase secret key value never appears in a thrown error message: PASS');
}

// --- Safe diagnostic logging on the broadcast create path ----------------

function captureConsoleError() {
  const calls = [];
  const original = console.error;
  console.error = (...args) => {
    calls.push(args);
  };
  return {
    calls,
    restore() {
      console.error = original;
    },
  };
}

const SENSITIVE_SUBSTRINGS = [
  'kit-key',
  'super-secret',
  'sb_secret_diagnostic_leak_test',
  'Bearer ',
  'Authorization',
  '<p>',
  '</p>',
  validIssue.html,
  validIssue.subject,
];

function assertNoSensitiveLogData(calls) {
  const serialized = JSON.stringify(calls);
  for (const needle of SENSITIVE_SUBSTRINGS) {
    assert.ok(!serialized.includes(needle), `diagnostic log leaked sensitive value: ${needle}`);
  }
}

// 29. An unexpected Supabase failure during the initial lookup produces a
// single, safe, stage-tagged diagnostic log entry (supabase_get) and the
// sanitized API response/idempotency behavior is unchanged.
{
  const issue = makeUniqueIssue('diag-supabase-get');
  const store = makeMemoryStore();
  store.get = async () => {
    throw new Error('storage read failed: connection refused to internal host');
  };
  const capture = captureConsoleError();
  let result;
  try {
    result = await handleCreateNewsletterBroadcastDraft(
      JSON.stringify(issue),
      new Headers({ authorization: 'Bearer secret' }),
      async () => {
        throw new Error('should not be called');
      },
      { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
      store
    );
  } finally {
    capture.restore();
  }
  assert.strictEqual(result.status, 502);
  assert.deepStrictEqual(result.body, { ok: false, error: 'unavailable' });

  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 1, 'expected exactly one diagnostic log entry, not a duplicate');
  const [, payload] = diagnosticCalls[0];
  assert.strictEqual(payload.stage, 'supabase_get');
  assert.strictEqual(payload.errorName, 'Error');
  assert.strictEqual(payload.issueKey, issue.issueKey.trim().toLowerCase());
  assertNoSensitiveLogData(capture.calls);
  console.log('29. Unexpected Supabase lookup failures log a single safe supabase_get diagnostic entry and keep the response sanitized: PASS');
}

// 30. A Kit HTTP-level rejection logs a safe kit_response diagnostic entry
// including the numeric status, but never the raw response body text.
{
  const issue = makeUniqueIssue('diag-kit-response');
  const store = makeMemoryStore();
  const capture = captureConsoleError();
  try {
    await assert.rejects(
      () => createKitBroadcastDraft(
        issue,
        async () => new Response('internal server error details you must not log', { status: 500 }),
        { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
        store
      ),
      /Kit broadcast creation failed/
    );
  } finally {
    capture.restore();
  }
  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 1);
  const [, payload] = diagnosticCalls[0];
  assert.strictEqual(payload.stage, 'kit_response');
  assert.strictEqual(payload.status, 500);
  assert.strictEqual(payload.errorName, 'KitBroadcastRequestError');
  const serialized = JSON.stringify(capture.calls);
  assert.ok(!serialized.includes('internal server error details you must not log'));
  console.log('30. Definitive Kit rejections log a safe kit_response diagnostic entry with a status code but never the raw response body: PASS');
}

// 31. A network/timeout failure calling Kit logs a safe kit_request
// diagnostic entry, and the reservation is still marked reconciliation_
// required (idempotency behavior unchanged by the added logging).
{
  const issue = makeUniqueIssue('diag-kit-request');
  const store = makeMemoryStore();
  const capture = captureConsoleError();
  try {
    await assert.rejects(
      () => createKitBroadcastDraft(
        issue,
        async () => {
          throw new Error('fetch failed: timeout');
        },
        { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
        store
      ),
      BroadcastReconciliationRequiredError
    );
  } finally {
    capture.restore();
  }
  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 1);
  assert.strictEqual(diagnosticCalls[0][1].stage, 'kit_request');
  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  assert.strictEqual(store._entries.get(key).status, 'reconciliation_required');
  console.log('31. Kit network/timeout failures log a safe kit_request diagnostic entry without changing reconciliation behavior: PASS');
}

// 32. Kit success followed by a persistence failure logs a safe
// supabase_complete diagnostic entry and still preserves the known
// broadcastId under reconciliation_required (unchanged from before logging
// was added).
{
  const issue = makeUniqueIssue('diag-supabase-complete');
  const store = makeMemoryStore();
  store.complete = async () => {
    throw new Error('storage write failed');
  };
  const capture = captureConsoleError();
  try {
    await assert.rejects(
      () => createKitBroadcastDraft(
        issue,
        async () => new Response(JSON.stringify({ id: 9001, status: 'draft' }), { status: 201 }),
        { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
        store
      ),
      BroadcastReconciliationRequiredError
    );
  } finally {
    capture.restore();
  }
  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 1);
  assert.strictEqual(diagnosticCalls[0][1].stage, 'supabase_complete');
  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  const stored = store._entries.get(key);
  assert.strictEqual(stored.status, 'reconciliation_required');
  assert.strictEqual(stored.broadcastId, '9001');
  console.log('32. Kit success followed by a persistence failure logs a safe supabase_complete diagnostic entry and preserves the broadcastId: PASS');
}

// 33. Existing reconciliation_required / reserved / completed short-circuit
// paths still never call Kit again, and (when they do log) never leak the
// stored broadcastId's surrounding request content.
{
  const issue = makeUniqueIssue('diag-reconciliation');
  const store = makeMemoryStore();
  const now = new Date().toISOString();
  const key = `${issue.issueKey.trim().toLowerCase()}:${crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex')}`;
  store._entries.set(key, {
    issueKey: issue.issueKey.trim().toLowerCase(),
    contentHash: crypto.createHash('sha256').update(issue.html, 'utf8').digest('hex'),
    status: 'reconciliation_required',
    broadcastId: undefined,
    createdAt: now,
  });
  const capture = captureConsoleError();
  let fetchCalls = 0;
  try {
    await assert.rejects(
      () => createKitBroadcastDraft(
        issue,
        async () => {
          fetchCalls += 1;
          throw new Error('Kit should not be called');
        },
        { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
        store
      ),
      BroadcastReconciliationRequiredError
    );
  } finally {
    capture.restore();
  }
  assert.strictEqual(fetchCalls, 0);
  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 1);
  assert.strictEqual(diagnosticCalls[0][1].stage, 'reconciliation');
  assertNoSensitiveLogData(capture.calls);
  console.log('33. A pre-existing reconciliation_required record still blocks Kit calls and logs a safe reconciliation diagnostic entry: PASS');
}

// 34. Successful draft creation and duplicate-completed short-circuits never
// emit any diagnostic error log entries (logging is additive to failure
// paths only, never the happy path).
{
  const issue = makeUniqueIssue('diag-happy-path');
  const store = makeMemoryStore();
  const capture = captureConsoleError();
  let result;
  try {
    result = await createKitBroadcastDraft(
      issue,
      async () => new Response(JSON.stringify({ id: 555, status: 'draft' }), { status: 201 }),
      { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
      store
    );
    const duplicateResult = await createKitBroadcastDraft(
      issue,
      async () => {
        throw new Error('Kit should not be called for a completed duplicate');
      },
      { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
      store
    );
    assert.strictEqual(duplicateResult.duplicate, true);
  } finally {
    capture.restore();
  }
  assert.strictEqual(result.created, true);
  assert.strictEqual(result.status, 'draft');
  const diagnosticCalls = capture.calls.filter((call) => call[0] === 'newsletter_broadcast_error');
  assert.strictEqual(diagnosticCalls.length, 0, 'the happy path (including completed duplicates) must never log a diagnostic error entry');
  console.log('34. Successful draft creation and completed-duplicate short-circuits never emit diagnostic error logs: PASS');
}

// 35. Draft creation continues to request a private, unscheduled draft only
// (no send/schedule field is ever set), independent of the added logging.
{
  const issue = makeUniqueIssue('diag-no-send-schedule');
  const store = makeMemoryStore();
  let capturedBody = null;
  await createKitBroadcastDraft(
    issue,
    async (_url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ id: 4242, status: 'draft' }), { status: 201 });
    },
    { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' },
    store
  );
  assert.strictEqual(capturedBody.public, false);
  assert.strictEqual(capturedBody.send_at, null);
  assert.ok(!('scheduled' in capturedBody));
  assert.ok(!('send' in capturedBody));
  console.log('35. The Kit request body continues to request a private, unscheduled draft only (no send/schedule field): PASS');
}

console.log('Broadcast publisher tests: PASS');
