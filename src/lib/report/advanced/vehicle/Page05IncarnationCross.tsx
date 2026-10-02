/**
 * Advanced Sovereign Report — Vehicle Section — Your Incarnation Cross
 *
 * The meaning passage and each of the four gate cards vary in length with
 * the reader's actual cross and gates, so (per Page05Transits.tsx's
 * documented fix for the same failure mode) the meaning block and each
 * gate card get `wrap={false}` + `minPresenceAhead` rather than relying
 * on react-pdf's default wrap to land cleanly — see CARD_MIN_PRESENCE_AHEAD's
 * docblock in PageComponents.tsx.
 *
 * Fourth "architecture" page (after Definition, Bridges, Circuitry). Where
 * the prior pages showed how the Vehicle is built and what runs through it,
 * this page names its background theme — the fixed, unchosen life direction
 * set by the four Sun/Earth gates at birth, independent of Type or Profile
 * mechanics.
 *
 * Content strategy mirrors Page03Bridges: rather than writing bespoke prose
 * for all 192 possible crosses (impossible to source honestly), this page
 * combines two things that ARE sourced and tractable —
 *   1. calculateCrossFamily() — the Right Angle / Juxtaposition / Left Angle
 *      reading, determined by Profile (7 possible profiles per Right Angle,
 *      1 for Juxtaposition, 4 for Left Angle — a real, verifiable rule).
 *   2. getCrossGates() + GATE_KEYNOTES — the actual four gates that make up
 *      THIS reader's cross, each with its real I Ching name and core
 *      meaning, already verified data.
 * The named cross itself (hdIncarnationCross, e.g. "Right Angle Cross of
 * Explanation") anchors the page as the display heading.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines, CARD_MIN_PRESENCE_AHEAD } from '../../shared/PageComponents';
import { C, F, PAGE, calculateCrossFamily, getCrossGates } from '../../tokens';
import { GATE_KEYNOTES } from '../../section3/gate-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 30 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 14, maxWidth: 420,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 14 },

  // Cross name display — the star of the page
  crossNameBlock: { marginBottom: 12 },
  crossName: {
    fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.amber, lineHeight: 1.15,
  },
  familyBadge: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  familyTag: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: '#FFFFFF', backgroundColor: C.amber, textTransform: 'uppercase',
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2,
  },
  familyKeynote: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.base,
  },

  // Family meaning passage
  meaningBlock: {
    padding: 14, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 14,
  },
  meaningText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.9,
  },

  // Four cross gates — 2x2 grid
  gateGridLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 1.6,
    color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 10,
  },
  gateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gateCard: {
    width: (PAGE.contentWidth - 8) / 2,
    padding: 11, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  gateCardRole: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1, color: C.amberDim, textTransform: 'uppercase',
    marginBottom: 5,
  },
  gateCardName: {
    fontFamily: F.display, fontSize: 13, fontStyle: 'italic', color: C.base, marginBottom: 5,
  },
  gateCardBlurb: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, opacity: 0.7, lineHeight: 1.4, marginBottom: 6,
  },
  gateCardMeaning: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 400, color: C.base, lineHeight: 1.45,
    paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdIncarnationCross' | 'hdProfile' | 'hdActiveGates'>;
}

export default function Page05IncarnationCross({ data }: Props) {
  const familyResult = calculateCrossFamily(data.hdProfile);
  const gates = getCrossGates(data.hdActiveGates);

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
        <Text style={S.heading}>Your Incarnation Cross</Text>
        <Text style={S.subheading}>
          Type and Strategy govern how you&rsquo;re built to move. Your Incarnation Cross is different —
          the fixed, unchosen background theme of your life, set by four gates at birth and
          entirely independent of how your Centers are wired.
        </Text>
        <View style={S.headingRule} />

        <View style={S.crossNameBlock}>
          <Text style={S.crossName}>{data.hdIncarnationCross}</Text>
          <View style={S.familyBadge}>
            <Text style={S.familyTag}>{familyResult.label}</Text>
            <Text style={S.familyKeynote}>{familyResult.meaning.keynote}</Text>
          </View>
        </View>

        <View style={S.meaningBlock} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
          <Text style={S.meaningText}>{familyResult.meaning.passage}</Text>
        </View>

        <Text style={S.gateGridLabel}>The Four Gates Of Your Cross</Text>
        <View style={S.gateGrid}>
          {gates.map(g => {
            const keynote = GATE_KEYNOTES[g.gate];
            return (
              <View key={g.role} style={S.gateCard} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
                <Text style={S.gateCardRole}>{g.role} · Gate {g.gate}</Text>
                {keynote && <Text style={S.gateCardName}>{keynote.ichingName}</Text>}
                <Text style={S.gateCardBlurb}>{g.blurb}</Text>
                {keynote && <Text style={S.gateCardMeaning}>{keynote.coreMeaning}</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
