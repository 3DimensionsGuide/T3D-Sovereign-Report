/**
 * The geometry behind each number: 1 is a single point, 2 two overlapping circles, and 3 to 9 a regular
 * shape with that many sides. The master numbers 11, 22 and 33 draw the shape of 2, 4 and 6 inside a
 * second ring. Pure, with no imports, so tests can use it directly.
 */
export type SigilShape =
  | { kind: 'point'; master: false }
  | { kind: 'vesica'; master: boolean }
  | { kind: 'polygon'; sides: number; master: boolean };

const MASTER_BASE: Record<number, number> = { 11: 2, 22: 4, 33: 6 };

/** The number a label starts with ("5", "11/2"), or null when there is none. */
export function sigilNumber(text: string): number | null {
  const m = text.trim().match(/^\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return n >= 1 && (n <= 9 || n in MASTER_BASE) ? n : null;
}

export function sigilShape(n: number): SigilShape | null {
  const master = n in MASTER_BASE;
  const base = master ? MASTER_BASE[n] : n;
  if (!Number.isInteger(base) || base < 1 || base > 9) return null;
  if (base === 1) return { kind: 'point', master: false };
  if (base === 2) return { kind: 'vesica', master };
  return { kind: 'polygon', sides: base, master };
}

/** Corner points of a regular polygon with one corner straight up, as an SVG `points` string. */
export function polygonPoints(sides: number, cx: number, cy: number, r: number): string {
  const round = (v: number) => Math.round(v * 100) / 100;
  return Array.from({ length: sides }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / sides;
    return `${round(cx + r * Math.cos(a))},${round(cy + r * Math.sin(a))}`;
  }).join(' ');
}
