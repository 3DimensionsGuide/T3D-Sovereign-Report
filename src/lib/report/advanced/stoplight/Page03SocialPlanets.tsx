/**
 * Advanced Sovereign Report — Stoplight Section — Social Planets
 *
 * Continues Page02PersonalPlanets.tsx with the last two of the five "still
 * personal to you" planets: Jupiter (where you naturally grow and expand)
 * and Saturn (where you get tested hardest — and where real, earned
 * mastery eventually comes because of that testing, not in spite of it).
 * Same card grammar as Page02, just two cards instead of three, with more
 * room given to each since Saturn in particular rewards a fuller read.
 * Also shows each planet's house (via getPlanetHouse(), same as Page02 and
 * Page04OuterPlanets.tsx) for consistency across the whole section.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { JUPITER_CONTENT, SATURN_CONTENT, SOCIAL_PLANETS_MECHANISM, getPlanetHouse } from './stoplight-content';
import type { ReportData } from '../../tokens';

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  crimsonLine: { width: PAGE.width, height: 1.5, backgroundColor: C.crimson },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 18, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 18 },

  mechanismBlock: { marginBottom: 16, gap: 5 },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.crimson,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  stack: { gap: 14 },
  card: {
    padding: 16, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  planetBadge: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase', color: '#FFFFFF', backgroundColor: C.crimson,
    paddingVertical: 5, paddingHorizontal: 9, width: 70, textAlign: 'center',
  },
  headerText: { flex: 1 },
  signRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  signLabel: {
    fontFamily: F.display, fontSize: 15, fontWeight: 400, color: C.base, lineHeight: 1.2,
  },
  housePill: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1,
    textTransform: 'uppercase', color: C.crimsonDim, backgroundColor: C.crimsonLight,
    paddingVertical: 3, paddingHorizontal: 7,
  },
  siderealNote: { fontFamily: F.sans, fontSize: 7.5, fontWeight: 300, color: C.parchmentFaint, marginTop: 2 },

  themeText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.9, marginBottom: 8,
  },
  detailRow: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  detailLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.crimsonDim, width: 54,
  },
  detailText: { flex: 1, fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.85 },
  detailDivider: { paddingTop: 8, marginTop: 3, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)' },

  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)', gap: 8,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface PlanetRow {
  badge: string;
  tropicalSign: string;
  siderealSign: string;
  tropicalHouse: number | null;
  siderealHouse: number | null;
  content: { theme: string; gift: string; friction: string } | undefined;
}

interface Props {
  data: Pick<
    ReportData,
    'tropicalJupiter' | 'tropicalSaturn' | 'tropicalAsc' |
    'siderealJupiter' | 'siderealSaturn' | 'siderealAsc'
  >;
}

export default function Page03SocialPlanets({ data }: Props) {
  const rows: PlanetRow[] = [
    {
      badge: 'Jupiter', tropicalSign: data.tropicalJupiter, siderealSign: data.siderealJupiter,
      tropicalHouse: getPlanetHouse(data.tropicalJupiter, data.tropicalAsc),
      siderealHouse: getPlanetHouse(data.siderealJupiter, data.siderealAsc),
      content: JUPITER_CONTENT[data.tropicalJupiter],
    },
    {
      badge: 'Saturn', tropicalSign: data.tropicalSaturn, siderealSign: data.siderealSaturn,
      tropicalHouse: getPlanetHouse(data.tropicalSaturn, data.tropicalAsc),
      siderealHouse: getPlanetHouse(data.siderealSaturn, data.siderealAsc),
      content: SATURN_CONTENT[data.tropicalSaturn],
    },
  ];
  const hasData = rows.every(r => r.tropicalSign && r.tropicalHouse !== null && r.content);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.crimsonLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Stoplight</Text>
        <Text style={S.heading}>Your Social Planets</Text>
        <Text style={S.subheading}>
          The last two of the five that are still personal to you: where you naturally
          expand, and where you get tested until you&rsquo;ve earned real mastery.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>Why These Planets Are Social to You</Text>
          <Text style={S.mechanismText}>{SOCIAL_PLANETS_MECHANISM}</Text>
        </View>

        {hasData ? (
          <View style={S.stack}>
            {rows.map((r) => {
              const differs = (r.siderealSign && r.siderealSign !== r.tropicalSign) || r.siderealHouse !== r.tropicalHouse;
              return (
                <View style={S.card} key={r.badge}>
                  <View style={S.cardHeaderRow}>
                    <Text style={S.planetBadge}>{r.badge}</Text>
                    <View style={S.headerText}>
                      <View style={S.signRow}>
                        <Text style={S.signLabel}>{r.tropicalSign}</Text>
                        <Text style={S.housePill}>{ORDINAL[r.tropicalHouse!]} House</Text>
                      </View>
                      {differs && (
                        <Text style={S.siderealNote}>
                          Sidereal lens: {r.siderealSign} · {ORDINAL[r.siderealHouse!]} House
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={S.themeText}>{r.content!.theme}</Text>
                  <View style={S.detailRow}>
                    <Text style={S.detailLabel}>Gift</Text>
                    <Text style={S.detailText}>{r.content!.gift}</Text>
                  </View>
                  <View style={[S.detailRow, S.detailDivider]}>
                    <Text style={S.detailLabel}>Friction</Text>
                    <Text style={S.detailText}>{r.content!.friction}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>Placement Data Unavailable</Text>
            <Text style={S.missingText}>
              Your Jupiter and Saturn placements are calculated from your full birth data.
              This layer will populate once that data is on file.
            </Text>
          </View>
        )}
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
