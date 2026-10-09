/**
 * POST /api/app/numerology
 * The Numerology ("The Road") screen: every number in the person's chart with
 * the full interpretation from the T3D reports — Life Path, Birthday, Attitude,
 * Destiny, Soul Urge, Personality, Hidden Passion, Karmic Lessons, and the
 * four Pinnacles and Challenges with the one active now.
 *
 * Body: { leadId: number, email: string }
 *
 * Same access rule as the other app routes (id must pair with the lead's
 * email; identical 404 otherwise). The interpretation writing never ships in
 * the app bundle: it is served from here, and `locked` is the single switch
 * for gating sections behind a purchase later.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import type { NumerologyCycle, NumerologyResult } from '@/server/engines/types';
import { computeAttitude, computeBirthday, computeLifePath } from '@/lib/report/schema/normalize';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';
import {
  ATTITUDE_DESCRIPTIONS,
  BIRTHDAY_DESCRIPTIONS,
  CHALLENGE_THEMES,
  LIFE_PATH_CONTENT,
  PINNACLE_THEMES,
} from '@/lib/report/section4/road-content';
import {
  CHALLENGE_CONTENT,
  DESTINY_CONTENT,
  HIDDEN_PASSION_CONTENT,
  HIDDEN_PASSION_MECHANISM,
  INNER_DRIVERS_MECHANISM,
  KARMIC_LESSON_CONTENT,
  KARMIC_LESSONS_MECHANISM,
  PERSONALITY_CONTENT,
  PINNACLE_CONTENT,
  SOUL_URGE_CONTENT,
  getPinnacleChallengeInteraction,
} from '@/lib/report/advanced/road/road-content';

interface NumerologyRequest {
  leadId?: unknown;
  email?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

/** Flip a section to true here (per person, once purchases exist) to lock it. */
const SECTIONS_LOCKED = false;

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isCycles(value: unknown): value is NumerologyCycle[] {
  return (
    Array.isArray(value) &&
    value.length >= 4 &&
    value.every((c) => c && isNumber((c as NumerologyCycle).number) && isNumber((c as NumerologyCycle).startAge))
  );
}

function birthday(birthDate: string, age: number): Date {
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y + age, m - 1, d));
}

function ageToday(birthDate: string): number {
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  if (now.getTime() < Date.UTC(now.getUTCFullYear(), m - 1, d)) age -= 1;
  return age;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: NumerologyRequest;
    try {
      body = (await request.json()) as NumerologyRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'leadId and a valid email are required' },
        { status: 400 },
      );
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const num = (lead.results as unknown as { numerology?: Partial<NumerologyResult> } | null)?.numerology;
    const birthDate = (lead.birthData as { date?: string } | null)?.date;
    if (
      !num ||
      !birthDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !isNumber(num.lifePath) ||
      !isNumber(num.destiny) ||
      !isNumber(num.soulUrge) ||
      !isNumber(num.personality) ||
      !isNumber(num.hiddenPassion) ||
      !Array.isArray(num.karmicLessons) ||
      !isCycles(num.pinnacles) ||
      !isCycles(num.challenges)
    ) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const lp = computeLifePath(birthDate);
    const bd = computeBirthday(birthDate);
    const att = computeAttitude(birthDate);
    const locked = SECTIONS_LOCKED;

    const age = ageToday(birthDate);
    const currentIdx = Math.max(
      0,
      num.pinnacles.findIndex((c) => age >= c.startAge && (c.endAge == null || age < c.endAge)),
    );

    const dateOf = (cycle: NumerologyCycle) => ({
      startsOn: birthday(birthDate, cycle.startAge).toISOString().slice(0, 10),
      endsOn: cycle.endAge == null ? null : birthday(birthDate, cycle.endAge).toISOString().slice(0, 10),
    });

    const pinnacles = num.pinnacles.map((c, i) => {
      const content = PINNACLE_CONTENT[c.number];
      return {
        label: c.label,
        number: c.number,
        startAge: c.startAge,
        endAge: c.endAge,
        ...dateOf(c),
        current: i === currentIdx,
        theme: PINNACLE_THEMES[c.number]?.theme ?? null,
        terrain: PINNACLE_THEMES[c.number]?.terrain ?? null,
        coreMandate: content?.coreMandate ?? null,
        phase: content?.phases?.[i] ?? null,
      };
    });

    const challenges = num.challenges.map((c, i) => {
      const content = CHALLENGE_CONTENT[c.number];
      const theme = CHALLENGE_THEMES[c.number];
      return {
        label: c.label,
        number: c.number,
        startAge: c.startAge,
        endAge: c.endAge,
        ...dateOf(c),
        current: i === currentIdx,
        terrain: theme?.terrain ?? null,
        skill: theme?.skill ?? null,
        reframe: theme?.reframe ?? null,
        test: content?.test ?? null,
        key: content?.key ?? null,
      };
    });

    const karmic = [...num.karmicLessons].sort((a, b) => a - b).map((n) => ({
      number: n,
      theme: KARMIC_LESSON_CONTENT[n]?.theme ?? null,
      practice: KARMIC_LESSON_CONTENT[n]?.practice ?? null,
    }));

    const data = {
      locked,
      lifePath: {
        display: lp.display,
        number: num.lifePath,
        content: LIFE_PATH_CONTENT[num.lifePath] ?? null,
      },
      birthday: {
        display: bd.display,
        number: bd.number,
        // Birthday descriptions are keyed by the day of the month (1-31).
        description:
          BIRTHDAY_DESCRIPTIONS[Number(birthDate.split('-')[2])] ?? BIRTHDAY_DESCRIPTIONS[bd.number] ?? null,
      },
      attitude: {
        display: att.display,
        number: att.number,
        description: ATTITUDE_DESCRIPTIONS[att.number] ?? ATTITUDE_DESCRIPTIONS[att.number % 9 || 9] ?? null,
      },
      innerDrivers: {
        mechanism: INNER_DRIVERS_MECHANISM,
        destiny: { number: num.destiny, content: DESTINY_CONTENT[num.destiny] ?? null },
        soulUrge: { number: num.soulUrge, content: SOUL_URGE_CONTENT[num.soulUrge] ?? null },
        personality: { number: num.personality, content: PERSONALITY_CONTENT[num.personality] ?? null },
      },
      hiddenPassion: {
        mechanism: HIDDEN_PASSION_MECHANISM,
        number: num.hiddenPassion,
        content: HIDDEN_PASSION_CONTENT[num.hiddenPassion] ?? null,
      },
      karmicLessons: { mechanism: KARMIC_LESSONS_MECHANISM, items: karmic },
      pinnacles,
      challenges,
      interplay: getPinnacleChallengeInteraction(
        num.pinnacles[currentIdx]!.number,
        num.challenges[currentIdx]!.number,
      ),
      nameNote:
        'Destiny, Soul Urge, Personality, Hidden Passion and Karmic Lessons are read from your full birth name, including any middle names.',
    };

    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Numerology Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not load your numerology. Please try again.' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
