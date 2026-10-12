/**
 * The name and one-line meaning of each number 1–9 and the master numbers, so the Year and Month dials
 * can say what their number means, not only what it is. Same words the server uses for the Day.
 * Pure data with no imports, so tests can use it directly.
 */
export const NUMBER_WORDS: Record<number, { word: string; line: string }> = {
  1: { word: 'Beginnings', line: 'new starts, independence and leading from the front' },
  2: { word: 'Partnership', line: 'harmony, patience and working with others' },
  3: { word: 'Expression', line: 'creativity, communication and optimism' },
  4: { word: 'Foundations', line: 'hard work, practical structure and steady effort' },
  5: { word: 'Change', line: 'freedom, movement and adapting' },
  6: { word: 'Responsibility', line: 'home, family and caring for others' },
  7: { word: 'Reflection', line: 'quiet, research and inner trust' },
  8: { word: 'Authority', line: 'power, money and material balance' },
  9: { word: 'Completion', line: 'endings, compassion and letting go' },
  11: { word: 'Illumination', line: 'intuition and inspiration' },
  22: { word: 'Master Builder', line: 'turning big visions into real things' },
  33: { word: 'Master Teacher', line: 'selfless service and care' },
};

export function numberWord(n: number): string {
  return NUMBER_WORDS[n]?.word ?? '';
}

export type CycleScope = 'Year' | 'Month' | 'Day';

const SCOPE_NOTE: Record<CycleScope, string> = {
  Year: 'the theme of your whole year',
  Month: 'the tone of this month inside that year',
  Day: 'how today lands inside the month',
};

/** One plain sentence per cycle: "Personal Year 4, Foundations: the theme of your whole year (hard work…)". */
export function cycleLine(scope: CycleScope, n: number): string {
  const m = NUMBER_WORDS[n];
  if (!m) return `Personal ${scope} ${n}: ${SCOPE_NOTE[scope]}.`;
  return `Personal ${scope} ${n}, ${m.word}: ${SCOPE_NOTE[scope]}, about ${m.line}.`;
}
