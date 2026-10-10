/**
 * POST /api/email-optin/confirm   { leadId, email, code }
 * Checks the emailed code. Only a correct code records the marketing opt-in.
 */

import { NextResponse } from 'next/server';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';
import { confirmOptInCode } from '@/server/optInCode';

const MESSAGES: Record<string, string> = {
  wrong: 'That code is not right. Please check it and try again.',
  expired: 'That code has expired. Please ask for a new one.',
  locked: 'Too many wrong tries. Please ask for a new code.',
  none: 'There is no code waiting. Please ask for a new one.',
  unconfigured: 'Confirmation is not available right now. Please try again later.',
};

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'optIn');
  if (limited) return limited;

  let body: { leadId?: unknown; email?: unknown; code?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
  if (!Number.isInteger(body.leadId) || typeof body.email !== 'string' || typeof body.code !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }

  const result = await confirmOptInCode(body.leadId as number, body.email, body.code);
  if (result === 'ok' || result === 'already-opted-in') return NextResponse.json({ success: true });
  if (result === 'not-found') {
    await noteAccessFailure(request);
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
  return NextResponse.json({ success: false, error: MESSAGES[result] ?? 'Please try again.' }, { status: 400 });
}
