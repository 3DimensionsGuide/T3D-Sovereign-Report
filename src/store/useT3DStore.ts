'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CalculationResults {
  leadId: number;
  astrology:   Record<string, unknown>;
  numerology:  Record<string, unknown>;
  humanDesign: Record<string, unknown>;
}

interface T3DStore {
  currentStep:      number;
  isCalculating:    boolean;
  calculationError: string | null;
  results:          CalculationResults | null;

  setCurrentStep:   (step: number) => void;
  setIsCalculating: (v: boolean) => void;
  setError:         (msg: string | null) => void;
  setResults:       (results: CalculationResults) => void;
  reset:            () => void;
}

const initial = {
  currentStep: 1, isCalculating: false,
  calculationError: null, results: null,
};

export const useT3DStore = create<T3DStore>()(
  devtools(
    (set) => ({
      ...initial,
      setCurrentStep:   (step)    => set({ currentStep: step }),
      setIsCalculating: (v)       => set({ isCalculating: v }),
      setError:         (msg)     => set({ calculationError: msg }),
      setResults:       (results) => set({ results, currentStep: 4 }),
      reset:            ()        => set(initial),
    }),
    { name: 'T3DStore' },
  ),
);
