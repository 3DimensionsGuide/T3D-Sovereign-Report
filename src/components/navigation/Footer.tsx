/**
 * T3D Footer — monogram, nav links, disclaimer.
 */
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(61,42,92,0.4)',
        padding: 'clamp(32px,5vh,56px) 0 clamp(32px,5vh,48px)',
        marginTop: 'clamp(40px,6vh,80px)',
      }}
    >
      <div style={{
        maxWidth: 1140, margin: '0 auto',
        padding: '0 clamp(20px,5vw,48px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>

        {/* Brand */}
        <Link href="/" aria-label="The 3 Dimensions home" style={{ textDecoration: 'none' }}>
          <Image
            src="/logos/T3D_monogram.png"
            alt="T3D"
            width={52}
            height={52}
            style={{ mixBlendMode: 'lighten' }}
          />
        </Link>

        {/* Disclaimer */}
        <p style={{
          color: 'var(--ink-faint)',
          fontSize: '0.78rem',
          maxWidth: '44ch',
          lineHeight: 1.65,
        }}>
          T3D is a reflective self-navigation tool. Human Design, Numerology, and
          Astrology are presented as a unified lens — not as predictions or professional
          advice. Read it as a map, not a mandate.
        </p>

        {/* Links + copyright */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { href: '/calculator', label: 'Calculator' },
              { href: '/report',     label: 'Full Report' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', textDecoration: 'none' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} T3D Studio
          </p>
        </div>
      </div>
    </footer>
  );
}
