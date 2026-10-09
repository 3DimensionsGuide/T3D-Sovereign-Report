import { requestTriadToday } from '@/lib/api';
import type { TriadToday } from '@/lib/triadTypes';
import { localDateString } from '@/lib/localDate';
import { FOREVER, useCachedLoad } from '@/lib/useCachedLoad';
import { useLocalDate } from '@/lib/useLocalDate';

/** Today's Triad frame for the share card. One saved copy per chart per day. */
export function useTriadToday(leadId: number | undefined, email: string | undefined) {
  const day = useLocalDate();
  return useCachedLoad<TriadToday>({
    key: leadId && email ? `triad-share|${leadId}|${day}` : null,
    fetcher: () => requestTriadToday(leadId as number, email as string, localDateString()),
    maxAgeMs: FOREVER,
  });
}
