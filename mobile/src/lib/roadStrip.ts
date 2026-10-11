import type { ChallengeCard, PinnacleCard } from './numerologyTypes';

/**
 * The Road strip: the four Pinnacles laid out along a life, with the Challenge that runs beside each
 * one and a "you are here" position. Pure arithmetic on dates the server already sent.
 *
 * Rule from the T3D knowledge base: when your Personal Year number matches your current Pinnacle or
 * Challenge number, that number is drawn to the "front of the line" for the year.
 */

/** A life is drawn to at least this age, so the last Pinnacle (which has no end) has room. */
const MIN_SPAN = 90;
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

export interface RoadSegment {
  index: number;
  number: number;
  /** The Challenge that runs beside this Pinnacle. */
  challenge: number | null;
  startAge: number;
  endAge: number | null;
  /** Share of the strip, 0 to 100. */
  widthPct: number;
  current: boolean;
  past: boolean;
}

export interface RoadStripModel {
  segments: RoadSegment[];
  /** Where "you are here" sits along the strip, 0 to 100. */
  markerPct: number;
  /** The one plain sentence for the current phase. */
  sentence: string;
  /** Set when the Personal Year matches the current Pinnacle or Challenge. */
  match: string | null;
  spokenSummary: string;
}

/** Master numbers sit on their foundation number: 11 on 2, 22 on 4, 33 on 6. */
export function baseNumber(n: number): number {
  return n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n;
}

const ORDINAL = ['First', 'Second', 'Third', 'Fourth'];

function dayMs(iso: string): number {
  return Date.parse(`${iso}T12:00:00Z`);
}

export function buildRoadStrip(
  pinnacles: ReadonlyArray<PinnacleCard>,
  challenges: ReadonlyArray<ChallengeCard>,
  onDate: string,
  personalYear: number | null,
): RoadStripModel | null {
  if (pinnacles.length === 0 || Number.isNaN(dayMs(onDate))) return null;
  const when = dayMs(onDate);

  let currentIdx = pinnacles.findIndex(
    (p) => when >= dayMs(p.startsOn) && (p.endsOn === null || when < dayMs(p.endsOn)),
  );
  if (currentIdx === -1) currentIdx = when < dayMs(pinnacles[0]!.startsOn) ? 0 : pinnacles.length - 1;

  const last = pinnacles[pinnacles.length - 1]!;
  const span = Math.max(MIN_SPAN, (last.startAge ?? 0) + 18);

  const segments: RoadSegment[] = pinnacles.map((p, i) => {
    const end = p.endAge ?? span;
    return {
      index: i,
      number: p.number,
      challenge: challenges[i]?.number ?? null,
      startAge: p.startAge,
      endAge: p.endAge,
      widthPct: ((end - p.startAge) / span) * 100,
      current: i === currentIdx,
      past: i < currentIdx,
    };
  });

  const cur = pinnacles[currentIdx]!;
  const yearsIn = Math.max(0, (when - dayMs(cur.startsOn)) / YEAR_MS);
  const age = Math.min(cur.startAge + yearsIn, cur.endAge ?? span);
  const markerPct = Math.min(100, Math.max(0, (age / span) * 100));

  const curChallenge = challenges[currentIdx]?.number ?? null;
  const ages = cur.endAge === null ? `from age ${cur.startAge}` : `ages ${cur.startAge} to ${cur.endAge}`;
  const sentence =
    `You are here: your ${ORDINAL[currentIdx] ?? 'Current'} Pinnacle, ${ages}. ` +
    `Pinnacle ${cur.number}${curChallenge === null ? '' : `, Challenge ${curChallenge}`}.`;

  let match: string | null = null;
  if (personalYear !== null) {
    const py = baseNumber(personalYear);
    if (py === baseNumber(cur.number)) {
      match = `Your Personal Year ${personalYear} matches your Pinnacle ${cur.number}. That number is at the front of the line this year.`;
    } else if (curChallenge !== null && py === baseNumber(curChallenge) && curChallenge !== 0) {
      match = `Your Personal Year ${personalYear} matches your Challenge ${curChallenge}. That lesson is at the front of the line this year.`;
    }
  }

  const spokenSummary =
    `${sentence} ` +
    segments
      .map((s) => `${ORDINAL[s.index] ?? 'Next'} Pinnacle ${s.number}${s.challenge === null ? '' : `, Challenge ${s.challenge}`}${s.current ? ', current' : ''}.`)
      .join(' ') +
    (match ? ` ${match}` : '');

  return { segments, markerPct, sentence, match, spokenSummary };
}
