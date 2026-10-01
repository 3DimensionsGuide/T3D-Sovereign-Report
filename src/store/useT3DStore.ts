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

  // Which product the visitor picked before running the calculator (set
  // from the pricing page's ?product= link via ProductSelectionSync).
  // null means "no explicit choice" — downstream consumers (checkout
  // link, results-page CTA) fall back to the 'sovereign-report' default,
  // same as if this field didn't exist.
  selectedProduct: string | null;

  setCurrentStep:     (step: number) => void;
  setIsCalculating:   (v: boolean) => void;
  setError:           (msg: string | null) => void;
  setResults:         (results: CalculationResults) => void;
  setSelectedProduct: (slug: string | null) => void;
  reset:              () => void;
}

const initial = {
  currentStep: 1, isCalculating: false,
  calculationError: null, results: null,
  selectedProduct: null,
};

export const useT3DStore = create<T3DStore>()(
  devtools(
    (set) => ({
      ...initial,
      setCurrentStep:     (step)    => set({ currentStep: step }),
      setIsCalculating:   (v)       => set({ isCalculating: v }),
      setError:           (msg)     => set({ calculationError: msg }),
      setResults:         (results) => set({ results, currentStep: 4 }),
      setSelectedProduct: (slug)    => set({ selectedProduct: slug }),
      reset:              ()        => set(initial),
    }),
    { name: 'T3DStore' },
  ),
);
