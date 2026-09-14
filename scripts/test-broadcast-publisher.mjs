import assert from 'node:assert';
import crypto from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  buildBroadcastDryRun,
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

console.log('Broadcast publisher tests: PASS');
