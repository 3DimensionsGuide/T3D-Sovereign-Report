export type GlossaryGroup = 'Human Design' | 'Astrology' | 'Numerology' | 'Timing';

export interface ExplainEntry {
  id: string;
  group: GlossaryGroup;
  title: string;
  summary: string;
  body: string[];
  yours: string | null;
  relatedEntries: { id: string; title: string }[];
}

export interface GlossaryItem {
  id: string;
  group: GlossaryGroup;
  title: string;
  summary: string;
}
