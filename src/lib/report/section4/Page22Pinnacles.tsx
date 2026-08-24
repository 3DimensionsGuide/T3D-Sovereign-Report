/**
 * Page 22 — Your Pinnacles
 * Four developmental phases as a horizontal road map.
 * Current pinnacle clearly identified. Prior/next as context, not prediction.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { PINNACLE_THEMES } from './road-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },
  sectionTag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8 },
  subheading: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 20, maxWidth: 420 },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // ── Horizontal road map ────────────────────────────────────────────────────
  roadMapContainer: { flexDirection: 'row', gap: 0, marginBottom: 24 },

  // Each phase block
  phaseBlock: {
    flex: 1,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
    padding: 12, gap: 5,
  },
  phaseBlockCurrent: {
    flex: 1,
    borderWidth: 1.5, borderColor: C.emerald, borderStyle: 'solid',
    padding: 12, gap: 5,
    backgroundColor: '#EFF5EF',
  },
  phaseBlockDim: {
    flex: 1,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.08)',
    padding: 12, gap: 5, opacity: 0.55,
  },

  // Phase connector (arrow between blocks)
  phaseConnector: {
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 2, flexShrink: 0,
  },
  phaseArrow: { fontFamily: F.sans, fontSize: 8, color: C.parchmentFaint },

  phaseLabel: { fontFamily: F.sans, fontSize: 6, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase' },
  phaseLabelCurrent: { fontFamily: F.sans, fontSize: 6, fontWeight: 500, letterSpacing: 1.8, textTransform: 'uppercase', color: C.emerald },
  phaseNumber: { fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.base, lineHeight: 1.0 },
  phaseNumberCurrent: { fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.emerald, lineHeight: 1.0 },
  phaseAges: { fontFamily: F.sans, fontSize: 7, fontWeight: 400, color: C.parchmentFaint, letterSpacing: 0.5 },
  phaseName: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, color: C.base, lineHeight: 1.3 },

  // Current indicator
  currentBadge: {
    backgroundColor: C.emerald, paddingHorizontal: 6, paddingVertical: 3,
    alignSelf: 'flex-start', marginTop: 2,
  },
  currentBadgeText: { fontFamily: F.sans, fontSize: 5.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchment },

  // ── Current pinnacle detail ────────────────────────────────────────────────
  currentDetail: {
    padding: 16,
    borderLeftWidth: 2, borderLeftColor: C.emerald, borderLeftStyle: 'solid',
    backgroundColor: '#EFF5EF', gap: 6, marginBottom: 16,
  },
  currentDetailLabel: { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: C.emerald },
  currentDetailTheme: { fontFamily: F.display, fontSize: 15, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  currentDetailTerrain: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },

  // ── Context note ──────────────────────────────────────────────────────────
  contextNote: {
    padding: 12, backgroundColor: '#F0EEE9',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
  },
  contextNoteText: { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.7 },

  footer: { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'pinnacles' | 'lifePath' | 'currentPinnacleIndex'>;
}

export default function Page22Pinnacles({ data }: Props) {
  const pinnacles = data.pinnacles ?? [];
  const currentIdx = data.currentPinnacleIndex ?? 1;

  const currentPinnacle = pinnacles[currentIdx];
  const currentTheme = currentPinnacle
    ? PINNACLE_THEMES[currentPinnacle.number]
    : null;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 4 — The Road</Text>
        <Text style={S.heading}>Your Pinnacles</Text>
        <Text style={S.subheading}>
          Four developmental phases mapped across your lifetime. The current Pinnacle is where the Road is most active right now.
        </Text>
        <View style={S.headingRule} />

        {/* Horizontal road map */}
        <View style={S.roadMapContainer}>
          {pinnacles.map((p, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            const blockStyle = isCurrent ? S.phaseBlockCurrent : isPast ? S.phaseBlockDim : S.phaseBlock;
            const numStyle = isCurrent ? S.phaseNumberCurrent : S.phaseNumber;
            const labelStyle = isCurrent ? S.phaseLabelCurrent : S.phaseLabel;
            const labelColor = isCurrent ? C.emerald : isPast ? C.parchmentFaint : C.parchmentFaint;

            const ageRange = p.endAge
              ? `Ages ${p.startAge}–${p.endAge}`
              : `Ages ${p.startAge}+`;

            const theme = PINNACLE_THEMES[p.number];

            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <View style={S.phaseConnector}>
                    <Text style={S.phaseArrow}>→</Text>
                  </View>
                )}
                <View style={blockStyle}>
                  <Text style={[labelStyle, { color: labelColor }]}>
                    {isPast ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                  </Text>
                  <Text style={numStyle}>{p.number}</Text>
                  <Text style={S.phaseAges}>{ageRange}</Text>
                  <Text style={S.phaseName}>{theme?.theme ?? `Pinnacle ${p.number}`}</Text>
                  {isCurrent && (
                    <View style={S.currentBadge}>
                      <Text style={S.currentBadgeText}>NOW</Text>
                    </View>
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Current pinnacle detail */}
        {currentPinnacle && currentTheme && (
          <View style={S.currentDetail}>
            <Text style={S.currentDetailLabel}>
              Your Current Pinnacle — {currentPinnacle.number} · {
                currentPinnacle.endAge
                  ? `Ages ${currentPinnacle.startAge}–${currentPinnacle.endAge}`
                  : `Age ${currentPinnacle.startAge}+`
              }
            </Text>
            <Text style={S.currentDetailTheme}>{currentTheme.theme}</Text>
            <Text style={S.currentDetailTerrain}>{currentTheme.terrain}</Text>
          </View>
        )}

        {/* Context note */}
        <View style={S.contextNote}>
          <Text style={S.contextNoteText}>
            Prior Pinnacles are context — they explain what the current one is building on. Upcoming Pinnacles are orientation — not prediction. The Road unfolds through how you walk it, not despite how you walk it.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>22</Text>
      </View>
    </Page>
  );
}
