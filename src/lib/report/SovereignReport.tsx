/**
 * T3D Sovereign Report — Complete 44-Page Document
 *
 * Section 1 — Arrival              (Pages 1–4)   ✅
 * Section 2 — Your Coordinates     (Pages 5–9)   ✅
 * Section 3 — The Vehicle          (Pages 10–17) ✅
 * Section 4 — The Road             (Pages 18–25) ✅
 * Section 5 — The Stoplight        (Pages 26–33) ✅
 * Section 6 — Sovereign OS         (Pages 34–39) ✅
 * Section 7 — Integration & Close  (Pages 40–44) ✅
 */

import React from 'react';
import { Document } from '@react-pdf/renderer';

// Section 1
import Page1Cover  from './section1/Page1Cover';
import Page2Note   from './section1/Page2Note';
import Page3HowTo  from './section1/Page3HowTo';
import Page4Lens   from './section1/Page4Lens';

// Section 2
import Page5Dashboard        from './section2/Page5Dashboard';
import Page6PersonalMap      from './section2/Page6PersonalMap';
import PageSynthesis         from './section2/PageSynthesis';
import Page7DecisionProtocol from './section2/Page7DecisionProtocol';
import Page8CurrentSeason    from './section2/Page8CurrentSeason';
import Page9SevenDay         from './section2/Page9SevenDay';

// Section 3
import Page10VehicleDivider  from './section3/Page10VehicleDivider';
import Page11TypeStrategy    from './section3/Page11TypeStrategy';
import Page12Authority       from './section3/Page12Authority';
import Page13Profile         from './section3/Page13Profile';
import { Page14DefinedStrengths } from './section3/Page14DefinedStrengths';
import Page15OpenTerrain     from './section3/Page15OpenTerrain';
import Page16Friction        from './section3/Page16Friction';
import Page17VehiclePractice from './section3/Page17VehiclePractice';

// Section 4
import Page18RoadDivider      from './section4/Page18RoadDivider';
import Page19LifePath         from './section4/Page19LifePath';
import Page20BirthdayAttitude from './section4/Page20BirthdayAttitude';
import Page21InnerDrivers     from './section4/Page21InnerDrivers';
import Page22Pinnacles        from './section4/Page22Pinnacles';
import { Page23Challenges, Page24RoadFriction, Page25RoadPractice } from './section4/Pages23to25';

// Section 5
import Page26StoplightDivider from './section5/Page26StoplightDivider';
import Page33TwoSkyFieldPractice from './section5/Page33TwoSkyFieldPractice';
import Page32StoplightFriction   from './section5/Page32StoplightFriction';
import Page31RulerElementsArenas from './section5/Page31RulerElementsArenas';
import Page30StoplightSynthesis from './section5/Page30StoplightSynthesis';
import Page29DualLensProtocol   from './section5/Page29DualLensProtocol';
import Page28SiderealBigThree  from './section5/Page28SiderealBigThree';
import Page27TropicalBigThree from './section5/Page27TropicalBigThree';

// Section 6
import Page34SOSDivider  from './section6/Page34SOSDivider';
import Page35Decisions   from './section6/Page35Decisions';
import { Page36CreativeWork, Page37Relate,
         Page38Recalibration, Page39SevenDay } from './section6/Pages36to39';

// Section 7
import Page40NavigationCard   from './section7/Page40NavigationCard';
import { Page41Leave, Page42Keep } from './section7/Pages41to42';
import Page43DataNotes        from './section7/Page43DataNotes';
import Page44ClosingLetter    from './section7/Page44ClosingLetter';

import type { ReportData } from './tokens';

interface Props { data: ReportData; }

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
      {/* ── SECTION 1: ARRIVAL ─────────────────────────────────── Pages 1–4 */}
      <Page1Cover data={data} />
      <Page2Note  data={data} />
      <Page3HowTo />
      <Page4Lens  />

      {/* ── SECTION 2: YOUR COORDINATES ────────────────────────── Pages 5–9 */}
      <Page5Dashboard        data={data} />
      <Page6PersonalMap      data={data} />
      <PageSynthesis         data={data as any} pageNumber={7} />
      <Page7DecisionProtocol data={data} />
      <Page8CurrentSeason    data={data} />
      <Page9SevenDay         data={data} />

      {/* ── SECTION 3: THE VEHICLE ──────────────────────────── Pages 10–17 */}
      <Page10VehicleDivider  data={data} />
      <Page11TypeStrategy    data={data} />
      <Page12Authority       data={data} />
      <Page13Profile         data={data} />
      <Page14DefinedStrengths data={data} />
      <Page15OpenTerrain     data={data} />
      <Page16Friction        data={data} />
      <Page17VehiclePractice data={data} />

      {/* ── SECTION 4: THE ROAD ─────────────────────────────── Pages 18–25 */}
      <Page18RoadDivider      data={data} />
      <Page19LifePath         data={data} />
      <Page20BirthdayAttitude data={data} />
      <Page21InnerDrivers     data={data} />
      <Page22Pinnacles        data={data} />
      <Page23Challenges       data={data} />
      <Page24RoadFriction     data={data} />
      <Page25RoadPractice     data={data} />

      {/* ── SECTION 5: THE STOPLIGHT ────────────────────────── Pages 26–33 */}
      <Page26StoplightDivider data={data} />
      <Page27TropicalBigThree data={data} />
      <Page28SiderealBigThree  data={data as any} />
      <Page29DualLensProtocol />
      <Page30StoplightSynthesis data={data as any} />
      <Page31RulerElementsArenas  data={data as any} />
      <Page32StoplightFriction    data={data} />
      <Page33TwoSkyFieldPractice />

      {/* ── SECTION 6: SOVEREIGN OS ─────────────────────────── Pages 34–39 */}
      <Page34SOSDivider    data={data} />
      <Page35Decisions     data={data} />
      <Page36CreativeWork  data={data} />
      <Page37Relate        data={data} />
      <Page38Recalibration data={data} />
      <Page39SevenDay      data={data} />

      {/* ── SECTION 7: INTEGRATION & CLOSE ─────────────────── Pages 40–44 */}
      <Page40NavigationCard data={data} />
      <Page41Leave         data={data} />
      <Page42Keep          data={data} />
      <Page43DataNotes     data={data} />
      <Page44ClosingLetter data={data} />
    </Document>
  );
}
