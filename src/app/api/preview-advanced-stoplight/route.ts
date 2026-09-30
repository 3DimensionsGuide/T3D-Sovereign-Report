import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';
import Page01StoplightDivider from '@/lib/report/advanced/stoplight/Page01Divider';
import Page02PersonalPlanets from '@/lib/report/advanced/stoplight/Page02PersonalPlanets';
import Page03SocialPlanets from '@/lib/report/advanced/stoplight/Page03SocialPlanets';
import Page04OuterPlanets from '@/lib/report/advanced/stoplight/Page04OuterPlanets';

registerFonts();

// Representative sample — invented placements, not computed from a real chart.
const sampleData = {
  firstName: 'Alex',
  sunSign: 'Gemini',
  tropicalAsc: 'Virgo',
  siderealAsc: 'Leo',
  tropicalMercury: 'Taurus',
  siderealMercury: 'Aries',
  tropicalVenus: 'Cancer',
  siderealVenus: 'Gemini',
  tropicalMars: 'Leo',
  siderealMars: 'Cancer',
  tropicalJupiter: 'Pisces',
  siderealJupiter: 'Aquarius',
  tropicalSaturn: 'Capricorn',
  siderealSaturn: 'Sagittarius',
  tropicalUranus: 'Sagittarius',
  siderealUranus: 'Scorpio',
  tropicalNeptune: 'Capricorn',
  siderealNeptune: 'Sagittarius',
  tropicalPluto: 'Scorpio',
  siderealPluto: 'Libra',
};

// Tyler's real chart (1993-09-30, 09:51, Harbor City CA) — computed via the
// same Swiss Ephemeris pipeline as astrology.ts (localToJulianDay + Whole
// Sign houses), and cross-verified: the raw tropical Sun longitude produced
// by that computation (187.538...°, landing in Libra) matches the Personality
// Sun longitude already captured verbatim for Tyler's real Human Design chart
// in preview-advanced-vehicle/route.ts (187.53810447591457), confirming the
// same birth data and pipeline.
const realData = {
  firstName: 'Tyler',
  sunSign: 'Libra',
  tropicalAsc: 'Scorpio',
  siderealAsc: 'Libra',
  tropicalMercury: 'Libra',
  siderealMercury: 'Libra',
  tropicalVenus: 'Virgo',
  siderealVenus: 'Leo',
  tropicalMars: 'Scorpio',
  siderealMars: 'Libra',
  tropicalJupiter: 'Libra',
  siderealJupiter: 'Virgo',
  tropicalSaturn: 'Aquarius',
  siderealSaturn: 'Aquarius',
  tropicalUranus: 'Capricorn',
  siderealUranus: 'Sagittarius',
  tropicalNeptune: 'Capricorn',
  siderealNeptune: 'Sagittarius',
  tropicalPluto: 'Scorpio',
  siderealPluto: 'Libra',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('real') === '1' ? realData : sampleData;

  const pages: React.ReactElement[] = [
    React.createElement(Page01StoplightDivider, { data: data as any, key: 'p1' }),
    React.createElement(Page02PersonalPlanets, { data: data as any, key: 'p2' }),
    React.createElement(Page03SocialPlanets, { data: data as any, key: 'p3' }),
    React.createElement(Page04OuterPlanets, { data: data as any, key: 'p4' }),
  ];

  const doc = React.createElement(Document, {}, ...pages);
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
