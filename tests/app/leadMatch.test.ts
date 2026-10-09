import test from 'node:test';
import assert from 'node:assert/strict';
import { findExistingLead, isSamePerson, mergedOptIn, type StoredLead, type LeadIdentity } from '../../src/server/leadMatch';

const row = (over: Partial<StoredLead> = {}): StoredLead => ({
  id: 1, email: 'a@b.com', firstName: 'Ana', middleName: null, lastName: 'Lee',
  birthData: { date: '1990-05-05', time: '12:00', place: { city: 'Austin, Texas', country: 'United States' } },
  emailOptIn: false, createdAt: new Date('2026-01-01'), ...over,
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
