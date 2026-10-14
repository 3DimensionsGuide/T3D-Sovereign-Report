/**
 * The 64 hexagram line patterns. A Human Design gate number is the same as its hexagram number in the
 * King Wen order, so the picture for any gate comes from its number alone. Pure, with no imports.
 */
export type Trigram = 'qian' | 'kun' | 'zhen' | 'kan' | 'gen' | 'xun' | 'li' | 'dui';

/** Lines from bottom to top; true is a solid (yang) line, false a broken (yin) line. */
const TRIGRAM_LINES: Record<Trigram, readonly [boolean, boolean, boolean]> = {
  qian: [true, true, true],
  kun: [false, false, false],
  zhen: [true, false, false],
  kan: [false, true, false],
  gen: [false, false, true],
  xun: [false, true, true],
  li: [true, false, true],
  dui: [true, true, false],
};

/** [upper, lower] trigram for hexagrams 1 to 64, in King Wen order. */
const KING_WEN: readonly (readonly [Trigram, Trigram])[] = [
  ['qian', 'qian'], ['kun', 'kun'], ['kan', 'zhen'], ['gen', 'kan'], ['kan', 'qian'], ['qian', 'kan'], ['kun', 'kan'], ['kan', 'kun'],
  ['xun', 'qian'], ['qian', 'dui'], ['kun', 'qian'], ['qian', 'kun'], ['qian', 'li'], ['li', 'qian'], ['kun', 'gen'], ['zhen', 'kun'],
  ['dui', 'zhen'], ['gen', 'xun'], ['kun', 'dui'], ['xun', 'kun'], ['li', 'zhen'], ['gen', 'li'], ['gen', 'kun'], ['kun', 'zhen'],
  ['qian', 'zhen'], ['gen', 'qian'], ['gen', 'zhen'], ['dui', 'xun'], ['kan', 'kan'], ['li', 'li'], ['dui', 'gen'], ['zhen', 'xun'],
  ['qian', 'gen'], ['zhen', 'qian'], ['li', 'kun'], ['kun', 'li'], ['xun', 'li'], ['li', 'dui'], ['kan', 'gen'], ['zhen', 'kan'],
  ['gen', 'dui'], ['xun', 'zhen'], ['dui', 'qian'], ['qian', 'xun'], ['dui', 'kun'], ['kun', 'xun'], ['dui', 'kan'], ['kan', 'xun'],
  ['dui', 'li'], ['li', 'xun'], ['zhen', 'zhen'], ['gen', 'gen'], ['xun', 'gen'], ['zhen', 'dui'], ['zhen', 'li'], ['li', 'gen'],
  ['xun', 'xun'], ['dui', 'dui'], ['xun', 'kan'], ['kan', 'dui'], ['xun', 'dui'], ['zhen', 'gen'], ['kan', 'li'], ['li', 'kan'],
];

/** Six lines from bottom to top for a gate (1 to 64), or null for anything else. */
export function hexagramLines(gate: number): boolean[] | null {
  if (!Number.isInteger(gate) || gate < 1 || gate > 64) return null;
  const [upper, lower] = KING_WEN[gate - 1];
  return [...TRIGRAM_LINES[lower], ...TRIGRAM_LINES[upper]];
}

/** One plain sentence for screen readers, bottom line first. */
export function hexagramSpoken(gate: number): string {
  const lines = hexagramLines(gate);
  if (!lines) return '';
  return `Gate ${gate} hexagram, lines from the bottom: ${lines.map((l) => (l ? 'solid' : 'broken')).join(', ')}.`;
}
