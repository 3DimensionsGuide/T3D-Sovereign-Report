import type { AspectNature, DailyAspect, NatalPointName, SkyBody } from '@/lib/apiTypes';
import type { BirthPreview } from '@/lib/previewTypes';
import type { ChartDrawingData } from '@/charts/chartTypes';
import type { StoplightDetail } from '@/lib/stoplightTypes';
import type { TriadToday } from '@/lib/triadTypes';
import type { PracticeData } from '@/lib/practiceTypes';
import type { DecideTogether, PartnerProfile } from '@/lib/togetherTypes';
import type { TransitCardData } from '@/lib/transitCardTypes';
import type { ExplainEntry, GlossaryItem } from '@/lib/explainTypes';
import type { DayNumerology } from '@/lib/dayNumerologyTypes';
import type { NumerologyDetail } from '@/lib/numerologyTypes';
import type { TimelineResult } from '@/lib/timelineTypes';
import type { VehicleDetail } from '@/lib/vehicleTypes';
import { authHeader, clearSessionToken, setSessionToken } from '@/lib/session';
import { useT3DStore } from '@/store/useT3DStore';
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
  /** Not optional so much as not universal: numerology reads the full birth name, so
   *  send it whenever the person has one. Absent means they have none, not skipped. */
  middleName?: string;
  lastName: string;
  /** Absent until the person gives one. Onboarding shows the chart first and asks after, so
   *  a profile with no address is the normal state of a first session, not an unfinished one. */
  email?: string;
  /** True only if the person ticked the optional "email me insights" switch. */
  emailOptIn?: boolean;
  /** YYYY-MM-DD */
  birthDate: string;
  /** HH:MM, 24-hour */
  birthTime: string;
  /** False when the person doesn't know their birth time (12:00 is used). */
  birthTimeKnown: boolean;
  city: string;
  /** State, province or region. Optional — plenty of places have none. It is kept apart from
   *  the city here so re-editing never doubles it up, and folded into the city string by
   *  placeQuery() at the API boundary, which is the form GeoNames is queried in. */
  state?: string;
  country: string;
  /** Set when the person confirmed the place; the exact values the chart was built from. */
  placeLabel?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
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

/** What happened to the optional "email me insights" code (only present if they ticked the switch). */
export type OptInCodeStatus = 'not-requested' | 'sent' | 'failed' | 'already-opted-in';

interface ApiSuccess {
  success: true;
  leadId: number;
  optInCode?: OptInCodeStatus;
  /** The app asks for this with wantSession; it is what proves who the app is from here on. */
  sessionToken?: string;
  data: Omit<ChartResult, 'leadId'>;
}

interface ApiFailure {
  success: false;
  error: string;
}

export class ChartRequestError extends Error {}

const REQUEST_TIMEOUT_MS = 45000;

export async function requestChart(profile: BirthProfile): Promise<{ chart: ChartResult; optInCode: OptInCodeStatus }> {
  let response: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}/api/calculate-t3d`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Asks the server for a session token. It only ever mints one for the row this request
        // writes, which is why the app never has to send an email address to read its own chart.
        wantSession: true,
        firstName: profile.firstName.trim(),
        middleName: profile.middleName?.trim() || undefined,
        lastName: profile.lastName.trim(),
        email: profile.email?.trim() || undefined,
        // Tells the server an address is coming later, under a session token. Only the app may
        // say this; the website calculator still has to give one. See the route's validateInput.
        emailLater: !profile.email?.trim(),
        emailOptIn: profile.emailOptIn === true,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: {
          city: placeQuery(profile.city, profile.state),
          country: profile.country.trim(),
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone,
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
  // Saved before anything else: every request after this one depends on it.
  if (payload.sessionToken) await setSessionToken(payload.sessionToken);
  return { chart: { leadId: payload.leadId, ...payload.data }, optInCode: payload.optInCode ?? 'not-requested' };
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

export type { AspectNature, DailyAspect, NatalPointName, SkyBody };

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
  /** Drawing positions. Missing when the server is older than the app. */
  transitLongitude?: number;
  natalLongitude?: number;
}

/** Where one body is in the sky today (tropical, 0–360). Missing from older servers. */
export interface SkyPosition {
  body: SkyBody;
  longitude: number;
  retrograde: boolean;
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
  /** Every body's place in the sky, for drawing today's sky on the wheel. Missing when the server is older than the app. */
  positions?: SkyPosition[];
  /** The gate and line the Sun and Moon are in. Missing when the server is older than the app. */
  gates?: { sun: { gate: number; line: number }; moon: { gate: number; line: number } };
  vehicle: { type: string | null; strategy: string | null; authority: string | null };
  reminder: string;
}

// ─── SIGNING IN ──────────────────────────────────────────────────────────────

/**
 * Signs in again using the birth details already saved on this phone.
 *
 * The app's session token is the only thing it sends to prove who it is, and it has a life of its
 * own: it expires, and deleting your data ends it immediately. When the server answers an app
 * request with `reauth`, this recalculates the same chart, which hands back a fresh token — the
 * server only ever mints one for the row the request just wrote, so nothing here can reach anyone
 * else's chart.
 *
 * Only one of these runs at a time. Several screens loading at once all wait on the same request
 * instead of each spending one of the hour's recalculations.
 */
let signingIn: Promise<boolean> | null = null;

async function doSignIn(): Promise<boolean> {
  const profile = useT3DStore.getState().profile;
  if (!profile) {
    // Nothing saved to sign in with: the person goes back through onboarding.
    await clearSessionToken();
    return false;
  }
  try {
    await requestChart(profile);
    return true;
  } catch {
    return false;
  }
}

function signIn(): Promise<boolean> {
  if (!signingIn) {
    signingIn = doSignIn().finally(() => {
      signingIn = null;
    });
  }
  return signingIn;
}

// ─── ONE WAY IN AND OUT ──────────────────────────────────────────────────────

interface AppReply<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** The server's signal that the session has to be refreshed, not that something went wrong. */
  reauth?: boolean;
}

async function send<T>(path: string, body: Record<string, unknown>, signed: boolean): Promise<AppReply<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(signed ? await authHeader() : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ChartRequestError(
      'Could not reach the T3D server. Check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  try {
    return (await response.json()) as AppReply<T>;
  } catch {
    throw new ChartRequestError('The server sent back something unexpected. Please try again.');
  }
}

/**
 * Every signed app request goes through here: it carries the session token, and if the server says
 * the session has expired it signs in once and tries again. The person sees nothing of that — only
 * a failure that survives the retry becomes an error on screen.
 */
async function postApp<T>(path: string, body: Record<string, unknown>, failure: string): Promise<T> {
  let reply = await send<T>(path, body, true);

  if (!reply.success && reply.reauth === true && (await signIn())) {
    reply = await send<T>(path, body, true);
  }

  if (!reply.success) throw new ChartRequestError(reply.error || failure);
  return reply.data as T;
}

/** For the three routes that need no session: the first-launch preview, a place lookup, an invite. */
async function postPublic<T>(path: string, body: Record<string, unknown>, failure: string): Promise<T> {
  const reply = await send<T>(path, body, false);
  if (!reply.success) throw new ChartRequestError(reply.error || failure);
  return reply.data as T;
}

// ─── THE APP'S SCREENS ───────────────────────────────────────────────────────

/** `at` reads the sky for another day (an ISO date-time); leave it out for right now. */
export function requestToday(at?: string): Promise<TodayResult> {
  return postApp<TodayResult>('/api/app/today', at ? { at } : {}, 'Could not load today. Please try again.');
}

/** The picture-ready data for the natal wheel and the bodygraph. */
export function requestChartData(): Promise<ChartDrawingData> {
  return postApp<ChartDrawingData>('/api/app/chart-data', {}, 'Could not load your charts. Please try again.');
}

export interface TimelineOptions {
  /** The person's calendar date on this phone, YYYY-MM-DD. */
  localDate: string;
  /** Minutes behind UTC (JS getTimezoneOffset). */
  tzOffsetMinutes: number;
  days: number;
}

/** Sky events, profection and numerology cycles for the Timeline tab. */
export function requestTimeline(options: TimelineOptions): Promise<TimelineResult> {
  return postApp<TimelineResult>('/api/app/timeline', { ...options }, 'Could not load your timeline. Please try again.');
}

/** Full Numerology (The Road) interpretations for the Numerology tab. */
export function requestNumerology(): Promise<NumerologyDetail> {
  return postApp<NumerologyDetail>('/api/app/numerology', {}, 'Could not load your numerology. Please try again.');
}

/** Universal Day and Personal Day numerology for the Today screen. */
export function requestDayNumerology(localDate: string): Promise<DayNumerology> {
  return postApp<DayNumerology>(
    '/api/app/day-numerology',
    { localDate },
    'Could not load today’s numerology. Please try again.',
  );
}

/** Full Vehicle (Human Design) interpretations for the Readings tab. */
export function requestVehicle(): Promise<VehicleDetail> {
  return postApp<VehicleDetail>('/api/app/vehicle', {}, 'Could not load your Human Design. Please try again.');
}

/**
 * Emails a fresh 6-digit code for the optional insights list.
 *
 * This and the next one are not app-data requests: they prove the person controls that email
 * address, so the lead id and the address are the point rather than a credential, and they do not
 * use the session token.
 */
export function requestOptInCode(leadId: number, email: string): Promise<void> {
  return postPublic<void>('/api/email-optin/send', { leadId, email }, 'We could not send the code. Please try again.');
}

/** Checks the emailed code. Only a correct code records the opt-in. */
export function confirmOptInCode(leadId: number, email: string, code: string): Promise<void> {
  return postPublic<void>('/api/email-optin/confirm', { leadId, email, code }, 'That code did not work. Please try again.');
}

/** One glossary entry ("tap any term"), with an "In your chart" line. */
export function requestExplain(id: string, premium = false): Promise<ExplainEntry> {
  return postApp<ExplainEntry>('/api/app/explain', { id, premium }, 'Could not load that explanation.');
}

/** Every glossary term, for the searchable Glossary screen. */
export async function requestGlossary(): Promise<GlossaryItem[]> {
  const data = await postApp<{ entries: GlossaryItem[] }>('/api/app/glossary', {}, 'Could not load the glossary.');
  return data.entries;
}

export interface TransitCardRequest {
  transiting: string;
  natal: string;
  aspect: string;
  nature: string;
  orb: number;
  peak: boolean;
  applying: boolean;
}

export function requestTransitCard(hit: TransitCardRequest): Promise<TransitCardData> {
  return postApp<TransitCardData>(
    '/api/app/transit-card',
    { ...hit },
    'Could not load that transit. Please try again.',
  );
}

export function requestStoplight(birthTimeKnown: boolean): Promise<StoplightDetail> {
  return postApp<StoplightDetail>(
    '/api/app/stoplight',
    { birthTimeKnown },
    'Could not load your astrology reading. Please try again.',
  );
}

export function requestTriadToday(localDate: string, at?: string): Promise<TriadToday> {
  return postApp<TriadToday>(
    '/api/app/triad-today',
    { localDate, ...(at ? { at, isToday: false } : {}) },
    'Could not build today’s reading. Please try again.',
  );
}

/** First-launch preview from a birth date alone. Nothing is saved, and no session is needed. */
export function requestBirthPreview(birthDate: string): Promise<BirthPreview> {
  return postPublic<BirthPreview>(
    '/api/app/preview',
    { birthDate },
    'Could not build your preview. Please try again.',
  );
}

/**
 * Deletes everything saved on the server for this person, and forgets the session token on this
 * phone. The server ends the session at its end too, so a token that is somehow still around
 * stops working at the same moment.
 */
export async function requestDeleteMyData(): Promise<{ removed: number; blanked: number }> {
  const result = await postApp<{ removed: number; blanked: number }>(
    '/api/app/delete-data',
    { confirm: true },
    'Could not delete your data. Please try again.',
  );
  await clearSessionToken();
  return result;
}

export function requestPractice(localDate: string): Promise<PracticeData> {
  return postApp<PracticeData>(
    '/api/app/practice',
    { localDate },
    'Could not load your practice. Please try again.',
  );
}

export function requestDecideTogether(
  localDate: string,
  youTimeKnown: boolean,
  partner: PartnerProfile,
): Promise<DecideTogether> {
  return postApp<DecideTogether>(
    '/api/app/decide-together',
    {
      localDate,
      youTimeKnown,
      partner: {
        label: partner.label,
        birthDate: partner.birthDate,
        birthTime: partner.birthTime,
        latitude: partner.latitude,
        longitude: partner.longitude,
        timezone: partner.timezone,
      },
    },
    'Could not build your reading. Please try again.',
  );
}

export interface PlaceCandidate {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffset: string | null;
}

/** Looking up a birth city happens during onboarding, before there is a session. */
/**
 * How a place is spelled for the lookup: "Harbor City, California", with the country sent
 * separately. GeoNames searches `${city}, ${country}`, so the state has to ride along with
 * the city or a name that repeats across states cannot be told apart — which is exactly the
 * Harbor City case. The website calculator composes it the same way.
 */
export function placeQuery(city: string, state?: string): string {
  return [city.trim(), state?.trim()].filter(Boolean).join(', ');
}

/**
 * Attaches an email address to the chart this phone already holds.
 *
 * Onboarding does not ask for one: the chart is shown first and the address given afterwards, if
 * at all. The server writes it against this session's own lead, so an address is never a way in.
 *
 * Attaches rather than replaces — a second call with the same address is a harmless retry, and a
 * different one is refused. `leadId` is absent on that retry, since nothing changed.
 */
export async function attachEmail(
  email: string,
  optIn: boolean,
): Promise<{ leadId?: number; optInCode: OptInCodeStatus }> {
  return postApp<{ leadId?: number; optInCode: OptInCodeStatus }>(
    '/api/app/email',
    { email: email.trim(), optIn },
    'Could not save your email. Please try again.',
  );
}

export async function requestPlaceCheck(
  city: string,
  country: string,
  birthDate: string,
  state?: string,
): Promise<PlaceCandidate[]> {
  const data = await postPublic<{ candidates: PlaceCandidate[] }>(
    '/api/app/place-check',
    { city: placeQuery(city, state), country, birthDate },
    'Could not look up that place. Please try again.',
  );
  return data.candidates;
}

/** What an invite link may show: the sender's first name (only if they agreed), Type, Life Path and Sun sign. */
export interface InvitePreview {
  firstName: string | null;
  type: string | null;
  lifePath: number | null;
  sunSign: string | null;
}

/** Makes a signed 30-day invite link for the person whose session this is. */
export function requestInviteCreate(
  showName: boolean,
  timeKnown: boolean,
): Promise<{ token: string; url: string }> {
  return postApp<{ token: string; url: string }>(
    '/api/app/invite',
    { action: 'create', showName, timeKnown },
    'We could not make the invite. Please try again.',
  );
}

/** Whoever opens an invite link has no session of their own, so this one is unsigned. */
export function requestInvitePreview(token: string): Promise<InvitePreview> {
  return postPublic<InvitePreview>('/api/app/invite', { action: 'preview', token }, 'This invite is no longer available.');
}

/**
 * Who is opening the invite. `{ saved: true }` means "use my own saved chart", which travels on the
 * session token rather than in the body; anyone else gives a birth date, with the time and place
 * optional.
 */
export type InviteViewer =
  | { saved: true }
  | { birthDate: string; birthTime: string | null; place: { latitude: number; longitude: number; timezone: string } | null };

export function requestInviteTogether(
  token: string, localDate: string, you: InviteViewer, youTimeKnown = true,
): Promise<DecideTogether> {
  const body = { action: 'together', token, localDate, youTimeKnown, you };
  const failure = 'Could not build your reading. Please try again.';
  // Someone reading the invite on their own chart is signed in; someone who typed a birth date is not.
  return 'saved' in you
    ? postApp<DecideTogether>('/api/app/invite', body, failure)
    : postPublic<DecideTogether>('/api/app/invite', body, failure);
}
