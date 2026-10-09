/**
 * GET /api/generate-report?orderId=123&t=<expiry>.<signature>
 *
 * The signed token (see src/server/reportLinks.ts) is required: the order number alone
 * is not enough. Links come from the delivery email (30 days) or from /api/report-link
 * right after payment (15 minutes). The old leadId-only link is no longer accepted.
 *
 * Looks up which product was purchased via the order and generates that product's
 * deliverable through the registry. Product-agnostic: this route never imports a
 * specific report component.
 */

import { NextResponse }   from 'next/server';
import { db }             from '@/server/db';
import { leads }          from '@/server/db/schema';
import { eq }              from 'drizzle-orm';

import { getOrderById, getProductById } from '@/lib/products/queries';
import { checkReportToken } from '@/server/reportLinks';
import { getGenerator } from '@/lib/products/registry';
import type { Lead } from '@/server/db/schema';

const LINK_PROBLEM = 'This download link is not valid or has expired. Use the link in your most recent report email, or email privacy@3dimensions.guide.';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get('orderId');
    // Local testing only. Ignored in production so it can never open the door by accident.
    const skipCheck = process.env.SKIP_PURCHASE_CHECK === 'true' && process.env.NODE_ENV !== 'production';

    let lead: Lead | undefined;
    let generatorKey: string;
    let productLabel: string;

    if (orderIdParam) {
      if (!/^\d{1,9}$/.test(orderIdParam)) {
        return NextResponse.json({ error: LINK_PROBLEM }, { status: 403 });
      }
      const orderIdNumber = parseInt(orderIdParam, 10);
      if (!skipCheck) {
        const check = checkReportToken(orderIdNumber, searchParams.get('t'));
        if (check === 'unconfigured') {
          console.error('[Report] No link-signing secret is configured; refusing downloads.');
          return NextResponse.json({ error: 'Downloads are not available right now.' }, { status: 503 });
        }
        if (check !== 'ok') {
          return NextResponse.json({ error: LINK_PROBLEM }, { status: 403 });
        }
      }
      const order = await getOrderById(orderIdNumber);
      if (!order) {
        return NextResponse.json({ error: LINK_PROBLEM }, { status: 403 });
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

    } else {
      return NextResponse.json({ error: LINK_PROBLEM }, { status: 403 });
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
