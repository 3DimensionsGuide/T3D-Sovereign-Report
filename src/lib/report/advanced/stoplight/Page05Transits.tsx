/**
 * Advanced Sovereign Report — Stoplight Section — Current Transits
 *
 * Everything before this page in the Stoplight section describes the sky
 * at the moment the reader was born — fixed for life. This page describes
 * the sky RIGHT NOW, relative to that fixed chart: which of the five slow
 * timing planets (Jupiter through Pluto) is currently forming a major
 * aspect to the reader's Sun, Moon, or Ascendant.
 *
 * Unlike every other page in this report, the data behind this page is
 * computed live at render time (calculateActiveTransits() in
 * src/server/engines/transits.ts), not derived from birth data alone —
 * so the same person's report will show different transits on different
 * days. Most days return few hits, sometimes zero. A quiet page is a
 * real, correct reading (a "consolidation season"), not missing data, and
 * is treated as its own graceful state rather than an error/empty state.
 *
 * Every active hit carries a definite timeframe (its `window`) — the
 * start/end dates of the current continuous pass through orb, not just an
 * "applying/separating" direction. Below that, a second section looks
 * forward instead of at the present: the next couple of transits
 * (getUpcomingTransits()) that aren't active yet but will be soonest,
 * each described with the same depth as an active hit so the reader has
 * something concrete to anticipate, not just a snapshot of right now.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../../shared/PageComponents';
import { C, F, PAGE } from '../../tokens';
import { getPlanetHouse } from './stoplight-content';
import {
  HOUSE_NAMES,
  getAspectLabel,
  getPlanetLabel,
  getTransitInterpretation,
  formatTransitWindow,
} from './transits-content';
import type { TransitHit, TransitAspectType, UpcomingTransit } from '../../../../server/engines/transits';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  crimsonLine: { width: PAGE.width, height: 1.5, backgroundColor: C.crimson },
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
    textTransform: 'uppercase', color: C.crimson,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  stack: { gap: 10 },
  card: {
    padding: 13, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid',
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  titleText: {
    fontFamily: F.display, fontSize: 14, fontWeight: 400, color: C.base, lineHeight: 1.2, marginRight: 4,
  },
  targetText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.parchmentFaint, marginRight: 6,
  },
  pill: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500, letterSpacing: 1,
    textTransform: 'uppercase', paddingVertical: 2.5, paddingHorizontal: 6,
  },
  pillNature: { color: C.crimsonDim, backgroundColor: C.crimsonLight },
  pillTiming: { color: C.base, backgroundColor: 'rgba(13,13,14,0.06)', opacity: 0.75 },
  pillUpcoming: { color: C.base, backgroundColor: 'rgba(13,13,14,0.06)', opacity: 0.75 },

  timeframeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 9 },
  timeframeLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500, letterSpacing: 1.4,
    textTransform: 'uppercase', color: C.crimsonDim,
  },
  timeframeText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 400, color: C.base, opacity: 0.78,
  },

  interpretationText: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.9, marginBottom: 6,
  },
  metaRow: { paddingTop: 6, borderTopWidth: 0.5, borderTopColor: 'rgba(13,13,14,0.08)' },
  metaText: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 400, letterSpacing: 0.4, color: C.parchmentFaint,
  },

  quietBlock: {
    padding: 24, backgroundColor: '#FFFFFF',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)', borderStyle: 'solid', gap: 10,
  },
  quietTitle: { fontFamily: F.display, fontSize: 17, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  quietText: { fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85, maxWidth: 460 },

  missingBlock: {
    padding: 20, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)', gap: 8,
  },
  missingTitle: { fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2 },
  missingText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },

  upcomingSection: { marginTop: 22 },
  upcomingDivider: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 16 },
  upcomingSectionTag: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.crimson, marginBottom: 6,
  },
  upcomingHeading: {
    fontFamily: F.display, fontSize: 16, fontWeight: 400, color: C.base, lineHeight: 1.2, marginBottom: 6,
  },
  upcomingSubtext: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.75,
    marginBottom: 12, maxWidth: 460,
  },
  upcomingCard: {
    backgroundColor: '#F5F3EE',
    borderStyle: 'dashed', borderColor: 'rgba(13,13,14,0.18)',
  },
  noneUpcomingBlock: {
    padding: 18, backgroundColor: '#F5F3EE',
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.1)',
  },
  noneUpcomingText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.78,
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

const NATAL_TARGET_LABELS: Record<TransitHit['natalTarget'], string> = {
  sun: 'Sun', moon: 'Moon', ascendant: 'Ascendant',
};

const ASPECT_NATURE: Record<TransitAspectType, string> = {
  conjunction: 'Blend', sextile: 'Supportive', square: 'Challenging',
  trine: 'Supportive', opposition: 'Challenging',
};

interface Props {
  data: Pick<ReportData, 'tropicalAsc'> & {
    activeTransits: TransitHit[];
    upcomingTransits: UpcomingTransit[];
  };
}

export default function Page05Transits({ data }: Props) {
  const hasAsc = !!data.tropicalAsc;
  const transits = data.activeTransits ?? [];
  const upcoming = data.upcomingTransits ?? [];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.crimsonLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Advanced Sovereign Report · The Stoplight</Text>
        <Text style={S.heading}>Your Current Transits</Text>
        <Text style={S.subheading}>
          Not your birth chart — the sky as it stands right now, relative to it. This is the
          only page in your report that will read differently if you come back to it later.
        </Text>
        <View style={S.headingRule} />

        <View style={S.mechanismBlock}>
          <Text style={S.mechanismLabel}>What&rsquo;s Being Tracked</Text>
          <Text style={S.mechanismText}>
            Jupiter, Saturn, Uranus, Neptune, and Pluto move slowly enough that a transit from
            one of them stays true for weeks or months, not hours — which is what makes them
            worth reporting in a page you&rsquo;ll come back to more than once. Each is checked
            against your Sun, Moon, and Ascendant for a live major aspect (conjunction, sextile,
            square, trine, or opposition, within a tight 3° orb).
          </Text>
        </View>

        {!hasAsc ? (
          <View style={S.missingBlock}>
            <Text style={S.missingTitle}>Transit Data Unavailable</Text>
            <Text style={S.missingText}>
              Transits are read against your natal Ascendant, which requires a confirmed birth
              time. This layer will populate once that data is on file.
            </Text>
          </View>
        ) : transits.length === 0 ? (
          <View style={S.quietBlock}>
            <Text style={S.quietTitle}>Currently Quiet</Text>
            <Text style={S.quietText}>
              None of the five timing planets are forming a major aspect to your Sun, Moon, or
              Ascendant right now — and that&rsquo;s a real reading, not a gap in the data. The
              sky isn&rsquo;t pressing on anything foundational at the moment. Consider this a
              season for consolidating what&rsquo;s already in motion, rather than one for
              waiting on a sign to act.
            </Text>
          </View>
        ) : (
          <View style={S.stack}>
            {transits.map((hit, i) => {
              const house = getPlanetHouse(hit.transitingSign, data.tropicalAsc);
              const interpretation = getTransitInterpretation(hit, house);
              return (
                <View style={S.card} key={i} wrap={false}>
                  <View style={S.cardHeaderRow}>
                    <Text style={S.titleText}>
                      {getPlanetLabel(hit.transitingPlanet)} {getAspectLabel(hit.aspect)}
                    </Text>
                    <Text style={S.targetText}>&rarr; Your {NATAL_TARGET_LABELS[hit.natalTarget]}</Text>
                    <Text style={[S.pill, S.pillNature]}>{ASPECT_NATURE[hit.aspect]}</Text>
                    <Text style={[S.pill, S.pillTiming]}>{hit.applying ? 'Applying' : 'Separating'}</Text>
                  </View>
                  <View style={S.timeframeRow}>
                    <Text style={S.timeframeLabel}>Active</Text>
                    <Text style={S.timeframeText}>{formatTransitWindow(hit.window)}</Text>
                  </View>
                  <Text style={S.interpretationText}>{interpretation}</Text>
                  <View style={S.metaRow}>
                    <Text style={S.metaText}>
                      Orb {hit.orb.toFixed(1)}{'°'} · Transiting {getPlanetLabel(hit.transitingPlanet)} in {hit.transitingSign}
                      {house !== null ? ` · ${HOUSE_NAMES[house]} (House ${house})` : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {hasAsc && (
          <View style={S.upcomingSection} wrap={false}>
            <View style={S.upcomingDivider} />
            <Text style={S.upcomingSectionTag}>Looking Ahead</Text>
            <Text style={S.upcomingHeading}>What&rsquo;s Coming Next</Text>
            <Text style={S.upcomingSubtext}>
              {upcoming.length > 1
                ? 'The next major transits on the horizon — not active yet, but the ones to watch for once the current picture above shifts.'
                : 'The next major transit on the horizon — not active yet, but the one to watch for once the current picture above shifts.'}
            </Text>

            {upcoming.length > 0 ? (
              <View style={S.stack}>
                {upcoming.map((next, i) => {
                  const upcomingHouse = getPlanetHouse(next.transitingSign, data.tropicalAsc);
                  const upcomingInterpretation = getTransitInterpretation(next, upcomingHouse);
                  return (
                    <View style={[S.card, S.upcomingCard]} key={i} wrap={false}>
                      <View style={S.cardHeaderRow}>
                        <Text style={S.titleText}>
                          {getPlanetLabel(next.transitingPlanet)} {getAspectLabel(next.aspect)}
                        </Text>
                        <Text style={S.targetText}>&rarr; Your {NATAL_TARGET_LABELS[next.natalTarget]}</Text>
                        <Text style={[S.pill, S.pillNature]}>{ASPECT_NATURE[next.aspect]}</Text>
                        <Text style={[S.pill, S.pillUpcoming]}>Not Yet Active</Text>
                      </View>
                      <View style={S.timeframeRow}>
                        <Text style={S.timeframeLabel}>Arrives</Text>
                        <Text style={S.timeframeText}>{formatTransitWindow(next.window)}</Text>
                      </View>
                      <Text style={S.interpretationText}>{upcomingInterpretation}</Text>
                      <View style={S.metaRow}>
                        <Text style={S.metaText}>
                          Transiting {getPlanetLabel(next.transitingPlanet)} in {next.transitingSign} at entry
                          {upcomingHouse !== null ? ` · ${HOUSE_NAMES[upcomingHouse]} (House ${upcomingHouse})` : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={S.noneUpcomingBlock}>
                <Text style={S.noneUpcomingText}>
                  None of the five timing planets are projected to reach your Sun, Moon, or
                  Ascendant within the next decade. The slowest planets — Neptune and Pluto in
                  particular — only sweep a small arc of the sky over that span, so this reflects
                  where they are in their long cycle, not a gap in the reading.
                </Text>
              </View>
            )}
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
