/**
 * Advanced Sovereign Report — Stoplight Section — Outer Planets
 *
 * The last three chart points: Uranus, Neptune, and Pluto. These move so
 * slowly — years or decades in a single sign — that their sign is shared
 * by an entire generation, not personal to the reader. What IS personal
 * is which house each one landed in at the reader's exact birth moment,
 * computed via the same Whole-Sign house math already built for Firdaria
 * (getPlanetHouse() in stoplight-content.ts, wrapping the exported
 * firdariaWholeSignHouse() from tokens.ts) — one house number per lens,
 * since the house depends on both the planet's sign and the Ascendant's
 * sign, and both can shift between Tropical and Sidereal.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { URANUS_HOUSE_CONTENT, NEPTUNE_HOUSE_CONTENT, PLUTO_HOUSE_CONTENT, OUTER_PLANETS_MECHANISM, getPlanetHouse } from './stoplight-content';
import type { ReportData } from '../../tokens';

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
  houseLabel: {
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

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

interface PlanetRow {
  badge: string;
  tropicalHouse: number | null;
  siderealHouse: number | null;
  content: { theme: string; gift: string; friction: string } | undefined;
}

interface Props {
  data: Pick<
    ReportData,
    'tropicalUranus' | 'tropicalNeptune' | 'tropicalPluto' | 'tropicalAsc' |
    'siderealUranus' | 'siderealNeptune' | 'siderealPluto' | 'siderealAsc'
  >;
}

export default function Page04OuterPlanets({ data }: Props) {
  const tUranus = getPlanetHouse(data.tropicalUranus, data.tropicalAsc);
  const sUranus = getPlanetHouse(data.siderealUranus, data.siderealAsc);
  const tNeptune = getPlanetHouse(data.tropicalNeptune, data.tropicalAsc);
  const sNeptune = getPlanetHouse(data.siderealNeptune, data.siderealAsc);
  const tPluto = getPlanetHouse(data.tropicalPluto, data.tropicalAsc);
  const sPluto = getPlanetHouse(data.siderealPluto, data.siderealAsc);

  const rows: PlanetRow[] = [
    { badge: 'Uranus', tropicalHouse: tUranus, siderealHouse: sUranus, content: tUranus ? URANUS_HOUSE_CONTENT[tUranus] : undefined },
    { badge: 'Neptune', tropicalHouse: tNeptune, siderealHouse: sNeptune, content: tNeptune ? NEPTUNE_HOUSE_CONTENT[tNeptune] : undefined },
    { badge: 'Pluto', tropicalHouse: tPluto, siderealHouse: sPluto, content: tPluto ? PLUTO_HOUSE_CONTENT[tPluto] : undefined },
  ];
  const hasData = rows.every(r => r.tropicalHouse !== null && r.content);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.crimsonLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Stoplight</Text>
        <Text style={S.heading}>Your Outer Planets</Text>
        <Text style={S.subheading}>
          Uranus, Neptune, and Pluto — generational by sign, but personal by house:
          the specific area of your life each one is charging.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>Why These Are Read by House, Not Sign</Text>
          <Text style={S.mechanismText}>{OUTER_PLANETS_MECHANISM}</Text>
        </View>

        {hasData ? (
          <View style={S.stack}>
            {rows.map((r) => {
              const differs = r.siderealHouse !== null && r.siderealHouse !== r.tropicalHouse;
              return (
                <View style={S.card} key={r.badge}>
                  <View style={S.cardHeaderRow}>
                    <Text style={S.planetBadge}>{r.badge}</Text>
                    <View style={S.headerText}>
                      <Text style={S.houseLabel}>{ORDINAL[r.tropicalHouse!]} House</Text>
                      {differs && <Text style={S.siderealNote}>Sidereal lens: {ORDINAL[r.siderealHouse!]} House</Text>}
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
              Your Uranus, Neptune, and Pluto houses are calculated from your full birth data
              and Ascendant. This layer will populate once that data is on file.
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
