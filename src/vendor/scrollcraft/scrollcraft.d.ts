/**
 * Types for the scroll-craft engine, which ships as plain JavaScript.
 * The engine file itself is vendored byte-for-byte and is never edited:
 * it is the mechanism, and the page is themed with tokens instead.
 */
export interface ScrollCraftInstance {
  destroy(): void;
  layout(): void;
}

export interface ScrollCraftGlobal {
  mount(root: Element | string | null, opts?: Record<string, unknown>): ScrollCraftInstance;
  reduce(): boolean;
  instances: ScrollCraftInstance[];
}

declare global {
  interface Window {
    ScrollCraft?: ScrollCraftGlobal;
  }
}

export {};
