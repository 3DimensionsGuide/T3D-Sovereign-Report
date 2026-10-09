/**
 * Fixed geometry for the Human Design bodygraph (viewBox 400 x 600).
 * The 9 centers and the exact anchor point of every one of the 64 gates.
 * This is layout only — which gates/channels/centers are active comes from
 * the server's chart data, never from here.
 */
export type CenterId =
  | 'head' | 'ajna' | 'throat' | 'g_center' | 'heart'
  | 'solar_plexus' | 'sacral' | 'spleen' | 'root';

export type Pt = readonly [number, number];

export interface CenterShape {
  id: CenterId;
  label: string;
  polygon: readonly Pt[];
  /** Where the small center name is written. */
  labelAt: Pt;
}

export const BODYGRAPH_W = 400;
export const BODYGRAPH_H = 600;

export const CENTER_SHAPES: readonly CenterShape[] = [
  { id: 'head', label: 'HEAD', polygon: [[200, 28], [160, 85], [240, 85]], labelAt: [200, 68] },
  { id: 'ajna', label: 'AJNA', polygon: [[160, 125], [240, 125], [200, 170]], labelAt: [200, 138] },
  { id: 'throat', label: 'THROAT', polygon: [[150, 205], [250, 205], [250, 262], [150, 262]], labelAt: [200, 233] },
  { id: 'g_center', label: 'G', polygon: [[200, 290], [240, 330], [200, 370], [160, 330]], labelAt: [200, 330] },
  { id: 'heart', label: 'HEART', polygon: [[280, 320], [305, 375], [255, 375]], labelAt: [280, 362] },
  { id: 'sacral', label: 'SACRAL', polygon: [[150, 405], [250, 405], [250, 475], [150, 475]], labelAt: [200, 440] },
  { id: 'spleen', label: 'SPLEEN', polygon: [[35, 395], [35, 505], [125, 450]], labelAt: [58, 450] },
  { id: 'solar_plexus', label: 'SOLAR PLEXUS', polygon: [[365, 395], [365, 505], [275, 450]], labelAt: [338, 450] },
  { id: 'root', label: 'ROOT', polygon: [[150, 530], [250, 530], [250, 586], [150, 586]], labelAt: [200, 558] },
] as const;

/** Anchor point (on the edge of its center) of every gate, 1–64. */
export const GATE_ANCHORS: Readonly<Record<number, Pt>> = {
  // Head
  64: [172, 85], 61: [200, 85], 63: [228, 85],
  // Ajna
  47: [172, 125], 24: [200, 125], 4: [228, 125],
  17: [176, 143], 43: [200, 168], 11: [224, 143],
  // Throat
  62: [172, 205], 23: [200, 205], 56: [228, 205],
  35: [250, 216], 12: [250, 234], 45: [250, 252],
  16: [150, 216], 20: [150, 248],
  31: [172, 262], 8: [200, 262], 33: [228, 262],
  // G Center
  1: [200, 290], 7: [181, 309], 13: [219, 309], 25: [240, 330],
  15: [181, 351], 2: [200, 370], 46: [219, 351], 10: [160, 330],
  // Heart
  21: [280, 320], 51: [266, 350], 40: [293, 375], 26: [265, 375],
  // Sacral
  5: [172, 405], 14: [200, 405], 29: [228, 405],
  34: [150, 420], 27: [150, 455], 59: [250, 440],
  42: [172, 475], 3: [200, 475], 9: [228, 475],
  // Spleen
  48: [53, 406], 57: [75.5, 419.8], 44: [102.5, 436],
  50: [111.5, 458], 32: [84.5, 474.5], 28: [62, 488.5], 18: [35, 490],
  // Solar Plexus
  36: [347, 406], 22: [324.5, 420], 37: [297.5, 436],
  6: [288.5, 458], 49: [315.5, 474.5], 55: [338, 488.5], 30: [365, 490],
  // Root
  53: [172, 530], 60: [200, 530], 52: [228, 530],
  54: [150, 544], 38: [150, 558], 58: [150, 572],
  19: [250, 544], 39: [250, 558], 41: [250, 572],
};

/** Channels drawn as a gentle curve instead of a straight line (control point). */
export const CURVED_CHANNELS: Readonly<Record<string, Pt>> = {
  '20-34': [112, 334],
};
