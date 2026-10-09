import { requestPractice } from '@/lib/api';
import type { PracticeData } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/localDate';
import { FOREVER, useCachedLoad } from '@/lib/useCachedLoad';
import { useLocalDate } from '@/lib/useLocalDate';

/** One reading per chart per day. It loads the new day by itself when the date changes. */
export function usePractice(leadId: number | undefined, email: string | undefined) {
  const day = useLocalDate();
  const { data, error, loading, retry } = useCachedLoad<PracticeData>({
    key: leadId && email ? `practice|${leadId}|${day}` : null,
    fetcher: () => requestPractice(leadId as number, email as string, localDateString()),
    maxAgeMs: FOREVER,
  });
  return { data, error, loading, retry };
}
