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

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';
import { Suspense } from 'react';
import { useT3DStore } from '@/store/useT3DStore';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import ProductSelectionSync from '@/components/ProductSelectionSync';
import FrameworkIntro from '@/components/home/FrameworkIntro';
import TriadStory from '@/components/home/TriadStory';
import WhatsInside from '@/components/home/WhatsInside';
import FAQ from '@/components/home/FAQ';

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { results }    = useT3DStore();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // The sticky phone button hides while the calculator is on screen, so it never sits on top of the form's own button.
  const [calcInView, setCalcInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById('calculator');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCalcInView(e.isIntersecting), { rootMargin: '0px 0px -56px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <ProductSelectionSync />
      </Suspense>
      <Nav />

      <main id="main" tabIndex={-1} style={{ position: 'relative', zIndex: 10, }}>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
            UPGRADE 2: padding-top 160px / padding-bottom 200px
            UPGRADE 3: Asymmetric 60/40 split — content left, compass right
            ═══════════════════════════════════════════════════════════════════ */}
        <section id="hero" className="hero-section">
          {/*
           * UPGRADE 3 — Left column (60% width)
           * Content is purely left-aligned — headline NOT centered per spec
           */}
          <div className="hero-col">

            {/* System status label */}
            <p
              className="t3d-label hero-label"
              style={{
                color: 'var(--parchment-40)',
                display: 'flex', alignItems: 'center', gap: 10,
                animation: 'rise 0.6s var(--ease) 0.1s both',
              }}
            >
              <span style={{ width: 6, height: 6, background: 'var(--crimson)', display: 'block', flexShrink: 0 }} aria-hidden />
              Human Design, Numerology and Astrology
            </p>

            {/* Brand seal — responsive sizing */}
            <div className="hero-seal" style={{ animation: 'rise 0.7s var(--ease) 0.2s both', display: 'flex' }}>
              <Image
                src="/logos/T3D_seal_translucent.png"
                alt="The 3 Dimensions — Align Your Vehicle. Follow Your Road. Obey The Signals."
                width={420} height={420}
                priority
                className="hero-seal-img"
                style={{ height: 'auto' }}
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
              Enter your birth details and see your Human Design Type, Life Path and birth chart. Free, in about a minute.
            </p>

            {/* UPGRADE 5 — Primary CTA: crimson, zero radius, ALL CAPS, 11px DM Sans */}
            <div className="hero-actions" style={{ animation: 'rise 0.8s var(--ease) 0.55s both', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/#calculator" className="t3d-cta">
                CALCULATE MY PROFILE
              </Link>
              <a href="#framework" className="t3d-ghost">
                SEE HOW IT WORKS
              </a>
              <a href="#intro" className="hero-intro-link">
                <span aria-hidden>▶</span> Watch the 3-minute intro
              </a>
            </div>

          </div>
        </section>

        {/* UPGRADE 2 — Section divider */}
        <div className="t3d-divider" />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — THE THREE DIMENSIONS
            UPGRADE 2: Inherits base section spacing
            UPGRADE 4: Sharp card borders, zero radius
            ═══════════════════════════════════════════════════════════════════ */}
        <FrameworkIntro />

        <div className="t3d-divider" />

        <TriadStory />

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
          className="calc-section"
        >
          <div className="calc-grid">

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
                  Free calculator
                </p>
                <h2 className="t3d-h2" style={{ fontSize: 'clamp(22px,2.5vw,36px)', marginBottom: 8 }}>
                  Discover your profile.
                </h2>
                <p className="t3d-body" style={{ fontSize: 14 }}>
                  Free, instant, no credit card required.
                </p>
              </div>

              <div className="t3d-divider" style={{ marginBottom: 28 }} />

              {/* Calculator form */}
              <div>
                <CalculatorForm />
              </div>
            </div>

            {/* RIGHT — Concept video */}
            <div id="intro" style={{ scrollMarginTop: 72,
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
                Watch: what is T3D?
              </p>
              <div style={{
                border: '1px solid var(--card-border)',
                overflow: 'hidden',
              }}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/videos/launchvideo-poster.jpg"
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
                Watch a short introduction, then enter your birth details in the calculator
                to see your three dimensions.
              </p>
            </div>

          </div>
        </section>

        <div className="t3d-divider" />

        <WhatsInside />

        <div className="t3d-divider" />

        <FAQ />

        <div className="t3d-divider" />



      </main>

      <Footer />

      {/* Mobile sticky CTA — fixed bottom with safe area padding */}
      {isMobile && !results && !calcInView && (
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
