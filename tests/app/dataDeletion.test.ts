import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { blankedLead, isBlankedLead, planDeletion } from '../../src/server/dataDeletion';

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

// ─── recognising a record that has already been emptied ──────────────────────
//
// A blanked row keeps its id, its order, and placeholder birth data: 1 January of year 1, at 0,0.
// The engines will turn that into a perfectly valid chart, so anything sweeping the leads table
// reports it as differing from the empty result stored — true, and meaningless. A production scan
// returned affectedCount 5 out of 5 leads this way, every one of them a deleted record.

test('a blanked lead is recognised by the address deletion writes', () => {
  for (const id of [1, 11, 999]) {
    assert.equal(isBlankedLead(blankedLead(id)), true, `lead ${id}`);
  }
});

test('an ordinary lead is not mistaken for a deleted one', () => {
  for (const email of [
    'someone@example.com',
    'person@deleted.invalid.example.com',   // the marker has to be at the end
    'deleted@example.com',
    '',
  ]) {
    assert.equal(isBlankedLead({ email }), false, email || '(empty)');
  }
  assert.equal(isBlankedLead({ email: null }), false);
  assert.equal(isBlankedLead({}), false);
});

test('placeholder birth data is still a readable chart, which is why these must be skipped', () => {
  // Not a fault in blankedLead — this is the point. The placeholder has to be a valid date for
  // the column, and being valid is exactly what makes it dangerous to anything that recalculates.
  const blank = blankedLead(7);
  assert.equal(blank.birthData.date, '0001-01-01');
  assert.equal(blank.birthData.place.latitude, 0);
  assert.equal(blank.birthData.place.timezone, 'UTC');
  assert.deepEqual(blank.results, { astrology: {}, numerology: {}, humanDesign: {} });
});

test('the admin scan and the audit script both skip them', () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
  const scan = read('src/app/api/admin/recompute-human-design/route.ts');
  assert.match(scan, /if \(isBlankedLead\(row\)\) \{ blanked\+\+; continue; \}/);
  assert.match(scan, /blanked,/, 'the scan should report how many it skipped');
  assert.match(read('dev-tools/audit-charts.mjs'), /endsWith\('@deleted\.invalid'\)/);
});
