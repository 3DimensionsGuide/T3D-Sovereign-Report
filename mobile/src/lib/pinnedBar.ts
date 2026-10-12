import type { RoadStripModel } from './roadStrip';

/** The second line of a pinned bar: the card the reader opened last, otherwise a short summary. */
export function pinnedLine(openCard: string | null, summary: string): string {
  return openCard ? `Reading: ${openCard}` : summary;
}

/**
 * Remembers which card was opened last. Opening a card makes it the one shown;
 * closing it clears the bar only if it was the one being shown. A card that starts open only fills an empty bar.
 */
export function nextOpenCard(current: string | null, title: string, open: boolean, initial = false): string | null {
  // Cards that start open report in page order; the first one (highest on the page) keeps the bar.
  if (initial) return current ?? title;
  if (open) return title;
  return current === title ? null : current;
}

export interface RoadPin { title: string; summary: string }

/** What the Road bar says beside the four Pinnacles. */
export function roadPin(lifePath: string | null, model: RoadStripModel | null): RoadPin {
  const title = lifePath ? `Life Path ${lifePath}` : 'Your Road';
  const current = model?.segments.find((s) => s.current);
  if (!model || !current) return { title, summary: `${model?.segments.length ?? 4} Pinnacles along your life` };
  return { title, summary: `Pinnacle ${current.index + 1} of ${model.segments.length} is ${/^(8|11|18)$/.test(String(current.number)) ? 'an' : 'a'} ${current.number}` };
}

export interface WheelPin { title: string; summary: string }

/** What the Stoplight bar says beside the wheel. Rising needs a birth time, so it is left out without one. */
export function wheelPin(sun: string, moon: string, rising: string | null): WheelPin {
  return {
    title: `Sun ${sun} · Moon ${moon}`,
    summary: rising ? `Rising ${rising}` : 'Rising needs a birth time',
  };
}
