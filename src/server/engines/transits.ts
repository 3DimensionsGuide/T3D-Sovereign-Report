/**
 * T3D Astrology Engine — Current Transits
 *
 * Split out from astrology.ts on purpose: that file's natal-chart code
 * `require()`s the `swisseph` native module at module-evaluation time (line
 * 1 of the file, effectively — it happens the instant anything imports
 * from astrology.ts, not just when a natal chart is actually calculated).
 * `swisseph` ships a binary compiled per-platform, and the one already
 * installed in this project is a macOS build — fine on Tyler's own Mac, but
 * it hard-crashes module evaluation ("Cannot find module .../swisseph.node")
 * anywhere else that binary wasn't built for, including this Linux preview
 * environment. Importing `calculateActiveTransits` from astrology.ts was
 * enough to drag that crash in, even though Transits themselves depend on
 * `sweph` (prebuilt-binary, cross-platform) and never touch `swisseph` at
 * all. Living in its own file means importing Transits code never evaluates
 * astrology.ts, so it never touches swisseph — cleanly decoupling the two
 * ephemeris libraries at the module level, not just in each function body.
 *
 * Everything below is unchanged from its original home in astrology.ts,
 * aside from a small local copy of `formatPosition`/`ZODIAC_SIGNS` (kept
 * intentionally duplicated rather than imported, for the same reason —
 * importing them as values from astrology.ts would re-trigger the crash
 * this split exists to avoid).
 *
 * Everything here answers "where are the planets RIGHT NOW, relative to a
 * fixed birth chart" — a different question from the rest of the astrology
 * engine, which answers "where were the planets when this person was
 * born." Unlike natal calculation, Transits have no birth-location
 * dependency at all (transiting ecliptic longitude is the same wherever on
 * Earth you're standing; only the fixed natal degrees they're compared
 * against came from one). Read tropically — the mainstream Western
 * convention (see stoplight-content.ts's transit content for the
 * interpretive layer built on top of this).
 *
 * Scope: the five slow-moving planets (Jupiter through Pluto) against the
 * three most personal natal points (Sun, Moon, Ascendant). Faster planets
 * (Sun–Mars) move too quickly to stay accurate for more than a few days,
 * which makes them a poor fit for a static, purchased PDF — by the time
 * someone reads it, a fast transit reported as "active" may already have
 * passed. Slow transits persist for weeks to months, so what the report
 * says stays true for as long as the reader is likely to be holding it.
 *
 * Beyond "is this active right now," this file also answers two follow-up
 * questions a reader will naturally have:
 *
 *   - "For how long?" — calculateActiveTransits() attaches a `window`
 *     (start/end date) to every active hit: the continuous stretch, around
 *     `referenceDate`, that the transiting planet stays within orb. This is
 *     the CURRENT pass specifically, not every historical or future exact
 *     contact — a slow planet stationing retrograde while still in orb can
 *     produce more than one pass across a period of months or years, and
 *     this reports the one the reader is in right now, not a full forecast.
 *
 *   - "What's coming next?" — getUpcomingTransits() looks past what's
 *     active today to find the soonest transit(s) (among the same 15
 *     planet×target combinations) that WILL enter orb, each with its own
 *     window. Coming up short of the requested count only happens if
 *     fewer than that many of the five slow planets reach any of the
 *     three natal points within the ~10-year search horizon — which does
 *     happen for the slowest planets (Neptune and especially Pluto only
 *     sweep a modest arc of the zodiac in 10 years) but is rare enough
 *     across 15 combinations that it shouldn't come up in practice.
 *
 * Both rely on the same boundary-crossing search: given a function that
 * says whether a date is inside or outside orb, walk forward or backward
 * in coarse steps to bracket the moment the in/out-of-orb state flips,
 * then refine to 1-day precision within that bracket. A flat coarse step
 * of 10 days is safe for every planet in scope — even Jupiter, the
 * fastest, moves under 1° in 10 days, far short of the 3° orb width, so a
 * crossing can never be skipped over undetected.
 */

import type { PlanetPosition, ZodiacSign } from './types';

// ─── LOCAL POSITION FORMATTING (deliberately duplicated — see file header) ──

const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function formatPosition(longitude: number, latitude: number, speed: number): PlanetPosition {
  const lon = ((longitude % 360) + 360) % 360;

  const signIndex = Math.floor(lon / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = lon - signIndex * 30;
  const wholeDeg = Math.floor(degreeInSign);
  const minuteInSign = Math.floor((degreeInSign - wholeDeg) * 60);

  return {
    longitude: lon,
    latitude,
    speed,
    retrograde: speed < 0,
    sign,
    degreeInSign,
    minuteInSign,
    formatted: `${wholeDeg}°${String(minuteInSign).padStart(2, '0')}' ${sign}`,
  };
}

// ─── SWEPH IMPORT & CONSTANTS ────────────────────────────────────────────────
//
// Transits use `sweph` rather than the `swisseph` binding the natal engine
// uses — same underlying Swiss Ephemeris C library and math, but
// distributed as prebuilt binaries per platform instead of one compiled
// from source on install. Natal-chart calculation runs once per lead and
// already works fine on `swisseph`, so it's left untouched. But a transit
// has to be recomputed fresh on every single report render (it's "right
// now," not "at birth"), and that recompute needs to succeed wherever this
// app actually runs its build — a teammate's machine, a CI container, a
// platform build image — without depending on a working node-gyp toolchain
// and network access to nodejs.org at install time.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sweph = require('sweph') as Sweph;

interface SwephCalcResult {
  flag: number;
  error?: string;
  data: number[]; // [longitude, latitude, distance, longitudeSpeed, latitudeSpeed, distanceSpeed]
}
interface SwephHousesResult {
  flag: number;
  error?: string;
  data: { houses: number[]; points: number[] }; // points[0] = Ascendant
}
interface Sweph {
  constants: {
    SE_GREG_CAL: number;
    SEFLG_SPEED: number;
    SEFLG_MOSEPH: number;
    SE_JUPITER: number;
    SE_SATURN: number;
    SE_URANUS: number;
    SE_NEPTUNE: number;
    SE_PLUTO: number;
  };
  set_ephe_path: (path: string) => void;
  julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  calc_ut: (tjdUt: number, ipl: number, iflag: number) => SwephCalcResult;
  houses_ex: (tjdUt: number, iflag: number, lat: number, lon: number, hsys: string) => SwephHousesResult;
}

export type TransitPlanet = 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type TransitAspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type NatalTransitTarget = 'sun' | 'moon' | 'ascendant';

let transitEphemerisInitialized = false;
function initTransitEphemeris(): void {
  if (transitEphemerisInitialized) return;
  const ephePath = process.env.EPHE_PATH ?? '';
  if (ephePath) sweph.set_ephe_path(ephePath);
  transitEphemerisInitialized = true;
}

const TRANSIT_PLANET_IDS: Record<TransitPlanet, number> = {
  jupiter: sweph.constants.SE_JUPITER,
  saturn:  sweph.constants.SE_SATURN,
  uranus:  sweph.constants.SE_URANUS,
  neptune: sweph.constants.SE_NEPTUNE,
  pluto:   sweph.constants.SE_PLUTO,
};

const ASPECT_ANGLES: Record<TransitAspectType, number> = {
  conjunction: 0,
  sextile:     60,
  square:      90,
  trine:       120,
  opposition:  180,
};

// A flat 3° orb for every aspect. The source material treats 2–3° as still
// "really operative" and reserves 1° for peak-intensity — 3° keeps this
// report reading as "here's what's live right now" without either going
// silent for months at a time or flooding the page with marginal, barely-
// forming aspects.
const TRANSIT_ORB_DEGREES = 3;

export interface TransitNatalPoints {
  sunLongitude:  number; // 0–360°, tropical
  moonLongitude: number; // 0–360°, tropical
  ascLongitude:  number; // 0–360°, tropical
  ascSign:       ZodiacSign; // for Whole-Sign house placement of the transiting planet
}

/** A definite date range, inclusive, expressed as YYYY-MM-DD (UTC). */
export interface TransitWindow {
  startDate: string;
  endDate:   string;
}

export interface TransitHit {
  transitingPlanet: TransitPlanet;
  aspect:           TransitAspectType;
  natalTarget:      NatalTransitTarget;
  transitingSign:   ZodiacSign;
  orb:              number;      // degrees off exact (0 = exact)
  applying:         boolean;     // true = tightening, false = separating
  window:           TransitWindow; // the current continuous pass through orb
}

/**
 * The next transit — among the same 15 planet×target combinations
 * calculateActiveTransits checks — that isn't active right now but will
 * become active soonest. No `orb`/`applying` fields: those describe a
 * transit that's already happening, and this one isn't yet.
 */
export interface UpcomingTransit {
  transitingPlanet: TransitPlanet;
  aspect:           TransitAspectType;
  natalTarget:      NatalTransitTarget;
  transitingSign:   ZodiacSign; // sign the transiting planet is in at orb entry
  window:           TransitWindow;
}

/** Convert a plain Date (read via its UTC fields) to a Julian Day Number (UT). */
export function dateToJulianDay(date: Date): number {
  const hourDecimal = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    hourDecimal,
    sweph.constants.SE_GREG_CAL,
  );
}

/**
 * A single transiting planet's tropical position at an arbitrary date. No
 * birth location is needed — transiting ecliptic longitude is the same
 * wherever on Earth you're standing. This is the primitive the rest of
 * this file is built on: getCurrentTransitingPlanets() below just calls it
 * once per planet for "now," and the window/upcoming-transit searches call
 * it many times at many candidate dates.
 */
function getTransitingPlanetPosition(planet: TransitPlanet, date: Date): PlanetPosition {
  initTransitEphemeris();

  const jd = dateToJulianDay(date);
  // Same convention as the natal engine: request Moshier explicitly when no
  // local ephemeris files are configured, rather than letting the library
  // search for files that aren't there and populate a "not found" message
  // alongside an otherwise-valid (self-recovered) result.
  const flags = sweph.constants.SEFLG_SPEED | (process.env.EPHE_PATH ? 0 : sweph.constants.SEFLG_MOSEPH);

  const result = sweph.calc_ut(jd, TRANSIT_PLANET_IDS[planet], flags);
  // `data` still comes back populated even when `error` merely reports a
  // missing/fallback ephemeris file rather than an actual failure, so a
  // missing longitude — not the presence of any message — is the real
  // failure signal here.
  if (result.data?.[0] === undefined) {
    throw new Error(`sweph.calc_ut failed for transiting ${planet}: ${result.error ?? 'no data returned'}`);
  }
  const [longitude, latitude, , longitudeSpeed] = result.data;
  return formatPosition(longitude!, latitude!, longitudeSpeed!);
}

/**
 * Current tropical positions of all five transit-timing planets at once.
 */
export function getCurrentTransitingPlanets(referenceDate: Date = new Date()): Record<TransitPlanet, PlanetPosition> {
  const out = {} as Record<TransitPlanet, PlanetPosition>;
  for (const planet of Object.keys(TRANSIT_PLANET_IDS) as TransitPlanet[]) {
    out[planet] = getTransitingPlanetPosition(planet, referenceDate);
  }
  return out;
}

/** Shortest angular distance between two ecliptic longitudes, 0–180°. */
function angularSeparation(a: number, b: number): number {
  const diff = Math.abs(((a - b) % 360) + 360) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * How far transiting longitude `lon` sits off an exact `aspectAngle` contact
 * with fixed natal longitude `natalLon` — the orb, regardless of which side
 * of exact it's on.
 */
function orbFromAspect(lon: number, natalLon: number, aspectAngle: number): number {
  const separation = angularSeparation(lon, natalLon);
  return Math.abs(separation - aspectAngle);
}

// ─── DATE-RANGE / BOUNDARY SEARCH ────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Generous enough to bound even a Pluto pass (its ~0.004°/day average speed
// means a full 6°-wide orb window can span roughly 4 years) while still
// guarding against a runaway loop if something is ever wrong upstream.
const WINDOW_SEARCH_MAX_DAYS = 2500;
const WINDOW_SEARCH_COARSE_STEP_DAYS = 10;

/**
 * Steps from `fromDate` in `direction` (+1 forward / -1 backward), looking
 * for the day the in/out-of-orb state (as reported by `orbFn`) flips
 * relative to its value at `fromDate`. Coarse-steps first to cheaply
 * bracket the flip, then refines to 1-day precision within that bracket.
 *
 * Returns the boundary date itself — the last date (walking in
 * `direction`) that still matched the state at `fromDate` — or null if no
 * flip is found within `maxDays`.
 */
function findBoundary(
  orbFn: (date: Date) => number,
  fromDate: Date,
  direction: 1 | -1,
  maxDays: number,
  coarseStepDays: number,
): Date | null {
  const startInside = orbFn(fromDate) <= TRANSIT_ORB_DEGREES;

  let prevDate = fromDate;
  let prevInside = startInside;
  let daysOut = 0;

  while (daysOut < maxDays) {
    daysOut += coarseStepDays;
    const candidate = new Date(fromDate.getTime() + direction * daysOut * MS_PER_DAY);
    const inside = orbFn(candidate) <= TRANSIT_ORB_DEGREES;

    if (inside !== prevInside) {
      // The flip happened somewhere between prevDate and candidate —
      // refine day by day from prevDate toward candidate.
      let cursor = prevDate;
      for (let d = 1; d <= coarseStepDays; d++) {
        const next = new Date(prevDate.getTime() + direction * d * MS_PER_DAY);
        const nextInside = orbFn(next) <= TRANSIT_ORB_DEGREES;
        if (nextInside !== prevInside) return cursor;
        cursor = next;
      }
      return cursor; // shouldn't normally reach here, but keeps the loop total
    }

    prevDate = candidate;
    prevInside = inside;
  }

  return null;
}

/**
 * The definite start/end dates of the CURRENT continuous pass through orb
 * for one (planet, natal target, aspect) combination that IS active at
 * `referenceDate` — not every historical or future exact contact, just the
 * window the reader is in right now (see this file's docblock for why a
 * slow planet stationing retrograde can produce more than one pass).
 */
function findOrbWindow(
  planet: TransitPlanet,
  natalLongitude: number,
  aspectAngle: number,
  referenceDate: Date,
): TransitWindow {
  const orbFn = (date: Date) =>
    orbFromAspect(getTransitingPlanetPosition(planet, date).longitude, natalLongitude, aspectAngle);

  const start =
    findBoundary(orbFn, referenceDate, -1, WINDOW_SEARCH_MAX_DAYS, WINDOW_SEARCH_COARSE_STEP_DAYS) ??
    new Date(referenceDate.getTime() - WINDOW_SEARCH_MAX_DAYS * MS_PER_DAY);
  const end =
    findBoundary(orbFn, referenceDate, 1, WINDOW_SEARCH_MAX_DAYS, WINDOW_SEARCH_COARSE_STEP_DAYS) ??
    new Date(referenceDate.getTime() + WINDOW_SEARCH_MAX_DAYS * MS_PER_DAY);

  return { startDate: toISODate(start), endDate: toISODate(end) };
}

/**
 * Every currently active transit from the five slow planets to the
 * reader's Sun, Moon, and Ascendant — active meaning within TRANSIT_ORB_DEGREES
 * of one of the five major Ptolemaic aspects. Sorted tightest orb first,
 * since that's the one closest to its peak, most-noticeable moment.
 *
 * Most days, this returns very few hits (often zero) — that's correct,
 * not a data gap. Slow planets forming an exact major aspect to one of
 * three specific points is a genuinely occasional event, and the absence
 * of one is itself a meaningful "quiet season" reading, not missing data.
 */
export function calculateActiveTransits(
  natal: TransitNatalPoints,
  referenceDate: Date = new Date(),
): TransitHit[] {
  const transiting = getCurrentTransitingPlanets(referenceDate);
  // One day later, used only to tell whether each hit is tightening
  // (applying) or loosening (separating) — the natal point never moves,
  // so only the transiting planet's motion matters here.
  const transitingTomorrow = getCurrentTransitingPlanets(new Date(referenceDate.getTime() + 24 * 60 * 60 * 1000));

  const targets: { target: NatalTransitTarget; longitude: number }[] = [
    { target: 'sun',       longitude: natal.sunLongitude },
    { target: 'moon',      longitude: natal.moonLongitude },
    { target: 'ascendant', longitude: natal.ascLongitude },
  ];

  const hits: TransitHit[] = [];

  for (const [planetKey, position] of Object.entries(transiting) as [TransitPlanet, PlanetPosition][]) {
    const tomorrowLongitude = transitingTomorrow[planetKey].longitude;

    for (const { target, longitude: natalLongitude } of targets) {
      for (const [aspectKey, aspectAngle] of Object.entries(ASPECT_ANGLES) as [TransitAspectType, number][]) {
        const orbToday    = orbFromAspect(position.longitude, natalLongitude, aspectAngle);
        if (orbToday > TRANSIT_ORB_DEGREES) continue;

        const orbTomorrow = orbFromAspect(tomorrowLongitude, natalLongitude, aspectAngle);
        const applying = orbTomorrow < orbToday;

        hits.push({
          transitingPlanet: planetKey,
          aspect: aspectKey,
          natalTarget: target,
          transitingSign: position.sign,
          orb: orbToday,
          applying,
          window: findOrbWindow(planetKey, natalLongitude, aspectAngle, referenceDate),
        });
      }
    }
  }

  return hits.sort((a, b) => a.orb - b.orb);
}

// ─── NEXT UPCOMING TRANSIT ────────────────────────────────────────────────────

// How far ahead to look for upcoming transits before giving up. 10 years
// is enough for Jupiter (which cycles through nearly the whole zodiac in
// ~12 years) to reach almost every combination, and generous for Saturn
// and Uranus — but Neptune and especially Pluto move slowly enough that
// some of their 15 combinations genuinely won't occur within any fixed
// horizon; coming up short of `count` reflects that, not a search bug.
const UPCOMING_SEARCH_MAX_DAYS = 3650;
const UPCOMING_SEARCH_COARSE_STEP_DAYS = 10;

interface TransitCombo {
  planet: TransitPlanet;
  target: NatalTransitTarget;
  natalLongitude: number;
  aspect: TransitAspectType;
  aspectAngle: number;
}

function comboKey(c: Pick<TransitCombo, 'planet' | 'target' | 'aspect'>): string {
  return `${c.planet}|${c.target}|${c.aspect}`;
}

/**
 * The next `count` transits — among the same 15 planet×target
 * combinations calculateActiveTransits checks — that aren't active at
 * `referenceDate` but will become active soonest, each with its own
 * definite window, earliest first. This is what lets the report look
 * forward as well as report the present.
 *
 * Coarse-scans forward one sample at a time, computing each of the five
 * planets' positions ONCE per sampled date rather than once per
 * combination (the 15 combinations only ever need 5 distinct planet
 * positions), then refines only the winning combinations to 1-day
 * precision — cheap even across the full 10-year horizon.
 *
 * Returns fewer than `count` (down to none) only if fewer than that many
 * of the five slow planets reach any of the three natal points within
 * that horizon (see the constant above for when that's expected, not a
 * bug — Neptune and especially Pluto only sweep a modest arc in 10 years).
 */
export function getUpcomingTransits(
  natal: TransitNatalPoints,
  referenceDate: Date = new Date(),
  count: number = 1,
): UpcomingTransit[] {
  const targets: { target: NatalTransitTarget; longitude: number }[] = [
    { target: 'sun',       longitude: natal.sunLongitude },
    { target: 'moon',      longitude: natal.moonLongitude },
    { target: 'ascendant', longitude: natal.ascLongitude },
  ];

  const combos: TransitCombo[] = [];
  for (const planet of Object.keys(TRANSIT_PLANET_IDS) as TransitPlanet[]) {
    for (const { target, longitude } of targets) {
      for (const [aspect, aspectAngle] of Object.entries(ASPECT_ANGLES) as [TransitAspectType, number][]) {
        combos.push({ planet, target, natalLongitude: longitude, aspect, aspectAngle });
      }
    }
  }

  // This function is specifically about what's NOT active yet, so drop
  // anything already inside orb right now.
  const activeNow = new Set(
    combos
      .filter(c => orbFromAspect(getTransitingPlanetPosition(c.planet, referenceDate).longitude, c.natalLongitude, c.aspectAngle) <= TRANSIT_ORB_DEGREES)
      .map(comboKey),
  );
  const stillOutside = new Map(
    combos.filter(c => !activeNow.has(comboKey(c))).map(c => [comboKey(c), c]),
  );

  // Coarse-scan forward until every remaining combo has been found once
  // (or the horizon runs out) — each combo can only enter orb once as we
  // scan strictly forward, so the first hit per combo is recorded and
  // that combo is dropped from further checking.
  const foundApprox = new Map<string, Date>(); // combo key -> approximate (coarse) entry date

  for (
    let daysOut = UPCOMING_SEARCH_COARSE_STEP_DAYS;
    daysOut <= UPCOMING_SEARCH_MAX_DAYS && stillOutside.size > 0;
    daysOut += UPCOMING_SEARCH_COARSE_STEP_DAYS
  ) {
    const sampleDate = new Date(referenceDate.getTime() + daysOut * MS_PER_DAY);
    const longitudeByPlanet = new Map<TransitPlanet, number>();

    for (const [key, combo] of stillOutside) {
      if (!longitudeByPlanet.has(combo.planet)) {
        longitudeByPlanet.set(combo.planet, getTransitingPlanetPosition(combo.planet, sampleDate).longitude);
      }
      const lon = longitudeByPlanet.get(combo.planet)!;
      if (orbFromAspect(lon, combo.natalLongitude, combo.aspectAngle) <= TRANSIT_ORB_DEGREES) {
        foundApprox.set(key, sampleDate);
        stillOutside.delete(key);
      }
    }
  }

  if (foundApprox.size === 0) return [];

  // Take the `count` earliest approximate entries across ALL combos, then
  // refine only those — refining every combo found (up to 73) would waste
  // work on ones we're about to discard anyway.
  const winners = Array.from(foundApprox.entries())
    .sort((a, b) => a[1].getTime() - b[1].getTime())
    .slice(0, count);

  return winners.map(([key, approxDate]) => {
    const combo = combos.find(c => comboKey(c) === key)!;

    // Refine: the coarse hit already lands inside orb, so stepping
    // backward one day at a time from it (bounded to just past one
    // coarse step, since the true entry can be at most that far before
    // the coarse sample that found it) pinpoints the actual first day
    // inside.
    const orbFn = (date: Date) =>
      orbFromAspect(getTransitingPlanetPosition(combo.planet, date).longitude, combo.natalLongitude, combo.aspectAngle);
    const preciseStart =
      findBoundary(orbFn, approxDate, -1, UPCOMING_SEARCH_COARSE_STEP_DAYS + 1, 1) ?? approxDate;
    const preciseEnd =
      findBoundary(orbFn, preciseStart, 1, WINDOW_SEARCH_MAX_DAYS, WINDOW_SEARCH_COARSE_STEP_DAYS) ??
      new Date(preciseStart.getTime() + WINDOW_SEARCH_MAX_DAYS * MS_PER_DAY);

    return {
      transitingPlanet: combo.planet,
      aspect: combo.aspect,
      natalTarget: combo.target,
      transitingSign: getTransitingPlanetPosition(combo.planet, preciseStart).sign,
      window: { startDate: toISODate(preciseStart), endDate: toISODate(preciseEnd) },
    };
  });
}
