/**
 * Stoplight (Astrology) reading for the T3D app (server-side only).
 *
 * Builds the full interpretation from the report's own astrology libraries:
 * the Big Three in both zodiacs, the Sun-Moon pattern, element and modality
 * blend, chart ruler, Mercury through Pluto, the Time Lord and the Lord of
 * the Year. No formulas or raw chart data leave the server.
 */

import {
  CHART_RULER,
  HOUSE_ARENA,
  MOON_SIGN_CONTENT,
  RISING_SIGN_CONTENT,
  SIGN_ELEMENT,
  SIGN_MODALITY,
  STOPLIGHT_FRICTION,
  SUN_SIGN_CONTENT,
  getElementPattern,
  getModalityPattern,
  getSunHouse,
  getSunMoonPattern,
  type ElementPattern,
  type FrictionPattern,
} from '@/lib/report/section5/astro-content';
import { FIRDARIA_ANALYSIS } from '@/lib/report/section5/firdaria-content';
import {
  JUPITER_CONTENT,
  MARS_CONTENT,
  MERCURY_CONTENT,
  NEPTUNE_HOUSE_CONTENT,
  OUTER_PLANETS_MECHANISM,
  PERSONAL_PLANETS_MECHANISM,
  PLUTO_HOUSE_CONTENT,
  SATURN_CONTENT,
  SOCIAL_PLANETS_MECHANISM,
  URANUS_HOUSE_CONTENT,
  VENUS_CONTENT,
  getPlanetHouse,
  type PlanetSignContent,
} from '@/lib/report/advanced/stoplight/stoplight-content';
import { HOUSE_NAMES, HOUSE_THEMES } from '@/lib/report/advanced/stoplight/transits-content';
import { calculateFirdaria, calculateProfection, type FirdariaPlanet } from '@/lib/report/tokens';
import type { ChartData, PlanetPosition } from '@/server/engines/types';
import { buildNatalAspects, buildNodes, type NatalAspects, type NodesReading } from '@/lib/app/natalExtras';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export interface BigThreeLens {
  sun: {
    sign: string; formatted: string; element: string; modality: string;
    orientation: string; recognize: string[]; watchFor: string;
    house: number; arenaName: string; arena: string;
  };
  moon: { sign: string; formatted: string; element: string; modality: string; text: string };
  rising: { sign: string; formatted: string; element: string; modality: string; text: string };
}

export interface PlanetEntry {
  key: string;
  name: string;
  group: 'personal' | 'social' | 'outer';
  placement: string;
  house: number | null;
  houseName: string | null;
  retrograde: boolean;
  theme: string;
  gift: string;
  friction: string;
}

export interface StoplightDetail {
  locked: boolean;
  birthTimeKnown: boolean;
  timeNote: string | null;
  lensNote: string;
  tropical: BigThreeLens;
  sidereal: BigThreeLens;
  siderealNote: string;
  sunMoon: { label: string; tension: string; resource: string; practice: string };
  elements: ElementPattern;
  modality: { label: string; description: string };
  ruler: { ruler: string; description: string; arena: string };
  planets: PlanetEntry[];
  mechanisms: { personal: string; social: string; outer: string };
  timeLord: {
    planet: string;
    tagline: string;
    startYear: number;
    endYear: number;
    yearsRemaining: number;
    isDayChart: boolean;
    next: string | null;
    quote: string;
    paragraphs: string[];
    watchFor: string;
  };
  lordOfYear: {
    age: number;
    house: number;
    houseName: string;
    houseTheme: string;
    sign: string;
    lord: string;
    lordQuote: string | null;
  };
  mixups: FrictionPattern[];
  nodes: NodesReading | null;
  aspects: NatalAspects | null;
}

function signOf(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(norm / 30)] ?? 'Aries';
}

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

function formatLongitude(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  const inSign = norm % 30;
  const deg = Math.floor(inSign);
  const min = Math.floor((inSign - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}' ${signOf(norm)}`;
}

function buildLens(chart: ChartData): BigThreeLens | null {
  const sunSign = chart.sun.sign;
  const moonSign = chart.moon.sign;
  const risingSign = signOf(chart.houses.ascendant);
  const sunContent = SUN_SIGN_CONTENT[sunSign];
  const house = getSunHouse(sunSign, risingSign);
  const arena = HOUSE_ARENA[house];
  if (!sunContent || !arena) return null;
  return {
    sun: {
      sign: sunSign,
      formatted: chart.sun.formatted,
      element: SIGN_ELEMENT[sunSign] ?? '',
      modality: SIGN_MODALITY[sunSign] ?? '',
      orientation: sunContent.orientation,
      recognize: [...sunContent.recognize],
      watchFor: sunContent.watchFor,
      house,
      arenaName: arena.name,
      arena: arena.description,
    },
    moon: {
      sign: moonSign,
      formatted: chart.moon.formatted,
      element: SIGN_ELEMENT[moonSign] ?? '',
      modality: SIGN_MODALITY[moonSign] ?? '',
      text: MOON_SIGN_CONTENT[moonSign] ?? '',
    },
    rising: {
      sign: risingSign,
      formatted: formatLongitude(chart.houses.ascendant),
      element: SIGN_ELEMENT[risingSign] ?? '',
      modality: SIGN_MODALITY[risingSign] ?? '',
      text: RISING_SIGN_CONTENT[risingSign] ?? '',
    },
  };
}

const RETROGRADE_NOTE =
  ' This planet was retrograde at your birth, which tends to turn its themes inward: you may process them privately and on your own timing before they show outwardly.';

function bySign(
  key: string, name: string, group: 'personal' | 'social',
  pos: PlanetPosition, table: Record<string, PlanetSignContent>, risingSign: string,
): PlanetEntry | null {
  const c = table[pos.sign];
  if (!c) return null;
  const house = getPlanetHouse(pos.sign, risingSign);
  return {
    key, name, group,
    placement: `${name} in ${pos.sign}`,
    house,
    houseName: house ? (HOUSE_NAMES[house] ?? null) : null,
    retrograde: pos.retrograde,
    theme: c.theme,
    gift: c.gift,
    friction: c.friction,
  };
}

function byHouse(
  key: string, name: string, pos: PlanetPosition,
  table: Record<number, PlanetSignContent>, risingSign: string,
): PlanetEntry | null {
  const house = getPlanetHouse(pos.sign, risingSign);
  if (!house) return null;
  const c = table[house];
  if (!c) return null;
  return {
    key, name, group: 'outer',
    placement: `${name} in the ${ordinal(house)} house`,
    house,
    houseName: HOUSE_NAMES[house] ?? null,
    retrograde: pos.retrograde,
    theme: c.theme,
    gift: c.gift,
    friction: c.friction,
  };
}

export function buildStoplight(
  tropical: ChartData,
  sidereal: ChartData,
  birthDate: string,
  birthTimeKnown: boolean,
  locked: boolean,
): StoplightDetail | null {
  const trop = buildLens(tropical);
  const sid = buildLens(sidereal);
  if (!trop || !sid) return null;

  const risingSign = trop.rising.sign;
  const sunSign = trop.sun.sign;
  const moonSign = trop.moon.sign;

  const planets = [
    bySign('mercury', 'Mercury', 'personal', tropical.mercury, MERCURY_CONTENT, risingSign),
    bySign('venus', 'Venus', 'personal', tropical.venus, VENUS_CONTENT, risingSign),
    bySign('mars', 'Mars', 'personal', tropical.mars, MARS_CONTENT, risingSign),
    bySign('jupiter', 'Jupiter', 'social', tropical.jupiter, JUPITER_CONTENT, risingSign),
    bySign('saturn', 'Saturn', 'social', tropical.saturn, SATURN_CONTENT, risingSign),
    byHouse('uranus', 'Uranus', tropical.uranus, URANUS_HOUSE_CONTENT, risingSign),
    byHouse('neptune', 'Neptune', tropical.neptune, NEPTUNE_HOUSE_CONTENT, risingSign),
    byHouse('pluto', 'Pluto', tropical.pluto, PLUTO_HOUSE_CONTENT, risingSign),
  ]
    .filter((p): p is PlanetEntry => p !== null)
    .map((p) => (p.retrograde ? { ...p, theme: `${p.theme}${RETROGRADE_NOTE}` } : p));

  const sunMoon = getSunMoonPattern(sunSign, moonSign);
  const bigThreeSigns = [sunSign, moonSign, risingSign];
  const elements = getElementPattern(bigThreeSigns.map((s) => SIGN_ELEMENT[s] ?? ''));
  const modality = getModalityPattern(bigThreeSigns.map((s) => SIGN_MODALITY[s] ?? ''));
  const ruler = CHART_RULER[risingSign];
  if (!ruler) return null;

  const firdaria = calculateFirdaria(birthDate, sunSign, risingSign);
  const analysis = FIRDARIA_ANALYSIS[firdaria.current.planet as FirdariaPlanet];
  const profection = calculateProfection(birthDate, risingSign);
  const lordKey = profection.lord.replace(/^the\s+/i, '');
  const lordAnalysis = FIRDARIA_ANALYSIS[lordKey as FirdariaPlanet];

  return {
    locked,
    birthTimeKnown,
    timeNote: birthTimeKnown
      ? null
      : 'No birth time was entered, so 12:00 noon was used. Your Sun sign and the slower planets are reliable. Your Rising sign, houses, Time Lord and Lord of the Year depend on the birth time, so treat them as approximate. Your Moon sign is usually right but can differ if the Moon changed sign that day.',
    lensNote:
      'Tropical astrology (the Western standard) ties signs to the seasons and is the main lens here. Sidereal ties signs to the visible stars and is offered as a second lens. T3D reads both and uses whole-sign houses.',
    tropical: trop,
    sidereal: sid,
    siderealNote:
      'The sidereal zodiac sits about 24° behind the tropical one, so your Sun, Moon or Rising may land in a different sign. Read it as a second lens on the same sky, not a replacement.',
    sunMoon,
    elements,
    modality,
    ruler,
    planets,
    mechanisms: {
      personal: PERSONAL_PLANETS_MECHANISM,
      social: SOCIAL_PLANETS_MECHANISM,
      outer: OUTER_PLANETS_MECHANISM,
    },
    timeLord: {
      planet: firdaria.current.planet,
      tagline: firdaria.current.tagline,
      startYear: firdaria.current.startYear,
      endYear: firdaria.current.endYear,
      yearsRemaining: Math.round(firdaria.yearsRemaining * 10) / 10,
      isDayChart: firdaria.isDayChart,
      next: firdaria.next ? firdaria.next.planet : null,
      quote: analysis?.quote ?? '',
      paragraphs: analysis ? [...analysis.paragraphs] : [],
      watchFor: analysis?.watchFor ?? '',
    },
    lordOfYear: {
      age: profection.age,
      house: profection.house,
      houseName: HOUSE_NAMES[profection.house] ?? '',
      houseTheme: HOUSE_THEMES[profection.house] ?? '',
      sign: profection.sign,
      lord: profection.lord,
      lordQuote: lordAnalysis?.quote ?? null,
    },
    mixups: STOPLIGHT_FRICTION,
    nodes: buildNodes(tropical, birthTimeKnown),
    aspects: buildNatalAspects(tropical, birthTimeKnown),
  };
}
