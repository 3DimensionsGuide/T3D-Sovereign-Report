import { useMemo } from 'react';
import { MiniRoad } from '@/components/MiniRoad';
import { LENS_TEXT } from '@/components/Lens';
import { pinnedLine, roadPin } from '@/lib/pinnedBar';
import { buildRoadStrip } from '@/lib/roadStrip';
import { useLocalDate } from '@/lib/useLocalDate';
import { useNumerology } from '@/lib/useNumerology';
import { useT3DStore } from '@/store/useT3DStore';
import { PinnedBar } from './PinnedBar';

/** The four Pinnacles pinned to the top of the Road reading, with the card opened last named beside them. */
export function StickyMiniRoad({ openCard }: { openCard: string | null }) {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const today = useLocalDate();
  const { data } = useNumerology(chart?.leadId, profile?.email.trim());
  const pin = useMemo(() => {
    if (!data) return null;
    return roadPin(data.lifePath.display, buildRoadStrip(data.pinnacles, data.challenges, today, null));
  }, [data, today]);
  if (!pin) return null;
  return (
    <PinnedBar
      visual={<MiniRoad />}
      title={pin.title}
      line={pinnedLine(openCard, pin.summary)}
      lineColor={LENS_TEXT.road}
    />
  );
}
