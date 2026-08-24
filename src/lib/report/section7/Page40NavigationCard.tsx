/**
 * Page 40 — Your Sovereign Navigation Card
 *
 * Full-page printable summary. Light background (#F5F5F3).
 * Dark pages reserved for cover, four dividers, and close only.
 *
 * UPDATED: Stoplight column now shows compact dual Tropical/Sidereal rows
 * instead of a single Sun/Moon/Rising block, so the reader can screenshot
 * both systems without crowding the card.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { TYPE_CONTENT } from '../section3/hd-content';
import { LIFE_PATH_CONTENT } from '../section4/road-content';
import type { ReportData } from '../tokens';

const STAR_SLATE = '#6D7797';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },

  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 3, backgroundColor: C.amber },
  barE:   { flex: 1, height: 3, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 3, backgroundColor: C.crimson },

  header: {
    paddingHorizontal: 36, paddingTop: 18, paddingBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.12)',
  },
  headerLeft:  { gap: 3 },
  cardLabel:   { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: C.parchmentFaint },
  readerName:  { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.1 },
  headerRight: { gap: 2, alignItems: 'flex-end' },
  dateText:    { fontFamily: F.sans, fontSize: 7, fontWeight: 300, letterSpacing: 0.8, color: C.parchmentFaint },

  columnsRow: { flexDirection: 'row', flex: 1 },
  column:     { flex: 1, paddingHorizontal: 16, paddingVertical: 14, gap: 0 },
  colDivider: { width: 0.5, backgroundColor: C.base, opacity: 0.1 },

  colHeader: {
    paddingBottom: 8, marginBottom: 8,
    borderBottomWidth: 0.5, borderBottomStyle: 'solid',  },
  colSystem: { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 2 },
  colName:   { fontFamily: F.display, fontSize: 14, fontWeight: 400, lineHeight: 1.15 },

  // Vehicle/Road data rows (unchanged)
  dataRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.07)',
  },
  dataRowLast: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingVertical: 5,
  },
  dataKey: { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', color: C.parchmentFaint, maxWidth: 64 },
  dataVal: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, color: C.base, textAlign: 'right', flex: 1, paddingLeft: 4, lineHeight: 1.3 },
  dataValLarge: { fontFamily: F.display, fontSize: 16, fontWeight: 400, textAlign: 'right', lineHeight: 1.0 },

  // ── Stoplight compact dual rows (NEW) ────────────────────────────────────
  stoplightPair: { gap: 8 },
  stopSub: {
    borderTopWidth: 1.5, borderTopStyle: 'solid', paddingTop: 5,
  },
  stopTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  stopSolidLine: { width: 11, height: 1.2 },
  stopDottedRow: { flexDirection: 'row', gap: 1.5 },
  stopDash: { width: 2, height: 1.2 },
  stopTagText: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 700,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  stopSignLine: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 400,
    color: C.base, lineHeight: 1.4,
  },
  stopSignLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 600,
    color: C.parchmentFaint,
  },

  // ── Stoplight principle line ──────────────────────────────────────────────
  stoplightPrinciple: {
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',
    fontFamily: F.display, fontSize: 8, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.45, opacity: 0.75,
  },

  moduleDivider: { width: 0.5, backgroundColor: C.base, opacity: 0.1, flexShrink: 0 },

  // Decision Protocol band
  protocolBand: {
    paddingHorizontal: 36, paddingVertical: 12,
    borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.1)',
    backgroundColor: 'rgba(13,13,14,0.03)',
  },
  protocolLabel: { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 8 },
  protocolFlow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  protocolStep:  { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0.5, borderStyle: 'solid',},
  protocolText:  { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase' },
  protocolArrow: { fontFamily: F.sans, fontSize: 8, color: C.parchmentFaint, opacity: 0.5 },
  outcomeRow:    { flexDirection: 'row', gap: 4, marginTop: 6 },
  outcomePill:   {
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.2)',
    backgroundColor: 'rgba(13,13,14,0.04)',
  },
  outcomePillText: { fontFamily: F.sans, fontSize: 6.5, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', color: C.base, opacity: 0.55 },

  frictionBand:  { paddingHorizontal: 36, paddingVertical: 10 },
  frictionLabel: { fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 7 },
  frictionItems: { flexDirection: 'row', gap: 14 },
  frictionItem:  { flex: 1, gap: 2 },
  frictionKey:   { fontFamily: F.sans, fontSize: 6, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', color: C.parchmentFaint },
  frictionVal:   { fontFamily: F.sans, fontSize: 8, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.82 },

  footerStamp: {
    paddingHorizontal: 36, paddingBottom: 14, paddingTop: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)',
  },
  stampText: { fontFamily: F.sans, fontSize: 6.5, fontWeight: 400, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum:   { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

function getSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  return formatted.trim().split(' ').pop() ?? '—';
}

interface Props { data: ReportData & { siderealMoon?: string }; }

export default function Page40NavigationCard({ data }: Props) {
  const tc = TYPE_CONTENT[data.hdType] ?? TYPE_CONTENT['Generator']!;
  const lp = LIFE_PATH_CONTENT[data.lifePath] ?? LIFE_PATH_CONTENT[1]!;

  const currentPinnacle = data.pinnacles[data.currentPinnacleIndex];
  const genDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const tropSun = data.sunSign, tropMoon = data.moonSign, tropRising = data.risingSign;
  const sidSun  = getSign(data.siderealSun);
  const sidMoon = data.siderealMoon ? getSign(data.siderealMoon) : '—';
  const sidRising = getSign(data.siderealAsc);

  const vehicleRows = [
    { key: 'Type',      val: data.hdType,      large: false },
    { key: 'Strategy',  val: data.hdStrategy,  large: false },
    { key: 'Authority', val: data.hdAuthority, large: false },
    { key: 'Profile',   val: data.hdProfile,   large: false },
    { key: 'Signature', val: tc.signature,     large: false },
  ];

  const roadRows = [
    { key: 'Life Path',     val: data.lifePathDisplay,  large: true },
    { key: 'Personal Yr',  val: String(data.personalYear), large: false },
    { key: 'Pinnacle',      val: currentPinnacle
        ? `${currentPinnacle.number} (${currentPinnacle.startAge}+)` : '—', large: false },
    { key: 'Direction',     val: lp.name, large: false },
  ];

  const frictionItems = [
    { key: 'Vehicle signal',  color: C.amber,   val: `${tc.notSelf}: ${tc.watchFor.split('—')[0]?.trim() ?? tc.watchFor}` },
    { key: 'Road pattern',    color: C.emerald, val: lp.shadow.length > 55 ? lp.shadow.substring(0, 55) + '…' : lp.shadow },
    { key: 'Stoplight check', color: C.crimson, val: 'Use the Stoplight to notice context. Use Authority to decide.' },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.header}>
        <View style={S.headerLeft}>
          <Text style={S.cardLabel}>Sovereign Navigation Card · T3D</Text>
          <Text style={S.readerName}>{data.firstName} {data.lastName}</Text>
        </View>
        <View style={S.headerRight}>
          <Text style={S.dateText}>Generated {genDate}</Text>
          <Text style={S.dateText}>3dimensions.guide</Text>
        </View>
      </View>

      <View style={S.columnsRow}>

        {/* ── Vehicle column (unchanged) ────────────────────────────────── */}
        <View style={S.column}>
          <View style={[S.colHeader, { borderBottomColor: C.amber }]}>
            <Text style={[S.colSystem, { color: C.amber }]}>The Vehicle · Human Design</Text>
            <Text style={[S.colName, { color: C.amber }]}>Vehicle</Text>
          </View>
          {vehicleRows.map((row, ri) => (
            <View key={row.key} style={ri === vehicleRows.length - 1 ? S.dataRowLast : S.dataRow}>
              <Text style={S.dataKey}>{row.key}</Text>
              <Text style={S.dataVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        <View style={S.moduleDivider} />

        {/* ── Road column (unchanged) ───────────────────────────────────── */}
        <View style={S.column}>
          <View style={[S.colHeader, { borderBottomColor: C.emerald }]}>
            <Text style={[S.colSystem, { color: C.emerald }]}>The Road · Numerology</Text>
            <Text style={[S.colName, { color: C.emerald }]}>Road</Text>
          </View>
          {roadRows.map((row, ri) => (
            <View key={row.key} style={ri === roadRows.length - 1 ? S.dataRowLast : S.dataRow}>
              <Text style={S.dataKey}>{row.key}</Text>
              {row.large ? (
                <Text style={[S.dataVal, { color: C.emerald, fontFamily: F.display, fontSize: 16 }]}>{row.val}</Text>
              ) : (
                <Text style={S.dataVal}>{row.val}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={S.moduleDivider} />

        {/* ── Stoplight column (UPDATED — compact dual rows) ────────────── */}
        <View style={S.column}>
          <View style={[S.colHeader, { borderBottomColor: C.crimson }]}>
            <Text style={[S.colSystem, { color: C.crimson }]}>The Stoplight · Astrology</Text>
            <Text style={[S.colName, { color: C.crimson }]}>Stoplight</Text>
          </View>

          <View style={S.stoplightPair}>

            {/* Tropical row */}
            <View style={[S.stopSub, { borderTopColor: C.crimson }]}>
              <View style={S.stopTagRow}>
                <View style={[S.stopSolidLine, { backgroundColor: C.crimson }]} />
                <Text style={[S.stopTagText, { color: C.crimson }]}>Tropical</Text>
              </View>
              <Text style={S.stopSignLine}>
                <Text style={S.stopSignLabel}>Sun </Text>{tropSun}{'  /  '}
                <Text style={S.stopSignLabel}>Moon </Text>{tropMoon}{'  /  '}
                <Text style={S.stopSignLabel}>Rising </Text>{tropRising}
              </Text>
            </View>

            {/* Sidereal row */}
            <View style={[S.stopSub, { borderTopColor: STAR_SLATE }]}>
              <View style={S.stopTagRow}>
                <View style={S.stopDottedRow}>
                  {[0,1,2,3].map(i => (
                    <View key={i} style={[S.stopDash, { backgroundColor: STAR_SLATE }]} />
                  ))}
                </View>
                <Text style={[S.stopTagText, { color: STAR_SLATE }]}>Sidereal</Text>
              </View>
              <Text style={S.stopSignLine}>
                <Text style={S.stopSignLabel}>Sun </Text>{sidSun}{'  /  '}
                <Text style={S.stopSignLabel}>Moon </Text>{sidMoon}{'  /  '}
                <Text style={S.stopSignLabel}>Rising </Text>{sidRising}
              </Text>
            </View>
          </View>

          <Text style={S.stoplightPrinciple}>
            Use the Stoplight to notice context. Use Authority to decide.
          </Text>
        </View>
      </View>

      {/* Decision Protocol */}
      <View style={S.protocolBand}>
        <Text style={S.protocolLabel}>Decision Protocol — Run In Order</Text>
        <View style={S.protocolFlow}>
          {[
            { label: 'VEHICLE', color: C.amber },
            { label: 'ROAD',    color: C.emerald },
            { label: 'STOPLIGHT', color: C.crimson },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <View style={[S.protocolStep, { borderColor: step.color }]}>
                <Text style={[S.protocolText, { color: step.color }]}>{step.label}</Text>
              </View>
              {i < arr.length - 1 && <Text style={S.protocolArrow}>→</Text>}
            </React.Fragment>
          ))}
          <Text style={S.protocolArrow}>→</Text>
          <View style={S.outcomeRow}>
            {['ACT', 'WAIT', 'DECLINE', 'GATHER'].map(o => (
              <View key={o} style={S.outcomePill}>
                <Text style={S.outcomePillText}>{o}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Signature Friction */}
      <View style={S.frictionBand}>
        <Text style={S.frictionLabel}>Signature Friction — What To Watch For</Text>
        <View style={S.frictionItems}>
          {frictionItems.map(f => (
            <View key={f.key} style={S.frictionItem}>
              <Text style={[S.frictionKey, { color: f.color }]}>{f.key}</Text>
              <Text style={S.frictionVal}>{f.val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={S.footerStamp}>
        <Text style={S.stampText}>T3D Sovereign Report · {data.firstName} {data.lastName} · {genDate}</Text>
        <Text style={S.pageNum}>40</Text>
      </View>
    </Page>
  );
}
