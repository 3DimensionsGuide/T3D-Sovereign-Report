import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The daily reminder settings. Saved on the phone only.
 * `asked` is true once the person has answered the "turn on reminders?" card, so it is never shown twice.
 */
export const DEFAULT_REMINDER_HOUR = 8;
export const DEFAULT_REMINDER_MINUTE = 0;

interface ReminderState {
  enabled: boolean;
  hour: number;
  minute: number;
  asked: boolean;
  /** True once the saved settings have been read from the phone (not saved itself). */
  hydrated: boolean;
  set: (patch: Partial<Pick<ReminderState, 'enabled' | 'hour' | 'minute' | 'asked'>>) => void;
  reset: () => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      enabled: false,
      hour: DEFAULT_REMINDER_HOUR,
      minute: DEFAULT_REMINDER_MINUTE,
      asked: false,
      hydrated: false,
      set: (patch) => set(patch),
      reset: () =>
        set({ enabled: false, hour: DEFAULT_REMINDER_HOUR, minute: DEFAULT_REMINDER_MINUTE, asked: false }),
    }),
    {
      name: 't3d-reminder-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ enabled: s.enabled, hour: s.hour, minute: s.minute, asked: s.asked }),
      onRehydrateStorage: () => () => {
        useReminderStore.setState({ hydrated: true });
      },
    },
  ),
);
