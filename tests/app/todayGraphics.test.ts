import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBodygraphChip } from '../../mobile/src/lib/bodygraphChip';
import { BADGE_GAP, buildTransitWheel, hasWheelPositions, spreadAngles, wheelAngle, wheelPoint, type WheelHit } from '../../mobile/src/lib/transitWheel';

test('chip draws all nine centers and fills only the defined ones', () => {
  const chip = buildBodygraphChip(['throat', 'sacral'], null);
  assert.equal(chip.centers.length, 9);
  assert.deepEqual(chip.centers.filter((c) => c.defined).map((c) => c.id).sort(), ['sacral', 'throat']);
  assert.equal(chip.gates.length, 0);
  assert.match(chip.sentence, /Defined: Throat and Sacral\./);
});

test('chip lights the Sun and Moon gates and says when one is yours', () => {
  const chip = buildBodygraphChip(['throat'], { sun: { gate: 32, line: 2 }, moon: { gate: 7, line: 4 } }, [7, 12]);
  assert.equal(chip.gates.length, 2);
  assert.equal(chip.gates[0].who, 'sun');
  assert.equal(chip.gates[0].yours, false);
  assert.equal(chip.gates[1].yours, true);
  assert.match(chip.sentence, /Sun in gate 32\.2/);
  assert.match(chip.sentence, /Moon in gate 7\.4 \(one of yours\)/);
  assert.match(chip.spoken, /Opens the full bodygraph/);
});

test('chip handles a Reflector with no defined centers', () => {
  const chip = buildBodygraphChip([], null);
  assert.match(chip.sentence, /Reflector/);
});

test('chip scales to the requested height', () => {
  const chip = buildBodygraphChip([], null, [], 60);
  assert.equal(chip.height, 60);
  assert.equal(chip.width, 40);
});

test('wheel angle puts Aries at the left and Cancer at the bottom', () => {
  assert.ok(Math.abs(wheelAngle(0) - Math.PI) < 1e-9);
  const [x, y] = wheelPoint(0, 10, 50);
  assert.equal(x, 40);
  assert.equal(y, 50);
  const [x2, y2] = wheelPoint(90, 10, 50); // Cancer, bottom
  assert.equal(x2, 50);
  assert.equal(y2, 60);
});

const hit = (over: Partial<WheelHit>): WheelHit => ({
  transiting: 'saturn', natal: 'sun', aspect: 'square', orb: 0.5, applying: true, nature: 'friction',
  transitLongitude: 100, natalLongitude: 10, ...over,
});

test('wheel keeps the tightest contacts, tightest first, and draws friction dashed', () => {
  const hits = [hit({ orb: 2.5, transiting: 'mars' }), hit({ orb: 0.4 }), hit({ orb: 1.5, transiting: 'venus', nature: 'flow' })];
  const w = buildTransitWheel(hits);
  assert.deepEqual(w.chords.map((c) => c.rank), [0, 1, 2]);
  assert.equal(w.chords[0].key, 'saturn-sun-square');
  assert.equal(w.chords[0].dashed, true);
  assert.equal(w.chords[1].dashed, false);
  assert.ok(w.chords[0].strokeWidth > w.chords[2].strokeWidth);
  assert.match(w.spoken, /^Today's tightest contacts to your chart, closest first\. 1\. Saturn square your Sun, 0\.4 degrees from exact, friction\./);
});

test('wheel caps chords at three, numbers them, and shares dots between chords', () => {
  const many = Array.from({ length: 9 }, (_, i) => hit({ orb: i * 0.3 }));
  const w = buildTransitWheel(many);
  assert.equal(w.chords.length, 3);
  assert.deepEqual(w.chords.map((c) => c.number), [1, 2, 3]);
  assert.equal(w.dots.length, 2);
  assert.equal(w.ticks.length, 12);
});

test('wheel ignores hits without positions and reports a quiet sky', () => {
  const bare = [hit({ transitLongitude: undefined })];
  assert.equal(hasWheelPositions(bare), false);
  const w = buildTransitWheel(bare);
  assert.equal(w.chords.length, 0);
  assert.match(w.spoken, /No close contacts/);
});

test('wheel labels of close neighbours on your ring are pushed apart', () => {
  const w = buildTransitWheel([
    hit({ natal: 'sun', transitLongitude: 100, natalLongitude: 10 }),
    hit({ natal: 'moon', transitLongitude: 200, natalLongitude: 15, orb: 1 }),
  ]);
  const inner = w.dots.filter((d) => d.ring === 'inner');
  assert.equal(inner.length, 2);
  assert.ok(Math.hypot(inner[0].lx - inner[1].lx, inner[0].ly - inner[1].ly) >= 15.5);
  assert.ok(w.dots.filter((d) => d.ring === 'outer').every((d) => d.label === ''), 'sky planets are named in the list');
});

test('badges stay apart even when the sky planets are almost on top of each other', () => {
  const w = buildTransitWheel([
    hit({ transiting: 'jupiter', natal: 'midheaven', orb: 0, transitLongitude: 100, natalLongitude: 100 }),
    hit({ transiting: 'mars', natal: 'sun', orb: 0.6, transitLongitude: 101, natalLongitude: 20 }),
    hit({ transiting: 'venus', natal: 'moon', orb: 1.2, transitLongitude: 103, natalLongitude: 50 }),
  ]);
  for (let i = 0; i < w.chords.length; i++) {
    for (let j = i + 1; j < w.chords.length; j++) {
      const d = Math.hypot(w.chords[i].bx - w.chords[j].bx, w.chords[i].by - w.chords[j].by);
      assert.ok(d >= BADGE_GAP - 1, `badges ${i + 1} and ${j + 1} are ${d.toFixed(1)} apart`);
    }
  }
  // Every badge stays inside the picture so its whole touch target can be pressed.
  for (const c of w.chords) {
    assert.ok(c.bx - 24 >= 0 && c.bx + 24 <= w.size && c.by - 24 >= 0 && c.by + 24 <= w.size);
  }
  assert.equal(w.chords[0].phrase, 'Jupiter square your Midheaven');
});

test('spreadAngles leaves well-separated angles alone and handles the wrap past 360 degrees', () => {
  const spread = spreadAngles([0, 2, 4], 100);
  assert.deepEqual(spread.map((a) => Math.round(a * 1000) / 1000), [0, 2, 4]);
  const tight = spreadAngles([6.2, 0.05], 100);
  const gap = Math.min(Math.abs(tight[0] - tight[1]), Math.PI * 2 - Math.abs(tight[0] - tight[1]));
  assert.ok(gap * 100 >= BADGE_GAP - 0.5);
});

test('chip keeps the Sun and Moon markers apart when their gates are neighbours', () => {
  const chip = buildBodygraphChip(['spleen'], { sun: { gate: 57, line: 5 }, moon: { gate: 44, line: 2 } });
  const [s, m] = chip.gates;
  assert.ok(Math.hypot(m.x - s.x, m.y - s.y) >= 11.9);
});
