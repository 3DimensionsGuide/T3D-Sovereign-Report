/**
 * The "decide together" calculation for two people, shared by the routes that need it (server-side only).
 *
 * Each side is described by a birth date, an optional birth time and an optional birth place. A side with
 * no place is a first look: its Human Design is checked across the day before, the day itself and the day
 * after (so any time zone on Earth is covered), and anything that changes across those days is reported as
 * "depends" instead of guessed. Nothing is stored and nothing is logged.
 */

import { buildDecideTogether, type TogetherPersonInput } from '@/lib/app/decideTogether';
import { hdCertainty, type HdCertainty } from '@/server/engines/hdCertainty';
import { calculateDayNumerology } from '@/server/engines/dayNumerology';
import { calculateAstrology } from '@/server/engines/astrology';
import { calculateLifePath } from '@/server/engines/numerology';
import { buildConnections, buildNumberPair, buildSynastry, type GateKnowledge } from '@/lib/app/relationshipPieces';
import { buildCenterEffects, buildHouseOverlays, type CenterKnowledge } from '@/lib/app/relationshipExtras';

export interface TogetherPlace {
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface TogetherSide {
  label: string;
  /** YYYY-MM-DD */
  birthDate: string;
  /** HH:MM, or null when the birth time is not known. */
  birthTime: string | null;
  /** Null when the birth place is not known. */
  place: TogetherPlace | null;
  /** A chart already calculated for this person; used as is when the birth time is known. */
  saved?: { type: string | null; authority: string | null };
}

const addDays = (date: string, days: number): string => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const inter = <T,>(a: T[], b: T[]): T[] => a.filter((x) => b.includes(x));
const union = <T,>(a: T[], b: T[]): T[] => [...new Set([...a, ...b])];

/** Human Design for a person with no known place: the day before, the day and the day after, merged. */
function looseCertainty(birthDate: string): HdCertainty {
  const days = [-1, 0, 1].map((n) =>
    hdCertainty({ birthDate: addDays(birthDate, n), latitude: 0, longitude: 0, timezone: 'UTC' }, null),
  );
  const middle = days[1];
  const possibilities = [...new Set(days.flatMap((d) => (d.possibilities.length ? d.possibilities : [`${d.type} · ${d.authority}`])))];
  return {
    type: middle.type,
    authority: middle.authority,
    certainty: possibilities.length === 1 ? 'sure' : 'depends',
    possibilities: possibilities.length === 1 ? [] : possibilities,
    gatesAllDay: days.map((d) => d.gatesAllDay).reduce((a, b) => inter(a, b)).sort((x, y) => x - y),
    gatesAnyTime: days.map((d) => d.gatesAnyTime).reduce((a, b) => union(a, b)).sort((x, y) => x - y),
    centersAllDay: days.map((d) => d.centersAllDay).reduce((a, b) => inter(a, b)).sort(),
    centersAnyTime: days.map((d) => d.centersAnyTime).reduce((a, b) => union(a, b)).sort(),
  };
}

function certaintyOf(side: TogetherSide): HdCertainty {
  if (!side.place) return looseCertainty(side.birthDate);
  return hdCertainty(
    { birthDate: side.birthDate, latitude: side.place.latitude, longitude: side.place.longitude, timezone: side.place.timezone },
    side.birthTime,
  );
}

const toGates = (g: { gatesAllDay: number[]; gatesAnyTime: number[] }): GateKnowledge => ({
  sure: new Set(g.gatesAllDay),
  possible: new Set(g.gatesAnyTime),
});
const toCenters = (g: { centersAllDay: string[]; centersAnyTime: string[] }): CenterKnowledge => ({
  sure: new Set(g.centersAllDay),
  possible: new Set(g.centersAnyTime),
});

/** "You" is the person looking at the reading; "them" is the other person. */
export function computeTogether(you: TogetherSide, them: TogetherSide, localDate: string) {
  const youKnown = you.birthTime !== null && you.place !== null;
  const themKnown = them.birthTime !== null && them.place !== null;

  const yourC = certaintyOf(you);
  const theirC = certaintyOf(them);

  const youPerson: TogetherPersonInput = you.saved && youKnown
    ? { label: 'You', type: you.saved.type, authority: you.saved.authority, certainty: 'sure', possibilities: [] }
    : { label: 'You', type: yourC.type, authority: yourC.authority, certainty: yourC.certainty, possibilities: yourC.possibilities };
  const partner: TogetherPersonInput = {
    label: them.label, type: theirC.type, authority: theirC.authority, certainty: theirC.certainty, possibilities: theirC.possibilities,
  };

  const yourDay = calculateDayNumerology(you.birthDate, localDate);
  const theirDay = calculateDayNumerology(them.birthDate, localDate);
  const text = (d: typeof yourDay.personal) => (d.root ? `${d.number}/${d.root}` : String(d.number));

  const data = buildDecideTogether(youPerson, partner, {
    youLabel: 'you',
    youNumber: text(yourDay.personal),
    partnerLabel: them.label,
    partnerNumber: text(theirDay.personal),
  });

  const labels = { you: 'You', them: them.label };
  const known = { you: youKnown, them: themKnown };

  // Each piece is optional: if one cannot be built, the rest still return.
  let connections = null;
  let centers = null;
  try {
    connections = buildConnections(toGates(yourC), toGates(theirC), labels, known);
    centers = buildCenterEffects(toCenters(yourC), toCenters(theirC), labels, known);
  } catch {
    connections = null;
    centers = null;
  }

  let sky = null;
  let houses = null;
  try {
    const skyOf = (s: TogetherSide) =>
      calculateAstrology({
        birthDate: s.birthDate,
        birthTime: s.birthTime ?? '12:00',
        latitude: s.place?.latitude ?? 0,
        longitude: s.place?.longitude ?? 0,
        timezone: s.place?.timezone ?? 'UTC',
      }).tropical;
    const yourSky = skyOf(you);
    const theirSky = skyOf(them);
    sky = buildSynastry(yourSky, theirSky, labels, known);
    houses = buildHouseOverlays(yourSky, theirSky, labels, known);
  } catch {
    sky = null;
    houses = null;
  }

  let numbers = null;
  try {
    numbers = buildNumberPair(
      { lifePath: calculateLifePath(you.birthDate), personalYear: yourDay.personalYear },
      { lifePath: calculateLifePath(them.birthDate), personalYear: theirDay.personalYear },
      labels,
    );
  } catch {
    numbers = null;
  }

  return { ...data, connections, centers, numbers, sky, houses };
}
