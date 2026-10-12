import { MiniBody } from '@/components/MiniBody';
import { LENS_TEXT } from '@/components/Lens';
import { centerLabel } from '@/lib/bodygraphFocus';
import { useChartData } from '@/lib/useChartData';
import { useT3DStore } from '@/store/useT3DStore';
import { PinnedBar } from './PinnedBar';

/** A small bodygraph pinned to the top of the Vehicle reading. It lights the center whose card was opened last. */
export function StickyMiniBody({ focusId }: { focusId: string | null }) {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const hd = useChartData(chart?.leadId, profile?.email.trim()).data?.humanDesign;
  if (!hd) return null;
  const defined = focusId ? hd.definedCenters.includes(focusId) : false;
  return (
    <PinnedBar
      visual={<MiniBody definedCenters={hd.definedCenters} height={52} focusId={focusId} />}
      title={`${hd.type} · ${hd.authority}`}
      line={focusId ? `Reading: ${centerLabel(focusId)} (${defined ? 'defined' : 'open'})` : `${hd.definedCenters.length} of 9 centers defined`}
      lineColor={LENS_TEXT.vehicle}
    />
  );
}
