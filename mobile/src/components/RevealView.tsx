import { StyleSheet, Text, View } from 'react-native';
import { FadeIn } from '@/components/FadeIn';
import { GoldButton } from '@/components/GoldButton';
import { LENS_TEXT } from '@/components/Lens';
import { MotionLensIcon } from '@/components/LensMotion';
import { AccentView } from '@/components/AccentView';
import { TriadSeal } from '@/components/TriadSeal';
import { buildReveal, type RevealChart } from '@/lib/reveal';
import { colors, fonts, radius, space } from '@/theme/tokens';

const LENS_ACCENT = { vehicle: colors.vehicle, road: colors.road, stoplight: colors.stoplight } as const;
/** Gap between one lens landing and the next. */
const STEP_MS = 1000;

interface Props {
  chart: RevealChart;
  birthTimeKnown: boolean;
  firstName?: string | null;
  onContinue: () => void;
  onShare: () => void;
}

/**
 * Right after the chart is built: the three lenses land one at a time, each with one fact from this
 * person's own chart, and then the two choices: go to Today, or share the Triad card.
 * With Reduce Motion on, everything is simply there at once.
 */
export function RevealView({ chart, birthTimeKnown, firstName, onContinue, onShare }: Props) {
  const stages = buildReveal(chart, birthTimeKnown);
  return (
    <View style={styles.wrap}>
      <FadeIn>
        <View style={styles.head}>
          <TriadSeal size={72} />
          <Text accessibilityRole="header" style={styles.title}>
            {firstName ? `${firstName}, this is your Triad` : 'This is your Triad'}
          </Text>
        </View>
      </FadeIn>
      {stages.map((s, i) => (
        <FadeIn key={s.lens} delay={500 + i * STEP_MS}>
          <AccentView
            accessible
            accessibilityLabel={`${s.label}. ${s.hero}. ${s.line}`}
            accent={LENS_ACCENT[s.lens]}
            style={styles.card}
          >
            <View style={styles.labelRow}>
              <MotionLensIcon lens={s.lens} size={16} enter delay={500 + i * STEP_MS} />
              <Text style={[styles.label, { color: LENS_TEXT[s.lens] }]}>{s.label}</Text>
            </View>
            <Text style={styles.hero} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.7}>{s.hero}</Text>
            <Text style={styles.line}>{s.line}</Text>
          </AccentView>
        </FadeIn>
      ))}
      <FadeIn delay={500 + stages.length * STEP_MS}>
        <View style={styles.actions}>
          <GoldButton label="See my day" onPress={onContinue} />
          <GoldButton label="Share my Triad card" variant="ghost" onPress={onShare} />
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md, paddingTop: space.lg },
  head: { alignItems: 'center', gap: space.md, paddingBottom: space.sm },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, color: colors.parchment, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline,
    padding: space.lg, gap: 6,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontFamily: fonts.bodyBold, fontSize: 14 },
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  line: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  actions: { gap: space.sm, paddingTop: space.sm },
});
