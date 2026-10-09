/**
 * POST /api/app/event
 * Adds one to today's anonymous count for a screen. Takes no chart id or contact details and
 * stores nothing about the caller.
 *
 * Body: { event: "screen_today" }   (must be on the list in src/lib/app/events.ts)
 */

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { appEvents } from '@/server/db/schema';
import { isAppEvent } from '@/lib/app/events';
import { limitRequest } from '@/server/rateLimit';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'event');
  if (limited) return limited;
  try {
    let body: { event?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (!isAppEvent(body.event)) return NextResponse.json({ success: false }, { status: 400 });

    const day = new Date().toISOString().slice(0, 10);
    await db
      .insert(appEvents)
      .values({ day, event: body.event, count: 1 })
      .onConflictDoUpdate({ target: [appEvents.day, appEvents.event], set: { count: sql`${appEvents.count} + 1` } });
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error('[T3D Event Error]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
