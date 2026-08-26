'use client';

/**
 * T3D Checkout Page — /checkout
 *
 * Flow:
 *   1. Page mounts → reads leadId + email from Zustand store
 *   2. Calls /api/stripe/create-payment-intent → gets clientSecret
 *   3. Stripe Elements renders the card form
 *   4. User submits → stripe.confirmPayment()
 *   5. On success → redirects to /report
 *
 * Uses Stripe PaymentElement for automatic 3D Secure, Apple Pay, Google Pay.
 */

import { useState, useEffect } from 'react';
import { loadStripe }          from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link    from 'next/link';
import Nav     from '@/components/navigation/Nav';
import Footer  from '@/components/navigation/Footer';
import { useT3DStore } from '@/store/useT3DStore';

// ── Load Stripe (once, outside component so it doesn't reload) ────────────────
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Stripe Element appearance — matches T3D design system ─────────────────────
const STRIPE_APPEARANCE: Parameters<typeof Elements>[0]['options'] = {
  appearance: {
    theme: 'night',
    variables: {
      colorPrimary:         '#991B1B',
      colorBackground:      '#111113',
      colorText:            '#F5F5F3',
      colorDanger:          '#B91C1C',
      fontFamily:           "'DM Sans', system-ui, sans-serif",
      borderRadius:         '0px',
      spacingUnit:          '5px',
    },
    rules: {
      '.Input': {
        border:           '1px solid rgba(245,245,243,0.15)',
        backgroundColor:  '#111113',
        color:            '#F5F5F3',
        fontSize:         '16px',
        padding:          '14px',
      },
      '.Input:focus': {
        border:    '1px solid #F5F5F3',
        boxShadow: 'none',
        outline:   'none',
      },
      '.Label': {
        color:         'rgba(245,245,243,0.40)',
        fontSize:      '10px',
        fontWeight:    '500',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom:  '8px',
      },
      '.Error': {
        color:     '#B91C1C',
        fontSize:  '12px',
        marginTop: '6px',
      },
    },
  },
};

// ── What's included list ───────────────────────────────────────────────────────
const INCLUDES = [
  { label: '[HD.FULL]',  text: 'Complete Human Design Bodygraph — all 9 centers, 36 channels, 64 gates' },
  { label: '[NUM.FULL]', text: 'Full Numerology Blueprint — life path, expression, soul urge, all pinnacles' },
  { label: '[AST.FULL]', text: '12-Month Transit Calendar — go, caution, and stop windows mapped to your chart' },
  { label: '[INT.FULL]', text: 'Integrated Navigation Guide — how all three dimensions read together' },
] as const;

// ── Inner checkout form (must be inside <Elements>) ────────────────────────────
function CheckoutForm({ email, name }: { email: string; name: string }) {
  const stripe   = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMsg('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:    `${window.location.origin}/report`,
        receipt_email: email,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
    });

    // If confirmPayment resolves without redirect it means there was an error
    if (error) {
      setErrorMsg(error.message ?? 'Payment failed. Please try again.');
      setIsLoading(false);
    }
    // On success, Stripe redirects to /report automatically
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PaymentElement
        options={{ layout: 'tabs' }}
      />

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          border: '1px solid var(--crimson)',
          background: 'rgba(153,27,27,0.08)',
        }}>
          <p className="t3d-label" style={{ color: 'var(--crimson-hi)' }}>⚠ {errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="t3d-cta"
        style={{
          opacity: (!stripe || isLoading) ? 0.6 : 1,
          cursor:  (!stripe || isLoading) ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'PROCESSING…' : 'PAY $97 — UNLOCK MY REPORT'}
      </button>

      <p className="t3d-label" style={{ textAlign: 'center', color: 'var(--parchment-40)' }}>
        SECURED BY STRIPE · 256-BIT ENCRYPTION · NO CARD DATA STORED
      </p>
    </form>
  );
}

// ── Main checkout page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { results } = useT3DStore();

  const [clientSecret, setClientSecret] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Derive email + name from the store results (set when calculator ran)
  // These are stored in leads table — for display we use what we have
  const leadId = results?.leadId ?? null;

  // Fetch clientSecret on mount
  useEffect(() => {
    async function init() {
      try {
        const res  = await fetch('/api/stripe/create-payment-intent', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            email: '', // Will be collected by Stripe PaymentElement
            name:  '',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) {
          throw new Error(data.error ?? 'Failed to initialize checkout.');
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [leadId]);

  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: 'clamp(48px,7vh,88px) clamp(20px,4vw,48px)',
        }}>

          {/* Page header */}
          <div style={{ marginBottom: 'clamp(36px,5vh,56px)' }}>
            <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 12 }}>
              [CHECKOUT] — SOVEREIGN REPORT
            </p>
            <h1 className="t3d-h2">
              Unlock your full 100-page report.
            </h1>
          </div>

          <div className="t3d-divider" style={{ marginBottom: 'clamp(36px,5vh,56px)' }} />

          {/* Two-column: order summary + payment form */}
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

              {/* Price block */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '20px 0',
                borderTop:    '1px solid var(--card-border)',
                borderBottom: '1px solid var(--card-border)',
                marginBottom: 28,
              }}>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: 'var(--parchment)', fontWeight: 400 }}>
                    T3D Sovereign Report
                  </p>
                  <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginTop: 4 }}>
                    100 PAGES · INSTANT DELIVERY · ONE-TIME
                  </p>
                </div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'var(--amber)', fontWeight: 400 }}>
                  $97
                </span>
              </div>

              {/* Includes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {INCLUDES.map((item, i) => (
                  <div key={item.label} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '14px 0',
                    borderBottom: i < INCLUDES.length - 1 ? '1px solid var(--card-border)' : 'none',
                  }}>
                    <span style={{
                      flexShrink: 0,
                      width: 20, height: 20,
                      background: 'rgba(229,169,60,0.12)',
                      border: '1px solid rgba(229,169,60,0.3)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <svg viewBox="0 0 12 12" fill="none" width={10} height={10} aria-hidden>
                        <path d="M2 6l3 3 5-5" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <div>
                      <p className="t3d-label" style={{ color: 'var(--amber)', marginBottom: 3 }}>{item.label}</p>
                      <p className="t3d-body" style={{ fontSize: 13 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Back link */}
              <div style={{ marginTop: 32 }}>
                <Link href="/#calculator" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.78rem', letterSpacing: '0.12em',
                  color: 'var(--parchment-40)', textDecoration: 'none',
                  textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
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
                {loading && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p className="t3d-label" style={{ color: 'var(--parchment-40)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                      INITIALIZING SECURE CHECKOUT…
                    </p>
                  </div>
                )}

                {error && (
                  <div style={{ padding: '16px', border: '1px solid var(--crimson)', background: 'rgba(153,27,27,0.08)' }}>
                    <p className="t3d-label" style={{ color: 'var(--crimson-hi)' }}>⚠ {error}</p>
                    <p className="t3d-body" style={{ fontSize: 13, marginTop: 8 }}>
                      Please go back and complete the calculator first, then return to checkout.
                    </p>
                  </div>
                )}

                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      ...STRIPE_APPEARANCE,
                    }}
                  >
                    <CheckoutForm email="" name="" />
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
