import { create } from 'zustand';

export type ToastKind = 'success' | 'error';
export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastState {
  toast: Toast | null;
  show: (kind: ToastKind, text: string) => void;
  hide: (id: number) => void;
}

let next = 1;

/** The one message currently showing at the top of the screen. Not saved: it only lives while the app is open. */
export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  show: (kind, text) => set({ toast: { id: next++, kind, text } }),
  hide: (id) => {
    if (get().toast?.id === id) set({ toast: null });
  },
}));
