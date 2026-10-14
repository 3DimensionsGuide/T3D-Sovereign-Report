import { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { GoldButton } from '@/components/GoldButton';
import { toast } from '@/lib/toast';
import { setAlertOn } from '@/lib/reminder';
import type { AlertKind } from '@/lib/personalAlerts';
import { useReminderStore } from '@/store/useReminderStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

const ROWS: { kind: AlertKind; label: string; detail: string }[] = [
  { kind: 'gate', label: 'The Sun changes gate', detail: 'About every six days. Your gate for the stretch ahead.' },
  { kind: 'moonChannel', label: 'The Moon completes a channel of yours', detail: 'When the Moon fills in the missing half of one of your channels.' },
  { kind: 'moonSign', label: 'The Moon changes sign', detail: 'Every two to three days.' },
];

/**
 * Sky heads-ups, all free and all off until chosen. They are set up on the phone from your own Timeline,
 * state only what the sky is doing, and stay quiet from 10 at night to 7 in the morning.
 */
export function HeadsUpCard() {
  const { alerts, hydrated } = useReminderStore();
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!hydrated) return null;

  async function toggle(kind: AlertKind, next: boolean) {
    setBusy(true);
    const result = await setAlertOn(kind, next);
    setBlocked(result === 'blocked');
    if (result === 'on') toast.success('Heads-up is on');
    if (result === 'off') toast.success('Heads-up is off');
    setBusy(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>SKY HEADS-UPS</Text>
      <Text style={styles.body}>
        A quiet note when something in your own timing changes. Each one says what the sky is doing and nothing
        about your day. Nothing comes between 10 at night and 7 in the morning.
      </Text>
      {ROWS.map((r) => (
        <View key={r.kind} style={styles.row}>
          <View style={styles.text}>
            <Text style={styles.label}>{r.label}</Text>
            <Text style={styles.detail}>{r.detail}</Text>
          </View>
          <Switch
            value={alerts[r.kind]}
            disabled={busy}
            onValueChange={(v) => void toggle(r.kind, v)}
            trackColor={{ false: colors.switchOff, true: colors.gold }} ios_backgroundColor="#6B6B73"
            accessibilityLabel={r.label}
          />
        </View>
      ))}
      {blocked ? (
        <>
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            Notifications are turned off for T3D on this iPhone. Allow them in Settings to use heads-ups.
          </Text>
          <GoldButton label="Open iphone settings" variant="ghost" onPress={() => void Linking.openSettings()} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.charcoal, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.hairline, padding: space.lg, gap: space.md,
  },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.parchmentMuted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, minHeight: 56 },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
  detail: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.parchmentMuted },
});
