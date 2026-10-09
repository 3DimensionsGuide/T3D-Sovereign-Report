import { requestStoplight } from '@/lib/api';
import type { StoplightDetail } from '@/lib/stoplightTypes';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** A saved copy opens instantly and works with no signal; it refreshes in the background after a day. */
export function useStoplight(leadId: number | undefined, email: string | undefined, birthTimeKnown: boolean) {
  const result = useCachedLoad<StoplightDetail>({
    key: leadId && email ? `stoplight|${leadId}|${birthTimeKnown ? 'time' : 'notime'}` : null,
    fetcher: () => requestStoplight(leadId as number, email as string, birthTimeKnown),
    maxAgeMs: ONE_DAY_MS,
  });
  return result;
}
