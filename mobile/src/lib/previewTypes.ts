export interface BirthPreview {
  lifePath: { number: number; name: string; direction: string; plain: string };
  sun: { sign: string; element: string; orientation: string; cusp: boolean };
  vehicle?: { gate: number; name: string; meaning: string; center: string; cusp: boolean } | null;
  locked: string[];
}
