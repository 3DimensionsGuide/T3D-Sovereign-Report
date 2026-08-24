/**
 * Page 1 — Cover
 *
 * Reader need: "This Was Made For Me"
 *
 * Design brief:
 *   — Full-bleed charcoal #0D0D0E background
 *   — Three hairline rules (amber | emerald | crimson) across full width at top
 *   — Reader's first name in Playfair Display — the compositional hero
 *   — "The Sovereign Report" in DM Sans caps below a thin rule
 *   — Date generated and "Prepared for [Full Name]" in small DM Sans
 *   — Small T3D mark at bottom center
 *   — No images, no icons, no sacred geometry
 *   — Emotional register: private dossier, composed, worth keeping
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: C.base,
    width:  PAGE.width,
    height: PAGE.height,
    padding: 0,
    fontFamily: F.sans,
  },

  // ── Three hairline triad rules across full width ──────────────────────────
  rulesRow: {
    flexDirection: 'row',
    width: PAGE.width,
  },
  ruleAmber: {
    flex: 1,
    height: 2,
    backgroundColor: C.amber,
  },
  ruleEmerald: {
    flex: 1,
    height: 2,
    backgroundColor: C.emerald,
  },
  ruleCrimson: {
    flex: 1,
    height: 2,
    backgroundColor: C.crimson,
  },

  // ── Content area — vertically centered in the remaining space ─────────────
  contentArea: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  // ── Above the name — classification tag ──────────────────────────────────
  classificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
    gap: 10,
  },
  classificationLine: {
    width: 24,
    height: 0.5,
    backgroundColor: C.parchmentFaint,
  },
  classificationText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    letterSpacing: 2.8,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },

  // ── Reader's first name — the compositional hero ──────────────────────────
  // Large but not enormous. The name should feel private, not branded.
  firstName: {
    fontFamily: F.display,
    fontSize: 38,
    fontWeight: 400,
    color: C.parchment,
    lineHeight: 1.0,
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  // ── Thin separator rule under the name ───────────────────────────────────
  nameRule: {
    width: 280,
    height: 0.5,
    backgroundColor: C.parchmentDim,
    marginBottom: 20,
    opacity: 0.4,
  },

  // ── Report title ─────────────────────────────────────────────────────────
  reportTitle: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 3.2,
    color: C.parchmentDim,
    textTransform: 'uppercase',
    marginBottom: 48,
  },

  // ── Three triad dimension labels ─────────────────────────────────────────
  triadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 56,
  },
  triadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  triadDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  triadLabel: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 1.8,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  triadSep: {
    width: 0.5,
    height: 8,
    backgroundColor: C.parchmentFaint,
    opacity: 0.3,
  },

  // ── Date and recipient ────────────────────────────────────────────────────
  metaBlock: {
    gap: 5,
  },
  metaLine: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 300,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },

  // ── Bottom — T3D mark ─────────────────────────────────────────────────────
  bottomArea: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  t3dMark: {
    fontFamily: F.display,
    fontSize: 10.5,
    fontWeight: 400,
    color: C.parchmentFaint,
    letterSpacing: 1.6,
    opacity: 0.5,
  },
  pageRef: {
    fontFamily: F.sans,
    fontSize: 8,
    fontWeight: 400,
    color: C.parchmentFaint,
    letterSpacing: 1.5,
    opacity: 0.4,
  },
});

interface Props {
  data: Pick<ReportData, 'firstName' | 'lastName' | 'generatedAt'>;
}

export default function Page1Cover({ data }: Props) {
  const dateFormatted = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />


      {/* Three hairline triad rules — full width */}
      <View style={S.rulesRow}>
        <View style={S.ruleAmber}   />
        <View style={S.ruleEmerald} />
        <View style={S.ruleCrimson} />
      </View>

      {/* Main content — vertically centered */}
      <View style={S.contentArea}>

        {/* Classification tag */}
        <View style={S.classificationRow}>
          <View style={S.classificationLine} />
          <Text style={S.classificationText}>Personal · Confidential</Text>
        </View>

        {/* Reader's first name — the hero element */}
        <Text style={S.firstName}>{data.firstName}</Text>

        {/* Thin rule under name */}
        <View style={S.nameRule} />

        {/* Report title */}
        <Text style={S.reportTitle}>The T3D Sovereign Report</Text>

        {/* Three dimension labels */}
        <View style={S.triadRow}>
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.amber }]} />
            <Text style={S.triadLabel}>The Vehicle</Text>
          </View>
          <View style={S.triadSep} />
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.emerald }]} />
            <Text style={S.triadLabel}>The Road</Text>
          </View>
          <View style={S.triadSep} />
          <View style={S.triadItem}>
            <View style={[S.triadDot, { backgroundColor: C.crimson }]} />
            <Text style={S.triadLabel}>The Stoplight</Text>
          </View>
        </View>

        {/* Date and recipient */}
        <View style={S.metaBlock}>
          <Text style={S.metaLine}>Prepared for {data.firstName} {data.lastName}</Text>
          <Text style={S.metaLine}>Generated {dateFormatted}</Text>
        </View>

      </View>

      {/* Bottom mark */}
      <View style={S.bottomArea}>
        <Text style={S.t3dMark}>T3D</Text>
        <Text style={S.pageRef}>3dimensions.guide</Text>
      </View>

    </Page>
  );
}
