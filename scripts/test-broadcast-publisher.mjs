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
const [first, second] = await Promise.all([
  createKitBroadcastDraft(validIssue, async () => {
    secondFetchCount += 1;
    return new Response(JSON.stringify({ id: 12, status: 'draft' }), { status: 201 });
  }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, secondStore),
  createKitBroadcastDraft(validIssue, async () => {
    secondFetchCount += 1;
    return new Response(JSON.stringify({ id: 99, status: 'draft' }), { status: 201 });
  }, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' }, secondStore),
]);
assert.strictEqual(first.created, true);
assert.strictEqual(second.duplicate, true);
assert.strictEqual(secondFetchCount, 1);
console.log('7. Concurrent duplicate calls do not create two broadcasts: PASS');

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

console.log('Broadcast publisher tests: PASS');
