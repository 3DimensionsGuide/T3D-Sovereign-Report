import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Segmented } from '@/components/Segmented';
import { NumerologyReading } from '@/components/readings/NumerologyReading';
import { VehicleReading } from '@/components/readings/VehicleReading';
import { colors, fonts, space } from '@/theme/tokens';

const OPTIONS = [
  { value: 'vehicle', label: 'VEHICLE' },
  { value: 'road', label: 'ROAD' },
] as const;

type Lens = (typeof OPTIONS)[number]['value'];

const HEADINGS: Record<Lens, { eyebrow: string; title: string; sub: string; accent: string }> = {
  vehicle: {
    eyebrow: 'THE VEHICLE',
    title: 'Human Design',
    sub: 'The machinery you drive: how your energy works and how you decide.',
    accent: colors.vehicle,
  },
  road: {
    eyebrow: 'THE ROAD',
    title: 'Numerology',
    sub: 'What your numbers mean, and how they work together.',
    accent: colors.road,
  },
};

export default function Readings() {
  const [lens, setLens] = useState<Lens>('vehicle');
  const head = HEADINGS[lens];

  return (
    <Screen>
      <FadeIn>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: head.accent }]}>{head.eyebrow}</Text>
          <Text accessibilityRole="header" style={styles.title}>{head.title}</Text>
          <Text style={styles.sub}>{head.sub}</Text>
        </View>
      </FadeIn>
      <Segmented options={OPTIONS} value={lens} onChange={setLens} />
      {lens === 'vehicle' ? <VehicleReading /> : <NumerologyReading />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
});
