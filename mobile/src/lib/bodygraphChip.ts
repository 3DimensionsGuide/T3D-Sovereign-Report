import { BODYGRAPH_H, BODYGRAPH_W, CENTER_SHAPES, GATE_ANCHORS } from '../charts/bodygraphLayout';

export interface ChipCenter {
  id: string;
  points: string;
  defined: boolean;
}

export interface ChipGate {
  who: 'sun' | 'moon';
  gate: number;
  line: number;
  x: number;
  y: number;
  /** True when the person carries this same gate in their own chart. */
  yours: boolean;
}

export interface BodygraphChip {
  width: number;
  height: number;
  centers: ChipCenter[];
  gates: ChipGate[];
  sentence: string;
  spoken: string;
}

export interface TodayGates {
  sun: { gate: number; line: number };
  moon: { gate: number; line: number };
}

const CENTER_WORDS: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G Center', heart: 'Heart',
  sacral: 'Sacral', spleen: 'Spleen', solar_plexus: 'Solar Plexus', root: 'Root',
};

export const centerWord = (id: string): string => CENTER_WORDS[id] ?? id;

/** "Head, Throat and Root" */
function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/**
 * The small bodygraph for Today: the nine centers (defined ones filled), and, when the server sent
 * them, the gates the Sun and Moon are in right now. Pure layout; which gates are active comes from the server.
 */
export function buildBodygraphChip(
  definedCenters: readonly string[],
  today: TodayGates | null | undefined,
  yourGates: readonly number[] = [],
  height = 120,
): BodygraphChip {
  const scale = height / BODYGRAPH_H;
  const width = Math.round(BODYGRAPH_W * scale);
  const defined = new Set(definedCenters);
  const fmt = (n: number) => Math.round(n * 100) / 100;
  const centers: ChipCenter[] = CENTER_SHAPES.map((c) => ({
    id: c.id,
    points: c.polygon.map(([x, y]) => `${fmt(x * scale)},${fmt(y * scale)}`).join(' '),
    defined: defined.has(c.id),
  }));

  const gates: ChipGate[] = [];
  if (today) {
    for (const who of ['sun', 'moon'] as const) {
      const { gate, line } = today[who];
      const anchor = GATE_ANCHORS[gate];
      if (!anchor) continue;
      gates.push({ who, gate, line, x: fmt(anchor[0] * scale), y: fmt(anchor[1] * scale), yours: yourGates.includes(gate) });
    }
  }

  const definedWords = CENTER_SHAPES.filter((c) => defined.has(c.id)).map((c) => centerWord(c.id));
  const own = definedWords.length ? `Defined: ${joinWords(definedWords)}.` : 'No centers are defined: you are a Reflector.';
  const gateText = gates.length
    ? gates.map((g) => `${g.who === 'sun' ? 'Sun' : 'Moon'} in gate ${g.gate}.${g.line}${g.yours ? ' (one of yours)' : ''}`).join(' · ')
    : null;
  const sentence = gateText ?? own;
  const spoken = `Your bodygraph. ${gateText ? `${gateText}. ` : ''}${own} Opens the full bodygraph.`;
  return { width, height, centers, gates, sentence, spoken };
}
