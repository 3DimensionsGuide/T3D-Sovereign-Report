import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

test('lens and signal markers each have their own shape and a written label', () => {
  const lens = read('mobile/src/components/Lens.tsx');
  for (const k of ['vehicle', 'road', 'stoplight', 'flow', 'friction', 'caution']) {
    assert.match(lens, new RegExp(`kind === '${k}'|lens === '${k}'`), `${k} has a drawn shape`);
  }
  for (const label of ['The Vehicle', 'The Road', 'The Stoplight', 'Flow', 'Friction', 'Caution']) {
    assert.ok(lens.includes(`'${label}'`), `${label} has a text label`);
  }
});

test('the page glow fades out instead of ending in a hard edge', () => {
  const glow = read('mobile/src/components/Glow.tsx');
  assert.match(glow, /stopOpacity=\{0\}/);
  const screen = read('mobile/src/components/Screen.tsx');
  assert.ok(!/borderRadius:\s*260/.test(screen), 'no hard-edged circle on the page');
});

test('onboarding lets people enter the emailed code or skip it', () => {
  const onboarding = read('mobile/src/app/onboarding.tsx');
  assert.match(onboarding, /confirmOptInCode/);
  assert.match(onboarding, /SKIP FOR NOW/);
  assert.match(onboarding, /SEND A NEW CODE/);
  const api = read('mobile/src/lib/api.ts');
  assert.match(api, /\/api\/email-optin\/confirm/);
  assert.match(api, /\/api\/email-optin\/send/);
});

test('Today opens with a signal block and uses the shared markers for every transit', () => {
  const today = read('mobile/src/app/(tabs)/today.tsx');
  assert.match(today, /<TodaySignal /);
  assert.ok(!today.includes('NATURE_LABEL'), 'the old mixed text markers are gone');
  const signal = read('mobile/src/components/TodaySignal.tsx');
  for (const word of ['flow', 'friction', 'retrograde']) assert.ok(signal.includes(word));
});
