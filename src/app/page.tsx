'use client';

/**
 * T3D Homepage — Design Polish · Surgical Upgrade
 *
 * Changes applied (frontend presentation only — no engine/API changes):
 *   UPGRADE 1 — DM Sans body + Playfair Display headlines
 *   UPGRADE 2 — Exact spacing: hero 160/200px, sections asymmetric
 *   UPGRADE 3 — Asymmetric 60/40 hero split (content left / compass right)
 *   UPGRADE 4 — Sharp card borders, zero radius, no shadows
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import SovereignCompassCanvas, { type SovereignCompassHandle } from '@/components/SovereignCompassCanvas';
import { useT3DStore } from '@/store/useT3DStore';
import CalculatorForm from '@/components/calculator/CalculatorForm';

// ─── SCROLL HOOK ──────────────────────────────────────────────────────────────
function useScroll() {
  const [progress, setProgress] = useState(0);
  const rafRef  = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    function update() {
      const p = Math.min(Math.max(
        window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1),
        0), 1);
      setProgress(p);
      ticking.current = false;
    }
    function onScroll() {
      if (!ticking.current) {
        rafRef.current = requestAnimationFrame(update);
        ticking.current = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return progress;
}

// ─── DIMENSION DATA ───────────────────────────────────────────────────────────
const DIMENSIONS = [
  {
    label:  'THE VEHICLE',
    system: 'Human Design',
    body:   'Your energy type, strategy, authority, and defined centers — the precision machinery beneath every decision.',
    color:  'var(--amber)',
    flash:  'flash-vehicle',
  },
  {
    label:  'THE ROAD',
    system: 'Numerology',
    body:   'Your life path, destiny, and active pinnacle — the geometric trajectory your numbers have been tracing.',
    color:  'var(--emerald)',
    flash:  'flash-road',
  },
  {
    label:  'THE STOPLIGHT',
    system: 'Astrology',
    body:   'Your natal chart, current transits, and timing gates — the sky\'s precise signal for when to move.',
    color:  'var(--crimson)',
    flash:  'flash-stoplight',
  },
] as const;

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const scrollProgress = useScroll();
  const compassRef     = useRef<SovereignCompassHandle>(null);
  const { results }    = useT3DStore();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Trigger results transition on compass
  useEffect(() => {
    if (results) compassRef.current?.triggerResultsTransition();
  }, [results]);

  const handleCalculate = useCallback(() => {
    compassRef.current?.triggerCalculation();
  }, []);

  return (
    <>
      <Nav />

      {/* ── Fixed 3D Compass Layer ─────────────────────────────────────────── */}
      <SovereignCompassCanvas ref={compassRef} scrollProgress={scrollProgress} />

      <main style={{ position: 'relative', zIndex: 10, paddingTop: isMobile ? 220 : 0 }}>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
            UPGRADE 2: padding-top 160px / padding-bottom 200px
            UPGRADE 3: Asymmetric 60/40 split — content left, compass right
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          style={{
            minHeight: '100vh',
            paddingTop:    isMobile ? 48 : 'var(--hero-pt)',
            paddingBottom: isMobile ? 64 : 'var(--hero-pb)',
            paddingLeft:  'clamp(20px,4vw,64px)',
            paddingRight: 'clamp(20px,4vw,64px)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/*
           * UPGRADE 3 — Left column (60% width)
           * Content is purely left-aligned — headline NOT centered per spec
           */}
          <div style={{
            width: isMobile ? '100%' : '60%',
            position: 'relative', zIndex: 11,
            textAlign: isMobile ? 'center' : 'left',
          }}>

            {/* System status label */}
            <p
              className="t3d-label"
              style={{
                color: 'var(--parchment-40)',
                marginBottom: isMobile ? 20 : 32,
                justifyContent: isMobile ? 'center' : 'flex-start',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'rise 0.6s var(--ease) 0.1s both',
              }}
            >
              <span style={{ width: 6, height: 6, background: 'var(--crimson)', display: 'block', flexShrink: 0 }} aria-hidden />
              SOVEREIGN NAVIGATION SYSTEM — ONLINE
            </p>

            {/* Brand seal — responsive sizing */}
            <div style={{
              marginBottom: isMobile ? 24 : 40,
              animation: 'rise 0.7s var(--ease) 0.2s both',
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}>
              <Image
                src="/logos/T3D_seal_hero.png"
                alt="The 3 Dimensions — Align Your Vehicle. Follow Your Road. Obey The Signals."
                width={420} height={420}
                priority
                style={{
                  maxWidth: isMobile ? 'min(220px,60vw)' : 'min(420px,70vw)',
                  height: 'auto',
                }}
              />
            </div>

            {/*
             * UPGRADE 1 — H1: Playfair Display, weight 700, clamp(72px,10vw,140px)
             *              line-height 0.9, tracking -0.03em, LEFT-ALIGNED
             */}
            <h1
              className="t3d-h1"
              style={{ animation: 'rise 0.8s var(--ease) 0.3s both', marginBottom: 24 }}
            >
              Know your<br />
              <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>vehicle.</em><br />
              Read your<br />
              <em style={{ color: 'var(--emerald)', fontStyle: 'italic' }}>road.</em><br />
              Time every<br />
              <em style={{ color: 'var(--crimson)', fontStyle: 'italic' }}>move.</em>
            </h1>

            {/* Two-line subheadline in DM Sans italic (spec: "two-line subheadline") */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(16px,1.8vw,20px)',
              color: 'var(--parchment-40)',
              lineHeight: 1.6,
              maxWidth: '38ch',
              marginBottom: 48,
              animation: 'rise 0.8s var(--ease) 0.45s both',
            }}>
              Three ancient systems. One precision instrument.<br />
              Your sovereign navigation profile — free, in 60 seconds.
            </p>

            {/* UPGRADE 5 — Primary CTA: crimson, zero radius, ALL CAPS, 11px DM Sans */}
            <div style={{ animation: 'rise 0.8s var(--ease) 0.55s both', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: isMobile ? '100%' : 320, margin: isMobile ? '0 auto' : '0' }}>
              <Link href="/calculator" className="t3d-cta">
                CALCULATE MY PROFILE
              </Link>
              <a href="#system" className="t3d-ghost">
                EXPLORE THE SYSTEM
              </a>
            </div>

          </div>
          {/*
           * Right column (40%) — compass occupies this space naturally
           * since SovereignCompassCanvas is fixed and right-positioned
           * in the hero scroll range. No additional markup needed.
           */}
        </section>

        {/* UPGRADE 2 — Section divider */}
        <div className="t3d-divider" />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — THE THREE DIMENSIONS
            UPGRADE 2: Inherits base section spacing
            UPGRADE 4: Sharp card borders, zero radius
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="system"
          style={{
            height: isMobile ? 'auto' : '250vh',
            position: 'relative',
          }}
        >
          {/* Outer sticky wrapper — flex to push content RIGHT so compass shows left */}
          <div style={{
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : '15vh',
            padding: 'clamp(48px,6vh,80px) clamp(20px,4vw,64px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            {/* Content column — right 45% of viewport, compass fills the left */}
            <div style={{ width: isMobile ? '100%' : '45%' }}>

            {/* UPGRADE 1 — H2: Playfair Display italic, clamp(36px,5vw,64px) */}
            <h2 className="t3d-h2" style={{ marginBottom: 12 }}>
              One journey, three lenses.
            </h2>
            <p className="t3d-label" style={{ marginBottom: 48 }}>
              MODULE 01 — THE SOVEREIGN TRIAD
            </p>

            {/* UPGRADE 4 — Cards: sharp borders, no rounded corners, no shadows */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}>
              {DIMENSIONS.map((dim, i) => (
                <div
                  key={dim.label}
                  className={`t3d-card ${dim.flash}`}
                  style={{
                    padding: 'clamp(20px,2.5vw,32px)',
                    borderBottom: i < 2 ? '1px solid var(--card-border)' : undefined,
                  }}
                >
                  <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 14 }}>
                    {dim.label}
                  </p>
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(20px,2vw,28px)',
                    fontWeight: 400,
                    color: dim.color,
                    marginBottom: 6,
                    lineHeight: 1.15,
                  }}>
                    {dim.system}
                  </h3>
                  <div style={{ height: 1, background: `linear-gradient(90deg, ${dim.color}, transparent)`, marginBottom: 18, opacity: 0.4 }} />
                  <p className="t3d-body">{dim.body}</p>
                </div>
              ))}
            </div>

            {/* Inline CTA */}
            <div style={{ marginTop: 40 }}>
              <Link href="/calculator" className="t3d-cta" style={{ width: '100%', display: 'inline-flex', padding: '16px 40px' }}>
                BEGIN CALCULATION
              </Link>
            </div>
            </div>{/* end right content column */}
          </div>
        </section>

        {/* UPGRADE 2 — Section divider */}
        <div className="t3d-divider" />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — CALCULATOR + VIDEO SIDE BY SIDE
            Left: calculator panel (sticky on desktop)
            Right: concept video
            Mobile: calculator full width, video below
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          id="calculator"
          style={{
            height: isMobile ? 'auto' : '150vh',
            position: 'relative',
          }}
        >
          <div style={{
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : '8vh',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '45% 1fr',
            gap: 0,
            height: isMobile ? 'auto' : '84vh',
          }}>

            {/* LEFT — Calculator panel */}
            <div style={{
              overflow: 'auto',
              padding: 'clamp(28px,3.5vw,48px)',
              background: 'rgba(13,13,14,0.88)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRight: '1px solid var(--card-border)',
              borderBottom: '1px solid var(--card-border)',
            }}>
              {/* Section label */}
              <div style={{ marginBottom: 24 }}>
                <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 10 }}>
                  MODULE 02 — SOVEREIGN CALCULATOR
                </p>
                <h2 className="t3d-h2" style={{ fontSize: 'clamp(22px,2.5vw,36px)', marginBottom: 8 }}>
                  Discover your profile.
                </h2>
                <p className="t3d-body" style={{ fontSize: 14 }}>
                  Free · Instant · No credit card required.
                </p>
              </div>

              <div className="t3d-divider" style={{ marginBottom: 28 }} />

              {/* Calculator form */}
              <div onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'BUTTON' && target.textContent?.includes('CALCULATE')) {
                  compassRef.current?.triggerCalculation();
                }
              }}>
                <CalculatorForm />
              </div>
            </div>

            {/* RIGHT — Concept video */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(24px,3vw,40px)',
              background: 'rgba(13,13,14,0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              borderBottom: '1px solid var(--card-border)',
              gap: 16,
            }}>
              <p className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
                [VIDEO.INTRO] — WHAT IS T3D?
              </p>
              <div style={{
                border: '1px solid var(--card-border)',
                overflow: 'hidden',
              }}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    width: '100%',
                    display: 'block',
                    aspectRatio: '16/9',
                    background: '#000',
                  }}
                >
                  <source src="/videos/launchvideo.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="t3d-body" style={{ fontSize: 13, color: 'var(--parchment-40)' }}>
                Watch to understand the system — then enter your birth details
                on the left to see your three dimensions instantly.
              </p>
            </div>

          </div>
        </section>

        {/* UPGRADE 2 — Final divider before footer */}
        <div className="t3d-divider" />



      </main>

      <Footer />

      {/* Mobile sticky CTA — fixed bottom with safe area padding */}
      {isMobile && !results && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          <Link href="/#calculator" className="t3d-cta" style={{ borderRadius: 0 }}>
            CALCULATE MY PROFILE — FREE
          </Link>
        </div>
      )}
      {/* Spacer so sticky CTA doesn't overlap footer on mobile */}
      {isMobile && <div style={{ height: 56 }} />}
    </>
  );
}
