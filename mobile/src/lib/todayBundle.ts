import {
  requestDayNumerology, requestToday, requestTriadToday, type TodayResult,
} from '@/lib/api';
import type { DayNumerology } from '@/lib/dayNumerologyTypes';
import { getCached, setCached } from '@/lib/persistentCache';
import type { TriadToday } from '@/lib/triadTypes';

/** Everything Today shows for one live day; saved under the same name Today uses so the two share it. */
export interface TodayBundle {
  today: TodayResult;
  dayNum: DayNumerology | null;
  triad: TriadToday | null;
}

export const liveBundleKey = (leadId: number, localDate: string): string => `today|${leadId}|${localDate}|live`;

/** The saved copy of today (instant), or null. */
export async function savedLiveBundle(leadId: number, localDate: string): Promise<TodayBundle | null> {
  const saved = await getCached<TodayBundle>(liveBundleKey(leadId, localDate));
  return saved?.value ?? null;
}

/**
 * Loads today's sky, numerology and triad from the server and saves them. Throws if the sky cannot
 * load. The lead id is only here to name the saved copy — the requests themselves travel on the
 * app's session token.
 */
export async function loadLiveBundle(leadId: number, localDate: string): Promise<TodayBundle> {
  const dayNumP = requestDayNumerology(localDate).catch(() => null);
  const triadP = requestTriadToday(localDate).catch(() => null);
  const today = await requestToday();
  const [dayNum, triad] = await Promise.all([dayNumP, triadP]);
  const bundle: TodayBundle = { today, dayNum, triad };
  await setCached<TodayBundle>(liveBundleKey(leadId, localDate), { value: bundle, savedAt: Date.now() });
  return bundle;
}
