/** Minimum age to use T3D (US children's privacy law, COPPA). */
export const MINIMUM_AGE = 13;

export const UNDER_AGE_MESSAGE =
  'T3D is for people 13 and older, so we can’t create a profile for this birth date.';

/** True when a YYYY-MM-DD birth date is less than MINIMUM_AGE years before `now`. */
export function isUnderMinimumAge(birthDate: string, now: Date = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const cutoff = new Date(now.getFullYear() - MINIMUM_AGE, now.getMonth(), now.getDate());
  return new Date(y, mo - 1, d) > cutoff;
}
