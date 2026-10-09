export interface DayNumberMeaning {
  number: number;
  /** Single-digit root, set only for master numbers (11/2, 22/4, 33/6). */
  root: number | null;
  label: string;
  theme: string;
  keyThemes: string[];
  leanIn: string;
  watchFor: string;
}

export interface DayNumerology {
  date: string;
  universal: DayNumberMeaning;
  personal: DayNumberMeaning;
  personalYear: number;
  personalMonth: number;
  blend: string;
}
