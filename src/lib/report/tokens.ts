/**
 * T3D Report — Design Tokens, Types & Calculation Helpers
 * Updated for Section 4: Road numerology fields
 */

// DataQualityReport is imported from schema/dataIntegrity
// and added to ReportData below
export type { DataQualityReport, BirthTimeCertainty } from './schema/dataIntegrity';

export const C = {
  base:          '#0D0D0E',
  baseSoft:      '#141416',
  parchment:     '#F5F5F3',
  parchmentDim:  '#A8A8A6',
  parchmentFaint:'#6B6B69',
  amber:         '#E5A93C',
  amberDim:      '#8C6520',
  amberLight:    '#FDF3DC',
  emerald:       '#1F8A4D',
  emeraldDim:    '#0E4425',
  emeraldLight:  '#EAF5EE',
  crimson:       '#991B1B',
  crimsonDim:    '#4C0D0D',
  crimsonLight:  '#FDEAEA',
  pageLight:     '#FAFAF9',
  rule:          '#DDDBD8',
  ruleFaint:     '#EDEBE8',
} as const;

export const F = {
  display: 'Playfair Display',
  sans:    'DM Sans',
} as const;

export const PAGE = {
  width:        612,
  height:       792,
  marginH:       60,
  marginV:       60,
  contentWidth: 492,
} as const;

// ─── REPORT DATA TYPE ─────────────────────────────────────────────────────────
export interface ReportConsent {
  reportStorageConsented: boolean;
  emailSequenceConsented: boolean;
  dataCollectedAt:        string;
}

export interface ReportData {
  // Personal
  firstName:   string;
  lastName:    string;
  email:       string;
  birthDate:   string;
  generatedAt: string;

  // Human Design
  hdType:           string;
  hdAuthority:      string;
  hdProfile:        string;
  hdStrategy:       string;
  hdNotSelf:        string;
  hdDefinedCenters: string[];
  hdChannels:       { name: string; gates: number[]; activatedBy: string; fromCenter: string; toCenter: string }[];
  hdIncarnationCross: string;   // e.g. "Right Angle Cross of Laws (41/31 | 44/24)" or generic fallback
  hdActiveGates: { gate: number; line: number; center: string; planet: string; epoch: string }[];

  // Numerology — core
  lifePath:         number;
  lifePathDisplay:  string;   // e.g., "34/7" — compound/reduced form
  lifePathCompound: number;   // e.g., 34 — intermediate sum before final reduction
  destiny:          number;
  personality:      number;
  soulUrge:         number;
  hiddenPassion:    number;
  karmicLessons:    number[];
  personalYear:     number;
  hasFullName:      boolean;  // true if full birth name was provided & calculated

  // Numerology — birthday & attitude
  birthdayNumber:   number;   // birth day reduced (e.g., 30 → 3)
  birthdayDisplay:  string;   // compound/reduced (e.g., "30/3")
  attitudeNumber:   number;   // month + day reduced
  attitudeDisplay:  string;   // compound/reduced (e.g., "12/3")

  // Numerology — pinnacles & challenges
  pinnacles:           { number: number; label: string; startAge: number; endAge: number | null }[];
  currentPinnacleIndex: number;       // 0–3, which pinnacle is active now
  challenges:          number[];      // [c1, c2, c3, c4]

  // Astrology
  tropicalSun:  string;
  tropicalMoon: string;
  tropicalAsc:  string;
  tropicalMC:   string;
  siderealSun:  string;
  siderealMoon: string;
  siderealAsc:  string;
  ayanamsha:    string;   // e.g., "Lahiri" — always named explicitly

  // Extracted signs
  sunSign:    string;
  moonSign:   string;
  risingSign: string;
  consent:     ReportConsent;

  // Data Quality Report — output of runIntegrityCheck()
  // Surfaced on Page 43 and Birth-Time Sensitivity notices
  dataQuality: import('./schema/dataIntegrity').DataQualityReport;
}

// ─── PERSONAL YEAR ────────────────────────────────────────────────────────────
export function calculatePersonalYear(birthDate: string): number {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const currentYear = new Date().getFullYear();
  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }
  const total = digitSum(month) + digitSum(day) + digitSum(currentYear);
  return reduce(total);
}

// ─── COMPOUND LIFE PATH ───────────────────────────────────────────────────────
export function calculateLifePathFull(birthDate: string): {
  compound: number; reduced: number; display: string;
} {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = reduce(digitSum(month));
  const dR = reduce(digitSum(day));
  const yR = reduce(digitSum(year));

  const compound = mR + dR + yR;
  const reduced  = reduce(compound);
  const display  = (compound !== reduced && compound > 9)
    ? `${compound}/${reduced}`
    : String(reduced);

  return { compound, reduced, display };
}

// ─── BIRTHDAY NUMBER ──────────────────────────────────────────────────────────
export function calculateBirthday(birthDate: string): { number: number; display: string } {
  const day = parseInt(birthDate.split('-')[2] ?? '1', 10);
  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }
  const reduced = reduce(day);
  const display = (day !== reduced && day > 9) ? `${day}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

// ─── ATTITUDE NUMBER ──────────────────────────────────────────────────────────
export function calculateAttitude(birthDate: string): { number: number; display: string } {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    if (n === 11 || n === 22) return n;
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = digitSum(month);
  const dR = digitSum(day);
  const compound = mR + dR;
  const reduced  = reduce(compound);
  const display  = (compound !== reduced && compound > 9) ? `${compound}/${reduced}` : String(reduced);
  return { number: reduced, display };
}

// ─── CURRENT PINNACLE INDEX ───────────────────────────────────────────────────
export function getCurrentPinnacleIndex(
  pinnacles: { startAge: number; endAge: number | null }[],
  birthDate: string
): number {
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0] ?? '1990', 10);
  const currentAge = new Date().getFullYear() - birthYear;

  for (let i = 0; i < pinnacles.length; i++) {
    const p = pinnacles[i]!;
    if (p.endAge === null || currentAge <= p.endAge) return i;
  }
  return pinnacles.length - 1;
}

// ─── CHALLENGES ───────────────────────────────────────────────────────────────
export function calculateChallenges(birthDate: string): number[] {
  const parts = birthDate.split('-');
  const month = parseInt(parts[1] ?? '1', 10);
  const day   = parseInt(parts[2] ?? '1', 10);
  const year  = parseInt(parts[0] ?? '1990', 10);

  function digitSum(n: number): number {
    return n.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  }
  function reduce(n: number): number {
    // Challenges reduce fully (no master numbers preserved)
    if (n <= 9) return n;
    return reduce(digitSum(n));
  }

  const mR = reduce(digitSum(month));
  const dR = reduce(digitSum(day));
  const yR = reduce(digitSum(year));

  const c1 = Math.abs(mR - dR);
  const c2 = Math.abs(dR - yR);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(mR - yR);

  return [c1, c2, c3, c4];
}

// ─── SIGN EXTRACTOR ───────────────────────────────────────────────────────────
export function extractSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  const parts = formatted.trim().split(' ');
  return parts[parts.length - 1] ?? '—';
}

// ─── HD TYPE SYNTHESIS ────────────────────────────────────────────────────────
const HD_TYPE_SYNTHESIS: Record<string, string> = {
  'Manifesting Generator': 'Built to respond, move fast, and multitask — your power multiplies when you skip steps the gut approves.',
  'Generator':             'Built to respond and sustain — your energy is magnetic when you\'re doing what genuinely lights you up.',
  'Projector':             'Built to guide and be recognized — your clarity for others is a gift that works best by invitation.',
  'Manifestor':            'Built to initiate and inform — you move first and bring others into what you\'ve already set in motion.',
  'Reflector':             'Built to sample and reflect the health of your environment — your wisdom deepens across the full lunar cycle.',
};
export function hdTypeSynthesis(type: string): string {
  return HD_TYPE_SYNTHESIS[type] ?? `As a ${type}, your design carries specific instructions for how to engage with life.`;
}

// ─── LIFE PATH SYNTHESIS ─────────────────────────────────────────────────────
const LIFE_PATH_SYNTHESIS: Record<number, string> = {
  1:  'Yours is a lifetime of self-definition and leadership — you learn through stepping into your own authority.',
  2:  'Yours is a lifetime of partnership and patience — you learn through listening deeply before you act.',
  3:  'Yours is a lifetime of creative expression and joy — you learn when you stop editing yourself before you speak.',
  4:  'Yours is a lifetime of building solid foundations — what you construct carefully is built to outlast you.',
  5:  'Yours is a lifetime of freedom and adaptability — you learn through variety and the courage to release what no longer serves.',
  6:  'Yours is a lifetime of responsibility and community — you learn through the long arc of relationships and service.',
  7:  'Yours is a lifetime of depth and investigation — you learn when you trust solitude as a source, not a symptom.',
  8:  'Yours is a lifetime of authority and material mastery — you learn through owning your power without apology.',
  9:  'Yours is a lifetime of completion and humanitarianism — you learn through letting go of what has run its course.',
  11: 'Yours is a Master Path of spiritual illumination — you learn by trusting your sensitivity as the precision instrument it is.',
  22: 'Yours is a Master Path of large-scale building — you learn by marrying vision with the discipline to bring it to ground.',
  33: 'Yours is a Master Path of compassionate service — you learn through giving without losing yourself in the giving.',
};
export function lifePathSynthesis(lifePath: number): string {
  return LIFE_PATH_SYNTHESIS[lifePath] ?? `Your Life Path ${lifePath} carries its own unique teaching.`;
}

// ─── SUN SIGN SYNTHESIS ───────────────────────────────────────────────────────
const SUN_SIGN_SYNTHESIS: Record<string, string> = {
  'Aries':       'You meet the world through initiative and directness — the first to arrive and the first to act.',
  'Taurus':      'You meet the world through steadiness and presence — what you build with care is built to last.',
  'Gemini':      'You meet the world through curiosity and connection — ideas and people charge you up.',
  'Cancer':      'You meet the world through feeling and protection — home and belonging anchor every move you make.',
  'Leo':         'You meet the world through presence and expression — you are built to be seen, and to make others feel seen.',
  'Virgo':       'You meet the world through discernment and service — precision and usefulness are your natural languages.',
  'Libra':       'You meet the world through relationship and balance — beauty, fairness, and harmony orient your compass.',
  'Scorpio':     'You meet the world through depth and transformation — the surface rarely holds your attention for long.',
  'Sagittarius': 'You meet the world through seeking and expansion — meaning and truth propel your movement.',
  'Capricorn':   'You meet the world through structure and mastery — you build carefully, and you build for the long term.',
  'Aquarius':    'You meet the world through innovation and collective vision — you tend to be a version ahead of the room.',
  'Pisces':      'You meet the world through feeling and fluidity — your sensitivity is the instrument, not the obstacle.',
};
export function sunSignSynthesis(sign: string): string {
  return SUN_SIGN_SYNTHESIS[sign] ?? `Your ${sign} Sun shapes how you meet and engage with the world around you.`;
}

// ─── PERSONAL YEAR THEMES ─────────────────────────────────────────────────────
export const PERSONAL_YEAR_THEMES: Record<number, { title: string; essence: string; themes: string[]; caution: string }> = {
  1: { title: 'Year of New Beginnings', essence: 'Seeds planted now carry unusual weight. This is a year to define direction, not to harvest it.', themes: ['Self-definition', 'New ventures', 'Independence', 'Clarity of identity'], caution: 'Resist the urge to finish what belongs to last cycle. The energy is for starting, not completing.' },
  2: { title: 'Year of Patience and Partnership', essence: 'Progress arrives through relationship and cooperation this year — not through solo effort.', themes: ['Partnership', 'Listening', 'Diplomacy', 'Gathering before acting'], caution: 'Avoid forcing timelines. What arrives slowly this year is often more durable.' },
  3: { title: 'Year of Creative Expression', essence: 'A year when self-expression and social connection carry genuine momentum.', themes: ['Creativity', 'Communication', 'Joy', 'Social expansion'], caution: 'Scattered attention is the risk. Channel the energy into one or two things that matter.' },
  4: { title: 'Year of Building and Foundation', essence: 'Discipline, structure, and steady work are rewarded this year.', themes: ['Discipline', 'Structure', 'Practicality', 'Long-term investment'], caution: 'Tedium is part of the process. The year rewards patience, not speed.' },
  5: { title: 'Year of Change and Freedom', essence: 'Movement, release, and new experience define this year.', themes: ['Change', 'Freedom', 'Travel', 'Release', 'Adaptability'], caution: 'Not all change that appears is progress. Discern before releasing what still has value.' },
  6: { title: 'Year of Responsibility and Home', essence: 'Relationships, home, family, and community take center stage.', themes: ['Relationships', 'Home', 'Service', 'Responsibility', 'Healing'], caution: 'The risk is over-giving. Service that depletes you does not serve anyone well.' },
  7: { title: 'Year of Reflection and Depth', essence: 'A year for inner work, solitude, and investigation.', themes: ['Solitude', 'Depth', 'Spiritual inquiry', 'Research', 'Inner clarity'], caution: 'Isolation differs from solitude. Stay connected while protecting your inner space.' },
  8: { title: 'Year of Power and Harvest', essence: 'What you built in previous years now becomes visible.', themes: ['Authority', 'Financial focus', 'Power', 'Harvest', 'Recognition'], caution: 'Force and manipulation block the year\'s natural flow. Power is available; grasping repels it.' },
  9: { title: 'Year of Completion and Release', essence: 'A nine-year cycle closes.', themes: ['Completion', 'Release', 'Endings', 'Integration', 'Compassion'], caution: 'Do not start major new projects this year. Close, complete, and integrate before the next cycle opens.' },
  11: { title: 'Master Year of Illumination', essence: 'A year of heightened intuition, spiritual alignment, and unusual clarity.', themes: ['Intuition', 'Spiritual alignment', 'Illumination', 'Inspiration'], caution: 'The intensity of this year is real. Rest and integration are not optional — they are part of the work.' },
  22: { title: 'Master Year of the Builder', essence: 'A year for large-scale vision and the discipline to bring it to ground.', themes: ['Legacy', 'Mastery', 'Large-scale building', 'Discipline'], caution: 'The scope of this year can be overwhelming. Build the next thing, not all the things.' },
};
// ─── AUTHORITY PROTOCOL (used by Page7DecisionProtocol) ──────────────────────
export const AUTHORITY_PROTOCOL: Record<string, {
  prompt: string; instruction: string; signal: string;
}> = {
  'Sacral': {
    prompt:      'What does your gut say right now?',
    instruction: 'Before reasoning through the decision, notice your body\'s immediate response. A full, warm yes. A flat or contracted no. Not a thought — a sensation.',
    signal:      'Sacral yes: lift, warmth, pull. Sacral no: flatness, contraction, silence.',
  },
  'Emotional': {
    prompt:      'Have you waited for emotional clarity?',
    instruction: 'Your authority operates across time. Notice how you feel about this decision across different emotional states — excited, neutral, reflective. Only commit when the clarity holds across moods.',
    signal:      'Emotional clarity: consistent, calm recognition across multiple emotional states.',
  },
  'Splenic': {
    prompt:      'What did your first moment tell you?',
    instruction: 'Your intuition speaks once, quietly, in the first instant of contact with a decision. Before analysis began. Retrieve that first signal — it carries more information than what came after.',
    signal:      'Splenic signal: a quiet knowing in the first moment. Often missed when overridden by reason.',
  },
  'Self-Projected': {
    prompt:      'What do you hear yourself say aloud?',
    instruction: 'Talk through this decision with a trusted person who will listen without advising. As you speak, notice what you actually say — not what you planned to say. Your authority lives in your own voice.',
    signal:      'Clarity comes through speaking, not through thinking alone.',
  },
  'Ego': {
    prompt:      'Does this align with what you genuinely want?',
    instruction: 'Not what you should want. Not what would be admirable. What do you, specifically, want — and are you willing to commit to it with your full will?',
    signal:      'Ego authority: a clear, unforced "I want this" that doesn\'t require justification.',
  },
  'None': {
    prompt:      'What does the environment reflect back?',
    instruction: 'Your authority is environmental — you need to move through different spaces and conversations before clarity arrives. Notice what you think, say, and feel in different contexts over time.',
    signal:      'Clarity comes from environmental sampling, not from a single internal signal.',
  },
};

// ─── TYPE EXPERIMENT (used by Page9SevenDay) ──────────────────────────────────
export const TYPE_EXPERIMENT: Record<string, {
  title: string; premise: string; checkins: string[];
}> = {
  'Manifesting Generator': {
    title:   'The Response Experiment',
    premise: 'For seven days, practice the foundational move of your design: responding rather than initiating. Before committing to anything new — a project, a conversation, a plan — pause and locate your Sacral response. Not a thought. A body signal. A full yes or the absence of one.',
    checkins: [
      'Morning: What is showing up today that I could respond to, rather than initiate?',
      'Midday: Where did I initiate or push when I could have waited for a pull?',
      'Evening: What felt genuinely lit up? What felt like effort against friction?',
    ],
  },
  'Generator': {
    title:   'The Response Experiment',
    premise: 'For seven days, commit to responding rather than initiating. Each time something appears in your environment — an opportunity, a question, a request — notice your Sacral response before your mind has a chance to override it.',
    checkins: [
      'Morning: What am I being invited to respond to today?',
      'Midday: Did I say yes from genuine enthusiasm, or from obligation?',
      'Evening: What drained me? What energized me? Note the pattern.',
    ],
  },
  'Projector': {
    title:   'The Recognition Experiment',
    premise: 'For seven days, practice waiting for genuine recognition before offering your insight — even casually. Notice how often you reach to share before being asked. Notice what happens when you hold the insight until invited.',
    checkins: [
      'Morning: Where might I be invited to guide today?',
      'Midday: Did I offer unsolicited advice? How was it received?',
      'Evening: Where did I feel recognized? Where did I feel invisible?',
    ],
  },
  'Manifestor': {
    title:   'The Inform Experiment',
    premise: 'For seven days, practice informing the people who will be affected by your actions before you take them — not to ask permission, but to remove resistance.',
    checkins: [
      'Morning: What am I planning to initiate today? Who needs to know?',
      'Midday: Where did I move without informing? What was the result?',
      'Evening: Where did informing first create space rather than friction?',
    ],
  },
  'Reflector': {
    title:   'The Environment Experiment',
    premise: 'For seven days, pay close attention to how different environments, people, and spaces affect your energy, clarity, and sense of self.',
    checkins: [
      'Morning: What environment am I moving into today, and how does it feel?',
      'Midday: What am I amplifying or reflecting from the people around me?',
      'Evening: Where did I feel most like myself today? Least like myself?',
    ],
  },
};

// ─── FIRDARIA TIME LORD & ANNUAL PROFECTIONS (used by Section 5 Stoplight timing pages) ───

export type FirdariaPlanet =
  | 'Sun' | 'Venus' | 'Mercury' | 'Moon' | 'Saturn'
  | 'Jupiter' | 'Mars' | 'North Node' | 'South Node';

interface FirdariaSlot { planet: FirdariaPlanet; years: number; }

const FIRDARIA_DAY_SEQUENCE: FirdariaSlot[] = [
  { planet: 'Sun',        years: 10 },
  { planet: 'Venus',      years: 8  },
  { planet: 'Mercury',    years: 13 },
  { planet: 'Moon',       years: 9  },
  { planet: 'Saturn',     years: 11 },
  { planet: 'Jupiter',    years: 12 },
  { planet: 'Mars',       years: 7  },
  { planet: 'North Node', years: 3  },
  { planet: 'South Node', years: 2  },
];

const FIRDARIA_NIGHT_SEQUENCE: FirdariaSlot[] = [
  { planet: 'Moon',       years: 9  },
  { planet: 'Saturn',     years: 11 },
  { planet: 'Jupiter',    years: 12 },
  { planet: 'Mars',       years: 7  },
  { planet: 'Sun',        years: 10 },
  { planet: 'Venus',      years: 8  },
  { planet: 'Mercury',    years: 13 },
  { planet: 'North Node', years: 3  },
  { planet: 'South Node', years: 2  },
];

export const FIRDARIA_TAGLINES: Record<FirdariaPlanet, string> = {
  Sun:          'Vitality, visibility, and leading from the front',
  Venus:        'Harmony, attraction, and relational ease',
  Mercury:      'Analysis, exchange, and gathering information',
  Moon:         'Receptivity, rhythm, and emotional foundation',
  Saturn:       'Structure, mastery, and consolidation',
  Jupiter:      'Expansion, opportunity, and growth',
  Mars:         'Initiative, drive, and direct action',
  'North Node': 'Momentum toward unfamiliar, forward-facing terrain',
  'South Node': 'Release, integration, and closing loops',
};

/** Traditional (whole-sign) planetary rulers — mirrors the Chart Ruler table on Page 31. */
export const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const FIRDARIA_ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Whole Sign house number (1–12) of a planet's sign, counted from the Ascendant sign. */
function firdariaWholeSignHouse(planetSign: string, ascSign: string): number | null {
  const p = FIRDARIA_ZODIAC_ORDER.indexOf(planetSign);
  const a = FIRDARIA_ZODIAC_ORDER.indexOf(ascSign);
  if (p === -1 || a === -1) return null;
  return 1 + ((p - a + 12) % 12);
}

/** Day chart (diurnal) when the Sun falls in houses 7–12 (above the horizon). */
function isDiurnalChart(sunSign: string, ascSign: string): boolean {
  const house = firdariaWholeSignHouse(sunSign, ascSign);
  if (house === null) return true; // default to a day chart when Rising is unconfirmed
  return house >= 7 && house <= 12;
}

function ageInYears(birthDate: string): { exact: number; completed: number } {
  const parts = birthDate.split('-');
  const y = parseInt(parts[0] ?? '1990', 10);
  const m = parseInt(parts[1] ?? '1', 10);
  const d = parseInt(parts[2] ?? '1', 10);
  const birth = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;
  const exact = (today - birth) / MS_PER_YEAR;
  return { exact, completed: Math.floor(exact) };
}

export interface FirdariaPeriod {
  planet:    FirdariaPlanet;
  startAge:  number;
  endAge:    number;
  startYear: number;
  endYear:   number;
  tagline:   string;
}

export interface FirdariaResult {
  isDayChart:     boolean;
  sequence:       FirdariaPeriod[];   // the full 75-year cycle, in order
  currentIndex:   number;
  previous:       FirdariaPeriod | null;
  current:        FirdariaPeriod;
  next:           FirdariaPeriod | null;
  ageExact:       number;
  yearsElapsed:   number;
  yearsRemaining: number;
}

/**
 * Firdaria — classical (Persian) system of sequential planetary ruling periods across
 * a 75-year cycle. Sect (day/night) is set by the Sun's Whole Sign house: day charts
 * begin with the Sun, night charts begin with the Moon. Falls back to a day chart when
 * the Rising sign is unconfirmed (sect cannot be determined without it).
 */
export function calculateFirdaria(birthDate: string, sunSign: string, ascSign: string): FirdariaResult {
  const isDayChart = isDiurnalChart(sunSign, ascSign);
  const order = isDayChart ? FIRDARIA_DAY_SEQUENCE : FIRDARIA_NIGHT_SEQUENCE;
  const birthYear = parseInt(birthDate.split('-')[0] ?? '1990', 10);

  let cursor = 0;
  const sequence: FirdariaPeriod[] = order.map(({ planet, years }) => {
    const startAge = cursor;
    const endAge = cursor + years;
    cursor = endAge;
    return {
      planet,
      startAge,
      endAge,
      startYear: birthYear + startAge,
      endYear:   birthYear + endAge,
      tagline:   FIRDARIA_TAGLINES[planet],
    };
  });

  const { exact } = ageInYears(birthDate);
  let currentIndex = sequence.findIndex(p => exact >= p.startAge && exact < p.endAge);
  if (currentIndex === -1) currentIndex = exact < 0 ? 0 : sequence.length - 1;

  const current = sequence[currentIndex]!;

  return {
    isDayChart,
    sequence,
    currentIndex,
    previous: currentIndex > 0 ? sequence[currentIndex - 1]! : null,
    current,
    next: currentIndex < sequence.length - 1 ? sequence[currentIndex + 1]! : null,
    ageExact: exact,
    yearsElapsed: Math.max(0, exact - current.startAge),
    yearsRemaining: Math.max(0, current.endAge - exact),
  };
}

export interface ProfectionResult {
  age:   number;   // completed age for this profection year
  house: number;   // 1–12, Whole Sign, counted from the natal Ascendant
  sign:  string;
  lord:  string;   // traditional ruler of that sign — the "Lord of the Year"
}

/**
 * Annual Profections — advances one Whole Sign house per year of life from the natal
 * Ascendant (age 0 → House 1, age 1 → House 2, …). The ruling planet of that year's
 * house is the "Lord of the Year" — the single-year companion to the Firdaria major period.
 */
export function calculateProfection(birthDate: string, ascSign: string): ProfectionResult {
  const { completed } = ageInYears(birthDate);
  const house = (completed % 12) + 1;
  const ascIndex = FIRDARIA_ZODIAC_ORDER.indexOf(ascSign);
  const signIndex = ascIndex === -1 ? house - 1 : (ascIndex + house - 1) % 12;
  const sign = FIRDARIA_ZODIAC_ORDER[signIndex]!;
  return {
    age: completed,
    house,
    sign,
    lord: TRADITIONAL_RULERS[sign] ?? sign,
  };
}

// ─── DEFINITION TYPE — Single / Split / Triple Split / Quadruple Split ────────
//
// Definition describes how a person's defined Centers connect to each other.
// It's the connectivity of the graph whose nodes are the defined Centers and
// whose edges are the active (defined) Channels between them — the number of
// connected components is the Definition Type. This is pure graph math over
// data the Human Design engine already computes (hdDefinedCenters + hdChannels
// with their fromCenter/toCenter); no external formula or lookup table needed.

export type DefinitionType = 'Single' | 'Split' | 'Triple Split' | 'Quadruple Split' | 'No Definition';

export interface DefinitionResult {
  type: DefinitionType;
  circuitCount: number;       // number of connected groups of defined Centers
  groups: string[][];         // each connected group's Center names
}

const DEFINITION_LABELS: Record<number, DefinitionType> = {
  0: 'No Definition',   // Reflectors — no defined Centers at all
  1: 'Single',
  2: 'Split',
  3: 'Triple Split',
  4: 'Quadruple Split',
};

export const DEFINITION_MEANING: Record<DefinitionType, string> = {
  'Single': 'All your defined Centers connect in one continuous circuit. Consistent, self-contained energy — you don’t need another person to feel whole. Can read as fixed or set in your ways.',
  'Split': 'Two separate circuits that don’t connect on their own. You’re built to seek people who "bridge" the split and complete your circuitry — relationships carry real energetic weight for you.',
  'Triple Split': 'Three separate circuits. Highly adaptable — you draw on different people to bridge different splits. You tend to thrive in groups, and decisions benefit from time and outside input.',
  'Quadruple Split': 'Four separate circuits — the rarest Definition. Extremely flexible and environment-dependent. A stable, consistent community does more for your grounding and clarity than it does for most people.',
  'No Definition': 'No Centers are defined — every Center is open. This is the Reflector configuration: a different mechanic entirely, sampling and reflecting the energy of whoever and wherever you are.',
};

export function calculateDefinition(
  definedCenters: string[],
  channels: { fromCenter: string; toCenter: string }[]
): DefinitionResult {
  if (definedCenters.length === 0) {
    return { type: 'No Definition', circuitCount: 0, groups: [] };
  }

  // Union-Find over the defined Centers, connected by edges from active channels
  const parent = new Map<string, string>();
  const find = (c: string): string => {
    let root = c;
    while (parent.get(root) && parent.get(root) !== root) root = parent.get(root)!;
    parent.set(c, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const center of definedCenters) parent.set(center, center);
  for (const ch of channels) {
    if (definedCenters.includes(ch.fromCenter) && definedCenters.includes(ch.toCenter)) {
      union(ch.fromCenter, ch.toCenter);
    }
  }

  const groupMap = new Map<string, string[]>();
  for (const center of definedCenters) {
    const root = find(center);
    if (!groupMap.has(root)) groupMap.set(root, []);
    groupMap.get(root)!.push(center);
  }

  const groups = [...groupMap.values()];
  const circuitCount = groups.length;

  return {
    type: DEFINITION_LABELS[circuitCount] ?? 'Quadruple Split',
    circuitCount,
    groups,
  };
}

// ─── CIRCUIT BALANCE — Individual / Collective / Tribal ───────────────────────
//
// Tallies each of the user's active (defined) Channels against the full
// 36-channel circuit classification (src/lib/report/section3/gate-content.ts,
// sourced from a practitioner reference) to find which Circuit Group(s)
// dominate their design. A channel not found in the table (shouldn't happen
// with valid chart data, but data can be messy) is skipped rather than
// guessed at.

import { CHANNELS, findChannelCircuit, type CircuitGroup, type ChannelCircuit } from './section3/gate-content';

export interface CircuitBalanceResult {
  matched: ChannelCircuit[];           // the user's active channels, resolved to circuit info
  counts: Record<CircuitGroup | 'Integration', number>;
  dominant: CircuitGroup | 'Integration' | 'None' | 'Even';
}

export function calculateCircuitBalance(
  activeChannels: { gates: number[] }[]
): CircuitBalanceResult {
  const matched: ChannelCircuit[] = [];
  const counts: Record<CircuitGroup | 'Integration', number> = {
    Individual: 0, Collective: 0, Tribal: 0, Integration: 0,
  };

  for (const ch of activeChannels) {
    const [a, b] = ch.gates;
    if (a === undefined || b === undefined) continue;
    const found = findChannelCircuit(a, b);
    if (found) {
      matched.push(found);
      counts[found.group] += 1;
    }
  }

  if (matched.length === 0) {
    return { matched, counts, dominant: 'None' };
  }

  const max = Math.max(counts.Individual, counts.Collective, counts.Tribal, counts.Integration);
  const topGroups = (Object.keys(counts) as (CircuitGroup | 'Integration')[])
    .filter(g => counts[g] === max);

  return {
    matched,
    counts,
    dominant: topGroups.length === 1 ? topGroups[0]! : 'Even',
  };
}
