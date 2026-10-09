import type { ChartDrawingData } from '@/charts/chartTypes';
import type { NumerologyDetail } from '@/lib/numerologyTypes';
import type { TimelineResult } from '@/lib/timelineTypes';
/**
 * Talks to the T3D website's secure calculation endpoint.
 *
 * All proprietary formulas stay on the server (Hard IP). The app only
 * ever receives the curated result and displays it.
 *
 * To point the app at a different server (for example your computer while
 * developing), set EXPO_PUBLIC_API_BASE_URL. By default it uses the live site.
 */

// IMPORTANT: use the "www" address. The bare 3dimensions.guide address answers
// with a redirect, and iOS apps can't follow a redirect on a POST request that
// carries data (the request hangs and the app can crash).
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://www.3dimensions.guide';

export interface BirthProfile {
  firstName: string;
  /** Optional, but numerology uses the full birth name — enter it if you have one. */
  middleName?: string;
  lastName: string;
  email: string;
  /** YYYY-MM-DD */
  birthDate: string;
  /** HH:MM, 24-hour */
  birthTime: string;
  /** False when the person doesn't know their birth time (12:00 is used). */
  birthTimeKnown: boolean;
  city: string;
  country: string;
}

export interface PlanetPlacement {
  sign: string;
  degreeInSign: number;
  minuteInSign: number;
  retrograde: boolean;
  formatted: string;
}

export interface ChartResult {
  leadId: number;
  astrology: {
    tropicalSun: PlanetPlacement;
    tropicalMoon: PlanetPlacement;
    /** Ecliptic longitude in degrees (0–360). */
    tropicalAscendant: number;
    tropicalMC: number;
    siderealSun: PlanetPlacement;
    siderealAscendant: number;
    houseSystem: string;
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
    type: string;
    authority: string;
    profile: string;
    strategy: string;
  };
}

interface ApiSuccess {
  success: true;
  leadId: number;
  data: Omit<ChartResult, 'leadId'>;
}

interface ApiFailure {
  success: false;
  error: string;
}

export class ChartRequestError extends Error {}

const REQUEST_TIMEOUT_MS = 45000;

export async function requestChart(profile: BirthProfile): Promise<ChartResult> {
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}/api/calculate-t3d`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: profile.firstName.trim(),
        middleName: profile.middleName?.trim() || undefined,
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: {
          city: profile.city.trim(),
          country: profile.country.trim(),
        },
      }),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: ApiSuccess | ApiFailure;
  try {
    payload = (await response.json()) as ApiSuccess | ApiFailure;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }

  if (!payload.success) {
    throw new ChartRequestError(payload.error || 'The calculation failed. Please try again.');
  }
  return { leadId: payload.leadId, ...payload.data };
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** Display-only: turns an ecliptic longitude into text like "15°23' Scorpio". */
export function formatLongitude(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(normalized / 30)];
  const inSign = normalized % 30;
  const degrees = Math.floor(inSign);
  const minutes = Math.floor((inSign - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, '0')}' ${sign}`;
}

// ─── TODAY (daily sky) ───────────────────────────────────────────────────────

export type SkyBody =
  | 'moon' | 'sun' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
export type NatalPointName =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'ascendant' | 'midheaven';
export type DailyAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type AspectNature = 'flow' | 'friction' | 'neutral';

export interface MoonAspectContact {
  natal: NatalPointName;
  aspect: DailyAspect;
  degrees: number;
  approxHours: number;
}

export interface DailyTransitHit {
  transiting: SkyBody;
  natal: NatalPointName;
  aspect: DailyAspect;
  orb: number;
  peak: boolean;
  applying: boolean;
  nature: AspectNature;
}

export interface TodayResult {
  asOf: string;
  moon: {
    sign: string;
    formatted: string;
    house: number;
    phase: string;
    waxing: boolean;
    illuminationPercent: number;
    nextApplying: MoonAspectContact | null;
    lastSeparating: MoonAspectContact | null;
  };
  sun: { sign: string; formatted: string; house: number };
  retrograde: SkyBody[];
  transits: DailyTransitHit[];
  vehicle: { type: string | null; strategy: string | null; authority: string | null };
  reminder: string;
}

export async function requestToday(leadId: number, email: string): Promise<TodayResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/app/today`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, email }),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: { success: true; data: TodayResult } | ApiFailure;
  try {
    payload = (await response.json()) as { success: true; data: TodayResult } | ApiFailure;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }
  if (!payload.success) {
    throw new ChartRequestError(payload.error || 'Could not load today. Please try again.');
  }
  return payload.data;
}

/** The picture-ready data for the natal wheel and the bodygraph. */
export async function requestChartData(leadId: number, email: string): Promise<ChartDrawingData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/app/chart-data`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, email }),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: { success: true; data: ChartDrawingData } | ApiFailure;
  try {
    payload = (await response.json()) as { success: true; data: ChartDrawingData } | ApiFailure;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }
  if (!payload.success) {
    throw new ChartRequestError(payload.error || 'Could not load your charts. Please try again.');
  }
  return payload.data;
}

export interface TimelineOptions {
  /** The person's calendar date on this phone, YYYY-MM-DD. */
  localDate: string;
  /** Minutes behind UTC (JS getTimezoneOffset). */
  tzOffsetMinutes: number;
  days: number;
}

/** Sky events, profection and numerology cycles for the Timeline tab. */
export async function requestTimeline(
  leadId: number,
  email: string,
  options: TimelineOptions,
): Promise<TimelineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/app/timeline`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, email, ...options }),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: { success: true; data: TimelineResult } | ApiFailure;
  try {
    payload = (await response.json()) as { success: true; data: TimelineResult } | ApiFailure;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }
  if (!payload.success) {
    throw new ChartRequestError(payload.error || 'Could not load your timeline. Please try again.');
  }
  return payload.data;
}

/** Full Numerology (The Road) interpretations for the Numerology tab. */
export async function requestNumerology(leadId: number, email: string): Promise<NumerologyDetail> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/app/numerology`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, email }),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: { success: true; data: NumerologyDetail } | ApiFailure;
  try {
    payload = (await response.json()) as { success: true; data: NumerologyDetail } | ApiFailure;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }
  if (!payload.success) {
    throw new ChartRequestError(payload.error || 'Could not load your numerology. Please try again.');
  }
  return payload.data;
}
