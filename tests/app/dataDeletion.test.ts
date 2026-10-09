import test from 'node:test';
import assert from 'node:assert/strict';
import { blankedLead, planDeletion } from '../../src/server/dataDeletion';

test('leads without orders are removed; leads with orders are blanked', () => {
  const plan = planDeletion([1, 2, 3], new Set([2]));
  assert.deepEqual(plan.removeIds, [1, 3]);
  assert.deepEqual(plan.blankIds, [2]);
});

test('no leads means nothing to do', () => {
  assert.deepEqual(planDeletion([], new Set()), { removeIds: [], blankIds: [] });
});

test('a blanked record holds no personal details and keeps its place', () => {
  const b = blankedLead(42);
  assert.equal(b.email, 'deleted-42@deleted.invalid');
  assert.equal(b.firstName, 'Deleted');
  assert.equal(b.middleName, null);
  assert.equal(b.emailOptIn, false);
  assert.equal(b.birthData.place.city, '');
  assert.deepEqual(b.results, { astrology: {}, numerology: {}, humanDesign: {} });
});

test('each blanked record gets its own placeholder email', () => {
  assert.notEqual(blankedLead(1).email, blankedLead(2).email);
});
