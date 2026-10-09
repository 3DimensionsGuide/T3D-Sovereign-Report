/** Small shared helpers for the golden tests. */

/** Julian Day for a UTC instant, computed independently of the engine. */
export function jdFromDate(d: Date): number {
  return d.getTime() / 86_400_000 + 2_440_587.5;
}

/** Smallest signed difference between two angles, in degrees. */
export function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

/** Format a longitude as e.g. "14°32' Scorpio". */
export function formatLongitude(lon: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const norm = ((lon % 360) + 360) % 360;
  const sign = Math.floor(norm / 30);
  const within = norm - sign * 30;
  const deg = Math.floor(within);
  const min = Math.floor((within - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}' ${signs[sign]}`;
}
