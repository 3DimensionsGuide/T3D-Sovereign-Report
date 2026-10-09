/** Shapes returned by POST /api/app/numerology. */
export interface LifePathContent {
  number: number;
  name: string;
  direction: string;
  plain: string;
  recognize: [string, string, string];
  watchFor: string;
  tryThis: string;
  gifts: string[];
  shadow: string;
  overreach: string;
  underexpression: string;
  borrowed: string;
  reset: { title: string; instruction: string };
}

export interface NameNumberContent {
  theme: string;
  overexpressed: string;
  underexpressed: string;
}

export interface HiddenPassionContent {
  theme: string;
  gift: string;
  shadow: string;
}

export interface KarmicItem {
  number: number;
  theme: string | null;
  practice: string | null;
}

export interface PhaseCard {
  label: string;
  number: number;
  startAge: number;
  endAge: number | null;
  startsOn: string;
  endsOn: string | null;
  current: boolean;
}

export interface PinnacleCard extends PhaseCard {
  theme: string | null;
  terrain: string | null;
  coreMandate: string | null;
  phase: string | null;
}

export interface ChallengeCard extends PhaseCard {
  terrain: string | null;
  skill: string | null;
  reframe: string | null;
  test: string | null;
  key: string | null;
}

export interface NumerologyDetail {
  locked: boolean;
  lifePath: { display: string; number: number; content: LifePathContent | null };
  birthday: { display: string; number: number; description: string | null };
  attitude: { display: string; number: number; description: string | null };
  innerDrivers: {
    mechanism: string;
    destiny: { number: number; content: NameNumberContent | null };
    soulUrge: { number: number; content: NameNumberContent | null };
    personality: { number: number; content: NameNumberContent | null };
  };
  hiddenPassion: { mechanism: string; number: number; content: HiddenPassionContent | null };
  karmicLessons: { mechanism: string; items: KarmicItem[] };
  pinnacles: PinnacleCard[];
  challenges: ChallengeCard[];
  interplay: string;
  nameNote: string;
}
