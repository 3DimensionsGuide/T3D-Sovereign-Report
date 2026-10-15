/**
 * Product display copy — static marketing text per product slug.
 *
 * This is deliberately NOT the source of truth for price (the `products`
 * DB table is — see src/lib/products/queries.ts). It's display-only copy
 * for surfaces that render before/without a DB round-trip: the pricing
 * page's cards and the results-page upsell CTA. Same pattern already in
 * use on AdvancedReportUpsell.tsx (a static price mirroring the DB row) —
 * if a price ever changes, update it here too; checkout itself always
 * shows the authoritative price from the database regardless of what
 * this copy says.
 *
 * Kept separate from checkout/page.tsx's own BASE_INCLUDES/ADVANCED_INCLUDES/
 * COMPLETE_INCLUDES (not a refactor of that file — it's already shipped
 * and tested, and this module's cards are shorter-form than checkout's).
 */

export interface IncludeItem {
  label: string;
  text:  string;
}

export interface ProductDisplay {
  slug:        string;
  name:        string;
  priceLabel:  string;
  eyebrow:     string;
  tagline:     string;
  ctaLabel:    string;
  includes:    readonly IncludeItem[];
  featured?:   boolean;
}

export const PRODUCT_DISPLAY: Record<string, ProductDisplay> = {
  'base-report': {
    slug:       'base-report',
    name:       'Base Report',
    priceLabel: '$44',
    eyebrow:    'Where to start',
    tagline:    'Human Design, Numerology, and Astrology — woven into one navigation guide built from your exact birth data.',
    ctaLabel:   'START WITH THE BASE REPORT',
    includes: [
      { label: 'Vehicle',    text: 'Your Type, Strategy, Authority, and Profile' },
      { label: 'Road',       text: 'Your Life Path, current Pinnacle, and Challenges' },
      { label: 'Stoplight',  text: 'Your Tropical and Sidereal Big Three, read together' },
      { label: 'Summary',  text: 'Written for your exact configuration, plus a printable nav card' },
    ],
  },
  'advanced-sovereign-report': {
    slug:       'advanced-sovereign-report',
    name:       'Advanced Report',
    priceLabel: '$53',
    eyebrow:    'Go deeper',
    tagline:    'The same three systems, read at full depth instead of summary — every gate, every Pinnacle, every live transit.',
    ctaLabel:   'GO DEEPER WITH THE ADVANCED REPORT',
    includes: [
      { label: 'Vehicle',      text: 'Every gate, channel, bridge, and your full circuitry' },
      { label: 'Road',         text: 'All Four Pinnacles and Challenges across your whole life' },
      { label: 'Stoplight',    text: 'Every personal and outer planet, plus your live transits' },
      { label: 'Together',  text: 'How all three systems stack into one decision hierarchy' },
    ],
  },
  'sovereign-report': {
    slug:       'sovereign-report',
    name:       'Sovereign Report',
    priceLabel: '$97',
    eyebrow:    'The complete set',
    tagline:    'The Base Report and the Advanced Report together — nothing held back, nothing to unlock later.',
    ctaLabel:   'GET THE COMPLETE SOVEREIGN REPORT',
    includes: [
      { label: 'Base',      text: 'The full Base Report — all three systems, woven into one guide' },
      { label: 'Advanced',  text: 'The full Advanced Report — every gate, every Pinnacle, every transit' },
      { label: 'Format',    text: 'Both reports delivered together as one download' },
      { label: 'Value',     text: 'The same $97 as buying both separately ($44 + $53)' },
    ],
    featured: true,
  },
};

// Display order for the pricing page — ascending by price, entry point
// to complete framework.
export const PRODUCT_ORDER = ['base-report', 'advanced-sovereign-report', 'sovereign-report'] as const;
