import { MiniWheel } from '@/components/MiniWheel';
import { LENS_TEXT } from '@/components/Lens';
import { formatLongitude } from '@/lib/api';
import { pinnedLine, wheelPin } from '@/lib/pinnedBar';
import { useT3DStore } from '@/store/useT3DStore';
import { PinnedBar } from './PinnedBar';

/** The birth-sky wheel pinned to the top of the Stoplight reading, with the card opened last named beside it. */
export function StickyMiniWheel({ openCard }: { openCard: string | null }) {
  const chart = useT3DStore((s) => s.chart);
  const profile = useT3DStore((s) => s.profile);
  const astro = chart?.astrology;
  if (!astro) return null;
  const timeKnown = profile?.birthTimeKnown !== false && Number.isFinite(astro.tropicalAscendant);
  const rising = timeKnown ? (formatLongitude(astro.tropicalAscendant).split(' ').pop() ?? null) : null;
  const pin = wheelPin(astro.tropicalSun.sign, astro.tropicalMoon.sign, rising);
  return (
    <PinnedBar
      visual={<MiniWheel astro={astro} size={52} />}
      title={pin.title}
      line={pinnedLine(openCard, pin.summary)}
      lineColor={LENS_TEXT.stoplight}
    />
  );
}
