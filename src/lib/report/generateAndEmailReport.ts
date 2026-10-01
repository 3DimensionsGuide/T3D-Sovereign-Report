/**
 * T3D Background Report Delivery
 *
 * Called from the Stripe webhook via waitUntil() — runs AFTER the
 * webhook has already responded to Stripe, so it never risks delaying
 * or timing out that response. Looks up the order to find which product
 * was purchased, generates that product's deliverable via the registry,
 * and emails it. Product-agnostic: adding a new product never requires
 * touching this file.
 */

import { db }    from '@/server/db';
import { leads, orders } from '@/server/db/schema';
import { eq }    from 'drizzle-orm';

import { getOrderById, getProductById } from '@/lib/products/queries';
import { getGenerator } from '@/lib/products/registry';
import { sendReportEmail } from '@/lib/email/sendReportEmail';

export async function generateAndEmailReport(orderId: number): Promise<void> {
  try {
    console.log(`[Delivery] Starting for order ${orderId}...`);

    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`[Delivery] Order ${orderId} not found — aborting.`);
      return;
    }

    const rows = await db.select().from(leads).where(eq(leads.id, order.leadId)).limit(1);
    const lead = rows[0];
    if (!lead) {
      console.error(`[Delivery] Lead ${order.leadId} (order ${orderId}) not found — aborting.`);
      return;
    }
    if (!lead.email) {
      console.error(`[Delivery] Lead ${order.leadId} has no email on file — aborting.`);
      return;
    }

    const product = await getProductById(order.productId);
    if (!product) {
      console.error(`[Delivery] Product ${order.productId} (order ${orderId}) not found — aborting.`);
      return;
    }

    const generator = getGenerator(product.generatorKey);
    const deliverable = await generator.generate(lead);

    // Backup download link — points back at the always-current generation
    // endpoint, in case the attachment gets stripped by the recipient's
    // email provider.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://t3-d-sovereign-report.vercel.app';
    const downloadUrl = `${siteUrl}/api/generate-report?orderId=${orderId}`;

    await sendReportEmail({
      to:          lead.email,
      firstName:   lead.firstName ?? 'there',
      pdfBuffer:   deliverable.buffer,
      downloadUrl,
      productName: product.name,
      filename:    deliverable.filename,
      contentType: deliverable.contentType,
    });

    await db.update(orders)
      .set({ deliveredAt: new Date(), updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    console.log(`[Delivery] ✓ ${product.name} emailed to lead ${lead.id} (${lead.email}), order ${orderId}`);

  } catch (error: unknown) {
    // This runs in the background after the webhook already responded to
    // Stripe — a failure here must never throw back up into anything that
    // could cause Stripe to retry the payment webhook. Log clearly instead.
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Delivery] ✗ Failed for order ${orderId}:`, message);
  }
}
