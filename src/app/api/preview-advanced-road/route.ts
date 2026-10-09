import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';
import Page01RoadDivider from '@/lib/report/advanced/road/Page01Divider';
import Page02InnerDrivers from '@/lib/report/advanced/road/Page02InnerDrivers';
import Page03SoulUrgePersonality from '@/lib/report/advanced/road/Page03SoulUrgePersonality';
import Page04HiddenPassion from '@/lib/report/advanced/road/Page04HiddenPassion';
import Page05KarmicLessons from '@/lib/report/advanced/road/Page05KarmicLessons';
import Page06Pinnacles from '@/lib/report/advanced/road/Page06Pinnacles';
import Page07Challenges from '@/lib/report/advanced/road/Page07Challenges';
import Page08Synthesis from '@/lib/report/advanced/road/Page08Synthesis';
import { generateRoadSynthesis } from '@/lib/report/schema/roadSynthesisEngine';

import { devOnlyGuard } from '@/server/devOnly';
registerFonts();

// Representative sample — computed via the real numerology engine
// (calculateNumerology) for Alex Michael Rivera, born 1990-05-15.
// Life Path 3 (compound 12).
const sampleData = {
  firstName: 'Alex',
  lifePath: 3,
  lifePathDisplay: '12/3',
  lifePathCompound: 12,
  destiny: 4,
  personality: 4,
  soulUrge: 9,
  hiddenPassion: 9,
  karmicLessons: [2, 7],
  hasFullName: true,
  pinnacles: [
    { number: 11, startAge: 0, endAge: 33, label: 'First Pinnacle' },
    { number: 7, startAge: 33, endAge: 42, label: 'Second Pinnacle' },
    { number: 9, startAge: 42, endAge: 51, label: 'Third Pinnacle' },
    { number: 6, startAge: 51, endAge: null, label: 'Fourth Pinnacle' },
  ],
  currentPinnacleIndex: 1,
  challenges: [1, 5, 4, 4],
};

// Tyler's real birth name and birth date (Tyler James Henry, 1993-09-30) —
// values below are computed directly via calculateNumerology() and verified
// against the live /api/debug-numerology route (matches his confirmed real
// Personality Number 33 from the base-report bug fix).
const realData = {
  firstName: 'Tyler',
  lifePath: 7,
  lifePathDisplay: '34/7',
  lifePathCompound: 34,
  destiny: 9,
  personality: 33,
  soulUrge: 3,
  hiddenPassion: 5,
  karmicLessons: [6],
  hasFullName: true,
  pinnacles: [
    { number: 3, startAge: 0, endAge: 29, label: 'First Pinnacle' },
    { number: 7, startAge: 29, endAge: 38, label: 'Second Pinnacle' },
    { number: 1, startAge: 38, endAge: 47, label: 'Third Pinnacle' },
    { number: 4, startAge: 47, endAge: null, label: 'Fourth Pinnacle' },
  ],
  currentPinnacleIndex: 1,
  challenges: [6, 1, 5, 5],
};

export async function GET(request: Request) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('real') === '1' ? realData : sampleData;

  const pages: React.ReactElement[] = [
    React.createElement(Page01RoadDivider, { data: data as any, key: 'p1' }),
    React.createElement(Page02InnerDrivers, { data: data as any, key: 'p2' }),
    React.createElement(Page03SoulUrgePersonality, { data: data as any, key: 'p3' }),
    React.createElement(Page04HiddenPassion, { data: data as any, key: 'p4' }),
    React.createElement(Page05KarmicLessons, { data: data as any, key: 'p5' }),
    React.createElement(Page06Pinnacles, { data: data as any, key: 'p6' }),
    React.createElement(Page07Challenges, { data: data as any, key: 'p7' }),
  ];

  const synthesis = await generateRoadSynthesis(data as any);
  pages.push(React.createElement(Page08Synthesis, {
    data: { ...data, roadSynthesis: synthesis.text, roadSynthesisSource: synthesis.source } as any,
    key: 'p8',
  }));

  const doc = React.createElement(Document, {}, ...pages);
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
