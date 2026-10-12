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

export interface BodyMapShape {
  id: string;
  points: string;
  active: boolean;
}

/**
 * All nine Centers drawn in their bodygraph positions inside a width x height box, with the one being
 * read marked active. Throat, Sacral and Root are all squares, so where a Center sits is what tells them
 * apart. The active one is listed last so it draws on top.
 */
export function bodyMap(activeId: string, width = 30, height = 46, pad = 1.5): BodyMapShape[] {
  const all = CENTER_SHAPES.flatMap((s) => s.polygon);
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const scale = Math.min((width - pad * 2) / (maxX - minX), (height - pad * 2) / (maxY - minY));
  const offX = (width - (maxX - minX) * scale) / 2;
  const offY = (height - (maxY - minY) * scale) / 2;
  const r = (n: number) => Math.round(n * 100) / 100;
  const shapes = CENTER_SHAPES.map((s) => ({
    id: s.id as string,
    points: s.polygon.map(([x, y]) => `${r((x - minX) * scale + offX)},${r((y - minY) * scale + offY)}`).join(' '),
    active: s.id === activeId,
  }));
  return [...shapes.filter((s) => !s.active), ...shapes.filter((s) => s.active)];
}
