/**
 * Which version of the calculation engines produced a stored chart.
 *
 * A chart is calculated once and kept. /api/calculate-t3d writes the three engines' output into
 * leads.results and nothing recomputes it afterwards — the Sovereign Report reads it straight back
 * out, months later. So when a formula is corrected, every chart written before the correction
 * stays wrong, and looks exactly like one written after it.
 *
 * That question came up three times in a single day: the daylight-saving fix (9674b11), the
 * geocoding fix (5a938a7), and the stale opt-in columns. Each time the answer to "which stored
 * charts predate this?" was the same — recompute all of them and compare, which is what the admin
 * route's ?scan=true mode exists to do. Recording the version instead turns that into a lookup.
 *
 * ─── Changing an engine ──────────────────────────────────────────────────────
 *
 * Bump ENGINE_VERSION whenever a change to one of ENGINE_SOURCES could produce a different number
 * for the same birth details. Then run the tests: tests/golden/engineVersion.test.ts recomputes the
 * fingerprint and tells you the value to paste below.
 *
 * A comment, a rename or a type-only edit cannot change a number, but it does change the
 * fingerprint. Update the fingerprint for those and leave the version alone — the test accepts
 * that, because the version is a claim about behaviour and only you can make it.
 *
 * One version covers all three engines rather than one each. A numerology change therefore marks
 * astrology results as unverified too, which is pessimistic but never wrong, and it keeps a single
 * number on the row instead of three that have to be reasoned about together.
 */

/**
 * Bumped by hand when a stored number could change. Dated, so the age of a chart's engine is
 * legible without looking anything up.
 */
export const ENGINE_VERSION = '2026.11.07';

/**
 * The files whose contents can change a stored chart.
 *
 * localInstant.ts is in the list because it decides which moment a birth time refers to, which is
 * upstream of every number the other three produce. types.ts is not: all three import it with
 * `import type`, so it is erased before anything runs and cannot alter a result.
 *
 * The other files under engines/ — dailySky, transits, timeline, chartData, dayNumerology — are
 * calculated fresh on every request and never stored, so they are not part of this.
 */
export const ENGINE_SOURCES: readonly string[] = [
  'src/server/engines/astrology.ts',
  'src/server/engines/human_design.ts',
  // The Rave Mandala — which gate a longitude falls in. It moved out of human_design.ts so that
  // wanting a gate number does not mean loading the ephemeris, and it is listed here in its own
  // right: a change to the gate ordering is as capable of changing a stored number as anything
  // else in this list.
  'src/server/engines/mandala.ts',
  'src/server/engines/numerology.ts',
  'src/server/localInstant.ts',
];

/**
 * The first sixteen characters of a SHA-256 over those files, recorded so the test can notice when
 * they change. Not a security measure — a tripwire, so an engine cannot be edited without somebody
 * deciding whether the version should move.
 */
export const ENGINE_FINGERPRINT = 'b400fb8cc940cac6';

/**
 * True when this chart was calculated by the engines running now.
 *
 * Null means it was written before versions were recorded, which is every chart made before
 * 2026-11-07. Those are not known to be wrong — only unverified.
 */
export function isCurrentEngine(storedVersion: string | null | undefined): boolean {
  return storedVersion === ENGINE_VERSION;
}
