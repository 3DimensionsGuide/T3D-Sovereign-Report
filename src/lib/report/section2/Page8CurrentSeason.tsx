/**
 * Page 8 — Your Current Season
 *
 * Reader need: "What Deserves Attention Now?"
 *
 * Current Personal Year + restrained astrological timing lens.
 * Themes and reflection only — never deterministic outcomes.
 * Emphasis: what the current period is asking for, not what it guarantees.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE, PERSONAL_YEAR_THEMES } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#FAFAF9',
    padding: 0,
    fontFamily: F.sans,
  },
  topRuleRow: {
    flexDirection: 'row',
    width: PAGE.width,
  },
  topRuleAmber:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  topRuleEmerald: { flex: 1, height: 1.5, backgroundColor: C.emerald },
  topRuleCrimson: { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 44,
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
    marginBottom: 8,
  },
  heading: {
    fontFamily: F.display,
    fontSize: 24,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: F.sans,
    fontSize: 9,
    fontWeight: 300,
    color: C.parchmentFaint,
    marginBottom: 24,
  },
  headingRule: {
    width: PAGE.contentWidth,
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 24,
  },

  // ── Personal Year block ────────────────────────────────────────────────────
  pyContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    alignItems: 'flex-start',
  },

  // Large year number on the left
  pyNumberBlock: {
    width: 72,
    height: 72,
    backgroundColor: C.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  pyNumber: {
    fontFamily: F.display,
    fontSize: 36,
    fontWeight: 700,
    color: C.parchment,
    lineHeight: 1,
  },

  pyContent: {
    flex: 1,
    gap: 5,
  },
  pyLabel: {
    fontFamily: F.sans,
    fontSize: 6.5,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
  },
  pyTitle: {
    fontFamily: F.display,
    fontSize: 17,
    fontWeight: 400,
    color: C.base,
    lineHeight: 1.2,
  },
  pyEssence: {
    fontFamily: F.sans,
    fontSize: 10,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
    opacity: 0.85,
    marginTop: 4,
  },

  // ── Four themes ────────────────────────────────────────────────────────────
  themesLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2.2,
    color: C.parchmentFaint,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  themeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EFF4F0',
    borderWidth: 0.5,
    borderColor: C.emerald,
    borderStyle: 'solid',
  },
  themeText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 400,
    color: C.emeraldDim,
  },

  // ── Caution note ──────────────────────────────────────────────────────────
  cautionBlock: {
    padding: 14,
    backgroundColor: '#F5F2EC',
    borderLeftWidth: 2,
    borderLeftColor: C.amberDim,
    borderLeftStyle: 'solid',
    marginBottom: 20,
  },
  cautionLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 1.8,
    color: C.amberDim,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  cautionText: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
  },

  // ── Astrological context note ─────────────────────────────────────────────
  astroSection: {
    borderTopWidth: 0.5,
    borderTopColor: C.base,
    borderTopStyle: 'solid',
    paddingTop: 16,
    gap: 8,
  },
  astroLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 2,
    color: C.crimson,
    textTransform: 'uppercase',
  },
  astroText: {
    fontFamily: F.sans,
    fontSize: 9.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.65,
    opacity: 0.82,
  },
  astroDisclaimer: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 400,
    color: C.parchmentFaint,
    lineHeight: 1.55,
    fontStyle: 'italic',
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

interface Props {
  data: Pick<ReportData, 'personalYear' | 'sunSign' | 'tropicalSun'>;
}

export default function Page8CurrentSeason({ data }: Props) {
  const currentYear = new Date().getFullYear();
  const pyTheme = PERSONAL_YEAR_THEMES[data.personalYear] ?? PERSONAL_YEAR_THEMES[1]!;

  return (
    <Page size="LETTER" style={S.page}>

      {/* Three hairline rules */}
      <View style={S.topRuleRow}>
        <View style={S.topRuleAmber}   />
        <View style={S.topRuleEmerald} />
        <View style={S.topRuleCrimson} />
      </View>

      <View style={S.content}>
        <Text style={S.sectionTag}>Section 2 — Your Coordinates</Text>
        <Text style={S.heading}>Your Current Season</Text>
        <Text style={S.subheading}>
          What the current period is asking for — not what it promises.
        </Text>
        <View style={S.headingRule} />

        {/* Personal Year block */}
        <View style={S.pyContainer}>
          <View style={S.pyNumberBlock}>
            <Text style={S.pyNumber}>{data.personalYear}</Text>
          </View>
          <View style={S.pyContent}>
            <Text style={S.pyLabel}>Personal Year {data.personalYear} · {currentYear}</Text>
            <Text style={S.pyTitle}>{pyTheme.title}</Text>
            <Text style={S.pyEssence}>{pyTheme.essence}</Text>
          </View>
        </View>

        {/* Theme tags */}
        <Text style={S.themesLabel}>Themes This Year</Text>
        <View style={S.themesRow}>
          {pyTheme.themes.map(theme => (
            <View key={theme} style={S.themeTag}>
              <Text style={S.themeText}>{theme}</Text>
            </View>
          ))}
        </View>

        {/* Caution note */}
        <View style={S.cautionBlock}>
          <Text style={S.cautionLabel}>Worth Noting</Text>
          <Text style={S.cautionText}>{pyTheme.caution}</Text>
        </View>

        {/* Astrological context */}
        <View style={S.astroSection}>
          <Text style={S.astroLabel}>Astrological Context — {data.sunSign} Sun</Text>
          <Text style={S.astroText}>
            Your {data.sunSign} Sun ({data.tropicalSun}) shapes how the season's themes arrive for you specifically. Where the Personal Year sets the broader energetic weather, your natal chart describes the coat you're wearing in it — your natural way of moving through whatever the year is asking for.
          </Text>
          <Text style={S.astroDisclaimer}>
            Astrological transits are available in the reference layer of this report. The synthesis on this page intentionally remains at the level of theme — precise transit data is most useful in context, not in isolation.
          </Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNumber}>8</Text>
      </View>
    </Page>
  );
}
