import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { FadeIn } from '@/components/FadeIn';
import { Segmented } from '@/components/Segmented';
import { LENS_COLOR, LensIcon, LensLabel } from '@/components/Lens';
import { ReadingCardOpenProvider, ReadingContents, ReadingJumpProvider, ReadingLensProvider } from '@/components/ReadingBlocks';
import { NumerologyReading } from '@/components/readings/NumerologyReading';
import { StoplightReading } from '@/components/readings/StoplightReading';
import { StickyMiniBody } from '@/components/readings/StickyMiniBody';
import { StickyMiniRoad } from '@/components/readings/StickyMiniRoad';
import { StickyMiniWheel } from '@/components/readings/StickyMiniWheel';
import { VehicleReading } from '@/components/readings/VehicleReading';
import { nextFocus } from '@/lib/bodygraphFocus';
import { nextOpenCard } from '@/lib/pinnedBar';
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

/** How far each reading scrolls before its big drawing is out of view and the small one pins to the top. */
const PIN_AT: Record<Lens, number> = { vehicle: 560, road: 520, stoplight: 520 };

export default function Readings() {
  const [lens, setLens] = useState<Lens>('vehicle');
  // My Chart's portrait opens a lens straight away.
  const { lens: requestedLens, t: requestedAt } = useLocalSearchParams<{ lens?: string; t?: string }>();
  useEffect(() => {
    if (requestedLens === 'vehicle' || requestedLens === 'road' || requestedLens === 'stoplight') setLens(requestedLens);
  }, [requestedLens, requestedAt]);
  const head = HEADINGS[lens];
  const [pinned, setPinned] = useState(false);
  const [focusCenter, setFocusCenter] = useState<string | null>(null);
  const onFocusCenter = useCallback((id: string, open: boolean) => setFocusCenter((cur) => nextFocus(cur, id, open)), []);
  // The Road and Stoplight bars name the card opened last. It is remembered with its lens, so another lens never shows it.
  const [openCardState, setOpenCardState] = useState<{ lens: Lens; title: string | null } | null>(null);
  const openCard = openCardState && openCardState.lens === lens ? openCardState.title : null;
  const onCardOpen = useCallback(
    (title: string, open: boolean, initial = false) =>
      setOpenCardState((cur) => ({ lens, title: nextOpenCard(cur && cur.lens === lens ? cur.title : null, title, open, initial) })),
    [lens],
  );
  const onScrollY = useCallback((y: number) => { const p = y > PIN_AT[lens]; setPinned((prev) => (prev === p ? prev : p)); }, [lens]);
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const [refresher, setRefresher] = useState<{ run: () => Promise<void> } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresher?.run(); } finally { setRefreshing(false); }
  }, [refresher]);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={onRefresh}
      scrollRef={scrollRef}
      scrollOffset={scrollOffset}
      onScrollY={onScrollY}
      overlay={
        !pinned ? null
        : lens === 'vehicle' ? <StickyMiniBody focusId={focusCenter} />
        : lens === 'road' ? <StickyMiniRoad openCard={openCard} />
        : <StickyMiniWheel openCard={openCard} />
      }
    >
      <ReadingLensProvider value={lens}>
        <ReadingCardOpenProvider value={onCardOpen}>
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
            <VehicleReading onRefreshReady={setRefresher} onFocusCenter={onFocusCenter} />
          ) : lens === 'road' ? (
            <NumerologyReading onRefreshReady={setRefresher} />
          ) : (
            <StoplightReading onRefreshReady={setRefresher} />
          )}
        </ReadingJumpProvider>
        </ReadingCardOpenProvider>
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
