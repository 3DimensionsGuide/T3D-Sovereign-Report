import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { ReadingStatus } from '@/components/ReadingBlocks';
import { DecideFlow } from '@/components/practice/DecideFlow';
import { DecisionLog } from '@/components/practice/DecisionLog';
import { SevenDay } from '@/components/practice/SevenDay';
import { Together } from '@/components/practice/Together';
import { usePractice } from '@/lib/usePractice';
import { useT3DStore } from '@/store/useT3DStore';
import { colors, fonts, space } from '@/theme/tokens';

type Mode = 'decide' | 'together' | 'log' | 'week';

const OPTIONS = [
  { value: 'decide', label: 'Decide' },
  { value: 'together', label: 'Together' },
  { value: 'log', label: 'Log' },
  { value: 'week', label: '7 days' },
] as const;

export default function Practice() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry, offline, savedAt, refresh, refreshing } = usePractice(chart?.leadId, profile?.email.trim());
  const [mode, setMode] = useState<Mode>('decide');

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.title}>Practice</Text>
        <Text style={styles.sub}>Decide through your design. Everything you write stays on this phone.</Text>
      </View>
      <Segmented options={OPTIONS} value={mode} onChange={setMode} />
      {mode === 'together' ? <Together /> : null}
      {mode !== 'together' ? (
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
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
});
