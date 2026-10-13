import { requestExplain } from '@/lib/api';
import { FOREVER, useCachedLoad } from '@/lib/useCachedLoad';

/**
 * The one-line summary for a glossary term (free for everyone), saved on the phone after the first load.
 * Used where a short, accurate meaning sits beside a fact, such as the Road slide of the share carousel.
 */
export function useTermSummary(leadId: number | undefined, email: string | undefined, id: string | null, enabled = true) {
  const load = useCachedLoad<{ summary: string }>({
    key: enabled && leadId && email && id ? `term-summary|${leadId}|${id}` : null,
    fetcher: async () => {
      const entry = await requestExplain(leadId as number, email as string, id as string, false);
      return { summary: entry.summary };
    },
    maxAgeMs: FOREVER,
  });
  return { summary: load.data?.summary ?? null, loading: load.loading };
}
