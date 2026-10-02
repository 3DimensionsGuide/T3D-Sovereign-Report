/**
 * Advanced Sovereign Report — Vehicle Section — Where You Need a Bridge
 *
 * Dedicated page for the Split/Triple Split/Quadruple Split bridge-gate
 * detail — split out from Page02Definition so neither page has to rely on
 * react-pdf's automatic reflow to land the footer somewhere legible.
 *
 * Only meaningful for charts with more than one Definition group. Use
 * hasBridgePage(data) to decide whether to include this page at all when
 * assembling the full document — a Single Definition or Reflector chart has
 * nothing to bridge, and this page should be omitted entirely rather than
 * rendered empty.
 *
 * Card structure (revised): each bridge pairing used to render as one
 * continuous bordered box — tag/title/body AND every hanging gate's full
 * auric depth all inside a single View. For a narrow split with several
 * researched hanging gates (not uncommon — a bridge pairing can hang more
 * than one gate) that combined box can genuinely exceed one page's height,
 * and react-pdf has no clean way to carry a bordered View's chrome across
 * a page break: the observed failure was the box's header rendering on
 * one page, an orphaned near-blank continuation page, and the gate detail
 * resuming on a third page inside a border with no header or label at all
 * — a card no longer accompanies its own context.
 *
 * Fixed the same way Page05Transits.tsx fixes its own variable-length
 * card list: flatten into independent, individually atomic cards instead
 * of one box that has to wrap internally. The pairing's intro (tag +
 * title + body) is its own small `wrap={false}` card; each hanging gate
 * is its OWN bordered card with its own `wrap={false}` +
 * `minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}` and its own "Bridge Gate
 * N of M" label, so a gate card always carries its own identification no
 * matter which page it lands on. When more than one bridge pairing has
 * hanging gates, the first card of each pairing's group also carries that
 * pairing's own identity (e.g. "Throat + Sacral ↔ Spleen + Root") so a
 * reader can tell which pairing a run of gate cards belongs to.
 *
 * Page split (see BRIDGES_PAGE_SPLIT below): the intro card(s) and the
 * gate card(s) render as genuinely separate top-level <Page> elements
 * rather than sharing one <Page>'s auto-flow — fixes a reproducible
 * "blank page between two independent forced breaks" bug (same root
 * cause Page05Transits.tsx's docblock documents).
 *
 * GATE_CARDS_RUNNING_HEADER: the gate-cards page used to open with
 * whatever content happened to flow onto it and nothing else — no page
 * eyebrow, no title. That's invisible when every gate card fits on one
 * physical page (the pairing-identity label, when present, reads as a
 * header). But when the cards overflow react-pdf's own internal reflow
 * onto a further physical page (confirmed on a real report: three hanging
 * gates on one narrow split pushed the third card onto its own page), that
 * further page had literally nothing above the card — no section context,
 * no title, just a bordered box floating near the top of an otherwise
 * blank page. A `fixed` header placed at the top of this shell's content
 * (the standard react-pdf idiom for a running header, same mechanism the
 * footer below already uses for repeating on every physical page) fixes
 * this by construction: it repeats on every physical page this shell
 * produces, reflow included, so no page in this section is ever a
 * headerless orphan. It reuses `sectionTag`/`heading`/`headingRule`
 * verbatim rather than a separately-sized "sub-header" variant (an
 * earlier pass here used a smaller heading and tighter spacing, which
 * read as visibly thinner than every other page's header once printed)
 * — so this page's chrome is pixel-identical to the rest of the report.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines, CARD_MIN_PRESENCE_AHEAD } from '../../shared/PageComponents';
import { C, F, PAGE, calculateDefinition, calculateSplitBridges } from '../../tokens';
import { CENTER_DISPLAY_NAME } from '../../section3/hd-content';
import { GATE_KEYNOTES, HANGING_GATE_AURIC_DETAIL } from '../../section3/gate-content';
import type { ReportData } from '../../tokens';

const S = StyleSheet.create({
  page: { paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: PAGE.marginV, backgroundColor: '#F5F5F3', fontFamily: F.sans }, // QA fix: explicit edges, no padding shorthand (see Page05Transits.tsx)
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
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
    lineHeight: 1.5, marginBottom: 20, maxWidth: 420,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 24 },

  // Running header for the gate-cards shell — rendered `fixed`, so it
  // repeats at the top of every physical page that shell produces. No
  // styles of its own: it reuses `sectionTag` + `heading` + `headingRule`
  // verbatim (see gateCardsRunningHeader below) so it reads as identical
  // page chrome to every other page in the report, not a distinct,
  // smaller "continuation" treatment.
  runningHeader: {},

  mechanismBlock: {
    padding: 16, backgroundColor: '#F5F3EE',
    borderLeftWidth: 2, borderLeftColor: C.amber, borderLeftStyle: 'solid',
    marginBottom: 20,
  },
  mechanismLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 6,
  },
  mechanismText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.88,
  },

  // Intro card: tag + title + body only, for one bridge pairing. Always
  // short/bounded regardless of a reader's data (just description text),
  // so wrap={false} on it is always safe.
  introCard: {
    marginBottom: 14,
    padding: 18, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  introCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  introCardTag: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2,
    color: '#FFFFFF', backgroundColor: C.amber, textTransform: 'uppercase',
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 2,
  },
  introCardTitle: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: C.base,
  },
  introCardBody: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.88,
  },

  gateCardsLabel: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.4,
    color: C.amberDim, textTransform: 'uppercase', marginBottom: 8,
  },

  // One card per hanging gate — its own border, so it always carries its
  // own identification whichever page it lands on.
  gateCard: {
    marginBottom: 12,
    padding: 16, backgroundColor: '#FFFFFF',
    borderWidth: 0.75, borderColor: C.base, borderStyle: 'solid', borderRadius: 3,
  },
  gateCardTag: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1, color: C.amberDim,
    textTransform: 'uppercase', marginBottom: 6,
  },
  hangingGateText: {
    fontFamily: F.sans, fontSize: 10, fontWeight: 400, color: C.base, lineHeight: 1.5,
  },
  auricSubLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 0.8, color: C.base, opacity: 0.5,
    textTransform: 'uppercase', marginTop: 8,
  },
  auricText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.88, marginTop: 3,
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
  data: Pick<ReportData, 'hdDefinedCenters' | 'hdChannels' | 'hdActiveGates'>;
}

/** Whether this page has anything to show — Single Definition and Reflector charts don't. */
export function hasBridgePage(data: Props['data']): boolean {
  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  return result.groups.length > 1;
}

// One physical page's worth of chrome (background lines, amber divider,
// content padding, fixed footer) around whatever section content is
// passed in. Pulled out so the component below can render the intro
// card(s) and the gate card(s) as genuinely separate <Page> elements —
// see the docblock note on BRIDGES_PAGE_SPLIT below for why.
function BridgesPageShell({ children }: { children: React.ReactNode }) {
  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.amberLine} />
      <View style={S.content}>{children}</View>
      <View style={S.footer} fixed>
        <Text style={S.footerText}>T3D Advanced Sovereign Report</Text>
        <Text style={S.pageNum} render={({ pageNumber }) => pageNumber} />
      </View>
    </Page>
  );
}

export default function Page03Bridges({ data }: Props) {
  const result = calculateDefinition(data.hdDefinedCenters, data.hdChannels);
  const bridges = calculateSplitBridges(result.groups, data.hdActiveGates);

  const groupLabel = (groupIndex: number) =>
    result.groups[groupIndex]
      .map(c => CENTER_DISPLAY_NAME[c] ?? c)
      .join(' + ');

  const header = (
    <>
      <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
      <Text style={S.heading}>Where You Need a Bridge</Text>
      <Text style={S.subheading}>
        Not every gap is the same. A narrow split means you already hold half of what would
        connect two islands — one specific gate is the difference, and the psychology tends
        to turn inward. A wide split means a whole channel is missing, with no single quality
        of your own that closes it — the psychology tends to turn outward, toward a partner,
        a group, or the world.
      </Text>
      <View style={S.headingRule} />

      <View style={S.mechanismBlock}>
        <Text style={S.mechanismLabel}>What Is A Hanging Gate?</Text>
        <Text style={S.mechanismText}>
          A hanging gate is a gate that&rsquo;s active on your side of a channel while its
          partner gate, on the other end, stays open. On its own it can&rsquo;t finish the
          connection — but it works as a live receptor instead. Step into the aura of someone
          (or somewhere) carrying that missing partner gate, and the channel completes for as
          long as you&rsquo;re in range: an electromagnetic bridge closes the gap and lets
          energy move freely between your two islands. That&rsquo;s the actual mechanism
          behind why a specific kind of person, or even just a public space, can make you feel
          suddenly whole in a way you can&rsquo;t produce alone.
        </Text>
      </View>
    </>
  );

  // Running header for the gate-cards shell — see GATE_CARDS_RUNNING_HEADER
  // in the docblock above. `fixed` repeats this at the top of every
  // physical page the second BridgesPageShell produces, including any
  // react-pdf reflow overflow page, so that page is never headerless.
  // Reuses sectionTag/heading/headingRule verbatim (not a smaller,
  // separately-styled variant) so this page's header is pixel-identical
  // to every other page's, not a visibly thinner "continuation" treatment.
  const gateCardsRunningHeader = (
    <View style={S.runningHeader} fixed>
      <Text style={S.sectionTag}>Advanced Sovereign Report · The Vehicle</Text>
      <Text style={S.heading}>Your Bridge Gates</Text>
      <View style={S.headingRule} />
    </View>
  );

  // Dedupe + classify once per bridge pairing, shared by both the intro
  // cards and the gate cards below.
  const prepared = bridges.map((bridge) => ({
    bridge,
    dedupedGates: bridge.classification === 'narrow'
      ? Array.from(new Map(bridge.hangingGates.map(hg => [hg.partnerGate, hg])).values())
      : [],
  }));
  const hasAnyGateCards = prepared.some(p => p.dedupedGates.length > 0);
  const gatedPairingsCount = prepared.filter(p => p.dedupedGates.length > 0).length;

  const introCards = prepared.map(({ bridge }, i) => (
    <View key={i} style={S.introCard} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
      <View style={S.introCardHeader}>
        <Text style={S.introCardTag}>
          {bridge.classification === 'narrow' ? 'Narrow Split' : 'Wide Split'}
        </Text>
        <Text style={S.introCardTitle}>
          {groupLabel(bridge.groupAIndex)} {'↔'} {groupLabel(bridge.groupBIndex)}
        </Text>
      </View>
      <Text style={S.introCardBody}>
        {bridge.classification === 'narrow'
          ? "You already carry half of what would connect these two islands — one specific gate is the difference. That tends to turn inward: a quiet sense that you should be able to supply this yourself, and self-blame when you can't."
          : "An entire channel is missing between these two islands, not just one gate — there's no single quality of your own that closes this gap. That tends to turn outward: toward a partner, a group, or the world to supply what's missing, rather than toward yourself."}
      </Text>
    </View>
  ));

  // Cards are flattened here rather than nested in one wrapping View per
  // bridge pairing -- same reasoning as Page05Transits.tsx (see that
  // file's docblock): react-pdf does not reliably carry a bordered View's
  // chrome across a page break, so each card that might need to move to a
  // fresh page is its own independent, wrap={false} unit with its own
  // border. Spacing between cards comes from each card's own marginBottom
  // instead of a parent `gap`.
  //
  // The page now opens with a running "Your Bridge Gates" header (see
  // gateCardsRunningHeader above), so the per-pairing label below only
  // needs to appear when there's more than one gated pairing to tell
  // apart — a lone pairing (the common case) would just repeat the
  // running header's own title.
  const gateCardSections = prepared.map(({ bridge, dedupedGates }, i) => {
    const pairingLabel = gatedPairingsCount > 1
      ? `${groupLabel(bridge.groupAIndex)} ${'↔'} ${groupLabel(bridge.groupBIndex)}`
      : null;

    return (
      <React.Fragment key={i}>
        {dedupedGates.map((hg, hi) => {
          const partnerKeynote = GATE_KEYNOTES[hg.partnerGate];
          const auric = HANGING_GATE_AURIC_DETAIL[hg.partnerGate];
          const card = (
            <View key={hi} style={S.gateCard} wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
              {dedupedGates.length > 1 && (
                <Text style={S.gateCardTag}>Bridge Gate {hi + 1} of {dedupedGates.length}</Text>
              )}
              <Text style={S.hangingGateText}>
                Gate {hg.partnerGate}{partnerKeynote ? ` — ${partnerKeynote.ichingName}` : ''}
                {partnerKeynote ? `: ${partnerKeynote.coreMeaning}` : ''}
              </Text>
              {auric && (
                <>
                  <Text style={S.auricSubLabel}>Where It Sits</Text>
                  <Text style={S.auricText}>{auric.location}</Text>
                  <Text style={S.auricSubLabel}>Its Channels</Text>
                  <Text style={S.auricText}>{auric.channels}</Text>
                  <Text style={S.auricSubLabel}>What You&rsquo;d Feel Around It</Text>
                  <Text style={S.auricText}>{auric.experience}</Text>
                </>
              )}
            </View>
          );

          // The pairing label (when shown) is grouped into one atomic unit
          // with the FIRST gate card of its pairing only, so it can never
          // be stranded alone at the bottom of a page while its card moves
          // to the next one -- later cards paginate independently.
          if (hi === 0 && pairingLabel) {
            return (
              <View key="gate-group-first" wrap={false} minPresenceAhead={CARD_MIN_PRESENCE_AHEAD}>
                <Text style={S.gateCardsLabel}>{pairingLabel}</Text>
                {card}
              </View>
            );
          }
          return card;
        })}
      </React.Fragment>
    );
  });

  // BRIDGES_PAGE_SPLIT: the intro card(s) and the gate card(s) used to
  // share one <Page>'s auto-flow. Even though the intro card alone always
  // leaves most of the page empty, react-pdf's pagination has to decide,
  // in the same pass, whether the *next* independent wrap={false} unit
  // (the first gate card, or its pairing-label group) fits in what's left
  // — and if it doesn't, defers the whole thing to a fresh page rather
  // than splitting it. That is one legitimate forced break. But the
  // remaining gate cards after it can *also* need their own break if there
  // are enough of them (observed: 3 hanging gates on a narrow split). Two
  // independent forced breaks inside one react-pdf pagination pass is
  // exactly the bug Page05Transits.tsx's docblock documents at length:
  // react-pdf reproducibly inserts one fully blank page between the two
  // breaks instead of flowing straight through, no matter how much
  // padding or minPresenceAhead headroom is added — the blank page isn't
  // short on room, it's a pagination-pass artifact. The fix is the same
  // one Transits uses once enough content is in play: stop relying on one
  // <Page>'s auto-flow to handle two independent breaks, and render the
  // intro card(s) and the gate card(s) as genuinely separate top-level
  // <Page> elements instead. Each one then only ever has to handle its
  // own overflow in isolation, which paginates cleanly.
  return (
    <>
      <BridgesPageShell>
        {header}
        {introCards}
      </BridgesPageShell>
      {hasAnyGateCards && (
        <BridgesPageShell>
          {gateCardsRunningHeader}
          {gateCardSections}
        </BridgesPageShell>
      )}
    </>
  );
}
