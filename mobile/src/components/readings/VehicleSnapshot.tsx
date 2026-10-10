import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { buildBodygraphScene } from '@/charts/bodygraph';
import { SceneView } from '@/components/SceneView';
import { useChartData } from '@/lib/useChartData';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { LENS_TEXT } from '@/components/Lens';

/** Your bodygraph at a glance, above the long reading. */
export function VehicleSnapshot() {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const hd = useChartData(chart?.leadId, profile?.email.trim()).data?.humanDesign;
  const scene = useMemo(() => (hd ? buildBodygraphScene(hd) : null), [hd]);
  if (!hd || !scene) return null;
  const rows: [string, string][] = [
    ['Type', hd.type],
    ['Authority', hd.authority],
    ['Profile', hd.profile],
  ];
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.figure}>
        <SceneView scene={scene} label={`Your bodygraph. ${rows.map(([k, v]) => `${k}: ${v}`).join('. ')}.`} />
      </View>
      <View style={styles.facts}>
        {rows.map(([k, v]) => (
          <View key={k}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
        <Text style={styles.k}>{`${hd.definedCenters.length} of 9 centers defined`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: colors.obsidian, padding: space.md,
  },
  figure: { width: 130 },
  facts: { flex: 1, gap: space.sm },
  k: { fontFamily: fonts.body, fontSize: 13, color: LENS_TEXT.vehicle },
  v: { fontFamily: fonts.display, fontSize: 18, color: colors.parchment },
});
