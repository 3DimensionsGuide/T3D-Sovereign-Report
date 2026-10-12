import { CENTER_SHAPES, type CenterId } from '../charts/bodygraphLayout';

/**
 * The points of one Center's own bodygraph shape (Head triangle, G diamond, Sacral square and so on),
 * scaled to fill a square of the given size with the same proportions it has on the bodygraph.
 * Returns null for an id that is not one of the nine Centers.
 */
export function centerPoints(id: string, size = 24, pad = 2): string | null {
  const shape = CENTER_SHAPES.find((s) => s.id === (id as CenterId));
  if (!shape) return null;
  const xs = shape.polygon.map((p) => p[0]);
  const ys = shape.polygon.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const inner = size - pad * 2;
  const scale = inner / Math.max(w, h);
  const offX = pad + (inner - w * scale) / 2;
  const offY = pad + (inner - h * scale) / 2;
  const r = (n: number) => Math.round(n * 100) / 100;
  return shape.polygon.map(([x, y]) => `${r((x - minX) * scale + offX)},${r((y - minY) * scale + offY)}`).join(' ');
}
