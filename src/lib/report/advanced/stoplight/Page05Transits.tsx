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
 *
 * Because this page's length varies with however many transits happen to
 * be live on a given day, it's the one page most likely to land a card
 * right at the bottom edge when react-pdf auto-paginates it across two
 * physical pages. `wrap={false}` on each card keeps a card from splitting
 * mid-card, and react-pdf's own page-break rule (`shouldSplit && !canWrap`
 * in @react-pdf/layout) is enough on its own to move a whole card to the
 * next page whenever it would end past the page's reserved bottom
 * padding — so the real fix is just making sure that reserved padding is
 * genuinely in effect.
 *
 * It wasn't. The two earlier attempts at this fix (escalating a
 * `TRANSITS_PAGE_BOTTOM_PADDING` constant and adding `minPresenceAhead` to
 * each card) had no visible effect at any value, including a 200pt
 * reservation — because `S.page` also carried the `padding: 0` shorthand,
 * declared after `paddingBottom` in the same style object. react-pdf
 * resolves style keys in declaration order (see `resolve()` in
 * @react-pdf/stylesheet), so `padding: 0` was silently re-expanding to
 * paddingTop/Right/Bottom/Left = 0 and clobbering whatever `paddingBottom`
 * had just been set to — the page's true wrap area was always the full
 * page height, so nothing ever overflowed by react-pdf's own reckoning no
 * matter how large the constant got. The fix is to stop using the
 * `padding` shorthand on this page's style so paddingBottom can't be
 * overwritten; once that's fixed, a modest reservation is all that's
 * needed.
 *
 * Fixing that surfaced a second, narrower issue: once the overflowing
 * active-transit card genuinely broke to a new page, a card further down
 * in the upcoming-transits list could *also* need its own break (when
 * there were enough active cards to fill most of the continuation page
 * too) — and react-pdf's pagination does not handle two independent
 * forced breaks landing in the same pass cleanly: it was reproducibly
 * inserting one fully blank page between the two breaks instead of
 * flowing straight through (confirmed by trimming the mock upcoming list
 * down one card at a time against the debug-transits-overflow route: 0 or
 * 1 upcoming cards — which only ever need at most one break total — paginate
 * cleanly; 2 upcoming cards, needing a second break, reproduces the blank
 * page every time). Flattening the card containers (removing the old
 * `View style={S.stack}` wrapper in favor of `marginBottom` on each card)
 * was tried and made no difference — the blank page is about *how many
 * breaks* happen in one pass, not about nesting depth.
 *
 * The first attempt at fixing that forced an explicit `break` on the
 * upcoming-transits section once the active count crossed a threshold —
 * but that still produced the blank page, because it's still two forced
 * breaks happening in the same react-pdf pagination pass (the active
 * cards' own overflow break, plus the now-unconditional break before
 * "Looking Ahead"); forcing *where* the second break happens doesn't
 * reduce the count to one.
 *
 * The actual fix (see PAGE05TRANSITS_SPLIT below) sidesteps react-pdf's
 * multi-break pagination entirely: once the active-card count crosses
 * `UPCOMING_FORCE_BREAK_AT_ACTIVE_COUNT`, the component renders two
 * genuinely separate top-level `<Page>` elements — header+active-cards on
 * one, "Looking Ahead" on the other — instead of one logical page that
 * react-pdf has to auto-flow across physical pages twice. Each `<Page>`
 * only ever has to handle its own overflow in isolation, which is the
 * single-break case already confirmed (via the debug-transits-overflow
 * route, trimming the mock upcoming list card by card) to paginate
 * cleanly. On an ordinary day (fewer than 3 active transits) nothing
 * changes — everything still renders as one page, auto-flowing normally.
 *
 * UPCOMING_RUNNING_HEADER: the split "Looking Ahead" page used to open
 * with only its own inline tag/heading (no primary page eyebrow, and no
 * repeat of that tag/heading if upcoming cards ever overflowed react-pdf's
 * own reflow past the shell's first physical page). Fixed the same way
 * Page03Bridges.tsx fixes its structurally identical gate-cards page: a
 * `fixed` running header repeats the primary eyebrow plus the section's
 * own tag/heading at the top of every physical page this shell produces.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines, CARD_MIN_PRESENCE_AHEAD } from '../../shared/PageComponents';
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

// Extra headroom reserved above the fixed footer, over and above the
// report's usual PAGE.marginV — this page's content length varies day to
// day (live transit data), so it gets a bit more defensive bottom
// clearance than a fixed-content page needs, purely so a card's meta row
// never sits flush against the footer rule. Modest on purpose: once the
// `padding` shorthand collision below is removed, this value is finally
// the real, effective wrap-area boundary react-pdf paginates against, so
// it doesn't need to be oversized to compensate for anything.
const TRANSITS_PAGE_BOTTOM_PADDING = PAGE.marginV + 30;

// Small additional safety margin (in points) react-pdf must confirm is
// left on the page before placing a transit card — a minor buffer against
// any rounding in react-pdf's own text-height estimate, not load-bearing
// now that the page's bottom padding genuinely reserves space. Shared
// with every other report page that stacks variable-height content —
// see CARD_MIN_PRESENCE_AHEAD's own docblock in PageComponents.tsx.

// Active-transit-card count at which the "Looking Ahead" (upcoming
// transits) section is forced onto its own fresh page instead of flowing
// after the active cards. See the docblock above: once the active stack is
// long enough to already be spilling onto a continuation page, letting
// the upcoming cards try to flow onto that same continuation page risks
// a second forced page break in the same pagination pass, which react-pdf
// does not handle cleanly (it inserts a blank page). 3 is the point where
// that risk starts — 2 active cards plus the upcoming section have never
// been observed to need a second break, only 3+.
const UPCOMING_FORCE_BREAK_AT_ACTIVE_COUNT = 3;

const S = StyleSheet.create({
  // NOTE: no `padding` shorthand here on purpose — it resolves after any
  // longhand `paddingX` set earlier in this object (react-pdf resolves
  // style keys in declaration order) and would silently zero out
  // `paddingBottom` below. Set every edge explicitly instead.
  page: {
    paddingTop: 0, paddingLeft: 0, paddingRight: 0,
    paddingBottom: TRANSITS_PAGE_BOTTOM_PADDING,
    backgroundColor: '#F5F5F3', fontFamily: F.sans,
  },
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

  card: {
    padding: 13, marginBottom: 10, backgroundColor: '#FFFFFF',
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
  runningHeader: { marginBottom: 4 },
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

// One physical page's worth of chrome (background lines, crimson divider,
// content padding, fixed footer) around whatever section content is passed
// in. Pulled out so the component below can render either one page (the
// ordinary case) or two (see PAGE05TRANSITS_SPLIT note) without
// duplicating the surrounding markup.
function TransitsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.crimsonLine} />
      <View style={S.content}>{children}</View>
      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}

export default function Page05Transits({ data }: Props) {
  const hasAsc = !!data.tropicalAsc;
  const transits = data.activeTransits ?? [];
  const upcoming = data.upcomingTransits ?? [];

  // PAGE05TRANSITS_SPLIT: once there are enough active cards that the
  // "Looking Ahead" section risks needing its own overflow break in
  // addition to the active cards' own break, render it as a genuinely
  // separate <Page> instead of letting react-pdf auto-flow both onto one
  // logical page. See the docblock above for why two breaks in one
  // react-pdf pagination pass produces a blank page, and why forcing an
  // explicit `break` on the same logical page wasn't enough to avoid that
  // (it's still two breaks). Splitting into two top-level <Page> elements
  // means each one only ever has to handle its own overflow, which is the
  // single-break case already confirmed to paginate cleanly.
  const splitToOwnPage = hasAsc && transits.length >= UPCOMING_FORCE_BREAK_AT_ACTIVE_COUNT;

  const header = (
    <>
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
    </>
  );

  const activeSection = (
    <>
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
          // Cards are direct children of `content` here, not wrapped in an
          // intermediate container — see the note above `CARD_MIN_PRESENCE_AHEAD`
          // for why. Spacing between them comes from each card's own
          // marginBottom instead of a parent `gap`.
          transits.map((hit, i) => {
              const house = getPlanetHouse(hit.transitingSign, data.tropicalAsc);
              const interpretation = getTransitInterpretation(hit, house);
              return (
                <View style={S.card} key={i} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
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
          })
        )}
    </>
  );

  // Shared between the merged (same-page) and split (own-page) layouts
  // below -- pulled out so neither has to duplicate the subtext or the
  // card list/empty-state.
  const upcomingSubtextNode = (
    <Text style={S.upcomingSubtext}>
      {upcoming.length > 1
        ? 'The next major transits on the horizon — not active yet, but the ones to watch for once the current picture above shifts.'
        : 'The next major transit on the horizon — not active yet, but the one to watch for once the current picture above shifts.'}
    </Text>
  );

  const upcomingCardsContent = upcoming.length > 0 ? (
    // Same flattening as the active-transit cards above — no
    // intermediate `stack` wrapper.
    upcoming.map((next, i) => {
        const upcomingHouse = getPlanetHouse(next.transitingSign, data.tropicalAsc);
        const upcomingInterpretation = getTransitInterpretation(next, upcomingHouse);
        return (
          <View style={[S.card, S.upcomingCard]} key={i} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
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
    })
  ) : (
    <View style={S.noneUpcomingBlock}>
      <Text style={S.noneUpcomingText}>
        None of the five timing planets are projected to reach your Sun, Moon, or
        Ascendant within the next decade. The slowest planets — Neptune and Pluto in
        particular — only sweep a small arc of the sky over that span, so this reflects
        where they are in their long cycle, not a gap in the reading.
      </Text>
    </View>
  );

  // Merged case (ordinary day, everything fits on one page): "Looking
  // Ahead" flows right after the active cards on the same physical page,
  // so its own tag/heading/divider only ever need to appear once, inline.
  const upcomingSection = hasAsc && (
    <View style={S.upcomingSection}>
      <View style={S.upcomingDivider} />
      <Text style={S.upcomingSectionTag}>Looking Ahead</Text>
      <Text style={S.upcomingHeading}>What&rsquo;s Coming Next</Text>
      {upcomingSubtextNode}
      {upcomingCardsContent}
    </View>
  );

  // UPCOMING_RUNNING_HEADER: split case only. This section becomes its own
  // top-level <Page> (see PAGE05TRANSITS_SPLIT above), so unlike the
  // merged case it can no longer rely on anything above it on the same
  // page for context -- and if enough upcoming transits are live to push
  // react-pdf's own reflow past this shell's first physical page, that
  // further page would otherwise open with a bare card and nothing above
  // it, the same orphaned-page defect fixed in Page03Bridges.tsx (see its
  // GATE_CARDS_RUNNING_HEADER note). `fixed` repeats this block at the
  // top of every physical page this shell produces, reflow included, and
  // it also carries the primary page eyebrow this section otherwise never
  // gets when split onto its own page.
  const upcomingRunningHeader = (
    <View style={S.runningHeader} fixed>
      <Text style={S.sectionTag}>Advanced Sovereign Report · The Stoplight</Text>
      <Text style={S.upcomingSectionTag}>Looking Ahead</Text>
      <Text style={S.upcomingHeading}>What&rsquo;s Coming Next</Text>
      <View style={S.upcomingDivider} />
    </View>
  );

  if (splitToOwnPage) {
    return (
      <>
        <TransitsPageShell>
          {header}
          {activeSection}
        </TransitsPageShell>
        <TransitsPageShell>
          {upcomingRunningHeader}
          {upcomingSubtextNode}
          {upcomingCardsContent}
        </TransitsPageShell>
      </>
    );
  }

  return (
    <TransitsPageShell>
      {header}
      {activeSection}
      {upcomingSection}
    </TransitsPageShell>
  );
}
