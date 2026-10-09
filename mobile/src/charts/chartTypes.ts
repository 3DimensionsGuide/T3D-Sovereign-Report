/** Shapes returned by POST /api/app/chart-data (mirrors the server's chartData.ts). */
export type WheelBody =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'northNode';
export type WheelPoint = WheelBody | 'ascendant' | 'midheaven';
export type WheelAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface WheelPlanet {
  body: WheelBody;
  longitude: number;
  sign: string;
  formatted: string;
  retrograde: boolean;
  house: number;
}

export interface WheelAspectLine {
  a: WheelPoint;
  b: WheelPoint;
  aspect: WheelAspect;
  orb: number;
  peak: boolean;
}

export interface WheelChart {
  planets: WheelPlanet[];
  ascendant: number;
  midheaven: number;
  aspects: WheelAspectLine[];
}

export type Epoch = 'personality' | 'design';

export interface BodygraphChannel {
  gates: [number, number];
  name: string;
  fromCenter: string;
  toCenter: string;
  activatedBy: 'personality' | 'design' | 'both';
}

export interface BodygraphGate {
  gate: number;
  line: number;
  epoch: Epoch;
  planet: string;
  center: string;
}

export interface BodygraphData {
  type: string;
  authority: string;
  profile: string;
  strategy: string;
  notSelf: string;
  incarnationCross: string;
  definedCenters: string[];
  undefinedCenters: string[];
  channels: BodygraphChannel[];
  gates: BodygraphGate[];
}

export interface ChartDrawingData {
  tropical: WheelChart;
  sidereal: WheelChart;
  humanDesign: BodygraphData;
}
