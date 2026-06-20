'use client';

/**
 * T3D Navigation — sticky, blur-frosted, scroll-spy active links.
 * Uses the T3D Seal logo from /public/logos/T3D_seal.png.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/#triad',     label: 'The Triad'  },
  { href: '/calculator', label: 'Calculator' },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'var(--nav-h)',
        display: 'flex',
        alignItems: 'center',
        background: scrolled
          ? 'rgba(11,11,12,0.82)'
          : 'rgba(11,11,12,0.6)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid rgba(61,42,92,0.5)',
        transition: 'background 0.3s var(--ease)',
      }}
    >
      <div style={{
        maxWidth: 1140, margin: '0 auto',
        padding: '0 clamp(20px,5vw,48px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Brand */}
        <Link
          href="/"
          aria-label="The 3 Dimensions — home"
          style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}
        >
          <Image
            src="/logos/T3D_seal.png"
            alt="T3D seal"
            width={44}
            height={44}
            priority
            style={{
              borderRadius: '50%',
              mixBlendMode: 'lighten',
              transition: 'filter 0.2s var(--ease)',
            }}
          />
          <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.2 }}>
              T3D
            </span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontWeight: 500 }}>
              Navigation System
            </span>
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '0.86rem',
                fontWeight: 500,
                color: pathname === link.href ? 'var(--gold-soft)' : 'var(--ink-dim)',
                padding: '8px 14px',
                borderRadius: 8,
                minHeight: 40,
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'color 0.2s var(--ease), background 0.2s var(--ease)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(125,95,184,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  pathname === link.href ? 'var(--gold-soft)' : 'var(--ink-dim)';
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* CTA */}
          <Link
            href="/calculator"
            style={{
              marginLeft: 8,
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--obsidian)',
              background: 'var(--gold)',
              padding: '10px 18px',
              borderRadius: 9,
              minHeight: 42,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'transform 0.18s var(--ease), filter 0.18s var(--ease)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.07)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLAnchorElement).style.filter = 'none';
            }}
          >
            Get My Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
