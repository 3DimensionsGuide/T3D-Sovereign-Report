/**
 * T3D Sovereign Report — Main Document
 *
 * Section 1 — Arrival       (Pages 1–4)   ✅ Complete
 * Section 2 — Coordinates   (Pages 5–9)   ✅ Complete
 * Sections 3–7               (Pages 10–44) Coming in next build sessions
 */

import React from 'react';
import { Document } from '@react-pdf/renderer';

// Section 1 — Arrival
import Page1Cover  from './section1/Page1Cover';
import Page2Note   from './section1/Page2Note';
import Page3HowTo  from './section1/Page3HowTo';
import Page4Lens   from './section1/Page4Lens';

// Section 2 — Your Coordinates
import Page5Dashboard        from './section2/Page5Dashboard';
import Page6PersonalMap      from './section2/Page6PersonalMap';
import Page7DecisionProtocol from './section2/Page7DecisionProtocol';
import Page8CurrentSeason    from './section2/Page8CurrentSeason';
import Page9SevenDay         from './section2/Page9SevenDay';

import type { ReportData } from './tokens';

interface Props {
  data: ReportData;
}

export function SovereignReport({ data }: Props) {
  return (
    <Document
      title={`T3D Sovereign Report — ${data.firstName} ${data.lastName}`}
      author="T3D Studio"
      subject="Sovereign Navigation Report — Human Design, Numerology & Astrology"
      keywords="Human Design, Numerology, Astrology, T3D, Sovereign Report"
      creator="3dimensions.guide"
      producer="@react-pdf/renderer"
    >
      {/* ── SECTION 1: ARRIVAL (Pages 1–4) ─────────────────────────────── */}
      <Page1Cover data={data} />
      <Page2Note  data={data} />
      <Page3HowTo />
      <Page4Lens  />

      {/* ── SECTION 2: YOUR COORDINATES (Pages 5–9) ────────────────────── */}
      <Page5Dashboard        data={data} />
      <Page6PersonalMap      data={data} />
      <Page7DecisionProtocol data={data} />
      <Page8CurrentSeason    data={data} />
      <Page9SevenDay         data={data} />
    </Document>
  );
}
