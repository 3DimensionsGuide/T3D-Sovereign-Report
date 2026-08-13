/**
 * GET /api/generate-report?leadId=123
 *
 * Generates the T3D Sovereign Report PDF for a given lead.
 * Looks up calculation results from the database,
 * builds the PDF using @react-pdf/renderer, and returns it
 * as a downloadable PDF.
 *
 * SKIP_PURCHASE_CHECK=true in .env.local bypasses the purchase check for testing.
 */

import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { db }    from '@/server/db';
import { leads } from '@/server/db/schema';
import { eq }    from 'drizzle-orm';

import { registerFonts }          from '@/lib/report/fonts';
import { SovereignReport }        from '@/lib/report/SovereignReport';
import { calculatePersonalYear, extractSign } from '@/lib/report/tokens';
import type { ReportData }        from '@/lib/report/tokens';

// Register fonts once on module load
registerFonts();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required.' }, { status: 400 });
    }

    // ── Look up lead ───────────────────────────────────────────────────────
    const rows = await db
      .select()
      .from(leads)
      .where(eq(leads.id, parseInt(leadId, 10)))
      .limit(1);

    const lead = rows[0];
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    // ── Purchase check ─────────────────────────────────────────────────────
    const skipCheck = process.env.SKIP_PURCHASE_CHECK === 'true';
    if (!skipCheck && !lead.reportPurchased) {
      return NextResponse.json(
        { error: 'Report not purchased for this lead.' },
        { status: 403 }
      );
    }

    // ── Extract stored results ─────────────────────────────────────────────
    const results = lead.results as {
      astrology:   Record<string, unknown>;
      numerology:  Record<string, unknown>;
      humanDesign: Record<string, unknown>;
    } | null;

    const hd  = (results?.humanDesign  ?? {}) as Record<string, unknown>;
    const num = (results?.numerology   ?? {}) as Record<string, unknown>;
    const ast = (results?.astrology    ?? {}) as Record<string, unknown>;

    // ── Astrology formatters ───────────────────────────────────────────────
    function fmtPlanet(planet: unknown): string {
      const obj = planet as { formatted?: string } | null;
      return obj?.formatted ?? '—';
    }

    const tropSun  = fmtPlanet(ast.tropicalSun);
    const tropMoon = fmtPlanet(ast.tropicalMoon);
    const tropAsc  = typeof ast.tropicalAscendant === 'number'
      ? String(Math.floor(ast.tropicalAscendant)) + '°'
      : '—';

    // ── Birth date from stored birth data ──────────────────────────────────
    const birthData = lead.birthData as { date?: string } | null;
    const birthDate = birthData?.date ?? '';

    // ── Personal Year ──────────────────────────────────────────────────────
    const personalYear = birthDate
      ? calculatePersonalYear(birthDate)
      : 1;

    // ── Extract sun/moon/rising signs ─────────────────────────────────────
    const sunSign    = extractSign(tropSun);
    const moonSign   = extractSign(tropMoon);
    const risingSign = extractSign(tropAsc);

    // ── Build ReportData ───────────────────────────────────────────────────
    const reportData: ReportData = {
      // Personal
      firstName:   lead.firstName ?? '',
      lastName:    lead.lastName  ?? '',
      email:       lead.email     ?? '',
      birthDate,
      generatedAt: new Date().toISOString(),

      // Human Design
      hdType:           String(hd.type      ?? 'Unknown'),
      hdAuthority:      String(hd.authority ?? 'Unknown'),
      hdProfile:        String(hd.profile   ?? '—'),
      hdStrategy:       String(hd.strategy  ?? '—'),
      hdNotSelf:        String(hd.notSelf   ?? '—'),
      hdDefinedCenters: (hd.definedCenters  as string[]) ?? [],
      hdChannels:       (hd.activeChannels  as ReportData['hdChannels']) ?? [],

      // Numerology
      lifePath:      Number(num.lifePath      ?? 1),
      destiny:       Number(num.destiny       ?? 1),
      personality:   Number(num.personality   ?? 1),
      soulUrge:      Number(num.soulUrge      ?? 1),
      hiddenPassion: Number(num.hiddenPassion  ?? 1),
      karmicLessons: (num.karmicLessons       as number[]) ?? [],
      personalYear,
      pinnacles:     (num.pinnacles           as ReportData['pinnacles']) ?? [],

      // Astrology — formatted positions
      tropicalSun:   tropSun,
      tropicalMoon:  tropMoon,
      tropicalAsc:   tropAsc,
      tropicalMC:    typeof ast.tropicalMC === 'number'
        ? String(Math.floor(ast.tropicalMC)) + '°'
        : '—',
      siderealSun:   fmtPlanet(ast.siderealSun),
      siderealAsc:   typeof ast.siderealAscendant === 'number'
        ? String(Math.floor(ast.siderealAscendant)) + '°'
        : '—',

      // Extracted signs
      sunSign,
      moonSign,
      risingSign,
    };

    // ── Generate PDF ───────────────────────────────────────────────────────
    const pdfBuffer = await renderToBuffer(
      React.createElement(SovereignReport, { data: reportData })
    );

    // ── Return downloadable PDF ────────────────────────────────────────────
    const filename = `T3D-Sovereign-Report-${reportData.firstName}-${reportData.lastName}.pdf`
      .replace(/\s+/g, '-');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
        'Cache-Control':       'no-store',
      },
    });

  } catch (error: unknown) {
    console.error('[Report Generation Error]', error);
    const message = error instanceof Error ? error.message : 'Report generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
