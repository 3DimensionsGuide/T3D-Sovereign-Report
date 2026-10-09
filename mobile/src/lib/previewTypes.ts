export interface BirthPreview {
  lifePath: { number: number; name: string; direction: string; plain: string };
  sun: { sign: string; element: string; orientation: string; cusp: boolean };
  locked: string[];
}
