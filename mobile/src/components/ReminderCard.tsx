import { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoldButton } from '@/components/GoldButton';
import {
  disableReminder, enableReminder, formatReminderTime, setReminderTime,
} from '@/lib/reminder';
import { useReminderStore } from '@/store/useReminderStore';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** First-time card on Today: explains the reminder, then asks. Hidden once answered. */
export function ReminderPrompt() {
  const { asked, enabled, hydrated, hour, minute } = useReminderStore();
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  if (!hydrated || enabled || (asked && !blocked)) return null;

  async function turnOn() {
    setBusy(true);
    const result = await enableReminder();
    setBusy(false);
    if (result === 'blocked') setBlocked(true);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>DAILY REMINDER</Text>
      {blocked ? (
        <>
          <Text style={styles.body}>
            Notifications are turned off for T3D on this iPhone. You can allow them in Settings, then come back
            here and turn the reminder on.
          </Text>
          <GoldButton label="Open iphone settings" variant="ghost" onPress={() => void Linking.openSettings()} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Want a quiet nudge each day?</Text>
          <Text style={styles.body}>
            One notification at {formatReminderTime(hour, minute)}, saying Today{'’'}s frame is ready. It never
            says anything about your day. You can change the time or turn it off at any time on the Chart tab.
          </Text>
          <GoldButton label="Turn on daily reminder" onPress={() => void turnOn()} loading={busy} />
          <GoldButton
            label="NOT NOW"
            variant="ghost"
            onPress={() => useReminderStore.getState().set({ asked: true })}
          />
        </>
      )}
    </View>
  );
}

/** Settings card: a switch and a time. Lives on the Chart tab. */
export function ReminderCard() {
  const { enabled, hour, minute, hydrated } = useReminderStore();
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!hydrated) return null;

  async function toggle(next: boolean) {
    setBusy(true);
    if (next) {
      const result = await enableReminder();
      setBlocked(result === 'blocked');
    } else {
      setBlocked(false);
      await disableReminder();
    }
    setBusy(false);
  }

  const pickerValue = new Date(2000, 0, 1, hour, minute, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>DAILY REMINDER</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Remind me when Today{'’'}s frame is ready</Text>
        <Switch
          value={enabled}
          disabled={busy}
          onValueChange={(v) => void toggle(v)}
          trackColor={{ false: '#6B6B73', true: colors.gold }} ios_backgroundColor="#6B6B73"
          accessibilityLabel="Daily reminder"
        />
      </View>
      {enabled ? (
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display="compact"
            themeVariant="dark"
            onValueChange={(_event: unknown, value: Date) =>
              void setReminderTime(value.getHours(), value.getMinutes())
            }
            accessibilityLabel="Reminder time"
          />
        </View>
      ) : null}
      {blocked ? (
        <>
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            Notifications are turned off for T3D on this iPhone. Allow them in Settings to use the reminder.
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
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.gold },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.parchment },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.parchmentMuted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, minHeight: 48 },
  label: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.parchment },
});
