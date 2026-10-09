/**
 * GET /api/health
 * Says whether the live site can still calculate correctly and reach its database.
 * Safe to call from an uptime monitor. It returns no personal data and no secrets.
 *
 *   200  { ok: true,  engine: 'ok',       database: 'ok' }
 *   503  { ok: false, engine: 'mismatch', database: 'ok' }  (numbers differ from the reference charts)
 */

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { checkEngine } from '@/server/healthCheck';
import { limitRequest } from '@/server/rateLimit';

export const dynamic = 'force-dynamic';

async function checkDatabase(): Promise<'ok' | 'error'> {
  try {
    const { db } = await import('@/server/db');
    await db.execute(sql`select 1`);
    return 'ok';
  } catch (error: unknown) {
    console.error('[Health] Database check failed:', error instanceof Error ? error.message : 'unknown');
    return 'error';
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'health');
  if (limited) return limited;

  const engine = checkEngine();
  const database = await checkDatabase();
  if (engine.misses.length > 0) console.error('[Health] Numbers differ from the reference charts:', engine.misses.join(', '));

  const ok = engine.status === 'ok' && database === 'ok';
  return NextResponse.json(
    {
      ok,
      engine: engine.status,
      database,
      version: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
    },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
