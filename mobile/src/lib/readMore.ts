/**
 * Splits a long note into a short opening and the rest, always at a sentence end, so a section intro can
 * show two or three lines with "Read more". Pure, no imports.
 */
export interface ReadMoreSplit {
  short: string;
  rest: string | null;
}

export function readMoreSplit(text: string, max = 220): ReadMoreSplit {
  const clean = text.trim();
  if (clean.length <= max * 1.25) return { short: clean, rest: null };
  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [clean];
  let short = '';
  let used = 0;
  for (const s of sentences) {
    if (used > 0 && (short + s).trim().length > max) break;
    short += s;
    used += 1;
  }
  short = short.trim();
  const rest = clean.slice(short.length).trim();
  return rest ? { short, rest } : { short: clean, rest: null };
}
