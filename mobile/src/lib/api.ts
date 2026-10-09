/**
 * Talks to the T3D website's secure calculation endpoint.
 *
 * All proprietary formulas stay on the server (Hard IP). The app only
 * ever receives the curated result and displays it.
 *
 * To point the app at a different server (for example your computer while
 * developing), set EXPO_PUBLIC_API_BASE_URL. By default it uses the live site.
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://3dimensions.guide';

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

export async function requestChart(profile: BirthProfile): Promise<ChartResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/calculate-t3d`, {
      method: 'POST',
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
