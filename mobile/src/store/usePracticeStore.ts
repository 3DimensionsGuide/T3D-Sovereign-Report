import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VerdictKey } from '@/lib/practiceTypes';

/**
 * The person's own practice: the decisions they log and their seven-day
 * check-ins. Saved on the phone only; nothing here is sent to the server.
 */

export type Outcome = 'good' | 'mixed' | 'regret';
export type Followed = 'followed' | 'other';

export interface Decision {
  id: string;
  createdAt: string;
  text: string;
  vehicle: string;
  road: string;
  light: string;
  verdict: VerdictKey;
  /** YYYY-MM-DD to look at it again, for decisions that were held. */
  revisitOn: string | null;
  closed: boolean;
  followed?: Followed;
  outcome?: Outcome;
  note?: string;
}

export interface DayEntry {
  done: [boolean, boolean, boolean];
  answers: [string, string, string];
}

interface PracticeState {
  decisions: Decision[];
  startedOn: string | null;
  entries: Record<string, DayEntry>;
  review: [string, string, string];
  addDecision: (d: Omit<Decision, 'id' | 'createdAt' | 'closed'>) => void;
  closeDecision: (id: string, followed: Followed, outcome: Outcome, note: string) => void;
  removeDecision: (id: string) => void;
  startExperiment: (date: string) => void;
  restartExperiment: () => void;
  toggleCheckin: (date: string, index: 0 | 1 | 2) => void;
  setAnswer: (date: string, index: 0 | 1 | 2, text: string) => void;
  setReview: (index: 0 | 1 | 2, text: string) => void;
  clearAll: () => void;
}

const emptyEntry = (): DayEntry => ({ done: [false, false, false], answers: ['', '', ''] });

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      decisions: [],
      startedOn: null,
      entries: {},
      review: ['', '', ''],
      addDecision: (d) =>
        set((s) => ({
          decisions: [
            { ...d, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), closed: false },
            ...s.decisions,
          ],
        })),
      closeDecision: (id, followed, outcome, note) =>
        set((s) => ({
          decisions: s.decisions.map((d) => (d.id === id ? { ...d, closed: true, followed, outcome, note } : d)),
        })),
      removeDecision: (id) => set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) })),
      startExperiment: (date) => set({ startedOn: date, entries: {}, review: ['', '', ''] }),
      restartExperiment: () => set({ startedOn: null, entries: {}, review: ['', '', ''] }),
      toggleCheckin: (date, index) =>
        set((s) => {
          const entry = s.entries[date] ?? emptyEntry();
          const done: [boolean, boolean, boolean] = [...entry.done];
          done[index] = !done[index];
          return { entries: { ...s.entries, [date]: { ...entry, done } } };
        }),
      setAnswer: (date, index, text) =>
        set((s) => {
          const entry = s.entries[date] ?? emptyEntry();
          const answers: [string, string, string] = [...entry.answers];
          answers[index] = text;
          return { entries: { ...s.entries, [date]: { ...entry, answers } } };
        }),
      clearAll: () => set({ decisions: [], startedOn: null, entries: {}, review: ['', '', ''] }),
      setReview: (index, text) =>
        set((s) => {
          const review: [string, string, string] = [...s.review];
          review[index] = text;
          return { review };
        }),
    }),
    { name: 't3d-practice-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Whole days from one YYYY-MM-DD to another (local calendar days). */
export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
