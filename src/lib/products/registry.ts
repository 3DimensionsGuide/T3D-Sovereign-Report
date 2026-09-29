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
 */

import type { ProductGenerator } from '@/lib/products/types';
import { sovereignReportGenerator } from '@/lib/report/sovereignReportGenerator';

export const PRODUCT_GENERATORS: Record<string, ProductGenerator> = {
  'sovereign-report': sovereignReportGenerator,
};

export function getGenerator(generatorKey: string): ProductGenerator {
  const generator = PRODUCT_GENERATORS[generatorKey];
  if (!generator) {
    throw new Error(`No ProductGenerator registered for generatorKey "${generatorKey}"`);
  }
  return generator;
}
