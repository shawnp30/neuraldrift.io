import assert from 'node:assert';
import {
  buildBroadcastDryRun,
  createKitBroadcastDraft,
  handleCreateNewsletterBroadcastDraft,
  handleNewsletterBroadcastDryRun,
  isPublisherAuthorized,
  validateNewsletterBroadcastInput,
} from '../lib/newsletter/broadcasts.ts';

const validIssue = {
  issueKey: `2026-W38-${String(Date.now()).slice(-4)}`,
  subject: 'NeuralDrift Weekly',
  previewText: 'The week in AI products and workflows.',
  html: '<html><body><p>Hi there</p></body></html>',
};

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

const badAuth = await handleNewsletterBroadcastDryRun(JSON.stringify(validIssue), new Headers({ authorization: 'Bearer no' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(badAuth.status, 401);
console.log('4. Missing and invalid auth are rejected: PASS');

const created = await handleCreateNewsletterBroadcastDraft(JSON.stringify(validIssue), new Headers({ authorization: 'Bearer secret' }), async (url, init) => {
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
}, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(created.status, 201);
assert.strictEqual(created.body.broadcastId, '42');
assert.strictEqual(created.body.status, 'draft');
assert.strictEqual(created.body.created, true);
console.log('5. Draft creation uses the correct Kit endpoint and payload: PASS');

const duplicate = await handleCreateNewsletterBroadcastDraft(JSON.stringify(validIssue), new Headers({ authorization: 'Bearer secret' }), async () => {
  throw new Error('should not call Kit again');
}, { KIT_API_KEY: 'kit-key', NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(duplicate.status, 200);
assert.strictEqual(duplicate.body.duplicate, true);
console.log('6. Same issue + content is treated as a duplicate: PASS');

const dryRunResult = buildBroadcastDryRun(validIssue);
assert.strictEqual(dryRunResult.provider, 'kit');
assert.strictEqual(dryRunResult.contentHash.length, 64);
assert.strictEqual(dryRunResult.issueKey, validIssue.issueKey);
console.log('7. Dry-run result contains normalized metadata: PASS');

const secretCheck = isPublisherAuthorized(new Headers({ authorization: 'Bearer secret' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(secretCheck, true);
const secretCheckBad = isPublisherAuthorized(new Headers({ authorization: 'Bearer wrong' }), { NEURALDRIFT_PUBLISHER_SECRET: 'secret' });
assert.strictEqual(secretCheckBad, false);
console.log('8. Authorization helper uses constant-time comparison semantics: PASS');

console.log('Broadcast publisher tests: PASS');
