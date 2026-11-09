import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The app used to prove who it was with a lead id and an email address in the request body. Neither
 * is a secret, so these tests hold the replacement in place: a signed session token in an
 * Authorization header, checked in one place (src/server/appAuth.ts).
 *
 * They read the source rather than call it, because what matters is that no route anywhere drifts
 * back to the old check — a passing route test on thirteen routes would say nothing about a
 * fourteenth.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const APP_API = 'src/app/api/app';
const routes = readdirSync(join(root, APP_API), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

/** Routes that are meant to answer without a session, and why. */
const PUBLIC_ROUTES: Record<string, string> = {
  event: 'anonymous screen counts, no person attached',
  invite: 'the person opening an invite link has no chart of their own',
  'place-check': 'looking up a birth city happens during onboarding, before a chart exists',
  preview: 'the first-launch preview is built from a birth date and saves nothing',
};

test('app auth: there are routes to check', () => {
  assert.ok(routes.length >= 14, `found ${routes.length} app routes`);
});

/**
 * /api/app/email stores an address on the token's own lead, because the app shows a chart before
 * it asks for one. It is the only route allowed to read an address from a body, and in exchange it
 * is held to a stricter rule below: it may not look a lead up by one.
 */
const STORES_AN_EMAIL = new Set(['email']);

test('app auth: no app route pairs a lead id with an email address any more', () => {
  for (const name of routes) {
    const src = read(`${APP_API}/${name}/route.ts`);
    assert.ok(!/lead\.email\.toLowerCase\(\)\.trim\(\) !== email/.test(src), `${name} still compares a body email`);
    assert.ok(!/leads\.id, leadId/.test(src), `${name} still looks a lead up by a body leadId`);
    assert.ok(!/body\.leadId/.test(src), `${name} still reads a leadId from the body`);
    if (STORES_AN_EMAIL.has(name)) continue;
    assert.ok(!/body\.email/.test(src), `${name} still reads an email from the body`);
  }
});

test('app auth: an address is still never a way in', () => {
  // The whole point of the token is that no request trades an address for a chart. Moving the
  // collection after the reveal must not have reopened that: the one route that takes an address
  // writes it against the token's lead id and never selects by it.
  for (const name of routes) {
    const src = read(`${APP_API}/${name}/route.ts`);
    if (!/body\.email/.test(src)) continue;
    assert.ok(STORES_AN_EMAIL.has(name), `${name} reads a body email but is not allowed to`);
    assert.ok(!/eq\(leads\.email/.test(src), `${name} looks a lead up by an address from the body`);
    assert.match(src, /const auth = await authenticateApp\(request\);/, `${name} does not check the session`);
  }
});

test('app auth: every route that reads a lead goes through authenticateApp', () => {
  for (const name of routes) {
    const src = read(`${APP_API}/${name}/route.ts`);
    const readsALead = /from\(leads\)|auth\.lead/.test(src);
    if (!readsALead) continue;
    if (name in PUBLIC_ROUTES) {
      // A public route may still reach a lead (the invite's sender), but never as the caller's own.
      assert.ok(!/const lead = auth\.lead/.test(src) || /authenticateApp/.test(src), name);
      continue;
    }
    assert.match(src, /import \{ authenticateApp \} from '@\/server\/appAuth'/, `${name} does not import authenticateApp`);
    assert.match(src, /const auth = await authenticateApp\(request\);\n\s*if \(!auth\.ok\) return auth\.response;/, `${name} does not check the session`);
  }
});

test('app auth: the invite route signs both of its own-chart paths', () => {
  const src = read(`${APP_API}/invite/route.ts`);
  // Making a link, and reading one against your own saved chart.
  assert.equal((src.match(/await authenticateApp\(request\)/g) ?? []).length, 2);
  assert.match(src, /if \(y\.saved === true\)/);
  assert.ok(!/y\.leadId/.test(src), 'the invite route still takes a leadId for the viewer');
});

test('app auth: every access failure answers with the same body, so nothing can be probed', () => {
  const src = read('src/server/appAuth.ts');
  // One response builder, used for every failure other than a missing secret.
  assert.equal((src.match(/return \{ ok: false, response: unauthorized\(\) \}/g) ?? []).length, 2);
  assert.match(src, /lead\.sessionEpoch !== check\.epoch/);
  assert.match(src, /reauth: true/);
  // A forged token is counted as a guess; an expired or revoked one is not.
  assert.match(src, /check\.reason === 'invalid' \|\| check\.reason === 'malformed'/);
});

test('app auth: a missing secret is a 503, not an access failure', () => {
  const src = read('src/server/appAuth.ts');
  assert.match(src, /status: 503/);
  assert.ok(!/UNCONFIGURED[\s\S]{0,120}reauth/.test(src), 'a 503 must not ask the app to sign in again');
});

test('app auth: only the calculation route mints a token, and only when asked', () => {
  const minting = ['src/app/api', 'src/server'].flatMap(function walk(dir): string[] {
    return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []);
  }).filter((p) => /\bmakeAppSessionToken\(/.test(read(p)));

  assert.deepEqual(minting.sort(), ['src/app/api/calculate-t3d/route.ts', 'src/server/appTokens.ts']);

  const src = read('src/app/api/calculate-t3d/route.ts');
  assert.match(src, /body\.wantSession === true \? makeAppSessionToken\(leadId, sessionEpoch\) : null/);
});

test('app auth: deleting your data ends every session for a lead that has to be kept', () => {
  const src = read(`${APP_API}/delete-data/route.ts`);
  assert.match(src, /sessionEpoch: sql`\$\{leads\.sessionEpoch\} \+ 1`/);
  assert.match(read('src/server/db/schema.ts'), /sessionEpoch: integer\('session_epoch'\)\.default\(1\)\.notNull\(\)/);
});

/** The file with its comments taken out, so prose about a rule does not read as a breach of it. */
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('app auth: the app keeps its token in the keychain, never in ordinary saved data', () => {
  const src = read('mobile/src/lib/session.ts');
  assert.match(src, /from 'expo-secure-store'/);
  assert.match(src, /WHEN_UNLOCKED_THIS_DEVICE_ONLY/);
  assert.ok(!/AsyncStorage/.test(code('mobile/src/lib/session.ts')), 'the session token must not touch AsyncStorage');
  // Nothing here may log the token.
  assert.ok(!/console\./.test(src), 'session.ts must not log');
});

test('app auth: the app sends the token on every signed request, and retries once', () => {
  const src = read('mobile/src/lib/api.ts');
  assert.match(src, /\.\.\.\(signed \? await authHeader\(\) : \{\}\)/);
  // One retry on reauth, not a loop.
  assert.match(src, /reply\.reauth === true && \(await signIn\(\)\)/);
  assert.equal((src.match(/await send<T>\(path, body, true\)/g) ?? []).length, 2);
  // Several screens loading at once share one sign-in instead of each spending a recalculation.
  assert.match(src, /if \(!signingIn\)/);
});

test('app auth: no signed app request carries an email address', () => {
  const src = code('mobile/src/lib/api.ts');
  const calls = src.split(/\bpostApp\b/).slice(1);
  assert.ok(calls.length >= 14, `found ${calls.length} signed requests`);
  for (const call of calls) {
    const args = call.slice(0, call.indexOf(');'));
    assert.ok(!/\bemail\b/.test(args), `a signed request carries an email address: ${args.slice(0, 90)}`);
  }
});

test('app auth: an email address is sent only to write the lead and to verify the address', () => {
  const src = code('mobile/src/lib/api.ts');
  const paths = [...src.matchAll(/'(\/api\/[^']+)'/g)].map((m) => m[1]);
  const withEmail = paths.filter((path) => {
    const at = src.indexOf(`'${path}'`);
    return /\bemail\b/.test(src.slice(at, src.indexOf(');', at)));
  });
  assert.deepEqual([...new Set(withEmail)].sort(), ['/api/email-optin/confirm', '/api/email-optin/send']);
  // The chart itself is written with a hand-rolled fetch, which is the one other place.
  assert.match(src, /api\/calculate-t3d[\s\S]{0,900}email: profile\.email\.trim\(\)/);
});

test('app auth: no screen or component handles a credential', () => {
  const dirs = ['mobile/src/app', 'mobile/src/components'];
  const files = dirs.flatMap(function walk(dir): string[] {
    return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : /\.tsx?$/.test(e.name) ? [`${dir}/${e.name}`] : []);
  });
  assert.ok(files.length > 50, `found only ${files.length} files`);

  for (const p of files) {
    const src = read(p);
    // Onboarding builds the lead, so it does hold an email; nothing else passes one to a request.
    if (p.endsWith('mobile/src/app/onboarding.tsx')) continue;
    assert.ok(
      !/request[A-Za-z]*\([^)]*profile[?]?\.email/.test(src),
      `${p} passes an email address into a request`,
    );
    assert.ok(
      !/request[A-Za-z]*\(\s*chart[?]?\.leadId\s*,/.test(src),
      `${p} passes a lead id into a request as a credential`,
    );
  }
});

test('app auth: the rate-limit bucket for bad credentials still exists', () => {
  assert.match(read('src/server/rateLimitCore.ts'), /authFail: \{ limit: \d+, windowSec: /);
  assert.match(read('src/server/appAuth.ts'), /noteAccessFailure/);
});
