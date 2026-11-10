import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { stripQuery } from '../../src/lib/analytics';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const analytics = read('src/lib/analytics.ts');
const privacy = read('src/app/privacy/page.tsx');
const beacon = read('src/components/RefBeacon.tsx');
const report = read('src/app/report/ReportClient.tsx');
const calculator = read('src/components/calculator/CalculatorForm.tsx');

/**
 * The rule the whole file exists to hold: an analytics vendor gets an id that is meaningless
 * outside our database, and never an address that identifies a person in theirs.
 */
/** Comments explain why an address is not used; the code is what must not touch one. */
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
}

test('a person is identified by lead id and never by their address', () => {
  assert.match(analytics, /posthog\.identify\(String\(leadId\)\)/);
  assert.ok(
    !/\bemail\b/i.test(codeOnly(analytics)),
    'the analytics code touches an email address',
  );
});

test('reading the site creates no record of a person', () => {
  // Only a finished calculation does, which is what identified_only means.
  assert.match(analytics, /person_profiles: 'identified_only'/);
});

test('nothing from a chart is ever sent', () => {
  for (const forbidden of ['birthDate', 'birthTime', 'birthPlace', 'humanDesign', 'numerology', 'astrology', 'firstName', 'lastName']) {
    assert.ok(!analytics.includes(forbidden), `${forbidden} appears in the analytics module`);
  }
});

/**
 * The address bar carries campaign tags everywhere, and on the report page an order id and a
 * Stripe payment intent. None of it belongs in an analytics payload.
 */
test('query strings are stripped from every URL that is captured', () => {
  assert.match(analytics, /sanitize_properties/);
  assert.equal(stripQuery('https://www.3dimensions.guide/?utm_source=instagram'), 'https://www.3dimensions.guide/');
  assert.equal(
    stripQuery('https://www.3dimensions.guide/report?orderId=42&payment_intent=pi_123'),
    'https://www.3dimensions.guide/report',
  );
  assert.equal(stripQuery('https://www.3dimensions.guide/pricing'), 'https://www.3dimensions.guide/pricing');
  // A malformed value still has its query taken off rather than being passed through whole.
  assert.equal(stripQuery('not a url?secret=1'), 'not a url');
});

test('with no key set it does nothing at all', () => {
  // Development, and any deployment where the key was never added. Analytics is never worth an
  // error in front of somebody reading their chart.
  assert.match(analytics, /if \(!token\) return;/);
  assert.match(analytics, /NEXT_PUBLIC_POSTHOG_KEY/);
  // Every entry point gives up quietly rather than throwing.
  assert.equal((analytics.match(/catch \{/g) ?? []).length >= 3, true);
});

test('it is started once, where the first-touch is also read', () => {
  assert.match(beacon, /startAnalytics\(\)/);
  assert.match(analytics, /if \(started \|\| typeof window === 'undefined'\) return;/);
});

test('the funnel is captured at the points a decision needs', () => {
  assert.match(calculator, /track\('chart_shown'/);
  assert.match(calculator, /track\('optin_ticked'\)/);
  assert.match(report, /track\('purchase_completed'/);
  assert.match(report, /identifyLead\(leadId\)/);
});

/**
 * The policy has to say this before the collecting starts, not after somebody notices.
 */
test('the privacy policy describes what was just added', () => {
  assert.match(privacy, /Website Analytics/);
  assert.match(privacy, /PostHog/);
  // The three promises the code actually keeps.
  assert.match(privacy, /never tied to your email address or your name/);
  assert.match(privacy, /no profile is created for you at all/);
  assert.match(privacy, /not your birth date, time or place/);
});

test('the privacy policy describes the source record too', () => {
  assert.match(privacy, /How You Found Us/);
  assert.match(privacy, /not in a cookie/);
  // The specific limit that makes it defensible: the site's name, not the page.
  assert.match(privacy, /not\s*the page or anything you searched for/);
});

test('the app is not quietly swept in with the website', () => {
  // The app keeps counting totals per day with nobody attached, and the policy says so.
  assert.match(privacy, /iPhone app does not use PostHog/);
  assert.ok(!/posthog/i.test(read('mobile/src/lib/track.ts')), 'the app now sends to PostHog');
});
