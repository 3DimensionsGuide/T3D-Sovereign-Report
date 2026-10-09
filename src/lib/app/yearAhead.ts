/**
 * "Your year ahead": one plain-language page that joins the layers the app already
 * calculates for a birthday-to-birthday year:
 *   1. the long chapter (planetary cycles that arrive at certain ages),
 *   2. the topic (the annual profection house and its Lord of the Year),
 *   3. the pace (the Personal Year number).
 * Slow-planet seasons come from the same timeline response and are shown beside it.
 *
 * Wording describes tendencies, never verdicts. Cycle ages are windows, not exact dates.
 * Nothing here stores or logs anything.
 */

import { FIRDARIA_ANALYSIS } from '@/lib/report/section5/firdaria-content';
import { HOUSE_NAMES, HOUSE_THEMES } from '@/lib/report/advanced/stoplight/transits-content';
import type { TimelineResult } from '@/server/engines/timeline';
import type { FirdariaPlanet } from '@/lib/report/tokens';

export interface YearChapterItem {
  name: string;
  /** 'now' = this birthday-year falls in the window; 'next' = the following one does. */
  when: 'now' | 'next';
  ages: string;
  text: string;
}

export interface YearAhead {
  age: number;
  startsOn: string;
  endsOn: string;
  summary: string;
  chapter: { items: YearChapterItem[]; none: string };
  topic: {
    house: number;
    houseName: string;
    sign: string;
    lord: string;
    theme: string;
    lordQuote: string | null;
  };
  pace: { personalYear: number | null; word: string | null; line: string | null; universalYear: number };
  closing: string;
}

interface Milestone {
  name: string;
  /** Birthday-year ages (the age at the start of the year) in which it tends to be felt. */
  years: number[];
  ages: string;
  text: string;
}

function buildMilestones(): Milestone[] {
  const list: Milestone[] = [];
  const jupiterText =
    'A season of expansion: new horizons, updated beliefs and openings for growth. It comes round about every twelve years.';
  for (let k = 1; k <= 8; k += 1) {
    list.push({ name: 'Jupiter return', years: [12 * k - 1, 12 * k], ages: `around age ${12 * k}`, text: jupiterText });
  }
  const nodalText =
    'A direction check-in that comes about every 18 and a half years, when your path tends to get re-aligned with where you are headed.';
  [[18, 19, 'around age 18 to 19'], [37, 37, 'around age 37'], [55, 56, 'around age 55 to 56'], [74, 75, 'around age 74 to 75']].forEach(
    ([a, b, label]) => list.push({ name: 'Nodal return', years: [a as number, b as number], ages: label as string, text: nodalText }),
  );
  const saturnText =
    'Adult maturing, shedding habits that no longer fit, setting firmer boundaries and building structures meant to last. It comes round about every 29 and a half years.';
  [[27, 30, 'late 20s to about 30'], [57, 60, 'late 50s to about 60'], [86, 89, 'late 80s']].forEach(([a, b, label]) => {
    const years: number[] = [];
    for (let y = a as number; y <= (b as number); y += 1) years.push(y);
    list.push({ name: 'Saturn return', years, ages: label as string, text: saturnText });
  });
  const uranus: number[] = [];
  for (let y = 38; y <= 44; y += 1) uranus.push(y);
  list.push({
    name: 'Uranus opposition',
    years: uranus,
    ages: 'about ages 38 to 44',
    text: 'A midlife shift toward freedom: loosening old conditioning and living more by your own design.',
  });
  list.push({
    name: 'Chiron return',
    years: [49, 50, 51],
    ages: 'around age 50',
    text: 'A time when old tender spots tend to be understood, and the fuller flowering of your wisdom shows up.',
  });
  return list;
}

const MILESTONES = buildMilestones();

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function buildYearAhead(timeline: TimelineResult): YearAhead {
  const p = timeline.profection;
  const age = p.age;

  const chapter: YearChapterItem[] = [];
  for (const m of MILESTONES) {
    if (m.years.includes(age)) chapter.push({ name: m.name, when: 'now', ages: m.ages, text: m.text });
    else if (m.years.includes(age + 1)) chapter.push({ name: m.name, when: 'next', ages: m.ages, text: m.text });
  }
  chapter.sort((a, b) => (a.when === b.when ? 0 : a.when === 'now' ? -1 : 1));

  const houseName = HOUSE_NAMES[p.house] ?? '';
  const theme = HOUSE_THEMES[p.house] ?? '';
  const lord = cap(p.lord);
  const lordQuote = FIRDARIA_ANALYSIS[lord as FirdariaPlanet]?.quote ?? null;

  const today = timeline.personal[0];
  const py = today?.year ?? null;
  const meaning = py ? timeline.numberMeanings[py] : undefined;

  const nowNames = chapter.filter((c) => c.when === 'now').map((c) => c.name.toLowerCase());
  const summaryParts: string[] = [];
  if (nowNames.length > 0) {
    summaryParts.push(`This year sits inside a ${nowNames.join(' and ')} chapter, which sets a wider backdrop of growth.`);
  }
  summaryParts.push(
    `The topic that tends to come forward is your ${p.house}${ordinalSuffix(p.house)} house, ${houseName.toLowerCase()}: ${theme.charAt(0).toLowerCase()}${theme.slice(1)}`,
  );
  summaryParts.push(`${lord} is your Lord of the Year, so ${lord}’s themes and any contact it makes to your chart tend to matter more than usual.`);
  if (py && meaning) {
    summaryParts.push(`Personal Year ${py} (${meaning.word.toLowerCase()}) sets the pace: ${meaning.line.charAt(0).toLowerCase()}${meaning.line.slice(1)}`);
  }

  return {
    age,
    startsOn: p.startsOn,
    endsOn: p.endsOn,
    summary: summaryParts.join(' '),
    chapter: {
      items: chapter,
      none: 'No major long cycle is centered on this year. That is common, and it leaves the topic and pace below to set the tone.',
    },
    topic: { house: p.house, houseName, sign: p.sign, lord, theme, lordQuote },
    pace: {
      personalYear: py,
      word: meaning?.word ?? null,
      line: meaning?.line ?? null,
      universalYear: timeline.universalYear,
    },
    closing:
      'Think of this page as weather, not a forecast of events. The ages for long cycles are windows, not exact dates. Decisions still belong to you, through your own Strategy and Authority.',
  };
}

function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th';
}
