export interface PracticeChoice {
  id: string;
  label: string;
}

export interface PracticeStep {
  key: 'vehicle' | 'road' | 'stoplight';
  system: string;
  title: string;
  prompt: string;
  instruction: string;
  signal: string;
  choices: PracticeChoice[];
}

export type VerdictKey = 'proceed' | 'reconsider' | 'wait' | 'decline';

export interface PracticeData {
  type: string | null;
  authority: string | null;
  authorityLabel: string;
  decide: {
    intro: string;
    pace: string;
    revisitDays: number;
    steps: PracticeStep[];
    verdicts: Record<VerdictKey, { title: string; text: string }>;
  };
  experiment: {
    title: string;
    premise: string;
    checkins: Array<{ when: 'Morning' | 'Midday' | 'Evening'; question: string }>;
    finale: { title: string; intro: string; prompts: string[] };
  };
}
