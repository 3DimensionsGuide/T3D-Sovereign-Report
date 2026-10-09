'use client';

import { useEffect } from 'react';

/**
 * Counts a visit that arrives from a shared T3D card (a link ending in ?ref=card-profile or
 * ?ref=card-today). It sends only the card tag, once per browser session, with no cookies and
 * nothing about the visitor. Anything else in the address is ignored.
 */
const CARD_REFS = ['card-profile', 'card-today'];

export default function RefBeacon(): null {
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
