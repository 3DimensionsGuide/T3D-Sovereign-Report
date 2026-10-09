export interface TriadToday {
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
