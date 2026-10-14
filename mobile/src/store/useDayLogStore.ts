import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayContext, DayLog, Feeling } from '@/lib/dayLog';

/**
 * "How did today land?" answers, one per calendar day. Saved on this phone only; nothing here is sent
 * to the server, and "Delete everything" clears it.
 */
interface DayLogState {
  log: DayLog;
  setFeeling: (date: string, feeling: Feeling, ctx: DayContext) => void;
  removeDay: (date: string) => void;
  clearAll: () => void;
}

export const useDayLogStore = create<DayLogState>()(
  persist(
    (set) => ({
      log: {},
      // Changing an answer later keeps the day's original context, so the pattern stays about that day.
      setFeeling: (date, feeling, ctx) =>
        set((s) => ({ log: { ...s.log, [date]: { feeling, ctx: s.log[date]?.ctx ?? ctx } } })),
      removeDay: (date) =>
        set((s) => {
          const { [date]: _gone, ...rest } = s.log;
          return { log: rest };
        }),
      clearAll: () => set({ log: {} }),
    }),
    { name: 't3d-daylog-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
