/**
 * What T3D Premium includes and what it costs, in one place for the Premium screen.
 * Until purchases exist the prices here are the planned ones; the App Store's own price will replace them.
 */
export const PRICES = { monthly: 9.99, yearly: 79.99, trialDays: 7, reportBuyerMonths: 12 } as const;

export const money = (n: number): string => `$${n.toFixed(2)}`;

/** How much cheaper a year is than twelve months, as a whole percent. */
export function yearlySavingsPercent(): number {
  return Math.round((1 - PRICES.yearly / (PRICES.monthly * 12)) * 100);
}

export type PremiumAccent = 'vehicle' | 'road' | 'stoplight';

export interface PremiumFeature {
  id: string;
  accent: PremiumAccent;
  title: string;
  detail: string;
}

export const PREMIUM_FEATURES: readonly PremiumFeature[] = [
  { id: 'explain', accent: 'vehicle', title: 'Full explanations', detail: 'Tap any term in your chart for the long, plain-language explanation, not just the short definition.' },
  { id: 'meet', accent: 'vehicle', title: 'Meet your Triad, days 4 to 7', detail: 'The rest of the first-week walk through your Vehicle, Road and Stoplight.' },
  { id: 'practice', accent: 'road', title: 'The Practice tab', detail: 'Daily practices that put your Strategy and timing to work.' },
  { id: 'year', accent: 'road', title: 'Your year ahead', detail: 'Your Personal Year and the months ahead, laid out in order.' },
  { id: 'timing', accent: 'stoplight', title: 'Past and future timing', detail: 'Look back and look ahead in Today’s Sky, not only today.' },
  { id: 'nodes', accent: 'stoplight', title: 'Lunar Nodes and natal aspects', detail: 'The deeper layers of your birth sky.' },
];

export const FREE_FEATURES: readonly string[] = [
  'Your full chart across all three lenses',
  'Today’s frame and your daily reminder',
  'Short definitions for every term',
  'The “In your chart” line on every term',
  'Meet your Triad, days 1 to 3',
];
