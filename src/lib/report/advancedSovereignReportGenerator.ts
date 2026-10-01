/**
 * Advanced Sovereign Report — ProductGenerator implementation.
 *
 * The single place that builds an Advanced Sovereign Report PDF (Vehicle /
 * Road / Stoplight, deepened, plus Integration) for a lead: real chart data
 * → four section syntheses → render. Mirrors sovereignReportGenerator.ts's
 * pattern so the direct-download route (/api/generate-report) and the
 * post-purchase email pipeline (generateAndEmailReport) both reach this
 * through the ProductGenerator registry rather than importing a report
 * component directly.
 *
 * Page assembly (section order, props per page) is copied verbatim from
 * /api/preview-advanced-full/route.ts, which has been visually verified
 * against sample data — this file's only real job is supplying that same
 * page-data shape from a real lead's `buildReportData()` output instead of
 * a hardcoded mock.
 *
 * Two field-naming differences between ReportData (tokens.ts) and the page
 * components' expected `data` shape, both resolved below:
 *   - ReportData.tropicalAsc / siderealAsc are FORMATTED position strings
 *     (e.g. "23° Virgo 14'"); every Advanced page that reads
 *     data.tropicalAsc / data.siderealAsc expects the bare sign name
 *     (e.g. "Virgo") — ReportData.risingSign already holds the tropical
 *     bare name; the sidereal bare name isn't computed by buildReportData
 *     (base report never needed it), so it's derived here from
 *     ReportData.siderealAsc via the same extractSign() helper
 *     buildReportData itself uses.
 *   - Page05Transits / calculateActiveTransits / getUpcomingTransits need
 *     exact natal longitudes, which ReportData exposes as
 *     tropicalSunLongitude / tropicalMoonLongitude / tropicalAscLongitude
 *     (added for exactly this purpose, previously unconsumed anywhere).
 */

import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import type { Lead } from '@/server/db/schema';
import type { ProductGenerator, GeneratedDeliverable } from '@/lib/products/types';

import { registerFonts }   from '@/lib/report/fonts';
import { buildReportData } from '@/lib/report/schema/buildReportData';
import { extractSign }     from '@/lib/report/schema/normalize';
import { calculateActiveTransits, getUpcomingTransits } from '@/server/engines/transits';

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

// ─── Section IV — The Integration ────────────────────────────────────────────
import Page01IntegrationDivider from '@/lib/report/advanced/synthesis/Page01Divider';
import Page02Stack from '@/lib/report/advanced/synthesis/Page02Stack';
import Page03Hierarchy from '@/lib/report/advanced/synthesis/Page03Hierarchy';
import Page04Mistakes from '@/lib/report/advanced/synthesis/Page04Mistakes';
import Page05IntegrationSynthesis from '@/lib/report/advanced/synthesis/Page05Synthesis';
import { generateIntegrationSynthesis } from '@/lib/report/schema/integrationSynthesisEngine';

registerFonts();

async function generate(lead: Lead): Promise<GeneratedDeliverable> {
  const reportData = buildReportData(
    lead as Parameters<typeof buildReportData>[0]
  );

  // Bare sign names — see file header for why these differ from
  // ReportData.tropicalAsc / siderealAsc.
  const tropicalAscSign = reportData.risingSign;
  const siderealAscSign = extractSign(reportData.siderealAsc);

  // `data` is the shape every Advanced page component actually reads:
  // ReportData plus the two bare-sign-name overrides above. Everything
  // else (hdType, hdChannels, hdActiveGates, lifePath, pinnacles,
  // challenges, tropical/siderealMercury..Pluto, etc.) already matches
  // ReportData's own field names one-to-one.
  const data = {
    ...reportData,
    tropicalAsc: tropicalAscSign,
    siderealAsc: siderealAscSign,
  };

  const natalTransitPoints = {
    sunLongitude:  reportData.tropicalSunLongitude,
    moonLongitude: reportData.tropicalMoonLongitude,
    ascLongitude:  reportData.tropicalAscLongitude,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ascSign:       tropicalAscSign as any, // ReportData.risingSign is a plain string; TransitNatalPoints wants the narrower ZodiacSign union (same pattern as preview-advanced-full/route.ts)
  };
  const activeTransits   = calculateActiveTransits(natalTransitPoints);
  const upcomingTransits = getUpcomingTransits(natalTransitPoints, new Date(), 2);

  const currentPinnacle  = reportData.pinnacles[reportData.currentPinnacleIndex];
  const currentChallenge = reportData.challenges[reportData.currentPinnacleIndex];

  // Per-section synthesis — independent of each other, run concurrently.
  const [vehicleSynthesis, roadSynthesis, stoplightSynthesis] = await Promise.all([
    generateVehicleSynthesis(reportData),
    generateRoadSynthesis(reportData),
    generateStoplightSynthesis({
      firstName:       reportData.firstName,
      sunSign:         reportData.sunSign,
      tropicalAsc:     tropicalAscSign,
      tropicalMercury: reportData.tropicalMercury,
      tropicalVenus:   reportData.tropicalVenus,
      tropicalMars:    reportData.tropicalMars,
      tropicalJupiter: reportData.tropicalJupiter,
      tropicalSaturn:  reportData.tropicalSaturn,
      tropicalUranus:  reportData.tropicalUranus,
      tropicalNeptune: reportData.tropicalNeptune,
      tropicalPluto:   reportData.tropicalPluto,
      activeTransits,
      upcomingTransits,
    }),
  ]);

  console.log(
    `[Advanced Report ${lead.id}] Vehicle: ${vehicleSynthesis.wordCount}w via ${vehicleSynthesis.source}, ` +
    `Road: ${roadSynthesis.wordCount}w via ${roadSynthesis.source}, ` +
    `Stoplight: ${stoplightSynthesis.wordCount}w via ${stoplightSynthesis.source}`
  );

  // Integration draws on the other three sections' raw data (not their
  // synthesis text) plus the live transit read, so it runs alongside them
  // rather than waiting on their results.
  const integrationSynthesis = await generateIntegrationSynthesis({
    firstName:           reportData.firstName,
    hdType:              reportData.hdType,
    hdStrategy:           reportData.hdStrategy,
    hdAuthority:          reportData.hdAuthority,
    hdProfile:            reportData.hdProfile,
    hdIncarnationCross:   reportData.hdIncarnationCross,
    lifePathDisplay:      reportData.lifePathDisplay,
    currentPinnacle,
    currentChallenge,
    sunSign:              reportData.sunSign,
    tropicalAsc:          tropicalAscSign,
    activeTransits,
  });

  console.log(`[Advanced Report ${lead.id}] Integration: ${integrationSynthesis.wordCount}w via ${integrationSynthesis.source}`);

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
      data: { tropicalAsc: tropicalAscSign, activeTransits, upcomingTransits },
      key: 's5',
    }),
    React.createElement(Page06StoplightSynthesis, {
      data: {
        sunSign:          reportData.sunSign,
        tropicalAsc:      tropicalAscSign,
        tropicalMercury:  reportData.tropicalMercury,
        tropicalVenus:    reportData.tropicalVenus,
        tropicalMars:     reportData.tropicalMars,
        tropicalJupiter:  reportData.tropicalJupiter,
        tropicalSaturn:   reportData.tropicalSaturn,
        activeTransits,
        upcomingTransits,
        stoplightSynthesis:       stoplightSynthesis.text,
        stoplightSynthesisSource: stoplightSynthesis.source,
      },
      key: 's6',
    }),

    // Section IV — The Integration
    React.createElement(Page01IntegrationDivider, { key: 'i1' }),
    React.createElement(Page02Stack, {
      data: {
        hdType:               reportData.hdType,
        hdStrategy:           reportData.hdStrategy,
        hdAuthority:          reportData.hdAuthority,
        lifePathDisplay:      reportData.lifePathDisplay,
        currentPinnacleLabel: currentPinnacle?.label ?? 'your current season',
        sunSign:              reportData.sunSign,
        tropicalAsc:          tropicalAscSign,
      },
      key: 'i2',
    }),
    React.createElement(Page03Hierarchy, {
      data: { hdAuthority: reportData.hdAuthority },
      key: 'i3',
    }),
    React.createElement(Page04Mistakes, { key: 'i4' }),
    React.createElement(Page05IntegrationSynthesis, {
      data: {
        hdType:                     reportData.hdType,
        hdAuthority:                reportData.hdAuthority,
        lifePathDisplay:            reportData.lifePathDisplay,
        sunSign:                    reportData.sunSign,
        integrationSynthesis:       integrationSynthesis.text,
        integrationSynthesisSource: integrationSynthesis.source,
      },
      key: 'i5',
    }),
  );

  const doc = React.createElement(Document, {}, ...pages);
  const pdfBuffer = await renderToBuffer(doc as any);

  const safeName = `${reportData.firstName}-${reportData.lastName}`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-');

  return {
    buffer:      Buffer.from(pdfBuffer),
    filename:    `T3D-Advanced-Sovereign-Report-${safeName}.pdf`,
    contentType: 'application/pdf',
  };
}

export const advancedSovereignReportGenerator: ProductGenerator = { generate };
