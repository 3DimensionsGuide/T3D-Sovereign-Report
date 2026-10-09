import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUCKETS, MemoryStore, checkLimit, clientId, isBlockedForGuessing, recordGuess,
} from '../../src/server/rateLimitCore';

const headers = (h: Record<string, string>) => ({ get: (n: string) => h[n.toLowerCase()] ?? null });

test('requests within the limit pass and the next one is refused', async () => {
  const store = new MemoryStore();
  for (let i = 0; i < BUCKETS.calculate.limit; i += 1) {
    assert.equal((await checkLimit(store, 'calculate', '1.2.3.4')).allowed, true);
  }
  const over = await checkLimit(store, 'calculate', '1.2.3.4');
  assert.equal(over.allowed, false);
  assert.equal(over.retryAfterSec, BUCKETS.calculate.windowSec);
});

test('callers are counted separately', async () => {
  const store = new MemoryStore();
  for (let i = 0; i <= BUCKETS.calculate.limit; i += 1) await checkLimit(store, 'calculate', '1.2.3.4');
  assert.equal((await checkLimit(store, 'calculate', '5.6.7.8')).allowed, true);
});

test('buckets are counted separately', async () => {
  const store = new MemoryStore();
  for (let i = 0; i <= BUCKETS.calculate.limit; i += 1) await checkLimit(store, 'calculate', '1.2.3.4');
  assert.equal((await checkLimit(store, 'place', '1.2.3.4')).allowed, true);
});

test('the count starts over when the window ends', async () => {
  let t = 1_000_000;
  const store = new MemoryStore(() => t);
  for (let i = 0; i <= BUCKETS.calculate.limit; i += 1) await checkLimit(store, 'calculate', 'a');
  assert.equal((await checkLimit(store, 'calculate', 'a')).allowed, false);
  t += BUCKETS.calculate.windowSec * 1000 + 1;
  assert.equal((await checkLimit(store, 'calculate', 'a')).allowed, true);
});

test('repeated wrong guesses block a caller, and the block ends', async () => {
  let t = 5_000_000;
  const store = new MemoryStore(() => t);
  assert.equal(await isBlockedForGuessing(store, 'x'), false);
  for (let i = 0; i < BUCKETS.authFail.limit - 1; i += 1) await recordGuess(store, 'x');
  assert.equal(await isBlockedForGuessing(store, 'x'), false);
  await recordGuess(store, 'x');
  assert.equal(await isBlockedForGuessing(store, 'x'), true);
  assert.equal(await isBlockedForGuessing(store, 'someone-else'), false);
  t += BUCKETS.authFail.windowSec * 1000 + 1;
  assert.equal(await isBlockedForGuessing(store, 'x'), false);
});

test('the caller address comes from the forwarding header', () => {
  assert.equal(clientId(headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })), '203.0.113.9');
  assert.equal(clientId(headers({ 'x-real-ip': '198.51.100.4' })), '198.51.100.4');
  assert.equal(clientId(headers({ 'x-forwarded-for': '2001:db8::1' })), '2001:db8::1');
  assert.equal(clientId(headers({})), 'unknown');
  assert.equal(clientId(headers({ 'x-forwarded-for': '<script>' })), 'unknown');
});
