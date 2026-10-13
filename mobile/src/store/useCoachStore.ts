import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Whether the person has seen the short first-time tour. Saved on the phone only, so it shows once
 * (and again only if they ask for it from the About screen).
 */
interface CoachState {
  seen: boolean;
  /** True once the saved value has been read from the phone (not saved itself). */
  hydrated: boolean;
  finish: () => void;
  replay: () => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      seen: false,
      hydrated: false,
      finish: () => set({ seen: true }),
      replay: () => set({ seen: false }),
    }),
    {
      name: 't3d-coach-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ seen: s.seen }),
      onRehydrateStorage: () => () => {
        useCoachStore.setState({ hydrated: true });
      },
    },
  ),
);
