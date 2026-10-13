import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { Pressable } from '@/components/Pressable';
import { TermPressable } from '@/components/Explain';
import { useReduceMotion } from '@/lib/motion';
import { triadMapGroups, type MapChart, type MapLens } from '@/lib/triadMap';
import { colors, fonts, radius, TOUCH } from '@/theme/tokens';

const LENS_COLOR: Record<MapLens, string> = { vehicle: colors.vehicle, road: colors.road, stoplight: colors.stoplight };

function Mark({ lens, size }: { lens: MapLens; size: number }) {
  const c = LENS_COLOR[lens];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lens === 'vehicle' ? <Polygon points="50,6 94,50 50,94 6,50" fill={c} /> : null}
      {lens === 'road' ? <Polygon points="50,8 94,90 6,90" fill={c} /> : null}
      {lens === 'stoplight' ? <Circle cx="50" cy="50" r="44" fill={c} /> : null}
    </Svg>
  );
}

interface Props {
  chart: MapChart;
  birthTimeKnown: boolean;
  /** Opens the full reading for a lens. */
  onOpenLens: (lens: MapLens) => void;
}

const HUB = 52;
const FACT_H = TOUCH;
const GAP = 8;

/**
 * A map of the whole chart: T3D at the top, the three lenses below it, and each lens's headline facts branching off.
 * Tap a lens to open its reading, or any fact to learn what it means. Each lens branches in turn, unless Reduce Motion is on.
 */
export function TriadMap({ chart, birthTimeKnown, onOpenLens }: Props) {
  const groups = triadMapGroups(chart, birthTimeKnown);
  const reduce = useReduceMotion();
  return (
    <View style={styles.wrap}>
      <View style={styles.centre} accessible accessibilityLabel="Your chart, in three lenses">
        <Text style={styles.centreText}>T3D</Text>
      </View>
      {groups.map((g, gi) => {
        const accent = LENS_COLOR[g.lens];
        const n = g.facts.length;
        const bandH = n * FACT_H + (n - 1) * GAP;
        const centreY = bandH / 2;
        // The vertical bus joins the first and last fact; it starts and ends at their middles.
        const busTop = FACT_H / 2;
        const busH = bandH - FACT_H;
        // The line up to the circle above: the gap, plus the empty space either side of each circle.
        const prevBandH = gi === 0 ? HUB : groups[gi - 1].facts.length * FACT_H + (groups[gi - 1].facts.length - 1) * GAP;
        const above = 22 + (prevBandH - HUB) / 2;
        return (
          <Animated.View
            key={g.lens}
            entering={reduce ? undefined : FadeIn.delay(250 + gi * 450).duration(600)}
            style={styles.band}
          >
            <View style={[styles.spine, { backgroundColor: accent, top: -above, height: above + (bandH - HUB) / 2 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <View style={{ width: HUB, height: bandH, justifyContent: 'center' }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${g.name}, ${g.system}. Opens your reading`}
                onPress={() => onOpenLens(g.lens)}
                style={[styles.hub, { borderColor: accent }]}
              >
                <Mark lens={g.lens} size={22} />
              </Pressable>
            </View>
            <View style={{ width: 34, height: bandH }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={[styles.hline, { backgroundColor: accent, top: centreY - 1, left: 0, width: 17 }]} />
              {n > 1 ? <View style={[styles.vline, { backgroundColor: accent, left: 16, top: busTop, height: busH }]} /> : null}
              {g.facts.map((_, i) => (
                <View key={i} style={[styles.hline, { backgroundColor: accent, top: i * (FACT_H + GAP) + FACT_H / 2 - 1, left: 16, width: 18 }]} />
              ))}
            </View>
            <View style={{ flex: 1, gap: GAP }}>
              {g.facts.map((f) => (
                <TermPressable
                  key={f.label}
                  id={f.termId}
                  label={`${f.label}: ${f.value}`}
                  style={[styles.fact, { borderLeftColor: accent }]}
                >
                  <Text style={styles.factLabel}>{f.label}</Text>
                  <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{f.value}</Text>
                </TermPressable>
              ))}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', gap: 22 },
  centre: {
    width: HUB, height: HUB, borderRadius: HUB / 2, borderWidth: 1.5, borderColor: colors.gold,
    backgroundColor: colors.amethyst, alignItems: 'center', justifyContent: 'center',
  },
  centreText: { fontFamily: fonts.display, fontSize: 15, color: colors.gold },
  band: { flexDirection: 'row', alignItems: 'center' },
  spine: { position: 'absolute', left: HUB / 2 - 1, width: 2, opacity: 0.8 },
  hub: {
    width: HUB, height: HUB, borderRadius: HUB / 2, borderWidth: 2, backgroundColor: colors.obsidian,
    alignItems: 'center', justifyContent: 'center',
  },
  hline: { position: 'absolute', height: 2, opacity: 0.85 },
  vline: { position: 'absolute', width: 2, opacity: 0.85 },
  fact: {
    minHeight: FACT_H, justifyContent: 'center', paddingVertical: 4, paddingHorizontal: 12,
    backgroundColor: colors.charcoal, borderRadius: radius.md, borderLeftWidth: 4,
  },
  factLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.6, color: colors.parchmentMuted, textTransform: 'uppercase' },
  factValue: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.parchment },
});
