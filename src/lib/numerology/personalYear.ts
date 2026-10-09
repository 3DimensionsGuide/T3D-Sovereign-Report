/**
 * Personal Year, in one place so the app and the PDF report always agree.
 *
 * Rule (from the T3D knowledge base):
 *  - Reduce the birth month, the birth day and the Universal Year separately,
 *    keeping the master numbers 11, 22 and 33 at each step.
 *  - Add the three and reduce, keeping 11, 22 and 33 in the final result.
 *  - A Personal Year runs from birthday to birthday. Before this year's
 *    birthday you are still in the cycle that began on last year's birthday.
 *
 * Dates are YYYY-MM-DD.
 */

function digitSum(n: number): number {
  return String(Math.abs(n)).split('').reduce((a, b) => a + Number(b), 0);
}

export function reduceKeepMasters(n: number): number {
  let v = n;
  while (v > 9 && v !== 11 && v !== 22 && v !== 33) v = digitSum(v);
  return v;
}

/** The calendar year the current Personal Year was built from. */
export function personalYearBase(birthDate: string, onDate: string): number {
  const [y, m, d] = onDate.split('-').map(Number) as [number, number, number];
  const [, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  return m < bm || (m === bm && d < bd) ? y - 1 : y;
}

export function personalYearNumber(birthDate: string, onDate: string): number {
  const [, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  const universal = reduceKeepMasters(digitSum(personalYearBase(birthDate, onDate)));
  return reduceKeepMasters(reduceKeepMasters(bm) + reduceKeepMasters(bd) + universal);
}

/** Completed age on a date (not just the difference in calendar years). */
export function ageOn(birthDate: string, onDate: string): number {
  const [by] = birthDate.split('-').map(Number) as [number];
  return personalYearBase(birthDate, onDate) - by;
}

/** Today as YYYY-MM-DD in UTC. */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
