import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/components/Pressable';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { useRouter, type Href } from 'expo-router';
import { AccentView } from '@/components/AccentView';
import { LENS_TEXT, LensIcon } from '@/components/Lens';
import type { TodayResult } from '@/lib/api';
import { buildBodygraphChip } from '@/lib/bodygraphChip';
import { lensTap } from '@/lib/haptics';
import { useChartData } from '@/lib/useChartData';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

/**
 * Your bodygraph in miniature. Defined centers are filled; today's Sun and Moon gates are marked when
 * the server sends them (Sun a solid dot, Moon a ring). Everything is also written in a sentence, and
 * a tap opens the full bodygraph on My Chart.
 */
export function BodygraphChip({ today }: { today?: TodayResult | null }) {
  const router = useRouter();
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const hd = useChartData(chart?.leadId, profile?.email.trim()).data?.humanDesign;

  const chip = useMemo(
    () => (hd ? buildBodygraphChip(hd.definedCenters, today?.gates, hd.gates.map((g) => g.gate)) : null),
    [hd, today?.gates],
  );

  const glow = useRef(new Animated.Value(0)).current;
  const hasGates = !!chip?.gates.length;
  useEffect(() => {
    if (!hasGates) return;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        glow.setValue(1);
        return;
      }
      glow.setValue(0);
      Animated.timing(glow, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [hasGates, glow, today?.asOf]);

  if (!chip) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={chip.spoken}
      onPress={() => {
        lensTap('vehicle');
        router.push({ pathname: '/chart', params: { view: 'bodygraph', t: String(Date.now()) } } as unknown as Href);
      }}
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      <AccentView style={styles.card} accent={colors.vehicle}>
        <View style={styles.figure}>
          <Svg width={chip.width} height={chip.height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {chip.centers.map((c) => (
              <Polygon
                key={c.id}
                points={c.points}
                fill={c.defined ? colors.vehicle : 'none'}
                stroke={c.defined ? colors.vehicle : colors.parchmentMuted}
                strokeWidth={c.defined ? 1 : 1.2}
                strokeLinejoin="round"
              />
            ))}
          </Svg>
          {chip.gates.length ? (
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow }]} pointerEvents="none">
              <Svg width={chip.width} height={chip.height} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                {chip.gates.map((g) =>
                  g.who === 'sun' ? (
                    <Circle key={g.who} cx={g.x} cy={g.y} r={4.5} fill={colors.gold} stroke={colors.charcoal} strokeWidth={1.5} />
                  ) : (
                    <Circle key={g.who} cx={g.x} cy={g.y} r={4.5} fill={colors.charcoal} stroke={colors.parchment} strokeWidth={2} />
                  ),
                )}
              </Svg>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.text}>
          <View style={styles.head}>
            <LensIcon lens="vehicle" size={14} />
            <Text accessibilityRole="header" style={styles.title}>Your Vehicle today</Text>
          </View>
          <Text style={styles.sentence}>{chip.sentence}</Text>
          {chip.gates.length ? (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.swatch, styles.sunSwatch]} />
                <Text style={styles.legendText}>Sun</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.swatch, styles.moonSwatch]} />
                <Text style={styles.legendText}>Moon</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.swatch, styles.definedSwatch]} />
                <Text style={styles.legendText}>Defined</Text>
              </View>
            </View>
          ) : null}
          <Text style={styles.open}>Open your bodygraph</Text>
        </View>
      </AccentView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: 22, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.lg, minHeight: 48,
  },
  figure: { position: 'relative' },
  text: { flex: 1, gap: 6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.3, color: LENS_TEXT.vehicle, flexShrink: 1 },
  sentence: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.parchment },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  sunSwatch: { backgroundColor: colors.gold },
  moonSwatch: { borderWidth: 2, borderColor: colors.parchment },
  definedSwatch: { backgroundColor: colors.vehicle, borderRadius: 2 },
  open: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, minHeight: 20 },
});
