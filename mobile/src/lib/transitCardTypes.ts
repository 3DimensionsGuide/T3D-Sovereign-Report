export type TransitNature = 'flow' | 'friction' | 'neutral';

export interface TransitCardData {
  title: string;
  nature: TransitNature;
  natureLine: string;
  timingState: string;
  howLong: string;
  whatItIs: string;
  whereItLands: string;
  invitation: string;
  meetIt: {
    frame: string;
    strategy: string | null;
    authority: string | null;
    cue: string | null;
  };
  reminder: string;
  related: string[];
}
