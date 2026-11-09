/**
 * The Rave Mandala: where each gate sits on the ecliptic, and how a longitude becomes a gate and
 * a line.
 *
 * Kept apart from human_design.ts, which reaches the ephemeris through ./astrology and so pulls
 * in a native binary the moment it is imported. None of what follows needs one — it is division
 * and a lookup table — and separating it means anything that only wants to know which gate a
 * longitude falls in can ask without loading swisseph. human_design.ts imports from here and
 * re-exports, so every existing import keeps working.
 */

// 64 gates in the order they appear around the wheel starting at 0° Aquarius
// (300° tropical longitude), progressing in the direction of increasing longitude.
// Source: Jovian Archive Rave Mandala mapping.
export const GATE_SEQUENCE: readonly number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42,  3,
  27, 24,  2, 23,  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33,  7,  4, 29, 59, 40, 64, 47,  6, 46, 18, 48, 57, 32, 50,
  28, 44,  1, 43, 14, 34,  9,  5, 26, 11, 10, 58, 38, 54, 61, 60,
] as const;

/** Starting longitude of gate 41 — 2°00' Aquarius (302° tropical) — canonical Rave Mandala start point. */
export const MANDALA_START_LON = 302.0;

/** Degrees per gate segment */
export const DEGREES_PER_GATE = 360 / 64; // 5.625°

/** Degrees per gate line */
export const DEGREES_PER_LINE = DEGREES_PER_GATE / 6; // 0.9375°

/**
 * Convert an ecliptic longitude to a Human Design gate number and line.
 *
 * Formula (per spec):
 *   adjusted  = (longitude − MANDALA_START_LON + 360) mod 360
 *   gateIndex = floor(adjusted / 5.625)
 *   gate      = GATE_SEQUENCE[gateIndex]
 *   line      = floor((adjusted mod 5.625) / 0.9375) + 1
 */
export function longitudeToGate(longitude: number): { gate: number; line: number } {
  const adjusted = ((longitude - MANDALA_START_LON) % 360 + 360) % 360;
  const gateIndex = Math.floor(adjusted / DEGREES_PER_GATE);
  const gate = GATE_SEQUENCE[Math.min(gateIndex, 63)]!;
  const posInGate = adjusted - gateIndex * DEGREES_PER_GATE;
  const line = Math.min(Math.floor(posInGate / DEGREES_PER_LINE) + 1, 6);
  return { gate, line };
}

/**
 * True when a longitude sits within `within` degrees of a gate boundary.
 *
 * Superseded for anything to do with a missing birth time by src/lib/app/timeCertainty.ts, which
 * asks the question properly: how far can this particular body drift, against a gate and against
 * a line. A flat degree is too wide for Saturn and far too narrow for the Moon. This remains for
 * the first-launch preview, which has one gate to talk about and no chart to be careful with.
 */
export function isNearGateEdge(longitude: number, within = 1): boolean {
  const adjusted = ((longitude - MANDALA_START_LON) % 360 + 360) % 360;
  const pos = adjusted % DEGREES_PER_GATE;
  return pos < within || pos > DEGREES_PER_GATE - within;
}
