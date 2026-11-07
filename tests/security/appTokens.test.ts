import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appSessionsConfigured, bearerToken, checkAppSessionToken, makeAppSessionToken } from '../../src/server/appTokens';
import { makeInviteToken } from '../../src/server/inviteLinks';

const NOW = Date.UTC(2026, 10, 7, 12, 0, 0);
const SECRET = 'test-secret-with-enough-length-1234567890';
const KEYS = ['APP_SESSION_SECRET', 'INVITE_LINK_SECRET', 'REPORT_LINK_SECRET', 'STRIPE_WEBHOOK_SECRET'] as const;

function withEnv<T>(env: Partial<Record<(typeof KEYS)[number], string>>, run: () => T): T {
  const saved = KEYS.map((k) => process.env[k]);
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, env);
  try {
    return run();
  } finally {
    KEYS.forEach((k, i) => { if (saved[i] === undefined) delete process.env[k]; else process.env[k] = saved[i]; });
  }
}

const headers = (value: string | null) => ({ get: (name: string) => (name === 'authorization' ? value : null) });

test('app session: a fresh token names its lead and session number', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    const t = makeAppSessionToken(42, 1, NOW)!;
    assert.deepEqual(checkAppSessionToken(t, NOW + 1000), { ok: true, leadId: 42, epoch: 1 });
  });
});

test('app session: changing the lead, the session number or the expiry breaks the signature', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    const [id, epoch, expiry, sig] = makeAppSessionToken(42, 3, NOW)!.split('.');
    const forged = [
      `43.${epoch}.${expiry}.${sig}`,                       // someone else's chart
      `${id}.4.${expiry}.${sig}`,                           // a session that was revoked
      `${id}.${epoch}.${Number(expiry) + 99_999}.${sig}`,   // a longer life than it was given
      `${id}.${epoch}.${expiry}.${'0'.repeat(64)}`,         // no signature at all
    ];
    for (const t of forged) {
      assert.deepEqual(checkAppSessionToken(t, NOW), { ok: false, reason: 'invalid' }, t);
    }
  });
});

test('app session: an expired token is refused, and is good up to the moment it expires', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    const t = makeAppSessionToken(42, 1, NOW, 60)!;
    assert.equal(checkAppSessionToken(t, NOW + 59_000).ok, true);
    assert.deepEqual(checkAppSessionToken(t, NOW + 61_000), { ok: false, reason: 'expired' });
  });
});

test('app session: junk is malformed and carries no lead', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    const junk = ['', 'abc', '1.2.3', '1.1.1', null, undefined, 42, {}, [],
                  `0.1.99999999999.${'a'.repeat(64)}`,   // lead 0 does not exist
                  `1.0.99999999999.${'a'.repeat(64)}`,   // session 0 does not exist
                  `1.1.99999999999.${'A'.repeat(64)}`,   // upper-case hex
                  `1.1.99999999999.${'a'.repeat(63)}`];  // one character short
    for (const t of junk) {
      assert.deepEqual(checkAppSessionToken(t, NOW), { ok: false, reason: 'malformed' }, String(t));
    }
  });
});

test('app session: out-of-range leads and session numbers mint nothing', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    for (const [leadId, epoch] of [[0, 1], [-1, 1], [1.5, 1], [1_000_000_000, 1], [1, 0], [1, -1], [1, 1.5]]) {
      assert.equal(makeAppSessionToken(leadId, epoch, NOW), null, `${leadId}/${epoch}`);
    }
  });
});

test('app session: with no secret nothing can be made or checked', () => {
  withEnv({}, () => {
    assert.equal(appSessionsConfigured(), false);
    assert.equal(makeAppSessionToken(1, 1, NOW), null);
    assert.deepEqual(checkAppSessionToken(`1.1.99999999999.${'a'.repeat(64)}`, NOW), { ok: false, reason: 'unconfigured' });
  });
});

test('app session: a report-link secret is enough on its own', () => {
  withEnv({ REPORT_LINK_SECRET: SECRET }, () => {
    assert.equal(appSessionsConfigured(), true);
    assert.equal(checkAppSessionToken(makeAppSessionToken(9, 1, NOW), NOW).ok, true);
  });
});

test('app session: a token made under one secret fails under another', () => {
  const t = withEnv({ APP_SESSION_SECRET: SECRET }, () => makeAppSessionToken(5, 1, NOW)!);
  assert.deepEqual(
    withEnv({ APP_SESSION_SECRET: `${SECRET}x` }, () => checkAppSessionToken(t, NOW)),
    { ok: false, reason: 'invalid' },
  );
});

test('app session: an invite token is not a session token, even on a shared secret', () => {
  // Both fall back to REPORT_LINK_SECRET, so the derivation labels are what keep them apart.
  // An invite grants a 30-day peek at a Type and a Life Path; a session grants the whole chart.
  withEnv({ REPORT_LINK_SECRET: SECRET }, () => {
    const invite = makeInviteToken(42, { showName: true, timeKnown: true }, NOW)!;
    assert.equal(checkAppSessionToken(invite, NOW).ok, false);
    const session = makeAppSessionToken(42, 1, NOW)!;
    assert.notEqual(session.split('.')[3], invite.split('.')[3]);
  });
});

test('app session: raising the session number is what ends a session', () => {
  withEnv({ APP_SESSION_SECRET: SECRET }, () => {
    const before = checkAppSessionToken(makeAppSessionToken(42, 1, NOW), NOW);
    assert.deepEqual(before, { ok: true, leadId: 42, epoch: 1 });
    // The route compares this against leads.session_epoch, which deleting your data raises.
    assert.equal(before.ok && before.epoch !== 2, true);
  });
});

test('app session: the Authorization header is read, scheme case and spacing included', () => {
  assert.equal(bearerToken(headers('Bearer abc.def')), 'abc.def');
  assert.equal(bearerToken(headers('bearer abc.def')), 'abc.def');
  assert.equal(bearerToken(headers('BEARER\tabc.def')), 'abc.def');
  assert.equal(bearerToken(headers('  Bearer   abc.def  ')), 'abc.def');
});

test('app session: anything that is not a Bearer header reads as no token', () => {
  for (const h of [null, '', 'abc.def', 'Basic abc', 'Bearer', 'Bearer ', 'Bearer a b']) {
    assert.equal(bearerToken(headers(h)), null, String(h));
  }
});
