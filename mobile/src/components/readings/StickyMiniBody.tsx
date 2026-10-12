import { StyleSheet, Text, View } from 'react-native';
import { MiniBody } from '@/components/MiniBody';
import { LENS_TEXT } from '@/components/Lens';
import { centerLabel } from '@/lib/bodygraphFocus';
import { useChartData } from '@/lib/useChartData';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

/**
 * A small bodygraph pinned to the top of the Vehicle reading once the full one has scrolled out of view.
 * It lights the center whose card was opened last. Decorative: the same facts are written in the reading,
 * so it is hidden from screen readers.
 */
export function StickyMiniBody({ focusId }: { focusId: string | null }) {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const hd = useChartData(chart?.leadId, profile?.email.trim()).data?.humanDesign;
  if (!hd) return null;
  const defined = focusId ? hd.definedCenters.includes(focusId) : false;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.bar}>
      <MiniBody definedCenters={hd.definedCenters} height={52} focusId={focusId} />
      <View style={styles.text}>
        <Text style={styles.type} numberOfLines={1}>{hd.type} · {hd.authority}</Text>
        <Text style={styles.line} numberOfLines={1}>
          {focusId ? `Reading: ${centerLabel(focusId)} (${defined ? 'defined' : 'open'})` : `${hd.definedCenters.length} of 9 centers defined`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: space.md, right: space.md,
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: 8, paddingHorizontal: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.hairline,
    backgroundColor: 'rgba(18,18,20,0.96)',
  },
  text: { flex: 1, gap: 2 },
  type: { fontFamily: fonts.display, fontSize: 16, color: colors.parchment },
  line: { fontFamily: fonts.bodyMedium, fontSize: 13, color: LENS_TEXT.vehicle },
});
