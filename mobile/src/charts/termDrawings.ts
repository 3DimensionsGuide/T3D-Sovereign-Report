/**
 * Small drawings for the glossary's concept terms. Each one is a Scene (pure data) that SceneView draws,
 * the same way the wheel and bodygraph are drawn. Every drawing also carries words, so nothing depends
 * on colour alone, and a spoken description for screen readers.
 */
import { chartColors as c } from './palette';
import type { Prim, Scene } from './scene';
import { moonShape } from '../lib/moonShape';
import { bodyMap, centerPoints } from '../lib/centerShape';

export interface TermDrawing {
  scene: Scene;
  label: string;
}

const W = 320;
const H = 150;
const LINE = 'rgba(245,245,243,0.55)';
const FAINT = 'rgba(245,245,243,0.22)';

const r2 = (n: number): number => Math.round(n * 100) / 100;

function text(x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; bold?: boolean; symbol?: boolean } = {}): Prim {
  return { k: 'text', x, y, s, size: o.size ?? 12, fill: o.fill ?? c.muted, anchor: o.anchor ?? 'middle', font: o.symbol ? 'symbol' : o.bold ? 'bold' : 'body' };
}

function line(x1: number, y1: number, x2: number, y2: number, stroke = LINE, w = 1.5, dash?: string): Prim {
  return { k: 'line', x1, y1, x2, y2, stroke, w, dash };
}

function dot(cx: number, cy: number, r: number, fill: string, stroke?: string, w = 1.5): Prim {
  return { k: 'circle', cx, cy, r, fill, stroke, w };
}

function ring(cx: number, cy: number, r: number, stroke = LINE, w = 1.5): Prim {
  return { k: 'circle', cx, cy, r, stroke, w };
}

/** A line with an arrow head at its end. */
function arrow(x1: number, y1: number, x2: number, y2: number, stroke: string, w = 2): Prim[] {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 7;
  const p = (da: number) => `${r2(x2 - h * Math.cos(a + da))} ${r2(y2 - h * Math.sin(a + da))}`;
  return [
    line(x1, y1, x2, y2, stroke, w),
    { k: 'path', d: `M ${p(0.5)} L ${r2(x2)} ${r2(y2)} L ${p(-0.5)}`, stroke, w },
  ];
}

function rect(x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number; dash?: string; op?: number } = {}): Prim {
  return { k: 'path', d: `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`, fill: o.fill, stroke: o.stroke, w: o.sw, dash: o.dash, op: o.op };
}

/** A smooth curve through the given points (Catmull-Rom turned into Béziers). */
function smooth(pts: ReadonlyArray<readonly [number, number]>): string {
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r2(c1[0]!)} ${r2(c1[1]!)} ${r2(c2[0]!)} ${r2(c2[1]!)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function polyPath(points: string, dx: number, dy: number): string {
  const pts = points.split(' ').map((p) => p.split(',').map(Number) as [number, number]);
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${r2(x + dx)} ${r2(y + dy)}`).join(' ') + ' Z';
}

const scene = (prims: Prim[]): Scene => ({ w: W, h: H, prims });

/* ───────────────────────── Astrology ───────────────────────── */

function wheelBase(cx: number, cy: number, r: number): Prim[] {
  return [ring(cx, cy, r, LINE)];
}

function ascendant(): TermDrawing {
  const cx = 160; const cy = 78; const r = 56;
  return {
    scene: scene([
      ...wheelBase(cx, cy, r),
      line(cx - r - 22, cy, cx + r + 22, cy, LINE, 1.5, '4 4'),
      line(cx - r, cy, cx, cy, c.stoplight, 3),
      dot(cx - r, cy, 7, c.stoplight),
      text(cx - r - 14, cy - 14, 'Ascendant', { size: 13, fill: c.parchment, anchor: 'end', bold: true }),
      text(cx - r - 26, cy + 14, 'East', { anchor: 'end', size: 11 }),
      text(cx + r + 26, cy + 14, 'West', { anchor: 'start', size: 11 }),
      text(cx, cy - 22, 'Above the horizon', { size: 11 }),
      text(cx, cy + 32, 'Below the horizon', { size: 11 }),
      text(160, 142, 'The sign rising on the eastern horizon', { size: 11 }),
    ]),
    label: 'A birth wheel with a horizon line. The Ascendant is the point on the left, where the eastern horizon meets the wheel.',
  };
}

function midheaven(): TermDrawing {
  const cx = 160; const cy = 80; const r = 48;
  return {
    scene: scene([
      ...wheelBase(cx, cy, r),
      line(cx, cy - r - 8, cx, cy + r + 8, LINE, 1.5, '4 4'),
      line(cx, cy, cx, cy - r, c.stoplight, 3),
      dot(cx, cy - r, 7, c.stoplight),
      text(cx + 14, cy - r - 2, 'Midheaven', { size: 13, fill: c.parchment, anchor: 'start', bold: true }),
      text(cx - 14, cy - r - 2, 'Highest', { size: 11, anchor: 'end' }),
      text(160, 144, 'The highest point of the sky at your birth', { size: 11 }),
    ]),
    label: 'A birth wheel with a vertical line. The Midheaven is the point at the very top, the highest point of the sky.',
  };
}

function retrograde(): TermDrawing {
  const d = 'M 28 104 L 118 104 C 152 104 168 72 152 58 C 138 46 116 62 128 80 C 138 94 172 104 204 104 L 288 104';
  return {
    scene: scene([
      { k: 'path', d, stroke: c.stoplight, w: 3 },
      ...arrow(270, 104, 292, 104, c.stoplight, 3),
      dot(28, 104, 5, c.parchment),
      text(28, 124, 'Start', { size: 11, anchor: 'start' }),
      text(196, 40, '℞', { size: 24, fill: c.stoplight, anchor: 'start', symbol: true }),
      text(224, 42, 'Retrograde', { size: 13, fill: c.parchment, anchor: 'start', bold: true }),
      text(160, 142, 'Seems to move backward, then forward again', { size: 11 }),
    ]),
    label: 'A planet\'s path drawn left to right. In the middle it loops back on itself, which is the retrograde, then carries on forward.',
  };
}

function orb(): TermDrawing {
  const prims: Prim[] = [
    rect(110, 62, 100, 44, { fill: c.stoplight, op: 0.16 }),
    rect(110, 62, 100, 44, { stroke: c.stoplight, sw: 1, dash: '4 4' }),
    line(28, 84, 292, 84, LINE, 1.5),
  ];
  for (let x = 30; x <= 290; x += 20) prims.push(line(x, 80, x, 88, FAINT, 1));
  prims.push(
    line(160, 54, 160, 114, c.stoplight, 3),
    text(160, 42, 'Exact', { size: 13, fill: c.parchment, bold: true }),
    dot(194, 84, 8, c.parchment),
    text(194, 99, 'Planet', { size: 10 }),
    line(160, 122, 194, 122, c.parchment, 1.5),
    line(160, 118, 160, 126, c.parchment, 1.5),
    line(194, 118, 194, 126, c.parchment, 1.5),
    text(177, 138, 'Orb: 3° from exact', { size: 12, fill: c.parchment }),
    text(30, 48, 'Dashed: still counts', { size: 10, anchor: 'start' }),
  );
  return { scene: scene(prims), label: 'A line of degrees with a shaded zone around an exact point. A planet sits three degrees from exact, and that distance is the orb.' };
}

function approach(applying: boolean): TermDrawing {
  const slowX = applying ? 210 : 110;
  const fastX = applying ? 100 : 200;
  const arrowEnd = applying ? 168 : 290;
  const arrowStart = applying ? fastX + 12 : fastX + 12;
  return {
    scene: scene([
      line(30, 86, 300, 86, FAINT, 1.5, '4 4'),
      dot(slowX, 86, 11, c.stoplight),
      text(slowX, 60, 'Slower planet', { size: 11, fill: c.parchment }),
      dot(fastX, 86, 8, c.parchment),
      text(fastX, 60, 'Faster planet', { size: 11, fill: c.parchment }),
      ...arrow(arrowStart, 112, arrowEnd, 112, c.parchment, 2.5),
      text(160, 24, applying ? 'Applying' : 'Separating', { size: 16, fill: c.parchment, bold: true }),
      text(160, 142, applying ? 'Closing in on the exact moment' : 'Already past exact, moving apart', { size: 11 }),
    ]),
    label: applying
      ? 'A faster planet to the left of a slower planet, moving toward it. The contact has not yet reached exact.'
      : 'A faster planet to the right of a slower planet, moving away from it. The contact has already passed exact.',
  };
}

function transit(): TermDrawing {
  const cx = 92; const cy = 76;
  const ang = (-50 * Math.PI) / 180;
  const nang = (-160 * Math.PI) / 180;
  const tx = cx + 58 * Math.cos(ang); const ty = cy + 58 * Math.sin(ang);
  const nx = cx + 30 * Math.cos(nang); const ny = cy + 30 * Math.sin(nang);
  return {
    scene: scene([
      ring(cx, cy, 58, c.stoplight, 1.5),
      ring(cx, cy, 36, LINE, 1.5),
      line(tx, ty, nx, ny, c.parchment, 1.5, '4 3'),
      dot(nx, ny, 6, c.parchment),
      dot(tx, ty, 7, c.stoplight),
      ...arrow(tx + 4, ty + 16, tx + 14, ty + 34, c.stoplight, 2),
      dot(176, 52, 6, c.parchment),
      text(190, 52, 'Your birth chart', { anchor: 'start', size: 13, fill: c.parchment }),
      text(190, 68, 'where planets were', { anchor: 'start', size: 11 }),
      dot(176, 100, 7, c.stoplight),
      text(190, 100, 'A transit', { anchor: 'start', size: 13, fill: c.parchment }),
      text(190, 116, 'a planet moving now', { anchor: 'start', size: 11 }),
    ]),
    label: 'A small birth chart inside a larger ring. A planet moving on the outer ring forms a line to a point in the birth chart. That moving planet is a transit.',
  };
}

function phase(): TermDrawing {
  const prims: Prim[] = [];
  const stops: ReadonlyArray<readonly [number, boolean]> = [[0, true], [25, true], [50, true], [75, true], [100, true], [75, false], [50, false], [25, false]];
  const names = ['New', '', '1st quarter', '', 'Full', '', 'Last quarter', ''];
  stops.forEach(([pct, waxing], i) => {
    const cx = 30 + i * 37.1;
    const cy = 72;
    prims.push(dot(cx, cy, 15, '#1B1B20', LINE, 1.2));
    const m = moonShape(pct, waxing, 15, cx, cy);
    if (m.kind === 'full') prims.push(dot(cx, cy, 15, c.parchment));
    else if (m.kind === 'path') prims.push({ k: 'path', d: m.d, fill: c.parchment });
    if (names[i]) prims.push(text(cx, 104, names[i]!, { size: 11, fill: c.parchment }));
  });
  prims.push(
    line(30, 30, 140, 30, LINE, 1.2),
    text(85, 16, 'Growing (waxing)', { size: 11 }),
    line(179, 30, 289, 30, LINE, 1.2),
    text(234, 16, 'Shrinking (waning)', { size: 11 }),
    text(160, 134, 'About 29.5 days from one New Moon to the next', { size: 11 }),
  );
  return { scene: scene(prims), label: 'The eight Moon shapes in a row: New, growing crescent, first quarter, growing gibbous, Full, shrinking gibbous, last quarter, shrinking crescent.' };
}

function eclipse(): TermDrawing {
  return {
    scene: scene([
      line(52, 74, 270, 74, FAINT, 1, '4 4'),
      dot(52, 74, 28, c.gold),
      text(52, 116, 'Sun', { size: 12, fill: c.parchment }),
      { k: 'path', d: 'M 165 66 L 266 69 L 266 79 L 165 82 Z', fill: c.stoplight, op: 0.3 },
      dot(165, 74, 9, c.muted),
      text(165, 100, 'Moon', { size: 12, fill: c.parchment }),
      dot(270, 74, 15, '#1B1B20', c.parchment, 2),
      text(270, 116, 'Earth', { size: 12, fill: c.parchment }),
      text(218, 54, 'Shadow', { size: 11, fill: c.stoplight }),
      text(160, 140, 'An eclipse: Sun, Moon and Earth line up', { size: 11 }),
    ]),
    label: 'The Sun on the left, the Moon in the middle and the Earth on the right in one line. The Moon casts a shadow toward the Earth, which is a solar eclipse.',
  };
}

function ingress(): TermDrawing {
  return {
    scene: scene([
      rect(36, 62, 124, 44, { fill: c.stoplight, op: 0.1 }),
      rect(36, 62, 124, 44, { stroke: LINE, sw: 1.2 }),
      rect(160, 62, 124, 44, { fill: c.purple, op: 0.8 }),
      rect(160, 62, 124, 44, { stroke: LINE, sw: 1.2 }),
      text(98, 84, 'Old sign', { size: 14, fill: c.parchment }),
      text(222, 84, 'Next sign', { size: 14, fill: c.parchment }),
      line(160, 52, 160, 116, c.stoplight, 3),
      dot(160, 34, 8, c.stoplight),
      ...arrow(128, 34, 146, 34, c.parchment, 2),
      ...arrow(174, 34, 192, 34, c.parchment, 2),
      text(160, 134, 'Ingress: the moment a planet crosses the line', { size: 11 }),
    ]),
    label: 'Two neighbouring signs side by side with a line between them. A planet sits on the line, moving from the old sign into the next one. That crossing is an ingress.',
  };
}

function season(): TermDrawing {
  const pts: ReadonlyArray<readonly [number, number]> = [[28, 44], [104, 84], [150, 118], [190, 84], [230, 50], [268, 84], [294, 104]];
  const passes: ReadonlyArray<readonly [number, string]> = [[104, '1st pass'], [190, '2nd pass'], [268, '3rd pass']];
  const prims: Prim[] = [
    rect(28, 66, 266, 36, { fill: c.stoplight, op: 0.12 }),
    line(28, 84, 294, 84, LINE, 1.2, '4 4'),
    { k: 'path', d: smooth(pts), stroke: c.stoplight, w: 3 },
  ];
  for (const [x, name] of passes) {
    prims.push(dot(x, 84, 6, c.parchment, c.stoplight, 2), line(x, 92, x, 124, FAINT, 1, '3 3'), text(x, 134, name, { size: 11, fill: c.parchment }));
  }
  prims.push(
    text(160, 14, 'A slow planet can touch the same point three times', { size: 11 }),
    text(32, 97, 'Orb zone', { size: 10, anchor: 'start' }),
  );
  return { scene: scene(prims), label: 'A slow planet\'s distance from one point over time. It crosses the exact line three times: forward, back again while retrograde, and forward for good. Together they make one season.' };
}

/* ───────────────────────── Human Design ───────────────────────── */

function centerShapeDrawing(defined: boolean): TermDrawing {
  const pts = centerPoints('g_center', 86, 3)!;
  const d = polyPath(pts, 46, 32);
  return {
    scene: scene([
      defined
        ? { k: 'path', d, fill: c.vehicle, stroke: c.vehicle, w: 2 }
        : { k: 'path', d, stroke: c.vehicle, w: 2.5, dash: '6 5' },
      text(150, 56, defined ? 'Defined' : 'Open', { size: 20, fill: c.parchment, anchor: 'start', bold: true }),
      text(150, 80, defined ? 'Colored in on the chart' : 'White on the chart', { size: 12, anchor: 'start' }),
      text(150, 98, defined ? 'Steady and consistent' : 'Takes in and amplifies', { size: 12, anchor: 'start' }),
      text(150, 116, defined ? 'Always on' : 'Changes with company', { size: 12, anchor: 'start' }),
    ]),
    label: defined
      ? 'A Center drawn as a filled amber diamond, next to the words Defined, colored in on the chart, steady and consistent.'
      : 'A Center drawn as an empty dashed outline, next to the words Open, white on the chart, takes in and amplifies.',
  };
}

function channelDrawing(full: boolean): TermDrawing {
  const prims: Prim[] = [
    rect(36, 52, 52, 52, { fill: c.vehicle, stroke: c.vehicle, sw: 2 }),
    full
      ? rect(232, 52, 52, 52, { fill: c.vehicle, stroke: c.vehicle, sw: 2 })
      : rect(232, 52, 52, 52, { stroke: c.vehicle, sw: 2.5, dash: '6 5' }),
    text(62, 40, 'Center', { size: 11 }),
    text(258, 40, 'Center', { size: 11 }),
  ];
  if (full) {
    prims.push(
      line(88, 78, 232, 78, c.vehicle, 5),
      dot(88, 78, 7, c.parchment, c.vehicle, 2),
      dot(232, 78, 7, c.parchment, c.vehicle, 2),
      text(88, 118, 'Gate', { size: 12, fill: c.parchment }),
      text(232, 118, 'Gate', { size: 12, fill: c.parchment }),
      text(160, 62, 'Channel', { size: 14, fill: c.parchment, bold: true }),
      text(160, 142, 'Two gates joined make a channel', { size: 11 }),
    );
  } else {
    prims.push(
      line(88, 78, 160, 78, c.vehicle, 5),
      line(160, 78, 232, 78, FAINT, 2, '5 5'),
      dot(88, 78, 7, c.parchment, c.vehicle, 2),
      dot(232, 78, 7, '#1B1B20', LINE, 2),
      text(88, 118, 'Your gate', { size: 12, fill: c.parchment }),
      text(232, 116, 'Partner gate', { size: 12, anchor: 'middle' }),
      text(232, 127, 'not in your chart', { size: 10 }),
      text(160, 62, 'Hanging gate', { size: 14, fill: c.parchment, bold: true }),
      text(160, 144, 'Half a channel, waiting for its partner', { size: 11 }),
    );
  }
  return {
    scene: scene(prims),
    label: full
      ? 'Two Centers joined by a solid amber line with a gate at each end. Two gates that connect make a channel.'
      : 'Two Centers. A solid amber line runs from your gate toward the partner gate but stops halfway. A gate with no partner is a hanging gate.',
  };
}

function lineDrawing(): TermDrawing {
  const prims: Prim[] = [];
  const solid = [true, false, true, true, false, true]; // top (line 6) to bottom (line 1)
  solid.forEach((isSolid, i) => {
    const y = 28 + i * 18;
    const n = 6 - i;
    if (isSolid) prims.push(line(130, y, 194, y, c.vehicle, 6));
    else prims.push(line(130, y, 154, y, c.vehicle, 6), line(170, y, 194, y, c.vehicle, 6));
    prims.push(text(116, y, `Line ${n}`, { size: 12, fill: c.parchment, anchor: 'end' }));
  });
  prims.push(
    text(212, 66, 'Six lines', { size: 14, fill: c.parchment, anchor: 'start', bold: true }),
    text(212, 84, 'stacked make', { size: 12, anchor: 'start' }),
    text(212, 100, 'one gate', { size: 12, anchor: 'start' }),
  );
  return { scene: scene(prims), label: 'Six horizontal bars stacked, numbered Line 6 at the top to Line 1 at the bottom. Together the six lines make one gate.' };
}

function profileDrawing(): TermDrawing {
  return {
    scene: scene([
      text(160, 16, 'Example: a 3/5 profile', { size: 12 }),
      dot(86, 66, 30, '#1B1B20', c.personality, 2.5),
      text(86, 66, '3', { size: 28, fill: c.parchment, bold: true }),
      text(160, 66, '/', { size: 44, fill: c.muted }),
      dot(234, 66, 30, '#1B1B20', c.design, 2.5),
      text(234, 66, '5', { size: 28, fill: c.parchment, bold: true }),
      text(86, 112, 'Conscious', { size: 12, fill: c.parchment, bold: true }),
      text(86, 128, 'Personality line', { size: 11 }),
      text(234, 112, 'Unconscious', { size: 12, fill: c.parchment, bold: true }),
      text(234, 128, 'Design line', { size: 11 }),
    ]),
    label: 'Two circles with a slash between them showing a 3 over 5 example. The first number is the conscious Personality line and the second is the unconscious Design line.',
  };
}

function bodygraphDrawing(): TermDrawing {
  const on = new Set(['throat', 'g_center', 'sacral']);
  const prims: Prim[] = [];
  for (const s of bodyMap('', 100, 138, 2)) {
    const d = polyPath(s.points, 28, 6);
    prims.push(on.has(s.id)
      ? { k: 'path', d, fill: c.vehicle, stroke: c.vehicle, w: 1.5 }
      : { k: 'path', d, stroke: LINE, w: 1.5 });
  }
  prims.push(
    text(170, 44, 'Nine Centers', { size: 17, fill: c.parchment, anchor: 'start', bold: true }),
    text(170, 70, 'Colored: defined', { size: 12, anchor: 'start' }),
    text(170, 88, 'White: open', { size: 12, anchor: 'start' }),
    text(170, 106, 'Lines between them:', { size: 12, anchor: 'start' }),
    text(170, 122, 'channels', { size: 12, anchor: 'start' }),
  );
  return { scene: scene(prims), label: 'The nine Centers drawn in their body positions. Colored ones are defined and outlined ones are open. Channels are the lines that join them.' };
}

/* ───────────────────────── Numerology ───────────────────────── */

function pinnacle(): TermDrawing {
  const peaks: ReadonlyArray<readonly [number, number]> = [[60, 76], [125, 54], [190, 86], [255, 44]];
  const base = 118;
  const prims: Prim[] = [
    { k: 'path', d: `M 20 ${base} L 60 76 L 92 ${base} L 125 54 L 158 ${base} L 190 86 L 222 ${base} L 255 44 L 300 ${base} Z`, fill: c.road, op: 0.16 },
    { k: 'path', d: `M 20 ${base} L 60 76 L 92 ${base} L 125 54 L 158 ${base} L 190 86 L 222 ${base} L 255 44 L 300 ${base}`, stroke: c.road, w: 2.5 },
  ];
  peaks.forEach(([x, y], i) => {
    prims.push(dot(x, y, 5, c.parchment), text(x, y - 14, String(i + 1), { size: 15, fill: c.parchment, bold: true }));
  });
  prims.push(
    line(20, base + 6, 300, base + 6, FAINT, 1),
    text(20, 136, 'Birth', { size: 11, anchor: 'start' }),
    text(300, 136, 'Later life', { size: 11, anchor: 'end' }),
    text(160, 136, 'Four peaks, one for each phase', { size: 11 }),
  );
  return { scene: scene(prims), label: 'Four mountain peaks in a row, numbered 1 to 4, along a line that runs from birth to later life. Each peak is one Pinnacle.' };
}

function challenge(): TermDrawing {
  const prims: Prim[] = [];
  const ord = ['1st', '2nd', '3rd', '4th'];
  for (let i = 0; i < 4; i++) {
    const x = 38 + i * 68;
    prims.push(rect(x, 44, 44, 44, { fill: c.road, op: 0.12 }), rect(x, 44, 44, 44, { stroke: c.road, sw: 2.5 }), text(x + 22, 66, ord[i]!, { size: 14, fill: c.parchment, bold: true }));
  }
  prims.push(
    line(38, 100, 282, 100, FAINT, 1),
    text(160, 24, 'Four Challenges', { size: 15, fill: c.parchment, bold: true }),
    text(160, 122, 'Lessons to work through,', { size: 11 }),
    text(160, 138, 'one in each phase of life', { size: 11 }),
  );
  return { scene: scene(prims), label: 'Four squares in a row labelled 1st to 4th. Each square is one Challenge, a lesson to work through in that phase of life.' };
}

function master(): TermDrawing {
  const prims: Prim[] = [];
  const nums: ReadonlyArray<readonly [string, string]> = [['11', 'not 2'], ['22', 'not 4'], ['33', 'not 6']];
  nums.forEach(([n, not], i) => {
    const x = 62 + i * 98;
    prims.push(dot(x, 64, 30, '#1B1B20', c.road, 2.5), text(x, 64, n, { size: 26, fill: c.parchment, bold: true }), text(x, 108, `kept whole,`, { size: 11 }), text(x, 122, not, { size: 11, fill: c.parchment }));
  });
  prims.push(text(160, 16, 'Master numbers', { size: 14, fill: c.parchment, bold: true }));
  return { scene: scene(prims), label: 'Three circles holding 11, 22 and 33. Each is kept whole instead of being reduced to a single digit.' };
}

/* ───────────────────────── Lookup ───────────────────────── */

const BUILDERS: Record<string, () => TermDrawing> = {
  'astro:ascendant': ascendant,
  'astro:midheaven': midheaven,
  'astro:retrograde': retrograde,
  'astro:orb': orb,
  'astro:applying': () => approach(true),
  'astro:separating': () => approach(false),
  'astro:transit': transit,
  'astro:phase': phase,
  'astro:eclipse': eclipse,
  'astro:ingress': ingress,
  'astro:season': season,
  'hd:defined': () => centerShapeDrawing(true),
  'hd:open': () => centerShapeDrawing(false),
  'hd:hanging': () => channelDrawing(false),
  'hd:channel': () => channelDrawing(true),
  'hd:line': lineDrawing,
  'hd:profile': profileDrawing,
  'hd:bodygraph': bodygraphDrawing,
  'num:pinnacle': pinnacle,
  'num:challenge': challenge,
  'num:master': master,
};

export const DRAWN_TERM_IDS: readonly string[] = Object.keys(BUILDERS);

/** The drawing for a glossary term, or null when that term has none. */
export function termDrawing(id: string): TermDrawing | null {
  const build = BUILDERS[id];
  return build ? build() : null;
}
