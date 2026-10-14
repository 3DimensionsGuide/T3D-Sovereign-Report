import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** What the person has opened in the first week. Saved on this phone only; nothing here is sent anywhere. */
interface JourneyState {
  startedOn: string | null;
  visited: Record<string, true>;
  dismissed: boolean;
  start: (day: string) => void;
  markVisited: (tab: string) => void;
  dismiss: () => void;
  clearAll: () => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      startedOn: null,
      visited: {},
      dismissed: false,
      start: (day) => { if (!get().startedOn) set({ startedOn: day }); },
      markVisited: (tab) => { if (!get().visited[tab]) set({ visited: { ...get().visited, [tab]: true } }); },
      dismiss: () => set({ dismissed: true }),
      clearAll: () => set({ startedOn: null, visited: {}, dismissed: false }),
    }),
    { name: 't3d-journey-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
