/**
 * Guards the access rule on every /api/app route that reads a saved chart:
 * leadId must pair with the lead's email, a wrong id and a wrong email must get
 * the identical 404, and each failure must be counted for guess-blocking.
 *
 * These read the route source on purpose. They fail if someone adds or edits a
 * route and drops one of the rules.
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

test('the app routes exist', () => assert.ok(routes.length >= 14));

test('every app route is rate limited', () => {
  for (const r of routes) assert.match(r.src, /limitRequest\(request, '(app|place|preview|event)'\)/, r.name);
});

test('every chart route pairs the lead id with the email', () => {
  for (const r of chartRoutes) {
    assert.match(r.src, /eq\(leads\.id, leadId\)/, `${r.name}: looks up by id`);
    assert.match(r.src, /lead\.email\.toLowerCase\(\)\.trim\(\) !== email/, `${r.name}: checks email`);
    assert.match(r.src, /Number\.isInteger\(leadId\)/, `${r.name}: validates id`);
  }
});

test('wrong id and wrong email share one 404 and both count as a failed guess', () => {
  for (const r of chartRoutes) {
    assert.match(r.src, /if \(!lead \|\| lead\.email[^)]*\)[^{]*\{\s*await noteAccessFailure\(request\);\s*return NextResponse\.json\(NOT_FOUND, \{ status: 404 \}\);/, r.name);
  }
});

test('the not-found message is identical across routes and reveals nothing', () => {
  const msgs = new Set(chartRoutes.map((r) => /const NOT_FOUND = (\{[^;]+\});/.exec(r.src)?.[1]));
  assert.equal(msgs.size, 1);
  const only = [...msgs][0]!;
  assert.ok(!/email|id /i.test(only.replace('We could not find that chart. Please recalculate it.', '')));
});

test('no chart data is read before the access check', () => {
  for (const r of chartRoutes) {
    const check = r.src.indexOf('lead.email.toLowerCase()');
    const useOfResults = r.src.indexOf('lead.results');
    assert.ok(check > -1, r.name);
    if (useOfResults > -1) assert.ok(useOfResults > check, `${r.name}: results read after the check`);
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

test('the invite route pairs a viewer\'s lead id with their email, and never sends the sender\'s birth details back', () => {
  const src = routes.find((r) => r.name === 'invite')!.src;
  assert.match(src, /viewer\.email\.toLowerCase\(\)\.trim\(\) !== viewerEmail/);
  assert.match(src, /lead\.email\.toLowerCase\(\)\.trim\(\) !== email/);
  const preview = src.slice(src.indexOf("body.action === 'preview'"), src.indexOf('// ---- together ----'));
  assert.doesNotMatch(preview, /birth|latitude|longitude|timezone|email/i);
  assert.match(src, /isUnderMinimumAge\(y\.birthDate\)/, 'refuses a first look for an under-age birth date');
});
