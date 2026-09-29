/**
 * Shared types for the product-generator registry.
 *
 * Every purchasable product (Sovereign Report, Advanced Sovereign Report,
 * Astrocartography, Relationship Dynamics, ...) implements ProductGenerator
 * and registers itself in registry.ts under its generatorKey. Checkout,
 * the Stripe webhook, and the download route never import a specific
 * report component directly — they go through this interface so adding a
 * new product never means touching those three files' logic, only adding
 * a registry entry.
 */

import type { Lead } from '@/server/db/schema';

export interface GeneratedDeliverable {
  /** The rendered file, ready to email or serve for download. */
  buffer: Buffer;
  /** e.g. "T3D-Sovereign-Report-Jane-Doe.pdf" */
  filename: string;
  /** MIME type for the HTTP response / email attachment. */
  contentType: string;
}

export interface ProductGenerator {
  /**
   * Build the deliverable for a single lead. Implementations are
   * responsible for their own data normalization, synthesis calls, and
   * rendering — the registry only routes to the right one.
   */
  generate(lead: Lead): Promise<GeneratedDeliverable>;
}
