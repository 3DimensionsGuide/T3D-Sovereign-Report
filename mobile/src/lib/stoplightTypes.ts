export interface BigThreeLens {
  sun: {
    sign: string; formatted: string; element: string; modality: string;
    orientation: string; recognize: string[]; watchFor: string;
    house: number; arenaName: string; arena: string;
  };
  moon: { sign: string; formatted: string; element: string; modality: string; text: string };
  rising: { sign: string; formatted: string; element: string; modality: string; text: string };
}

export interface StoplightPlanet {
  key: string;
  name: string;
  group: 'personal' | 'social' | 'outer';
  placement: string;
  house: number | null;
  houseName: string | null;
  retrograde: boolean;
  theme: string;
  gift: string;
  friction: string;
}

export interface StoplightDetail {
  locked: boolean;
  birthTimeKnown: boolean;
  timeNote: string | null;
  lensNote: string;
  tropical: BigThreeLens;
  sidereal: BigThreeLens;
  siderealNote: string;
  sunMoon: { label: string; tension: string; resource: string; practice: string };
  elements: { label: string; pacing: string; change: string; emotion: string; gift: string; friction: string };
  modality: { label: string; description: string };
  ruler: { ruler: string; description: string; arena: string };
  planets: StoplightPlanet[];
  mechanisms: { personal: string; social: string; outer: string };
  timeLord: {
    planet: string; tagline: string; startYear: number; endYear: number;
    yearsRemaining: number; isDayChart: boolean; next: string | null;
    quote: string; paragraphs: string[]; watchFor: string;
  };
  lordOfYear: {
    age: number; house: number; houseName: string; houseTheme: string;
    sign: string; lord: string; lordQuote: string | null;
  };
  mixups: { confusion: string; signal: string; recalibrate: string }[];
}
