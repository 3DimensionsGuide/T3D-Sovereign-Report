import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCode, hashCode, checkCode, issuedTooRecently,
  CODE_TTL_SECONDS, MAX_CODE_ATTEMPTS, type CodeState,
} from '../../src/server/emailCode';

process.env.REPORT_LINK_SECRET = 'a-test-secret-that-is-long-enough';

const now = new Date('2026-10-10T12:00:00Z');
const later = (s: number) => new Date(now.getTime() + s * 1000);
const stateFor = (code: string, over: Partial<CodeState> = {}): CodeState => ({
  hash: hashCode(7, 'a@b.com', code), expiresAt: later(CODE_TTL_SECONDS), attempts: 0, ...over,
});

test('codes are six digits', () => {
  for (let i = 0; i < 50; i++) assert.match(generateCode(), /^\d{6}$/);
});

test('the right code is accepted, with spaces and an upper-case address', () => {
  assert.equal(checkCode(stateFor('012345'), 7, 'A@B.com', '012 345', now), 'ok');
});

test('a wrong code, a wrong lead and a wrong address are refused', () => {
  const s = stateFor('123456');
  assert.equal(checkCode(s, 7, 'a@b.com', '123457', now), 'wrong');
  assert.equal(checkCode(s, 8, 'a@b.com', '123456', now), 'wrong');
  assert.equal(checkCode(s, 7, 'c@d.com', '123456', now), 'wrong');
  assert.equal(checkCode(s, 7, 'a@b.com', 'abcdef', now), 'wrong');
});

test('an expired code is refused', () => {
  assert.equal(checkCode(stateFor('123456'), 7, 'a@b.com', '123456', later(CODE_TTL_SECONDS + 1)), 'expired');
});

test('after too many wrong guesses even the right code is refused', () => {
  assert.equal(checkCode(stateFor('123456', { attempts: MAX_CODE_ATTEMPTS }), 7, 'a@b.com', '123456', now), 'locked');
});

test('no code issued means nothing to check', () => {
  assert.equal(checkCode({ hash: null, expiresAt: null, attempts: 0 }, 7, 'a@b.com', '123456', now), 'none');
});

test('the stored value is a hash, not the code', () => {
  const h = hashCode(7, 'a@b.com', '123456');
  assert.match(h ?? '', /^[0-9a-f]{64}$/);
  assert.ok(!(h ?? '').includes('123456'));
});

test('a new code can be asked for after a minute', () => {
  const issuedNow = later(CODE_TTL_SECONDS);
  assert.equal(issuedTooRecently(issuedNow, now), true);
  assert.equal(issuedTooRecently(issuedNow, later(61)), false);
  assert.equal(issuedTooRecently(null, now), false);
});

test('with no secret nothing is made and nothing is accepted', () => {
  const keep = process.env.REPORT_LINK_SECRET;
  delete process.env.REPORT_LINK_SECRET; delete process.env.STRIPE_WEBHOOK_SECRET;
  assert.equal(hashCode(7, 'a@b.com', '123456'), null);
  assert.equal(checkCode({ hash: 'ab', expiresAt: later(100), attempts: 0 }, 7, 'a@b.com', '123456', now), 'unconfigured');
  process.env.REPORT_LINK_SECRET = keep;
});
