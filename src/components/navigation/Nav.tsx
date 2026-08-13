'use client';

/**
 * T3D Navigation — Mobile-first responsive
 *
 * Desktop (≥768px): Logo + links + crimson CTA button in one row
 * Mobile  (<768px): Logo + hamburger → full-screen slide-down menu
 *
 * The hamburger animates: three lines → X on open
 * Menu overlay: dark frosted panel, large tap targets, crimson CTA at bottom
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/#system',    label: 'The System'  },
  { href: '/#calculator', label: 'Calculator' },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  // ── Scroll detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Mobile detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Lock body scroll when menu open ───────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Close menu on route change ─────────────────────────────────────────────
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* ── NAV BAR ──────────────────────────────────────────────────────── */}
      <nav
        aria-label="Primary navigation"
        style={{
          position:   'sticky',
          top:        0,
          zIndex:     100,
          height:     64,
          display:    'flex',
          alignItems: 'center',
          background: scrolled || menuOpen
            ? 'rgba(13,13,14,0.97)'
            : 'rgba(13,13,14,0.75)',
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${
            scrolled ? 'rgba(245,245,243,0.12)' : 'rgba(245,245,243,0.06)'
          }`,
          transition: 'background 0.3s var(--ease), border-color 0.3s var(--ease)',
        }}
      >
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 clamp(16px,4vw,40px)',
          width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <Link
            href="/"
            aria-label="The 3 Dimensions — home"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            onClick={closeMenu}
          >
            <Image
              src="/logos/T3D_seal.png"
              alt="T3D Seal"
              width={36} height={36}
              style={{ mixBlendMode: 'lighten' }}
              priority
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '0.95rem', fontWeight: 600,
                color: 'var(--parchment)', letterSpacing: '0.02em',
              }}>
                T3D
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.55rem', letterSpacing: '0.18em',
                color: 'var(--parchment-40)', textTransform: 'uppercase',
              }}>
                Navigation System
              </span>
            </div>
          </Link>

          {/* ── Desktop links ─────────────────────────────────────────────── */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.78rem', fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--parchment-40)',
                    padding: '8px 14px',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'color 0.2s var(--ease)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--parchment)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--parchment-40)'; }}
                >
                  {l.label}
                </Link>
              ))}

              <Link
                href="/#calculator"
                className="t3d-cta"
                style={{ marginLeft: 12, width: 'auto', padding: '10px 20px', minHeight: 40 }}
              >
                CALCULATE FREE
              </Link>
            </div>
          )}

          {/* ── Mobile hamburger button ────────────────────────────────────── */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '10px',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', gap: 5,
                width: 44, height: 44,
              }}
            >
              {/* Line 1 */}
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--parchment)',
                transformOrigin: 'center',
                transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                transition: 'transform 0.25s var(--ease)',
              }} />
              {/* Line 2 */}
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--parchment)',
                opacity: menuOpen ? 0 : 1,
                transition: 'opacity 0.2s var(--ease)',
              }} />
              {/* Line 3 */}
              <span style={{
                display: 'block', width: 22, height: 1.5,
                background: 'var(--parchment)',
                transformOrigin: 'center',
                transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                transition: 'transform 0.25s var(--ease)',
              }} />
            </button>
          )}
        </div>
      </nav>

      {/* ── MOBILE FULL-SCREEN MENU ────────────────────────────────────────── */}
      {isMobile && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 64, // below nav bar
            left: 0, right: 0, bottom: 0,
            zIndex: 99,
            background: 'rgba(13,13,14,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(32px,6vh,56px) clamp(24px,6vw,40px)',
            // Slide animation
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(-16px)',
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'opacity 0.28s var(--ease), transform 0.28s var(--ease)',
          }}
        >
          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2rem,8vw,3rem)',
                  fontWeight: 400,
                  color: 'var(--parchment)',
                  textDecoration: 'none',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--card-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  // Stagger animation
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 0.3s var(--ease) ${0.1 + i * 0.06}s, transform 0.3s var(--ease) ${0.1 + i * 0.06}s`,
                }}
              >
                {l.label}
                <span style={{ color: 'var(--parchment-40)', fontSize: '1.2rem' }}>→</span>
              </Link>
            ))}
          </div>

          {/* Bottom — CTA + system label */}
          <div style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.3s var(--ease) 0.25s, transform 0.3s var(--ease) 0.25s',
          }}>
            <Link
              href="/#calculator"
              onClick={closeMenu}
              className="t3d-cta"
              style={{ marginBottom: 24 }}
            >
              CALCULATE MY PROFILE — FREE
            </Link>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--parchment-40)',
              textAlign: 'center',
            }}>
              Human Design · Numerology · Astrology
            </p>
          </div>
        </div>
      )}
    </>
  );
}
