import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PartnerProfile } from '@/lib/togetherTypes';

/** The one other person to decide with. Kept on this phone; never saved on the server. */
interface PartnerState {
  partner: PartnerProfile | null;
  setPartner: (partner: PartnerProfile) => void;
  clearPartner: () => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set) => ({
      partner: null,
      setPartner: (partner) => set({ partner }),
      clearPartner: () => set({ partner: null }),
    }),
    { name: 't3d-partner-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
