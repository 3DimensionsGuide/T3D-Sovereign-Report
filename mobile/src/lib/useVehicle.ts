import { useCallback, useEffect, useState } from 'react';
import { ChartRequestError, requestVehicle } from '@/lib/api';
import type { VehicleDetail } from '@/lib/vehicleTypes';

/** Interpretations don't change for a given chart, so keep them for the app session. */
const cache = new Map<number, VehicleDetail>();

export function useVehicle(leadId: number | undefined, email: string | undefined) {
  const [data, setData] = useState<VehicleDetail | null>(leadId ? (cache.get(leadId) ?? null) : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(data === null);

  const load = useCallback(async () => {
    if (!leadId || !email) return;
    setError(null);
    try {
      const result = await requestVehicle(leadId, email);
      cache.set(leadId, result);
      setData(result);
    } catch (err) {
      setError(err instanceof ChartRequestError ? err.message : 'Something went wrong. Please try again.');
    }
  }, [leadId, email]);

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
