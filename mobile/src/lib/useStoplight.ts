import { useCallback, useEffect, useState } from 'react';
import { ChartRequestError, requestStoplight } from '@/lib/api';
import type { StoplightDetail } from '@/lib/stoplightTypes';

/** Interpretations don't change for a given chart, so keep them for the app session. */
const cache = new Map<number, StoplightDetail>();

export function useStoplight(leadId: number | undefined, email: string | undefined, birthTimeKnown: boolean) {
  const [data, setData] = useState<StoplightDetail | null>(leadId ? (cache.get(leadId) ?? null) : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(data === null);

  const load = useCallback(async () => {
    if (!leadId || !email) return;
    setError(null);
    try {
      const result = await requestStoplight(leadId, email, birthTimeKnown);
      cache.set(leadId, result);
      setData(result);
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    }
  }, [leadId, email, birthTimeKnown]);

  useEffect(() => {
    if (!leadId || cache.has(leadId)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    load().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [leadId, load]);

  const retry = useCallback(async () => {
    setLoading(true);
    await load();
    setLoading(false);
  }, [load]);

  return { data, error, loading, retry };
}
