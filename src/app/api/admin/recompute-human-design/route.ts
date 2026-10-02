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
 */
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { calculateHumanDesign } from '@/server/engines/human_design';

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

  const out: unknown[] = [];

  for (const row of rows) {
    const bd = row.birthData as BirthData;
    if (!bd?.date || !bd?.time || !bd?.place) {
      out.push({ leadId: row.id, email: row.email, error: 'birthData missing or malformed', birthData: row.birthData });
      continue;
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
      out.push({ leadId: row.id, email: row.email, error: `recomputation failed: ${(err as Error).message}` });
      continue;
    }

    const changedFields = diffFields(storedHD, freshHD);
    const matches = changedFields.length === 0;

    let applied = false;
    if (apply && !matches) {
      const newResults: HumanDesignResults = { ...results, humanDesign: freshHD };
      await db.update(leads)
        .set({ results: newResults as unknown as HumanDesignResults, updatedAt: new Date() })
        .where(eq(leads.id, row.id));
      applied = true;
    }

    out.push({
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
    });
  }

  return NextResponse.json({ matched: rows.length, mode: apply ? 'apply' : 'dry-run', leads: out }, { status: 200 });
}
