/**
 * Page — Your T3D Signature
 *
 * The proprietary synthesis paragraph. Placed in Section 2 (Your Coordinates)
 * after the Personal Map and before the Decision Protocol.
 *
 * This is the most distinctive page in the report: 180–260 words generated
 * specifically for this reader's configuration — not pulled from a template.
 *
 * The paragraph answers five questions:
 *   1. What is the Vehicle most reliably asking for in decisions?
 *   2. What is the Road asking to learn, build, or mature through?
 *   3. What is the Stoplight highlighting about pace or environment?
 *   4. What is the most likely cross-system friction?
 *   5. What is the next small experiment?
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page:    { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar:  { flexDirection: 'row', width: PAGE.width },
  barA:    { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:    { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:    { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 44, paddingBottom: PAGE.marginV,
  },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400,
    color: C.base, lineHeight: 1.15, marginBottom: 6,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 440,
  },
  rule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 24,
  },

  // ── System identifier bar ─────────────────────────────────────────────────
  systemBar: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 20,
  },
  systemDot: { width: 4, height: 4 },
  systemLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  systemSep: {
    fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint, opacity: 0.3,
  },

  // ── The synthesis paragraph ───────────────────────────────────────────────
  synthesisContainer: {
    padding: 24,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: 'rgba(13,13,14,0.12)',
    backgroundColor: 'rgba(13,13,14,0.025)',
    marginBottom: 20,
  },
  synthesisText: {
    fontFamily: F.sans,
    fontSize: 11,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.75,
    maxWidth: 440,
  },

  // ── Source note ───────────────────────────────────────────────────────────
  sourceNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 0,
  },
  sourceIcon: {
    width: 12, height: 12,
    borderRadius: 6,
    borderWidth: 0.5, borderColor: C.parchmentFaint, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  sourceIconText: {
    fontFamily: F.sans, fontSize: 6, color: C.parchmentFaint,
  },
  sourceText: {
    flex: 1,
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, fontStyle: 'italic',
  },

  // ── Configuration reference (small) ──────────────────────────────────────
  configRef: {
    marginTop: 20, paddingTop: 14,
    borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.1)',
    flexDirection: 'row', gap: 24,
  },
  configItem: { gap: 2 },
  configKey: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  configVal: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 400, color: C.base,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: ReportData & { synthesis: string; synthesisSource?: 'api' | 'fallback' };
  pageNumber: number;
}

export default function PageSynthesis({ data, pageNumber }: Props) {
  const isApiGenerated = data.synthesisSource !== 'fallback';

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>Your T3D Signature</Text>
        <Text style={S.sub}>
          The pattern across all three systems — written for this configuration.
        </Text>
        <View style={S.rule} />

        {/* System identifier row */}
        <View style={S.systemBar}>
          {[
            { color: C.amber,   label: 'Vehicle' },
            { color: C.emerald, label: 'Road' },
            { color: C.crimson, label: 'Stoplight' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={[S.systemDot, { backgroundColor: s.color }]} />
                <Text style={[S.systemLabel, { color: s.color }]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <Text style={S.systemSep}>×</Text>}
            </React.Fragment>
          ))}
        </View>

        {/* The synthesis paragraph */}
        <View style={S.synthesisContainer}>
          <Text style={S.synthesisText}>{data.synthesis}</Text>
        </View>

        {/* Source note */}
        <View style={S.sourceNote}>
          <View style={S.sourceIcon}>
            <Text style={S.sourceIconText}>{isApiGenerated ? '✓' : '·'}</Text>
          </View>
          <Text style={S.sourceText}>
            {isApiGenerated
              ? 'This synthesis was generated for this specific configuration. It will differ for every reader.'
              : 'This synthesis is based on your configuration pattern. A personalized version is generated when full data is available.'}
          </Text>
        </View>

        {/* Configuration reference */}
        <View style={S.configRef}>
          {[
            { key: 'Vehicle',   val: `${data.hdType} · ${data.hdAuthority}` },
            { key: 'Road',      val: `LP ${data.lifePathDisplay} · PY ${data.personalYear}` },
            { key: 'Stoplight', val: `${data.sunSign} · ${data.moonSign} · ${data.risingSign}` },
          ].map(item => (
            <View key={item.key} style={S.configItem}>
              <Text style={S.configKey}>{item.key}</Text>
              <Text style={S.configVal}>{item.val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>{pageNumber}</Text>
      </View>
    </Page>
  );
}
