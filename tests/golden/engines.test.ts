/**
 * Engine tests that need no reference data: each one checks the engines
 * against something independent (JavaScript's own date maths, published
 * astronomical events, the published Rave Mandala, or rules that must hold
 * for every chart).
 *
 * Run with: npm test
 */

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  localToJulianDay,
  getPlanetPositionsAtJD,
  calculateAstrology,
} from '@/server/engines/astrology';
import { calculateHumanDesign, longitudeToGate } from '@/server/engines/human_design';
import { calculateNumerology } from '@/server/engines/numerology';
import type { HDCenter } from '@/server/engines/types';
import { FIXTURES } from './fixtures';
import { angleDiff, jdFromDate } from './helpers';

// ─── 1. TIME ZONES ───────────────────────────────────────────────────────────

describe('local time → Julian Day', () => {
  const cases: Array<[string, string, string, string]> = [
    ['1990-07-01', '12:00', 'America/Los_Angeles', '1990-07-01T19:00:00Z'],
    ['1960-03-21', '06:00', 'Asia/Kolkata', '1960-03-21T00:30:00Z'],
    ['1950-05-05', '17:30', 'Europe/Moscow', '1950-05-05T14:30:00Z'],
    ['1985-06-15', '09:30', 'Asia/Singapore', '1985-06-15T02:00:00Z'],
    ['2012-12-21', '11:11', 'Asia/Kathmandu', '2012-12-21T05:26:00Z'],
  ];
  for (const [date, time, zone, utc] of cases) {
    test(`${date} ${time} in ${zone} is ${utc}`, () => {
      const jd = localToJulianDay(date, time, zone);
      assert.ok(Math.abs(jd - jdFromDate(new Date(utc))) < 1e-6, `got ${jd}`);
    });
  }

  test('a clock time that never happened (Berlin spring-forward) still resolves', () => {
    const jd = localToJulianDay('1993-03-28', '02:30', 'Europe/Berlin');
    const before = localToJulianDay('1993-03-28', '01:59', 'Europe/Berlin');
    const after = localToJulianDay('1993-03-28', '03:01', 'Europe/Berlin');
    assert.ok(jd > before - 1 / 24 && jd < after + 1 / 24);
  });
});

// ─── 2. SKY: PUBLISHED ASTRONOMICAL EVENTS ───────────────────────────────────

describe('Sun at the 2024 equinoxes and solstices', () => {
  const events: Array<[string, string, number]> = [
    ['March equinox', '2024-03-20T03:06:00Z', 0],
    ['June solstice', '2024-06-20T20:51:00Z', 90],
    ['September equinox', '2024-09-22T12:44:00Z', 180],
    ['December solstice', '2024-12-21T09:21:00Z', 270],
  ];
  for (const [name, utc, expected] of events) {
    test(`${name}: Sun is at ${expected}°`, () => {
      const sky = getPlanetPositionsAtJD(jdFromDate(new Date(utc)), 0, 0, false);
      assert.ok(Math.abs(angleDiff(sky.sun.longitude, expected)) < 0.01, `Sun at ${sky.sun.longitude}`);
    });
  }
});

describe('Lahiri ayanamsa', () => {
  const ayanamsa = (iso: string): number => {
    const jd = jdFromDate(new Date(iso));
    const trop = getPlanetPositionsAtJD(jd, 0, 0, false).sun.longitude;
    const sid = getPlanetPositionsAtJD(jd, 0, 0, true).sun.longitude;
    return ((trop - sid + 360) % 360);
  };
  test('about 23.86° at 2000-01-01', () => {
    const a = ayanamsa('2000-01-01T12:00:00Z');
    assert.ok(a > 23.84 && a < 23.87, `got ${a}`);
  });
  test('about 24.19° at 2024-01-01', () => {
    const a = ayanamsa('2024-01-01T12:00:00Z');
    assert.ok(a > 24.17 && a < 24.21, `got ${a}`);
  });
});

// ─── 3. SKY: RULES THAT MUST HOLD ON EVERY DATE ──────────────────────────────

/** About 90 dates spread across 1930–2030 at varied times of day. */
function sweepDates(): Date[] {
  const out: Date[] = [];
  for (let i = 0; i < 90; i += 1) {
    const ms = Date.UTC(1930, 0, 1) + i * 1.111 * 365.25 * 86_400_000 + (i % 24) * 3_600_000 + i * 7 * 60_000;
    out.push(new Date(ms));
  }
  return out;
}

describe('sky invariants over 90 dates', () => {
  for (const d of sweepDates()) {
    const iso = d.toISOString();
    test(iso, () => {
      const jd = jdFromDate(d);
      const trop = getPlanetPositionsAtJD(jd, 40, -75, false);
      const sid = getPlanetPositionsAtJD(jd, 40, -75, true);

      assert.ok(Math.abs(angleDiff(trop.mercury.longitude, trop.sun.longitude)) <= 28.5, 'Mercury too far from Sun');
      assert.ok(Math.abs(angleDiff(trop.venus.longitude, trop.sun.longitude)) <= 48, 'Venus too far from Sun');
      assert.ok(trop.moon.speed > 11.5 && trop.moon.speed < 15.5, `Moon speed ${trop.moon.speed}`);
      assert.ok(Math.abs(Math.abs(angleDiff(trop.northNode.longitude, trop.southNode.longitude)) - 180) < 1e-6, 'nodes not opposite');
      assert.ok(Math.abs(angleDiff(trop.earth.longitude, trop.sun.longitude + 180)) < 1e-6, 'Earth is not opposite the Sun');

      const offset = angleDiff(trop.sun.longitude, sid.sun.longitude);
      for (const k of ['moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const) {
        assert.ok(Math.abs(angleDiff(trop[k].longitude, sid[k].longitude) - offset) < 1e-4, `${k} sidereal offset differs`);
      }
      for (const k of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const) {
        assert.equal(trop[k].retrograde, trop[k].speed < 0, `${k} retrograde flag`);
      }
      assert.equal(trop.sun.retrograde, false);
      assert.equal(trop.moon.retrograde, false);
    });
  }
});

// ─── 4. RAVE MANDALA ─────────────────────────────────────────────────────────

describe('Rave Mandala', () => {
  test('302.0° is the start of gate 41, line 1', () => {
    assert.deepEqual(longitudeToGate(302.0), { gate: 41, line: 1 });
    assert.deepEqual(longitudeToGate(302.01), { gate: 41, line: 1 });
  });
  test('0° Aries falls in gate 25', () => {
    assert.equal(longitudeToGate(0).gate, 25);
  });
  test('published gate boundaries', () => {
    assert.equal(longitudeToGate(223.25).gate, 1);
    assert.equal(longitudeToGate(223.24).gate, 43);
    assert.equal(longitudeToGate(161.375).gate, 64);
    assert.equal(longitudeToGate(161.37).gate, 47);
  });
  test('opposite points on the wheel are the published opposite gates', () => {
    const pairs: Array<[number, number]> = [[41, 31], [25, 46], [1, 2], [64, 63]];
    for (const [a, b] of pairs) {
      let found = false;
      for (let lon = 0; lon < 360; lon += 0.5) {
        if (longitudeToGate(lon).gate === a) {
          assert.equal(longitudeToGate((lon + 180) % 360).gate, b, `gate ${a} should oppose ${b}`);
          found = true;
          break;
        }
      }
      assert.ok(found);
    }
  });
  test('walking the wheel visits all 384 gate/line pairs exactly once each', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 384; i += 1) {
      const lon = (302 + (i + 0.5) * 0.9375) % 360;
      const { gate, line } = longitudeToGate(lon);
      assert.ok(gate >= 1 && gate <= 64 && line >= 1 && line <= 6);
      seen.add(`${gate}.${line}`);
    }
    assert.equal(seen.size, 384);
  });
});

// ─── 5. HUMAN DESIGN RULES FOR EVERY CHART ───────────────────────────────────

const MOTORS: HDCenter[] = ['solar_plexus', 'sacral', 'heart', 'root'];
const VALID_PROFILES = new Set(['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']);

type HDInput = Parameters<typeof calculateHumanDesign>[0];

const hdInputs: Array<{ name: string; input: HDInput }> = [
  ...FIXTURES.map((f) => ({
    name: f.id,
    input: { birthDate: f.birthDate, birthTime: f.birthTime, latitude: f.latitude, longitude: f.longitude, timezone: f.timezone },
  })),
  ...sweepDates().slice(0, 60).map((d) => ({
    name: `sweep ${d.toISOString().slice(0, 16)}`,
    input: {
      birthDate: d.toISOString().slice(0, 10),
      birthTime: d.toISOString().slice(11, 16),
      latitude: 40, longitude: 0, timezone: 'UTC',
    },
  })),
];

/** The Type the T3D sources describe: a motor reaches the Throat by ANY chain of defined channels. */
function expectedType(centers: Set<HDCenter>, channels: Array<{ fromCenter: HDCenter; toCenter: HDCenter }>): string {
  if (centers.size === 0) return 'Reflector';
  const adj = new Map<HDCenter, HDCenter[]>();
  for (const c of channels) {
    adj.set(c.fromCenter, [...(adj.get(c.fromCenter) ?? []), c.toCenter]);
    adj.set(c.toCenter, [...(adj.get(c.toCenter) ?? []), c.fromCenter]);
  }
  const reach = new Set<HDCenter>(['throat']);
  const queue: HDCenter[] = ['throat'];
  while (queue.length) {
    const cur = queue.pop() as HDCenter;
    for (const n of adj.get(cur) ?? []) {
      if (!reach.has(n)) { reach.add(n); queue.push(n); }
    }
  }
  const motorReachesThroat = centers.has('throat') && MOTORS.some((m) => centers.has(m) && reach.has(m));
  if (centers.has('sacral')) return motorReachesThroat ? 'Manifesting Generator' : 'Generator';
  return motorReachesThroat ? 'Manifestor' : 'Projector';
}

describe('Human Design rules', () => {
  for (const { name, input } of hdInputs) {
    test(`structure: ${name}`, () => {
      const hd = calculateHumanDesign(input);
      const centers = new Set<HDCenter>(hd.definedCenters);
      const gates = hd.activeGates;

      assert.equal(gates.length, 26);
      for (const epoch of ['personality', 'design'] as const) {
        const mine = gates.filter((g) => g.epoch === epoch);
        assert.equal(new Set(mine.map((g) => g.planet)).size, 13, `${epoch} planets`);
      }
      for (const g of gates) {
        assert.deepEqual(longitudeToGate(g.longitude), { gate: g.gate, line: g.line });
      }

      const pSun = gates.find((g) => g.epoch === 'personality' && g.planet === 'sun');
      const dSun = gates.find((g) => g.epoch === 'design' && g.planet === 'sun');
      assert.ok(pSun && dSun);
      assert.ok(Math.abs(angleDiff(pSun.longitude, dSun.longitude) - 88) < 0.01, 'Design Sun is not 88° before');
      assert.equal(hd.profile, `${pSun.line}/${dSun.line}`);
      assert.ok(VALID_PROFILES.has(hd.profile), hd.profile);

      const fromChannels = new Set<HDCenter>();
      for (const c of hd.activeChannels) { fromChannels.add(c.fromCenter); fromChannels.add(c.toCenter); }
      assert.deepEqual([...centers].sort(), [...fromChannels].sort());

      const activeGateNums = new Set(gates.map((g) => g.gate));
      for (const c of hd.activeChannels) {
        assert.ok(c.gates.every((g) => activeGateNums.has(g)), 'channel with an unlit gate');
      }

      assert.equal(hd.type === 'Reflector', centers.size === 0);
      if (centers.has('sacral')) assert.ok(hd.type === 'Generator' || hd.type === 'Manifesting Generator');
      else assert.ok(hd.type !== 'Generator' && hd.type !== 'Manifesting Generator');

      if (centers.has('solar_plexus')) assert.equal(hd.authority, 'Emotional');
      else if (centers.has('sacral')) assert.equal(hd.authority, 'Sacral');
      else if (centers.has('spleen')) assert.equal(hd.authority, 'Splenic');
    });
  }

  // This test is the one that exposes the Type bug found while building the suite.
  // It checks the engine against the rule in the T3D NotebookLM sources: a motor
  // connected to the Throat by ANY continuous chain of defined channels.
  test('Type follows the motor-to-Throat rule (direct or through other centers)', () => {
    const wrong: string[] = [];
    for (const { name, input } of hdInputs) {
      const hd = calculateHumanDesign(input);
      const want = expectedType(new Set<HDCenter>(hd.definedCenters), hd.activeChannels);
      if (want !== hd.type) wrong.push(`${name}: engine says ${hd.type}, rule says ${want}`);
    }
    assert.deepEqual(wrong, [], `\n${wrong.length} chart(s) have the wrong Type:\n${wrong.join('\n')}`);
  });
});

// ─── 6. NUMEROLOGY: ANCHORS FROM AN INDEPENDENT PYTHON IMPLEMENTATION ────────

describe('numerology anchors', () => {
  const anchors: Array<{
    first: string; middle?: string; last: string; date: string;
    lp: number; destiny: number; personality: number; soul: number; hidden: number; karmic: number[];
  }> = [
    { first: 'Lucia', last: 'Kim-Lopez', date: '1956-08-22', lp: 33, destiny: 9, personality: 3, soul: 6, hidden: 3, karmic: [] },
    { first: 'Yvonne', last: 'Kim-Lopez', date: '1968-09-16', lp: 22, destiny: 4, personality: 9, soul: 4, hidden: 5, karmic: [1] },
    { first: 'Zoe', middle: 'Jordan', last: 'Yoder', date: '2013-01-03', lp: 1, destiny: 4, personality: 11, soul: 11, hidden: 5, karmic: [2, 3] },
    { first: 'Omar', last: 'Henry', date: '2004-01-17', lp: 6, destiny: 9, personality: 8, soul: 1, hidden: 5, karmic: [2, 3] },
    { first: 'Yvonne', last: 'Nguyen', date: '1985-07-03', lp: 6, destiny: 1, personality: 9, soul: 1, hidden: 5, karmic: [1, 2, 8, 9] },
    { first: 'Alex', middle: 'Ray', last: 'Kim-Lopez', date: '1980-01-08', lp: 9, destiny: 22, personality: 22, soul: 9, hidden: 1, karmic: [] },
  ];
  for (const a of anchors) {
    test(`${a.first} ${a.middle ?? ''} ${a.last} ${a.date}`.replace('  ', ' '), () => {
      const n = calculateNumerology({ firstName: a.first, middleName: a.middle, lastName: a.last, birthDate: a.date });
      assert.equal(n.lifePath, a.lp);
      assert.equal(n.destiny, a.destiny);
      assert.equal(n.personality, a.personality);
      assert.equal(n.soulUrge, a.soul);
      assert.equal(n.hiddenPassion, a.hidden);
      assert.deepEqual([...n.karmicLessons].sort((x, y) => x - y), a.karmic);
    });
  }

  test('master-number life paths use the reduced path for pinnacle ages', { todo: 'Pinnacle/Challenge transition ages use 36 − 22 = 14 for a 22 life path; the traditional rule uses the reduced 4 (age 32). Needs Tyler to decide.' }, () => {
    const n = calculateNumerology({ firstName: 'Yvonne', lastName: 'Kim-Lopez', birthDate: '1968-09-16' });
    assert.equal(n.pinnacles[0].endAge, 32);
  });
});

// Keeps the import used even if fixtures change.
void calculateAstrology;
