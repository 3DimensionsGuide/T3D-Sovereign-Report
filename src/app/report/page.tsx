'use client';

/**
 * T3D Report Page — /report
 *
 * Landing page after successful Stripe checkout. Stripe redirects here
 * with ?leadId=X&payment_intent=...&redirect_status=succeeded in the URL.
 *
 * leadId is read from the URL first — this is what survives Stripe's
 * full browser redirect intact. The client-side store is kept only as
 * a defensive fallback for edge cases where no redirect occurred.
 *
 * The actual authority on whether someone can download is the database
 * (lead.reportPurchased, set by the Stripe webhook) — this page is purely
 * the UI that gives them a clean way to get their PDF, not a security
 * gate itself. /api/generate-report already enforces the real check.
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link   from 'next/link';
import Nav    from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import { useT3DStore } from '@/store/useT3DStore';

export default function ReportPage() {
  const searchParams   = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  const leadIdFromUrl  = searchParams.get('leadId');

  const { results } = useT3DStore();

  // URL is the reliable source (survives Stripe's full redirect).
  // Store is a defensive fallback only.
  const leadId = leadIdFromUrl
    ? parseInt(leadIdFromUrl, 10)
    : (results?.leadId ?? null);

  const [downloading, setDownloading] = useState(false);

  const paymentLikelyFailed = redirectStatus === 'failed';

  function handleDownload() {
    if (!leadId) return;
    setDownloading(true);
    window.location.href = `/api/generate-report?leadId=${leadId}`;
    setTimeout(() => setDownloading(false), 4000);
  }

  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1, minHeight: '70vh' }}>
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
                Your Sovereign Report is ready.
              </h1>
              <p className="t3d-body" style={{ marginBottom: 40, color: 'var(--parchment-70, rgba(245,245,243,0.75))' }}>
                Your complete report — Human Design, Numerology, and
                Astrology, woven into one navigation guide — is ready to
                download below.
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
                {downloading ? 'PREPARING YOUR REPORT…' : 'DOWNLOAD MY SOVEREIGN REPORT'}
              </button>

              <p className="t3d-label" style={{ color: 'var(--parchment-40)', fontSize: 11 }}>
                Having trouble? Email support at{' '}
                <a href="mailto:privacy@3dimensions.guide" style={{ color: 'var(--emerald)' }}>
                  privacy@3dimensions.guide
                </a>
              </p>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
