import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TermPressable, useExplain } from '@/components/Explain';
import { LENS_TEXT, LensIcon, SIGNAL_LABEL, SignalMarker, type LensName, type SignalKind } from '@/components/Lens';
import { aspectId, centerId, channelId, gateId, natalId } from '@/lib/termIds';
import { buildBodygraphScene } from '@/charts/bodygraph';
import { chartColors } from '@/charts/palette';
import type { BodygraphData, WheelAspect, WheelBody, WheelChart } from '@/charts/chartTypes';
import { ASPECT_NAMES, BODY_GLYPHS, BODY_NAMES, buildWheelScene } from '@/charts/wheel';
import { Segmented } from '@/components/Segmented';
import { SceneView } from '@/components/SceneView';
import { colors, fonts, radius, space } from '@/theme/tokens';

// ───────────────────────── shared bits ─────────────────────────

function Section({ title, lens, children }: { title: string; lens: LensName; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <LensIcon lens={lens} size={13} />
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: LENS_TEXT[lens] }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const ASPECT_SIGNAL: Record<WheelAspect, SignalKind> = {
  trine: 'flow', sextile: 'flow', square: 'friction', opposition: 'friction', conjunction: 'neutral',
};

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
  { value: 'tropical', label: 'Tropical' },
  { value: 'sidereal', label: 'Sidereal' },
] as const;

export function WheelPanel({ tropical, sidereal }: { tropical: WheelChart; sidereal: WheelChart }) {
  const [zodiac, setZodiac] = useState<'tropical' | 'sidereal'>('tropical');
  const chart = zodiac === 'tropical' ? tropical : sidereal;
  const scene = useMemo(() => buildWheelScene(chart), [chart]);
  const { open } = useExplain();
  const [figureWidth, setFigureWidth] = useState(0);
  const scale = figureWidth / scene.w;
  const sun = chart.planets.find((p) => p.body === 'sun');
  const moon = chart.planets.find((p) => p.body === 'moon');
  const label =
    `Natal wheel, ${zodiac} zodiac. ` +
    `Sun in ${sun?.formatted ?? 'unknown'}, Moon in ${moon?.formatted ?? 'unknown'}.`;

  return (
    <View style={styles.panel}>
      <Segmented options={ZODIAC_OPTIONS} value={zodiac} onChange={setZodiac} compact />
      <View style={styles.figure} onLayout={(e) => setFigureWidth(e.nativeEvent.layout.width)}>
        <SceneView scene={scene} label={label} />
        {scale > 0 ? scene.hotspots?.map((h) => (
          <Pressable
            key={h.key}
            accessibilityElementsHidden
            importantForAccessibility="no"
            onPress={() => open(natalId(h.key as WheelBody))}
            style={[styles.hotspot, { left: h.x * scale - 22, top: h.y * scale - 22 }]}
          />
        )) : null}
      </View>
      <Text style={styles.note}>Tap any planet on the wheel to learn what it means in your chart.</Text>

      <View style={styles.keyRow}>
        <KeyItem swatch={<><Dash color={chartColors.flow} /><SignalMarker kind="flow" size={14} /></>} label="Trine · flow" />
        <KeyItem swatch={<><Dash color={chartColors.flow} dashed /><SignalMarker kind="flow" size={14} /></>} label="Sextile · flow" />
        <KeyItem swatch={<><Dash color={chartColors.friction} /><SignalMarker kind="friction" size={14} /></>} label="Square · friction" />
        <KeyItem swatch={<><Dash color={chartColors.friction} dashed /><SignalMarker kind="friction" size={14} /></>} label="Opposition · friction" />
        <KeyItem swatch={<><Dash color={chartColors.conjunction} /><SignalMarker kind="neutral" size={14} /></>} label="Conjunction · neutral" />
      </View>
      <Text style={styles.note}>
        Whole-sign houses, counted from your rising sign. Thicker lines are within 1° of exact.
      </Text>

      <Section title="Planets and points" lens="stoplight">
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

      <Section title="Aspects" lens="stoplight">
        {chart.aspects.length === 0 ? (
          <Text style={styles.note}>No major aspects within 3°.</Text>
        ) : (
          chart.aspects.map((a, i) => (
            <TermPressable key={`${a.a}-${a.b}-${i}`} id={aspectId(a.aspect)} style={styles.row}
              label={`${pointName(a.a)} ${ASPECT_NAMES[a.aspect]} ${pointName(a.b)}. ${SIGNAL_LABEL[ASPECT_SIGNAL[a.aspect]]}. ${a.orb.toFixed(1)} degrees${a.peak ? ', exact' : ''}`}>
              <SignalMarker kind={ASPECT_SIGNAL[a.aspect]} size={15} />
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
        <SceneView scene={scene} label={label} reveal />
      </View>

      <View style={styles.keyRow}>
        <KeyItem swatch={<Dot fill={chartColors.personality} />} label="Personality (conscious)" />
        <KeyItem swatch={<Dot fill={chartColors.design} />} label="Design (unconscious)" />
        <KeyItem swatch={<Dot fill={chartColors.personality} ring={chartColors.design} />} label="Both" />
        <KeyItem swatch={<Dash color={chartColors.personality} dashed />} label="Hanging gate" />
        <KeyItem swatch={<Dot fill={chartColors.vehicle} ring={chartColors.vehicle} />} label="Defined center" />
        <KeyItem swatch={<Dot fill={colors.charcoal} ring={colors.parchment} />} label="Open center" />
      </View>

      <Section title={`Defined centers (${hd.definedCenters.length})`} lens="vehicle">
        <CenterChips ids={hd.definedCenters} defined />
      </Section>
      <Section title={`Open centers (${hd.undefinedCenters.length})`} lens="vehicle">
        <CenterChips ids={hd.undefinedCenters} defined={false} />
      </Section>

      <Section title={`Channels (${hd.channels.length})`} lens="vehicle">
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

      <Section title="Gates" lens="vehicle">
        <View style={styles.twoCol}>
          <GateColumn title="Personality" sub="conscious" swatch={<Dot fill={chartColors.personality} />} gates={byEpoch('personality')} />
          <GateColumn title="Design" sub="unconscious" swatch={<Dot fill={chartColors.design} />} gates={byEpoch('design')} />
        </View>
      </Section>
    </View>
  );
}

const PLANET_LABEL: Record<string, string> = {
  sun: 'Sun', earth: 'Earth', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', southNode: 'South Node',
};

function GateColumn({ title, sub, swatch, gates }: { title: string; sub: string; swatch: React.ReactNode; gates: BodygraphData['gates'] }) {
  return (
    <View style={styles.gateCol}>
      <View style={styles.gateColHead}>
        {swatch}
        <View>
          <Text style={styles.gateColTitle}>{title}</Text>
          <Text style={styles.gateColSub}>{sub}</Text>
        </View>
      </View>
      {gates.map((g, i) => (
        <TermPressable key={`${g.planet}-${i}`} id={gateId(g.gate)} style={styles.gateRow}
          label={`${PLANET_LABEL[g.planet] ?? g.planet}, gate ${g.gate} line ${g.line}`}>
          <Text style={styles.gatePlanet}>{PLANET_LABEL[g.planet] ?? g.planet}</Text>
          <Text style={styles.gateNum}>{g.gate}.{g.line}</Text>
        </TermPressable>
      ))}
    </View>
  );
}

function CenterChips({ ids, defined }: { ids: string[]; defined: boolean }) {
  if (!ids.length) return <Text style={styles.note}>None</Text>;
  return (
    <View style={styles.chipWrap}>
      {ids.map((c) => (
        <TermPressable key={c} id={centerId(c)} style={[styles.centerChip, defined ? styles.centerChipOn : styles.centerChipOff]}
          label={`${CENTER_NAMES[c] ?? c} center, ${defined ? 'defined' : 'open'}`}>
          <View style={[styles.centerMark, defined ? styles.centerMarkOn : styles.centerMarkOff]} />
          <Text style={styles.centerChipText}>{CENTER_NAMES[c] ?? c}</Text>
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
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  hotspot: { position: 'absolute', width: 44, height: 44, borderRadius: 22 },
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
  twoCol: { flexDirection: 'row', gap: space.md },
  gateCol: { flex: 1, gap: 2 },
  gateColHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  gateColTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.parchment },
  gateColSub: { fontFamily: fonts.body, fontSize: 12, color: colors.parchmentMuted },
  gateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  gatePlanet: { fontFamily: fonts.body, fontSize: 14, color: colors.parchmentMuted, flexShrink: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  centerChip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 1 },
  centerChipOn: { backgroundColor: 'rgba(229,169,60,0.14)', borderColor: colors.vehicle },
  centerChipOff: { backgroundColor: 'transparent', borderColor: colors.hairline, borderStyle: 'dashed' },
  centerMark: { width: 11, height: 11, borderRadius: 3, borderWidth: 1.5, borderColor: colors.vehicle },
  centerMarkOn: { backgroundColor: colors.vehicle },
  centerMarkOff: { backgroundColor: 'transparent', borderStyle: 'dashed', borderColor: colors.parchmentMuted },
  centerChipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.parchment },
  gateNum: { fontFamily: fonts.bodyBold, color: colors.parchment },
});
