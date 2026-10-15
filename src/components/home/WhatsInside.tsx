import Link from 'next/link';
import { PRODUCT_DISPLAY } from '@/lib/products/catalog';

/**
 * WhatsInside: a plain look at what a report contains, so a visitor knows what they would get before paying.
 * Reads the Base Report list from the product catalog, so the wording never drifts from the pricing page.
 * Server component: no hooks, no motion. Each lens carries a shape and a name as well as its colour.
 */

const TINTS: Record<string, { glyph: string; accent: string; text: string; name: string }> = {
  Vehicle: { glyph: '◆', accent: 'var(--amber)', text: 'var(--amber)', name: 'The Vehicle' },
  Road: { glyph: '▲', accent: 'var(--emerald)', text: '#4FBF7F', name: 'The Road' },
  Stoplight: { glyph: '●', accent: 'var(--crimson)', text: '#F58A87', name: 'The Stoplight' },
};

export default function WhatsInside() {
  const base = PRODUCT_DISPLAY['base-report'];
  return (
    <section
      id="inside"
      aria-labelledby="inside-heading"
      style={{ padding: 'clamp(56px,10vh,120px) clamp(20px,4vw,64px)', background: 'var(--base)', position: 'relative' }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p className="t3d-label" style={{ marginBottom: 20 }}>Inside your report</p>
        <h2 id="inside-heading" className="t3d-h2" style={{ maxWidth: '24ch', marginBottom: 24 }}>
          One guide, written for your exact birth details.
        </h2>
        <p className="t3d-body" style={{ maxWidth: 640, marginBottom: 'clamp(32px,6vh,56px)' }}>
          The Base Report is the place to start. It is a PDF you download after you pay, and it is also emailed to you.
          The Advanced Report goes deeper into the same three systems.
        </p>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
          {base.includes.map((item) => {
            const key = item.label.charAt(0).toUpperCase() + item.label.slice(1);
            const tint = TINTS[key];
            return (
              <article
                key={item.label}
                className="t3d-card"
                style={{ padding: 'clamp(20px,3vw,28px)', borderLeft: `3px solid ${tint ? tint.accent : 'var(--parchment-40)'}` }}
              >
                <p className="t3d-label" style={{ color: tint ? tint.text : 'var(--parchment-70)', marginBottom: 12 }}>
                  <span aria-hidden>{tint ? `${tint.glyph} ` : ''}</span>
                  {tint ? tint.name : key}
                </p>
                <p className="t3d-body" style={{ color: 'var(--parchment)' }}>{item.text}</p>
              </article>
            );
          })}
        </div>

        <p className="t3d-body" style={{ maxWidth: 640, marginTop: 'clamp(24px,4vh,40px)' }}>
          Want to compare depths first?{' '}
          <Link href="/pricing" style={{ color: 'var(--parchment)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
            See the three reports side by side
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
