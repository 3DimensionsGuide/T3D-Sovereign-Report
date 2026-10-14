/**
 * POST /api/app/sky-now
 * The T3D app's welcome screen: the Moon tonight. Public: it takes no body and no lead id,
 * saves nothing and logs nothing. It is rate limited.
 */

import { NextResponse } from 'next/server';
import { calculateDailySky, type NatalSkyPoints } from '@/server/engines/dailySky';
import { signOfLongitude, type SkyNow } from '@/lib/app/skyNow';
import { limitRequest } from '@/server/rateLimit';

// The natal points only feed the personal parts of the sky, which this route never returns.
const NO_NATAL: NatalSkyPoints = {
  sun: 0, moon: 0, mercury: 0, venus: 0, mars: 0, jupiter: 0, saturn: 0, ascendant: 0, midheaven: 0,
};

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'preview');
  if (limited) return limited;
  try {
    const { skyLongitudes, moon } = calculateDailySky(NO_NATAL, new Date());
    const data: SkyNow = {
      moonSign: signOfLongitude(skyLongitudes.moon),
      phase: moon.phase,
      waxing: moon.waxing,
      illuminationPercent: moon.illuminationPercent,
    };
    return NextResponse.json({ success: true, data }, { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Could not read the sky. Please try again.' }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
}
