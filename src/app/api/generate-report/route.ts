/**
 * GET /api/generate-report?leadId=123
 *
 * Pipeline:
 *   1. Fetch raw lead record
 *   2. buildReportData()   → normalize + validate → clean ReportData
 *   3. generateSynthesis() → T3D Signature paragraph (API or fallback)
 *   4. SovereignReport()   → PDF render
 *
 * The synthesis paragraph is generated in parallel with any other
 * pre-render work to minimize added latency.
 */

import React from 'react';
import { NextResponse }   from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { db }             from '@/server/db';
import { leads }          from '@/server/db/schema';
import { eq }             from 'drizzle-orm';

import { registerFonts }     from '@/lib/report/fonts';
import { SovereignReport }   from '@/lib/report/SovereignReport';
import { buildReportData }   from '@/lib/report/schema/buildReportData';
import { runQAChecklist, formatQAReport } from '@/lib/report/schema/qaChecklist';
import { generateStoplightSynthesis } from '@/lib/report/schema/stoplightSynthesis';
import { generateSynthesis } from '@/lib/report/schema/synthesisEngine';

registerFonts();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId || isNaN(parseInt(leadId, 10))) {
      return NextResponse.json({ error: 'leadId must be a valid integer.' }, { status: 400 });
    }

    // ── 1. Fetch raw lead record ───────────────────────────────────────────
    const rows = await db
      .select()
      .from(leads)
      .where(eq(leads.id, parseInt(leadId, 10)))
      .limit(1);

    const lead = rows[0];
    if (!lead) {
      return NextResponse.json({ error: `Lead ${leadId} not found.` }, { status: 404 });
    }

    const skipCheck = process.env.SKIP_PURCHASE_CHECK === 'true';
    if (!skipCheck && !lead.reportPurchased) {
      return NextResponse.json({ error: 'Report not purchased.' }, { status: 403 });
    }

    // ── 2. Normalize and validate ─────────────────────────────────────────
    const reportData = buildReportData(
      lead as Parameters<typeof buildReportData>[0]
    );

    // ── 3. Generate T3D Signature synthesis ───────────────────────────────
    // Runs before render — 20s timeout, falls back to template if needed.
    const synthesis = await generateSynthesis(reportData);

    // ── 3b. Generate Stoplight synthesis (six-placement, for Page 30) ──────
    const stoplightSynth = await generateStoplightSynthesis(
      { ...reportData, siderealMoon: (reportData as any).siderealMoon } as Parameters<typeof generateStoplightSynthesis>[0]
    );
    console.log(`[Report ${leadId}] Stoplight: ${stoplightSynth.wordCount}w via ${stoplightSynth.source}`);

    // Attach synthesis to report data
    const reportDataWithSynthesis = {
      ...reportData,
      synthesis:          synthesis.text,
      synthesisSource:    synthesis.source,
      stoplightSynthesis: stoplightSynth,
    };

    console.log(
      `[Report ${leadId}] Synthesis: ${synthesis.wordCount}w via ${synthesis.source}` +
      (synthesis.valid ? '' : ' (validation warnings)')
    );


    // ── 4. Run QA checklist ───────────────────────────────────────────────
    const qaReport = runQAChecklist(reportDataWithSynthesis as any);
    console.log(formatQAReport(qaReport));
    if (!qaReport.passed) {
      console.error('[QA] Critical failures detected — review before delivery');
      // Non-blocking in production: report generates with warnings logged
      // To block on failure, uncomment:
      // return NextResponse.json({ error: 'Report failed QA checks.', issues: qaReport.blockingIssues }, { status: 422 });
    }

    // ── 5. Render PDF ─────────────────────────────────────────────────────
    const pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(SovereignReport, { data: reportDataWithSynthesis }) as any
    );

    // ── 5. Return downloadable PDF ────────────────────────────────────────
    const safeName = `${reportData.firstName}-${reportData.lastName}`
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const filename = `T3D-Sovereign-Report-${safeName}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type':              'application/pdf',
        'Content-Disposition':       `attachment; filename="${filename}"`,
        'Content-Length':            String(pdfBuffer.length),
        'Cache-Control':             'no-store',
        'X-Synthesis-Source':        synthesis.source,
        'X-Synthesis-Words':         String(synthesis.wordCount),
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
