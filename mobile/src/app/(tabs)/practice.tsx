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
  { value: 'decide', label: 'DECIDE' },
  { value: 'together', label: 'TOGETHER' },
  { value: 'log', label: 'LOG' },
  { value: 'week', label: '7 DAYS' },
] as const;

export default function Practice() {
  const profile = useT3DStore((s) => s.profile);
  const chart = useT3DStore((s) => s.chart);
  const { data, error, loading, retry } = usePractice(chart?.leadId, profile?.email.trim());
  const [mode, setMode] = useState<Mode>('decide');

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>PRACTICE</Text>
        <Text accessibilityRole="header" style={styles.title}>Decide through your design</Text>
        <Text style={styles.sub}>
          Check a choice against your Authority, decide with someone else, keep a log of how it went, and run a seven-day
          experiment. Everything you write stays on this phone.
        </Text>
      </View>
      <Segmented options={OPTIONS} value={mode} onChange={setMode} />
      {mode === 'together' ? <Together /> : null}
      {mode !== 'together' ? (
      <ReadingStatus loading={loading} error={error} hasData={!!data} loadingText="Loading your practice…" onRetry={retry}>
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
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2.4, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35, color: colors.parchment },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.parchmentMuted },
});
