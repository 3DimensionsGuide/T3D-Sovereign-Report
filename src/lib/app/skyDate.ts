/**
 * Reads the optional "look at another day" instant the app sends to the
 * sky routes. Returns the current time when none is sent, and null when the
 * value is not a real date inside the range the ephemeris covers well.
 */

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function parseSkyInstant(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return new Date();
  if (typeof value !== 'string' || value.length > 40) return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR ? date : null;
}
