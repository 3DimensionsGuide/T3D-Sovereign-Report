import { useEffect } from 'react';
import { useTimeline } from '@/lib/useTimeline';
import { syncAlerts } from '@/lib/reminder';
import { useReminderStore } from '@/store/useReminderStore';
import { useT3DStore } from '@/store/useT3DStore';

/**
 * Keeps the phone's scheduled heads-ups in step with the Timeline and the chosen categories.
 * It draws nothing. It reuses the Timeline copy the screens already load, so it costs no extra request.
 */
export function AlertSync() {
  const chart = useT3DStore((s) => s.chart);
  const email = useT3DStore((s) => s.profile?.email.trim());
  const timeline = useTimeline(chart?.leadId, email);
  const alerts = useReminderStore((s) => s.alerts);
  const hydrated = useReminderStore((s) => s.hydrated);
  const data = timeline.data;
  useEffect(() => {
    if (hydrated && data) void syncAlerts(data);
  }, [hydrated, data, alerts]);
  return null;
}
