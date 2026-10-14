import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const premium = readFileSync('mobile/src/app/premium.tsx', 'utf8');
const method = readFileSync('mobile/src/app/method.tsx', 'utf8');
const about = readFileSync('mobile/src/app/your-data.tsx', 'utf8');

test('the Premium screen shows what a subscription screen must: price, renewal, cancel, privacy and terms', () => {
  assert.match(premium, /renew automatically until you cancel/);
  assert.match(premium, /cancel any time in your Apple ID settings/);
  assert.match(premium, /READ THE PRIVACY POLICY/);
  assert.match(premium, /TERMS OF USE/);
  assert.match(premium, /apple\.com\/legal\/internet-services\/itunes\/dev\/stdeula/);
  assert.match(premium, /Restore purchases/);
});

test('reflection-only wording appears on Premium, Method and About', () => {
  for (const src of [premium, method, about]) {
    assert.match(src, /not medical, (legal|psychological)/);
    assert.match(src, /predict events/);
  }
});

test('the developer Premium switch never ships in a release build', () => {
  assert.match(premium, /__DEV__ \? \(\s*<Pressable[^>]*accessibilityRole="switch"/);
});

const gate = readFileSync('mobile/src/lib/usePremium.ts', 'utf8');
const lib = readFileSync('mobile/src/lib/premium.ts', 'utf8');
const meet = readFileSync('mobile/src/app/meet-triad.tsx', 'utf8');

test('version 1 is free for everyone: one switch opens every feature and hides the Premium screen', () => {
  assert.match(lib, /export const SUBSCRIPTIONS_OPEN = false;/);
  assert.match(gate, /return !SUBSCRIPTIONS_OPEN \|\| stored;/);
  assert.match(premium, /if \(!SUBSCRIPTIONS_OPEN\) return <Redirect href="\/today" \/>;/);
});

test('Meet your Triad reads Premium from the shared hook, so no stop is locked while version 1 is free', () => {
  assert.match(meet, /const premium = usePremium\(\);/);
  assert.doesNotMatch(meet, /const \{[^}]*\bpremium,[^}]*\} = useMeetTriadStore/);
});
