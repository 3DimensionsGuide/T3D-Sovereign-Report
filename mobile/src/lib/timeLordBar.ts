/**
 * The Time Lord as a bar: the years the planet rules, how far through them you are, and what comes
 * next. Uses only the start year, end year and years remaining the server already sends.
 */
export interface TimeLordBarModel {
  /** Share of the period already lived, 0 to 1. */
  fraction: number;
  yearsIn: number;
  yearsLeft: number;
  total: number;
  spoken: string;
}

export function buildTimeLordBar(
  planet: string,
  startYear: number,
  endYear: number,
  yearsRemaining: number,
  next: string | null,
): TimeLordBarModel | null {
  const total = endYear - startYear;
  if (!Number.isFinite(total) || total <= 0) return null;
  const yearsLeft = Math.min(total, Math.max(0, yearsRemaining));
  const yearsIn = total - yearsLeft;
  const fraction = yearsIn / total;
  const spoken =
    `${planet} rules ${startYear} to ${endYear}. You are about ${yearsIn} of ${total} years in, with about ${yearsLeft} left.` +
    (next ? ` After ${planet} comes ${next}.` : '');
  return { fraction, yearsIn, yearsLeft, total, spoken };
}

const NUMBER_WORDS: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen',
};

/**
 * The Time Lord texts open with "A decade ruled by ...", but the periods run 7 to 13 years. This names the
 * real length, taken from the start and end years the server sends. Any other opening is left alone.
 */
export function periodQuote(quote: string, startYear: number, endYear: number): string {
  const years = endYear - startYear;
  if (!/^A decade ruled by/.test(quote) || years <= 0) return quote;
  if (years === 10) return quote;
  const word = NUMBER_WORDS[years] ?? String(years);
  return quote.replace(/^A decade ruled by/, `A ${word}-year period ruled by`);
}
