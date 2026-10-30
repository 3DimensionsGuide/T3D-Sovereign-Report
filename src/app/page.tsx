/**
 * The homepage.
 *
 * A server component so the instrument section can be handed today's real reading,
 * already computed, instead of blinking in after a fetch. Everything interactive
 * lives in HomeView, which is the client half.
 *
 * Revalidated hourly: the surface shows the sky on the hour, and the clock inside it
 * walks today's hours from there.
 */

import HomeView from '@/components/home/HomeView';
import { buildTodayReading } from '@/server/instrument/todayReading';

export const revalidate = 3600;

export default async function HomePage() {
  return <HomeView reading={await buildTodayReading()} />;
}
