/** Geometry for the glossary's A to Z side strip. Pure arithmetic, so tests can use it directly. */
export const LETTER_ITEM = 22;
export const LETTER_PAD = 4;

/** Which letter a touch at this height (measured from the first letter) lands on; -1 when there are none. */
export function letterAt(y: number, count: number, item = LETTER_ITEM): number {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, Math.floor(y / item)));
}

/**
 * Where each letter first appears in a list of sections: [letter, section, item], in A to Z order.
 * `titles` holds one array per section; a null entry (a folded group header, say) is skipped.
 * With several sections, a letter points at the first section that has it.
 */
export function letterTargets(titles: readonly (readonly (string | null)[])[]): [string, number, number][] {
  const seen = new Map<string, [number, number]>();
  titles.forEach((section, s) => {
    section.forEach((title, i) => {
      const L = title?.charAt(0).toUpperCase();
      if (L && /[A-Z]/.test(L) && !seen.has(L)) seen.set(L, [s, i]);
    });
  });
  return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([L, [s, i]]) => [L, s, i]);
}
