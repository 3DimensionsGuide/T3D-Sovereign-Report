import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Segmented } from '@/components/Segmented';
import { LENS_COLOR, LensIcon, LensLabel } from '@/components/Lens';
import { ReadingContents, ReadingJumpProvider, ReadingLensProvider } from '@/components/ReadingBlocks';
import { NumerologyReading } from '@/components/readings/NumerologyReading';
import { StoplightReading } from '@/components/readings/StoplightReading';
import { VehicleReading } from '@/components/readings/VehicleReading';
import { colors, fonts, space } from '@/theme/tokens';

const OPTIONS = [
  { value: 'vehicle', label: 'Vehicle', icon: <LensIcon lens="vehicle" size={13} /> },
  { value: 'road', label: 'Road', icon: <LensIcon lens="road" size={13} /> },
  { value: 'stoplight', label: 'Stoplight', icon: <LensIcon lens="stoplight" size={13} /> },
] as const;

type Lens = (typeof OPTIONS)[number]['value'];

const HEADINGS: Record<Lens, { eyebrow: string; title: string; sub: string; accent: string }> = {
  vehicle: {
    eyebrow: 'The Vehicle',
    title: 'Human Design',
    sub: 'The machinery you drive: how your energy works and how you decide.',
    accent: LENS_COLOR.vehicle,
  },
  road: {
    eyebrow: 'The Road',
    title: 'Numerology',
    sub: 'What your numbers mean, and how they work together.',
    accent: LENS_COLOR.road,
  },
  stoplight: {
    eyebrow: 'The Stoplight',
    title: 'Astrology',
    sub: 'Your sky at birth, and where you are in time.',
    accent: LENS_COLOR.stoplight,
  },
};

export default function Readings() {
  const [lens, setLens] = useState<Lens>('vehicle');
  const head = HEADINGS[lens];
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const [refresher, setRefresher] = useState<{ run: () => Promise<void> } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresher?.run(); } finally { setRefreshing(false); }
  }, [refresher]);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh} scrollRef={scrollRef} scrollOffset={scrollOffset}>
      <ReadingLensProvider value={lens}>
        <ReadingJumpProvider scrollRef={scrollRef} scrollOffset={scrollOffset}>
          <FadeIn>
            <View style={styles.header}>
              <LensLabel lens={lens}>{head.eyebrow}</LensLabel>
              <Text accessibilityRole="header" style={styles.title}>{head.title}</Text>
              <Text style={styles.sub}>{head.sub}</Text>
            </View>
          </FadeIn>
          <Segmented options={OPTIONS} value={lens} onChange={setLens} />
          <ReadingContents />
          {lens === 'vehicle' ? (
            <VehicleReading onRefreshReady={setRefresher} />
          ) : lens === 'road' ? (
            <NumerologyReading onRefreshReady={setRefresher} />
          ) : (
            <StoplightReading onRefreshReady={setRefresher} />
          )}
        </ReadingJumpProvider>
      </ReadingLensProvider>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, paddingTop: space.lg, paddingBottom: space.sm },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 3 },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
});
