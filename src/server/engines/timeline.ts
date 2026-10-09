/**
 * T3D — Timeline engine
 *
 * Builds the app's Timeline for one person over a date range: the sky's
 * scheduled events measured against THEIR natal chart, plus their numerology
 * cycles. Rules come from the T3D PHILOSOPHER knowledge base (via NotebookLM):
 *
 *  - Natal targets: Ascendant, Midheaven, Sun, Moon, Mercury, Venus, Mars,
 *    Jupiter, Saturn. Five Ptolemaic aspects only. Orb <= 1 degree = peak,
 *    <= 3 degrees = active window.
 *  - Daily drivers (Sun, Mercury, Venus, Mars) and the outer cycles (Jupiter,
 *    Saturn, Uranus, Neptune, Pluto) are tracked as exact aspects. The Moon is
 *    tracked through lunations only (its daily detail lives on the Today screen).
 *  - Saturn and Jupiter returns, and the Solar Return (birthday), are labelled.
 *  - Lunations: new / first quarter / full / third quarter. Eclipses: solar and
 *    lunar. Retrograde stations: Mercury, Venus, Mars.
 *  - Annual Profections: one whole-sign house per year from the natal Ascendant
 *    sign, birthday to birthday, with the TRADITIONAL ruler as Lord of the Year.
 *    Events that touch the Lord of the Year or fall in the profected house are
 *    flagged.
 *  - Numerology timing: Personal Year = reduce(birth month + birth day +
 *    Universal Year of the year your last birthday fell in; it runs birthday to birthday), Personal Month = reduce(PY + month), Personal Day =
 *    reduce(PM + day). Master numbers 11 / 22 / 33 are preserved.
 *  - Transits are neutral weather: classified flow / friction / neutral, never
 *    scored. Decisions go through Strategy and Authority.
 *
 * Uses `sweph` exactly like transits.ts and dailySky.ts; the small ephemeris
 * setup is duplicated on purpose so this file can't change existing behaviour.
 */

import fs from 'fs';
import type { NumerologyCycle, ZodiacSign } from './types';
import type {
  AspectNature,
  DailyAspect,
  NatalPointName,
  NatalSkyPoints,
  SkyBody,
} from './dailySky';
import { CHALLENGE_THEMES, PINNACLE_THEMES } from '../../lib/report/section4/road-content';
import { personalYearBase } from './dayNumerology';

// ─── PUBLIC TYPES ────────────────────────────────────────────────────────────

export type TimelineKind = 'lunation' | 'eclipse' | 'station' | 'ingress' | 'transit' | 'return';

export interface TimelineEvent {
  id: string;
  /** Exact moment, ISO timestamp (UTC). The app shows it in the phone's own time zone. */
  at: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  body?: SkyBody;
  natal?: NatalPointName;
  aspect?: DailyAspect;
  nature: AspectNature;
  /** Whole-sign house (1–12) the event lands in, when it has a position. */
  house?: number;
  /** Zodiac position text of the event, e.g. "14°32' Libra". */
  position?: string;
  /** True if this event involves the Lord of the Year. */
  lord?: boolean;
  /** True if the event falls in this year's profected house. */
  profectedHouse?: boolean;
  /** Transit passes: the span (ISO dates) the aspect is within 3 degrees, and within 1 degree. */
  windowStart?: string;
  windowEnd?: string;
  peakStart?: string;
  peakEnd?: string;
  /** Transit passes: whether the transiting planet is retrograde at the exact moment. */
  retrograde?: boolean;
}

export interface ActiveSeason {
  body: SkyBody;
  natal: NatalPointName;
  aspect: DailyAspect;
  nature: AspectNature;
  /** Degrees off exact at the start of the range. */
  orb: number;
  windowStart: string;
  windowEnd: string;
  /** Exact passes (ISO timestamps) inside the window. Empty if the planet turns back before reaching exact. */
  exactAt: string[];
  /** The tightest the aspect gets inside the window (always present). */
  closest: { at: string; orb: number };
  lord: boolean;
}

export interface Profection {
  age: number;
  house: number;
  sign: ZodiacSign;
  lord: SkyBody;
  /** ISO dates, birthday to the day before the next birthday. */
  startsOn: string;
  endsOn: string;
}

export interface PersonalDay {
  /** YYYY-MM-DD in the person's own calendar. */
  date: string;
  year: number;
  month: number;
  day: number;
}

export interface CycleWindow {
  label: string;
  number: number;
  startAge: number;
  endAge: number | null;
  /** ISO dates of the birthdays that bound this cycle. */
  startsOn: string;
  endsOn: string | null;
  theme?: string;
  terrain: string;
  skill?: string;
  reframe?: string;
}

export interface TimelineResult {
  from: string;
  to: string;
  events: TimelineEvent[];
  seasons: ActiveSeason[];
  profection: Profection;
  universalYear: number;
  personal: PersonalDay[];
  pinnacle: { current: CycleWindow; next: CycleWindow | null };
  challenge: { current: CycleWindow; next: CycleWindow | null };
  numberMeanings: Record<number, { word: string; line: string }>;
}

export interface TimelineInput {
  natal: NatalSkyPoints;
  /** YYYY-MM-DD */
  birthDate: string;
  pinnacles: NumerologyCycle[];
  challenges: NumerologyCycle[];
  /** The person's current calendar date, YYYY-MM-DD (from their phone). */
  localDate: string;
  /** Minutes behind UTC for their phone (JS getTimezoneOffset). */
  tzOffsetMinutes: number;
  days: number;
}

// ─── EPHEMERIS SETUP (duplicated from dailySky.ts on purpose) ────────────────

interface SwephCalcResult { flag: number; error?: string; data: number[] }
interface SwephEclipse { flag: number; error?: string; data: number[] }
interface Sweph {
  constants: {
    SE_GREG_CAL: number;
    SEFLG_SPEED: number;
    SEFLG_MOSEPH: number;
    SE_SUN: number; SE_MOON: number; SE_MERCURY: number; SE_VENUS: number; SE_MARS: number;
    SE_JUPITER: number; SE_SATURN: number; SE_URANUS: number; SE_NEPTUNE: number; SE_PLUTO: number;
  };
  set_ephe_path: (path: string) => void;
  julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  calc_ut: (tjdUt: number, ipl: number, iflag: number) => SwephCalcResult;
  sol_eclipse_when_glob: (tjdStart: number, ifl: number, ifltype: number, backwards: boolean) => SwephEclipse;
  lun_eclipse_when: (tjdStart: number, ifl: number, ifltype: number, backwards: boolean) => SwephEclipse;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sweph = require('sweph') as Sweph;

let ephemerisReady = false;
let useMoshier = false;

function initEphemeris(): void {
  if (ephemerisReady) return;
  const ephePath = process.env.EPHE_PATH ?? '';
  if (ephePath) {
    sweph.set_ephe_path(ephePath);
    try {
      if (!fs.readdirSync(ephePath).some((f) => f.endsWith('.se1'))) useMoshier = true;
    } catch {
      useMoshier = true;
    }
  } else {
    useMoshier = true;
  }
  ephemerisReady = true;
}

const BODY_IDS: Record<SkyBody, number> = {
  moon: sweph.constants.SE_MOON,
  sun: sweph.constants.SE_SUN,
  mercury: sweph.constants.SE_MERCURY,
  venus: sweph.constants.SE_VENUS,
  mars: sweph.constants.SE_MARS,
  jupiter: sweph.constants.SE_JUPITER,
  saturn: sweph.constants.SE_SATURN,
  uranus: sweph.constants.SE_URANUS,
  neptune: sweph.constants.SE_NEPTUNE,
  pluto: sweph.constants.SE_PLUTO,
};

const ZODIAC: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Traditional rulers (the framework never uses Uranus / Neptune / Pluto as rulers). */
const TRADITIONAL_RULER: SkyBody[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];

const BODY_LABEL: Record<SkyBody, string> = {
  moon: 'Moon', sun: 'Sun', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

const NATAL_LABEL: Record<NatalPointName, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', ascendant: 'Rising sign', midheaven: 'Midheaven',
};

const ASPECT_ANGLES: Record<DailyAspect, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};
const ASPECT_VERB: Record<DailyAspect, string> = {
  conjunction: 'meets', sextile: 'sextiles', square: 'squares', trine: 'trines', opposition: 'opposes',
};

const PEAK_ORB = 1;
const ACTIVE_ORB = 3;
const MS_PER_DAY = 86_400_000;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

// ─── SMALL HELPERS ───────────────────────────────────────────────────────────

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;
/** Signed difference a − b in [-180, 180). */
const signedDiff = (a: number, b: number): number => ((a - b + 540) % 360) - 180;
const signIndex = (lon: number): number => Math.floor(normalize(lon) / 30);

const jdToDate = (jd: number): Date => new Date(J2000_MS + (jd - 2451545.0) * MS_PER_DAY);
const dateToJd = (d: Date): number => 2451545.0 + (d.getTime() - J2000_MS) / MS_PER_DAY;
const iso = (jd: number): string => jdToDate(jd).toISOString();
const isoDay = (jd: number): string => jdToDate(jd).toISOString().slice(0, 10);

function wholeSignHouse(lon: number, ascendant: number): number {
  return ((signIndex(lon) - signIndex(ascendant) + 12) % 12) + 1;
}

function formatLon(lon: number): string {
  const l = normalize(lon);
  const idx = Math.floor(l / 30);
  const inSign = l - idx * 30;
  const deg = Math.floor(inSign);
  const min = Math.floor((inSign - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}' ${ZODIAC[idx]!}`;
}

interface Pos { lon: number; speed: number }

function posAt(body: SkyBody, jd: number): Pos {
  initEphemeris();
  const flags = sweph.constants.SEFLG_SPEED | (useMoshier ? sweph.constants.SEFLG_MOSEPH : 0);
  const r = sweph.calc_ut(jd, BODY_IDS[body], flags);
  if (r.error && r.flag < 0) throw new Error(`ephemeris error for ${body}: ${r.error}`);
  return { lon: normalize(r.data[0]!), speed: r.data[3]! };
}

/** Bisection on a function that changes sign between a and b. */
function bisect(f: (jd: number) => number, a: number, b: number, iterations = 36): number {
  let lo = a;
  let hi = b;
  const flo = f(lo);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if ((fm < 0) === (flo < 0)) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function classify(aspect: DailyAspect, transiting: SkyBody): AspectNature {
  if (aspect === 'trine' || aspect === 'sextile') return 'flow';
  if (aspect === 'square' || aspect === 'opposition') return 'friction';
  if (transiting === 'jupiter' || transiting === 'venus') return 'flow';
  if (transiting === 'mars' || transiting === 'saturn') return 'friction';
  return 'neutral';
}

const NATURE_LINE: Record<AspectNature, string> = {
  flow: 'A flowing contact: conditions tend to ease the way.',
  friction: 'A frictional contact: conditions ask for adjustment.',
  neutral: 'A blending contact: two energies meet and merge.',
};

// ─── NUMEROLOGY ──────────────────────────────────────────────────────────────

const digitSum = (n: number): number =>
  String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0);

/** Reduce to 1–9, preserving master numbers 11 / 22 / 33. */
function reduceKeepMasters(n: number): number {
  let v = n;
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) v = digitSum(v);
  return v;
}

const NUMBER_MEANINGS: Record<number, { word: string; line: string }> = {
  1: { word: 'Beginnings', line: 'Independence, new starts, self-reliance and original leadership.' },
  2: { word: 'Partnership', line: 'Harmony, diplomacy, patience and emotional sensitivity.' },
  3: { word: 'Expression', line: 'Creative self-expression, communication and optimism.' },
  4: { word: 'Foundations', line: 'Hard work, practical structure, organization and disciplined effort.' },
  5: { word: 'Change', line: 'Freedom, change, adaptability and adventure.' },
  6: { word: 'Responsibility', line: 'Home, family, nurturing service and accepting imperfection.' },
  7: { word: 'Reflection', line: 'Introspection, research, spiritual development and inner trust.' },
  8: { word: 'Authority', line: 'Empowerment, executive authority, financial mastery and material balance.' },
  9: { word: 'Completion', line: 'Compassion, endings, humanitarian service and letting go.' },
  11: { word: 'Illumination', line: 'Master number 11/2: inspired illumination, heightened intuition, spiritual leadership.' },
  22: { word: 'Master Builder', line: 'Master number 22/4: turning large-scale visions into practical reality.' },
  33: { word: 'Master Teacher', line: 'Master number 33/6: selfless service and universal care.' },
};

function birthdayOnAge(birthDate: string, age: number): Date {
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y + age, m - 1, d));
}

function ageOn(birthDate: string, date: Date): number {
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  let age = date.getUTCFullYear() - y;
  const bday = Date.UTC(date.getUTCFullYear(), m - 1, d);
  if (date.getTime() < bday) age -= 1;
  return age;
}

function cycleWindow(
  cycle: NumerologyCycle,
  birthDate: string,
  kind: 'pinnacle' | 'challenge',
): CycleWindow {
  const startsOn = birthdayOnAge(birthDate, cycle.startAge).toISOString().slice(0, 10);
  const endsOn = cycle.endAge == null ? null : birthdayOnAge(birthDate, cycle.endAge).toISOString().slice(0, 10);
  if (kind === 'pinnacle') {
    const t = PINNACLE_THEMES[cycle.number];
    return {
      label: cycle.label, number: cycle.number, startAge: cycle.startAge, endAge: cycle.endAge,
      startsOn, endsOn, theme: t?.theme, terrain: t?.terrain ?? '',
    };
  }
  const t = CHALLENGE_THEMES[cycle.number];
  return {
    label: cycle.label, number: cycle.number, startAge: cycle.startAge, endAge: cycle.endAge,
    startsOn, endsOn, terrain: t?.terrain ?? '', skill: t?.skill, reframe: t?.reframe,
  };
}

function pickCycles(
  cycles: NumerologyCycle[],
  age: number,
  birthDate: string,
  kind: 'pinnacle' | 'challenge',
): { current: CycleWindow; next: CycleWindow | null } {
  const idx = Math.max(
    0,
    cycles.findIndex((c) => age >= c.startAge && (c.endAge == null || age < c.endAge)),
  );
  const current = cycles[idx]!;
  const next = cycles[idx + 1] ?? null;
  return {
    current: cycleWindow(current, birthDate, kind),
    next: next ? cycleWindow(next, birthDate, kind) : null,
  };
}

// ─── LUNAR / ECLIPSE TEXT ────────────────────────────────────────────────────

const LUNATION = [
  { angle: 0, title: 'New Moon', line: 'Seed-planting. A new 29.5-day cycle begins: initiation and inward brewing.' },
  { angle: 90, title: 'First Quarter Moon', line: 'Action. Momentum builds as the first friction is overcome.' },
  { angle: 180, title: 'Full Moon', line: 'Peak illumination. Culmination, heightened emotional clarity and fruition.' },
  { angle: 270, title: 'Third Quarter Moon', line: 'Review and integration. Clearing out old patterns.' },
] as const;

function solarEclipseKind(flag: number): string {
  if (flag & 4) return 'Total';
  if (flag & 8) return 'Annular';
  if (flag & 32) return 'Hybrid';
  return 'Partial';
}
function lunarEclipseKind(flag: number): string {
  if (flag & 4) return 'Total';
  if (flag & 16) return 'Partial';
  return 'Penumbral';
}

const STATION_LINE: Record<'mercury' | 'venus' | 'mars', { retro: string; direct: string }> = {
  mercury: {
    retro: 'Review season: re-evaluation, communication and logistics adjustments, and re-walking old ground.',
    direct: 'Forward motion resumes. What was reviewed is ready to move ahead.',
  },
  venus: {
    retro: 'Review of relationships, values, self-worth and financial ties.',
    direct: 'Forward motion resumes. Revised values and bonds are ready to move ahead.',
  },
  mars: {
    retro: 'Re-evaluating drive, energy spending and ambition, and resolving underlying friction.',
    direct: 'Forward motion resumes. Energy can be spent outward again.',
  },
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

export function calculateTimeline(input: TimelineInput): TimelineResult {
  initEphemeris();
  const { natal } = input;
  const days = Math.min(Math.max(Math.round(input.days), 7), 120);

  // Range: the person's local midnight today → +days.
  const [ly, lm, ld] = input.localDate.split('-').map(Number) as [number, number, number];
  const fromDate = new Date(Date.UTC(ly, lm - 1, ld) + input.tzOffsetMinutes * 60_000);
  const startJd = dateToJd(fromDate);
  const endJd = startJd + days;
  const localMidnightUtc = new Date(Date.UTC(ly, lm - 1, ld)); // calendar-date reference for numerology/profection

  // Profection (Lord of the Year)
  const age = ageOn(input.birthDate, localMidnightUtc);
  const profHouse = (age % 12) + 1;
  const profSignIdx = (signIndex(natal.ascendant) + profHouse - 1) % 12;
  const lord = TRADITIONAL_RULER[profSignIdx]!;
  const profection: Profection = {
    age,
    house: profHouse,
    sign: ZODIAC[profSignIdx]!,
    lord,
    startsOn: birthdayOnAge(input.birthDate, age).toISOString().slice(0, 10),
    endsOn: new Date(birthdayOnAge(input.birthDate, age + 1).getTime() - MS_PER_DAY).toISOString().slice(0, 10),
  };

  const involvesLord = (body?: SkyBody, natalPoint?: NatalPointName): boolean =>
    body === lord || (natalPoint !== undefined && natalPoint === lord);

  const events: TimelineEvent[] = [];
  const housePhrase = (lon: number) => wholeSignHouse(lon, natal.ascendant);

  // ── Lunations ────────────────────────────────────────────────────────────
  const elong = (jd: number): number => normalize(posAt('moon', jd).lon - posAt('sun', jd).lon);
  const lunations: { jd: number; angle: number; moonLon: number }[] = [];
  {
    const step = 0.5;
    let prevJd = startJd - 1;
    let prevPhase = Math.floor(elong(prevJd) / 90);
    for (let jd = startJd - 1 + step; jd <= endJd + step; jd += step) {
      const phase = Math.floor(elong(jd) / 90);
      if (phase !== prevPhase) {
        const target = phase * 90;
        const g = (t: number) => signedDiff(elong(t), target);
        const exact = bisect(g, prevJd, jd);
        if (exact >= startJd && exact <= endJd) {
          lunations.push({ jd: exact, angle: target, moonLon: posAt('moon', exact).lon });
        }
      }
      prevPhase = phase;
      prevJd = jd;
    }
  }

  // ── Eclipses ─────────────────────────────────────────────────────────────
  const eclFlags = useMoshier ? sweph.constants.SEFLG_MOSEPH : 0;
  const eclipses: { jd: number; solar: boolean; label: string; lon: number }[] = [];
  const natalHits = (lon: number): string => {
    const names = Object.keys(NATAL_LABEL) as NatalPointName[];
    const close: string[] = [];
    for (const n of names) {
      const target = natal[n];
      const conj = Math.abs(signedDiff(lon, target));
      const opp = Math.abs(signedDiff(lon, target + 180));
      if (conj <= ACTIVE_ORB) close.push(`conjunct your ${NATAL_LABEL[n]} (${conj.toFixed(1)}°)`);
      else if (opp <= ACTIVE_ORB) close.push(`opposite your ${NATAL_LABEL[n]} (${opp.toFixed(1)}°)`);
    }
    return close.join(', ');
  };
  for (const solar of [true, false]) {
    let t = startJd - 2;
    for (let guard = 0; guard < 8; guard++) {
      const r = solar
        ? sweph.sol_eclipse_when_glob(t, eclFlags, 0, false)
        : sweph.lun_eclipse_when(t, eclFlags, 0, false);
      const maxJd = r.data[0]!;
      if (!Number.isFinite(maxJd) || maxJd <= 0 || maxJd > endJd) break;
      if (maxJd >= startJd) {
        const body: SkyBody = solar ? 'sun' : 'moon';
        const lon = posAt(body, maxJd).lon;
        eclipses.push({
          jd: maxJd, solar, lon,
          label: `${solar ? solarEclipseKind(r.flag) : lunarEclipseKind(r.flag)} ${solar ? 'Solar' : 'Lunar'} Eclipse`,
        });
      }
      t = maxJd + 20;
    }
  }

  for (const e of eclipses) {
    const house = housePhrase(e.lon);
    const touches = natalHits(e.lon);
    const profected = house === profection.house;
    let detail = `At ${formatLon(e.lon)}, in your ${ordinal(house)} house. A thematic reset or catalyst moment for that area of life.`;
    if (profected) detail += ' It falls in your profected house this year.';
    if (touches) detail += ` It lands ${touches}.`;
    events.push({
      id: `ecl-${e.jd.toFixed(3)}`,
      at: iso(e.jd),
      kind: 'eclipse',
      title: e.label,
      detail,
      body: e.solar ? 'sun' : 'moon',
      nature: 'neutral',
      house,
      position: formatLon(e.lon),
      profectedHouse: profected,
      lord: false,
    });
  }

  for (const l of lunations) {
    // An eclipse is the same moment as its new / full moon; show only the eclipse.
    const isEclipseMoment = eclipses.some(
      (e) => Math.abs(e.jd - l.jd) < 1.5 && ((e.solar && l.angle === 0) || (!e.solar && l.angle === 180)),
    );
    if (isEclipseMoment) continue;
    const meta = LUNATION.find((x) => x.angle === l.angle)!;
    const house = housePhrase(l.moonLon);
    const profected = house === profection.house;
    events.push({
      id: `lun-${l.jd.toFixed(3)}`,
      at: iso(l.jd),
      kind: 'lunation',
      title: meta.title,
      detail: `${meta.line} In ${formatLon(l.moonLon)}, your ${ordinal(house)} house.${profected ? ' This is your profected house this year.' : ''}`,
      body: 'moon',
      nature: 'neutral',
      house,
      position: formatLon(l.moonLon),
      profectedHouse: profected,
      lord: false,
    });
  }

  // ── Stations (Mercury, Venus, Mars) ──────────────────────────────────────
  for (const body of ['mercury', 'venus', 'mars'] as const) {
    let prevJd = startJd - 1;
    let prevSpeed = posAt(body, prevJd).speed;
    for (let jd = startJd; jd <= endJd + 1; jd += 1) {
      const sp = posAt(body, jd).speed;
      if ((sp < 0) !== (prevSpeed < 0)) {
        const exact = bisect((t) => posAt(body, t).speed, prevJd, jd);
        if (exact >= startJd && exact <= endJd) {
          const retro = sp < 0;
          const lon = posAt(body, exact).lon;
          const house = housePhrase(lon);
          const profected = house === profection.house;
          events.push({
            id: `sta-${body}-${exact.toFixed(3)}`,
            at: iso(exact),
            kind: 'station',
            title: `${BODY_LABEL[body]} stations ${retro ? 'retrograde' : 'direct'}`,
            detail: `${retro ? STATION_LINE[body].retro : STATION_LINE[body].direct} At ${formatLon(lon)}, your ${ordinal(house)} house.${profected ? ' It is in your profected house this year.' : ''}`,
            body,
            nature: 'neutral',
            house,
            position: formatLon(lon),
            lord: body === lord,
            profectedHouse: profected,
          });
        }
      }
      prevSpeed = sp;
      prevJd = jd;
    }
  }

  // ── Ingresses (sign changes) ─────────────────────────────────────────────
  for (const body of ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const) {
    let prevJd = startJd - 1;
    let prev = posAt(body, prevJd);
    for (let jd = startJd; jd <= endJd + 1; jd += 1) {
      const cur = posAt(body, jd);
      const a = signIndex(prev.lon);
      const b = signIndex(cur.lon);
      if (a !== b) {
        const movingForward = (a + 1) % 12 === b;
        const boundary = (movingForward ? b : a) * 30;
        const exact = bisect((t) => signedDiff(posAt(body, t).lon, boundary), prevJd, jd);
        if (exact >= startJd && exact <= endJd) {
          const intoIdx = b;
          const intoSign = ZODIAC[intoIdx]!;
          const house = ((intoIdx - signIndex(natal.ascendant) + 12) % 12) + 1;
          const retro = !movingForward;
          const profected = house === profection.house;
          events.push({
            id: `ing-${body}-${exact.toFixed(3)}`,
            at: iso(exact),
            kind: 'ingress',
            title: retro
              ? `${BODY_LABEL[body]} moves back into ${intoSign}`
              : `${BODY_LABEL[body]} enters ${intoSign}`,
            detail: `Shifts the background theme to your ${ordinal(house)} house.${profected ? ' That is your profected house this year.' : ''}`,
            body,
            nature: 'neutral',
            house,
            position: `0° ${intoSign}`,
            lord: body === lord,
            profectedHouse: profected,
          });
        }
      }
      prev = cur;
      prevJd = jd;
    }
  }

  // ── Exact transits to the natal chart ────────────────────────────────────
  const targets = Object.keys(NATAL_LABEL) as NatalPointName[];
  const transitBodies: SkyBody[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const OUTER: SkyBody[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  /** Longitude offsets that form `aspect` with a point (e.g. sextile = ±60). */
  const offsets = (aspect: DailyAspect): number[] => {
    const a = ASPECT_ANGLES[aspect];
    return a === 0 || a === 180 ? [a] : [a, -a];
  };

  /** Longitudes of `body` on a regular grid (cached: many aspects share the same samples). */
  const seriesCache = new Map<string, number[]>();
  function series(body: SkyBody, from: number, count: number, step: number): number[] {
    const key = `${body}|${from}|${count}|${step}`;
    const hit = seriesCache.get(key);
    if (hit) return hit;
    const arr: number[] = [];
    for (let i = 0; i <= count; i++) arr.push(posAt(body, from + i * step).lon);
    seriesCache.set(key, arr);
    return arr;
  }

  /** All exact passes of `body` across [from, to] for a fixed ecliptic point. */
  function exactPasses(body: SkyBody, point: number, from: number, to: number, step: number): number[] {
    const out: number[] = [];
    const count = Math.ceil((to - from) / step) + 1;
    const lons = series(body, from, count, step);
    let prevJd = from;
    let prev = signedDiff(lons[0]!, point);
    for (let i = 1; i <= count; i++) {
      const jd = from + i * step;
      const cur = signedDiff(lons[i]!, point);
      if ((prev < 0) !== (cur < 0) && Math.abs(prev) < 20 && Math.abs(cur) < 20) {
        const exact = bisect((t) => signedDiff(posAt(body, t).lon, point), prevJd, jd);
        if (exact >= from && exact <= to) out.push(exact);
      }
      prev = cur;
      prevJd = jd;
    }
    return out;
  }

  /** Continuous span (JDs) around `jd` where orb to `point` stays within `maxOrb`. */
  function orbSpan(body: SkyBody, point: number, jd: number, maxOrb: number, step: number): [number, number] {
    const within = (t: number) => Math.abs(signedDiff(posAt(body, t).lon, point)) <= maxOrb;
    const cap = 1500;
    let lo = jd;
    while (jd - lo < cap && within(lo - step)) lo -= step;
    let hi = jd;
    while (hi - jd < cap && within(hi + step)) hi += step;
    return [lo, hi];
  }

  for (const body of transitBodies) {
    const isOuter = OUTER.includes(body);
    const step = isOuter ? 1 : 0.5;
    const windowStep = isOuter ? 2 : 0.5;
    for (const target of targets) {
      for (const aspect of Object.keys(ASPECT_ANGLES) as DailyAspect[]) {
        for (const off of offsets(aspect)) {
          const point = normalize(natal[target] + off);
          for (const exact of exactPasses(body, point, startJd, endJd, step)) {
            const p = posAt(body, exact);
            const [ws, we] = orbSpan(body, point, exact, ACTIVE_ORB, windowStep);
            const [ps, pe] = orbSpan(body, point, exact, PEAK_ORB, windowStep);
            const nature = classify(aspect, body);
            const sameBodyReturn = aspect === 'conjunction' && body === target;
            const isReturn = sameBodyReturn && (body === 'jupiter' || body === 'saturn' || body === 'sun');
            const returnTitle =
              body === 'sun' ? 'Solar Return (your birthday)' : `${BODY_LABEL[body]} Return`;
            const house = housePhrase(p.lon);
            events.push({
              id: `trn-${body}-${target}-${aspect}-${exact.toFixed(3)}`,
              at: iso(exact),
              kind: isReturn ? 'return' : 'transit',
              title: isReturn ? returnTitle : `${BODY_LABEL[body]} ${ASPECT_VERB[aspect]} your ${NATAL_LABEL[target]}`,
              detail:
                `${NATURE_LINE[nature]} Exact at ${formatLon(p.lon)}${p.speed < 0 ? ' (retrograde pass)' : ''}.` +
                (isReturn ? ' A full-circle return to where this planet stood at your birth.' : ''),
              body,
              natal: target,
              aspect,
              nature,
              house,
              position: formatLon(p.lon),
              lord: involvesLord(body, target),
              windowStart: isoDay(ws),
              windowEnd: isoDay(we),
              peakStart: isoDay(ps),
              peakEnd: isoDay(pe),
              retrograde: p.speed < 0,
            });
          }
        }
      }
    }
  }

  // ── Seasons: slow transits already in effect at the start ────────────────
  const seasons: ActiveSeason[] = [];
  for (const body of OUTER) {
    const now = posAt(body, startJd).lon;
    for (const target of targets) {
      for (const aspect of Object.keys(ASPECT_ANGLES) as DailyAspect[]) {
        for (const off of offsets(aspect)) {
          const point = normalize(natal[target] + off);
          const orb = Math.abs(signedDiff(now, point));
          if (orb > ACTIVE_ORB) continue;
          const [ws, we] = orbSpan(body, point, startJd, ACTIVE_ORB, 2);
          const passes = exactPasses(body, point, ws, we, 2);
          const count = Math.ceil((we - ws) / 2) + 1;
          const lonsInWindow = series(body, ws, count, 2);
          let bestI = 0;
          let bestOrb = Infinity;
          lonsInWindow.forEach((lon, i) => {
            const o = Math.abs(signedDiff(lon, point));
            if (o < bestOrb) { bestOrb = o; bestI = i; }
          });
          seasons.push({
            closest: { at: iso(ws + bestI * 2), orb: bestOrb },
            body, natal: target, aspect,
            nature: classify(aspect, body),
            orb,
            windowStart: isoDay(ws),
            windowEnd: isoDay(we),
            exactAt: passes.map(iso),
            lord: involvesLord(body, target),
          });
        }
      }
    }
  }
  seasons.sort((a, b) => a.orb - b.orb);

  events.sort((a, b) => a.at.localeCompare(b.at));

  // ── Numerology: personal year / month / day for each day in range ────────
  const [, bm, bd] = input.birthDate.split('-').map(Number) as [number, number, number];
  const personal: PersonalDay[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(localMidnightUtc.getTime() + i * MS_PER_DAY);
    const iso = day.toISOString().slice(0, 10);
    // Personal Year runs birthday to birthday, so it follows the cycle year.
    const universal = reduceKeepMasters(digitSum(personalYearBase(input.birthDate, iso)));
    const py = reduceKeepMasters(bm + bd + universal);
    const pm = reduceKeepMasters(py + (day.getUTCMonth() + 1));
    const pd = reduceKeepMasters(pm + day.getUTCDate());
    personal.push({ date: iso, year: py, month: pm, day: pd });
  }

  return {
    from: fromDate.toISOString(),
    to: jdToDate(endJd).toISOString(),
    events,
    seasons,
    profection,
    universalYear: reduceKeepMasters(digitSum(ly)),
    personal,
    pinnacle: pickCycles(input.pinnacles, age, input.birthDate, 'pinnacle'),
    challenge: pickCycles(input.challenges, age, input.birthDate, 'challenge'),
    numberMeanings: NUMBER_MEANINGS,
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
