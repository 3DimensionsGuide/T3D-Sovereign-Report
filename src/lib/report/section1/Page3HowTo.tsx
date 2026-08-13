/**
 * Page 3 — How To Use This Guide
 *
 * Reader need: "Where Do I Start?"
 *
 * Three reading modes:
 *   1. "Read in one sitting"       — Pages 1–44
 *   2. "Use before a decision"     — Pages 5–9, then relevant dimension
 *   3. "Return during friction"    — Pages 10–44
 *
 * Three-step path diagram:
 *   ORIENT → LOCATE → APPLY
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#FAFAF9',
    padding: 0,
    fontFamily: F.sans,
  },
  topRule: {
    width: PAGE.width,
    height: 1.5,
    backgroundColor: C.emerald,
  },
  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 52,
    paddingBottom: PAGE.marginV,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  sectionTag: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 28,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 10,
    fontWeight: 300,
    color: C.parchmentFaint,
    lineHeight: 1.6,
    marginBottom: 28,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.12,
    marginBottom: 28,
  },

  // ── Reading modes ─────────────────────────────────────────────────────────
  modesContainer: {
    gap: 0,
    marginBottom: 28,
  },

  // Each mode card
  modeCard: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: C.base,
    borderBottomStyle: 'solid',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  modeCardLast: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },

  // Mode number badge
  modeBadge: {
    width: 22,
    height: 22,
    borderWidth: 0.5,
    borderColor: C.base,
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  modeBadgeText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    color: C.base,
  },

  modeBody: {
    flex: 1,
    gap: 4,
  },

  // Mode title + page range on same row
  modeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  modeTitle: {
    fontFamily: F.display,
    fontSize: 13,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
  },
  modePages: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 1.4,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },

  modeWhen: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 500,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modeDesc: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
    opacity: 0.8,
    marginTop: 4,
  },

  // ── Three-step path diagram ───────────────────────────────────────────────
  pathLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.5,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 0,
    backgroundColor: '#F0EEE9',
    padding: 0,
  },

  // Each step
  pathStep: {
    flex: 1,
    padding: 14,
    alignItems: 'flex-start',
    gap: 4,
  },
  pathStepMiddle: {
    flex: 1,
    padding: 14,
    alignItems: 'flex-start',
    gap: 4,
    borderLeftWidth: 0.5,
    borderLeftColor: C.base,
    borderLeftStyle: 'solid',
    borderRightWidth: 0.5,
    borderRightColor: C.base,
    borderRightStyle: 'solid',
    opacity: 0.15,
  },

  // Step connector arrow between steps
  pathArrow: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  pathArrowText: {
    fontFamily: F.sans,
    fontSize: 9,
    color: C.parchmentFaint,
  },

  stepNumber: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontFamily: F.display,
    fontSize: 13,
    fontWeight: 700,
    color: C.base,
    letterSpacing: 0.3,
  },
  stepPages: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 400,
    color: C.parchmentFaint,
    marginTop: 2,
  },
  stepDesc: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.55,
    opacity: 0.75,
    marginTop: 4,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: PAGE.marginH,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    letterSpacing: 1.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  pageNumber: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 400,
    color: C.parchmentFaint,
  },
});

// Reading mode data
const MODES = [
  {
    num:   '01',
    title: 'Read in one sitting',
    when:  'For · First encounter',
    pages: 'Pages 1–44',
    desc:  'Set aside 90 minutes and read linearly from the beginning. Don\'t stop to research unfamiliar terms — let the complete picture land before you interrogate any part of it. Comprehension compounds as you go.',
  },
  {
    num:   '02',
    title: 'Use before a decision',
    when:  'For · A specific choice',
    pages: 'Pages 5–9, then 10–44',
    desc:  'Start with The T3D Lens (pages 5–9), then navigate to the dimension most relevant to your question. Human Design when the question is about how to act. Numerology when it\'s about timing. Astrology when it\'s about external conditions.',
  },
  {
    num:   '03',
    title: 'Return during friction',
    when:  'For · When something isn\'t working',
    pages: 'Pages 10–44',
    desc:  'Open to the section that speaks to the friction and read slowly. The insights in this report tend to reorganize themselves when you\'re in the middle of something — they mean more when there\'s something specific at stake.',
  },
];

export default function Page3HowTo() {
  return (
    <Page size="LETTER" style={S.page}>

      {/* Emerald hairline at top */}
      <View style={S.topRule} />

      <View style={S.content}>

        <Text style={S.sectionTag}>Section 1 — Arrival</Text>
        <Text style={S.heading}>How to Use This Guide</Text>
        <Text style={S.subheading}>
          Three modes, depending on what you need right now.
        </Text>
        <View style={S.headingRule} />

        {/* Three reading modes */}
        <View style={S.modesContainer}>
          {MODES.map((mode, i) => (
            <View key={mode.num} style={i === MODES.length - 1 ? S.modeCardLast : S.modeCard}>
              {/* Number badge */}
              <View style={S.modeBadge}>
                <Text style={S.modeBadgeText}>{mode.num}</Text>
              </View>

              {/* Content */}
              <View style={S.modeBody}>
                <View style={S.modeTitleRow}>
                  <Text style={S.modeTitle}>{mode.title}</Text>
                  <Text style={S.modePages}>{mode.pages}</Text>
                </View>
                <Text style={S.modeWhen}>{mode.when}</Text>
                <Text style={S.modeDesc}>{mode.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Three-step path diagram */}
        <Text style={S.pathLabel}>The Three-Step Path</Text>
        <View style={S.pathContainer}>

          {/* Step 1 */}
          <View style={S.pathStep}>
            <Text style={S.stepNumber}>Step 1</Text>
            <Text style={S.stepTitle}>Orient</Text>
            <Text style={S.stepPages}>Pages 1–9</Text>
            <Text style={S.stepDesc}>Understand the lens before the data.</Text>
          </View>

          {/* Divider */}
          <View style={{
            width: 0.5,
            backgroundColor: C.base,
            opacity: 0.15,
          }} />

          {/* Step 2 */}
          <View style={S.pathStep}>
            <Text style={S.stepNumber}>Step 2</Text>
            <Text style={S.stepTitle}>Locate</Text>
            <Text style={S.stepPages}>Pages 10–44</Text>
            <Text style={S.stepDesc}>Find the dimension most relevant to your question.</Text>
          </View>

          {/* Divider */}
          <View style={{
            width: 0.5,
            backgroundColor: C.base,
            opacity: 0.15,
          }} />

          {/* Step 3 */}
          <View style={S.pathStep}>
            <Text style={S.stepNumber}>Step 3</Text>
            <Text style={S.stepTitle}>Apply</Text>
            <Text style={S.stepPages}>Lived experience</Text>
            <Text style={S.stepDesc}>Test the insight. Adjust. Return when something shifts.</Text>
          </View>

        </View>

      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>3</Text>
      </View>

    </Page>
  );
}
