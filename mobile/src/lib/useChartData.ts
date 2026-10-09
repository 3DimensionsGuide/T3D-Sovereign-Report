import type { ChartDrawingData } from '@/charts/chartTypes';
import { requestChartData } from '@/lib/api';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** Drawing data for a chart. A saved copy opens instantly and works with no signal. */
export function useChartData(leadId: number | undefined, email: string | undefined) {
  const { data, error, loading, retry } = useCachedLoad<ChartDrawingData>({
    key: leadId && email ? `chartdata|${leadId}` : null,
    fetcher: () => requestChartData(leadId as number, email as string),
    maxAgeMs: ONE_DAY_MS,
  });
  return { data, error, loading, retry };
}
