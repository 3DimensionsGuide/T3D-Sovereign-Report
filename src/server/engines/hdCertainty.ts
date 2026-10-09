/**
 * How sure is a Human Design Type and Authority when the birth time is not
 * known? Calculates the chart for every hour of the birth day and reports
 * whether the answer is the same all day.
 *
 * Also reports which gates are held, so two charts can be compared:
 *  - gatesAllDay: gates present at every hour sampled (certain).
 *  - gatesAnyTime: gates present at any hour sampled (possible).
 * When the birth time is known, both lists are identical.
 */

import { calculateHumanDesign } from '@/server/engines/human_design';
import type { HumanDesignInput } from '@/server/engines/types';

export interface HdCertainty {
  type: string;
  authority: string;
  certainty: 'sure' | 'depends';
  /** "Type · Authority" for every distinct result seen across the day. */
  possibilities: string[];
  gatesAllDay: number[];
  gatesAnyTime: number[];
  /** Centers defined at every hour sampled (certain), and at any hour sampled (possible). */
  centersAllDay: string[];
  centersAnyTime: string[];
}

const gatesOf = (hd: ReturnType<typeof calculateHumanDesign>): Set<number> => new Set(hd.activeGates.map((a) => a.gate));

export function hdCertainty(input: Omit<HumanDesignInput, 'birthTime'>, birthTime: string | null): HdCertainty {
  if (birthTime) {
    const hd = calculateHumanDesign({ ...input, birthTime });
    const gates = [...gatesOf(hd)].sort((a, b) => a - b);
    const centers = [...hd.definedCenters].sort();
    return { type: hd.type, authority: hd.authority, certainty: 'sure', possibilities: [], gatesAllDay: gates, gatesAnyTime: gates, centersAllDay: centers, centersAnyTime: centers };
  }
  const seen = new Map<string, { type: string; authority: string }>();
  let noon = { type: '', authority: '' };
  let all = new Set<number>();
  let first = true;
  const any = new Set<number>();
  let centersAll = new Set<string>();
  const centersAny = new Set<string>();
  for (let hour = 0; hour < 24; hour += 1) {
    const hd = calculateHumanDesign({ ...input, birthTime: `${String(hour).padStart(2, '0')}:30` });
    seen.set(`${hd.type} · ${hd.authority}`, { type: hd.type, authority: hd.authority });
    if (hour === 12) noon = { type: hd.type, authority: hd.authority };
    const g = gatesOf(hd);
    all = first ? new Set(g) : new Set([...all].filter((x) => g.has(x)));
    first = false;
    g.forEach((x) => any.add(x));
    const cs = new Set<string>(hd.definedCenters);
    centersAll = hour === 0 ? new Set(cs) : new Set([...centersAll].filter((x) => cs.has(x)));
    cs.forEach((x) => centersAny.add(x));
  }
  const possibilities = [...seen.keys()];
  return {
    type: noon.type,
    authority: noon.authority,
    certainty: possibilities.length === 1 ? 'sure' : 'depends',
    possibilities: possibilities.length === 1 ? [] : possibilities,
    gatesAllDay: [...all].sort((a, b) => a - b),
    gatesAnyTime: [...any].sort((a, b) => a - b),
    centersAllDay: [...centersAll].sort(),
    centersAnyTime: [...centersAny].sort(),
  };
}
