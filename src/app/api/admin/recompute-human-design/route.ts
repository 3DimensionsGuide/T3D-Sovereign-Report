/**
 * ADMIN — Recompute a lead's stored Human Design result
 *
 * The Advanced/Sovereign Report generator never recomputes a chart at
 * render time — it reads lead.results.humanDesign straight out of the
 * DB, which was written once, at the moment the calculator originally
 * ran (see /api/calculate-t3d, which stores calculateHumanDesign()'s
 * full return value verbatim). A lead calculated before a fix to that
 * engine landed keeps the old, now-incorrect result forever, even
 * though the live calculator — which always runs current code — gives
 * the right answer for the exact same birth data.
 *
 * This surfaced concretely: a buyer's Advanced Sovereign Report showed
 * a Human Design Profile that didn't match what the live site
 * calculator computes for the same birth data — a stale stored record,
 * not a live calculation bug.
 *
 * This route exists as a browser-triggerable version of
 * scripts/recompute-human-design.ts: that script only reaches whatever
 * database DATABASE_URL points to wherever it's *run*, and a real
 * buyer's lead lives in the PRODUCTION database — not the local dev
 * one most of this codebase is built against. Deployed, this route
 * runs with the production DATABASE_URL automatically, so hitting its
 * URL in a browser reaches the real record.
 *
 * SECURITY: this can both read a buyer's full chart data and write to
 * the leads table, so it's gated behind ADMIN_RECOMPUTE_SECRET — set
 * that env var (any long random string) in the deployment's
 * environment variables before this route will do anything. Without a
 * matching ?secret=, every request gets a 401 and nothing is read or
 * written.
 *
 * Usage (replace YOUR_SECRET with the value of ADMIN_RECOMPUTE_SECRET):
 *
 *   Dry run — shows the stored vs. freshly-computed diff, writes nothing:
 *     /api/admin/recompute-human-design?email=someone@example.com&secret=YOUR_SECRET
 *     /api/admin/recompute-human-design?id=8&secret=YOUR_SECRET
 *
 *   Apply — overwrites results.humanDesign with the fresh value for
 *   every matching lead where it actually differs. Never touches
 *   results.astrology or results.numerology.
 *     /api/admin/recompute-human-design?email=someone@example.com&secret=YOUR_SECRET&apply=true
 *
 * RELOCATE MODE (?relocate=true) — a different, more serious repair.
 * Some early leads were written while GEONAMES_USERNAME wasn't set in
 * this deployment's environment, which makes /api/calculate-t3d's
 * geocoding step silently fall back to New York City coordinates (see
 * @/server/geocoding) instead of failing loudly. That doesn't just make
 * the stored Human Design result wrong — it makes the stored ASTROLOGY
 * result wrong too, since both read the same birthPlace coordinates.
 * Fixing it means re-geocoding the lead's stored city/country, writing
 * the corrected coordinates back into birthData.place, and recomputing
 * both results.humanDesign and results.astrology against those
 * corrected coordinates (results.numerology is untouched either way —
 * it's derived from name and birth date only, never location).
 *
 *   Dry run — re-geocodes the stored city/country and shows what would
 *   change (coordinates, timezone, and the resulting HD profile), writes
 *   nothing:
 *     /api/admin/recompute-human-design?id=2&secret=YOUR_SECRET&relocate=true
 *
 *   Apply — writes the corrected birthData.place plus freshly computed
 *   results.humanDesign and results.astrology:
 *     /api/admin/recompute-human-design?id=2&secret=YOUR_SECRET&relocate=true&apply=true
 */
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import type { Lead } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { calculateHumanDesign } from '@/server/engines/human_design';
import { calculateAstrology } from '@/server/engines/astrology';
import { resolveGeoAndTimezone } from '@/server/geocoding';

type BirthData = {
  date: string;
  time: string;
  place: { city: string; country: string; latitude: number; longitude: number; timezone: string };
};

type HumanDesignResults = {
  astrology: Record<string, unknown>;
  numerology: Record<string, unknown>;
  humanDesign: Record<string, unknown>;
};

// Plain JSON.stringify compares by key INSERTION order, not value --
// {a:1,b:2} and {b:2,a:1} stringify to different text despite being the
// same object, and that's exactly the shape stored.results.humanDesign
// vs. a freshly recomputed one take (different code paths built the same
// gate/channel objects with their keys in different order). Sort keys
// recursively before comparing so this only flags an actual value
// difference, not key order.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function diffFields(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(oldObj ?? {}), ...Object.keys(newObj ?? {})]);
  const changed: string[] = [];
  for (const key of keys) {
    if (stableStringify(oldObj?.[key]) !== stableStringify(newObj?.[key])) changed.push(key);
  }
  return changed;
}

// A lead's coordinates are "the same place" for repair purposes if
// they're within ~11 meters (0.0001 degrees) of each other -- re-querying
// the same city name against GeoNames twice should return identical
// results, but this avoids flagging a repair as needed over float noise.
const SAME_LOCATION_EPSILON = 0.0001;

async function handleRelocate(
  row: Lead,
  apply: boolean,
): Promise<Record<string, unknown>> {
  const bd = row.birthData as BirthData;
  if (!bd?.date || !bd?.time || !bd?.place?.city || !bd?.place?.country) {
    return { leadId: row.id, email: row.email, error: 'birthData missing or malformed', birthData: row.birthData };
  }

  let regeocoded: { latitude: number; longitude: number; timezone: string };
  try {
    regeocoded = await resolveGeoAndTimezone(bd.place.city, bd.place.country, bd.date);
  } catch (err) {
    return { leadId: row.id, email: row.email, error: `re-geocoding failed: ${(err as Error).message}` };
  }

  const samePlace =
    Math.abs(regeocoded.latitude  - bd.place.latitude)  < SAME_LOCATION_EPSILON &&
    Math.abs(regeocoded.longitude - bd.place.longitude) < SAME_LOCATION_EPSILON &&
    regeocoded.timezone === bd.place.timezone;

  const base = {
    leadId: row.id,
    name: `${row.firstName} ${row.lastName}`,
    email: row.email,
    createdAt: row.createdAt,
    storedPlace: bd.place,
    regeocodedPlace: regeocoded,
  };

  if (samePlace) {
    return {
      ...base,
      samePlace: true,
      applied: false,
      note: 'Re-geocoding this lead\'s stored city/country returns the same coordinates already on file — no relocation needed.',
    };
  }

  const results = (row.results ?? { astrology: {}, numerology: {}, humanDesign: {} }) as HumanDesignResults;

  let freshHD: Record<string, unknown>;
  let freshAstrology: Record<string, unknown>;
  try {
    const engineInput = {
      birthDate: bd.date,
      birthTime: bd.time,
      latitude:  regeocoded.latitude,
      longitude: regeocoded.longitude,
      timezone:  regeocoded.timezone,
    };
    freshHD = calculateHumanDesign(engineInput) as unknown as Record<string, unknown>;
    freshAstrology = calculateAstrology(engineInput) as unknown as Record<string, unknown>;
  } catch (err) {
    return { ...base, samePlace: false, error: `recomputation failed: ${(err as Error).message}` };
  }

  let applied = false;
  if (apply) {
    const newBirthData: BirthData = {
      ...bd,
      place: { ...bd.place, ...regeocoded },
    };
    const newResults: HumanDesignResults = { ...results, humanDesign: freshHD, astrology: freshAstrology };
    await db.update(leads)
      .set({ birthData: newBirthData, results: newResults, updatedAt: new Date() })
      .where(eq(leads.id, row.id));
    applied = true;
  }

  return {
    ...base,
    samePlace: false,
    storedProfile: (results.humanDesign ?? {})['profile'],
    freshProfile: freshHD['profile'],
    storedIncarnationCross: (results.humanDesign ?? {})['incarnationCross'],
    freshIncarnationCross: freshHD['incarnationCross'],
    applied,
    note: apply
      ? 'birthData.place, results.humanDesign, and results.astrology were all updated to the re-geocoded coordinates. results.numerology was left untouched (it never depends on location).'
      : 'Coordinates differ from what\'s stored — add &apply=true to write the correction (updates birthData.place, results.humanDesign, and results.astrology).',
  };
}

async function handleRecompute(
  row: Lead,
  apply: boolean,
): Promise<Record<string, unknown>> {
  const bd = row.birthData as BirthData;
  if (!bd?.date || !bd?.time || !bd?.place) {
    return { leadId: row.id, email: row.email, error: 'birthData missing or malformed', birthData: row.birthData };
  }

  const results = (row.results ?? { astrology: {}, numerology: {}, humanDesign: {} }) as HumanDesignResults;
  const storedHD = results.humanDesign ?? {};

  let freshHD: Record<string, unknown>;
  try {
    freshHD = calculateHumanDesign({
      birthDate: bd.date,
      birthTime: bd.time,
      latitude: bd.place.latitude,
      longitude: bd.place.longitude,
      timezone: bd.place.timezone,
    }) as unknown as Record<string, unknown>;
  } catch (err) {
    return { leadId: row.id, email: row.email, error: `recomputation failed: ${(err as Error).message}` };
  }

  const changedFields = diffFields(storedHD, freshHD);
  const matches = changedFields.length === 0;

  let applied = false;
  if (apply && !matches) {
    const newResults: HumanDesignResults = { ...results, humanDesign: freshHD };
    await db.update(leads)
      .set({ results: newResults, updatedAt: new Date() })
      .where(eq(leads.id, row.id));
    applied = true;
  }

  return {
    leadId: row.id,
    name: `${row.firstName} ${row.lastName}`,
    email: row.email,
    createdAt: row.createdAt,
    birthData: bd,
    matches,
    changedFields,
    stored: storedHD,
    fresh: freshHD,
    applied,
    note: matches
      ? 'Stored results.humanDesign already agrees with the current engine — no change needed.'
      : apply
        ? 'results.humanDesign updated. astrology and numerology were left untouched.'
        : 'Mismatch found but not applied — add &apply=true to write it.',
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const expected = process.env.ADMIN_RECOMPUTE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_RECOMPUTE_SECRET is not set in this deployment\'s environment variables.' },
      { status: 500 },
    );
  }
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: 'Missing or incorrect secret.' }, { status: 401 });
  }

  const emailParam = url.searchParams.get('email');
  const idParam = url.searchParams.get('id');
  const apply = url.searchParams.get('apply') === 'true';
  const relocate = url.searchParams.get('relocate') === 'true';

  if (!emailParam && !idParam) {
    return NextResponse.json(
      { error: 'Pass ?email=<email> or ?id=<leadId> to identify the lead.' },
      { status: 400 },
    );
  }

  const rows = idParam
    ? await db.select().from(leads).where(eq(leads.id, Number(idParam)))
    : await db.select().from(leads).where(eq(leads.email, emailParam!.toLowerCase().trim()));

  if (rows.length === 0) {
    return NextResponse.json({ matched: 0, leads: [] }, { status: 200 });
  }

  const out: Record<string, unknown>[] = [];
  for (const row of rows) {
    out.push(relocate ? await handleRelocate(row, apply) : await handleRecompute(row, apply));
  }

  return NextResponse.json(
    { matched: rows.length, mode: `${relocate ? 'relocate' : 'recompute'}/${apply ? 'apply' : 'dry-run'}`, leads: out },
    { status: 200 },
  );
}
