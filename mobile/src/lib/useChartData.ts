import { useCallback, useEffect, useState } from 'react';
import type { ChartDrawingData } from '@/charts/chartTypes';
import { requestChartData } from '@/lib/api';

/** Drawing data never changes for a given chart, so keep it for the life of the app session. */
const cache = new Map<number, ChartDrawingData>();

export function useChartData(leadId: number | undefined, email: string | undefined) {
  const [data, setData] = useState<ChartDrawingData | null>(leadId ? (cache.get(leadId) ?? null) : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!leadId || !email) return;
    const cached = cache.get(leadId);
    if (cached) {
      setData(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    requestChartData(leadId, email)
      .then((result) => {
        if (cancelled) return;
        cache.set(leadId, result);
        setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load your charts. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId, email, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, error, loading, retry };
}
