/**
 * POST /api/app/invite
 * Invite someone to compare charts, without either person making an account.
 *
 * Actions (the body's "action" field):
 *
 *  create   { leadId, email, showName, timeKnown }
 *           The sender makes a signed 30-day link. It carries no birth data.
 *           -> { token, url }
 *
 *  preview  { token }
 *           What the page behind the link may show: the sender's first name (only if they agreed),
 *           Type, Life Path and Sun sign. Never a birth date, time or place.
 *           -> { firstName, type, lifePath, sunSign }
 *
 *  together { token, localDate, youTimeKnown?, you: { leadId, email } | { birthDate, birthTime, place } }
 *           The "you and them" reading. "you" is the person who opened the link: either their saved chart,
 *           or their birth date and birth place (required) with a birth time (null when they do not know it).
 *           Their details are used to calculate and then discarded: nothing is written to the database or
 *           to the logs, and the sender's birth details are never sent back.
 *           -> the same data as /api/app/decide-together
 *
 * A link stops working when it expires or when the sender deletes their data.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { computeTogether, type TogetherSide } from '@/server/togetherCompute';
import { checkInviteToken, makeInviteToken } from '@/server/inviteLinks';
import { isUnderMinimumAge, UNDER_AGE_MESSAGE } from '@/lib/ageGate';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';

const GONE = { success: false, error: 'This invite is no longer available. Ask your friend for a new one.' };
const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };
const BAD_YOU = { success: false, error: 'Please check your birth details and try again.' };

const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isNum = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const isTime = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/** A first name for display only: letters, marks, space, apostrophe, hyphen; at most 24 characters. */
function cleanFirstName(value: unknown): string | null {
  const raw = typeof value === 'string' ? value : '';
  const cleaned = raw.replace(/[^\p{L}\p{M} '’-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return cleaned || null;
}

interface LeadView {
  firstName: string;
  email: string;
  birth: { date?: string; time?: string; place?: { latitude?: number; longitude?: number; timezone?: string } } | null;
  results: {
    humanDesign?: { type?: string; authority?: string };
    numerology?: { lifePath?: number };
    astrology?: { tropicalSun?: { sign?: string } };
  } | null;
}

async function loadLead(id: number): Promise<LeadView | null> {
  const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  const lead = rows[0];
  if (!lead) return null;
  return {
    firstName: lead.firstName,
    email: lead.email,
    birth: lead.birthData as LeadView['birth'],
    results: lead.results as unknown as LeadView['results'],
  };
}

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // ---- create ----
    if (body.action === 'create') {
      const leadId = Number(body.leadId);
      const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
      if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
        return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
      }
      const lead = await loadLead(leadId);
      if (!lead || lead.email.toLowerCase().trim() !== email) {
        await noteAccessFailure(request);
        return NextResponse.json(NOT_FOUND, { status: 404 });
      }
      const token = makeInviteToken(leadId, { showName: body.showName === true, timeKnown: body.timeKnown !== false });
      if (!token) {
        return NextResponse.json({ success: false, error: 'Invites are not available right now.' }, { status: 503 });
      }
      const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
      return NextResponse.json({ success: true, data: { token, url: `${site}/i/${token}` } }, { headers: noStore });
    }

    // ---- preview and together both start from the token ----
    const check = checkInviteToken(body.token);
    if (!check.ok) {
      if (check.reason === 'invalid') await noteAccessFailure(request);
      return NextResponse.json(GONE, { status: check.reason === 'unconfigured' ? 503 : 404 });
    }
    const sender = await loadLead(check.leadId);
    if (!sender) return NextResponse.json(GONE, { status: 404 });

    if (body.action === 'preview') {
      return NextResponse.json(
        {
          success: true,
          data: {
            firstName: check.choices.showName ? cleanFirstName(sender.firstName) : null,
            type: sender.results?.humanDesign?.type ?? null,
            lifePath: sender.results?.numerology?.lifePath ?? null,
            sunSign: sender.results?.astrology?.tropicalSun?.sign ?? null,
          },
        },
        { headers: noStore },
      );
    }

    // ---- together ----
    if (body.action === 'together') {
      const localDate = body.localDate;
      if (!isDate(localDate)) {
        return NextResponse.json({ success: false, error: 'localDate must be YYYY-MM-DD' }, { status: 400 });
      }
      const senderBirth = sender.birth;
      if (!senderBirth?.date || !isDate(senderBirth.date)) {
        return NextResponse.json(GONE, { status: 404 });
      }
      const sp = senderBirth.place;
      const senderPlace = sp && isNum(sp.latitude, -90, 90) && isNum(sp.longitude, -180, 180) && typeof sp.timezone === 'string'
        ? { latitude: sp.latitude, longitude: sp.longitude, timezone: sp.timezone }
        : null;
      const them: TogetherSide = {
        label: check.choices.showName ? (cleanFirstName(sender.firstName) ?? 'Your friend') : 'Your friend',
        birthDate: senderBirth.date,
        birthTime: check.choices.timeKnown && isTime(senderBirth.time) ? senderBirth.time : null,
        place: senderPlace,
        saved: { type: sender.results?.humanDesign?.type ?? null, authority: sender.results?.humanDesign?.authority ?? null },
      };

      const y = body.you as {
        leadId?: unknown; email?: unknown; birthDate?: unknown; birthTime?: unknown;
        place?: { latitude?: unknown; longitude?: unknown; timezone?: unknown } | null;
      } | undefined;
      if (!y || typeof y !== 'object') return NextResponse.json(BAD_YOU, { status: 400 });

      let you: TogetherSide;
      if (y.leadId !== undefined) {
        // The viewer already has a chart: use it, after the same email check every app route makes.
        const viewerId = Number(y.leadId);
        const viewerEmail = typeof y.email === 'string' ? y.email.toLowerCase().trim() : '';
        if (!Number.isInteger(viewerId) || viewerId < 1 || !viewerEmail.includes('@')) {
          return NextResponse.json({ success: false, error: 'leadId and a valid email are required' }, { status: 400 });
        }
        const viewer = await loadLead(viewerId);
        if (!viewer || viewer.email.toLowerCase().trim() !== viewerEmail) {
          await noteAccessFailure(request);
          return NextResponse.json(NOT_FOUND, { status: 404 });
        }
        const vb = viewer.birth;
        if (!vb?.date || !isDate(vb.date)) {
          return NextResponse.json({ success: false, error: 'This chart is missing data. Please recalculate it.' }, { status: 422 });
        }
        const vp = vb.place;
        const viewerKnown = body.youTimeKnown !== false && isTime(vb.time);
        you = {
          label: 'You',
          birthDate: vb.date,
          birthTime: viewerKnown ? (vb.time as string) : null,
          place: vp && isNum(vp.latitude, -90, 90) && isNum(vp.longitude, -180, 180) && typeof vp.timezone === 'string'
            ? { latitude: vp.latitude, longitude: vp.longitude, timezone: vp.timezone }
            : null,
          saved: { type: viewer.results?.humanDesign?.type ?? null, authority: viewer.results?.humanDesign?.authority ?? null },
        };
      } else {
        // Someone without a chart gives their birth date and place (both required); the birth time may be
        // null when they do not know it, exactly as when they make a chart.
        if (!isDate(y.birthDate) || y.birthDate < '1900-01-01' || y.birthDate > localDate) {
          return NextResponse.json(BAD_YOU, { status: 400 });
        }
        if (isUnderMinimumAge(y.birthDate)) {
          return NextResponse.json({ success: false, error: UNDER_AGE_MESSAGE }, { status: 400 });
        }
        const pl = y.place;
        const place = pl && isNum(pl.latitude, -90, 90) && isNum(pl.longitude, -180, 180)
          && typeof pl.timezone === 'string' && DateTime.local().setZone(pl.timezone).isValid
          ? { latitude: pl.latitude, longitude: pl.longitude, timezone: pl.timezone }
          : null;
        if (!place || (y.birthTime !== null && y.birthTime !== undefined && !isTime(y.birthTime))) {
          return NextResponse.json(BAD_YOU, { status: 400 });
        }
        you = {
          label: 'You',
          birthDate: y.birthDate,
          birthTime: isTime(y.birthTime) ? y.birthTime : null,
          place,
        };
      }

      return NextResponse.json({ success: true, data: computeTogether(you, them, localDate) }, { headers: noStore });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    // Logs only the error, never the request body (it holds birth details).
    console.error('[T3D Invite Error]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
