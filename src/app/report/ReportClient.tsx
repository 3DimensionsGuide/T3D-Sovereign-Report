'use client';

/**
 * T3D Report Page — client content
 *
 * Reads leadId / redirect_status from the URL (Stripe's redirect target),
 * with the Zustand store kept only as a defensive fallback. This file is
 * the client-only piece that calls useSearchParams(); it is rendered
 * from the server component in page.tsx, wrapped in <Suspense> there,
 * which is what lets Next.js statically build /report without the
 * "useSearchParams() should be wrapped in a suspense boundary" bailout.
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useT3DStore } from '@/store/useT3DStore';
import AdvancedReportUpsell from './AdvancedReportUpsell';

// Display name per product slug — falls back to the generic "Sovereign
// Report" copy for an unrecognized or missing slug (e.g. an old link from
// before ?product= existed), which is what this page always said anyway.
const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  'base-report':               'Base Report',
  'advanced-sovereign-report': 'Advanced Report',
  'sovereign-report':          'Sovereign Report',
};

// Post-purchase "ready" copy, one per product slug. Falls back to the
// complete-bundle copy for an unrecognized slug, same reasoning as above.
const READY_COPY_BY_SLUG: Record<string, string> = {
  'base-report':
    'Your Base Report — Human Design, Numerology, and Astrology, woven into one navigation guide — is ready to download below. We’ve also emailed a copy to you.',
  'advanced-sovereign-report':
    'Your Advanced Report — every gate and channel, all Four Pinnacles and Challenges, your personal and outer planets, plus your live transits — is ready to download below. We’ve also emailed a copy to you.',
  'sovereign-report':
    'Your complete Sovereign Report — the Base Report and the Advanced Report together, nothing held back — is ready to download below. We’ve also emailed a copy to you.',
};

export default function ReportClient() {
  const searchParams   = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  const leadIdFromUrl  = searchParams.get('leadId');
  const orderIdFromUrl = searchParams.get('orderId');
  const productSlug    = searchParams.get('product') ?? 'sovereign-report';

  const { results } = useT3DStore();

  // URL is the reliable source (survives Stripe's full redirect).
  // Store is a defensive fallback only.
  const leadId = leadIdFromUrl
    ? parseInt(leadIdFromUrl, 10)
    : (results?.leadId ?? null);

  const orderId = orderIdFromUrl ? parseInt(orderIdFromUrl, 10) : null;

  const productName = PRODUCT_DISPLAY_NAMES[productSlug] ?? 'Sovereign Report';
  const readyCopy    = READY_COPY_BY_SLUG[productSlug] ?? READY_COPY_BY_SLUG['sovereign-report'];

  const [downloading, setDownloading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const paymentIntentId = searchParams.get('payment_intent');

  const paymentLikelyFailed = redirectStatus === 'failed';

  async function handleDownload() {
    setLinkError('');
    if (!orderId || !paymentIntentId) {
      setLinkError('To protect your report, downloads from this page only work right after checkout. Please use the link in your report email.');
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch('/api/report-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentIntentId }),
      });
      const json = (await res.json()) as { success: boolean; url?: string; error?: string };
      if (!json.success || !json.url) {
        setLinkError(json.error ?? 'Could not prepare your download. Please try again.');
        setDownloading(false);
        return;
      }
      window.location.href = json.url;
      setTimeout(() => setDownloading(false), 4000);
    } catch {
      setLinkError('Could not prepare your download. Please try again.');
      setDownloading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 640,
      margin: '0 auto',
      padding: 'clamp(48px,10vh,120px) clamp(20px,4vw,48px)',
      textAlign: 'center',
    }}>

      {!leadId ? (
        <>
          <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 16 }}>
            [REPORT] — NOT FOUND
          </p>
          <h1 className="t3d-h2" style={{ marginBottom: 20 }}>
            We couldn&apos;t find your report session.
          </h1>
          <p className="t3d-body" style={{ marginBottom: 32, color: 'var(--parchment-70, rgba(245,245,243,0.75))' }}>
            This can happen if you opened this page directly, or in a
            different browser than the one you checked out with. If you
            already purchased a report, check the email you used at
            checkout — otherwise, start again below.
          </p>
          <Link href="/#calculator" className="t3d-cta" style={{ display: 'inline-flex' }}>
            GO TO CALCULATOR
          </Link>
        </>
      ) : paymentLikelyFailed ? (
        <>
          <p className="t3d-label" style={{ color: 'var(--crimson-hi, #B91C1C)', marginBottom: 16 }}>
            [PAYMENT] — NOT COMPLETED
          </p>
          <h1 className="t3d-h2" style={{ marginBottom: 20 }}>
            Your payment didn&apos;t go through.
          </h1>
          <p className="t3d-body" style={{ marginBottom: 32 }}>
            No charge was made. You can try again with a different card.
          </p>
          <Link href="/checkout" className="t3d-cta" style={{ display: 'inline-flex' }}>
            RETURN TO CHECKOUT
          </Link>
        </>
      ) : (
        <>
          <p className="t3d-label" style={{ color: 'var(--emerald)', marginBottom: 16 }}>
            [PAYMENT] — CONFIRMED
          </p>
          <h1 className="t3d-h2" style={{ marginBottom: 20 }}>
            Your {productName} is ready.
          </h1>
          <p className="t3d-body" style={{ marginBottom: 40, color: 'var(--parchment-70, rgba(245,245,243,0.75))' }}>
            {readyCopy}
          </p>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="t3d-cta"
            style={{
              display: 'inline-flex',
              padding: '18px 44px',
              opacity: downloading ? 0.65 : 1,
              cursor: downloading ? 'not-allowed' : 'pointer',
              marginBottom: 24,
            }}
          >
            {downloading ? 'PREPARING YOUR REPORT…' : `DOWNLOAD MY ${productName.toUpperCase()}`}
          </button>

          {linkError && (
            <p role="alert" className="t3d-label" style={{ color: 'var(--crimson-hi, #B91C1C)', marginBottom: 16 }}>
              ⚠ {linkError}
            </p>
          )}

          <p className="t3d-label" style={{ color: 'var(--parchment-40)', fontSize: 11 }}>
            Having trouble? Email support at{' '}
            <a href="mailto:privacy@3dimensions.guide" style={{ color: 'var(--emerald)' }}>
              privacy@3dimensions.guide
            </a>
          </p>

          {productSlug === 'base-report' && leadId && (
            <AdvancedReportUpsell leadId={leadId} />
          )}
        </>
      )}

    </div>
  );
}
