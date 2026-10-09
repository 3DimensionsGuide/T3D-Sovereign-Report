import { test } from 'node:test';
import assert from 'node:assert/strict';
import { devOnlyGuard } from '../../src/server/devOnly';

function withEnv<T>(value: string, run: () => T): T {
  const env = process.env as Record<string, string | undefined>;
  const before = env.NODE_ENV;
  env.NODE_ENV = value;
  try {
    return run();
  } finally {
    if (before === undefined) delete env.NODE_ENV; else env.NODE_ENV = before;
  }
}

test('in production the internal routes answer 404', () => {
  const res = withEnv('production', () => devOnlyGuard());
  assert.ok(res);
  assert.equal(res.status, 404);
});

test('on a development computer the internal routes are allowed', () => {
  assert.equal(withEnv('development', () => devOnlyGuard()), null);
});
