import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--grid)' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid var(--grid)',
      }}>
        {/* Brand */}
        <div style={{ padding: 'clamp(24px,4vh,40px)', borderRight: '1px solid var(--grid)' }}>
          <Link href="/" aria-label="The 3 Dimensions">
            <Image src="/logos/T3D_monogram.png" alt="T3D" width={48} height={48}
              style={{ mixBlendMode: 'lighten', marginBottom: 12 }} />
          </Link>
          <p className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--parchment-faint)', letterSpacing: '0.12em', lineHeight: 1.6 }}>
            T3D is a reflective self-navigation tool.<br />
            Read it as a lens, not a mandate.
          </p>
        </div>

        {/* Links */}
        <div style={{ padding: 'clamp(24px,4vh,40px)', borderRight: '1px solid var(--grid)' }}>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--parchment-faint)', letterSpacing: '0.16em', display: 'block', marginBottom: 16 }}>
            [NAVIGATION]
          </span>
          {[
            { href: '/calculator', label: 'Calculator'   },
            { href: '/report',     label: 'Full Report'  },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              display: 'block', fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.72rem', color: 'var(--parchment-faint)',
              letterSpacing: '0.08em', textDecoration: 'none', marginBottom: 8,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--parchment)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--parchment-faint)'; }}
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ padding: 'clamp(24px,4vh,40px)' }}>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--parchment-faint)', letterSpacing: '0.16em', display: 'block', marginBottom: 16 }}>
            [SYSTEM.STATUS]
          </span>
          <p className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--parchment-faint)', letterSpacing: '0.08em', lineHeight: 1.7 }}>
            3dimensions.guide<br />
            © {new Date().getFullYear()} T3D Studio<br />
            ALL SYSTEMS OPERATIONAL
          </p>
        </div>
      </div>
    </footer>
  );
}
