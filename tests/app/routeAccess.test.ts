/**
 * Guards the access rule on every /api/app route that reads a saved chart: the caller must carry a
 * signed session token, the check must happen before anything else in the route, and every way of
 * failing it must look the same from outside.
 *
 * The check itself lives in src/server/appAuth.ts and is tested in tests/security/appAuth.test.ts.
 * What these tests hold in place is that every route actually uses it, and uses it first.
 *
 * These read the route source on purpose. They fail if someone adds or edits a route and drops one
 * of the rules.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src/app/api/app');
const PUBLIC_ROUTES = new Set(['place-check', 'preview', 'event']); // take no lead id; rate limited only
const TOKEN_ROUTES = new Set(['invite']); // open with a signed invite token; checked by their own tests below
const routes = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, 'route.ts')))
  .map((d) => ({ name: d.name, src: readFileSync(join(ROOT, d.name, 'route.ts'), 'utf8') }));
const chartRoutes = routes.filter((r) => !PUBLIC_ROUTES.has(r.name) && !TOKEN_ROUTES.has(r.name));

/**
 * The rule is that nothing in the body may identify the caller, and `body.email` was banned
 * outright as the readable way to enforce it. One route now has a reason to read an address
 * from a body: /api/app/email stores one on a lead that has none, because the app shows a
 * chart before it asks. Identity there still comes from the session token alone.
 *
 * So the ban is lifted for that route by name and replaced with a narrower, stricter pair of
 * checks: it may not look a lead up by an address, and it must write to the token's own lead.
 * Any other route reading a body email still fails outright.
 */
const STORES_AN_EMAIL = new Set(['email']);

test('the app routes exist', () => assert.ok(routes.length >= 14));

test('every app route is rate limited', () => {
  for (const r of routes) assert.match(r.src, /limitRequest\(request, '(app|place|preview|event)'\)/, r.name);
});

test('every chart route checks the session token, and nothing else identifies the caller', () => {
  for (const r of chartRoutes) {
    assert.match(r.src, /import \{ authenticateApp \} from '@\/server\/appAuth'/, `${r.name}: imports the check`);
    assert.match(r.src, /const auth = await authenticateApp\(request\);/, `${r.name}: runs the check`);
    // A lead id in a body can only ever be a credential, so it is banned everywhere.
    assert.doesNotMatch(r.src, /body\.leadId/, `${r.name}: still takes a lead id from the body`);

    if (STORES_AN_EMAIL.has(r.name)) {
      assert.doesNotMatch(r.src, /eq\(leads\.email/, `${r.name}: looks a lead up by an address from the body`);
      assert.match(r.src, /eq\(leads\.id, lead\.id\)/, `${r.name}: does not write to the token's own lead`);
      continue;
    }
    assert.doesNotMatch(r.src, /body\.email/, `${r.name}: still takes a credential from the body`);
  }
});

test('the route that stores an address attaches one rather than replacing one', () => {
  const src = routes.find((r) => r.name === 'email')?.src ?? '';
  assert.ok(src, 'there is no /api/app/email route');
  // The same address again is a retry and answers the same way; a different one is refused,
  // because changing an address would move the chart out from under the dedupe rule.
  assert.match(src, /lead\.email && lead\.email\.toLowerCase\(\) === email/);
  assert.match(src, /status: 409/);
  // Consent is still only recorded when the code comes back, so the box only sends it.
  assert.match(src, /issueOptInCode\(lead\.id, email\)/);
});

test('the session check is the first thing every chart route does', () => {
  for (const r of chartRoutes) {
    const auth = r.src.indexOf('await authenticateApp(request)');
    const body = r.src.indexOf('await request.json()');
    assert.ok(auth > -1, r.name);
    // An unauthenticated caller never gets as far as having their body parsed.
    if (body > -1) assert.ok(auth < body, `${r.name}: parses the body before checking the session`);
  }
});

test('every route hands back the access check\'s own answer, unchanged', () => {
  for (const r of chartRoutes) {
    assert.match(r.src, /if \(!auth\.ok\) return auth\.response;/, r.name);
  }
});

test('one shared answer covers every way of failing, and it counts forged tokens as guesses', () => {
  const auth = readFileSync(join(process.cwd(), 'src/server/appAuth.ts'), 'utf8');
  // No token, a forged one, an expired one, a revoked one and a lead that is gone are one response.
  assert.equal((auth.match(/response: unauthorized\(\)/g) ?? []).length, 2);
  assert.match(auth, /lead\.sessionEpoch !== check\.epoch/);
  assert.match(auth, /await noteAccessFailure\(request\)/);
});

test('there is one access-failure message, in one place, and it reveals nothing', () => {
  for (const r of chartRoutes) {
    assert.doesNotMatch(r.src, /const NOT_FOUND =/, `${r.name}: keeps its own access-failure message`);
  }
  const auth = readFileSync(join(process.cwd(), 'src/server/appAuth.ts'), 'utf8');
  const message = /error: '([^']+)'/.exec(auth)?.[1];
  assert.ok(message, 'appAuth states a message');
  assert.doesNotMatch(message!, /email|lead|id\b|token/i, 'the message names nothing about the account');
});

test('no chart data is read before the access check', () => {
  for (const r of chartRoutes) {
    const check = r.src.indexOf('if (!auth.ok) return auth.response;');
    assert.ok(check > -1, r.name);
    for (const field of ['lead.results', 'lead.birthData', 'lead.firstName', 'lead.middleName', 'lead.lastName']) {
      const use = r.src.indexOf(field);
      if (use > -1) assert.ok(use > check, `${r.name}: ${field} read before the check`);
    }
  }
});

test('no route logs the person\'s details', () => {
  for (const r of routes) {
    assert.doesNotMatch(r.src, /console\.(log|info|debug)\([^)]*(email|body|birth|lead)/i, r.name);
  }
});

test('decide-together stores no partner details', () => {
  const src = routes.find((r) => r.name === 'decide-together')!.src;
  assert.doesNotMatch(src, /\.insert\(|\.update\(/);
});

test('the first-launch preview saves nothing, logs nothing and enforces the age rule', () => {
  const src = routes.find((r) => r.name === 'preview')!.src;
  assert.doesNotMatch(src, /@\/server\/db|\.insert\(|\.update\(|console\./);
  assert.match(src, /isUnderMinimumAge\(birthDate\)/);
});

test('the invite route checks the signed token before it reads anyone\'s chart', () => {
  const src = routes.find((r) => r.name === 'invite')!.src;
  const token = src.indexOf('checkInviteToken(body.token)');
  assert.ok(token > -1, 'checks the token');
  assert.ok(src.indexOf('loadLead(check.leadId)') > token, 'loads the sender only after the token check');
  assert.match(src, /if \(check\.reason === 'invalid'\) await noteAccessFailure\(request\)/, 'a forged token counts as a failed guess');
});

test('the invite route reads a viewer\'s own chart only on their session token, and never sends the sender\'s birth details back', () => {
  const src = routes.find((r) => r.name === 'invite')!.src;
  // "Use my saved chart" asks for nothing in the body; it is granted by the token or not at all.
  assert.match(src, /if \(y\.saved === true\) \{[\s\S]{0,160}await authenticateApp\(request\)/);
  assert.doesNotMatch(src, /y\.leadId|y\.email/, 'the viewer is still named in the body');
  // Making a link needs the sender's own session.
  assert.match(src, /body\.action === 'create'\) \{\s*const auth = await authenticateApp\(request\);/);
  const preview = src.slice(src.indexOf("body.action === 'preview'"), src.indexOf('// ---- together ----'));
  assert.doesNotMatch(preview, /birth|latitude|longitude|timezone|email/i);
  assert.match(src, /isUnderMinimumAge\(y\.birthDate\)/, 'refuses a first look for an under-age birth date');
});
