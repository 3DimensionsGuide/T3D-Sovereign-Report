/**
 * GET /api/generate-report?orderId=123
 * GET /api/generate-report?leadId=123   (legacy — pre-orders-table links)
 *
 * Looks up which product was purchased (via the order, or via the legacy
 * leads.reportPurchased flag for links generated before the orders table
 * existed) and generates that product's deliverable through the registry.
 * Product-agnostic: this route never imports a specific report component.
 */

import { NextResponse }   from 'next/server';
import { db }             from '@/server/db';
import { leads }          from '@/server/db/schema';
import { eq }              from 'drizzle-orm';

import { getOrderById, getProductBySlug, getProductById } from '@/lib/products/queries';
import { getGenerator } from '@/lib/products/registry';
import type { Lead } from '@/server/db/schema';

const LEGACY_PRODUCT_SLUG = 'sovereign-report';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get('orderId');
    const leadIdParam  = searchParams.get('leadId');
    const skipCheck = process.env.SKIP_PURCHASE_CHECK === 'true';

    let lead: Lead | undefined;
    let generatorKey: string;
    let productLabel: string;

    if (orderIdParam) {
      if (isNaN(parseInt(orderIdParam, 10))) {
        return NextResponse.json({ error: 'orderId must be a valid integer.' }, { status: 400 });
      }
      const order = await getOrderById(parseInt(orderIdParam, 10));
      if (!order) {
        return NextResponse.json({ error: `Order ${orderIdParam} not found.` }, { status: 404 });
      }
      if (!skipCheck && order.status !== 'paid') {
        return NextResponse.json({ error: 'Order not paid.' }, { status: 403 });
      }

      const rows = await db.select().from(leads).where(eq(leads.id, order.leadId)).limit(1);
      lead = rows[0];
      if (!lead) {
        return NextResponse.json({ error: `Lead ${order.leadId} not found.` }, { status: 404 });
      }

      const product = await getProductById(order.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${order.productId} not found.` }, { status: 404 });
      }
      generatorKey = product.generatorKey;
      productLabel = product.name;

    } else if (leadIdParam) {
      // Legacy path: links emailed before the orders table existed only
      // ever pointed at a lead, and only ever meant the Sovereign Report.
      if (isNaN(parseInt(leadIdParam, 10))) {
        return NextResponse.json({ error: 'leadId must be a valid integer.' }, { status: 400 });
      }
      const rows = await db.select().from(leads).where(eq(leads.id, parseInt(leadIdParam, 10))).limit(1);
      lead = rows[0];
      if (!lead) {
        return NextResponse.json({ error: `Lead ${leadIdParam} not found.` }, { status: 404 });
      }
      if (!skipCheck && !lead.reportPurchased) {
        return NextResponse.json({ error: 'Report not purchased.' }, { status: 403 });
      }

      const product = await getProductBySlug(LEGACY_PRODUCT_SLUG);
      generatorKey = product?.generatorKey ?? LEGACY_PRODUCT_SLUG;
      productLabel = product?.name ?? 'Sovereign Report';

    } else {
      return NextResponse.json({ error: 'orderId or leadId is required.' }, { status: 400 });
    }

    const generator = getGenerator(generatorKey);
    const deliverable = await generator.generate(lead);

    console.log(`[Report] Generated "${productLabel}" for lead ${lead.id}`);

    return new NextResponse(new Uint8Array(deliverable.buffer), {
      status: 200,
      headers: {
        'Content-Type':        deliverable.contentType,
        'Content-Disposition': `attachment; filename="${deliverable.filename}"`,
        'Content-Length':      String(deliverable.buffer.length),
        'Cache-Control':       'no-store',
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Report generation failed.';
    console.error('[Report] Error:', message);
    return NextResponse.json(
      {
        error:   message.includes('buildReportData')
          ? 'Report data is incomplete or invalid.'
          : 'Report generation failed.',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: message.includes('buildReportData') ? 422 : 500 }
    );
  }
}
