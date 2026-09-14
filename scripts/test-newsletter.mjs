// Deterministic tests for the Kit V4-backed newsletter signup. No real network calls.
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { isValidEmail, isValidSource, getKitConfig, subscribeToKit, createFixedWindowRateLimiter, handleNewsletterSubscribe, NEWSLETTER_SOURCES } from '../lib/newsletter.ts';

console.log('--- Running NeuralDrift Newsletter Unit Tests ---');

assert.strictEqual(isValidEmail('person@example.com'), true);
assert.strictEqual(isValidEmail('not-an-email'), false);
assert.strictEqual(isValidEmail(''), false);
assert.strictEqual(isValidEmail(undefined), false);
assert.strictEqual(isValidEmail(`${'a'.repeat(260)}@example.com`), false);
console.log('1. Email validation: PASS');

assert.strictEqual(isValidSource('homepage'), true);
assert.strictEqual(isValidSource('not_a_real_source'), false);
for (const source of NEWSLETTER_SOURCES) assert.strictEqual(isValidSource(source), true);
console.log('2. Source validation: PASS');

assert.strictEqual(getKitConfig({}), null);
assert.strictEqual(getKitConfig({ KIT_API_KEY: 'key', KIT_FORM_ID: '9914909' }), null);
assert.strictEqual(getKitConfig({ NEXT_PUBLIC_NEWSLETTER_PROVIDER: 'beehiiv', KIT_API_KEY: 'key', KIT_FORM_ID: '9914909' }), null);
assert.strictEqual(getKitConfig({ NEXT_PUBLIC_NEWSLETTER_PROVIDER: 'kit', KIT_API_KEY: 'key', KIT_FORM_ID: 'not-numeric' }), null);
const config = getKitConfig({ NEXT_PUBLIC_NEWSLETTER_PROVIDER: 'kit', KIT_API_KEY: 'key', KIT_FORM_ID: '9914909' });
assert.deepStrictEqual(config, { apiKey: 'key', formId: '9914909' });
console.log('3. Kit configuration: PASS');

// Sequenced mock: each entry is {status, body?}. A 2xx entry defaults to a valid
// subscriber payload so step 2 always has an id to work with unless a test overrides it.
function sequencedFetch(...responses) {
  const calls = [];
  const fn = async (url, init) => {
    const spec = responses[calls.length] ?? responses[responses.length - 1];
    calls.push({ url, init });
    const body = spec.body ?? (spec.status >= 200 && spec.status < 300 ? { subscriber: { id: 42 } } : {});
    return new Response(JSON.stringify(body), { status: spec.status });
  };
  fn.calls = calls;
  return fn;
}

// New subscriber: create returns 201 with an id, then that id is used to join the form.
const freshFetch = sequencedFetch({ status: 201, body: { subscriber: { id: 7 } } }, { status: 201 });
assert.strictEqual(await subscribeToKit({ email: 'person@example.com', source: 'homepage', referringSite: 'https://neuraldrift.io/' }, config, freshFetch), 'subscribed');
assert.strictEqual(freshFetch.calls.length, 2, 'Kit requires subscriber upsert then form assignment');
assert.strictEqual(freshFetch.calls[0].url, 'https://api.kit.com/v4/subscribers');
assert.strictEqual(freshFetch.calls[1].url, 'https://api.kit.com/v4/forms/9914909/subscribers/7', 'form assignment must use the subscriber id from step 1 in the path, not the email');
for (const call of freshFetch.calls) {
  assert.strictEqual(call.init.method, 'POST');
  assert.strictEqual(call.init.headers['X-Kit-Api-Key'], 'key');
  assert.strictEqual(call.init.headers.authorization, undefined);
}
assert.deepStrictEqual(JSON.parse(freshFetch.calls[0].init.body), { email_address: 'person@example.com' });
assert.deepStrictEqual(JSON.parse(freshFetch.calls[1].init.body), { referrer: 'https://neuraldrift.io/' }, 'step 2 body must not need the email once the id is in the URL');
console.log('4. Kit V4 two-step request shape (create, then form-assign by id): PASS');

// Existing subscriber: Kit's upsert still returns 200 (not 201) with the existing id.
const existingFetch = sequencedFetch({ status: 200, body: { subscriber: { id: 99 } } }, { status: 200 });
assert.strictEqual(await subscribeToKit({ email: 'returning@example.com', source: 'homepage' }, config, existingFetch), 'subscribed');
assert.strictEqual(existingFetch.calls[1].url, 'https://api.kit.com/v4/forms/9914909/subscribers/99');
console.log('5. Existing subscriber upsert is idempotent and still succeeds: PASS');

// Already on the form: re-adding the same subscriber id is treated the same as success.
const alreadyOnFormFetch = sequencedFetch({ status: 200, body: { subscriber: { id: 99 } } }, { status: 200 });
assert.strictEqual(await subscribeToKit({ email: 'returning@example.com', source: 'homepage' }, config, alreadyOnFormFetch), 'subscribed');
console.log('6. Already-on-the-form re-add still succeeds: PASS');

// Subscriber creation failure must prevent the form call entirely.
for (const status of [401, 404, 422, 429, 500]) {
  const failFetch = sequencedFetch({ status });
  const outcome = await subscribeToKit({ email: 'a@b.com', source: 'homepage' }, config, failFetch);
  assert.strictEqual(failFetch.calls.length, 1, `status ${status} on step 1 must not trigger a step 2 call`);
  if (status === 422) assert.strictEqual(outcome, 'invalid');
  else if (status === 429) assert.strictEqual(outcome, 'rate_limited');
  else assert.strictEqual(outcome, 'provider_error');
}
console.log('7. Subscriber creation failure (401/404/422/429/5xx) prevents the form call: PASS');

// A create response with no usable subscriber id must not be treated as success.
const noIdFetch = sequencedFetch({ status: 201, body: { subscriber: {} } });
assert.strictEqual(await subscribeToKit({ email: 'a@b.com', source: 'homepage' }, config, noIdFetch), 'provider_error');
assert.strictEqual(noIdFetch.calls.length, 1);
console.log('8. Missing subscriber id in the create response is a failure, not a false success: PASS');

// Subscriber creation succeeds but form assignment fails — the overall signup must fail.
for (const status of [401, 404, 422, 429, 500]) {
  const partialFetch = sequencedFetch({ status: 201, body: { subscriber: { id: 7 } } }, { status });
  const outcome = await subscribeToKit({ email: 'a@b.com', source: 'homepage' }, config, partialFetch);
  assert.strictEqual(partialFetch.calls.length, 2);
  if (status === 422) assert.strictEqual(outcome, 'invalid');
  else if (status === 429) assert.strictEqual(outcome, 'rate_limited');
  else assert.strictEqual(outcome, 'provider_error');
}
console.log('9. Form assignment failure (401/404/422/429/5xx) fails the signup even after a successful create: PASS');

assert.strictEqual(await subscribeToKit({ email: 'a@b.com', source: 'homepage' }, config, async () => { throw new Error('network down'); }), 'provider_error');
console.log('10. Network failure handled: PASS');

const limiter = createFixedWindowRateLimiter(2, 60_000);
assert.strictEqual(limiter.check('1.2.3.4'), true);
assert.strictEqual(limiter.check('1.2.3.4'), true);
assert.strictEqual(limiter.check('1.2.3.4'), false);
assert.strictEqual(limiter.check('5.6.7.8'), true);
console.log('11. Local rate limiter: PASS');

const savedEnv = Object.fromEntries(['KIT_API_KEY', 'KIT_FORM_ID', 'NEXT_PUBLIC_NEWSLETTER_PROVIDER'].map(key => [key, process.env[key]]));
const realFetch = globalThis.fetch;
let ipCounter = 0;
async function callRoute(body, extraHeaders = {}) {
  ipCounter += 1;
  return handleNewsletterSubscribe(JSON.stringify(body), new Headers({ 'x-forwarded-for': `10.0.0.${ipCounter}`, ...extraHeaders }));
}
for (const key of Object.keys(savedEnv)) delete process.env[key];
for (const body of [{ source: 'homepage' }, { email: 'not-an-email', source: 'homepage' }, { email: 'person@example.com', source: 'not_a_real_page' }, { email: 'person@example.com', source: 'homepage', padding: 'x'.repeat(5000) }]) {
  const result = await callRoute(body);
  assert.strictEqual(result.status, 400);
  assert.strictEqual(result.body.error, 'invalid_request');
}
console.log('12. Invalid inputs and oversized bodies: PASS');

let disabledCalls = 0;
globalThis.fetch = async () => { disabledCalls += 1; return new Response('{}', { status: 201 }); };
let result = await callRoute({ email: 'person@example.com', source: 'homepage' });
assert.strictEqual(result.status, 503);
assert.strictEqual(result.body.error, 'unavailable');
assert.strictEqual(disabledCalls, 0);
console.log('13. Truthful disabled state: PASS');

process.env.KIT_API_KEY = 'test_key';
process.env.KIT_FORM_ID = '9914909';
process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER = 'kit';
globalThis.fetch = sequencedFetch({ status: 201, body: { subscriber: { id: 7 } } }, { status: 201 });
result = await callRoute({ email: 'person@example.com', source: 'workflow_detail' });
assert.strictEqual(result.status, 200);
assert.strictEqual(result.body.ok, true);
console.log('14. Confirmed Kit success end-to-end through the route (both steps): PASS');

for (const [responses, expectedStatus, expectedError] of [
  [[{ status: 401 }], 502, 'provider_error'],
  [[{ status: 400 }], 400, 'invalid_request'],
  [[{ status: 429 }], 429, 'rate_limited'],
  [[{ status: 201, body: { subscriber: { id: 7 } } }, { status: 500 }], 502, 'provider_error'],
  [[{ status: 201, body: { subscriber: { id: 7 } } }, { status: 404 }], 502, 'provider_error'],
]) {
  globalThis.fetch = sequencedFetch(...responses);
  result = await callRoute({ email: 'person@example.com', source: 'homepage' });
  assert.strictEqual(result.status, expectedStatus);
  assert.strictEqual(result.body.error, expectedError);
  assert(!JSON.stringify(result.body).includes('Kit'));
}
console.log('15. Kit auth, invalid, rate-limit, and both-step server failures through the route: PASS');

let providerCalls = 0;
globalThis.fetch = async () => { providerCalls += 1; return new Response('{}', { status: 201 }); };
const sameIpHeaders = new Headers({ 'x-forwarded-for': '203.0.113.9' });
for (let i = 0; i < 7; i += 1) await handleNewsletterSubscribe(JSON.stringify({ email: 'person@example.com', source: 'homepage' }), sameIpHeaders);
assert(providerCalls <= 10, 'the five locally allowed requests may each make two Kit V4 calls');
let honeypotCalled = false;
globalThis.fetch = async () => { honeypotCalled = true; return new Response('{}', { status: 201 }); };
result = await callRoute({ email: 'bot@example.com', source: 'homepage', company: 'Bot Co' });
assert.strictEqual(result.status, 200);
assert.strictEqual(honeypotCalled, false);
console.log('16. Local throttling and honeypot: PASS');

globalThis.fetch = realFetch;
for (const [key, value] of Object.entries(savedEnv)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
const componentSource = readFileSync(new URL('../components/newsletter/NewsletterSignup.tsx', import.meta.url), 'utf8');
const signupEvent = [...componentSource.matchAll(/trackEvent\(ANALYTICS_EVENTS\.newsletterSignup,\s*\{[^}]*\}/g)];
assert.strictEqual(signupEvent.length, 1);
assert(componentSource.indexOf('setStatus("success")') < componentSource.indexOf(signupEvent[0][0]));
assert(!signupEvent[0][0].includes('email'));
const attempts = [...componentSource.matchAll(/trackEvent\(ANALYTICS_EVENTS\.newsletterSignupAttempt,\s*\{[^}]*\}/g)];
assert(attempts.length >= 1 && !attempts[0][0].includes('email'));
assert(componentSource.includes('NEXT_PUBLIC_NEWSLETTER_PROVIDER === "kit"'));
assert(!componentSource.includes('KIT_API_KEY'));
const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
assert(envExample.includes('KIT_API_KEY='));
assert(envExample.includes('KIT_FORM_ID=9914909'));
assert(!/BEEHIIV|beehiiv|NEWSLETTER_API_KEY|NEXT_PUBLIC_NEWSLETTER_ENDPOINT/.test(envExample));
assert(!/NEXT_PUBLIC_.*KIT_API_KEY/.test(envExample));
assert(componentSource.includes('Newsletter launching soon'));
const privacySource = readFileSync(new URL('../app/(marketing)/privacy/page.tsx', import.meta.url), 'utf8');
assert(privacySource.includes('Kit, our newsletter provider'));
assert(privacySource.includes('newsletter delivery'));
assert(privacySource.includes('email\r\n              address is never included') || privacySource.includes('email\n              address is never included'));
assert(!privacySource.includes('Beehiiv'));
console.log('17. Analytics, client secrecy, config, privacy disclosure, and disabled UI: PASS');

console.log('\n--- ALL NEWSLETTER TESTS PASSED ---');
