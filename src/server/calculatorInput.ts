/**
 * What a calculation request has to contain before anything is computed or written.
 *
 * Kept out of the route so it can be tested on its own, which matters most for the email rule.
 * That rule is the only thing standing between the website calculator and a lead nobody can be
 * reached at: the app may omit an address because it attaches one afterwards through
 * POST /api/app/email, and every other caller may not. A form that quietly stops sending its
 * email field has to fail here rather than succeed.
 */

import type { T3DCalculatorInput } from '@/server/engines/types';
import { isUnderMinimumAge, UNDER_AGE_MESSAGE } from '@/lib/ageGate';

/** The problem with the request, in the words sent back to the caller, or null if there is none. */
export function validateInput(body: Partial<T3DCalculatorInput>): string | null {
  if (!body.firstName?.trim())  return 'firstName is required';
  if (!body.lastName?.trim())   return 'lastName is required';

  // An address given has to be a real one whoever is asking. An address left out is allowed only
  // for a caller that says one is coming later under a session token — the app, which shows the
  // chart first. The website calculator sends no such flag.
  const given = body.email?.trim();
  if (given) {
    if (!given.includes('@')) return 'A valid email is required';
  } else if (body.emailLater !== true) {
    return 'A valid email is required';
  }

  // Bounded rather than rejected: a source is never worth failing a calculation over, so the
  // route trims it instead. These limits only stop something absurd reaching the column.
  if (body.source && body.source.length > 120) return 'source is too long';
  if (body.sourceDetail && body.sourceDetail.length > 200) return 'sourceDetail is too long';

  if (!body.birthDate?.match(/^\d{4}-\d{2}-\d{2}$/))
    return 'birthDate must be in YYYY-MM-DD format';
  if (isUnderMinimumAge(body.birthDate)) return UNDER_AGE_MESSAGE;
  if (!body.birthPlace?.city?.trim())    return 'birthPlace.city is required';
  if (!body.birthPlace?.country?.trim()) return 'birthPlace.country is required';
  return null;
}
