import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAX_TRIBE, canAdd, groupTribe, migratePartnerState, newMember, readLabel, tribeCountLine } from '../../mobile/src/lib/tribe';
import type { PartnerProfile } from '../../mobile/src/lib/togetherTypes';

const profile = (label: string): PartnerProfile => ({
  label, birthDate: '1990-05-01', birthTime: null, placeLabel: 'Austin, United States', latitude: 30.27, longitude: -97.74, timezone: 'America/Chicago',
});

test('a new member gets an id, a relation and a date', () => {
  const a = newMember(profile('Sam'), 'romantic', 1_700_000_000_000, 0.5);
  const b = newMember(profile('Sam'), 'romantic', 1_700_000_000_001, 0.5);
  assert.equal(a.relation, 'romantic');
  assert.notEqual(a.id, b.id);
  assert.match(a.addedAt, /^2023-11-/);
});

test('the tribe holds at most 12 people', () => {
  const people = Array.from({ length: MAX_TRIBE }, (_, i) => newMember(profile(`P${i}`), 'friend', i, 0.1));
  assert.equal(canAdd(people.slice(0, MAX_TRIBE - 1)), true);
  assert.equal(canAdd(people), false);
});

test('romantic comes first, friends second, empty groups are left out', () => {
  const a = newMember(profile('A'), 'friend', 1, 0.1), b = newMember(profile('B'), 'romantic', 2, 0.2), c = newMember(profile('C'), 'friend', 3, 0.3);
  assert.deepEqual(groupTribe([a, b, c]).map((g) => [g.relation, g.members.map((m) => m.profile.label)]), [['romantic', ['B']], ['friend', ['A', 'C']]]);
  assert.deepEqual(groupTribe([a]).map((g) => g.relation), ['friend']);
  assert.deepEqual(groupTribe([]), []);
});

test('count line and button wording', () => {
  assert.equal(tribeCountLine(0), 'No one yet');
  assert.equal(tribeCountLine(1), '1 person');
  assert.equal(tribeCountLine(4), '4 people');
  assert.equal(readLabel('Sam'), 'Read your connection with Sam');
});

test('the one person saved by an older version becomes the first member', () => {
  const m = migratePartnerState({ partner: profile('Alex') });
  assert.equal(m.people.length, 1);
  assert.equal(m.people[0].profile.label, 'Alex');
  assert.deepEqual(migratePartnerState({ partner: null }), { people: [] });
  assert.deepEqual(migratePartnerState(undefined), { people: [] });
});

test('Together shows the intro when empty, the list otherwise, and the store migrates old data', () => {
  const together = readFileSync('mobile/src/components/practice/Together.tsx', 'utf8');
  assert.match(together, /people\.length === 0\) return <TribeIntro/);
  assert.match(together, /<TribeList /);
  const store = readFileSync('mobile/src/store/usePartnerStore.ts', 'utf8');
  assert.match(store, /version: 2/);
  assert.match(store, /migratePartnerState/);
});

test('the intro asks for action and keeps the privacy promise; relation is always written out', () => {
  const t = readFileSync('mobile/src/components/practice/Tribe.tsx', 'utf8');
  assert.match(t, /Add your first person/);
  assert.match(t, /stay on this phone/);
  assert.match(t, /RELATION_LABEL\[m\.relation\]/);
});
