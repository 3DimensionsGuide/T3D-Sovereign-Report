/**
 * Page 5 — Your Coordinates At A Glance
 *
 * Grid type: #2 Dashboard — three 4-column modules, side by side.
 *
 * UPDATED: Stoplight module now shows paired Tropical/Sidereal sub-modules
 * instead of a single Sun/Moon/Rising row. Compact — signs only, no
 * interpretation. Solid Crimson tag for Tropical, dotted Star Slate tag
 * for Sidereal. Vehicle and Road modules unchanged.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { GRID } from '../shared/grid';
import type { ReportData } from '../tokens';

const STAR_SLATE = '#6D7797';
const MODULE_GAP = GRID.gap;

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },

  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 3, backgroundColor: C.amber },
  barE:   { flex: 1, height: 3, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 3, backgroundColor: C.crimson },

  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 5,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  rule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 20,
  },

  dashRow: { flexDirection: 'row', gap: MODULE_GAP, flex: 1 },
  module:  { flex: GRID.dashboard.module, flexDirection: 'column', gap: 0 },
  moduleBar: { height: 2.5, width: '100%', marginBottom: 12 },

  moduleLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3,
  },
  moduleSystem: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 300,
    letterSpacing: 1, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 14,
  },

  // Vehicle/Road data rows (unchanged)
  dataRows: { flexDirection: 'column', gap: 0, marginBottom: 12 },
  dataRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.08)',
  },
  dataRowLast: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 5,
  },
  dataKey: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 1.2, textTransform: 'uppercase', color: C.parchmentFaint,
    maxWidth: 55, flexShrink: 0,
  },
  dataVal: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400,
    textAlign: 'right', flex: 1, paddingLeft: 4, lineHeight: 1.15,
  },
  dataValSmall: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 400,
    textAlign: 'right', flex: 1, paddingLeft: 4, lineHeight: 1.3, color: C.base,
  },

  translation: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.base, lineHeight: 1.5, marginBottom: 8, opacity: 0.82,
  },
  technical: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 400,
    letterSpacing: 0.5, color: C.parchmentFaint,
  },

  moduleDivider: { width: 0.5, backgroundColor: C.base, opacity: 0.1, flexShrink: 0 },

  // ── Stoplight paired sub-modules (NEW) ───────────────────────────────────
  stoplightPair: { gap: 10 },

  subModule: {
    borderTopWidth: 1.5,
    borderTopStyle: 'solid',
    paddingTop: 7,
  },

  // System tag row — solid or dotted line + text label
  tagRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6,
  },
  solidTagLine: {
    width: 14, height: 1.3,
  },
  dottedTagRow: {
    flexDirection: 'row', gap: 2,
  },
  dottedTagDash: {
    width: 2.5, height: 1.3,
  },
  tagText: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // Compact sign rows
  signRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 2.5,
  },
  signKey: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 0.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  signVal: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 600,
    color: C.base,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

function vehicleTranslation(strategy: string): string {
  const map: Record<string, string> = {
    'To Respond':                  'Act after your gut confirms — not before.',
    'Wait for the Invitation':     'Your clarity lands when it\'s invited, not pushed.',
    'To Inform and then Initiate': 'Inform before you move — it removes resistance.',
    'Wait a Lunar Cycle':          'Clarity deepens across the full 28-day cycle.',
  };
  return map[strategy] ?? strategy;
}

function getSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  return formatted.trim().split(' ').pop() ?? '—';
}

interface Props {
  data: Pick<
    ReportData,
    | 'hdType' | 'hdAuthority' | 'hdStrategy' | 'hdProfile'
    | 'lifePath' | 'lifePathDisplay' | 'personalYear'
    | 'sunSign' | 'moonSign' | 'risingSign'
    | 'tropicalSun' | 'tropicalMoon' | 'tropicalAsc'
    | 'siderealSun' | 'siderealAsc'
  > & { siderealMoon?: string };
}

export default function Page5Dashboard({ data }: Props) {
  const tropSun    = data.sunSign;
  const tropMoon   = data.moonSign;
  const tropRising = data.risingSign;

  const sidSun    = getSign(data.siderealSun);
  const sidMoon   = data.siderealMoon ? getSign(data.siderealMoon) : '—';
  const sidRising = getSign(data.siderealAsc);

  const vehicleRows = [
    { key: 'Type',      val: data.hdType,      large: false },
    { key: 'Strategy',  val: data.hdStrategy,  large: false },
    { key: 'Authority', val: data.hdAuthority, large: false },
  ];

  const roadRows = [
    { key: 'Life Path',    val: data.lifePathDisplay,      large: true },
    { key: 'Personal Yr', val: String(data.personalYear), large: false },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>At A Glance</Text>
        <Text style={S.sub}>
          Three systems. Your essential configuration at a glance.
        </Text>
        <View style={S.rule} />

        <View style={S.dashRow}>

          {/* ── Vehicle module (unchanged) ─────────────────────────────── */}
          <View style={S.module}>
            <View style={[S.moduleBar, { backgroundColor: C.amber }]} />
            <Text style={[S.moduleLabel, { color: C.amber }]}>The Vehicle</Text>
            <Text style={S.moduleSystem}>Human Design</Text>
            <View style={S.dataRows}>
              {vehicleRows.map((row, ri) => (
                <View key={row.key} style={ri === vehicleRows.length - 1 ? S.dataRowLast : S.dataRow}>
                  <Text style={S.dataKey}>{row.key}</Text>
                  <Text style={S.dataValSmall}>{row.val}</Text>
                </View>
              ))}
            </View>
            <Text style={S.translation}>{vehicleTranslation(data.hdStrategy)}</Text>
            <Text style={S.technical}>Profile {data.hdProfile}</Text>
          </View>

          <View style={S.moduleDivider} />

          {/* ── Road module (unchanged) ────────────────────────────────── */}
          <View style={S.module}>
            <View style={[S.moduleBar, { backgroundColor: C.emerald }]} />
            <Text style={[S.moduleLabel, { color: C.emerald }]}>The Road</Text>
            <Text style={S.moduleSystem}>Numerology</Text>
            <View style={S.dataRows}>
              {roadRows.map((row, ri) => (
                <View key={row.key} style={ri === roadRows.length - 1 ? S.dataRowLast : S.dataRow}>
                  <Text style={S.dataKey}>{row.key}</Text>
                  {row.large ? (
                    <Text style={[S.dataVal, { color: C.emerald }]}>{row.val}</Text>
                  ) : (
                    <Text style={S.dataValSmall}>{row.val}</Text>
                  )}
                </View>
              ))}
            </View>
            <Text style={S.translation}>
              LP {data.lifePathDisplay} — a pattern of growth, not a fixed destination.
            </Text>
            <Text style={S.technical}>Personal Year {data.personalYear} · {new Date().getFullYear()}</Text>
          </View>

          <View style={S.moduleDivider} />

          {/* ── Stoplight module (UPDATED — paired Tropical/Sidereal) ──── */}
          <View style={S.module}>
            <View style={[S.moduleBar, { backgroundColor: C.crimson }]} />
            <Text style={[S.moduleLabel, { color: C.crimson }]}>The Stoplight</Text>
            <Text style={S.moduleSystem}>Astrology</Text>

            <View style={S.stoplightPair}>

              {/* Tropical sub-module — solid crimson tag */}
              <View style={[S.subModule, { borderTopColor: C.crimson }]}>
                <View style={S.tagRow}>
                  <View style={[S.solidTagLine, { backgroundColor: C.crimson }]} />
                  <Text style={[S.tagText, { color: C.crimson }]}>Tropical</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Sun</Text>
                  <Text style={S.signVal}>{tropSun}</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Moon</Text>
                  <Text style={S.signVal}>{tropMoon}</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Rising</Text>
                  <Text style={S.signVal}>{tropRising}</Text>
                </View>
              </View>

              {/* Sidereal sub-module — dotted Star Slate tag */}
              <View style={[S.subModule, { borderTopColor: STAR_SLATE }]}>
                <View style={S.tagRow}>
                  <View style={S.dottedTagRow}>
                    {[0,1,2,3,4].map(i => (
                      <View key={i} style={[S.dottedTagDash, { backgroundColor: STAR_SLATE }]} />
                    ))}
                  </View>
                  <Text style={[S.tagText, { color: STAR_SLATE }]}>Sidereal</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Sun</Text>
                  <Text style={S.signVal}>{sidSun}</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Moon</Text>
                  <Text style={S.signVal}>{sidMoon}</Text>
                </View>
                <View style={S.signRow}>
                  <Text style={S.signKey}>Rising</Text>
                  <Text style={S.signVal}>{sidRising}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>5</Text>
      </View>
    </Page>
  );
}
