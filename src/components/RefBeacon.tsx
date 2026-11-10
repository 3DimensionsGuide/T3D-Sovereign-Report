'use client';

import { useEffect } from 'react';
import { rememberFirstTouch } from '@/lib/firstTouch';

/**
 * Two things that both have to happen on the first page somebody lands on, and nothing else in
 * common.
 *
 * One counts a visit from a shared T3D card (?ref=card-profile or ?ref=card-today), sending only
 * the card tag, once per browser session, with no cookies and nothing about the visitor.
 *
 * The other records where this visit came from, so a purchase can later be traced to the post or
 * link that produced it. Campaign tags and a referring host only — see src/lib/firstTouch.ts for
 * what is kept and what is deliberately not. It has to run here rather than on the calculator,
 * because somebody usually lands somewhere else first and the source would be lost by the time
 * they reach it.
 */
const CARD_REFS = ['card-profile', 'card-today'];

export default function RefBeacon(): null {
  useEffect(() => {
    // Written once per browser, so a returning visitor keeps their original source.
    rememberFirstTouch();
  }, []);

  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (!ref || !CARD_REFS.includes(ref)) return;
      const flag = `t3d-ref-${ref}`;
      if (window.sessionStorage.getItem(flag)) return;
      window.sessionStorage.setItem(flag, '1');
      void fetch('/api/app/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: `visit_${ref}` }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Counting is optional. Never get in the visitor's way.
    }
  }, []);
  return null;
}
