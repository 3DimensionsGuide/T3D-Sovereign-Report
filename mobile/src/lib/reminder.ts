import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useReminderStore } from '@/store/useReminderStore';
import { REMINDER_LINES, reminderLine } from '@/lib/reminderLines';
import { anyAlertOn, planAlerts, type AlertKind, type AlertSource } from '@/lib/personalAlerts';

/**
 * The daily "Today's frame is ready" reminder.
 * It is a local notification: the phone itself shows it at the chosen time, so no
 * server, no account and no personal data is involved. The wording changes with the weekday but
 * never makes a claim about the day: every line only says Today's frame is ready.
 */

const CHANNEL_ID = 'daily-frame';
const ALERT_CHANNEL_ID = 'sky-alerts';
const DAILY_ID = 'daily-frame';
const ALERT_PREFIX = 'alert-';

/** Cancels the daily reminder (and any older unnamed one) but leaves the heads-up alerts alone. */
async function cancelDaily(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => !n.identifier.startsWith(ALERT_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

async function cancelAlerts(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(ALERT_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
export const REMINDER_TITLE = 'T3D';
export const REMINDER_BODY = REMINDER_LINES[0]!;

/** Shows a reminder as a banner even if the app is open. Call once at startup. */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function formatReminderTime(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily frame',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function schedule(hour: number, minute: number): Promise<void> {
  await ensureChannel();
  // Clear what was there, then set one reminder for each day of the week, each with its own neutral wording.
  await cancelDaily();
  await Promise.all(
    [1, 2, 3, 4, 5, 6, 7].map((weekday) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${DAILY_ID}-${weekday}`,
        content: { title: REMINDER_TITLE, body: reminderLine(weekday) },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export type EnableResult = 'on' | 'blocked';

/** Asks permission (once) and turns the reminder on. 'blocked' means the person said no in iPhone Settings. */
export async function enableReminder(): Promise<EnableResult> {
  const store = useReminderStore.getState();
  try {
    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') {
      store.set({ enabled: false, asked: true });
      return 'blocked';
    }
    await schedule(store.hour, store.minute);
    store.set({ enabled: true, asked: true });
    return 'on';
  } catch {
    store.set({ enabled: false, asked: true });
    return 'blocked';
  }
}

export async function disableReminder(): Promise<void> {
  useReminderStore.getState().set({ enabled: false, asked: true });
  try {
    await cancelDaily();
  } catch {
    // Nothing scheduled, nothing to cancel.
  }
}

export async function setReminderTime(hour: number, minute: number): Promise<void> {
  const store = useReminderStore.getState();
  store.set({ hour, minute });
  if (store.enabled) {
    try {
      await schedule(hour, minute);
    } catch {
      // The new time is saved; it is applied the next time the app opens.
    }
  }
}

/** Clears every reminder and its settings (used by "Delete my data"). */
export async function clearReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing more to do.
  }
  useReminderStore.getState().reset();
}

/**
 * At app start: make sure the schedule matches the saved setting. If the person turned
 * notifications off in iPhone Settings, the switch is turned off to match.
 */
export async function syncReminder(): Promise<void> {
  const store = useReminderStore.getState();
  if (!store.enabled) return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      store.set({ enabled: false });
      return;
    }
    await schedule(store.hour, store.minute);
  } catch {
    // Keep the saved setting; try again next launch.
  }
}

async function ensurePermission(): Promise<boolean> {
  try {
    let status = (await Notifications.getPermissionsAsync()).status;
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Turns one heads-up category on or off. Turning one on asks permission first; 'blocked' means iPhone Settings said no. */
export async function setAlertOn(kind: AlertKind, on: boolean): Promise<'on' | 'off' | 'blocked'> {
  const store = useReminderStore.getState();
  if (on && !(await ensurePermission())) return 'blocked';
  store.set({ alerts: { ...store.alerts, [kind]: on } });
  return on ? 'on' : 'off';
}

async function ensureAlertChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
    name: 'Sky heads-ups',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Makes the phone's scheduled heads-ups match the chosen categories and the latest Timeline: clears the old
 * ones and schedules the next few (never more than the plan allows). Safe to run as often as the Timeline changes.
 */
export async function syncAlerts(source: AlertSource | null | undefined): Promise<void> {
  const { alerts } = useReminderStore.getState();
  try {
    await cancelAlerts();
    if (!anyAlertOn(alerts)) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      useReminderStore.getState().set({ alerts: { gate: false, moonChannel: false, moonSign: false } });
      return;
    }
    await ensureAlertChannel();
    for (const a of planAlerts(source, alerts, Date.now())) {
      await Notifications.scheduleNotificationAsync({
        identifier: a.id,
        content: { title: a.title, body: a.body, data: { kind: a.kind } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(a.atMs),
          channelId: ALERT_CHANNEL_ID,
        },
      });
    }
  } catch {
    // The settings are saved; the schedule is rebuilt the next time the Timeline loads.
  }
}
