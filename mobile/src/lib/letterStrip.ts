/** Geometry for the glossary's A to Z side strip. Pure arithmetic, so tests can use it directly. */
export const LETTER_ITEM = 22;
export const LETTER_PAD = 4;

/** Which letter a touch at this height (measured from the first letter) lands on; -1 when there are none. */
export function letterAt(y: number, count: number, item = LETTER_ITEM): number {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, Math.floor(y / item)));
}
