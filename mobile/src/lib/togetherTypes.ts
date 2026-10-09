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
