import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { ReadingStatus } from '@/components/ReadingBlocks';
import { DecideFlow } from '@/components/practice/DecideFlow';
import { DecisionLog } from '@/components/practice/DecisionLog';
import { SevenDay } from '@/components/practice/SevenDay';
import { Together } from '@/components/practice/Together';
import { PremiumGate } from '@/components/PremiumGate';
import { usePractice } from '@/lib/usePractice';
import { usePremium } from '@/lib/usePremium';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space, guidance } from '@/theme/tokens';

type Mode = 'decide' | 'together' | 'log' | 'week';

/** The week comes first: it is the practice a person returns to every day. Each label says what it does. */
const OPTIONS = [
  { value: 'week', label: 'My week' },
  { value: 'decide', label: 'Decide' },
  { value: 'log', label: 'History' },
  { value: 'together', label: 'Together' },
] as const;

const EXPLAIN: Record<Mode, string> = {
  week: 'A seven-day experiment: three short check-ins a day.',
  decide: 'Run one decision through three checks: Authority, Road, Stoplight.',
  log: 'Your saved decisions, and how each one turned out.',
  together: 'Decide with one other person, using both charts.',
};

export default function Practice() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry, offline, savedAt, refresh, refreshing } = usePractice(chart?.leadId, profile?.email.trim());
  const [mode, setMode] = useState<Mode>('week');
  const premium = usePremium();

  return (
    <Screen room="ritual" refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>Practice</Text>
        <Text style={guidance}>Decide through your design. Everything you write stays on this phone.</Text>
      </View>
      {!premium ? (
        <PremiumGate title="The Practice tab" detail="Daily practices that put your Strategy and timing to work: a seven-day experiment, a three-check decision flow, your history, and deciding together." />
      ) : null}
      {premium ? <Segmented options={OPTIONS} value={mode} onChange={setMode} /> : null}
      {premium ? <Text style={styles.explain}>{EXPLAIN[mode]}</Text> : null}
      {premium && mode === 'together' ? <Together /> : null}
      {premium && mode !== 'together' ? (
      <ReadingStatus loading={loading} error={error} hasData={!!data} loadingText="Loading your practice…" onRetry={retry} offline={offline} savedAt={savedAt}>
        {data ? (
          mode === 'decide' ? (
            <DecideFlow data={data} onSaved={() => setMode('log')} />
          ) : mode === 'log' ? (
            <DecisionLog data={data} onDecide={() => setMode('decide')} />
          ) : (
            <SevenDay data={data} />
          )
        ) : null}
      </ReadingStatus>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6, paddingTop: space.sm },
  title: { fontFamily: fonts.display, fontVariant: ['lining-nums'], fontSize: 28, lineHeight: 34, color: colors.parchment },
  explain: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
});
