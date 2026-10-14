import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PartnerProfile, TribeMember, TribeRelation } from '@/lib/togetherTypes';
import { MAX_TRIBE, migratePartnerState, newMember } from '@/lib/tribe';

/** My Tribe: the people to read connections with. Kept on this phone; never saved on the server. */
interface TribeState {
  people: TribeMember[];
  /** Returns the new member's id, or null when the tribe is full. */
  addPerson: (profile: PartnerProfile, relation: TribeRelation) => string | null;
  updatePerson: (id: string, profile: PartnerProfile, relation: TribeRelation) => void;
  removePerson: (id: string) => void;
  /** Removes everyone (used when all data is deleted). */
  clearPartner: () => void;
}

export const usePartnerStore = create<TribeState>()(
  persist(
    (set, get) => ({
      people: [],
      addPerson: (profile, relation) => {
        if (get().people.length >= MAX_TRIBE) return null;
        const member = newMember(profile, relation);
        set({ people: [...get().people, member] });
        return member.id;
      },
      updatePerson: (id, profile, relation) =>
        set({ people: get().people.map((p) => (p.id === id ? { ...p, profile, relation } : p)) }),
      removePerson: (id) => set({ people: get().people.filter((p) => p.id !== id) }),
      clearPartner: () => set({ people: [] }),
    }),
    {
      name: 't3d-partner-v1',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (state) => migratePartnerState(state) as unknown as TribeState,
    },
  ),
);
