import type { BodygraphData } from '../charts/chartTypes';

/**
 * What to say about one center when it is tapped on the bodygraph. Pure functions over the server's chart
 * data, with no imports besides types, so they can be tested without the app.
 */
export const CENTER_LABELS: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G Center', heart: 'Heart',
  solar_plexus: 'Solar Plexus', sacral: 'Sacral', spleen: 'Spleen', root: 'Root',
};

export const centerLabel = (id: string): string => CENTER_LABELS[id] ?? id;

export interface CenterFocusInfo {
  id: string;
  name: string;
  defined: boolean;
  /** Complete channels that touch this center, with the center on their other end. */
  channels: Array<{ gates: [number, number]; name: string; other: string }>;
  /** Gates active in this center whose partner gate is open (so no channel is complete). */
  hanging: number[];
  /** Every active gate that sits in this center. */
  gates: number[];
}

export function centerFocusInfo(hd: BodygraphData, id: string): CenterFocusInfo {
  const channels = hd.channels
    .filter((c) => c.fromCenter === id || c.toCenter === id)
    .map((c) => ({ gates: c.gates, name: c.name, other: c.fromCenter === id ? c.toCenter : c.fromCenter }));
  const inChannel = new Set(hd.channels.flatMap((c) => c.gates));
  const gates = [...new Set(hd.gates.filter((g) => g.center === id).map((g) => g.gate))].sort((a, b) => a - b);
  return {
    id,
    name: centerLabel(id),
    defined: hd.definedCenters.includes(id),
    channels,
    hanging: gates.filter((g) => !inChannel.has(g)),
    gates,
  };
}

const list = (words: string[]): string =>
  words.length <= 1 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;

/** Two or three plain sentences about the center. */
export function focusSentence(f: CenterFocusInfo): string {
  const parts: string[] = [];
  if (f.defined) {
    const to = [...new Set(f.channels.map((c) => centerLabel(c.other)))];
    parts.push(
      f.channels.length > 0
        ? `${f.name} is defined. It is joined to ${list(to)} by ${f.channels.length === 1 ? 'one channel' : `${f.channels.length} channels`}, so it works the same way in you every day.`
        : `${f.name} is defined.`,
    );
  } else {
    parts.push(`${f.name} is open. No complete channel runs through it, so it takes in and amplifies what is around you.`);
  }
  if (f.hanging.length > 0) {
    parts.push(
      `Gate${f.hanging.length === 1 ? '' : 's'} ${list(f.hanging.map(String))} ${f.hanging.length === 1 ? 'is' : 'are'} active here without a partner, so ${f.hanging.length === 1 ? 'it is' : 'they are'} drawn as a short dashed stub.`,
    );
  }
  return parts.join(' ');
}
