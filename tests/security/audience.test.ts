import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifySvix } from '../../src/server/svix';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const audience = read('src/server/audience.ts');
const webhook = read('src/app/api/resend/webhook/route.ts');
const optIn = read('src/server/optInCode.ts');

const SECRET = `whsec_${Buffer.from('a-test-signing-secret-32-bytes!!').toString('base64')}`;
const ID = 'msg_2abc';
const BODY = JSON.stringify({ type: 'contact.updated', data: { email: 'a@b.com', unsubscribed: true } });
const NOW = 1_800_000_000;

function sign(secret: string, id: string, timestamp: number, body: string): string {
  const raw = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const mac = createHmac('sha256', Buffer.from(raw, 'base64')).update(`${id}.${timestamp}.${body}`).digest('base64');
  return `v1,${mac}`;
}

test('a correctly signed request is accepted', () => {
  const header = sign(SECRET, ID, NOW, BODY);
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, header, NOW), true);
});

/**
 * This endpoint turns consent off for whatever address it is handed. Unsigned, it would be an
 * endpoint for turning other people's consent off.
 */
test('anything not correctly signed is refused', () => {
  const good = sign(SECRET, ID, NOW, BODY);
  const cases: [string, boolean][] = [
    ['no header', verifySvix(SECRET, ID, String(NOW), BODY, '', NOW)],
    ['wrong secret', verifySvix(`whsec_${Buffer.from('a-different-secret-of-32-bytes!!').toString('base64')}`, ID, String(NOW), BODY, good, NOW)],
    ['body changed after signing', verifySvix(SECRET, ID, String(NOW), BODY.replace('a@b.com', 'victim@example.com'), good, NOW)],
    ['id changed', verifySvix(SECRET, 'msg_other', String(NOW), BODY, good, NOW)],
    ['no secret configured', verifySvix('', ID, String(NOW), BODY, good, NOW)],
    ['unknown signature version', verifySvix(SECRET, ID, String(NOW), BODY, good.replace('v1,', 'v9,'), NOW)],
    ['not base64', verifySvix(SECRET, ID, String(NOW), BODY, 'v1,!!!not base64!!!', NOW)],
  ];
  for (const [name, result] of cases) assert.equal(result, false, `accepted: ${name}`);
});

test('a captured request cannot be replayed later', () => {
  const header = sign(SECRET, ID, NOW, BODY);
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, header, NOW + 299), true, 'inside the window');
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, header, NOW + 301), false, 'an hour later');
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, header, NOW - 301), false, 'dated in the future');
  assert.equal(verifySvix(SECRET, ID, 'not-a-timestamp', BODY, header, NOW), false);
});

test('several signatures are allowed, which is how a secret is rotated', () => {
  const good = sign(SECRET, ID, NOW, BODY);
  const stale = sign(`whsec_${Buffer.from('an-old-rotated-secret-32-bytes!!').toString('base64')}`, ID, NOW, BODY);
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, `${stale} ${good}`, NOW), true);
  assert.equal(verifySvix(SECRET, ID, String(NOW), BODY, `${stale} ${stale}`, NOW), false);
});

/**
 * The half that gets skipped. A database still saying emailOptIn after somebody unsubscribed is
 * claiming a consent that was withdrawn, and the next list rebuild would put them back on it.
 */
test('an unsubscribe turns consent off in the database', () => {
  assert.match(audience, /emailOptIn: false/);
  assert.match(webhook, /recordUnsubscribe\(email\)/);
  assert.match(webhook, /event\.data\?\.unsubscribed === true/);
});

test('every lead on that address is turned off, not just one', () => {
  // One person can hold several charts. They unsubscribed, not one of their rows.
  assert.match(audience, /\.where\(eq\(leads\.email, address\)\)/);
  assert.match(audience, /\.returning\(\{ id: leads\.id \}\)/);
});

test('the record that consent was once given is not erased', () => {
  // emailOptInAt and emailOptInSource say it was given, which stays true after it is withdrawn.
  const fn = audience.slice(audience.indexOf('export async function recordUnsubscribe'));
  assert.ok(!/emailOptInAt/.test(fn), 'the consent timestamp is cleared on unsubscribe');
  assert.ok(!/emailOptInSource/.test(fn), 'the consent source is cleared on unsubscribe');
});

test('a failure to record an unsubscribe is retried, not swallowed', () => {
  assert.match(webhook, /status: 500/);
});

test('only four fields leave the database', () => {
  const create = audience.slice(audience.indexOf('resend.contacts.create'), audience.indexOf('return \'added\''));
  for (const forbidden of ['birthData', 'results', 'leadId', 'lead.id', 'birthDate', 'source']) {
    assert.ok(!create.includes(forbidden), `${forbidden} is sent to the list`);
  }
  assert.match(create, /email: lead\.email/);
  assert.match(create, /firstName/);
});

test('only a confirmed address goes on the list', () => {
  // Anything else would be the exact thing double opt-in exists to prevent.
  assert.match(audience, /if \(!lead \|\| !lead\.email \|\| !lead\.emailOptIn\) return 'skipped';/);
});

test('the list is joined in the same moment consent is recorded', () => {
  assert.match(optIn, /addConfirmedContact\(lead\.id\)/);
  // And never at the cost of the confirmation itself.
  assert.match(optIn, /addConfirmedContact\(lead\.id\)\.catch\(\(\) => undefined\)/);
});

test('with nothing configured, none of it runs', () => {
  assert.match(audience, /if \(!id \|\| !resend\) return 'not-configured';/);
  assert.match(webhook, /if \(!secret\)/);
});
