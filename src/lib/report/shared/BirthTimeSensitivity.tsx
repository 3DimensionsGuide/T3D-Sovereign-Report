/**
 * T3D Report — Birth-Time Sensitivity Notice
 *
 * Renders on any page where uncertain birth time produces unreliable output.
 * Affected pages: Page27 (Big Three), Page29 (Ruler & Arenas), Page13 (Profile).
 *
 * Ethical principle: Do not present a precise chart-based conclusion
 * when the source input is not precise. Surface the uncertainty clearly
 * and direct the reader toward a resolution pathway.
 *
 * The notice is honest, non-alarming, and actionable.
 * It does not suppress content entirely — it contextualizes it.
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F } from '../tokens';
import type { BirthTimeCertainty } from '../schema/dataIntegrity';

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Full-width banner — placed at the top of affected sections
  banner: {
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(229,169,60,0.6)',
    backgroundColor: '#FDF5E8',
  },
  accentBar: {
    width: 3,
    backgroundColor: C.amberDim,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 5,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  headerLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.amberDim,
  },

  // Notice text
  noticeText: {
    fontFamily: F.sans,
    fontSize: 9,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.55,
    opacity: 0.85,
  },

  // Affected/stable columns
  twoCol: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  col: { flex: 1, gap: 3 },
  colLabel: {
    fontFamily: F.sans,
    fontSize: 6.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  listItem: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-start',
  },
  bullet: {
    fontFamily: F.sans,
    fontSize: 7,
    marginTop: 1,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.8,
  },

  // Rectification pathway link
  pathway: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(140,101,32,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pathwayLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.amberDim,
  },
  pathwayLink: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 400,
    color: C.emerald,
    letterSpacing: 0.3,
  },

  // Compact inline notice (for use within existing content blocks)
  compact: {
    flexDirection: 'row',
    gap: 6,
    padding: '7 10',
    backgroundColor: '#FDF5E8',
    borderLeftWidth: 2,
    borderLeftColor: C.amberDim,
    borderLeftStyle: 'solid',
    marginBottom: 10,
  },
  compactText: {
    flex: 1,
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
});

// ─── Notice text by certainty level ──────────────────────────────────────────
const NOTICE_TEXT: Record<BirthTimeCertainty, string> = {
  missing:
    'No birth time was submitted for this report. Outputs that depend on birth time — including the Rising sign, all house positions, and some Human Design gate activations — cannot be calculated accurately without it.',
  unknown:
    'Birth time is recorded as unknown. Outputs that depend on birth time — including the Rising sign, all house positions, and some Human Design gate activations — may not reflect your actual chart.',
  approximate:
    'Birth time was recorded as approximate. The Rising sign and house-based interpretations shown are based on this approximate time and may shift if a precise birth time is confirmed.',
  exact: '',
};

// ─── Which outputs are affected on each page ──────────────────────────────────
const PAGE_SPECIFIC_OUTPUTS: Record<string, { affected: string[]; stable: string[] }> = {
  Page27BigThree: {
    affected: ['Rising Sign (Ascendant)', 'Rising sign interpretation'],
    stable:   ['Sun Sign', 'Moon Sign', 'Element and Modality patterns'],
  },
  Page29RulerArenas: {
    affected: ['Chart ruler (derived from Rising)', 'Sun house placement'],
    stable:   ['Life Path direction', 'Personal Year context'],
  },
  Page13Profile: {
    affected: ['Profile (may shift near gate boundary transitions)'],
    stable:   ['Type', 'Strategy', 'Authority'],
  },
};

// ─── Full Banner ─────────────────────────────────────────────────────────────
interface BirthTimeSensitivityBannerProps {
  certainty:  BirthTimeCertainty;
  pageName?:  string;   // for page-specific messaging
  compact?:   boolean;  // use compact inline version
}

export function BirthTimeSensitivityBanner({
  certainty,
  pageName,
  compact = false,
}: BirthTimeSensitivityBannerProps) {
  if (certainty === 'exact') return null;

  const noticeText = NOTICE_TEXT[certainty];
  const pageOutputs = pageName ? PAGE_SPECIFIC_OUTPUTS[pageName] : null;

  if (compact) {
    return (
      <View style={S.compact}>
        <Text style={[S.compactText, { color: C.amberDim, fontWeight: 500, fontSize: 6.5 }]}>
          ⚠
        </Text>
        <Text style={S.compactText}>
          Birth time is {certainty} — this output may shift with a confirmed time.
          See 3dimensions.guide/update-time
        </Text>
      </View>
    );
  }

  return (
    <View style={S.banner}>
      <View style={S.accentBar} />
      <View style={S.content}>
        {/* Header */}
        <View style={S.headerRow}>
          <Text style={S.headerLabel}>Birth-Time Sensitivity Notice</Text>
        </View>

        {/* Notice text */}
        <Text style={S.noticeText}>{noticeText}</Text>

        {/* Page-specific affected/stable columns */}
        {pageOutputs && (
          <View style={S.twoCol}>
            <View style={S.col}>
              <Text style={[S.colLabel, { color: C.crimson }]}>May be inaccurate</Text>
              {pageOutputs.affected.map((item, i) => (
                <View key={i} style={S.listItem}>
                  <Text style={[S.bullet, { color: C.crimson }]}>✗</Text>
                  <Text style={S.listText}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={S.col}>
              <Text style={[S.colLabel, { color: C.emerald }]}>Reliable regardless</Text>
              {pageOutputs.stable.map((item, i) => (
                <View key={i} style={S.listItem}>
                  <Text style={[S.bullet, { color: C.emerald }]}>✓</Text>
                  <Text style={S.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Rectification pathway */}
        <View style={S.pathway}>
          <Text style={S.pathwayLabel}>To update with a confirmed time →</Text>
          <Text style={S.pathwayLink}>3dimensions.guide/update-time</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Page 43 methodology block ────────────────────────────────────────────────
/**
 * DataQualityBlock
 *
 * Renders on Page 43 (Data Notes) to show the full quality report.
 * Includes methodology, birth-time status, and any warnings.
 */
interface DataQualityBlockProps {
  birthTimeStatus:   BirthTimeCertainty;
  timezoneId?:       string;
  calculationDate?:  string;
  warnings?:         string[];
  uncertainties?:    string[];
}

const DQ = StyleSheet.create({
  container: { gap: 0 },
  row: {
    flexDirection: 'row', gap: 8, paddingVertical: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.08)',
  },
  rowLast: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  key: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    color: C.parchmentFaint, width: 130, flexShrink: 0,
  },
  val: {
    flex: 1, fontFamily: F.sans, fontSize: 7.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5,
  },
  valGood: { color: C.emerald, fontWeight: 500 },
  valWarn: { color: C.amberDim, fontWeight: 500 },
  valError: { color: C.crimson, fontWeight: 500 },
});

const CERTAINTY_LABELS: Record<BirthTimeCertainty, { label: string; style: { color: string; fontWeight: number } }> = {
  exact:       { label: 'Confirmed', style: DQ.valGood },
  approximate: { label: 'Approximate — see sensitivity notice', style: DQ.valWarn },
  unknown:     { label: 'Unknown — time-sensitive outputs may be inaccurate', style: DQ.valWarn },
  missing:     { label: 'Not provided — time-sensitive outputs withheld', style: DQ.valError },
};

export function DataQualityBlock({
  birthTimeStatus,
  timezoneId = '—',
  calculationDate,
  warnings = [],
  uncertainties = [],
}: DataQualityBlockProps) {
  const genDate = calculationDate
    ? new Date(calculationDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const timeLabel = CERTAINTY_LABELS[birthTimeStatus];

  const rows = [
    { key: 'Report generated',    val: genDate,     style: DQ.val },
    { key: 'Birth time status',   val: timeLabel.label, style: timeLabel.style },
    { key: 'Timezone resolved',   val: timezoneId,  style: DQ.val },
    { key: 'HD ephemeris',        val: 'Swiss Ephemeris (swisseph)', style: DQ.val },
    { key: 'HD zodiac',           val: 'Tropical', style: DQ.val },
    { key: 'Astrology zodiac',    val: 'Tropical (Western)', style: DQ.val },
    { key: 'House system',        val: 'Whole Sign Houses', style: DQ.val },
    { key: 'Numerology method',   val: 'Pythagorean — master numbers 11, 22, 33 preserved', style: DQ.val },
  ];

  return (
    <View style={DQ.container}>
      {rows.map((row, i) => (
        <View key={row.key} style={i === rows.length - 1 ? DQ.rowLast : DQ.row}>
          <Text style={DQ.key}>{row.key}</Text>
          <Text style={[DQ.val, row.style]}>{row.val}</Text>
        </View>
      ))}
      {warnings.length > 0 && warnings.map((w, i) => (
        <View key={i} style={DQ.row}>
          <Text style={DQ.key}>Quality note</Text>
          <Text style={[DQ.val, DQ.valWarn]}>{w}</Text>
        </View>
      ))}
    </View>
  );
}
