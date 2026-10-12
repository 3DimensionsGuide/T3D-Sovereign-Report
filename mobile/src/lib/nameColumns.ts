import type { NameColumn } from './numerologyTypes';

/** The column with the most letters; the lowest number wins a tie, matching the Hidden Passion rule. */
export function passionColumn(columns: readonly NameColumn[]): number | null {
  const max = Math.max(0, ...columns.map((c) => c.count));
  if (max === 0) return null;
  return columns.find((c) => c.count === max)?.number ?? null;
}

export function emptyColumns(columns: readonly NameColumn[]): number[] {
  return columns.filter((c) => c.count === 0).map((c) => c.number);
}

/** One spoken sentence for the whole grid (VoiceOver). */
export function describeColumns(columns: readonly NameColumn[]): string {
  const top = passionColumn(columns);
  const empty = emptyColumns(columns);
  const counts = columns.map((c) => `${c.number}: ${c.count} ${c.count === 1 ? 'letter' : 'letters'}`).join(', ');
  return `Your name in nine columns. ${counts}.${top ? ` Most letters: ${top}, your Hidden Passion.` : ''}${
    empty.length ? ` Empty: ${empty.join(', ')}, your Karmic ${empty.length === 1 ? 'Lesson' : 'Lessons'}.` : ' No column is empty.'
  }`;
}
