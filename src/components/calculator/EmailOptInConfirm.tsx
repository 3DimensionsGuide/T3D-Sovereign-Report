'use client';

/**
 * Asks for the 6-digit code emailed after someone ticks the marketing box.
 * The person is added to the list only when the right code is entered.
 * Results above and below are never held back by this step.
 */

import { useState } from 'react';
import { useT3DStore } from '@/store/useT3DStore';

type Phase = 'ask' | 'checking' | 'done' | 'skipped';

export default function EmailOptInConfirm() {
  const { results } = useT3DStore();
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<Phase>('ask');
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const status = results?.optInCode;
  if (!results || !results.email || (status !== 'sent' && status !== 'failed')) return null;
  if (phase === 'skipped') return null;

  const { leadId, email } = results;

  async function confirm() {
    setPhase('checking'); setMessage(null);
    try {
      const res = await fetch('/api/email-optin/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email, code }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) { setPhase('done'); return; }
      setMessage(json.error ?? 'Something went wrong. Please try again.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    }
    setPhase('ask');
  }

  async function sendNew() {
    setSending(true); setMessage(null);
    try {
      const res = await fetch('/api/email-optin/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email }),
      });
      const json = await res.json().catch(() => ({}));
      setMessage(res.ok && json.success ? 'A new code is on its way. Check your email.' : (json.error ?? 'Could not send a code.'));
    } catch {
      setMessage('Could not send a code. Please try again.');
    }
    setSending(false);
  }

  return (
    <section
      aria-labelledby="optin-title"
      style={{ border: '1px solid var(--card-border)', padding: 'clamp(16px,3vw,24px)', marginBottom: 32 }}
    >
      <h3 id="optin-title" className="t3d-label" style={{ color: 'var(--parchment)', marginBottom: 10 }}>
        {phase === 'done' ? 'EMAIL CONFIRMED' : 'CONFIRM YOUR EMAIL'}
      </h3>

      {phase === 'done' ? (
        <p className="t3d-body" style={{ fontSize: 14 }}>
          ✓ You are on the T3D list. Thank you.
        </p>
      ) : (
        <>
          <p className="t3d-body" style={{ fontSize: 14, marginBottom: 14 }}>
            {status === 'failed'
              ? 'We could not send your code yet. Press “Send a new code” to try again.'
              : `We emailed a 6-digit code to ${email}. Enter it to join the list. Your results below are yours either way.`}
          </p>
          <form
            onSubmit={e => { e.preventDefault(); if (code.trim()) void confirm(); }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <label htmlFor="optin-code" className="t3d-label" style={{ color: 'var(--parchment-40)' }}>CODE</label>
            <input
              id="optin-code" name="code" inputMode="numeric" autoComplete="one-time-code"
              maxLength={7} value={code} onChange={e => setCode(e.target.value)}
              style={{
                minHeight: 48, width: 140, padding: '0 12px', letterSpacing: 6, fontSize: 18,
                background: 'transparent', color: 'var(--parchment)',
                border: '1px solid var(--input-line)', borderRadius: 0,
              }}
            />
            <button type="submit" className="t3d-ghost" disabled={phase === 'checking' || !code.trim()}>
              {phase === 'checking' ? 'CHECKING…' : 'CONFIRM'}
            </button>
            <button type="button" className="t3d-ghost" onClick={sendNew} disabled={sending}>
              {sending ? 'SENDING…' : 'SEND A NEW CODE'}
            </button>
            <button type="button" className="t3d-ghost" onClick={() => setPhase('skipped')}>
              NOT NOW
            </button>
          </form>
        </>
      )}
      <p role="status" aria-live="polite" className="t3d-body" style={{ fontSize: 13, color: 'var(--parchment-70)', marginTop: 10, minHeight: 18 }}>
        {message}
      </p>
    </section>
  );
}
