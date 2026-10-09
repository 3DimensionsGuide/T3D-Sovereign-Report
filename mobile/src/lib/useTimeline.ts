import { requestTimeline } from '@/lib/api';
import type { TimelineResult } from '@/lib/timelineTypes';
import { localDateString } from '@/lib/localDate';
import { FOREVER, useCachedLoad } from '@/lib/useCachedLoad';
import { useLocalDate } from '@/lib/useLocalDate';

export { localDateString };

/** The next stretch of days. One copy per chart per day, kept on the phone, and it moves to the new day by itself. */
export function useTimeline(leadId: number | undefined, email: string | undefined, days = 60) {
  const day = useLocalDate();
  return useCachedLoad<TimelineResult>({
    key: leadId && email ? `timeline|${leadId}|${day}|${days}` : null,
    fetcher: () =>
      requestTimeline(leadId as number, email as string, {
        localDate: localDateString(),
        tzOffsetMinutes: new Date().getTimezoneOffset(),
        days,
      }),
    maxAgeMs: FOREVER,
  });
}
