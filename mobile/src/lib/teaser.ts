/**
 * Shortens text for a collapsed card without cutting a word in half. Short text is returned as it is.
 * The cut falls on the last space before `max` characters, and a trailing comma, dash or full stop
 * is dropped before the ellipsis.
 */
export function teaser(text: string, max = 96): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = clean[max] === ' ' ? max : cut.lastIndexOf(' ');
  const head = (space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,;:\-–—.]+$/, '');
  return `${head}…`;
}

/** "Sep 30, 2026 to Sep 29, 2027": a date range that spans months always shows its years. */
export function yearRangeLabel(
  startIso: string,
  endIso: string,
  format: (d: Date, withYear: boolean) => string,
): string {
  const parse = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
  };
  const a = parse(startIso);
  const b = parse(endIso);
  const days = Math.abs(b.getTime() - a.getTime()) / 86_400_000;
  const withYear = days > 60 || a.getFullYear() !== b.getFullYear();
  return `${format(a, withYear)} to ${format(b, withYear)}`;
}
