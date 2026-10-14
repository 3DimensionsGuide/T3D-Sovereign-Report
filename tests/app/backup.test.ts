import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BACKUP_KEYS, buildBackup, checksum, parseBackup } from '../../mobile/src/lib/backup';
import { ACTIONS, ACTION_EVENTS, isAppEvent } from '../../src/lib/app/events';

const saved = (state: object) => JSON.stringify({ state, version: 1 });
const RAW = {
  't3d-daylog-v1': saved({ entries: { '2026-10-13': 'good' } }),
  't3d-practice-v1': saved({ decisions: [] }),
  't3d-partner-v1': saved({ people: [{ id: 'a', relation: 'friend', profile: { label: 'Sam "the man" Ó' } }] }),
  't3d-meet-triad-v1': null,
};

test('a backup round-trips exactly, including quotes and accents', () => {
  const text = buildBackup(RAW, new Date('2026-10-13T12:00:00Z'));
  assert.ok(text.startsWith('T3D-BACKUP-1 '));
  const back = parseBackup(text);
  assert.ok(back.ok);
  if (back.ok) {
    assert.equal(back.entries['t3d-partner-v1'], RAW['t3d-partner-v1']);
    assert.equal(back.at, '2026-10-13T12:00:00.000Z');
    assert.deepEqual(back.names, ['Daily check-ins', 'Practice and decisions', 'My Tribe']);
    assert.equal(back.entries['t3d-meet-triad-v1'], undefined);
  }
});

test('surrounding spaces and newlines from copying do not matter', () => {
  const text = buildBackup(RAW);
  assert.ok(parseBackup(`\n  ${text}\n\n`).ok);
});

test('a cut-off, edited or foreign block is refused with a plain reason', () => {
  const text = buildBackup(RAW);
  for (const bad of [text.slice(0, -20), text.replace('Sam', 'Tom'), 'hello', '', text.slice(0, 40)]) {
    const r = parseBackup(bad);
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.reason.length > 10);
  }
});

test('only the four known keys are ever restored, and each must look like saved store data', () => {
  const body = JSON.stringify({ v: 1, at: 'x', data: { 't3d-store-v1': saved({ profile: 1 }), 'evil': '{}', 't3d-daylog-v1': 'not json', 't3d-practice-v1': saved({ a: 1 }) } });
  const r = parseBackup(`T3D-BACKUP-1 ${body} #${checksum(body)}`);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(Object.keys(r.entries), ['t3d-practice-v1']);
  const empty = JSON.stringify({ v: 1, at: 'x', data: { 't3d-store-v1': saved({}) } });
  assert.equal(parseBackup(`T3D-BACKUP-1 ${empty} #${checksum(empty)}`).ok, false);
});

test('the profile and chart (kept on the server) are not part of a backup', () => {
  assert.ok(!('t3d-store-v1' in BACKUP_KEYS));
  assert.ok(!('t3d-reminder-v1' in BACKUP_KEYS));
});

test('the keys match the real stores', () => {
  const stores = ['useDayLogStore', 'usePracticeStore', 'usePartnerStore', 'useMeetTriadStore'].map((f) => readFileSync(`mobile/src/store/${f}.ts`, 'utf8')).join('\n');
  for (const k of Object.keys(BACKUP_KEYS)) assert.ok(stores.includes(`'${k}'`), k);
});

test('the counted moments match between the app and the server, and nothing personal is in them', () => {
  const app = readFileSync('mobile/src/lib/track.ts', 'utf8');
  const listed = [...(/const ACTIONS = new Set\(\[([^\]]*)\]/.exec(app)![1]!).matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(listed, [...ACTIONS]);
  for (const e of ACTION_EVENTS) assert.ok(isAppEvent(e));
  assert.ok(!isAppEvent('action_tribe_added; drop table'));
  for (const f of ['mobile/src/components/RevealView.tsx', 'mobile/src/components/PremiumGate.tsx', 'mobile/src/components/InviteCard.tsx', 'mobile/src/components/practice/Together.tsx', 'mobile/src/components/BackupCard.tsx']) {
    assert.match(readFileSync(f, 'utf8'), /trackAction\('/, f);
  }
});

test('Your data offers the backup', () => {
  assert.match(readFileSync('mobile/src/app/your-data.tsx', 'utf8'), /<BackupCard \/>/);
});
