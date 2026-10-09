import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useReminderStore } from '@/store/useReminderStore';

/**
 * The daily "Today's frame is ready" reminder.
 * It is a local notification: the phone itself shows it at the chosen time, so no
 * server, no account and no personal data is involved. The text is the same every
 * day and makes no claim about the day.
 */

const CHANNEL_ID = 'daily-frame';
export const REMINDER_TITLE = 'T3D';
export const REMINDER_BODY = 'Today’s frame is ready.';

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
  // One repeating reminder only: clear what was there, then set the new time.
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_TITLE, body: REMINDER_BODY },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
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
    await Notifications.cancelAllScheduledNotificationsAsync();
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
