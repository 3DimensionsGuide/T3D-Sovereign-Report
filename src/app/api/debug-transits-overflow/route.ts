// TEMPORARY debug route — not part of the report. Forces Page05Transits
// into the 3-active/2-upcoming overflow scenario that originally produced
// the footer-collision (and, after the first fix, a blank-page) bug, so
// the fix could be verified without waiting for a day with that many live
// transits. ?active=N and ?upcoming=N (0-3 / 0-2) simulate other days,
// e.g. ?active=2&upcoming=2 for an ordinary day below the split threshold.
// Confirmed fixed — safe to delete, or keep as a standing regression check.
import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';
import Page05Transits from '@/lib/report/advanced/stoplight/Page05Transits';
import type { TransitHit, UpcomingTransit } from '@/server/engines/transits';

import { devOnlyGuard } from '@/server/devOnly';
registerFonts();

const activeTransits: TransitHit[] = [
  {
    transitingPlanet: 'uranus', aspect: 'sextile', natalTarget: 'moon',
    orb: 1.1, applying: false, transitingSign: 'Gemini',
    window: { startDate: '2026-06-29', endDate: '2026-11-26' },
  } as TransitHit,
  {
    transitingPlanet: 'uranus', aspect: 'trine', natalTarget: 'sun',
    orb: 2.0, applying: false, transitingSign: 'Gemini',
    window: { startDate: '2026-07-19', endDate: '2026-11-03' },
  } as TransitHit,
  {
    transitingPlanet: 'uranus', aspect: 'square', natalTarget: 'ascendant',
    orb: 0.5, applying: false, transitingSign: 'Gemini',
    window: { startDate: '2026-06-17', endDate: '2026-12-11' },
  } as TransitHit,
];

const upcomingTransits: UpcomingTransit[] = [
  {
    transitingPlanet: 'saturn', aspect: 'opposition', natalTarget: 'sun',
    transitingSign: 'Aries',
    window: { startDate: '2026-10-14', endDate: '2027-02-03' },
  } as UpcomingTransit,
  {
    transitingPlanet: 'saturn', aspect: 'conjunction', natalTarget: 'moon',
    transitingSign: 'Aries',
    window: { startDate: '2026-10-27', endDate: '2027-01-22' },
  } as UpcomingTransit,
];

// Query params let this route also simulate an ORDINARY day (below the
// split threshold) without editing the file: ?active=2&upcoming=1 etc.
// Omit either param to use the full 3-active/2-upcoming overflow scenario.
export async function GET(request: Request) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;
  const url = new URL(request.url);
  const activeParam = url.searchParams.get('active');
  const upcomingParam = url.searchParams.get('upcoming');
  const active = activeParam != null ? activeTransits.slice(0, Number(activeParam)) : activeTransits;
  const upcoming = upcomingParam != null ? upcomingTransits.slice(0, Number(upcomingParam)) : upcomingTransits;

  const doc = React.createElement(
    Document,
    {},
    React.createElement(Page05Transits, {
      data: { tropicalAsc: 'Scorpio', activeTransits: active, upcomingTransits: upcoming },
      key: 'test',
    }),
  );
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
