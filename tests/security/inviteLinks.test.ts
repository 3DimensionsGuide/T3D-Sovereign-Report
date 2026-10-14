import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkInviteToken, makeInviteToken } from '../../src/server/inviteLinks';

const NOW = Date.UTC(2026, 9, 14, 12, 0, 0);
const SECRET = 'test-secret-with-enough-length-1234567890';
const KEYS = ['INVITE_LINK_SECRET', 'REPORT_LINK_SECRET', 'STRIPE_WEBHOOK_SECRET'] as const;

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

test('a fresh invite is accepted and carries the sender\'s two choices', () => {
  withEnv({ INVITE_LINK_SECRET: SECRET }, () => {
    const t = makeInviteToken(42, { showName: true, timeKnown: false }, NOW)!;
    const r = checkInviteToken(t, NOW + 1000);
    assert.deepEqual(r, { ok: true, leadId: 42, choices: { showName: true, timeKnown: false } });
  });
});

test('every combination of the two choices round-trips', () => {
  withEnv({ INVITE_LINK_SECRET: SECRET }, () => {
    for (const showName of [true, false]) for (const timeKnown of [true, false]) {
      const r = checkInviteToken(makeInviteToken(7, { showName, timeKnown }, NOW), NOW);
      assert.deepEqual(r, { ok: true, leadId: 7, choices: { showName, timeKnown } });
    }
  });
});

test('changing the lead, the choices or the expiry breaks the signature', () => {
  withEnv({ INVITE_LINK_SECRET: SECRET }, () => {
    const [id, flags, expiry, sig] = makeInviteToken(42, { showName: false, timeKnown: false }, NOW)!.split('.');
    for (const t of [`43.${flags}.${expiry}.${sig}`, `${id}.3.${expiry}.${sig}`, `${id}.${flags}.${Number(expiry) + 99999}.${sig}`]) {
      assert.deepEqual(checkInviteToken(t, NOW), { ok: false, reason: 'invalid' });
    }
  });
});

test('an expired invite is refused', () => {
  withEnv({ INVITE_LINK_SECRET: SECRET }, () => {
    const t = makeInviteToken(42, { showName: true, timeKnown: true }, NOW, 60)!;
    assert.deepEqual(checkInviteToken(t, NOW + 61_000), { ok: false, reason: 'expired' });
    assert.equal(checkInviteToken(t, NOW + 30_000).ok, true);
  });
});

test('junk is malformed and carries no data', () => {
  withEnv({ INVITE_LINK_SECRET: SECRET }, () => {
    for (const t of ['', 'abc', '1.2.3', null, undefined, 42, '1.9.1999999999.' + 'a'.repeat(64)]) {
      assert.deepEqual(checkInviteToken(t, NOW), { ok: false, reason: 'malformed' });
    }
  });
});

test('with no secret nothing can be made or checked', () => {
  withEnv({}, () => {
    assert.equal(makeInviteToken(1, { showName: true, timeKnown: true }, NOW), null);
    assert.deepEqual(checkInviteToken('1.1.99999999999.' + 'a'.repeat(64), NOW), { ok: false, reason: 'unconfigured' });
  });
});

test('a report-link secret is enough, and a token made with one secret fails under another', () => {
  const a = withEnv({ REPORT_LINK_SECRET: SECRET }, () => makeInviteToken(5, { showName: true, timeKnown: true }, NOW)!);
  assert.equal(withEnv({ REPORT_LINK_SECRET: SECRET }, () => checkInviteToken(a, NOW).ok), true);
  assert.deepEqual(withEnv({ REPORT_LINK_SECRET: SECRET + 'x' }, () => checkInviteToken(a, NOW)), { ok: false, reason: 'invalid' });
});
