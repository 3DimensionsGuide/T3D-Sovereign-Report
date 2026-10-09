import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTransitCard, pickAuthorityKey, pickTypeKey,
  TRANSIT_BODIES, TRANSIT_NATALS, TRANSIT_ASPECTS, TRANSIT_NATURES,
} from '../../src/lib/app/transitCard';

const vehicle = { type: 'Projector', authority: 'Splenic' };

test('every body x natal x aspect combination builds a complete card', () => {
  for (const transiting of TRANSIT_BODIES) {
    for (const natal of TRANSIT_NATALS) {
      for (const aspect of TRANSIT_ASPECTS) {
        const card = buildTransitCard(
          { transiting, natal, aspect, nature: 'neutral', orb: 1.2, peak: false, applying: true }, vehicle);
        const label = `${transiting}/${natal}/${aspect}`;
        assert.ok(card.title && card.whatItIs && card.whereItLands && card.invitation, label);
        assert.ok(!/undefined|\[object/.test(JSON.stringify(card)), label);
      }
    }
  }
});

test('every nature has its own line and frame', () => {
  const base = { transiting: 'mars', natal: 'sun', aspect: 'square', orb: 2, peak: false, applying: true } as const;
  const cards = TRANSIT_NATURES.map((nature) => buildTransitCard({ ...base, nature }, vehicle));
  assert.equal(new Set(cards.map((c) => c.natureLine)).size, 3);
  assert.equal(new Set(cards.map((c) => c.meetIt.frame)).size, 3);
});

test('timing text reflects peak and applying/separating', () => {
  const mk = (peak: boolean, applying: boolean) =>
    buildTransitCard({ transiting: 'saturn', natal: 'moon', aspect: 'square', nature: 'friction', orb: 0.4, peak, applying }, vehicle).timingState;
  assert.match(mk(true, true), /peak.*building/);
  assert.match(mk(true, false), /peak.*ease/);
  assert.match(mk(false, true), /building toward exact/);
  assert.match(mk(false, false), /fading/);
});

test('unknown type or authority leaves personal lines empty, not broken', () => {
  const card = buildTransitCard(
    { transiting: 'venus', natal: 'moon', aspect: 'trine', nature: 'flow', orb: 3, peak: false, applying: false },
    { type: null, authority: null });
  assert.equal(card.meetIt.strategy, null);
  assert.equal(card.meetIt.authority, null);
  assert.equal(card.meetIt.cue, null);
  assert.ok(card.reminder.includes('not a command'));
});

test('type and authority keys resolve', () => {
  assert.ok(pickTypeKey('Manifesting Generator'));
  assert.equal(pickTypeKey(null), null);
  assert.equal(pickAuthorityKey(null), null);
  assert.ok(pickAuthorityKey('Emotional'));
});

test('related glossary keys always include the transit, aspect and orb', () => {
  const card = buildTransitCard(
    { transiting: 'jupiter', natal: 'ascendant', aspect: 'trine', nature: 'flow', orb: 1, peak: true, applying: true }, vehicle);
  assert.ok(card.related.includes('astro:planet:jupiter'));
  assert.ok(card.related.includes('astro:aspect:trine'));
  assert.ok(card.related.includes('astro:ascendant'));
  assert.ok(card.related.includes('astro:orb'));
});
