/**
 * Page 31c — Your Activated Year
 *
 * Reader question: "What is this specific year for, astrologically?"
 *
 * Annual Profections — advances one Whole Sign house per year of life from
 * the natal Ascendant; that house's ruler is the "Lord of the Year." Shown
 * alongside the Firdaria Major Time Lord (page 31b) as the single-year
 * companion to that multi-year chapter — the same resolution pairing
 * Personal Year already gives the Road via Pinnacles.
 *
 * Companion page: 31b — Your Current Time Lord (multi-year Firdaria layer).
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE, PERSONAL_YEAR_THEMES, calculateFirdaria, calculateProfection } from '../tokens';
import { PINNACLE_THEMES } from '../section4/road-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page:   { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 36 },

  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5,
    marginBottom: 18, maxWidth: 460,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 18,
  },

  // ── Activated Planets (dark block) ───────────────────────────────────────────
  darkBlock: { backgroundColor: C.base, padding: 20, gap: 14, marginBottom: 18 },
  darkLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.amber, opacity: 0.85,
  },
  darkColsRow: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  darkCol: { flex: 1, gap: 3 },
  darkColLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(245,245,243,0.55)',
  },
  darkColPlanet: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.parchment },
  darkColSub: { fontFamily: F.sans, fontSize: 7.5, color: 'rgba(245,245,243,0.5)' },
  darkEquals: {
    fontFamily: F.sans, fontSize: 16, fontWeight: 300, color: C.amber, paddingTop: 14,
  },
  darkRule: { height: 0.5, backgroundColor: 'rgba(245,245,243,0.15)' },
  convergeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.amber, paddingHorizontal: 8, paddingVertical: 3,
  },
  convergeBadgeText: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', color: C.base,
  },
  darkBody: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: 'rgba(245,245,243,0.82)', lineHeight: 1.55,
  },

  // ── Cross-System Reading ─────────────────────────────────────────────────────
  crossBlock: {
    padding: 15, gap: 8, marginBottom: 18,
    backgroundColor: '#F3F1EC', borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
  },
  systemBarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  systemDot: { width: 4, height: 4 },
  systemLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  crossHeader: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 600,
    letterSpacing: 1, textTransform: 'uppercase', color: C.parchmentFaint,
    marginLeft: 'auto',
  },
  crossBody: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },

  // ── Methodology note ─────────────────────────────────────────────────────────
  methodNote: {
    padding: 10, gap: 3,
    backgroundColor: '#FDF5E8',
    borderLeftWidth: 2, borderLeftColor: C.amberDim, borderLeftStyle: 'solid',
  },
  methodLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.amberDim,
  },
  methodText: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5,
  },
  methodLink: { color: C.emerald },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props { data: ReportData; }

export default function Page31cActivatedYear({ data }: Props) {
  const risingKnown = data.risingSign !== '—' && !!data.risingSign;
  const ascSign = risingKnown ? data.risingSign : data.sunSign;

  const firdaria = calculateFirdaria(data.birthDate, data.sunSign, ascSign);
  const profection = calculateProfection(data.birthDate, ascSign);
  const converges = firdaria.current.planet === profection.lord;

  const pinnacle = data.pinnacles?.[data.currentPinnacleIndex ?? 1];
  const pinnacleTheme = pinnacle ? PINNACLE_THEMES[pinnacle.number] : null;
  const pyTheme = PERSONAL_YEAR_THEMES[data.personalYear] ?? PERSONAL_YEAR_THEMES[1]!;

  const convergeBody = converges
    ? `Your Firdaria Time Lord and this year's Profection Lord are the same planet. This convergence happens roughly once every seven years — when it lands, the ruling planet's themes carry double weight for the year, not just the decade. Read your Time Lord page (previous) as the terrain; read this page as the current weather inside it.`
    : `${firdaria.current.planet} sets the multi-year terrain (ages ${firdaria.current.startAge}–${firdaria.current.endAge}), while ${profection.lord} rules this specific year via Annual Profection — House ${profection.house}, ${profection.sign}. When the two differ, treat the Major Time Lord as the long chapter and the Lord of the Year as this year's specific weather inside it — not a contradiction, just two resolutions of the same clock.`;

  const crossBody = pinnacleTheme
    ? `Three systems, one reading. This ${firdaria.current.planet} period sits inside your Pinnacle ${pinnacle!.number} — ${pinnacle!.endAge ? `ages ${pinnacle!.startAge}–${pinnacle!.endAge}` : `age ${pinnacle!.startAge}+`}, ${pinnacleTheme.theme} — and your Personal Year ${data.personalYear}, ${pyTheme.title}. Read all three together rather than any one alone; where they agree is where the signal is strongest.`
    : `Three systems, one reading. This ${firdaria.current.planet} period sits alongside your Personal Year ${data.personalYear}, ${pyTheme.title}. Read the two together rather than either alone; where they agree is where the signal is strongest.`;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Chart Patterns · Timing</Text>
        <Text style={S.heading}>Your Activated Year</Text>
        <Text style={S.sub}>
          Annual Profections — this year's single-year ruler, cross-checked against your Firdaria Time Lord.
        </Text>
        <View style={S.pageRule} />

        {/* Activated Planets */}
        <View style={S.darkBlock}>
          <Text style={S.darkLabel}>This Year's Activated Planets</Text>

          <View style={S.darkColsRow}>
            <View style={S.darkCol}>
              <Text style={S.darkColLabel}>Major Time Lord · Multi-Year</Text>
              <Text style={S.darkColPlanet}>{firdaria.current.planet}</Text>
              <Text style={S.darkColSub}>Ages {firdaria.current.startAge}–{firdaria.current.endAge} · {firdaria.current.startYear}–{firdaria.current.endYear}</Text>
            </View>
            <Text style={S.darkEquals}>{converges ? '=' : '≠'}</Text>
            <View style={S.darkCol}>
              <Text style={S.darkColLabel}>Lord Of The Year · Annual Profection</Text>
              <Text style={S.darkColPlanet}>{profection.lord}</Text>
              <Text style={S.darkColSub}>House {profection.house} · {profection.sign} · Age {profection.age}–{profection.age + 1}</Text>
            </View>
          </View>

          <View style={S.darkRule} />

          {converges && (
            <View style={S.convergeBadge}>
              <Text style={S.convergeBadgeText}>Double {firdaria.current.planet} Year</Text>
            </View>
          )}

          <Text style={S.darkBody}>{convergeBody}</Text>
        </View>

        {/* Cross-System Reading */}
        <View style={S.crossBlock}>
          <View style={S.systemBarRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[S.systemDot, { backgroundColor: C.amber }]} />
              <Text style={[S.systemLabel, { color: C.amberDim }]}>Vehicle</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[S.systemDot, { backgroundColor: C.emerald }]} />
              <Text style={[S.systemLabel, { color: C.emerald }]}>Road</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={[S.systemDot, { backgroundColor: C.crimson }]} />
              <Text style={[S.systemLabel, { color: C.crimson }]}>Stoplight</Text>
            </View>
            <Text style={S.crossHeader}>Cross-System Reading</Text>
          </View>
          <Text style={S.crossBody}>{crossBody}</Text>
        </View>

        {/* Methodology */}
        <View style={S.methodNote}>
          <Text style={S.methodLabel}>How This Is Calculated</Text>
          <Text style={S.methodText}>
            Annual Profections advance one Whole Sign house per year of life, counted from the
            natal Ascendant — age 0 profects to the 1st House, age 1 to the 2nd, and so on. That
            house's ruling planet becomes the year's Lord. Full year-by-year profection tables
            are available at <Text style={S.methodLink}>3dimensions.guide/library</Text>.
          </Text>
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>The Base Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
