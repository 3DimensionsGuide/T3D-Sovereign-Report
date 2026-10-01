/**
 * T3D Pricing Page — /pricing
 *
 * Server Component: fetches the live `products` rows (DB is the price/
 * name/description source of truth) and merges them with PRODUCT_DISPLAY
 * (src/lib/products/catalog.ts) for the marketing copy the DB doesn't
 * carry — tagline, "what's included," CTA verb. If a price in the DB
 * ever drifts from catalog.ts's static priceLabel, the DB wins for the
 * big display number; catalog.ts is cosmetic copy only.
 *
 * No client interactivity needed — every CTA is a plain <Link> to
 * /?product=<slug>#calculator. ProductSelectionSync (rendered on the
 * homepage) picks the slug up from that URL and stores it, so it
 * survives through the calculator into checkout. Keeping this page a
 * pure Server Component (no 'use client') is also the fastest possible
 * LCP for a page whose entire job is to get a visitor to decide.
 *
 * Forced dynamic (see `dynamic` export below): without it, Next.js
 * tries to statically prerender this page at `next build` time, which
 * means every production build would require a live, fully-migrated
 * DB connection just to compile — fragile, and wrong anyway since
 * pricing should always reflect the live `products` table, not a
 * snapshot frozen at the last build.
 */

import Link from 'next/link';
import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import { getActiveProducts } from '@/lib/products/queries';
import { PRODUCT_DISPLAY, PRODUCT_ORDER } from '@/lib/products/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pricing — The 3 Dimensions',
  description: 'Choose your depth: the Base Report, the Advanced Report, or the complete Sovereign Report.',
};

export default async function PricingPage() {
  const dbProducts = await getActiveProducts();
  const bySlug = new Map(dbProducts.map((p) => [p.slug, p]));

  // Walk PRODUCT_ORDER (not the DB rows) so display order is deliberate
  // and stable — DB rows without a catalog.ts entry, or an inactive/
  // missing DB row, are simply skipped rather than breaking the page.
  const tiers = PRODUCT_ORDER
    .map((slug) => {
      const dbProduct = bySlug.get(slug);
      const display   = PRODUCT_DISPLAY[slug];
      if (!dbProduct || !display) return null;
      return { dbProduct, display };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <>
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(56px,9vh,120px) clamp(20px,4vw,48px) clamp(80px,10vh,140px)',
        }}>

          {/* ── Page header ──────────────────────────────────────────────── */}
          <div style={{ maxWidth: 680, marginBottom: 'clamp(48px,7vh,80px)' }}>
            <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 16 }}>
              [PRICING] — THREE WAYS IN
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(32px,5vw,52px)',
              fontWeight: 400,
              color: 'var(--parchment)',
              lineHeight: 1.15,
              marginBottom: 20,
            }}>
              Choose your depth.
            </h1>
            <p className="t3d-body" style={{ fontSize: 16 }}>
              Every tier is built from your exact birth data — the Vehicle, the Road,
              and the Stoplight, read at the depth you want. Start with the entry
              point, go deeper on your own terms, or get the complete framework
              from the start.
            </p>
          </div>

          {/* ── Tier cards ───────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(20px,3vw,28px)',
            alignItems: 'start',
          }}>
            {tiers.map(({ dbProduct, display }) => (
              <div
                key={display.slug}
                className="t3d-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'clamp(28px,3.5vw,36px)',
                  ...(display.featured
                    ? {
                        borderColor: 'var(--amber)',
                        borderWidth: 1.5,
                        background: 'rgba(229,169,60,0.04)',
                      }
                    : {}),
                }}
              >
                {display.featured && (
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--base)',
                    background: 'var(--amber)',
                    alignSelf: 'flex-start',
                    padding: '5px 12px',
                    marginBottom: 20,
                  }}>
                    Most Complete
                  </span>
                )}

                <p className="t3d-label" style={{
                  color: display.featured ? 'var(--amber)' : 'var(--parchment-40)',
                  marginBottom: 14,
                }}>
                  {display.eyebrow}
                </p>

                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(24px,2.6vw,30px)',
                  fontWeight: 400,
                  color: 'var(--parchment)',
                  marginBottom: 12,
                }}>
                  {dbProduct.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
                  <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(32px,4vw,40px)',
                    fontWeight: 400,
                    color: display.featured ? 'var(--amber)' : 'var(--parchment)',
                  }}>
                    ${Math.round(dbProduct.priceCents / 100)}
                  </span>
                  <span className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
                    one-time
                  </span>
                </div>

                <p className="t3d-body" style={{ fontSize: 14.5, marginBottom: 26 }}>
                  {display.tagline}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28, flex: 1 }}>
                  {display.includes.map((item, i) => (
                    <div key={item.label} style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      padding: '11px 0',
                      borderBottom: i < display.includes.length - 1 ? '1px solid var(--card-border)' : 'none',
                    }}>
                      <span className="t3d-label" style={{ color: 'var(--parchment-40)', flexShrink: 0, width: 78, fontSize: 9.5 }}>
                        {item.label}
                      </span>
                      <span className="t3d-body" style={{ fontSize: 13, margin: 0 }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/?product=${display.slug}#calculator`}
                  className="t3d-cta"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    ...(display.featured
                      ? { background: 'var(--amber)', borderColor: 'var(--amber)', color: 'var(--base)' }
                      : {}),
                  }}
                >
                  {display.ctaLabel}
                </Link>
              </div>
            ))}
          </div>

          {/* ── Explainer: how the tiers relate ─────────────────────────── */}
          <div style={{
            marginTop: 'clamp(56px,7vh,80px)',
            paddingTop: 'clamp(32px,4vh,44px)',
            borderTop: '1px solid var(--card-border)',
            maxWidth: 680,
          }}>
            <p className="t3d-label" style={{ color: 'var(--emerald)', marginBottom: 14 }}>
              [HOW THE TIERS FIT TOGETHER]
            </p>
            <p className="t3d-body" style={{ fontSize: 15 }}>
              Already have the Base Report? The Advanced Report completes it into
              the full Sovereign Report for $53 — the same $97 total either way,
              whether you buy everything now or go deeper later.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
