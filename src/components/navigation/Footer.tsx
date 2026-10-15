import Image from 'next/image';
import Link from 'next/link';

const CONTACT_EMAIL = 'privacy@3dimensions.guide';

const COLUMNS: readonly { heading: string; links: readonly { href: string; label: string; external?: boolean }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { href: '/#framework', label: 'How it works' },
      { href: '/#calculator', label: 'Free calculator' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: `mailto:${CONTACT_EMAIL}`, label: 'Contact us', external: true },
      { href: '/privacy', label: 'Privacy policy' },
    ],
  },
];

const linkStyle = {
  display: 'flex', alignItems: 'center', minHeight: 44,
  fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem',
  color: 'var(--parchment-70)', textDecoration: 'none',
} as const;

const headingStyle = {
  fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500,
  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--parchment-40)', marginBottom: 8,
} as const;

/**
 * Site footer. Three columns on a wide screen, stacking on a phone. Every link is at least 44px tall to tap,
 * and text uses the page's own colours (no custom variables), so it passes the same contrast checks as the rest.
 */
export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--grid-line)' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: 'clamp(32px,6vh,64px) clamp(20px,4vw,40px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(28px,4vw,56px)',
      }}>
        <div style={{ maxWidth: 360 }}>
          <Link href="/" aria-label="The 3 Dimensions, home">
            <Image src="/logos/T3D_monogram.png" alt="T3D" width={48} height={48} style={{ mixBlendMode: 'lighten', marginBottom: 14 }} />
          </Link>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--parchment-70)' }}>
            T3D is a reflective self-navigation tool. Read it as a lens, not a mandate. For reflection and
            entertainment only. Not medical, psychological, legal or financial advice.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p style={headingStyle}>{col.heading}</p>
            {col.links.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} style={linkStyle}>{l.label}</a>
              ) : (
                <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
              ),
            )}
          </nav>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--grid-line)' }}>
        <p style={{
          maxWidth: 1200, margin: '0 auto', padding: '20px clamp(20px,4vw,40px)',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--parchment-40)',
        }}>
          © {new Date().getFullYear()} T3D Studio. 3dimensions.guide
        </p>
      </div>
    </footer>
  );
}
