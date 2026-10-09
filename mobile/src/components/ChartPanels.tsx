import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Term, TermPressable } from '@/components/Explain';
import { aspectId, centerId, channelId, gateId, natalId } from '@/lib/termIds';
import { buildBodygraphScene } from '@/charts/bodygraph';
import { chartColors } from '@/charts/palette';
import type { BodygraphData, WheelChart } from '@/charts/chartTypes';
import { ASPECT_NAMES, BODY_GLYPHS, BODY_NAMES, buildWheelScene } from '@/charts/wheel';
import { Segmented } from '@/components/Segmented';
import { SceneView } from '@/components/SceneView';
import { colors, fonts, radius, space } from '@/theme/tokens';

// ───────────────────────── shared bits ─────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function KeyItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={styles.keyItem}>
      {swatch}
      <Text style={styles.keyText}>{label}</Text>
    </View>
  );
}

function Dot({ fill, ring }: { fill: string; ring?: string }) {
  return <View style={[styles.dot, { backgroundColor: fill, borderColor: ring ?? colors.obsidian }]} />;
}

function Dash({ color, dashed }: { color: string; dashed?: boolean }) {
  return <View style={[styles.dash, { borderColor: color, borderStyle: dashed ? 'dotted' : 'solid' }]} />;
}

// ───────────────────────── natal wheel ─────────────────────────

const ZODIAC_OPTIONS = [
  { value: 'tropical', label: 'TROPICAL' },
  { value: 'sidereal', label: 'SIDEREAL' },
] as const;

export function WheelPanel({ tropical, sidereal }: { tropical: WheelChart; sidereal: WheelChart }) {
  const [zodiac, setZodiac] = useState<'tropical' | 'sidereal'>('tropical');
  const chart = zodiac === 'tropical' ? tropical : sidereal;
  const scene = useMemo(() => buildWheelScene(chart), [chart]);
  const sun = chart.planets.find((p) => p.body === 'sun');
  const moon = chart.planets.find((p) => p.body === 'moon');
  const label =
    `Natal wheel, ${zodiac} zodiac. ` +
    `Sun in ${sun?.formatted ?? 'unknown'}, Moon in ${moon?.formatted ?? 'unknown'}.`;

  return (
    <View style={styles.panel}>
      <Segmented options={ZODIAC_OPTIONS} value={zodiac} onChange={setZodiac} compact />
      <View style={styles.figure}>
        <SceneView scene={scene} label={label} />
      </View>

      <View style={styles.keyRow}>
        <KeyItem swatch={<Dash color={chartColors.flow} />} label="Trine (flow)" />
        <KeyItem swatch={<Dash color={chartColors.flow} dashed />} label="Sextile (flow)" />
        <KeyItem swatch={<Dash color={chartColors.friction} />} label="Square (friction)" />
        <KeyItem swatch={<Dash color={chartColors.friction} dashed />} label="Opposition (friction)" />
        <KeyItem swatch={<Dash color={chartColors.conjunction} />} label="Conjunction" />
      </View>
      <Text style={styles.note}>
        Whole-sign houses, counted from your rising sign. Thicker lines are within 1° of exact.
      </Text>

      <Section title="PLANETS & POINTS">
        {chart.planets.map((p) => (
          <TermPressable key={p.body} id={natalId(p.body)} style={styles.row} label={
            `${BODY_NAMES[p.body]} in ${p.formatted}, house ${p.house}${p.retrograde ? ', retrograde' : ''}`}>
            <Text style={styles.glyph}>{BODY_GLYPHS[p.body]}</Text>
            <Text style={styles.rowName}>{BODY_NAMES[p.body]}</Text>
            <Text style={styles.rowValue}>
              {p.formatted}{p.retrograde ? ' ℞' : ''} · House {p.house}
            </Text>
          </TermPressable>
        ))}
      </Section>

      <Section title="ASPECTS">
        {chart.aspects.length === 0 ? (
          <Text style={styles.note}>No major aspects within 3°.</Text>
        ) : (
          chart.aspects.map((a, i) => (
            <TermPressable key={`${a.a}-${a.b}-${i}`} id={aspectId(a.aspect)} style={styles.row}>
              <Text style={styles.aspectText}>
                {pointName(a.a)} · {ASPECT_NAMES[a.aspect]} · {pointName(a.b)}
              </Text>
              <Text style={styles.rowValue}>{a.orb.toFixed(1)}°{a.peak ? ' · exact' : ''}</Text>
            </TermPressable>
          ))
        )}
      </Section>
    </View>
  );
}

function pointName(p: string): string {
  if (p === 'ascendant') return 'Rising';
  if (p === 'midheaven') return 'Midheaven';
  return BODY_NAMES[p as keyof typeof BODY_NAMES] ?? p;
}

// ───────────────────────── bodygraph ─────────────────────────

const CENTER_NAMES: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'G Center', heart: 'Heart',
  solar_plexus: 'Solar Plexus', sacral: 'Sacral', spleen: 'Spleen', root: 'Root',
};

const EPOCH_LABEL = { personality: 'Personality', design: 'Design', both: 'Personality + Design' } as const;

export function BodygraphPanel({ hd }: { hd: BodygraphData }) {
  const scene = useMemo(() => buildBodygraphScene(hd), [hd]);
  const label =
    `Human Design bodygraph. ${hd.type}, ${hd.authority} authority, profile ${hd.profile}. ` +
    `Defined centers: ${hd.definedCenters.map((c) => CENTER_NAMES[c] ?? c).join(', ') || 'none'}.`;

  const byEpoch = (epoch: 'personality' | 'design') =>
    hd.gates.filter((g) => g.epoch === epoch);

  return (
    <View style={styles.panel}>
      <View style={styles.headline}>
        <Text style={styles.headType}>{hd.type}</Text>
        <Text style={styles.headMeta}>{hd.authority} authority · Profile {hd.profile}</Text>
      </View>

      <View style={styles.figure}>
        <SceneView scene={scene} label={label} />
      </View>

      <View style={styles.keyRow}>
        <KeyItem swatch={<Dot fill={chartColors.personality} />} label="Personality (conscious)" />
        <KeyItem swatch={<Dot fill={chartColors.design} />} label="Design (unconscious)" />
        <KeyItem swatch={<Dot fill={chartColors.personality} ring={chartColors.design} />} label="Both" />
        <KeyItem swatch={<Dash color={chartColors.personality} dashed />} label="Hanging gate" />
        <KeyItem swatch={<Dot fill={chartColors.vehicle} ring={chartColors.vehicle} />} label="Defined center" />
        <KeyItem swatch={<Dot fill={colors.charcoal} ring={colors.parchment} />} label="Open center" />
      </View>

      <Section title="CENTERS">
        <Text style={styles.paragraph}>
          <Text style={styles.strong}>Defined: </Text>
          {hd.definedCenters.length ? hd.definedCenters.map((c, i) => (
            <Text key={c}>{i > 0 ? ', ' : ''}<Term id={centerId(c)}>{CENTER_NAMES[c] ?? c}</Term></Text>
          )) : 'None'}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.strong}>Open: </Text>
          {hd.undefinedCenters.length ? hd.undefinedCenters.map((c, i) => (
            <Text key={c}>{i > 0 ? ', ' : ''}<Term id={centerId(c)}>{CENTER_NAMES[c] ?? c}</Term></Text>
          )) : 'None'}
        </Text>
      </Section>

      <Section title={`CHANNELS (${hd.channels.length})`}>
        {hd.channels.length === 0 ? (
          <Text style={styles.note}>No complete channels. All gates are hanging.</Text>
        ) : (
          hd.channels.map((ch) => (
            <TermPressable key={ch.gates.join('-')} id={channelId(Math.min(...ch.gates), Math.max(...ch.gates))} style={styles.row}>
              <Text style={styles.rowName}>{ch.gates[0]}–{ch.gates[1]}  {ch.name}</Text>
              <Text style={styles.rowValue}>{EPOCH_LABEL[ch.activatedBy]}</Text>
            </TermPressable>
          ))
        )}
      </Section>

      <Section title="PERSONALITY GATES (CONSCIOUS)">
        <GateList gates={byEpoch('personality')} />
      </Section>
      <Section title="DESIGN GATES (UNCONSCIOUS)">
        <GateList gates={byEpoch('design')} />
      </Section>
    </View>
  );
}

const PLANET_LABEL: Record<string, string> = {
  sun: 'Sun', earth: 'Earth', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', southNode: 'South Node',
};

function GateList({ gates }: { gates: BodygraphData['gates'] }) {
  return (
    <View style={styles.gateWrap}>
      {gates.map((g, i) => (
        <TermPressable key={`${g.planet}-${i}`} id={gateId(g.gate)} style={styles.gateChip}
          label={`${PLANET_LABEL[g.planet] ?? g.planet}, gate ${g.gate} line ${g.line}`}>
          <Text style={styles.gateChipText}>
            {PLANET_LABEL[g.planet] ?? g.planet} <Text style={styles.gateNum}>{g.gate}.{g.line}</Text>
          </Text>
        </TermPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: space.md },
  figure: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.obsidian,
  },
  keyRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.sm },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchmentMuted },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  dash: { width: 22, height: 0, borderTopWidth: 3, borderRadius: 2 },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.parchmentMuted },
  headline: { gap: 2 },
  headType: { fontFamily: fonts.display, fontSize: 26, color: colors.parchment },
  headMeta: { fontFamily: fonts.body, fontSize: 15, color: colors.parchmentMuted },
  section: { gap: space.sm, marginTop: space.sm },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4, color: colors.gold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 40,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  glyph: { width: 26, fontSize: 18, color: colors.parchment, textAlign: 'center' },
  rowName: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  rowValue: { marginLeft: 'auto', fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted, textAlign: 'right', flexShrink: 1 },
  aspectText: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.parchment },
  paragraph: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchment },
  strong: { fontFamily: fonts.bodyBold, color: colors.parchment },
  gateWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.amethyst,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  gateChipText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted },
  gateNum: { fontFamily: fonts.bodyBold, color: colors.parchment },
});
