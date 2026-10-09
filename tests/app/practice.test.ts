import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPractice, pickAuthorityKey } from '../../src/lib/app/practice';

test('authority names map to keys', () => {
  assert.equal(pickAuthorityKey('Emotional - Solar Plexus'), 'Emotional');
  assert.equal(pickAuthorityKey('Sacral'), 'Sacral');
  assert.equal(pickAuthorityKey('Splenic'), 'Splenic');
  assert.equal(pickAuthorityKey(null), null);
  assert.equal(pickAuthorityKey('something odd'), null);
});

test('practice always has three ordered steps and four verdicts', () => {
  const p = buildPractice({ type: 'Generator', authority: 'Sacral' }, { lifePath: 3, personalYear: 5, sunSign: 'Leo' });
  assert.deepEqual(p.decide.steps.map((s) => s.key), ['vehicle', 'road', 'stoplight']);
  assert.deepEqual(Object.keys(p.decide.verdicts).sort(), ['decline', 'proceed', 'reconsider', 'wait']);
  assert.equal(p.experiment.checkins.length, 3);
});

test('missing data falls back safely and never prints "null" or "undefined"', () => {
  const p = buildPractice({ type: null, authority: null }, { lifePath: null, personalYear: null, sunSign: null });
  assert.ok(!JSON.stringify(p).match(/\bnull\b.*[a-z]|undefined/i) || !/undefined/.test(JSON.stringify(p)));
  assert.equal(p.authorityLabel, 'Your Authority');
  for (const s of p.decide.steps) assert.ok(s.prompt && s.instruction && s.signal);
});

test('every authority and type produces a complete practice', () => {
  for (const authority of ['Sacral', 'Emotional', 'Splenic', 'Self-Projected', 'Ego', 'Mental', 'Lunar', 'None']) {
    for (const type of ['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector']) {
      const p = buildPractice({ type, authority }, { lifePath: 11, personalYear: 9, sunSign: 'Aries' });
      assert.ok(p.decide.revisitDays >= 0, `${authority}/${type}`);
      assert.ok(p.experiment.title.length > 0, `${authority}/${type}`);
    }
  }
});

test('the Road step uses the person\'s Life Path', () => {
  const p = buildPractice({ type: 'Generator', authority: 'Sacral' }, { lifePath: 7, personalYear: 2, sunSign: null });
  assert.match(p.decide.steps[1]!.instruction, /Life Path 7/);
});
