export type GlossaryGroup = 'Human Design' | 'Astrology' | 'Numerology' | 'Timing';

export interface ExplainEntry {
  id: string;
  group: GlossaryGroup;
  title: string;
  summary: string;
  body: string[];
  yours: string | null;
  relatedEntries: { id: string; title: string }[];
  /** True when the long explanation was withheld because the person does not have Premium. */
  locked?: boolean;
}

export interface GlossaryItem {
  id: string;
  group: GlossaryGroup;
  title: string;
  summary: string;
}
