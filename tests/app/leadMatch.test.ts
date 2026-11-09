import test from 'node:test';
import assert from 'node:assert/strict';
import { findExistingLead, isSamePerson, mergedOptIn, optInFields, type StoredLead, type LeadIdentity } from '../../src/server/leadMatch';

const row = (over: Partial<StoredLead> = {}): StoredLead => ({
  id: 1, email: 'a@b.com', firstName: 'Ana', middleName: null, lastName: 'Lee',
  birthData: { date: '1990-05-05', time: '12:00', place: { city: 'Austin, Texas', country: 'United States' } },
  emailOptIn: false, emailOptInAt: null, emailOptInSource: null, createdAt: new Date('2026-01-01'), ...over,
});
const who: LeadIdentity = {
  email: 'A@B.com ', firstName: ' ana', lastName: 'LEE', birthDate: '1990-05-05', birthTime: '12:00',
  city: 'austin, texas', country: 'united states',
};

test('same person matches despite case and spacing', () => assert.equal(isSamePerson(row(), who), true));
test('a different birth time is a different lead', () => assert.equal(isSamePerson(row(), { ...who, birthTime: '14:30' }), false));
test('a different birth date is a different lead', () => assert.equal(isSamePerson(row(), { ...who, birthDate: '1990-05-06' }), false));
test('a different place is a different lead', () => assert.equal(isSamePerson(row(), { ...who, city: 'Dallas, Texas' }), false));
test('a different name on the same email is a different lead', () => assert.equal(isSamePerson(row(), { ...who, firstName: 'Bea' }), false));
test('a middle name makes it a different person', () => assert.equal(isSamePerson(row(), { ...who, middleName: 'Rose' }), false));
test('a different email never matches', () => assert.equal(isSamePerson(row(), { ...who, email: 'c@d.com' }), false));

/**
 * An address can be absent on both sides. The app writes a lead before it asks for one, so for a
 * whole first session the row has no address and neither does the identity being matched against
 * it. The whole arrangement rests on two things being true at once: two addressless records for
 * the same person match each other, so an app that lost its token recalculates onto its own lead
 * instead of writing a second one; and an addressless record never matches one that has an
 * address, so nobody is handed somebody else's chart.
 */
const anon = (over: Partial<StoredLead> = {}): StoredLead => row({ email: null, ...over });
const { email: _dropped, ...withoutEmail } = who;
const anonWho: LeadIdentity = withoutEmail;

test('two addressless records for the same person match', () => {
  assert.equal(isSamePerson(anon(), anonWho), true);
  // Null, undefined and '' all mean the same thing here: nobody has given an address.
  assert.equal(isSamePerson(anon(), { ...anonWho, email: null }), true);
  assert.equal(isSamePerson(anon(), { ...anonWho, email: '' }), true);
});

test('an addressless record never matches one that has an address', () => {
  // The dangerous direction: an app with no address must not be matched onto a lead that has one.
  assert.equal(isSamePerson(row(), anonWho), false);
  // And the reverse, so attaching an address cannot be undone by a later addressless calculation.
  assert.equal(isSamePerson(anon(), who), false);
});

test('an addressless record still has to be the same person', () => {
  assert.equal(isSamePerson(anon(), { ...anonWho, firstName: 'Bea' }), false);
  assert.equal(isSamePerson(anon(), { ...anonWho, birthTime: '14:30' }), false);
  assert.equal(isSamePerson(anon(), { ...anonWho, city: 'Dallas, Texas' }), false);
  // Two different people who have both skipped the address are not one person.
  assert.equal(isSamePerson(anon({ lastName: 'Kim' }), anonWho), false);
});

test('an app that lost its token recalculates onto its own anonymous lead', () => {
  // What the route actually passes: every anonymous row sharing the surname, which is what
  // leads_anon_idx narrows to. Only one of them is this person.
  const rows = [anon({ id: 4, firstName: 'Bea' }), anon({ id: 5 }), anon({ id: 6, birthTime: '03:15' })];
  assert.equal(findExistingLead(rows, anonWho)?.id, 5);
});

test('an anonymous lead is not reused once it has an address', () => {
  // After attaching, the same birth details with no address find nothing — which is correct: the
  // app sends the address it now holds, and a stranger with the same name and birthday gets a
  // lead of their own rather than this one.
  assert.equal(findExistingLead([row({ id: 5 })], anonWho), null);
});

test('the oldest matching lead is reused', () => {
  const rows = [row({ id: 7, createdAt: new Date('2026-03-01') }), row({ id: 2, createdAt: new Date('2026-02-01') }), row({ id: 9, firstName: 'Zed' })];
  assert.equal(findExistingLead(rows, who)?.id, 2);
});
test('no match returns null', () => assert.equal(findExistingLead([row({ lastName: 'Kim' })], who), null));

test('opt-in only turns on, never off', () => {
  assert.equal(mergedOptIn(false, true), true);
  assert.equal(mergedOptIn(true, false), true);
  assert.equal(mergedOptIn(true, undefined), true);
  assert.equal(mergedOptIn(false, undefined), false);
  assert.equal(mergedOptIn(false, 'yes'), false);
});

test('opt-in time and source are stamped the first time only', () => {
  const t1 = new Date('2026-10-09T12:00:00Z');
  const t2 = new Date('2026-11-01T12:00:00Z');
  const first = optInFields(null, true, t1);
  assert.deepEqual(first, { emailOptIn: true, emailOptInAt: t1, emailOptInSource: 'website-calculator-v1' });
  const again = optInFields(first, true, t2);
  assert.equal(again.emailOptInAt, t1);
  const unticked = optInFields(first, false, t2);
  assert.equal(unticked.emailOptIn, true);
  assert.equal(unticked.emailOptInAt, t1);
});

test('no consent means no time and no source', () => {
  assert.deepEqual(optInFields(null, false, new Date()), { emailOptIn: false, emailOptInAt: null, emailOptInSource: null });
  assert.equal(optInFields(null, 'yes', new Date()).emailOptIn, false);
});

test('earlier consent given before recording keeps an empty time', () => {
  const old = optInFields({ emailOptIn: true, emailOptInAt: null, emailOptInSource: 'legacy-unrecorded' }, true, new Date());
  assert.equal(old.emailOptInAt, null);
  assert.equal(old.emailOptInSource, 'legacy-unrecorded');
});
