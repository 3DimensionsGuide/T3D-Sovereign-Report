import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { localDateString } from '@/lib/localDate';

/**
 * Today's date on this phone, kept current. It changes at local midnight while the app
 * stays open, and when the app comes back to the front after being away, so screens that
 * depend on the day can load the new day without anyone pulling to refresh.
 */
export function useLocalDate(): string {
  const [date, setDate] = useState(() => localDateString());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => setDate((prev) => {
      const next = localDateString();
      return next === prev ? prev : next;
    });
    const schedule = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
      timer = setTimeout(() => { check(); schedule(); }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
    };
    schedule();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      check();
      if (timer) clearTimeout(timer);
      schedule();
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return date;
}
