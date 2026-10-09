export interface TogetherPerson {
  label: string;
  type: string | null;
  authority: string | null;
  strategy: string | null;
  prompt: string | null;
  paceText: string | null;
  certainty: 'sure' | 'depends';
  possibilities: string[];
}

export interface DecideTogether {
  people: [TogetherPerson, TogetherPerson];
  tempo: { title: string; text: string } | null;
  approach: Array<{ forLabel: string; howToAsk: string; theirPart: string }> | null;
  steps: string[];
  road: string | null;
  note: string | null;
  closing: string;
  connections: HdConnections | null;
  centers: CenterEffects | null;
  numbers: NumberPair | null;
  sky: Synastry | null;
  houses: HouseOverlays | null;
}

export type ConnectionKind = 'electromagnetic' | 'companionship' | 'dominance' | 'compromise';

export interface HdConnections {
  kinds: Array<{ kind: ConnectionKind; title: string; mark: string; what: string; feels: string; watch: string }>;
  items: Array<{ kind: ConnectionKind; channel: string; gates: [number, number]; centers: string; holders: string }>;
  leftOut: number;
  note: string | null;
  closing: string;
}

export interface CenterEffects {
  items: Array<{
    center: string; theme: string; holders: string; brings: string; feels: string; watch: string; grows: string;
  }>;
  bothDefined: string[];
  bothOpen: string[];
  bothDefinedText: string;
  bothOpenText: string;
  leftOut: number;
  note: string | null;
  intro: string;
  closing: string;
}

export interface HouseOverlays {
  groups: Array<{ title: string; items: Array<{ line: string; house: number; theme: string; text: string }> }>;
  note: string | null;
  intro: string;
  closing: string;
}

export interface NumberPair {
  youLifePath: string;
  themLifePath: string;
  lifePath: { title: string; text: string; bring: Array<{ who: string; text: string }> };
  year: { title: string; text: string; bring: Array<{ who: string; text: string }> };
  closing: string;
}

export interface Synastry {
  items: Array<{ line: string; aspect: string; orb: number; theme: string; text: string }>;
  note: string | null;
  closing: string;
}

/** The other person's details. Saved on this phone only. */
export interface PartnerProfile {
  label: string;
  birthDate: string;
  /** null when the birth time is not known. */
  birthTime: string | null;
  placeLabel: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
