import { requestTimeline } from '@/lib/api';
import type { TimelineResult } from '@/lib/timelineTypes';
import { localDateString } from '@/lib/localDate';
import { FOREVER, useCachedLoad } from '@/lib/useCachedLoad';
import { useLocalDate } from '@/lib/useLocalDate';

export { localDateString };

/**
 * Bump when the server adds something to the timeline, so a copy saved before that is not reused for the rest of the day.
 * v2: the Sun's gate(s) today for the Vehicle lens.
 */
const CACHE_VERSION = 2;

/** The next stretch of days. One copy per chart per day, kept on the phone, and it moves to the new day by itself. */
export function useTimeline(leadId: number | undefined, email: string | undefined, days = 60) {
  const day = useLocalDate();
  return useCachedLoad<TimelineResult>({
    key: leadId && email ? `timeline|v${CACHE_VERSION}|${leadId}|${day}|${days}` : null,
    fetcher: () =>
      requestTimeline(leadId as number, email as string, {
        localDate: localDateString(),
        tzOffsetMinutes: new Date().getTimezoneOffset(),
        days,
      }),
    maxAgeMs: FOREVER,
  });
}
