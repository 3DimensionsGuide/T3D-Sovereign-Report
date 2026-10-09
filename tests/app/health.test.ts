import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REFERENCES, checkEngine } from '../../src/server/healthCheck';
import { APP_EVENTS, CARD_REFS, SCREEN_EVENTS, isAppEvent } from '../../src/lib/app/events';

type Snap = {
  tropical: { bodies: Record<string, { longitude: number }>; ascendant: number };
  humanDesign: { type: string; authority: string; profile: string };
  numerology: { lifePath: number };
};
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const snapshot = JSON.parse(readFileSync(join(process.cwd(), 'tests/golden/snapshot.json'), 'utf8')) as { charts: Record<string, Snap> };

test('health check reference values match the golden snapshot', () => {
  for (const ref of REFERENCES) {
    const want = snapshot.charts[ref.id];
    assert.ok(want, ref.id);
    assert.equal(ref.sun, want.tropical.bodies.sun!.longitude, `${ref.id} sun`);
    assert.equal(ref.moon, want.tropical.bodies.moon!.longitude, `${ref.id} moon`);
    assert.equal(ref.northNode, want.tropical.bodies.northNode!.longitude, `${ref.id} node`);
    assert.equal(ref.ascendant, want.tropical.ascendant, `${ref.id} ascendant`);
    assert.equal(ref.type, want.humanDesign.type, `${ref.id} type`);
    assert.equal(ref.authority, want.humanDesign.authority, `${ref.id} authority`);
    assert.equal(ref.profile, want.humanDesign.profile, `${ref.id} profile`);
    assert.equal(ref.lifePath, want.numerology.lifePath, `${ref.id} life path`);
  }
});

test('health check: this computer produces the reference numbers', () => {
  const r = checkEngine();
  assert.deepEqual(r.misses, []);
  assert.equal(r.status, 'ok');
});

test('app events: only screen names are accepted', () => {
  assert.ok(isAppEvent('screen_today'));
  assert.ok(isAppEvent('screen_your-data'));
  assert.ok(!isAppEvent('screen_unknown'));
  assert.ok(!isAppEvent('today'));
  assert.ok(!isAppEvent(42));
  assert.ok(!isAppEvent("screen_today'; drop table leads"));
  assert.equal(new Set(APP_EVENTS).size, APP_EVENTS.length);
});

test('the app and the server list the same screens', () => {
  const src = readFileSync(join(process.cwd(), 'mobile/src/lib/track.ts'), 'utf8');
  const block = /new Set\(\[([\s\S]*?)\]\)/.exec(src)![1]!;
  const mobile = [...block.matchAll(/'([^']+)'/g)].map((m) => `screen_${m[1]}`).sort();
  assert.deepEqual(mobile, [...SCREEN_EVENTS].sort());
});

test('the event route stores nothing but a day, a screen name and a count', () => {
  const src = readFileSync(join(process.cwd(), 'src/app/api/app/event/route.ts'), 'utf8');
  assert.doesNotMatch(src, /leadId|email|headers\.get|x-forwarded|console\.(log|info)/);
});

test('card visit tags: the website beacon, the app links and the server list agree', () => {
  assert.ok(isAppEvent('visit_card-profile'));
  assert.ok(isAppEvent('visit_card-today'));
  assert.ok(!isAppEvent('visit_card-other'));
  const beacon = read('src/components/RefBeacon.tsx');
  const share = read('mobile/src/app/share-card.tsx');
  for (const ref of CARD_REFS) {
    assert.ok(beacon.includes(`'${ref}'`), `beacon knows ${ref}`);
    assert.ok(share.includes(`?ref=${ref}`), `share link carries ${ref}`);
  }
});
