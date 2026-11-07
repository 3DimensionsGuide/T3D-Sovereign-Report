/**
 * POST /api/app/glossary
 * The list of every glossary term (title and one-line summary) for the
 * app's searchable Glossary screen. Detail comes from /api/app/explain.
 *
 * Body: none.
 *
 * Auth: an Authorization: Bearer header carrying the app's session token. See
 * src/server/appAuth.ts — there is no email address in any app request any more.
 */

import { NextResponse } from 'next/server';
import { listEntries } from '@/lib/app/glossary';
import { limitRequest } from '@/server/rateLimit';
import { authenticateApp } from '@/server/appAuth';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    const auth = await authenticateApp(request);
    if (!auth.ok) return auth.response;
    return NextResponse.json(
      { success: true, data: { entries: listEntries() } },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Glossary Error]', error);
    return NextResponse.json({ success: false, error: 'Could not load the glossary. Please try again.' }, { status: 500 });
  }
}
