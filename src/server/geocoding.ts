/**
 * Shared geocoding + timezone resolution for birth-place lookups.
 *
 * Used at calculator-submission time (POST /api/calculate-t3d) when the caller did not already
 * supply coordinates, and by the admin repair route (GET /api/admin/recompute-human-design, the
 * `relocate=true` mode) when fixing a lead whose coordinates were wrong when it was created.
 *
 * Nothing here ever guesses a place. This used to answer with New York City whenever
 * GEONAMES_USERNAME was missing, which is how several of T3D's own early leads were written with
 * the wrong coordinates — a wrong birth place moves the ascendant, all twelve houses and the Human
 * Design design epoch, and nothing in the output says so. It now throws, the way
 * lookupPlaceCandidates below always has, and the routes turn that into something the person can
 * act on. A chart that fails to appear is recoverable; a chart that is quietly wrong is not.
 *
 * Register a free username at geonames.org and enable "free web services" under Manage Account.
 * Without one, birth places can only be resolved by the app's confirm-your-place step, which sends
 * coordinates directly.
 *
 * Results are cached in the `places` table. Somewhere's coordinates and time zone do not change, so
 * a place is looked up once and then read from the database — GeoNames' free tier has hourly and
 * daily credit ceilings, and before this a single chart spent two of them. The cache is never
 * load-bearing: if the database cannot be read or written, the lookup simply happens again.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { places } from '@/server/db/schema';

/** No GeoNames account configured, or the service could not be reached. Worth retrying. */
export const PLACE_LOOKUP_UNAVAILABLE = 'PLACE_LOOKUP_UNAVAILABLE';
/** GeoNames answered, and knows of no such place. Retrying will not help; the spelling is wrong. */
export const PLACE_NOT_FOUND = 'PLACE_NOT_FOUND';

/** How long to wait on GeoNames before giving up, so a slow lookup cannot hold a calculation open. */
const LOOKUP_TIMEOUT_MS = 8000;

export interface GeoResult {
  latitude:  number;
  longitude: number;
  timezone:  string;
}

/**
 * The cache key for a city and country.
 *
 * The same place typed with different capitals or spacing is the same place, so those are folded
 * together. Accents are left alone: "Sao Paulo" and "São Paulo" are different questions to ask
 * GeoNames, and this cache does not presume to answer one with the other's result.
 */
export function placeCacheKey(city: string, country: string): string {
  const tidy = (s: string) => s.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
  return `${tidy(city)}|${tidy(country)}`;
}

/** A place already looked up, or null. Never throws: a cache that is down is a cache that is empty. */
async function readCachedPlace(key: string): Promise<GeoResult | null> {
  try {
    const rows = await db.select().from(places).where(eq(places.query, key)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { latitude: row.latitude, longitude: row.longitude, timezone: row.timezone };
  } catch (error: unknown) {
    console.error('[T3D Geocoding] Could not read the place cache:', error instanceof Error ? error.message : 'unknown');
    return null;
  }
}

/** Remembers a place. Never throws: failing to cache is not failing to geocode. */
async function cachePlace(key: string, label: string, geo: GeoResult): Promise<void> {
  try {
    await db
      .insert(places)
      .values({ query: key, label, ...geo })
      .onConflictDoUpdate({
        target: places.query,
        set: { label, ...geo, updatedAt: new Date() },
      });
  } catch (error: unknown) {
    console.error('[T3D Geocoding] Could not write the place cache:', error instanceof Error ? error.message : 'unknown');
  }
}

interface GeoNamesPlace {
  lat: string;
  lng: string;
  name: string;
  adminName1?: string;
  countryName?: string;
  timezone?: { timeZoneId?: string };
}

/**
 * One GeoNames call for coordinates and time zone together.
 *
 * `style=FULL` returns the time zone alongside the coordinates, so this no longer needs a second
 * call to timezoneJSON — halving what a chart costs against the free tier's ceilings, and removing
 * a second thing that can fail halfway.
 *
 * `featureClass=P` restricts the answer to populated places, which is what a birth place always is.
 * Without it a search can land on a mountain or a river that happens to share the name. It also
 * makes this agree with lookupPlaceCandidates below, so the place the server calculates from is
 * drawn from the same set as the ones the app offered the person to confirm.
 */
async function geocodeFromGeoNames(city: string, country: string, username: string): Promise<{ geo: GeoResult; label: string }> {
  const url = new URL('https://secure.geonames.org/searchJSON');
  url.searchParams.set('q', `${city}, ${country}`);
  url.searchParams.set('maxRows', '1');
  url.searchParams.set('featureClass', 'P');
  url.searchParams.set('style', 'FULL');
  url.searchParams.set('username', username);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  let data: { geonames?: GeoNamesPlace[]; status?: { message: string; value: number } };
  try {
    const res = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
    data = await res.json() as typeof data;
  } catch (error: unknown) {
    // A refused connection, a timeout, or a body that is not JSON. All of them are "ask again later".
    console.error('[T3D Geocoding] GeoNames could not be reached:', error instanceof Error ? error.message : 'unknown');
    throw new Error(PLACE_LOOKUP_UNAVAILABLE);
  } finally {
    clearTimeout(timer);
  }

  if (data.status) {
    // Out of credits, a bad username, an account without web services enabled.
    console.error('[T3D Geocoding] GeoNames refused the lookup:', data.status.message);
    throw new Error(PLACE_LOOKUP_UNAVAILABLE);
  }

  const hit = data.geonames?.[0];
  const latitude = Number.parseFloat(hit?.lat ?? '');
  const longitude = Number.parseFloat(hit?.lng ?? '');
  const timezone = hit?.timezone?.timeZoneId;
  if (!hit || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
    throw new Error(PLACE_NOT_FOUND);
  }

  const label = [hit.name, hit.adminName1 && hit.adminName1 !== hit.name ? hit.adminName1 : null, hit.countryName]
    .filter(Boolean)
    .join(', ');

  return { geo: { latitude, longitude, timezone }, label };
}

/**
 * The coordinates and IANA time zone for a birth place.
 *
 * @throws PLACE_NOT_FOUND          GeoNames knows of no such place; the spelling is wrong.
 * @throws PLACE_LOOKUP_UNAVAILABLE no account configured, or GeoNames could not be reached.
 *
 * The birth date is accepted for interface parity and deliberately unused: the IANA identifier is
 * what the caller needs, and resolving it to an offset for a particular date is
 * src/server/localInstant.ts's job, which it does from the zone's own history.
 */
export async function resolveGeoAndTimezone(
  city: string,
  country: string,
  birthDate: string,
): Promise<GeoResult> {
  void birthDate;

  const key = placeCacheKey(city, country);
  const cached = await readCachedPlace(key);
  if (cached) return cached;

  const username = process.env.GEONAMES_USERNAME;
  if (!username) {
    console.error('[T3D Geocoding] No GEONAMES_USERNAME is set, so birth places cannot be looked up.');
    throw new Error(PLACE_LOOKUP_UNAVAILABLE);
  }

  const { geo, label } = await geocodeFromGeoNames(city, country, username);
  await cachePlace(key, label, geo);
  return geo;
}

// ─── PLACE CANDIDATES (for the app's "confirm your birth place" step) ─────────

export interface PlaceCandidate {
  label:     string;
  latitude:  number;
  longitude: number;
  timezone:  string;
}

/**
 * Up to three populated-place matches for a city and country, with the
 * coordinates and IANA time zone each one would use. The app shows these back
 * to the person to confirm before anything is calculated.
 *
 * Like resolveGeoAndTimezone, this never guesses: if the lookup service isn't configured it throws
 * PLACE_LOOKUP_UNAVAILABLE so the app can say so instead of using the wrong place.
 */
export async function lookupPlaceCandidates(city: string, country: string): Promise<PlaceCandidate[]> {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) throw new Error(PLACE_LOOKUP_UNAVAILABLE);

  const url = new URL('https://secure.geonames.org/searchJSON');
  url.searchParams.set('q', `${city}, ${country}`);
  url.searchParams.set('maxRows', '6');
  url.searchParams.set('featureClass', 'P');
  url.searchParams.set('style', 'FULL');
  url.searchParams.set('username', username);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  let data: { geonames?: GeoNamesPlace[]; status?: { message: string; value: number } };
  try {
    const res = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
    data = await res.json() as typeof data;
  } catch {
    throw new Error(PLACE_LOOKUP_UNAVAILABLE);
  } finally {
    clearTimeout(timer);
  }
  if (data.status) throw new Error(PLACE_LOOKUP_UNAVAILABLE);

  const out: PlaceCandidate[] = [];
  const seen = new Set<string>();
  for (const g of data.geonames ?? []) {
    const latitude = parseFloat(g.lat);
    const longitude = parseFloat(g.lng);
    const timezone = g.timezone?.timeZoneId;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) continue;
    const label = [g.name, g.adminName1 && g.adminName1 !== g.name ? g.adminName1 : null, g.countryName]
      .filter(Boolean)
      .join(', ');
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, latitude, longitude, timezone });
    if (out.length === 3) break;
  }
  return out;
}
