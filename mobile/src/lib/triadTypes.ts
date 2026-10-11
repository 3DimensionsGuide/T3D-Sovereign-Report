export type LampState = 'go' | 'slow' | 'pause';

export interface Lamp {
  state: LampState;
  reason: string;
}

/** Go, Slow or Pause for each lens and overall. Conditions, never a decision. */
export interface DailySignal {
  overall: Lamp;
  vehicle: Lamp | null;
  road: Lamp;
  stoplight: Lamp;
}

export interface TriadToday {
  /** Missing on a saved copy from before the signal existed. */
  signal?: DailySignal | null;
  vehicle: { heading: string; strategy: string | null; authority: string | null; cue: string | null };
  road: {
    numberText: string; label: string; theme: string; leanIn: string; watchFor: string; universalLabel: string;
  };
  stoplight: {
    moon: string;
    lead: { title: string; natureLine: string; invitation: string } | null;
    quiet: string | null;
  };
  frame: string;
  steps: string[];
  closing: string;
}
