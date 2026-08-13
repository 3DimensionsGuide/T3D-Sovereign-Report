/**
 * Page 5 — Your Coordinates At A Glance
 *
 * Reader need: "What are my primary outputs?"
 *
 * Design rules:
 *   — Max 8 data points total
 *   — Three visual hierarchy levels:
 *       Level 1: System label + core output value (large)
 *       Level 2: One-sentence practical translation (medium)
 *       Level 3: Technical descriptor (small, for precision readers)
 *   — Not a spreadsheet — a control panel
 *   — No interpretation paragraphs on this page
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#FAFAF9',
    padding: 0,
    fontFamily: F.sans,
  },
  topRule: {
    width: PAGE.width,
    height: 2,
    backgroundColor: C.base,
    opacity: 0.08,
  },

  // ── Three colored stripes across full width ────────────────────────────────
  colorStripes: {
    flexDirection: 'row',
    width: PAGE.width,
  },
  stripeAmber:   { flex: 1, height: 3, backgroundColor: C.amber },
  stripeEmerald: { flex: 1, height: 3, backgroundColor: C.emerald },
  stripeCrimson: { flex: 1, height: 3, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 40,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 24,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 9,
    fontWeight: 300,
    color: C.parchmentFaint,
    marginBottom: 24,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 24,
  },

  // ── Three dimension panels ────────────────────────────────────────────────
  panels: {
    flexDirection: 'column',
    gap: 0,
  },

  panel: {
    paddingVertical: 18,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: C.base,
    borderBottomStyle: 'solid',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    opacity: 0.98,
  },
  panelLast: {
    paddingVertical: 18,
    paddingHorizontal: 0,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },

  // Left color accent bar
  panelBar: {
    width: 2,
    flexShrink: 0,
    marginTop: 3,
    borderRadius: 1,
  },

  panelContent: {
    flex: 1,
  },

  // LEVEL 1 — System label + primary output
  level1Row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  systemLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: C.parchmentFaint,
  },

  // Primary data points in a row
  dataPoints: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'baseline',
    marginBottom: 7,
    flexWrap: 'wrap',
  },
  dataPoint: {
    alignItems: 'flex-start',
    gap: 2,
  },
  dataLabel: {
    fontFamily: F.sans,
    fontSize: 6.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.parchmentFaint,
  },
  dataValue: {
    fontFamily: F.display,
    fontSize: 15,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.1,
  },

  // LEVEL 2 — One sentence translation
  level2: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.6,
    opacity: 0.8,
    marginBottom: 5,
  },

  // LEVEL 3 — Technical label (small)
  level3: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 0.8,
    color: C.parchmentFaint,
    opacity: 0.75,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    color: C.parchmentFaint,
  },
});

// One-sentence practical translations per dimension
function vehicleTranslation(type: string, strategy: string, authority: string): string {
  const stratMap: Record<string, string> = {
    'To Respond':                  'Act after your gut confirms — not before.',
    'Wait for the Invitation':     'Your clarity lands when it\'s invited, not when it\'s pushed.',
    'To Inform and then Initiate': 'Tell others before you move — it removes resistance.',
    'Wait a Lunar Cycle':          'Your knowing deepens across a full 28-day arc.',
  };
  return stratMap[strategy] ?? `As a ${type}, your strategy is: ${strategy}.`;
}

function roadTranslation(lifePath: number, personalYear: number): string {
  return `Life Path ${lifePath} — building depth across the long arc. Currently in a Personal Year ${personalYear}.`;
}

function stoplightTranslation(sunSign: string, moonSign: string): string {
  return `${sunSign} Sun meets the world through its lens; ${moonSign} Moon shapes what it needs to feel at home.`;
}

interface Props {
  data: Pick<
    ReportData,
    | 'hdType' | 'hdAuthority' | 'hdStrategy' | 'hdProfile'
    | 'lifePath' | 'personalYear'
    | 'sunSign' | 'moonSign' | 'risingSign'
    | 'tropicalSun' | 'tropicalMoon' | 'tropicalAsc'
  >;
}

export default function Page5Dashboard({ data }: Props) {
  const panels = [
    {
      label:    'The Vehicle',
      system:   'Human Design',
      color:    C.amber,
      dataPoints: [
        { label: 'Type',      value: data.hdType },
        { label: 'Strategy',  value: data.hdStrategy },
        { label: 'Authority', value: data.hdAuthority },
      ],
      translation: vehicleTranslation(data.hdType, data.hdStrategy, data.hdAuthority),
      technical:   `Profile ${data.hdProfile}`,
    },
    {
      label:    'The Road',
      system:   'Numerology',
      color:    C.emerald,
      dataPoints: [
        { label: 'Life Path',      value: String(data.lifePath) },
        { label: 'Personal Year',  value: String(data.personalYear) },
      ],
      translation: roadTranslation(data.lifePath, data.personalYear),
      technical:   `Personal Year calculated from birth date + ${new Date().getFullYear()}`,
    },
    {
      label:    'The Stoplight',
      system:   'Astrology',
      color:    C.crimson,
      dataPoints: [
        { label: 'Sun',     value: data.sunSign },
        { label: 'Moon',    value: data.moonSign },
        { label: 'Rising',  value: data.risingSign },
      ],
      translation: stoplightTranslation(data.sunSign, data.moonSign),
      technical:   `${data.tropicalSun} · ${data.tropicalMoon} · ASC ${data.tropicalAsc}`,
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>

      {/* Three color stripes */}
      <View style={S.colorStripes}>
        <View style={S.stripeAmber}   />
        <View style={S.stripeEmerald} />
        <View style={S.stripeCrimson} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>At A Glance</Text>
        <Text style={S.subheading}>
          Eight data points. Three systems. Your essential configuration.
        </Text>
        <View style={S.headingRule} />

        <View style={S.panels}>
          {panels.map((panel, i) => (
            <View key={panel.label} style={i === panels.length - 1 ? S.panelLast : S.panel}>

              {/* Color accent bar */}
              <View style={[S.panelBar, { backgroundColor: panel.color, height: 50 }]} />

              <View style={S.panelContent}>
                {/* Level 1 — System label */}
                <View style={S.level1Row}>
                  <Text style={[S.systemLabel, { color: panel.color }]}>
                    {panel.label}  ·  {panel.system}
                  </Text>
                </View>

                {/* Level 1 — Primary data points */}
                <View style={S.dataPoints}>
                  {panel.dataPoints.map(dp => (
                    <View key={dp.label} style={S.dataPoint}>
                      <Text style={S.dataLabel}>{dp.label}</Text>
                      <Text style={[S.dataValue, { color: panel.color }]}>{dp.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Level 2 — One sentence translation */}
                <Text style={S.level2}>{panel.translation}</Text>

                {/* Level 3 — Technical label */}
                <Text style={S.level3}>{panel.technical}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>5</Text>
      </View>
    </Page>
  );
}
