import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';

// ─── Section I — The Vehicle (Human Design) ──────────────────────────────────
import Page01VehicleDivider from '@/lib/report/advanced/vehicle/Page01Divider';
import Page02Definition from '@/lib/report/advanced/vehicle/Page02Definition';
import Page02Gates from '@/lib/report/advanced/vehicle/Page02Gates';
import Page02Bodygraph from '@/lib/report/advanced/vehicle/Page02Bodygraph';
import Page03Bridges, { hasBridgePage } from '@/lib/report/advanced/vehicle/Page03Bridges';
import Page04Circuitry from '@/lib/report/advanced/vehicle/Page04Circuitry';
import Page05IncarnationCross from '@/lib/report/advanced/vehicle/Page05IncarnationCross';
import Page06Godhead from '@/lib/report/advanced/vehicle/Page06Godhead';
import Page07GodheadLightShadow from '@/lib/report/advanced/vehicle/Page07GodheadLightShadow';
import Page08Variables from '@/lib/report/advanced/vehicle/Page08Variables';
import Page09VehicleSynthesis from '@/lib/report/advanced/vehicle/Page09Synthesis';
import { generateVehicleSynthesis } from '@/lib/report/schema/vehicleSynthesisEngine';

// ─── Section II — The Road (Numerology) ──────────────────────────────────────
import Page01RoadDivider from '@/lib/report/advanced/road/Page01Divider';
import Page02InnerDrivers from '@/lib/report/advanced/road/Page02InnerDrivers';
import Page03SoulUrgePersonality from '@/lib/report/advanced/road/Page03SoulUrgePersonality';
import Page04HiddenPassion from '@/lib/report/advanced/road/Page04HiddenPassion';
import Page05KarmicLessons from '@/lib/report/advanced/road/Page05KarmicLessons';
import Page06Pinnacles from '@/lib/report/advanced/road/Page06Pinnacles';
import Page07Challenges from '@/lib/report/advanced/road/Page07Challenges';
import Page08RoadSynthesis from '@/lib/report/advanced/road/Page08Synthesis';
import { generateRoadSynthesis } from '@/lib/report/schema/roadSynthesisEngine';

// ─── Section III — The Stoplight (Astrology) ─────────────────────────────────
import Page01StoplightDivider from '@/lib/report/advanced/stoplight/Page01Divider';
import Page02PersonalPlanets from '@/lib/report/advanced/stoplight/Page02PersonalPlanets';
import Page03SocialPlanets from '@/lib/report/advanced/stoplight/Page03SocialPlanets';
import Page04OuterPlanets from '@/lib/report/advanced/stoplight/Page04OuterPlanets';
import Page05Transits from '@/lib/report/advanced/stoplight/Page05Transits';
import Page06StoplightSynthesis from '@/lib/report/advanced/stoplight/Page06Synthesis';
import { generateStoplightSynthesis } from '@/lib/report/schema/stoplightSynthesisEngine';
import { calculateActiveTransits, getUpcomingTransits } from '@/server/engines/transits';

// ─── Section IV — The Integration ────────────────────────────────────────────
import Page01IntegrationDivider from '@/lib/report/advanced/synthesis/Page01Divider';
import Page02Stack from '@/lib/report/advanced/synthesis/Page02Stack';
import Page03Hierarchy from '@/lib/report/advanced/synthesis/Page03Hierarchy';
import Page04Mistakes from '@/lib/report/advanced/synthesis/Page04Mistakes';
import Page05IntegrationSynthesis from '@/lib/report/advanced/synthesis/Page05Synthesis';
import { generateIntegrationSynthesis } from '@/lib/report/schema/integrationSynthesisEngine';

import { devOnlyGuard } from '@/server/devOnly';
registerFonts();

// Merged sample dataset — every field is copied verbatim from its own
// section's individual preview route (preview-advanced-vehicle /
// -road / -stoplight), so this route stays in sync with those three by
// convention rather than by import: each section route's sample chart is
// independently hand-picked to demo a specific mechanic in its own
// section, and this route's job is only to assemble, never to redesign,
// the sample data.
const sampleData = {
  firstName: 'Alex',

  // Vehicle
  hdType: 'Manifesting Generator',
  hdAuthority: 'Sacral',
  hdStrategy: 'Wait to respond, then inform',
  hdNotSelf: 'Anger and frustration',
  hdProfile: '1/3',
  hdIncarnationCross: 'Right Angle Cross of the Sleeping Phoenix',
  hdDefinedCenters: ['throat', 'sacral', 'spleen', 'root'],
  hdChannels: [
    { name: 'Charisma', gates: [34, 20], activatedBy: 'personality', fromCenter: 'sacral', toCenter: 'throat' },
    { name: 'Judgment', gates: [18, 58], activatedBy: 'design', fromCenter: 'spleen', toCenter: 'root' },
  ],
  hdActiveGates: [
    { gate: 20, line: 1, center: 'throat', planet: 'sun', epoch: 'personality', longitude: 0 },
    { gate: 34, line: 1, center: 'sacral', planet: 'moon', epoch: 'personality', longitude: 0 },
    { gate: 18, line: 1, center: 'spleen', planet: 'mars', epoch: 'design', longitude: 0 },
    { gate: 58, line: 1, center: 'root', planet: 'venus', epoch: 'design', longitude: 0 },
    { gate: 55, line: 3, center: 'solar_plexus', planet: 'earth', epoch: 'personality', longitude: 0 },
    { gate: 10, line: 2, center: 'g_center', planet: 'sun', epoch: 'design', longitude: 0 },
    { gate: 15, line: 4, center: 'g_center', planet: 'earth', epoch: 'design', longitude: 0 },
  ],

  // Road
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

  // Stoplight
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
  hdNotSelf: 'Anger and frustration',
  hdProfile: '4/1',
  hdIncarnationCross: 'Juxtaposition Cross of Correction',
  hdDefinedCenters: ['throat', 'sacral', 'spleen', 'root'],
  hdChannels: [
    { name: 'Charisma', gates: [20, 34], activatedBy: 'personality', fromCenter: 'throat', toCenter: 'sacral' },
    { name: 'Struggle', gates: [28, 38], activatedBy: 'both', fromCenter: 'spleen', toCenter: 'root' },
    { name: 'Transformation', gates: [32, 54], activatedBy: 'both', fromCenter: 'spleen', toCenter: 'root' },
  ],
  hdActiveGates: [
    { gate: 18, line: 4, center: 'spleen', planet: 'sun', epoch: 'personality', longitude: 187.53810447591457 },
    { gate: 17, line: 3, center: 'ajna', planet: 'moon', epoch: 'personality', longitude: 6.6104931883740505 },
    { gate: 50, line: 4, center: 'spleen', planet: 'mercury', epoch: 'personality', longitude: 209.47185454366536 },
    { gate: 40, line: 6, center: 'heart', planet: 'venus', epoch: 'personality', longitude: 161.12409871138323 },
    { gate: 28, line: 1, center: 'spleen', planet: 'mars', epoch: 'personality', longitude: 212.43870141535217 },
    { gate: 32, line: 1, center: 'spleen', planet: 'jupiter', epoch: 'personality', longitude: 201.22221361792765 },
    { gate: 49, line: 6, center: 'solar_plexus', planet: 'saturn', epoch: 'personality', longitude: 324.2575517770025 },
    { gate: 54, line: 4, center: 'root', planet: 'uranus', epoch: 'personality', longitude: 288.2322695514266 },
    { gate: 54, line: 4, center: 'root', planet: 'neptune', epoch: 'personality', longitude: 288.37618755645644 },
    { gate: 43, line: 6, center: 'ajna', planet: 'pluto', epoch: 'personality', longitude: 233.66200482463557 },
    { gate: 34, line: 5, center: 'sacral', planet: 'northNode', epoch: 'personality', longitude: 244.55268684630005 },
    { gate: 20, line: 5, center: 'throat', planet: 'southNode', epoch: 'personality', longitude: 64.55268684630005 },
    { gate: 17, line: 4, center: 'ajna', planet: 'earth', epoch: 'personality', longitude: 7.538104475914565 },
    { gate: 39, line: 1, center: 'root', planet: 'sun', epoch: 'design', longitude: 99.5380991256265 },
    { gate: 9, line: 2, center: 'sacral', planet: 'moon', epoch: 'design', longitude: 247.1358017426578 },
    { gate: 56, line: 3, center: 'throat', planet: 'mercury', epoch: 'design', longitude: 118.25449124226691 },
    { gate: 8, line: 1, center: 'throat', planet: 'venus', epoch: 'design', longitude: 55.03625340297299 },
    { gate: 59, line: 5, center: 'sacral', planet: 'mars', epoch: 'design', longitude: 154.67786743643103 },
    { gate: 18, line: 3, center: 'spleen', planet: 'jupiter', epoch: 'design', longitude: 186.08863872105644 },
    { gate: 30, line: 6, center: 'solar_plexus', planet: 'saturn', epoch: 'design', longitude: 329.9665637411001 },
    { gate: 54, line: 6, center: 'root', planet: 'uranus', epoch: 'design', longitude: 290.655406185399 },
    { gate: 54, line: 6, center: 'root', planet: 'neptune', epoch: 'design', longitude: 290.05441906585384 },
    { gate: 43, line: 5, center: 'ajna', planet: 'pluto', epoch: 'design', longitude: 233.00197953356474 },
    { gate: 5, line: 1, center: 'sacral', planet: 'northNode', epoch: 'design', longitude: 252.06792605259204 },
    { gate: 35, line: 1, center: 'throat', planet: 'southNode', epoch: 'design', longitude: 72.06792605259204 },
    { gate: 38, line: 1, center: 'root', planet: 'earth', epoch: 'design', longitude: 279.53809912562656 },
  ],

  // Road
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

  // Stoplight
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
  sunLongitude: 187.53810447592952,
  moonLongitude: 6.610493188372285,
  ascLongitude: 225.04356065229132,
};

export async function GET(request: Request) {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('real') === '1' ? realData : sampleData;

  // ─── Shared cross-section pre-computation ──────────────────────────────────
  const natalTransitPoints = {
    sunLongitude: data.sunLongitude,
    moonLongitude: data.moonLongitude,
    ascLongitude: data.ascLongitude,
    ascSign: data.tropicalAsc as any,
  };
  const activeTransits = calculateActiveTransits(natalTransitPoints);
  const upcomingTransits = getUpcomingTransits(natalTransitPoints, new Date(), 2);

  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const currentChallenge = data.challenges[data.currentPinnacleIndex];

  // ─── Per-section synthesis (each engine call is independent — run them
  // concurrently rather than one after another, since none depends on
  // another section's synthesis output) ──────────────────────────────────
  const [vehicleSynthesis, roadSynthesis, stoplightSynthesis] = await Promise.all([
    generateVehicleSynthesis(data as any),
    generateRoadSynthesis(data as any),
    generateStoplightSynthesis({
      firstName: data.firstName,
      sunSign: data.sunSign,
      tropicalAsc: data.tropicalAsc,
      tropicalMercury: data.tropicalMercury,
      tropicalVenus: data.tropicalVenus,
      tropicalMars: data.tropicalMars,
      tropicalJupiter: data.tropicalJupiter,
      tropicalSaturn: data.tropicalSaturn,
      tropicalUranus: data.tropicalUranus,
      tropicalNeptune: data.tropicalNeptune,
      tropicalPluto: data.tropicalPluto,
      activeTransits,
      upcomingTransits,
    }),
  ]);

  // The Integration synthesis draws on the other three sections' raw data
  // (not their synthesis text) plus the live transit read, so it can run
  // alongside them rather than waiting on their results.
  const integrationSynthesis = await generateIntegrationSynthesis({
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

  // ─── Assemble every page, in section order ─────────────────────────────────
  const pages: React.ReactElement[] = [
    // Section I — The Vehicle
    React.createElement(Page01VehicleDivider, { data: data as any, key: 'v1' }),
    React.createElement(Page02Definition, { data: data as any, key: 'v2' }),
    React.createElement(Page02Gates, { key: 'v2a' }),
    React.createElement(Page02Bodygraph, { data: data as any, key: 'v2b' }),
  ];
  if (hasBridgePage(data as any)) {
    pages.push(React.createElement(Page03Bridges, { data: data as any, key: 'v3' }));
  }
  pages.push(
    React.createElement(Page04Circuitry, { data: data as any, key: 'v4' }),
    React.createElement(Page05IncarnationCross, { data: data as any, key: 'v5' }),
    React.createElement(Page06Godhead, { data: data as any, key: 'v6' }),
    React.createElement(Page07GodheadLightShadow, { data: data as any, key: 'v7' }),
    React.createElement(Page08Variables, { data: data as any, key: 'v8' }),
    React.createElement(Page09VehicleSynthesis, {
      data: { ...data, vehicleSynthesis: vehicleSynthesis.text, vehicleSynthesisSource: vehicleSynthesis.source } as any,
      key: 'v9',
    }),

    // Section II — The Road
    React.createElement(Page01RoadDivider, { data: data as any, key: 'r1' }),
    React.createElement(Page02InnerDrivers, { data: data as any, key: 'r2' }),
    React.createElement(Page03SoulUrgePersonality, { data: data as any, key: 'r3' }),
    React.createElement(Page04HiddenPassion, { data: data as any, key: 'r4' }),
    React.createElement(Page05KarmicLessons, { data: data as any, key: 'r5' }),
    React.createElement(Page06Pinnacles, { data: data as any, key: 'r6' }),
    React.createElement(Page07Challenges, { data: data as any, key: 'r7' }),
    React.createElement(Page08RoadSynthesis, {
      data: { ...data, roadSynthesis: roadSynthesis.text, roadSynthesisSource: roadSynthesis.source } as any,
      key: 'r8',
    }),

    // Section III — The Stoplight
    React.createElement(Page01StoplightDivider, { data: data as any, key: 's1' }),
    React.createElement(Page02PersonalPlanets, { data: data as any, key: 's2' }),
    React.createElement(Page03SocialPlanets, { data: data as any, key: 's3' }),
    React.createElement(Page04OuterPlanets, { data: data as any, key: 's4' }),
    React.createElement(Page05Transits, {
      data: { tropicalAsc: data.tropicalAsc, activeTransits, upcomingTransits },
      key: 's5',
    }),
    React.createElement(Page06StoplightSynthesis, {
      data: {
        sunSign: data.sunSign,
        tropicalAsc: data.tropicalAsc,
        tropicalMercury: data.tropicalMercury,
        tropicalVenus: data.tropicalVenus,
        tropicalMars: data.tropicalMars,
        tropicalJupiter: data.tropicalJupiter,
        tropicalSaturn: data.tropicalSaturn,
        activeTransits,
        upcomingTransits,
        stoplightSynthesis: stoplightSynthesis.text,
        stoplightSynthesisSource: stoplightSynthesis.source,
      },
      key: 's6',
    }),

    // Section IV — The Integration
    React.createElement(Page01IntegrationDivider, { key: 'i1' }),
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
      key: 'i2',
    }),
    React.createElement(Page03Hierarchy, {
      data: { hdAuthority: data.hdAuthority },
      key: 'i3',
    }),
    React.createElement(Page04Mistakes, { key: 'i4' }),
    React.createElement(Page05IntegrationSynthesis, {
      data: {
        hdType: data.hdType,
        hdAuthority: data.hdAuthority,
        lifePathDisplay: data.lifePathDisplay,
        sunSign: data.sunSign,
        integrationSynthesis: integrationSynthesis.text,
        integrationSynthesisSource: integrationSynthesis.source,
      },
      key: 'i5',
    }),
  );

  const doc = React.createElement(Document, {}, ...pages);
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
