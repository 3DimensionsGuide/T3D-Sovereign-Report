import { requestNumerology } from '@/lib/api';
import type { NumerologyDetail } from '@/lib/numerologyTypes';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** A saved copy opens instantly and works with no signal; it refreshes in the background after a day. */
export function useNumerology(leadId: number | undefined, email: string | undefined) {
  const result = useCachedLoad<NumerologyDetail>({
    key: leadId && email ? `numerology|${leadId}` : null,
    fetcher: () => requestNumerology(leadId as number, email as string),
    maxAgeMs: ONE_DAY_MS,
  });
  return result;
}
