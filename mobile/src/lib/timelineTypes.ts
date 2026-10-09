/** Shapes returned by POST /api/app/timeline (mirrors the server's timeline.ts). */
import type { AspectNature, DailyAspect, NatalPointName, SkyBody } from '@/lib/api';

export type TimelineKind = 'lunation' | 'eclipse' | 'station' | 'ingress' | 'transit' | 'return';

export interface TimelineEvent {
  id: string;
  at: string;
  kind: TimelineKind;
  title: string;
  detail: string;
  body?: SkyBody;
  natal?: NatalPointName;
  aspect?: DailyAspect;
  nature: AspectNature;
  house?: number;
  position?: string;
  lord?: boolean;
  profectedHouse?: boolean;
  windowStart?: string;
  windowEnd?: string;
  peakStart?: string;
  peakEnd?: string;
  retrograde?: boolean;
}

export interface ActiveSeason {
  body: SkyBody;
  natal: NatalPointName;
  aspect: DailyAspect;
  nature: AspectNature;
  orb: number;
  windowStart: string;
  windowEnd: string;
  exactAt: string[];
  closest: { at: string; orb: number };
  lord: boolean;
}

export interface Profection {
  age: number;
  house: number;
  sign: string;
  lord: SkyBody;
  startsOn: string;
  endsOn: string;
}

export interface PersonalDay {
  date: string;
  year: number;
  month: number;
  day: number;
}

export interface CycleWindow {
  label: string;
  number: number;
  startAge: number;
  endAge: number | null;
  startsOn: string;
  endsOn: string | null;
  theme?: string;
  terrain: string;
  skill?: string;
  reframe?: string;
}

export interface TimelineResult {
  from: string;
  to: string;
  events: TimelineEvent[];
  seasons: ActiveSeason[];
  profection: Profection;
  universalYear: number;
  personal: PersonalDay[];
  pinnacle: { current: CycleWindow; next: CycleWindow | null };
  challenge: { current: CycleWindow; next: CycleWindow | null };
  numberMeanings: Record<number, { word: string; line: string }>;
  reminder: string;
}
