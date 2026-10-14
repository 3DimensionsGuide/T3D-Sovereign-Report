import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Intent } from '@/lib/intent';

/** What the person said brought them to the app. Saved on this phone only. */
interface IntentState {
  intent: Intent | null;
  setIntent: (intent: Intent | null) => void;
  clear: () => void;
}

export const useIntentStore = create<IntentState>()(
  persist(
    (set) => ({
      intent: null,
      setIntent: (intent) => set({ intent }),
      clear: () => set({ intent: null }),
    }),
    { name: 't3d-intent-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
