import { requestVehicle } from '@/lib/api';
import type { VehicleDetail } from '@/lib/vehicleTypes';
import { ONE_DAY_MS, useCachedLoad } from '@/lib/useCachedLoad';

/** A saved copy opens instantly and works with no signal; it refreshes in the background after a day. */
export function useVehicle(leadId: number | undefined) {
  const result = useCachedLoad<VehicleDetail>({
    key: leadId ? `vehicle|${leadId}` : null,
    fetcher: () => requestVehicle(),
    maxAgeMs: ONE_DAY_MS,
  });
  return result;
}
