/**
 * The Sovereign Report — ProductGenerator implementation.
 *
 * T3D's hero product: the complete framework. Bundles the Base Report
 * (sovereignReportGenerator — the original 44-page report, now also sold
 * standalone under the 'base-report' slug) and the Advanced Report
 * (advancedSovereignReportGenerator — the deepened 38-page report, sold
 * standalone under 'advanced-sovereign-report') into a single zip, so
 * someone buying "the complete Sovereign Report" for $97 gets both
 * documents from one purchase instead of two.
 *
 * Deliberately a zip of the two existing, independently-verified PDFs
 * rather than a single re-flowed document — merging them into one
 * continuous report (shared cover, no duplicate section dividers, a
 * cross-report synthesis) is a real content-design project of its own,
 * not a wiring change. This ships the pricing/positioning now without
 * that risk; nothing here blocks building a unified version later.
 *
 * Fits the existing GeneratedDeliverable contract exactly (one buffer,
 * one filename, one contentType) — generate-report/route.ts, the Stripe
 * webhook's delivery pipeline, and sendReportEmail.ts all needed zero
 * changes beyond sendReportEmail no longer assuming every attachment is
 * a PDF.
 */

import JSZip from 'jszip';
import type { Lead } from '@/server/db/schema';
import type { ProductGenerator, GeneratedDeliverable } from '@/lib/products/types';

import { sovereignReportGenerator } from '@/lib/report/sovereignReportGenerator';
import { advancedSovereignReportGenerator } from '@/lib/report/advancedSovereignReportGenerator';

async function generate(lead: Lead): Promise<GeneratedDeliverable> {
  // Independent of each other — run concurrently.
  const [base, advanced] = await Promise.all([
    sovereignReportGenerator.generate(lead),
    advancedSovereignReportGenerator.generate(lead),
  ]);

  const zip = new JSZip();
  zip.file(base.filename, base.buffer);
  zip.file(advanced.filename, advanced.buffer);
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  const safeName = `${lead.firstName ?? ''}-${lead.lastName ?? ''}`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-');

  return {
    buffer:      zipBuffer,
    filename:    `T3D-Sovereign-Report-Complete-${safeName}.zip`,
    contentType: 'application/zip',
  };
}

export const completeSovereignReportGenerator: ProductGenerator = { generate };
