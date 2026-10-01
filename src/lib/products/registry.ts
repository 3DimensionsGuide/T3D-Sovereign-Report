/**
 * Product-generator registry.
 *
 * Maps a product's `generatorKey` (stored on its `products` row) to the
 * ProductGenerator that builds its deliverable. To add a new product:
 *   1. Implement ProductGenerator somewhere under src/lib/<product>/
 *   2. Register it here under a new key
 *   3. Insert a `products` row with generatorKey matching that key
 * Nothing in checkout, the Stripe webhook, or the download route needs
 * to change.
 *
 * Naming note: the file/export names below predate the current product
 * lineup and intentionally weren't renamed to match (renaming a working
 * file for cosmetic reasons just to match a later marketing decision
 * isn't worth the churn) — so read this block by its KEYS, not by the
 * generator variable names:
 *   - 'base-report'               → sovereignReportGenerator        (the original, still-unchanged 44-page report)
 *   - 'advanced-sovereign-report' → advancedSovereignReportGenerator (the deepened 38-page report)
 *   - 'sovereign-report'          → completeSovereignReportGenerator (the hero bundle: both of the above, zipped)
 * 'sovereign-report' is now T3D's brand/flagship name for the complete
 * framework, not the original (now "Base Report") product — it was
 * repointed here deliberately, not a bug.
 */

import type { ProductGenerator } from '@/lib/products/types';
import { sovereignReportGenerator } from '@/lib/report/sovereignReportGenerator';
import { advancedSovereignReportGenerator } from '@/lib/report/advancedSovereignReportGenerator';
import { completeSovereignReportGenerator } from '@/lib/report/completeSovereignReportGenerator';

export const PRODUCT_GENERATORS: Record<string, ProductGenerator> = {
  'base-report': sovereignReportGenerator,
  'advanced-sovereign-report': advancedSovereignReportGenerator,
  'sovereign-report': completeSovereignReportGenerator,
};

export function getGenerator(generatorKey: string): ProductGenerator {
  const generator = PRODUCT_GENERATORS[generatorKey];
  if (!generator) {
    throw new Error(`No ProductGenerator registered for generatorKey "${generatorKey}"`);
  }
  return generator;
}
