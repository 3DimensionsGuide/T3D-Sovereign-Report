/**
 * Advanced Sovereign Report — Stoplight Section — Personal Planets
 *
 * The base report's Big Three (Sun, Moon, Rising) only covers three of the
 * eleven points in the chart. This page picks up the next three: Mercury
 * (how you think and communicate), Venus (what you love and value), and
 * Mars (how you act, pursue, and get angry). All three move fast enough
 * that their sign is genuinely personal — the same way the Sun's is.
 *
 * Each card is keyed primarily by the Tropical sign (the working lens
 * used throughout the base report's default placement pages), with the
 * Sidereal sign surfaced as a compact secondary reference when it lands
 * in a different sign — same "meaning doesn't change by lens, only which
 * sign you land in does" architecture used on the Big Three pages, but
 * kept to one interpretive pass per planet rather than a full duplicate
 * page per lens, to keep this section's density in line with the Road
 * section's card-stack pages.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { MERCURY_CONTENT, VENUS_CONTENT, MARS_CONTENT, PERSONAL_PLANETS_MECHANISM } from './stoplight-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
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

  stack: { gap: 8 },
  card: {
    padding: 11, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  planetBadge: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 700, letterSpacing: 1.4,
    textTransform: 'uppercase', color: '#FFFFFF', backgroundColor: C.crimson,
    paddingVertical: 4, paddingHorizontal: 8, width: 62, textAlign: 'center',
  },
  headerText: { flex: 1 },
  signLabel: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.base, lineHeight: 1.2,
  },
  siderealNote: { fontFamily: F.sans, fontSize: 7.5, fontWeight: 300, color: C.parchmentFaint, marginTop: 1 },

  themeText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.42, opacity: 0.9, marginBottom: 5,
  },
  detailRow: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  detailLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500, letterSpacing: 1.2,
    textTransform: 'uppercase', color: C.crimsonDim, width: 46,
  },
  detailText: { flex: 1, fontFamily: F.sans, fontSize: 8, fontWeight: 300, color: C.base, lineHeight: 1.4, opacity: 0.82 },
  detailDivider: { paddingTop: 5, marginTop: 2, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)' },

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
  content: { theme: string; gift: string; friction: string } | undefined;
}

interface Props {
  data: Pick<ReportData, 'tropicalMercury' | 'tropicalVenus' | 'tropicalMars' | 'siderealMercury' | 'siderealVenus' | 'siderealMars'>;
}

export default function Page02PersonalPlanets({ data }: Props) {
  const rows: PlanetRow[] = [
    { badge: 'Mercury', tropicalSign: data.tropicalMercury, siderealSign: data.siderealMercury, content: MERCURY_CONTENT[data.tropicalMercury] },
    { badge: 'Venus', tropicalSign: data.tropicalVenus, siderealSign: data.siderealVenus, content: VENUS_CONTENT[data.tropicalVenus] },
    { badge: 'Mars', tropicalSign: data.tropicalMars, siderealSign: data.siderealMars, content: MARS_CONTENT[data.tropicalMars] },
  ];
  const hasData = rows.every(r => r.tropicalSign && r.content);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.crimsonLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Stoplight</Text>
        <Text style={S.heading}>Your Personal Planets</Text>
        <Text style={S.subheading}>
          Past the Big Three: how you think, what you love, and how you act — three more
          placements that are just as personally yours.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>Why These Are Personal to You</Text>
          <Text style={S.mechanismText}>{PERSONAL_PLANETS_MECHANISM}</Text>
        </View>

        {hasData ? (
          <View style={S.stack}>
            {rows.map((r) => {
              const differs = r.siderealSign && r.siderealSign !== r.tropicalSign;
              return (
                <View style={S.card} key={r.badge}>
                  <View style={S.cardHeaderRow}>
                    <Text style={S.planetBadge}>{r.badge}</Text>
                    <View style={S.headerText}>
                      <Text style={S.signLabel}>{r.tropicalSign}</Text>
                      {differs && <Text style={S.siderealNote}>Sidereal lens: {r.siderealSign}</Text>}
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
              Your Mercury, Venus, and Mars placements are calculated from your full birth data.
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
