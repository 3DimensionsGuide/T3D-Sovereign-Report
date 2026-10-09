import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';
import Page01IntegrationDivider from '@/lib/report/advanced/synthesis/Page01Divider';
import Page02Stack from '@/lib/report/advanced/synthesis/Page02Stack';
import Page03Hierarchy from '@/lib/report/advanced/synthesis/Page03Hierarchy';
import Page04Mistakes from '@/lib/report/advanced/synthesis/Page04Mistakes';
import Page05Synthesis from '@/lib/report/advanced/synthesis/Page05Synthesis';
import { calculateActiveTransits } from '@/server/engines/transits';
import { generateIntegrationSynthesis } from '@/lib/report/schema/integrationSynthesisEngine';

import { devOnlyGuard } from '@/server/devOnly';
registerFonts();

// Merged sample dataset — Vehicle fields copied verbatim from
// preview-advanced-vehicle/route.ts's sampleData, Road fields copied
// verbatim from preview-advanced-road/route.ts's sampleData, Stoplight
// fields copied verbatim from preview-advanced-stoplight/route.ts's
// sampleData. Kept in sync with those three routes by convention (not by
// import) since each route's sample chart is independently hand-picked to
// demo a specific mechanic in its own section.
const sampleData = {
  firstName: 'Alex',

  // Vehicle
  hdType: 'Manifesting Generator',
  hdAuthority: 'Sacral',
  hdStrategy: 'Wait to respond, then inform',
  hdProfile: '1/3',
  hdIncarnationCross: 'Right Angle Cross of the Sleeping Phoenix',

  // Road
  lifePathDisplay: '12/3',
  pinnacles: [
    { number: 11, startAge: 0, endAge: 33, label: 'First Pinnacle' },
    { number: 7, startAge: 33, endAge: 42, label: 'Second Pinnacle' },
    { number: 9, startAge: 42, endAge: 51, label: 'Third Pinnacle' },
    { number: 6, startAge: 51, endAge: null, label: 'Fourth Pinnacle' },
  ],
  currentPinnacleIndex: 1,
  challenges: [1, 5, 4, 4],

  // Stoplight
  sunSign: 'Gemini',
  tropicalAsc: 'Virgo',
  sunLongitude: 71.63,
  moonLongitude: 200,
  ascLongitude: 156,
};

// Tyler's real merged chart — Vehicle/Road/Stoplight fields each copied
// verbatim from the same three routes' realData objects.
const realData = {
  firstName: 'Tyler',

  // Vehicle
  hdType: 'Manifesting Generator',
  hdAuthority: 'Sacral',
  hdStrategy: 'Wait to respond, then inform',
  hdProfile: '4/1',
  hdIncarnationCross: 'Juxtaposition Cross of Correction',

  // Road
  lifePathDisplay: '34/7',
  pinnacles: [
    { number: 3, startAge: 0, endAge: 29, label: 'First Pinnacle' },
    { number: 7, startAge: 29, endAge: 38, label: 'Second Pinnacle' },
    { number: 1, startAge: 38, endAge: 47, label: 'Third Pinnacle' },
    { number: 4, startAge: 47, endAge: null, label: 'Fourth Pinnacle' },
  ],
  currentPinnacleIndex: 1,
  challenges: [6, 1, 5, 5],

  // Stoplight
  sunSign: 'Libra',
  tropicalAsc: 'Scorpio',
  sunLongitude: 187.53810447592952,
  moonLongitude: 6.610493188372285,
  ascLongitude: 225.04356065229132,
};

export async function GET(request: Request) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('real') === '1' ? realData : sampleData;

  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const currentChallenge = data.challenges[data.currentPinnacleIndex];

  const natalTransitPoints = {
    sunLongitude: data.sunLongitude,
    moonLongitude: data.moonLongitude,
    ascLongitude: data.ascLongitude,
    ascSign: data.tropicalAsc as any,
  };
  const activeTransits = calculateActiveTransits(natalTransitPoints);

  const synthesis = await generateIntegrationSynthesis({
    firstName: data.firstName,
    hdType: data.hdType,
    hdStrategy: data.hdStrategy,
    hdAuthority: data.hdAuthority,
    hdProfile: data.hdProfile,
    hdIncarnationCross: data.hdIncarnationCross,
    lifePathDisplay: data.lifePathDisplay,
    currentPinnacle,
    currentChallenge,
    sunSign: data.sunSign,
    tropicalAsc: data.tropicalAsc,
    activeTransits,
  });

  const pages: React.ReactElement[] = [
    React.createElement(Page01IntegrationDivider, { key: 'p1' }),
    React.createElement(Page02Stack, {
      data: {
        hdType: data.hdType,
        hdStrategy: data.hdStrategy,
        hdAuthority: data.hdAuthority,
        lifePathDisplay: data.lifePathDisplay,
        currentPinnacleLabel: currentPinnacle?.label ?? 'your current season',
        sunSign: data.sunSign,
        tropicalAsc: data.tropicalAsc,
      },
      key: 'p2',
    }),
    React.createElement(Page03Hierarchy, {
      data: { hdAuthority: data.hdAuthority },
      key: 'p3',
    }),
    React.createElement(Page04Mistakes, { key: 'p4' }),
    React.createElement(Page05Synthesis, {
      data: {
        hdType: data.hdType,
        hdAuthority: data.hdAuthority,
        lifePathDisplay: data.lifePathDisplay,
        sunSign: data.sunSign,
        integrationSynthesis: synthesis.text,
        integrationSynthesisSource: synthesis.source,
      },
      key: 'p5',
    }),
  ];

  const doc = React.createElement(Document, {}, ...pages);
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
