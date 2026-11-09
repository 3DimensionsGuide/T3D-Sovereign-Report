import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { WALKTHROUGH, walkthroughAvailable } from '../../src/lib/walkthrough';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const route = read('src/app/api/walkthrough-request/route.ts');
const offer = read('src/app/report/WalkthroughOffer.tsx');
const client = read('src/app/report/ReportClient.tsx');

test('an offer with no price is not an offer', () => {
  assert.equal(walkthroughAvailable({ ...WALKTHROUGH, priceLabel: null }), false);
  assert.equal(walkthroughAvailable({ ...WALKTHROUGH, priceLabel: '   ' }), false);
  assert.equal(walkthroughAvailable({ ...WALKTHROUGH, priceLabel: '$120' }), true);
});

test('it ships switched off, so nothing advertises a price nobody has set', () => {
  assert.equal(WALKTHROUGH.priceLabel, null);
  assert.equal(walkthroughAvailable(), false);
});

test('both the page and the route check before doing anything', () => {
  // Hidden on the page is not enough: the endpoint has to refuse as well, or the offer exists
  // for anyone who sends the request by hand.
  assert.match(offer, /if \(!walkthroughAvailable\(\)\) return null;/);
  assert.match(route, /if \(!walkthroughAvailable\(\)\)/);
  assert.match(route, /status: 404/);
});

/**
 * The address is read off the lead row, never taken from the request. Otherwise this endpoint
 * would be a way to have mail sent somewhere of the sender's choosing, with T3D's name on it.
 */
test('the reply address comes from the database, not from the caller', () => {
  assert.match(route, /replyTo: lead\.email/);
  assert.ok(!/body\.email/.test(route), 'the route reads an address from the body');
  assert.match(route, /eq\(leads\.id, leadId\)/);
});

test('a lead that is not there is answered exactly like one that is', () => {
  // A different answer would let somebody walk the ids and find out who has bought a report.
  assert.match(route, /if \(!lead \|\| !lead\.email\) return NextResponse\.json\(RECEIVED\);/);
  assert.match(route, /const RECEIVED = \{/);
});

test('the note is bounded before it goes anywhere', () => {
  assert.match(route, /const NOTE_LIMIT = 600;/);
  assert.match(route, /\.slice\(0, NOTE_LIMIT\)/);
  // And escaped, since it lands in an HTML email.
  assert.match(route, /escapeHtml\(note\)/);
  assert.match(offer, /e\.target\.value\.slice\(0, 600\)/);
});

test('the request is rate limited like every other public endpoint', () => {
  assert.match(route, /limitRequest\(request, 'app'\)/);
});

/**
 * The shape is the point. Taking payment before a person has agreed to record would promise work
 * nobody had committed to, which is the thing that would have made this dishonest.
 */
test('asking charges nothing, and the page says so', () => {
  assert.ok(!/stripe/i.test(route), 'the request route touches payment');
  // A link to a checkout, not the word: the file's own comment explains why this is not one,
  // and a test that cannot tell prose from code fails on the explanation of itself.
  assert.ok(!/href=[^>\n]*checkout/i.test(offer), 'the offer links to a checkout');
  assert.ok(!/<Link/.test(offer), 'the offer navigates somewhere instead of asking');
  assert.match(offer, /Nothing is charged by asking/);
  assert.match(offer, /payment link only if you still want it then/);
  assert.match(route, /Nothing has been charged/);
});

test('it says what it is not, in the same breath as what it is', () => {
  // Collapsed, because JSX copy wraps wherever the line ran out rather than where the sentence did.
  const copy = offer.replace(/\s+/g, ' ');
  assert.match(copy, /not advice/);
  assert.match(copy, /does not tell you what to do/);
});

test('it is offered after any report, not only the base one', () => {
  // The Advanced upsell is conditional on the base product; this is not, because whatever they
  // bought is a document they are about to read for the first time.
  assert.match(client, /\{leadId \? <WalkthroughOffer leadId=\{leadId\} \/> : null\}/);
});
