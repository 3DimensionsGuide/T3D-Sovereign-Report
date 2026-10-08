import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BirthProfile, ChartResult } from '@/lib/api';

/**
 * Single source of truth for the person's birth data and calculated chart.
 * Saved on the phone so they only enter their details once.
 */
interface T3DState {
  profile: BirthProfile | null;
  chart: ChartResult | null;
  setChart: (profile: BirthProfile, chart: ChartResult) => void;
  reset: () => void;
}

export const useT3DStore = create<T3DState>()(
  persist(
    (set) => ({
      profile: null,
      chart: null,
      setChart: (profile, chart) => set({ profile, chart }),
      reset: () => set({ profile: null, chart: null }),
    }),
    {
      name: 't3d-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** True once the saved data has been loaded from the phone. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useT3DStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useT3DStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useT3DStore.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}
