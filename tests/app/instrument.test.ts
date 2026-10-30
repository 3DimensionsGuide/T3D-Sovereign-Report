import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { universalDayNumber } from '../../src/server/engines/dayNumerology';
import { dialPoint } from '../../src/components/home/instrumentArt';

const read = (p: string) => readFileSync(p, 'utf8');
const inst = read('src/components/home/Instrument.tsx');
const css = read('src/app/globals.css');

test('the day number is a real calculation, not a sample', () => {
  // Universal Day = reduce(month) + reduce(day) + reduce(year), masters kept.
  assert.equal(universalDayNumber('2026-10-30'), 5);
  assert.equal(universalDayNumber('2026-01-01'), 3);
  assert.equal(universalDayNumber('1999-12-31'), 8);
  assert.equal(universalDayNumber('2026-09-01'), 11, 'master numbers survive the reduction');
});

test('the surface reads today, and the clock covers the whole day', async () => {
  // Imported here, not at the top: the ephemeris is a native module, so a machine
  // without it built should skip this one test rather than drop the whole file.
  let buildTodayReading: typeof import('../../src/server/instrument/todayReading').buildTodayReading;
  try {
    ({ buildTodayReading } = await import('../../src/server/instrument/todayReading'));
  } catch {
    return;
  }
  const reading = await buildTodayReading(new Date('2026-10-30T16:00:00Z'));
  if (!reading) return;
  assert.equal(reading.date, '2026-10-30');
  assert.equal(reading.nowHour, 16);
  assert.equal(reading.sky.hours.length, 25);
  assert.equal(reading.sky.hours[0]?.hour, 0);
  assert.ok(reading.vehicle.gate >= 1 && reading.vehicle.gate <= 64);
  assert.ok(reading.vehicle.line >= 1 && reading.vehicle.line <= 6);
  assert.ok(reading.vehicle.name.length > 2);
  // The Moon moves roughly thirteen degrees in a day, which is what makes the act move.
  const travel = ((reading.sky.hours[24]!.moon - reading.sky.hours[0]!.moon) % 360 + 360) % 360;
  assert.ok(travel > 10 && travel < 16, `moon travelled ${travel} degrees`);
  for (const h of reading.sky.hours) {
    assert.ok(h.lit >= 0 && h.lit <= 1);
    assert.ok(h.elongation >= 0 && h.elongation < 360);
  }
});

test('the reading degrades honestly instead of throwing', () => {
  const src = read('src/server/instrument/todayReading.ts');
  assert.match(src, /\} catch \{\s*return null;/);
  assert.match(inst, /Offline/);
  assert.match(inst, /not answering right now/);
});

test('no number on the surface is counted up from zero', () => {
  assert.doesNotMatch(inst, /data-sc-count/);
});

test('the engine is vendored unedited and mounted with a teardown', () => {
  assert.ok(existsSync('src/vendor/scrollcraft/scrollcraft.js'));
  const engine = read('src/vendor/scrollcraft/scrollcraft.js');
  assert.match(engine, /scrollcraft: a scroll-driven interaction runtime/);
  assert.match(inst, /window\.ScrollCraft\.mount\(rootRef\.current\)/);
  assert.match(inst, /instance\?\.destroy\(\)/);
});

test('the live surface keeps its grammar: no scrub, no kinetic, no spotlight', () => {
  for (const banned of ['data-sc-scrub', 'data-sc-kinetic', 'data-sc-spotlight', 'data-sc-sequence']) {
    assert.ok(!inst.includes(banned), banned);
  }
  // At most two drift stops, and the peak is the longest act by a clear margin.
  assert.equal((inst.match(/data-sc-drift/g) ?? []).length, 1);
  const spans = [...inst.matchAll(/data-sc-span="([\d.]+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(spans, [1.4, 2.6]);
});

test('the close is a real field, answered by the real preview endpoint', () => {
  assert.match(inst, /<form className="inst-form" onSubmit=\{submit\}/);
  assert.match(inst, /'\/api\/app\/preview'/);
  assert.match(inst, /type="date"/);
  assert.match(css, /\.inst-input \{[^}]*min-height: 52px/);
  assert.match(css, /\.inst-submit \{[^}]*min-height: 52px/);
});

test('Reduce Motion is given the whole composition, not a stripped page', () => {
  const guard = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(guard, /\.inst \[data-sc-cue\], \.inst \[data-sc-in\], \.inst \[data-sc-reveal\]/);
  assert.match(guard, /opacity: 1 !important/);
  assert.match(guard, /clip-path: none !important/);
  assert.match(inst, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) return;/);
});

test('the dial places the Sun and Moon where the chart says they are', () => {
  // 0 Aries sits at the left of the wheel, and degrees run counter-clockwise.
  const aries = dialPoint(0, 100);
  assert.equal(aries.x, 50);
  assert.equal(aries.y, 150);
  const cancer = dialPoint(90, 100);
  assert.equal(cancer.y, 50);
  // Rounded, or the server and the browser disagree in the last digit.
  for (const d of [17, 123, 271]) {
    const p = dialPoint(d, 94);
    assert.equal(p.x, Math.round(p.x * 100) / 100);
  }
});

test('one action, one label, everywhere on the homepage', () => {
  for (const f of ['src/components/home/HomeView.tsx', 'src/components/navigation/Nav.tsx', 'src/components/home/Instrument.tsx']) {
    assert.match(read(f), /CALCULATE MY PROFILE/, f);
  }
  assert.ok(!read('src/components/navigation/Nav.tsx').includes('CALCULATE FREE'));
});

test('no em dash is left in copy a visitor reads on the homepage', () => {
  for (const f of ['src/components/home/Instrument.tsx', 'src/components/home/WhatsInside.tsx', 'src/components/home/FAQ.tsx', 'src/lib/products/catalog.ts']) {
    const body = read(f)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!body.includes('\u2014'), f);
  }
});
