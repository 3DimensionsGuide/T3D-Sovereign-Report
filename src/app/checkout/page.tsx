'use client';

/**
 * T3D Checkout Page — /checkout?product=<slug>
 *
 * Product-agnostic: defaults to the Sovereign Report ('sovereign-report')
 * when no ?product= param is present, so existing links keep working.
 * Name/price/description come back from /api/stripe/create-payment-intent
 * (looked up server-side by product slug) rather than being hardcoded here.
 *
 * Flow:
 *   1. Page mounts → reads email from localStorage (saved by calculator)
 *   2. Calls /api/stripe/create-payment-intent → gets clientSecret + product info
 *   3. Stripe Elements renders the payment form
 *   4. User pays → Stripe redirects to /report on success
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link   from 'next/link';
import Nav    from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import { useT3DStore } from '@/store/useT3DStore';

// ─── Load Stripe once — outside component ─────────────────────────────────────
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ─── Stripe Elements appearance ───────────────────────────────────────────────
const APPEARANCE = {
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary:    '#991B1B',
      colorBackground: '#111113',
      colorText:       '#F5F5F3',
      colorDanger:     '#B91C1C',
      fontFamily:      "'DM Sans', system-ui, sans-serif",
      borderRadius:    '0px',
    },
    rules: {
      '.Input': {
        border:          '1px solid rgba(245,245,243,0.15)',
        backgroundColor: '#111113',
        color:           '#F5F5F3',
        fontSize:        '16px',
        padding:         '14px',
      },
      '.Input:focus': { border: '1px solid #F5F5F3', boxShadow: 'none' },
      '.Label': {
        color:         'rgba(245,245,243,0.40)',
        fontSize:      '10px',
        fontWeight:    '500',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      },
      '.Error': { color: '#B91C1C', fontSize: '12px', marginTop: '6px' },
    },
  },
};

// ─── Product info returned by /api/stripe/create-payment-intent ──────────────
interface ProductInfo {
  slug:        string;
  name:        string;
  description: string;
  priceCents:  number;
}

// ─── What's included, per product ──────────────────────────────────────────────
// Three purchasable products as of the Base/Advanced/Sovereign repricing:
//   'base-report'               — the original report, now the entry tier
//   'advanced-sovereign-report' — the deepened report, sold standalone (the
//                                  completion upsell for Base Report buyers)
//   'sovereign-report'          — T3D's hero product: both of the above,
//                                  bundled as the complete framework
const BASE_INCLUDES = [
  { label: '[VEHICLE]',   text: 'Human Design — your Type, Strategy, Authority, and Profile, plus the centers that shape how you make decisions.' },
  { label: '[ROAD]',      text: 'Numerology — your Life Path, current Pinnacle, Challenges, and (with your full name) your complete name-based blueprint.' },
  { label: '[STOPLIGHT]', text: 'Dual-Zodiac Astrology — your Tropical and Sidereal Big Three, read together as two complementary lenses on the same chart.' },
  { label: '[SYNTHESIS]', text: 'A synthesis written specifically for your exact configuration, plus a printable Sovereign Navigation Card for quick reference.' },
] as const;

const ADVANCED_INCLUDES = [
  { label: '[VEHICLE]',     text: 'The Vehicle, deepened — every active gate and channel, your bridges, your full circuitry, your Incarnation Cross, and your Godhead, Light & Shadow.' },
  { label: '[ROAD]',        text: 'The Road, deepened — your Hidden Passion and Karmic Lessons, plus all Four Pinnacles and Four Challenges across your whole life, not just your current season.' },
  { label: '[STOPLIGHT]',   text: 'The Stoplight, deepened — Mercury, Venus, Mars, Jupiter, and Saturn by sign; Uranus, Neptune, and Pluto by house; plus your live, currently-active transits.' },
  { label: '[INTEGRATION]', text: 'The Integration — how all three systems stack into one decision hierarchy, where people usually get the order wrong, and a synthesis written for your exact configuration.' },
] as const;

const COMPLETE_INCLUDES = [
  { label: '[BASE]',     text: 'The full Base Report — all three systems, Human Design, Numerology, and Astrology, woven into one navigation guide.' },
  { label: '[ADVANCED]', text: 'The full Advanced Report — every gate and channel, all Four Pinnacles and Challenges, every personal and outer planet, plus your live transits.' },
  { label: '[FORMAT]',   text: 'Both complete reports, delivered together as one download — nothing held back, nothing to unlock later.' },
  { label: '[VALUE]',    text: 'The same $97 as buying both separately ($44 + $53) — priced as one purchase because this is the version most people actually want.' },
] as const;

interface IncludeItem { label: string; text: string; }

const INCLUDES_BY_SLUG: Record<string, readonly IncludeItem[]> = {
  'base-report':               BASE_INCLUDES,
  'advanced-sovereign-report': ADVANCED_INCLUDES,
  'sovereign-report':          COMPLETE_INCLUDES,
};

// Headline + price-row subtitle, same per-slug pattern. Falls back to the
// complete bundle's copy for an unrecognized slug — matches productSlug's
// own fallback below ('sovereign-report' when ?product= is missing).
const HEADLINE_BY_SLUG: Record<string, string> = {
  'base-report':               'Unlock your Base Report.',
  'advanced-sovereign-report': 'Complete your Sovereign Report.',
  'sovereign-report':          'Unlock your complete Sovereign Report.',
};

const SUBTITLE_BY_SLUG: Record<string, string> = {
  'base-report':               '40+ PAGES · INSTANT DELIVERY · ONE-TIME',
  'advanced-sovereign-report': '38 PAGES · INSTANT DELIVERY · ONE-TIME',
  'sovereign-report':          '80+ PAGES · TWO COMPLETE REPORTS · ONE-TIME',
};

// ─── Inner payment form (must live inside <Elements>) ─────────────────────────
function CheckoutForm({ email, leadId, orderId, productSlug, priceLabel }: { email: string; leadId: number | null; orderId: number | null; productSlug: string; priceLabel: string }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');

    const returnUrl = `${window.location.origin}/report?leadId=${leadId ?? ''}` + (orderId ? `&orderId=${orderId}` : '') + `&product=${encodeURIComponent(productSlug)}`;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:    returnUrl,
        receipt_email: email || undefined,
      },
    });

    // Only reaches here if there was an error — Stripe redirects on success
    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div style={{
          padding: '12px 16px',
          border: '1px solid var(--crimson)',
          background: 'rgba(153,27,27,0.08)',
        }}>
          <p className="t3d-label" style={{ color: 'var(--crimson-hi)' }}>⚠ {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || busy}
        className="t3d-cta"
        style={{ opacity: busy ? 0.65 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}
      >
        {busy ? 'PROCESSING…' : `PAY ${priceLabel} — UNLOCK MY REPORT`}
      </button>

      <p className="t3d-label" style={{ textAlign: 'center', color: 'var(--parchment-40)' }}>
        SECURED BY STRIPE · 256-BIT ENCRYPTION · NO CARD DATA STORED
      </p>
    </form>
  );
}

// ─── Main checkout page ────────────────────────────────────────────────────────
// useSearchParams() requires a Suspense boundary in the App Router, or the
// whole route silently deopts to client-only rendering — so the actual page
// body lives in CheckoutPageInner and this just wraps it.
export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const { results } = useT3DStore();
  const leadId = results?.leadId ?? null;

  const searchParams = useSearchParams();
  const productSlug   = searchParams.get('product') || 'sovereign-report';

  const [clientSecret, setClientSecret] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [email,        setEmail]        = useState('');
  const [product,      setProduct]      = useState<ProductInfo | null>(null);
  const [orderId,      setOrderId]      = useState<number | null>(null);

  const priceDollars = Math.round((product?.priceCents ?? 4400) / 100);
  const priceLabel   = `$${priceDollars}`;
  const productName  = product?.name ?? 'Sovereign Report';

  useEffect(() => {
    // Read from localStorage inside useEffect — localStorage is unavailable during SSR
    const savedEmail = localStorage.getItem('t3d_email') ?? '';
    const savedName  = localStorage.getItem('t3d_name')  ?? '';
    setEmail(savedEmail);

    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            email: savedEmail,
            name:  savedName,
            productSlug,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) {
          throw new Error(data.error ?? 'Failed to initialize checkout.');
        }
        setClientSecret(data.clientSecret);
        if (data.product) setProduct(data.product as ProductInfo);
        if (typeof data.orderId === 'number') setOrderId(data.orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [leadId, productSlug]);

  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: 'clamp(48px,7vh,88px) clamp(20px,4vw,48px)',
        }}>

          {/* Page header */}
          <div style={{ marginBottom: 'clamp(32px,5vh,52px)' }}>
            <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 12 }}>
              [CHECKOUT] — {productName.toUpperCase()}
            </p>
            <h1 className="t3d-h2">
              {HEADLINE_BY_SLUG[productSlug] ?? `Unlock your ${productName}.`}
            </h1>
          </div>

          <div className="t3d-divider" style={{ marginBottom: 'clamp(32px,5vh,52px)' }} />

          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(32px,5vw,64px)',
            alignItems: 'start',
          }}>

            {/* LEFT — Order summary */}
            <div>
              <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 20 }}>
                [ORDER.SUMMARY]
              </p>

              {/* Price row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '20px 0',
                borderTop:    '1px solid var(--card-border)',
                borderBottom: '1px solid var(--card-border)',
                marginBottom: 28,
              }}>
                <div>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.1rem,2vw,1.4rem)',
                    color: 'var(--parchment)',
                    fontWeight: 400,
                  }}>
                    T3D {productName}
                  </p>
                  <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginTop: 4 }}>
                    {SUBTITLE_BY_SLUG[productSlug] ?? 'INSTANT DELIVERY · ONE-TIME'}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.6rem,2.5vw,2.2rem)',
                  color: 'var(--amber)',
                  fontWeight: 400,
                }}>
                  {priceLabel}
                </span>
              </div>

              {/* Includes list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(() => {
                  const includes = INCLUDES_BY_SLUG[productSlug] ?? COMPLETE_INCLUDES;
                  return includes.map((item, i) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    padding: '14px 0',
                    borderBottom: i < includes.length - 1 ? '1px solid var(--card-border)' : 'none',
                  }}>
                    <span style={{
                      flexShrink: 0, width: 20, height: 20,
                      background: 'rgba(229,169,60,0.12)',
                      border: '1px solid rgba(229,169,60,0.3)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <svg viewBox="0 0 12 12" fill="none" width={10} height={10} aria-hidden>
                        <path d="M2 6l3 3 5-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="t3d-label" style={{ color: 'var(--amber)', marginBottom: 3 }}>
                        {item.label}
                      </p>
                      <p className="t3d-body" style={{ fontSize: 13 }}>{item.text}</p>
                    </div>
                  </div>
                  ));
                })()}
              </div>

              {/* Back link */}
              <div style={{ marginTop: 32 }}>
                <Link href="/#calculator" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  color: 'var(--parchment-40)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  ← Back to calculator
                </Link>
              </div>
            </div>

            {/* RIGHT — Stripe payment form */}
            <div>
              <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 20 }}>
                [PAYMENT.SECURE]
              </p>

              <div style={{
                border: '1px solid var(--card-border)',
                background: 'rgba(13,13,14,0.88)',
                padding: 'clamp(24px,3vw,36px)',
              }}>
                {/* Loading state */}
                {loading && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p className="t3d-label" style={{
                      color: 'var(--parchment-40)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                      INITIALIZING SECURE CHECKOUT…
                    </p>
                  </div>
                )}

                {/* Error state */}
                {error && !loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p className="t3d-label" style={{ color: 'var(--crimson-hi)' }}>⚠ {error}</p>
                    <p className="t3d-body" style={{ fontSize: 13 }}>
                      There was a problem setting up checkout. Please complete
                      the calculator first, then return here.
                    </p>
                    <Link
                      href="/#calculator"
                      className="t3d-ghost"
                      style={{ width: 'auto', padding: '12px 24px', marginTop: 8 }}
                    >
                      ← BACK TO CALCULATOR
                    </Link>
                  </div>
                )}

                {/* Payment form */}
                {clientSecret && !loading && (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, ...APPEARANCE }}
                  >
                    <CheckoutForm email={email} leadId={leadId} orderId={orderId} productSlug={productSlug} priceLabel={priceLabel} />
                  </Elements>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
