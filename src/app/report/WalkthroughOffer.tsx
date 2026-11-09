'use client';

/**
 * Shown on /report once a report has been delivered: an offer to have it walked through.
 *
 * Asks rather than sells. The button sends a request and nothing is charged — a person reads it
 * and answers. That is not a smaller version of a checkout, it is the honest shape for something
 * one person records by hand: taking money first would promise work before anyone had agreed to
 * it, and the turnaround would be a guess.
 *
 * Hidden entirely until the offer has a price. See src/lib/walkthrough.ts.
 */

import { useState } from 'react';
import { WALKTHROUGH, walkthroughAvailable } from '@/lib/walkthrough';

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function WalkthroughOffer({ leadId }: { leadId: number }) {
  const [state, setState] = useState<State>('idle');
  const [note, setNote] = useState('');

  if (!walkthroughAvailable()) return null;

  async function send() {
    setState('sending');
    try {
      const res = await fetch('/api/walkthrough-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, note: note.trim() || undefined }),
      });
      const json = await res.json();
      setState(json.success ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="t3d-card" style={{ marginTop: 40, padding: 'clamp(28px,4vw,40px)', textAlign: 'left' }}>
      <p className="t3d-label" style={{ color: 'var(--emerald)', marginBottom: 14 }}>
        [WALK ME THROUGH IT] — {WALKTHROUGH.priceLabel}
      </p>

      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(1.4rem,3vw,1.9rem)',
        fontWeight: 400,
        color: 'var(--parchment)',
        lineHeight: 1.2,
        marginBottom: 14,
      }}>
        Would it help to be shown around it?
      </p>

      <p className="t3d-body" style={{ marginBottom: 14, maxWidth: '52ch' }}>
        A recording of about {WALKTHROUGH.minutes} minutes, made for your report and nobody
        else&apos;s — what the three systems are saying, where they agree, and the parts people
        most often read the wrong way round. Yours to keep, {WALKTHROUGH.turnaround}.
      </p>

      <p className="t3d-body" style={{ marginBottom: 20, maxWidth: '52ch', fontSize: 14, color: 'var(--parchment-40)' }}>
        It explains the document you already have. It is not advice, and it does not tell you what
        to do — your report is careful about that and so is this.
      </p>

      {state === 'sent' ? (
        <p className="t3d-body" style={{ color: 'var(--emerald)', margin: 0, maxWidth: '52ch' }}>
          Asked. Nothing has been charged — you&apos;ll get a reply saying whether it can be taken
          on and when, and a payment link only if you still want it then.
        </p>
      ) : (
        <>
          <label
            htmlFor="walkthrough-note"
            className="t3d-label"
            style={{ display: 'block', color: 'var(--parchment-40)', marginBottom: 8 }}
          >
            ANYTHING YOU WANT COVERED? (OPTIONAL)
          </label>
          <textarea
            id="walkthrough-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 600))}
            rows={3}
            placeholder="A section that did not land, a word you did not recognise, a contradiction you noticed…"
            style={{
              width: '100%', minHeight: 72, padding: '10px 12px', marginBottom: 16,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.6,
              color: 'var(--parchment)', background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--grid-line)', borderRadius: 8, resize: 'vertical',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={state === 'sending'}
            className="t3d-cta"
            style={state === 'sending' ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
          >
            {state === 'sending' ? 'ASKING…' : 'ASK FOR A WALKTHROUGH'}
          </button>
          <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginTop: 12, fontSize: 11 }}>
            Nothing is charged by asking.
          </p>
          {state === 'error' ? (
            <p className="t3d-body" style={{ color: 'var(--signal-red)', marginTop: 12, marginBottom: 0 }}>
              That did not send. Please try again, or email us.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
