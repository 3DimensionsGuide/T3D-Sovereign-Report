import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FREE_FEATURES, money, PREMIUM_FEATURES, PRICES, yearlySavingsPercent } from '../../mobile/src/lib/premium';

test('prices match the plan and format as dollars', () => {
  assert.equal(PRICES.monthly, 9.99);
  assert.equal(PRICES.yearly, 79.99);
  assert.equal(PRICES.trialDays, 7);
  assert.equal(PRICES.reportBuyerMonths, 12);
  assert.equal(money(PRICES.yearly), '$79.99');
});

test('the yearly saving is worked out from the two prices', () => {
  assert.equal(yearlySavingsPercent(), 33);
});

test('every Premium feature has its own id, a lens colour and plain text', () => {
  const ids = PREMIUM_FEATURES.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(PREMIUM_FEATURES.every((f) => ['vehicle', 'road', 'stoplight'].includes(f.accent) && f.title && f.detail));
  assert.ok(FREE_FEATURES.length >= 4);
});

test('the Premium screen is honest that subscriptions are not open', () => {
  const src = readFileSync('mobile/src/app/premium.tsx', 'utf8');
  assert.match(src, /Subscriptions open soon/);
  assert.match(src, /label="Subscriptions open soon" onPress=\{\(\) => undefined\} disabled/);
  assert.match(src, /Restore purchases/);
  assert.match(src, /3dimensions\.guide\/privacy/);
  // The developer switch only exists in developer builds.
  assert.match(src, /__DEV__ \? \(/);
});

test('locked spots lead to the Premium screen', () => {
  assert.match(readFileSync('mobile/src/components/Explain.tsx', 'utf8'), /'\/premium'/);
  assert.match(readFileSync('mobile/src/app/meet-triad.tsx', 'utf8'), /'\/premium'/);
});
