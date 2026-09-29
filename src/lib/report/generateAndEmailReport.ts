/**
 * T3D Background Report Delivery
 *
 * Called from the Stripe webhook via waitUntil() — runs AFTER the
 * webhook has already responded to Stripe, so it never risks delaying
 * or timing out that response. Generates the PDF fresh and emails it.
 *
 * Deliberately self-contained (not sharing code with /api/generate-report)
 * to avoid touching that already-working, tested route.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { db }    from '@/server/db';
import { leads } from '@/server/db/schema';
import { eq }    from 'drizzle-orm';

import { registerFonts }     from '@/lib/report/fonts';
import { SovereignReport }   from '@/lib/report/SovereignReport';
import { buildReportData }   from '@/lib/report/schema/buildReportData';
import { generateSynthesis } from '@/lib/report/schema/synthesisEngine';
import { generateStoplightSynthesis } from '@/lib/report/schema/stoplightSynthesis';
import { sendReportEmail }   from '@/lib/email/sendReportEmail';

registerFonts();

export async function generateAndEmailReport(leadId: number): Promise<void> {
  try {
    console.log(`[Email Delivery] Starting for lead ${leadId}...`);

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead) {
      console.error(`[Email Delivery] Lead ${leadId} not found — aborting.`);
      return;
    }
    if (!lead.email) {
      console.error(`[Email Delivery] Lead ${leadId} has no email on file — aborting.`);
      return;
    }

    const reportData = buildReportData(lead as Parameters<typeof buildReportData>[0]);

    const synthesis = await generateSynthesis(reportData);
    const stoplightSynth = await generateStoplightSynthesis(
      { ...reportData, siderealMoon: (reportData as unknown as Record<string, unknown>)['siderealMoon'] } as Parameters<typeof generateStoplightSynthesis>[0]
    );

    const reportDataWithSynthesis = {
      ...reportData,
      synthesis:          synthesis.text,
      synthesisSource:    synthesis.source,
      stoplightSynthesis: stoplightSynth,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(SovereignReport, { data: reportDataWithSynthesis }) as Parameters<typeof renderToBuffer>[0]
    );

    // Backup download link — points back at the always-current generation
    // endpoint, in case the attachment gets stripped by the recipient's
    // email provider.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://t3-d-sovereign-report.vercel.app';
    const downloadUrl = `${siteUrl}/api/generate-report?leadId=${leadId}`;

    await sendReportEmail({
      to:          lead.email,
      firstName:   lead.firstName ?? 'there',
      pdfBuffer:   Buffer.from(pdfBuffer),
      downloadUrl,
    });

    console.log(`[Email Delivery] ✓ Report emailed to lead ${leadId} (${lead.email})`);

  } catch (error: unknown) {
    // This runs in the background after the webhook already responded to
    // Stripe — a failure here must never throw back up into anything that
    // could cause Stripe to retry the payment webhook. Log clearly instead.
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Email Delivery] ✗ Failed for lead ${leadId}:`, message);
  }
}
