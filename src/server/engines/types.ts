/**
 * T3D Sovereign Calculator — Shared Type Definitions
 * All interfaces shared across the three calculation engines and the API route.
 */

// ─── API INPUT SCHEMA ─────────────────────────────────────────────────────────

export interface T3DCalculatorInput {
  firstName: string;          // Required — Pythagorean name valuation
  middleName?: string;        // Optional (include if on birth certificate)
  lastName: string;           // Required — Pythagorean name valuation
  birthDate: string;          // Required — YYYY-MM-DD
  birthTime?: string;         // Optional — HH:MM (24-hour). Defaults to "12:00"
  birthPlace: BirthPlace;
  email: string;              // Required — lead capture + report delivery
}

export interface BirthPlace {
  city: string;               // Required — coordinates lookup
  country: string;            // Required — coordinates lookup
  latitude?: number;          // Optional — calculated server-side if absent
  longitude?: number;         // Optional — calculated server-side if absent
  timezone?: string;          // Optional — IANA string e.g. "America/New_York"
}

// ─── NUMEROLOGY TYPES ─────────────────────────────────────────────────────────

export interface NumerologyInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
}

/** A single Pinnacle or Challenge cycle with its active age range */
export interface NumerologyCycle {
  number: number;
  startAge: number;
  endAge: number | null; // null = active until death
  label: string;         // e.g. "First Pinnacle"
}

export interface NumerologyResult {
  // Core numbers
  lifePath: number;
  destiny: number;       // Expression number
  personality: number;   // Consonants
  soulUrge: number;      // Heart's Desire (vowels)
  // Secondary numbers
  hiddenPassion: number; // Most frequent digit in name letters
  karmicLessons: number[]; // Missing digits (1–9) from name
  // Timing cycles
  pinnacles: NumerologyCycle[];
  challenges: NumerologyCycle[];
}

// ─── ASTROLOGY TYPES ──────────────────────────────────────────────────────────

export interface AstrologyInput {
  birthDate: string;  // YYYY-MM-DD
  birthTime: string;  // HH:MM (24-hour)
  latitude: number;
  longitude: number;
  timezone: string;   // IANA timezone string
}

export interface PlanetPosition {
  longitude: number;     // Ecliptic longitude 0–360°
  latitude: number;      // Ecliptic latitude
  speed: number;         // Degrees/day (negative = retrograde)
  retrograde: boolean;
  sign: ZodiacSign;
  degreeInSign: number;  // 0–29.999
  minuteInSign: number;  // 0–59
  formatted: string;     // "15°23' Scorpio"
}

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface HouseData {
  cusps: number[];    // 12 cusps in ecliptic degrees (index 0 = House 1)
  ascendant: number;  // ASC longitude
  mc: number;         // MC longitude
  system: 'Whole Sign';
}

export interface ChartData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  northNode: PlanetPosition;
  southNode: PlanetPosition;
  earth: PlanetPosition; // Anti-sun — Sun longitude + 180°
  houses: HouseData;
}

export interface AstrologyResult {
  tropical: ChartData;
  sidereal: ChartData; // Lahiri ayanamsha
  julianDay: number;
}

// ─── HUMAN DESIGN TYPES ───────────────────────────────────────────────────────

export interface HumanDesignInput {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export type HDCenter =
  | 'head' | 'ajna' | 'throat' | 'g_center'
  | 'heart' | 'solar_plexus' | 'sacral' | 'spleen' | 'root';

export type HDType =
  | 'Manifestor'
  | 'Generator'
  | 'Manifesting Generator'
  | 'Projector'
  | 'Reflector';

export type HDAuthority =
  | 'Emotional'
  | 'Sacral'
  | 'Splenic'
  | 'Ego'
  | 'Self-Projected'
  | 'Mental'
  | 'Lunar';

export type HDEpoch = 'personality' | 'design';

export interface GateActivation {
  gate: number;        // 1–64
  line: number;        // 1–6
  center: HDCenter;
  planet: string;      // e.g. "sun", "moon"
  epoch: HDEpoch;
  longitude: number;   // Raw ecliptic longitude
}

export interface ChannelDefinition {
  gates: [number, number];
  name: string;
  fromCenter: HDCenter;
  toCenter: HDCenter;
}

export interface ActiveChannel extends ChannelDefinition {
  /** Which epoch activated this channel (or "both" if both epochs contributed) */
  activatedBy: HDEpoch | 'both';
}

export interface HumanDesignResult {
  type: HDType;
  authority: HDAuthority;
  profile: string;          // e.g. "3/5" — Personality Sun line / Design Sun line
  strategy: string;
  notSelf: string;
  incarnationCross: string; // e.g. "Right Angle Cross of Laws (41/31 | 44/24)"
  definedCenters: HDCenter[];
  undefinedCenters: HDCenter[];
  activeChannels: ActiveChannel[];
  activeGates: GateActivation[];
  personalityEpoch: { julianDay: number; solarLongitude: number };
  designEpoch: { julianDay: number; solarLongitude: number };
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

export interface T3DCalculationResult {
  success: true;
  leadId: number;
  data: {
    astrology: {
      tropicalSun: PlanetPosition;
      tropicalMoon: PlanetPosition;
      tropicalAscendant: number;
      tropicalMC: number;
      siderealSun: PlanetPosition;
      siderealAscendant: number;
      houseSystem: 'Whole Sign';
    };
    numerology: {
      lifePath: number;
      destiny: number;
      personality: number;
      soulUrge: number;
      hiddenPassion: number;
      karmicLessons: number[];
    };
    humanDesign: {
      type: HDType;
      authority: HDAuthority;
      profile: string;
      strategy: string;
    };
  };
}

export interface T3DErrorResult {
  success: false;
  error: string;
}
