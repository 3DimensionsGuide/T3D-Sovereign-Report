/** The decision log, week first: this week's decisions and any still open, then the older ones that are closed. */
export function splitRecentDecisions<T extends { createdAt: string; closed: boolean }>(
  decisions: T[],
  nowMs: number,
  days = 7,
): { recent: T[]; older: T[] } {
  const cutoff = nowMs - days * 86_400_000;
  const recent: T[] = [];
  const older: T[] = [];
  for (const d of decisions) {
    const at = new Date(d.createdAt).getTime();
    (!d.closed || !Number.isFinite(at) || at >= cutoff ? recent : older).push(d);
  }
  return { recent, older };
}
