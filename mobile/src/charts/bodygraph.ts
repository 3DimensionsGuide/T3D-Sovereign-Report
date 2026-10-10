import { BODYGRAPH_H, BODYGRAPH_W, CENTER_SHAPES, CURVED_CHANNELS, GATE_ANCHORS, type Pt } from './bodygraphLayout';
import { chartColors as c } from './palette';
import type { Prim, Scene } from './scene';
import type { BodygraphData, Epoch } from './chartTypes';

const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Offset a line sideways by `d` so two epochs can run side by side. */
function offsetLine(a: Pt, b: Pt, d: number): [Pt, Pt] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * d;
  const ny = (dx / len) * d;
  return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]];
}

function line(a: Pt, b: Pt, stroke: string, w: number, op?: number, dash?: string): Prim {
  return { k: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke, w, op, dash };
}

/**
 * Builds the bodygraph picture from the server's chart data.
 * Defined centers are solid amber; open centers are hollow. Active channels are
 * thick lines (light = Personality, red = Design, both = two parallel lines).
 * A gate that is active but whose partner gate is open is drawn as a short
 * "hanging gate" stub from its center toward the empty partner.
 */
export function buildBodygraphScene(data: BodygraphData): Scene {
  const prims: Prim[] = [];
  const defined = new Set(data.definedCenters);

  const gateEpochs = new Map<number, Set<Epoch>>();
  for (const g of data.gates) {
    if (!gateEpochs.has(g.gate)) gateEpochs.set(g.gate, new Set());
    gateEpochs.get(g.gate)!.add(g.epoch);
  }
  const activeChannelKeys = new Set(data.channels.map((ch) => key(ch.gates[0], ch.gates[1])));

  // 1. Every possible channel, faint, so the structure is visible.
  const allPairs = new Set<string>();
  for (const ch of data.channels) allPairs.add(key(ch.gates[0], ch.gates[1]));
  // Inactive channel slots are drawn from the known channel table below.
  for (const [a, b] of ALL_CHANNEL_PAIRS) allPairs.add(key(a, b));

  const pathFor = (a: number, b: number) => {
    const pa = GATE_ANCHORS[a];
    const pb = GATE_ANCHORS[b];
    const curve = CURVED_CHANNELS[key(a, b)];
    if (curve) {
      return { d: `M ${pa[0]} ${pa[1]} Q ${curve[0]} ${curve[1]} ${pb[0]} ${pb[1]}`, pa, pb, curve };
    }
    return { d: null, pa, pb, curve: null };
  };

  for (const k of allPairs) {
    if (activeChannelKeys.has(k)) continue;
    const [a, b] = k.split('-').map(Number);
    const geo = pathFor(a, b);
    if (geo.d) prims.push({ k: 'path', d: geo.d, stroke: c.parchment, w: 1.2, op: 0.16 });
    else prims.push(line(geo.pa, geo.pb, c.parchment, 1.2, 0.16));
    // Hanging gate: one end active, the other open — a short stub from the live end.
    for (const [live, other] of [[a, b], [b, a]] as const) {
      const eps = gateEpochs.get(live);
      if (!eps || gateEpochs.has(other)) continue;
      const from = GATE_ANCHORS[live];
      const to = GATE_ANCHORS[other];
      const stubEnd: Pt = [from[0] + (to[0] - from[0]) * 0.42, from[1] + (to[1] - from[1]) * 0.42];
      const col = eps.has('design') && !eps.has('personality') ? c.design : c.personality;
      prims.push(line(from, stubEnd, col, 2.6, 0.9, '3 3'));
    }
  }

  const afterStructure = prims.length;

  // 2. Active channels.
  for (const ch of data.channels) {
    const [a, b] = ch.gates;
    const geo = pathFor(a, b);
    const draw = (col: string, off: number, w: number) => {
      if (geo.d) {
        // Curved channels: draw the same curve, shifted by a small x/y offset.
        prims.push({ k: 'path', d: `M ${geo.pa[0] + off} ${geo.pa[1]} Q ${geo.curve![0] + off} ${geo.curve![1]} ${geo.pb[0] + off} ${geo.pb[1]}`, stroke: col, w });
      } else {
        const [p, q] = off === 0 ? [geo.pa, geo.pb] : offsetLine(geo.pa, geo.pb, off);
        prims.push(line(p, q, col, w));
      }
    };
    if (ch.activatedBy === 'both') {
      draw(c.personality, -2.4, 3.4);
      draw(c.design, 2.4, 3.4);
    } else if (ch.activatedBy === 'design') {
      draw(c.design, 0, 5);
    } else {
      draw(c.personality, 0, 5);
    }
  }

  const afterChannels = prims.length;

  // 3. Centers, drawn on top of the channel ends.
  for (const shape of CENTER_SHAPES) {
    const isDefined = defined.has(shape.id);
    const d = shape.polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
    prims.push({
      k: 'path',
      d,
      fill: isDefined ? c.vehicle : c.charcoal,
      stroke: isDefined ? c.vehicle : c.parchment,
      w: isDefined ? 1.5 : 1.6,
      op: isDefined ? 1 : 0.9,
      dash: isDefined ? undefined : '5 3',
    });
    prims.push({
      k: 'text',
      x: shape.labelAt[0],
      y: shape.labelAt[1],
      s: shape.label,
      size: shape.id === 'solar_plexus' ? 7 : 8,
      fill: isDefined ? c.obsidian : c.muted,
      font: 'bold',
    });
  }

  const afterCenters = prims.length;

  // 4. Gates: tiny dots for every gate, numbered discs for activated ones.
  for (let g = 1; g <= 64; g++) {
    const p = GATE_ANCHORS[g];
    const eps = gateEpochs.get(g);
    if (!eps) {
      prims.push({ k: 'circle', cx: p[0], cy: p[1], r: 2, fill: c.parchment, op: 0.35 });
      continue;
    }
    const both = eps.has('personality') && eps.has('design');
    const fill = both || eps.has('personality') ? c.personality : c.design;
    prims.push({
      k: 'circle', cx: p[0], cy: p[1], r: 6.6,
      fill,
      stroke: both ? c.design : c.obsidian,
      w: both ? 2.4 : 1.2,
    });
    prims.push({
      k: 'text', x: p[0], y: p[1], s: String(g), size: g > 9 ? 7.2 : 8,
      fill: fill === c.design ? '#FFFFFF' : c.obsidian, font: 'bold',
    });
  }

  // Fade-in order: faint structure, active channels, centers switching on, then the gates.
  prims.forEach((prim, i) => {
    prim.layer = i < afterStructure ? 0 : i < afterChannels ? 1 : i < afterCenters ? 2 : 3;
  });

  return { w: BODYGRAPH_W, h: BODYGRAPH_H, prims };
}

/** The 36 canonical channels as gate pairs (layout only — which are ACTIVE is server data). */
export const ALL_CHANNEL_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [64, 47], [61, 24], [63, 4],
  [17, 62], [43, 23], [11, 56],
  [1, 8], [7, 31], [10, 20], [13, 33],
  [21, 45], [12, 22], [35, 36], [16, 48], [20, 57], [20, 34],
  [2, 14], [5, 15], [29, 46], [25, 51], [10, 57], [10, 34],
  [26, 44], [37, 40], [34, 57], [59, 6], [27, 50],
  [9, 52], [3, 60], [42, 53], [18, 58], [28, 38], [32, 54],
  [19, 49], [39, 55], [41, 30],
];
