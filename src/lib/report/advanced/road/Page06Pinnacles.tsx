/**
 * Advanced Sovereign Report — Road Section — Your Four Pinnacles
 *
 * Deepens the base report's brief Pinnacle-cycle treatment into a full
 * page: the timing mechanism (how the four life phases are calculated and
 * bounded), then all four of the reader's Pinnacles stacked in order, each
 * with its core mandate and the specific lived experience of that number
 * in that particular phase slot (PINNACLE_CONTENT in road-content.ts). The
 * phase the reader is currently living is visually highlighted.
 *
 * Master Number Pinnacles (11, 22, 33) show coreMandate only — the source
 * material doesn't break Master Numbers down by phase the way it does for
 * 1–9, since they're read as an amplification of their root number's theme
 * rather than four distinct lived stages.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { PINNACLE_CONTENT } from './road-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  emeraldLine: { width: PAGE.width, height: 1.5, backgroundColor: C.emerald },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40 },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 18, maxWidth: 440,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 18 },

  mechanismBlock: { marginBottom: 16, gap: 5 },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.emerald,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  stack: { gap: 9 },
  card: {
    padding: 12, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardCurrent: { borderColor: C.emerald, borderWidth: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  numberBadge: { fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.emerald, width: 34 },
  headerText: { flex: 1 },
  phaseLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.4,
    textTransform: 'uppercase', color: C.base, opacity: 0.55,
  },
  ageRange: { fontFamily: F.sans, fontSize: 8, fontWeight: 300, color: C.parchmentFaint, marginTop: 1 },
  currentBadge: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
    color: '#FFFFFF', backgroundColor: C.emerald, paddingVertical: 3, paddingHorizontal: 7,
  },
  mandateText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.9, marginBottom: 4,
  },
  phaseText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.45, opacity: 0.75,
    paddingTop: 5, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)',
  },

  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)', gap: 8,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

const PHASE_NAMES = ['Time of Attainment', 'Time of Obligation', 'Time of Foundation', 'Time of Culmination'];

function formatAgeRange(startAge: number, endAge: number | null): string {
  return endAge === null ? `Age ${startAge}+` : `Age ${startAge}–${endAge}`;
}

interface Props {
  data: Pick<ReportData, 'pinnacles' | 'currentPinnacleIndex'>;
}

export default function Page06Pinnacles({ data }: Props) {
  const hasPinnacles = Array.isArray(data.pinnacles) && data.pinnacles.length === 4;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.emeraldLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Road</Text>
        <Text style={S.heading}>Your Four Pinnacles</Text>
        <Text style={S.subheading}>
          Your life runs through four distinct phases, each with its own governing number — the
          environment, the opportunity set, the &ldquo;degree program&rdquo; you&rsquo;re enrolled in.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>How These Phases Are Timed</Text>
          <Text style={S.mechanismText}>
            Your First Pinnacle runs from birth to age (36 minus your Life Path). Your Second and Third
            Pinnacles each cover the following nine years. Your Fourth Pinnacle then runs from the end
            of the Third for the rest of your life. Master Numbers (11, 22, 33) are never reduced here —
            they run on their root number&rsquo;s timeline, at a higher, more demanding voltage.
          </Text>
        </View>

        {hasPinnacles ? (
          <View style={S.stack}>
            {data.pinnacles.map((p, i) => {
              const content = PINNACLE_CONTENT[p.number];
              const isCurrent = i === data.currentPinnacleIndex;
              const phaseText = content?.phases?.[i];
              return (
                <View style={[S.card, isCurrent ? S.cardCurrent : {}]} key={i}>
                  <View style={S.cardHeaderRow}>
                    <Text style={S.numberBadge}>{p.number}</Text>
                    <View style={S.headerText}>
                      <Text style={S.phaseLabel}>{p.label} · {PHASE_NAMES[i]}</Text>
                      <Text style={S.ageRange}>{formatAgeRange(p.startAge, p.endAge)}</Text>
                    </View>
                    {isCurrent && <Text style={S.currentBadge}>Now</Text>}
                  </View>
                  {content && <Text style={S.mandateText}>{content.coreMandate}</Text>}
                  {phaseText && <Text style={S.phaseText}>{phaseText}</Text>}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>Pinnacle Data Unavailable</Text>
            <Text style={S.missingText}>
              Your Pinnacle cycles are calculated from your full birth date. This layer will populate
              once that data is on file.
            </Text>
          </View>
        )}
      </View>

      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}
