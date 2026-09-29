/**
 * T3D Report Page — /report
 *
 * Landing page after successful Stripe checkout. Stripe redirects here
 * with ?leadId=X&payment_intent=...&redirect_status=succeeded in the URL.
 *
 * This file is a Server Component. The part that reads the URL
 * (useSearchParams) lives in ReportClient.tsx, a separate client
 * component, rendered here inside <Suspense>. Keeping this outer page
 * as a server component (no 'use client') is what lets Next.js build
 * /report statically without the "useSearchParams() should be wrapped
 * in a suspense boundary" bailout — putting 'use client' on this file
 * instead reintroduces that error even with Suspense present, because
 * Next can no longer split the page into a server shell + suspended
 * client content at build time.
 *
 * The actual authority on whether someone can download is the database
 * (lead.reportPurchased, set by the Stripe webhook) — this page is purely
 * the UI that gives them a clean way to get their PDF, not a security
 * gate itself. /api/generate-report already enforces the real check.
 */

import { Suspense } from 'react';
import Nav      from '@/components/navigation/Nav';
import Footer   from '@/components/navigation/Footer';
import ReportClient from './ReportClient';

function ReportLoadingFallback() {
  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: 'clamp(48px,10vh,120px) clamp(20px,4vw,48px)',
      textAlign: 'center',
    }}>
      <p className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
        LOADING…
      </p>
    </div>
  );
}

export default function ReportPage() {
  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1, minHeight: '70vh' }}>
        <Suspense fallback={<ReportLoadingFallback />}>
          <ReportClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
