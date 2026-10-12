import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Progress through "Meet your Triad": the day it began and which stops are done.
 * `premium` is a placeholder until the subscription exists: it stays false for everyone.
 */
interface MeetTriadState {
  startedOn: string | null;
  done: number[];
  premium: boolean;
  start: (todayKey: string) => void;
  markDone: (day: number) => void;
  setPremium: (value: boolean) => void;
}

export const useMeetTriadStore = create<MeetTriadState>()(
  persist(
    (set, get) => ({
      startedOn: null,
      done: [],
      premium: false,
      start: (todayKey) => {
        if (!get().startedOn) set({ startedOn: todayKey });
      },
      markDone: (day) => set((s) => (s.done.includes(day) ? s : { done: [...s.done, day].sort((a, b) => a - b) })),
      setPremium: (premium) => set({ premium }),
    }),
    { name: 't3d-meet-triad-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** True once the saved progress has been read from the phone. */
export function useMeetTriadHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useMeetTriadStore.persist.hasHydrated());
  useEffect(() => {
    const off = useMeetTriadStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useMeetTriadStore.persist.hasHydrated());
    return off;
  }, []);
  return hydrated;
}
