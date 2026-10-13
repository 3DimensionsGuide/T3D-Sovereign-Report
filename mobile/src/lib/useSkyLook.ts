import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { hoursOf, skyLook, type SkyLook } from '@/lib/skyPhase';

/** The sky for right now, refreshed every minute and when the app comes back to the front. Off when `enabled` is false. */
export function useSkyLook(enabled: boolean): SkyLook {
  const [look, setLook] = useState(() => skyLook(hoursOf(new Date())));
  useEffect(() => {
    if (!enabled) return;
    const update = () => setLook(skyLook(hoursOf(new Date())));
    update();
    const timer = setInterval(update, 60_000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') update();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [enabled]);
  return look;
}
