import { useCallback, useEffect, useState } from 'react';
import { ChartRequestError, requestPractice } from '@/lib/api';
import type { PracticeData } from '@/lib/practiceTypes';
import { localDateString } from '@/lib/useTimeline';

/** The wording doesn't change within a day, so keep it for the app session. */
const cache = new Map<string, PracticeData>();

export function usePractice(leadId: number | undefined, email: string | undefined) {
  const key = leadId ? `${leadId}|${localDateString()}` : '';
  const [data, setData] = useState<PracticeData | null>(key ? (cache.get(key) ?? null) : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(data === null);

  const load = useCallback(async () => {
    if (!leadId || !email) return;
    setError(null);
    try {
      const result = await requestPractice(leadId, email, localDateString());
      cache.set(`${leadId}|${localDateString()}`, result);
      setData(result);
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    }
  }, [leadId, email]);

  useEffect(() => {
    if (!leadId || cache.has(key)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    load().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [leadId, key, load]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load();
    setLoading(false);
  }, [load]);

  return { data, error, loading, retry };
}
