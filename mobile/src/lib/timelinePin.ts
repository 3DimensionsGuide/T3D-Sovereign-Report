/**
 * Which month the Timeline's pinned bar should name, and when to offer "Jump to today".
 * Positions are in scroll coordinates (distance from the top of the scrolling page). Pure, no imports.
 */
export interface PinSection {
  key: string;
  /** Top of the month's block, header included. */
  top: number;
  /** Height of the month's own header row. */
  headHeight: number;
  /** Bottom of the month's block. */
  bottom: number;
}

/** The pinned bar hides this far before a block ends, so the next month's header takes over cleanly. */
export const PIN_TAIL = 64;
/** How far past the start of the list you scroll before "Jump to today" shows. */
export const JUMP_AFTER = 700;

/** The month whose header has scrolled out of view and whose days are still on screen, or null. */
export function pinnedMonthAt(sections: readonly PinSection[], y: number): string | null {
  for (const s of sections) {
    if (y >= s.top + s.headHeight - 4 && y < s.bottom - PIN_TAIL) return s.key;
  }
  return null;
}

export function showJumpToday(y: number, listTop: number | null): boolean {
  return listTop !== null && y > listTop + JUMP_AFTER;
}
