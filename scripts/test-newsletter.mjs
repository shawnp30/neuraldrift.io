// scripts/test-newsletter.mjs
// Deterministic tests for the Beehiiv-backed newsletter signup. No real network calls —
// Beehiiv's API is always reached through a mocked fetch.

import assert from 'assert';
import { readFileSync } from 'node:fs';
import {
  isValidEmail,
  isValidSource,
  getBeehiivConfig,
  subscribeToBeehiiv,
  createFixedWindowRateLimiter,
  handleNewsletterSubscribe,
  NEWSLETTER_SOURCES,
} from '../lib/newsletter.ts';

console.log('--- Running NeuralDrift Newsletter Unit Tests ---');

// 1. Email validation
assert.strictEqual(isValidEmail('person@example.com'), true, 'valid email should pass');
assert.strictEqual(isValidEmail('not-an-email'), false, 'missing @ should fail');
assert.strictEqual(isValidEmail(''), false, 'empty string should fail');
assert.strictEqual(isValidEmail(undefined), false, 'missing email should fail');
assert.strictEqual(isValidEmail(`${'a'.repeat(260)}@example.com`), false, 'overlong email should fail');
console.log('1. Email validation: PASS');

// 2. Source validation
assert.strictEqual(isValidSource('homepage'), true);
assert.strictEqual(isValidSource('not_a_real_source'), false);
assert.strictEqual(isValidSource(undefined), false);
for (const s of NEWSLETTER_SOURCES) assert.strictEqual(isValidSource(s), true, `${s} should be a valid source`);
console.log('2. Source validation: PASS');

// 3. Provider-disabled state resolution
assert.strictEqual(getBeehiivConfig({}), null, 'missing creds must disable the provider');
assert.strictEqual(getBeehiivConfig({ BEEHIIV_API_KEY: 'key' }), null, 'publication id alone is not enough');
const config = getBeehiivConfig({ BEEHIIV_API_KEY: 'key', BEEHIIV_PUBLICATION_ID: 'pub_1', BEEHIIV_NEWSLETTER_LIST_ID: 'list_1' });
assert.deepStrictEqual(config, { apiKey: 'key', publicationId: 'pub_1', listId: 'list_1' });
console.log('3. Provider config resolution: PASS');

// 4. Successful subscription request shape (mocked fetch — never touches the real Beehiiv API)
let lastRequest;
const okFetch = async (url, init) => {
  lastRequest = { url, init };
  return new Response(JSON.stringify({ data: { id: 'sub_123' } }), { status: 201 });
};
const outcomeOk = await subscribeToBeehiiv({ email: 'person@example.com', source: 'homepage' }, config, okFetch);
assert.strictEqual(outcomeOk, 'subscribed');
assert(lastRequest.url.includes('/publications/pub_1/subscriptions'), 'must call the configured publication');
assert.strictEqual(lastRequest.init.headers.authorization, 'Bearer key', 'must authenticate with the server-side key');
const sentBody = JSON.parse(lastRequest.init.body);
assert.strictEqual(sentBody.email, 'person@example.com');
assert.strictEqual(sentBody.reactivate_existing, false);
assert.strictEqual(sentBody.send_welcome_email, false);
assert.strictEqual(sentBody.double_opt_override, undefined, 'must not force double opt-in off');
assert.deepStrictEqual(sentBody.newsletter_list_ids, ['list_1'], 'must add to the list in the same request');
console.log('4. Successful subscription request shape: PASS');

// 5. Beehiiv failure / rate-limit mapping
const withStatus = (status) => async () => new Response('{}', { status });
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(400)), 'invalid');
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(422)), 'invalid');
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(401)), 'provider_error');
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(404)), 'provider_error');
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(500)), 'provider_error');
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, withStatus(429)), 'rate_limited');
const throwingFetch = async () => { throw new Error('network down'); };
assert.strictEqual(await subscribeToBeehiiv({ email: 'a@b.com', source: 'homepage' }, config, throwingFetch), 'provider_error');
console.log('5. Beehiiv failure/rate-limit mapping: PASS');

// 6. Local rate limiter
const limiter = createFixedWindowRateLimiter(2, 60_000);
assert.strictEqual(limiter.check('1.2.3.4'), true);
assert.strictEqual(limiter.check('1.2.3.4'), true);
assert.strictEqual(limiter.check('1.2.3.4'), false, 'third request within the window must be blocked');
assert.strictEqual(limiter.check('5.6.7.8'), true, 'a different key must not be affected');
console.log('6. Rate limiter: PASS');

// --- Route handler tests (handleNewsletterSubscribe — the framework-agnostic core
// that app/api/newsletter/subscribe/route.ts adapts to NextRequest/NextResponse) ---
let ipCounter = 0;
async function callRoute(bodyObj, extraHeaders = {}) {
  ipCounter += 1;
  const headers = new Headers({ 'x-forwarded-for': `10.0.0.${ipCounter}`, ...extraHeaders });
  const { status, body: json } = await handleNewsletterSubscribe(JSON.stringify(bodyObj), headers);
  return { status, json };
}

const originalApiKey = process.env.BEEHIIV_API_KEY;
const originalPubId = process.env.BEEHIIV_PUBLICATION_ID;
delete process.env.BEEHIIV_API_KEY;
delete process.env.BEEHIIV_PUBLICATION_ID;

// 7. Missing / invalid email rejected
{
  const { status, json } = await callRoute({ source: 'homepage' });
  assert.strictEqual(status, 400);
  assert.strictEqual(json.error, 'invalid_request');
}
{
  const { status, json } = await callRoute({ email: 'not-an-email', source: 'homepage' });
  assert.strictEqual(status, 400);
  assert.strictEqual(json.error, 'invalid_request');
}
console.log('7. Missing/invalid email rejected: PASS');

// 8. Provider-disabled state — existing UI must not be told signup succeeded
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'homepage' });
  assert.strictEqual(status, 503);
  assert.strictEqual(json.ok, false);
  assert.strictEqual(json.error, 'unavailable');
}
console.log('8. Provider-disabled state returns unavailable, never fakes success: PASS');

process.env.BEEHIIV_API_KEY = 'test_key';
process.env.BEEHIIV_PUBLICATION_ID = 'test_pub';

const realFetch = globalThis.fetch;

// 9. Successful Beehiiv response end-to-end through the route
globalThis.fetch = async () => new Response(JSON.stringify({ data: { id: 'sub_1' } }), { status: 201 });
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'workflow_detail' });
  assert.strictEqual(status, 200);
  assert.strictEqual(json.ok, true);
}
console.log('9. Successful Beehiiv response: PASS');

// 10. Beehiiv failure surfaces as a safe, generic provider error
globalThis.fetch = async () => new Response('{}', { status: 500 });
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'homepage' });
  assert.strictEqual(status, 502);
  assert.strictEqual(json.ok, false);
  assert.strictEqual(json.error, 'provider_error');
  assert(!JSON.stringify(json).includes('500'), 'must not leak the raw provider status/error');
}
console.log('10. Beehiiv failure handled gracefully: PASS');

// 11. Beehiiv 429 passes through as our rate_limited error
globalThis.fetch = async () => new Response('{}', { status: 429 });
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'homepage' });
  assert.strictEqual(status, 429);
  assert.strictEqual(json.error, 'rate_limited');
}
console.log('11. Beehiiv 429 mapped to rate_limited: PASS');

// 12. Our own rate limiter trips before Beehiiv is ever called
{
  let beehiivCalls = 0;
  globalThis.fetch = async () => { beehiivCalls += 1; return new Response(JSON.stringify({ data: {} }), { status: 201 }); };
  const sameIpHeaders = new Headers({ 'x-forwarded-for': '203.0.113.9' });
  let sawRateLimited = false;
  for (let i = 0; i < 7; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { status } = await handleNewsletterSubscribe(JSON.stringify({ email: 'person@example.com', source: 'homepage' }), sameIpHeaders);
    if (status === 429) sawRateLimited = true;
  }
  assert.strictEqual(sawRateLimited, true, 'repeated requests from one IP must eventually be throttled');
  assert(beehiivCalls < 7, 'the throttled requests must not all reach Beehiiv');
}
console.log('12. Local rate limiting protects the Beehiiv call: PASS');

// 13. Honeypot: a filled hidden field is treated as a bot and never reaches Beehiiv
{
  let beehiivCalled = false;
  globalThis.fetch = async () => { beehiivCalled = true; return new Response(JSON.stringify({ data: {} }), { status: 201 }); };
  const { status, json } = await callRoute({ email: 'bot@example.com', source: 'homepage', company: 'Definitely A Real Company' });
  assert.strictEqual(status, 200);
  assert.strictEqual(json.ok, true);
  assert.strictEqual(beehiivCalled, false, 'honeypot submissions must not reach Beehiiv');
}
console.log('13. Honeypot rejection/ignore behavior: PASS');

// 14. Oversized body rejected
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'homepage', padding: 'x'.repeat(5000) });
  assert.strictEqual(status, 400);
  assert.strictEqual(json.error, 'invalid_request');
}
console.log('14. Oversized request body rejected: PASS');

// 15. Unknown source rejected
{
  const { status, json } = await callRoute({ email: 'person@example.com', source: 'not_a_real_page' });
  assert.strictEqual(status, 400);
  assert.strictEqual(json.error, 'invalid_request');
}
console.log('15. Source restricted to known values: PASS');

globalThis.fetch = realFetch;
if (originalApiKey === undefined) delete process.env.BEEHIIV_API_KEY; else process.env.BEEHIIV_API_KEY = originalApiKey;
if (originalPubId === undefined) delete process.env.BEEHIIV_PUBLICATION_ID; else process.env.BEEHIIV_PUBLICATION_ID = originalPubId;

// --- Static source checks for client-side invariants the repo has no DOM test harness for ---
const componentSource = readFileSync(new URL('../components/newsletter/NewsletterSignup.tsx', import.meta.url), 'utf8');

// 16. newsletter_signup only fires after a confirmed success, and never carries the email
const signupEventCalls = [...componentSource.matchAll(/trackEvent\(ANALYTICS_EVENTS\.newsletterSignup,\s*\{[^}]*\}/g)];
assert.strictEqual(signupEventCalls.length, 1, 'newsletter_signup should be fired from exactly one call site');
const signupCallIndex = componentSource.indexOf(signupEventCalls[0][0]);
const successStatusIndex = componentSource.indexOf('setStatus("success")');
assert(successStatusIndex !== -1 && successStatusIndex < signupCallIndex, 'newsletter_signup must fire after setStatus("success"), not before');
assert(!signupEventCalls[0][0].includes('email'), 'analytics properties must never include the email field');
const attemptEventCalls = [...componentSource.matchAll(/trackEvent\(ANALYTICS_EVENTS\.newsletterSignupAttempt,\s*\{[^}]*\}/g)];
assert(attemptEventCalls.length >= 1 && !attemptEventCalls[0][0].includes('email'), 'attempt event must never include the email field');
console.log('16. newsletter_signup fires only after success, and analytics carry no PII: PASS');

// 17. No secret env var is ever read from client-bundled code
assert(!componentSource.includes('BEEHIIV_API_KEY'), 'the client component must never reference the Beehiiv secret key');
assert(componentSource.includes('NEXT_PUBLIC_NEWSLETTER_PROVIDER'), 'the client must gate on the public provider flag, not a secret');
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
assert(!/NEXT_PUBLIC_.*BEEHIIV_API_KEY/.test(envExample), '.env.example must never mark the Beehiiv key as public');
console.log('17. No API key exposed client-side: PASS');

// 18. Existing UI still renders without credentials (the disabled-state copy is always reachable)
assert(componentSource.includes('!configured') && componentSource.includes('Newsletter launching soon'), 'component must keep a truthful disabled state when unconfigured');
console.log('18. Existing UI still renders without credentials: PASS');

console.log('\n--- ALL NEWSLETTER TESTS PASSED ---');
