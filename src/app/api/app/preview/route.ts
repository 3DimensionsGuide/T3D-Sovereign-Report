/**
 * POST /api/app/preview
 * The T3D app's first screen: a taste of the reading from a birth date alone.
 *
 * Body: { birthDate: "YYYY-MM-DD" }
 *
 * Nothing is saved, nothing about the date is logged, and there is no lead id,
 * so this route has no chart to protect. It is rate limited, and it refuses
 * birth dates under the minimum age.
 */

import { NextResponse } from 'next/server';
import { calculateAstrology } from '@/server/engines/astrology';
import { calculateLifePath } from '@/server/engines/numerology';
import { buildBirthPreview } from '@/lib/app/preview';
import { isUnderMinimumAge, UNDER_AGE_MESSAGE } from '@/lib/ageGate';
import { limitRequest } from '@/server/rateLimit';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'preview');
  if (limited) return limited;
  try {
    let body: { birthDate?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const birthDate = typeof body.birthDate === 'string' ? body.birthDate : '';
    const parsed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    const year = parsed ? Number(parsed[1]) : 0;
    if (!parsed || year < 1900 || year > new Date().getFullYear() || Number.isNaN(Date.parse(birthDate))) {
      return NextResponse.json({ success: false, error: 'Please enter a valid birth date.' }, { status: 400 });
    }
    if (isUnderMinimumAge(birthDate)) {
      return NextResponse.json({ success: false, error: UNDER_AGE_MESSAGE }, { status: 400 });
    }

    const sky = calculateAstrology({
      birthDate, birthTime: '12:00', latitude: 0, longitude: 0, timezone: 'UTC',
    });
    const preview = buildBirthPreview(calculateLifePath(birthDate), sky.tropical.sun.longitude);
    if (!preview) {
      return NextResponse.json({ success: false, error: 'We could not build a preview. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: preview });
  } catch {
    return NextResponse.json({ success: false, error: 'We could not build a preview. Please try again.' }, { status: 500 });
  }
}
