/**
 * Page 31b — Your Current Time Lord
 *
 * Reader question: "What multi-year chapter is the Stoplight in right now?"
 *
 * Firdaria — the classical (Persian) system of sequential planetary ruling
 * periods across a 75-year cycle. Sect (day/night) is derived from the Sun's
 * Whole Sign house. Gives Section 5 the same macro-timing resolution the
 * Road already has via Pinnacles.
 *
 * Layout: header → previous/current/next cards → full 75-year arc → in-depth
 * analysis of the current period → calculation methodology note.
 *
 * Companion page: 31c — Your Activated Year (annual Profection layer).
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE, AUTHORITY_PROTOCOL, calculateFirdaria } from '../tokens';
import { FIRDARIA_ANALYSIS } from './firdaria-content';
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
    marginBottom: 16, maxWidth: 460,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 16,
  },

  // ── Birth-time notice (mirrors Page 31's sensitivityNote) ─────────────────
  sensitivityNote: {
    padding: 10, gap: 4, marginBottom: 16,
    backgroundColor: '#FDF5E8',
    borderLeftWidth: 2, borderLeftColor: C.amberDim, borderLeftStyle: 'solid',
  },
  sensitivityLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.amberDim,
  },
  sensitivityText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base, lineHeight: 1.5,
  },

  // ── Previous / Current / Next cards ────────────────────────────────────────
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  card: {
    flex: 1, borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
    padding: 11, gap: 4,
  },
  cardCurrent: {
    flex: 1.12, borderWidth: 1.5, borderColor: C.crimson,
    backgroundColor: '#FBEEEE', padding: 11, gap: 4,
  },
  cardLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  cardLabelCurrent: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.crimson,
  },
  nowBadge: {
    backgroundColor: C.crimson, paddingHorizontal: 6, paddingVertical: 2,
  },
  nowBadgeText: {
    fontFamily: F.sans, fontSize: 5.5, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchment,
  },
  cardAges: { fontFamily: F.sans, fontSize: 7, fontWeight: 400, color: C.parchmentFaint },
  cardPlanet: { fontFamily: F.display, fontSize: 19, fontWeight: 400, color: C.base, lineHeight: 1.05 },
  cardPlanetCurrent: { fontFamily: F.display, fontSize: 21, fontWeight: 400, color: C.crimsonDim, lineHeight: 1.05 },
  cardTagline: { fontFamily: F.sans, fontSize: 7.5, fontWeight: 300, fontStyle: 'italic', color: C.parchmentFaint, lineHeight: 1.35 },
  remainBadge: {
    alignSelf: 'flex-start', marginTop: 2,
    backgroundColor: '#F6DADA', paddingHorizontal: 6, paddingVertical: 2,
  },
  remainBadgeText: {
    fontFamily: F.sans, fontSize: 5.5, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', color: C.crimsonDim,
  },

  // ── Full 75-year arc ────────────────────────────────────────────────────────
  arcHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  arcLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.6, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  arcSect: { fontFamily: F.sans, fontSize: 6.5, color: C.parchmentFaint },
  arcBar: { flexDirection: 'row', height: 20, marginTop: 4 },
  arcSegment: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#EDEBE5', borderRightWidth: 1, borderRightColor: '#F5F5F3',
  },
  arcSegmentCurrent: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.crimson, borderRightWidth: 1, borderRightColor: '#F5F5F3',
  },
  arcSegmentText: { fontFamily: F.sans, fontSize: 6, fontWeight: 500, color: C.parchmentFaint },
  arcSegmentTextCurrent: { fontFamily: F.sans, fontSize: 6, fontWeight: 700, color: C.parchment },
  arcFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  arcFootText: { fontFamily: F.sans, fontSize: 6.5, color: C.parchmentDim },
  arcBlock: { marginBottom: 18 },

  // ── Current-period analysis ─────────────────────────────────────────────────
  detailBlock: {
    padding: 16, gap: 8, marginBottom: 14,
    borderLeftWidth: 2, borderLeftColor: C.crimson, borderLeftStyle: 'solid',
    backgroundColor: '#FAFAF7',
  },
  detailLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    letterSpacing: 1.6, textTransform: 'uppercase', color: C.crimson,
  },
  detailQuote: {
    fontFamily: F.display, fontSize: 12.5, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.4, opacity: 0.88,
  },
  detailParagraph: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.85,
  },
  detailWatch: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 400,
    color: C.crimsonDim, lineHeight: 1.5, marginTop: 2,
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

function formatYears(n: number): string {
  return n < 1 ? '<1' : String(Math.round(n));
}

export default function Page31bTimeLord({ data }: Props) {
  const risingKnown = data.risingSign !== '—' && !!data.risingSign;
  const ascSign = risingKnown ? data.risingSign : data.sunSign;

  const firdaria = calculateFirdaria(data.birthDate, data.sunSign, ascSign);
  const { previous, current, next, sequence, ageExact, yearsRemaining } = firdaria;
  const analysis = FIRDARIA_ANALYSIS[current.planet];
  const authorityLine = AUTHORITY_PROTOCOL[data.hdAuthority]?.prompt
    ?? 'the question your Authority already asks';

  const markerPct = Math.min(100, Math.max(0, (ageExact / 75) * 100));
  const totalYears = sequence.reduce((sum, p) => sum + (p.endAge - p.startAge), 0);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Chart Patterns · Timing</Text>
        <Text style={S.heading}>Your Current Time Lord</Text>
        <Text style={S.sub}>
          Firdaria — the classical system of sequential planetary rulers. Tropical, whole sign, {firdaria.isDayChart ? 'day' : 'night'} chart.
        </Text>
        <View style={S.pageRule} />

        {!risingKnown && (
          <View style={S.sensitivityNote}>
            <Text style={S.sensitivityLabel}>Birth-Time Notice</Text>
            <Text style={S.sensitivityText}>
              Sect (day vs. night chart) is set by the Sun's house relative to a confirmed
              Ascendant. Without a confirmed birth time, this page defaults to a day-chart
              sequence — add your birth time at 3dimensions.guide/update-time for a
              verified reading.
            </Text>
          </View>
        )}

        {/* Previous / Current / Next */}
        <View style={S.cardRow}>
          <View style={S.card}>
            <Text style={S.cardLabel}>Previous</Text>
            <Text style={S.cardAges}>
              {previous ? `Ages ${previous.startAge}–${previous.endAge} · ${previous.startYear}–${previous.endYear}` : 'Birth'}
            </Text>
            <Text style={S.cardPlanet}>{previous ? previous.planet : '—'}</Text>
            <Text style={S.cardTagline}>{previous ? previous.tagline : 'The cycle begins here.'}</Text>
          </View>

          <View style={S.cardCurrent}>
            <View style={S.cardLabelRow}>
              <Text style={S.cardLabelCurrent}>Current</Text>
              <View style={S.nowBadge}><Text style={S.nowBadgeText}>Now</Text></View>
            </View>
            <Text style={S.cardAges}>Ages {current.startAge}–{current.endAge} · {current.startYear}–{current.endYear}</Text>
            <Text style={S.cardPlanetCurrent}>{current.planet}</Text>
            <Text style={S.cardTagline}>{current.tagline}</Text>
            <View style={S.remainBadge}>
              <Text style={S.remainBadgeText}>~{formatYears(yearsRemaining)} yrs remain · through {current.endYear}</Text>
            </View>
          </View>

          <View style={S.card}>
            <Text style={S.cardLabel}>Next</Text>
            <Text style={S.cardAges}>
              {next ? `Ages ${next.startAge}–${next.endAge} · ${next.startYear}–${next.endYear}` : 'Cycle repeats'}
            </Text>
            <Text style={S.cardPlanet}>{next ? next.planet : '—'}</Text>
            <Text style={S.cardTagline}>{next ? next.tagline : 'The 75-year cycle begins again.'}</Text>
          </View>
        </View>

        {/* Full 75-year arc */}
        <View style={S.arcBlock}>
          <View style={S.arcHeaderRow}>
            <Text style={S.arcLabel}>Your Full Firdaria Arc — Birth To Age 75</Text>
            <Text style={S.arcSect}>{firdaria.isDayChart ? 'Day Chart · Begins With The Sun' : 'Night Chart · Begins With The Moon'}</Text>
          </View>
          <View style={{ position: 'relative' }}>
            <View style={S.arcBar}>
              {sequence.map((p, i) => {
                const isCurrent = i === firdaria.currentIndex;
                const width = ((p.endAge - p.startAge) / totalYears) * 100;
                const wide = width > 8;
                return (
                  <View
                    key={p.planet + i}
                    style={[isCurrent ? S.arcSegmentCurrent : S.arcSegment, { width: `${width}%` }]}
                  >
                    {wide && (
                      <Text style={isCurrent ? S.arcSegmentTextCurrent : S.arcSegmentText}>
                        {p.planet === 'North Node' || p.planet === 'South Node' ? '' : p.planet}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={S.arcFootRow}>
            <Text style={S.arcFootText}>Age 0 · {sequence[0]!.startYear}</Text>
            <Text style={S.arcFootText}>Age 75 · {sequence[0]!.startYear + 75}</Text>
          </View>
        </View>

        {/* In-depth analysis of the current period */}
        <View style={S.detailBlock}>
          <Text style={S.detailLabel}>
            Your Current Time Lord — {current.planet} · Ages {current.startAge}–{current.endAge} ({current.startYear}–{current.endYear})
          </Text>
          <Text style={S.detailQuote}>{analysis.quote}</Text>
          <Text style={S.detailParagraph}>{analysis.paragraphs[0]}</Text>
          <Text style={S.detailParagraph}>{analysis.paragraphs[1]}</Text>
          <Text style={S.detailParagraph}>
            This period asks you to lean more heavily on your {data.hdAuthority} Authority than usual — {authorityLine}
          </Text>
          <Text style={S.detailWatch}>{analysis.watchFor}</Text>
        </View>

        {/* Methodology */}
        <View style={S.methodNote}>
          <Text style={S.methodLabel}>How This Is Calculated</Text>
          <Text style={S.methodText}>
            Firdaria assigns the seven classical planets and the two Lunar Nodes to sequential
            ruling periods across a 75-year cycle. The starting planet and period order are set
            by sect — day charts (Sun above the horizon) begin with the Sun; night charts begin
            with the Moon. Yours is a {firdaria.isDayChart ? 'day' : 'night'} chart. Each major period
            above subdivides into seven minor sub-periods; the complete sub-period calendar is
            available at <Text style={S.methodLink}>3dimensions.guide/library</Text>. This year's
            single-year reading continues on the next page.
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
