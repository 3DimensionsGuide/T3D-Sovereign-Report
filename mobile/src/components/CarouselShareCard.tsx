import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { Glow } from '@/components/Glow';
import { LENSES, slideContent, type CarouselChart, type Lens } from '@/lib/carouselSlides';
import { colors, fonts } from '@/theme/tokens';

/** Each slide is saved as 1080 x 1350 (4:5), the Instagram carousel shape. */
export const CAROUSEL_SLIDE = { width: 340, height: 425 } as const;

const LENS_COLOR: Record<Lens, string> = { vehicle: colors.vehicle, road: colors.road, stoplight: colors.stoplight };

function Mark({ lens, size }: { lens: Lens; size: number }) {
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
  lens: Lens;
  chart: CarouselChart;
  birthTimeKnown: boolean;
  firstName?: string | null;
  /** The Birth Number, shown on the Road slide once it has loaded. */
  birthNumber?: number | null;
}

export const CarouselShareCard = forwardRef<View, Props>(function CarouselShareCard({ lens, chart, birthTimeKnown, firstName, birthNumber }, ref) {
  const slide = slideContent(lens, chart, birthTimeKnown, birthNumber ?? null);
  const position = LENSES.indexOf(lens);
  const accent = LENS_COLOR[lens];
  return (
    <View ref={ref} collapsable={false} style={[styles.card, CAROUSEL_SLIDE]}>
      <Glow color={colors.purple} opacity={0.8} style={styles.glow} />
      <Text style={styles.brand}>{firstName ? `${firstName.toUpperCase()}'S TRIAD` : 'THE 3 DIMENSIONS'}</Text>
      <View style={styles.middle}>
        <Mark lens={lens} size={38} />
        <Text style={styles.name}>{slide.name}</Text>
        <Text style={styles.question}>{slide.question}</Text>
        <View style={[styles.rule, { backgroundColor: accent }]} />
        <View style={styles.facts}>
          {slide.facts.map((f) => (
            <View key={f.label} style={styles.fact}>
              <Text style={styles.factLabel}>{f.label}</Text>
              <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{f.value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {LENSES.map((l, i) => (
            <View key={l} style={[styles.dot, i === position ? { backgroundColor: accent, width: 22 } : null]} />
          ))}
        </View>
        <Text style={styles.url}>3dimensions.guide</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.obsidian, borderWidth: 1, borderColor: colors.gold, borderRadius: 18, overflow: 'hidden',
    justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18,
  },
  glow: { height: 420 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 3.2, color: colors.gold },
  middle: { alignItems: 'center', gap: 6, alignSelf: 'stretch' },
  name: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 28, lineHeight: 34, color: colors.parchment },
  question: { fontFamily: fonts.voice, fontSize: 17, lineHeight: 22, color: colors.parchmentMuted, textAlign: 'center' },
  rule: { width: 48, height: 2, borderRadius: 1, marginVertical: 4 },
  facts: { alignSelf: 'stretch', gap: 6 },
  fact: { alignItems: 'center' },
  factLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, color: colors.parchmentMuted, textTransform: 'uppercase' },
  factValue: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 22, lineHeight: 28, color: colors.parchment, textAlign: 'center', alignSelf: 'stretch' },
  footer: { alignItems: 'center', gap: 6, paddingTop: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.parchmentMuted, opacity: 0.9 },
  url: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.gold },
});
