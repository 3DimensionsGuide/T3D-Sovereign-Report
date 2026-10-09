/**
 * How sure is a Human Design Type and Authority when the birth time is not
 * known? Calculates the chart for every hour of the birth day and reports
 * whether the answer is the same all day.
 */

import { calculateHumanDesign } from '@/server/engines/human_design';
import type { HumanDesignInput } from '@/server/engines/types';

export interface HdCertainty {
  type: string;
  authority: string;
  certainty: 'sure' | 'depends';
  /** "Type · Authority" for every distinct result seen across the day. */
  possibilities: string[];
}

export function hdCertainty(input: Omit<HumanDesignInput, 'birthTime'>, birthTime: string | null): HdCertainty {
  if (birthTime) {
    const hd = calculateHumanDesign({ ...input, birthTime });
    return { type: hd.type, authority: hd.authority, certainty: 'sure', possibilities: [] };
  }
  const seen = new Map<string, { type: string; authority: string }>();
  let noon = { type: '', authority: '' };
  for (let hour = 0; hour < 24; hour += 1) {
    const hd = calculateHumanDesign({ ...input, birthTime: `${String(hour).padStart(2, '0')}:30` });
    seen.set(`${hd.type} · ${hd.authority}`, { type: hd.type, authority: hd.authority });
    if (hour === 12) noon = { type: hd.type, authority: hd.authority };
  }
  const possibilities = [...seen.keys()];
  return {
    type: noon.type,
    authority: noon.authority,
    certainty: possibilities.length === 1 ? 'sure' : 'depends',
    possibilities: possibilities.length === 1 ? [] : possibilities,
  };
}
