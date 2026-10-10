/**
 * POST /api/email-optin/send   { leadId, email }
 * Emails a fresh 6-digit code. Used by the "send a new code" button.
 */

import { NextResponse } from 'next/server';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';
import { issueOptInCode } from '@/server/optInCode';

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'optIn');
  if (limited) return limited;

  let body: { leadId?: unknown; email?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
  if (!Number.isInteger(body.leadId) || typeof body.email !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }

  const result = await issueOptInCode(body.leadId as number, body.email);
  if (result === 'not-found') {
    await noteAccessFailure(request);
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
  if (result === 'too-soon') {
    return NextResponse.json({ success: false, error: 'Please wait a minute before asking for another code.' }, { status: 429 });
  }
  if (result === 'failed') {
    return NextResponse.json({ success: false, error: 'We could not send the email. Please try again shortly.' }, { status: 502 });
  }
  return NextResponse.json({ success: true, status: result });
}
