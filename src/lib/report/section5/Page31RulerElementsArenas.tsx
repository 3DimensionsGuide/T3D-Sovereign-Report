/**
 * Page 31 — Your Ruler, Elements & Life Arenas
 *
 * Reader question: "What patterns are emphasized beyond the Big Three?"
 *
 * Editorial principle: select, don't inventory.
 *   — One chart ruler (from Rising if confirmed; from Sun if birth time uncertain)
 *   — One or two key life arenas (house placements, Whole Sign)
 *   — One focused Tropical / Sidereal element + modality comparison card
 *   — Methodology labeled explicitly
 *
 * No twelve-house inventory. No aspect table. One comparison card only.
 *
 * Layout: 7+5 interpretation grid
 *   Left (flex 7)  — Chart Ruler + Key Life Arenas
 *   Right (flex 5) — Element & Modality comparison card
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { GRID } from '../shared/grid';
import type { ReportData } from '../tokens';

const STAR_SLATE = '#6D7797';

// ─── Lookup tables ────────────────────────────────────────────────────────────

const SIGN_ORDER: Record<string, number> = {
  Aries:0, Taurus:1, Gemini:2, Cancer:3, Leo:4, Virgo:5,
  Libra:6, Scorpio:7, Sagittarius:8, Capricorn:9, Aquarius:10, Pisces:11,
};

type Element  = 'Fire' | 'Earth' | 'Air' | 'Water';
type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

const ELEMENTS: Record<string, Element> = {
  Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
  Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
  Gemini:'Air', Libra:'Air', Aquarius:'Air',
  Cancer:'Water', Scorpio:'Water', Pisces:'Water',
};

const MODES: Record<string, Modality> = {
  Aries:'Cardinal', Cancer:'Cardinal', Libra:'Cardinal', Capricorn:'Cardinal',
  Taurus:'Fixed', Leo:'Fixed', Scorpio:'Fixed', Aquarius:'Fixed',
  Gemini:'Mutable', Virgo:'Mutable', Sagittarius:'Mutable', Pisces:'Mutable',
};

const RULERS: Record<string, string> = {
  Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon',
  Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars',
  Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter',
};

const RULER_THEME: Record<string, string> = {
  Venus:   'Relationship, beauty, and aesthetic intelligence are the medium through which your life unfolds.',
  Mars:    'Initiative, directness, and the quality of how you act are the primary currents in your chart.',
  Mercury: 'Communication, synthesis, and the quality of your thinking organize your life experience.',
  Moon:    'Emotional attunement, belonging, and how you feel at home shape everything else.',
  Sun:     'Self-expression and the quality of your presence are the organizing principle of your chart.',
  Jupiter: 'Expansion, meaning, and the search for what is larger than the immediate situation.',
  Saturn:  'Discipline, structure, and the relationship between effort and lasting achievement.',
};

const RULER_NOTE: Record<string, string> = {
  Venus:   'Where Venus is active, the quality of how things are — relationally and aesthetically — tends to matter as much as what they accomplish.',
  Mars:    'Where Mars is active, the quality of initiation and the willingness to move first are what determine how things unfold.',
  Mercury: 'Where Mercury is active, the quality of language and thinking — not just their content — shapes what is possible.',
  Moon:    'Where the Moon is active, the inner emotional state is the most reliable indicator of whether you are on course.',
  Sun:     'Where the Sun is active, self-expression and vitality are the primary resources and the primary invitation.',
  Jupiter: 'Where Jupiter is active, the search for meaning and the willingness to expand beyond what is comfortable are the engines.',
  Saturn:  'Where Saturn is active, patience and demonstrated competence are the operative currency.',
};

const HOUSE_NAMES: Record<number, string> = {
  1:'Identity & First Impression', 2:'Resources & Values',
  3:'Communication & Local', 4:'Home & Roots',
  5:'Creativity & Expression', 6:'Work & Daily Practice',
  7:'Partnership & Relationship', 8:'Depth & Transformation',
  9:'Philosophy & Expansion', 10:'Career & Reputation',
  11:'Community & Vision', 12:'Inner Life & Hidden Terrain',
};

const HOUSE_THEMES: Record<number, string> = {
  1:'How you meet life and are first encountered — the primary self-presentation arena.',
  2:'What you value and are building as security — resource, material, and inner.',
  3:'How you think and communicate in your immediate environment.',
  4:'Your private life, family history, and the feeling of being at home.',
  5:'Where creative energy and self-expression are most alive.',
  6:'Daily work, health, and the practice of showing up with consistency.',
  7:'Key partnerships and how you are met in close relationship.',
  8:'Transformation, shared depth, and what you are currently releasing.',
  9:'Philosophy, travel, and the search for broader meaning.',
  10:'Your public role and what you are building as lasting reputation.',
  11:'Community, collective vision, and where you belong in a larger story.',
  12:'The inner life, the hidden, and what you are processing beneath the surface.',
};

// ─── Calculation helpers ──────────────────────────────────────────────────────

function getSign(formatted: string): string {
  if (!formatted || formatted === '—') return '—';
  return formatted.trim().split(' ').pop() ?? '—';
}

/** Whole Sign house number from sign names */
function wholeSignHouse(planetSign: string, ascSign: string): number | null {
  const p = SIGN_ORDER[planetSign];
  const a = SIGN_ORDER[ascSign];
  if (p === undefined || a === undefined) return null;
  return 1 + ((p - a + 12) % 12);
}

interface ElementCount {
  Fire: number; Earth: number; Air: number; Water: number;
}
interface ModeCount {
  Cardinal: number; Fixed: number; Mutable: number;
}

function countBalance(signs: string[]): { elements: ElementCount; modes: ModeCount } {
  const elements: ElementCount = { Fire:0, Earth:0, Air:0, Water:0 };
  const modes:    ModeCount    = { Cardinal:0, Fixed:0, Mutable:0 };
  for (const s of signs) {
    if (ELEMENTS[s]) elements[ELEMENTS[s]!]++;
    if (MODES[s])    modes[MODES[s]!]++;
  }
  return { elements, modes };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 36, paddingBottom: PAGE.marginV,
  },
  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5,
    marginBottom: 16, maxWidth: 440,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 18,
  },

  // 7+5 grid
  grid: { flexDirection: 'row', gap: GRID.gap, flex: 1 },
  leftCol:  { flex: GRID.interpretation.copy },     // flex: 7
  rightCol: { flex: GRID.interpretation.callout },  // flex: 5

  // Shared block styles
  blockLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 6,
  },
  blockRule: {
    height: 0.5, backgroundColor: C.base, opacity: 0.1,
    marginBottom: 12,
  },
  sectionGap: { height: 20 },

  // ── Chart Ruler ──────────────────────────────────────────────────────────
  rulerPlanet: {
    fontFamily: F.display, fontSize: 18, fontWeight: 400,
    color: C.crimson, lineHeight: 1.1, marginBottom: 2,
  },
  rulerSource: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 300,
    color: C.parchmentFaint, letterSpacing: 0.5, marginBottom: 10,
  },
  rulerTheme: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5,
    marginBottom: 8, opacity: 0.85,
  },
  rulerNote: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.base, lineHeight: 1.6, opacity: 0.82,
  },

  // ── Life Arenas ──────────────────────────────────────────────────────────
  arenaItem: { marginBottom: 12, gap: 3 },
  arenaHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  arenaHouseNum: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 700,
    color: C.crimson,
  },
  arenaHouseName: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    color: C.base, letterSpacing: 0.3,
  },
  arenaTheme: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.82,
  },
  arenaPlanet: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500,
    color: C.parchmentFaint, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 2,
  },

  // ── Sensitivity notice (inline compact) ──────────────────────────────────
  sensitivityNote: {
    padding: 10, gap: 4,
    backgroundColor: '#FDF5E8',
    borderLeftWidth: 2, borderLeftColor: C.amberDim, borderLeftStyle: 'solid',
  },
  sensitivityLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.amberDim,
  },
  sensitivityText: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base, lineHeight: 1.5,
  },

  // ── Element/Modality comparison card (right col) ─────────────────────────
  compCard: {
    padding: 12, gap: 0,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
    backgroundColor: 'rgba(13,13,14,0.02)',
  },
  compTitle: {
    fontFamily: F.display, fontSize: 11, fontWeight: 400,
    color: C.base, lineHeight: 1.2, marginBottom: 4,
  },
  compMethod: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.4, marginBottom: 10,
  },
  compTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.12)',
    paddingBottom: 4, marginBottom: 4,
  },
  compColLabel: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint,
  },
  compRow: {
    flexDirection: 'row', paddingVertical: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.07)',
  },
  compRowLast: { flexDirection: 'row', paddingVertical: 4 },
  compName: {
    flex: 3,
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base,
  },
  compTrop: {
    flex: 2, textAlign: 'center',
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    color: C.crimson,
  },
  compSide: {
    flex: 2, textAlign: 'center',
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    color: STAR_SLATE,
  },
  compCardRule: {
    height: 0.5, backgroundColor: C.base, opacity: 0.1,
    marginVertical: 10,
  },
  compInsight: {
    fontFamily: F.display, fontSize: 9, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5,
    opacity: 0.78,
  },
  compNote: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.4, marginTop: 6,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CompCardProps {
  tropSigns:   string[];
  sidSigns:    string[];
  risingKnown: boolean;
  ayanamsha:   string;
}

function ElementModalityCard({ tropSigns, sidSigns, risingKnown, ayanamsha }: CompCardProps) {
  const trop = countBalance(tropSigns.filter(s => s !== '—'));
  const sid  = countBalance(sidSigns.filter(s => s !== '—'));

  const elements: Element[]  = ['Fire','Earth','Air','Water'];
  const modes: Modality[]    = ['Cardinal','Fixed','Mutable'];

  const dominantTropEl  = elements.reduce((a,b) => trop.elements[a] >= trop.elements[b] ? a : b);
  const dominantSidEl   = elements.reduce((a,b) => sid.elements[a]  >= sid.elements[b]  ? a : b);
  const sameEl = dominantTropEl === dominantSidEl;

  const insight = sameEl
    ? `Both reference systems emphasize ${dominantTropEl} as the dominant element — a consistent elemental quality across both lenses.`
    : `The Tropical lens emphasizes ${dominantTropEl} while the Sidereal lens shifts toward ${dominantSidEl} — two angles on the same person's elemental range.`;

  const methodNote = risingKnown
    ? `Tropical: Sun, Moon, Rising (Whole Sign Houses)\nSidereal: Sun, Moon, Rising (${ayanamsha} ayanamsha)`
    : `Tropical: Sun + Moon (Rising excluded — birth time unconfirmed)\nSidereal: Sun + Moon (${ayanamsha} ayanamsha)`;

  return (
    <View style={S.compCard}>
      <Text style={[S.blockLabel, { marginBottom: 8 }]}>
        Element & Modality Balance
      </Text>
      <Text style={S.compTitle}>Tropical vs Sidereal</Text>
      <Text style={S.compMethod}>{methodNote}</Text>

      {/* Element table */}
      <View style={S.compTableHeader}>
        <Text style={[S.compColLabel, { flex: 3 }]}>Element</Text>
        <Text style={[S.compColLabel, { flex: 2, textAlign: 'center', color: C.crimson }]}>Tropical</Text>
        <Text style={[S.compColLabel, { flex: 2, textAlign: 'center', color: STAR_SLATE }]}>Sidereal</Text>
      </View>
      {elements.map((el, i) => {
        const isLast = i === elements.length - 1;
        const tVal = trop.elements[el];
        const sVal = sid.elements[el];
        return (
          <View key={el} style={isLast ? S.compRowLast : S.compRow}>
            <Text style={S.compName}>{el}</Text>
            <Text style={[S.compTrop, tVal === 0 ? { opacity: 0.3 } : {}]}>
              {tVal > 0 ? '●'.repeat(tVal) : '○'}
            </Text>
            <Text style={[S.compSide, sVal === 0 ? { opacity: 0.3 } : {}]}>
              {sVal > 0 ? '●'.repeat(sVal) : '○'}
            </Text>
          </View>
        );
      })}

      <View style={S.compCardRule} />

      {/* Modality table */}
      <View style={S.compTableHeader}>
        <Text style={[S.compColLabel, { flex: 3 }]}>Modality</Text>
        <Text style={[S.compColLabel, { flex: 2, textAlign: 'center', color: C.crimson }]}>Tropical</Text>
        <Text style={[S.compColLabel, { flex: 2, textAlign: 'center', color: STAR_SLATE }]}>Sidereal</Text>
      </View>
      {modes.map((mo, i) => {
        const isLast = i === modes.length - 1;
        const tVal = trop.modes[mo];
        const sVal = sid.modes[mo];
        return (
          <View key={mo} style={isLast ? S.compRowLast : S.compRow}>
            <Text style={S.compName}>{mo}</Text>
            <Text style={[S.compTrop, tVal === 0 ? { opacity: 0.3 } : {}]}>
              {tVal > 0 ? '●'.repeat(tVal) : '○'}
            </Text>
            <Text style={[S.compSide, sVal === 0 ? { opacity: 0.3 } : {}]}>
              {sVal > 0 ? '●'.repeat(sVal) : '○'}
            </Text>
          </View>
        );
      })}

      <View style={S.compCardRule} />
      <Text style={S.compInsight}>{insight}</Text>
    </View>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

interface Props {
  data: ReportData & { siderealMoon?: string; ayanamsha?: string };
}

export default function Page31RulerElementsArenas({ data }: Props) {
  const risingKnown   = data.risingSign !== '—' && !!data.risingSign;
  const birthTimeNote = !risingKnown;

  // Chart ruler — from Rising if known, else from Sun
  const rulerSource = risingKnown ? data.risingSign : data.sunSign;
  const rulerBasis  = risingKnown ? 'Rising' : 'Sun (birth time unconfirmed)';
  const rulerPlanet = RULERS[rulerSource] ?? 'Venus';
  const rulerTheme  = RULER_THEME[rulerPlanet] ?? '';
  const rulerNote   = RULER_NOTE[rulerPlanet]  ?? '';

  // Life arenas — Whole Sign houses (Sun + Moon)
  const ascSign = risingKnown ? data.risingSign : null;
  const sunHouse  = ascSign ? wholeSignHouse(data.sunSign,  ascSign) : null;
  const moonHouse = ascSign ? wholeSignHouse(data.moonSign, ascSign) : null;

  // Element/modality signs
  const sidSunSign  = getSign(data.siderealSun);
  const sidMoonSign = getSign(data.siderealMoon ?? '—');
  const sidAscSign  = getSign(data.siderealAsc);

  const tropSigns = risingKnown
    ? [data.sunSign, data.moonSign, data.risingSign]
    : [data.sunSign, data.moonSign];
  const sidSigns = (risingKnown && sidAscSign !== '—')
    ? [sidSunSign, sidMoonSign, sidAscSign]
    : [sidSunSign, sidMoonSign];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Chart Patterns · Selected Reading</Text>
        <Text style={S.heading}>Your Ruler, Elements & Life Arenas</Text>
        <Text style={S.sub}>
          What patterns are emphasized beyond the Big Three?
        </Text>
        <View style={S.pageRule} />

        <View style={S.grid}>
          {/* ── Left column (7): Ruler + Arenas ─────────────────────────── */}
          <View style={S.leftCol}>

            {/* Chart Ruler */}
            <Text style={S.blockLabel}>
              Chart Ruler · Tropical Reference · {rulerBasis}
            </Text>
            <View style={S.blockRule} />

            <Text style={S.rulerPlanet}>{rulerPlanet}</Text>
            <Text style={S.rulerSource}>
              {rulerSource} → {rulerPlanet}
            </Text>
            <Text style={S.rulerTheme}>{rulerTheme}</Text>
            <Text style={S.rulerNote}>{rulerNote}</Text>

            <View style={S.sectionGap} />

            {/* Key Life Arenas */}
            <Text style={S.blockLabel}>
              Key Life Arenas · Whole Sign Houses · Tropical
            </Text>
            <View style={S.blockRule} />

            {birthTimeNote ? (
              <View style={S.sensitivityNote}>
                <Text style={S.sensitivityLabel}>Birth-Time Notice</Text>
                <Text style={S.sensitivityText}>
                  House placements require a confirmed birth time. The arenas below
                  reflect the natural emphasis of your Sun and Moon signs rather than
                  calculated house positions.{'\n\n'}
                  Add your birth time at 3dimensions.guide/update-time to receive
                  personalized house placements.
                </Text>
              </View>
            ) : (
              <>
                {sunHouse !== null && HOUSE_NAMES[sunHouse] && (
                  <View style={S.arenaItem}>
                    <Text style={S.arenaPlanet}>Sun · {data.sunSign}</Text>
                    <View style={S.arenaHeader}>
                      <Text style={S.arenaHouseNum}>H{sunHouse}</Text>
                      <Text style={S.arenaHouseName}>{HOUSE_NAMES[sunHouse]}</Text>
                    </View>
                    <Text style={S.arenaTheme}>{HOUSE_THEMES[sunHouse]}</Text>
                  </View>
                )}
                {moonHouse !== null && HOUSE_NAMES[moonHouse] && moonHouse !== sunHouse && (
                  <View style={S.arenaItem}>
                    <Text style={S.arenaPlanet}>Moon · {data.moonSign}</Text>
                    <View style={S.arenaHeader}>
                      <Text style={S.arenaHouseNum}>H{moonHouse}</Text>
                      <Text style={S.arenaHouseName}>{HOUSE_NAMES[moonHouse]}</Text>
                    </View>
                    <Text style={S.arenaTheme}>{HOUSE_THEMES[moonHouse]}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── Right column (5): Element/Modality card ──────────────────── */}
          <View style={S.rightCol}>
            <ElementModalityCard
              tropSigns={tropSigns}
              sidSigns={sidSigns}
              risingKnown={risingKnown}
              ayanamsha={data.ayanamsha ?? 'Lahiri'}
            />
          </View>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>31</Text>
      </View>
    </Page>
  );
}
