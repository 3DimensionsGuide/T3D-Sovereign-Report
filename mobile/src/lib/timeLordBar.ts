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
