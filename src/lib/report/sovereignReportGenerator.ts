/**
 * Sovereign Report — ProductGenerator implementation.
 *
 * The single place that builds a Sovereign Report PDF for a lead:
 * normalize → synthesis → stoplight synthesis → QA → render. Both the
 * direct-download route (/api/generate-report) and the post-purchase
 * email pipeline (generateAndEmailReport) call this instead of each
 * duplicating the render pipeline — previously they were "deliberately
 * self-contained" copies of each other, which was fine at one product
 * but doesn't scale to four.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import type { Lead } from '@/server/db/schema';
import type { ProductGenerator, GeneratedDeliverable } from '@/lib/products/types';

import { registerFonts }     from '@/lib/report/fonts';
import { SovereignReport }   from '@/lib/report/SovereignReport';
import { buildReportData }   from '@/lib/report/schema/buildReportData';
import { runQAChecklist, formatQAReport } from '@/lib/report/schema/qaChecklist';
import { generateStoplightSynthesis } from '@/lib/report/schema/stoplightSynthesis';
import { generateSynthesis } from '@/lib/report/schema/synthesisEngine';

registerFonts();

async function generate(lead: Lead): Promise<GeneratedDeliverable> {
  const reportData = buildReportData(
    lead as Parameters<typeof buildReportData>[0]
  );

  const synthesis = await generateSynthesis(reportData);

  const stoplightSynth = await generateStoplightSynthesis(
    { ...reportData, siderealMoon: (reportData as unknown as Record<string, unknown>)['siderealMoon'] } as Parameters<typeof generateStoplightSynthesis>[0]
  );
  console.log(`[Report ${lead.id}] Stoplight: ${stoplightSynth.wordCount}w via ${stoplightSynth.source}`);

  const reportDataWithSynthesis = {
    ...reportData,
    synthesis:          synthesis.text,
    synthesisSource:    synthesis.source,
    stoplightSynthesis: stoplightSynth,
  };

  console.log(
    `[Report ${lead.id}] Synthesis: ${synthesis.wordCount}w via ${synthesis.source}` +
    (synthesis.valid ? '' : ' (validation warnings)')
  );

  const qaReport = runQAChecklist(reportDataWithSynthesis as Parameters<typeof runQAChecklist>[0]);
  console.log(formatQAReport(qaReport));
  if (!qaReport.passed) {
    console.error('[QA] Critical failures detected — review before delivery');
    // Non-blocking in production: report generates with warnings logged.
  }

  const pdfBuffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(SovereignReport, { data: reportDataWithSynthesis }) as any
  );

  const safeName = `${reportData.firstName}-${reportData.lastName}`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-');

  return {
    buffer:      Buffer.from(pdfBuffer),
    filename:    `T3D-Sovereign-Report-${safeName}.pdf`,
    contentType: 'application/pdf',
  };
}

export const sovereignReportGenerator: ProductGenerator = { generate };
