"use client";

/**
 * T3D Homepage — Server Component
 * Hero + three dimension preview cards + report CTA.
 */
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';

// ─── TRIAD DATA ───────────────────────────────────────────────────────────────
const TRIAD = [
  {
    id: 'vehicle',
    kicker: 'Human Design',
    title: 'The Vehicle',
    meta: 'How you\'re built to move',
    color: 'var(--amber)',
    colorText: 'var(--amber-text)',
    colorBg: 'rgba(229,169,60,0.08)',
    colorBorder: 'rgba(229,169,60,0.25)',
    colorGlow: 'rgba(229,169,60,0.15)',
    teaser: 'Your energy type, authority, and defined centers — the machinery beneath every decision you make.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
        <circle cx="20" cy="20" r="17" stroke="#E5A93C" strokeWidth="1.5" opacity=".35" />
        <circle cx="20" cy="20" r="12.5" stroke="#E5A93C" strokeWidth="1" opacity=".18" />
        <polygon points="20,5 23,20 20,17.5 17,20" fill="#E5A93C" />
        <polygon points="20,35 23,20 20,22.5 17,20" fill="#E5A93C" opacity=".4" />
        <circle cx="20" cy="20" r="2.4" fill="#E5A93C" />
      </svg>
    ),
  },
  {
    id: 'road',
    kicker: 'Numerology',
    title: 'The Road',
    meta: 'Where the numbers lead',
    color: 'var(--emerald)',
    colorText: 'var(--emerald-text)',
    colorBg: 'rgba(31,138,77,0.08)',
    colorBorder: 'rgba(31,138,77,0.28)',
    colorGlow: 'rgba(31,138,77,0.15)',
    teaser: 'Your life path, destiny, and active pinnacle cycle — the geometric route your numbers are tracing.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
        <path d="M8 36 Q10 27 16 23 Q22 19 20 13 Q18 7 24 5" stroke="#1F8A4D" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 36 Q15 27 21 23 Q27 19 25 13 Q23 7 29 5" stroke="#1F8A4D" strokeWidth="2" strokeLinecap="round" opacity=".35" />
        <circle cx="26" cy="5" r="3" fill="#1F8A4D" />
        <circle cx="26" cy="5" r="5.4" stroke="#1F8A4D" strokeWidth="1" opacity=".28" />
      </svg>
    ),
  },
  {
    id: 'stoplight',
    kicker: 'Astrology',
    title: 'The Stoplight',
    meta: 'When the timing is right',
    color: 'var(--crimson)',
    colorText: 'var(--crimson-text)',
    colorBg: 'rgba(200,62,62,0.08)',
    colorBorder: 'rgba(200,62,62,0.25)',
    colorGlow: 'rgba(200,62,62,0.15)',
    teaser: 'Your tropical and sidereal chart, current transits, and active timing gates — the sky\'s signal for when to act.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
        <rect x="13" y="3" width="14" height="34" rx="7" fill="#161519" stroke="#C83E3E" strokeWidth="1.3" />
        <circle cx="20" cy="11" r="4.2" fill="#C83E3E" opacity=".22" />
        <circle cx="20" cy="20" r="4.2" fill="#E5A93C" opacity=".22" />
        <circle cx="20" cy="29" r="4.2" fill="#1F8A4D" style={{ filter: 'drop-shadow(0 0 4px #1F8A4D)' }} />
      </svg>
    ),
  },
] as const;

// ─── INCLUDES ────────────────────────────────────────────────────────────────
const INCLUDES = [
  { title: 'Full Human Design Bodygraph',   body: 'All 9 centers, 36 channels, and 64 gates with plain-language strategy and authority.' },
  { title: 'Complete Numerology Blueprint', body: 'Life path, expression, soul urge, all four pinnacles and challenges across your timeline.' },
  { title: '12-Month Timing Calendar',      body: 'Your personal go, caution, and stop windows mapped to upcoming planetary transits.' },
  { title: 'Integrated Navigation Guide',   body: 'How all three dimensions read together when you have a real decision to make.' },
] as const;

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#triad">Skip to the three dimensions</a>
      <Nav />

      <main id="top" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <header style={{
          position: 'relative',
          padding: 'clamp(72px,13vh,140px) 0 clamp(56px,9vh,104px)',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {/* Route arc */}
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              opacity: 0.45, zIndex: -1, pointerEvents: 'none',
            }}
          >
            <path
              d="M-40 330 C 260 330, 360 120, 600 120 S 940 330, 1240 90"
              stroke="rgba(212,175,55,0.28)" strokeWidth="1.4"
              strokeDasharray="6 9" fill="none"
            />
            <circle cx="180" cy="278" r="3.5" fill="rgba(229,169,60,0.55)" />
            <circle cx="600" cy="120" r="3.5" fill="rgba(31,138,77,0.6)" />
            <circle cx="1010" cy="150" r="3.5" fill="rgba(200,62,62,0.55)" />
          </svg>

          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>
            {/* Wordmark */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, animation: 'rise 0.9s var(--ease) 0s both' }}>
              <Image
                src="/logos/T3D_luxword.png"
                alt="The 3 Dimensions — Align your vehicle. Follow your road. Obey the signals."
                width={580}
                height={240}
                priority
                style={{ maxWidth: '90vw', height: 'auto', mixBlendMode: 'lighten' }}
              />
            </div>

            {/* Lede */}
            <p style={{
              maxWidth: '58ch', margin: '0 auto 36px',
              fontSize: 'clamp(1rem,1.7vw,1.2rem)',
              color: 'var(--ink-dim)', lineHeight: 1.65,
              animation: 'rise 0.8s var(--ease) 0.2s both',
            }}>
              T3D draws Human Design, Numerology, and Astrology into one navigable
              picture of who you are, where you&apos;re headed, and exactly when to act.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
              animation: 'rise 0.8s var(--ease) 0.35s both',
            }}>
              <Link href="/calculator" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                minHeight: 54, padding: '14px 32px', borderRadius: 12,
                background: 'var(--gold)', color: 'var(--obsidian)',
                fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                transition: 'transform 0.2s var(--ease), filter 0.2s var(--ease)',
              }}>
                ✦ Get My Sovereign Profile
              </Link>
              <a href="#triad" style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                minHeight: 54, padding: '14px 28px', borderRadius: 12,
                background: 'transparent', color: 'var(--ink)',
                border: '1px solid var(--purple-line)',
                fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}>
                Explore the three dimensions
              </a>
            </div>
          </div>
        </header>

        {/* ── TRIAD ────────────────────────────────────────────────────────── */}
        <section id="triad" aria-labelledby="triad-title" style={{
          padding: 'clamp(56px,9vh,104px) 0',
        }}>
          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>

            <div style={{ textAlign: 'center', maxWidth: '62ch', margin: '0 auto clamp(40px,6vh,64px)' }}>
              <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
                The Three Dimensions
              </p>
              <h2
                id="triad-title"
                className="font-display"
                style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.08 }}
              >
                One journey, read three ways
              </h2>
              <p style={{ color: 'var(--ink-dim)', marginTop: 16, fontSize: 'clamp(1rem,1.5vw,1.1rem)' }}>
                Every choice you face sits at the intersection of your wiring, your numbers,
                and the sky&apos;s current signal. Enter your birth details and see all three at once.
              </p>
            </div>

            {/* Cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {TRIAD.map((dim) => (
                <article
                  key={dim.id}
                  style={{
                    position: 'relative',
                    background: 'var(--obsidian)',
                    border: `1.5px solid var(--purple)`,
                    borderRadius: 18,
                    padding: '28px 24px 32px',
                    overflow: 'hidden',
                    transition: 'transform 0.4s var(--spring), border-color 0.3s var(--ease), box-shadow 0.3s var(--ease)',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-6px)';
                    el.style.borderColor = dim.color;
                    el.style.boxShadow = `0 16px 50px ${dim.colorGlow}, 0 0 0 1px ${dim.colorBorder}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.borderColor = 'var(--purple)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Corner glow */}
                  <div style={{
                    position: 'absolute', top: -60, right: -60,
                    width: 160, height: 160, borderRadius: '50%',
                    background: `radial-gradient(circle, ${dim.colorGlow}, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  {/* Icon + kicker */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                    <span style={{
                      flexShrink: 0, width: 56, height: 56, borderRadius: 14,
                      display: 'grid', placeItems: 'center',
                      background: dim.colorBg, border: `1px solid ${dim.colorBorder}`,
                    }}>
                      {dim.icon}
                    </span>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: dim.colorText, marginBottom: 3 }}>
                        {dim.kicker}
                      </p>
                      <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.1 }}>
                        {dim.title}
                      </h3>
                      <p style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', marginTop: 2 }}>
                        {dim.meta}
                      </p>
                    </div>
                  </div>

                  {/* Rule */}
                  <div style={{
                    height: 1, marginBottom: 18,
                    background: `linear-gradient(90deg, ${dim.color}, transparent)`,
                    opacity: 0.6,
                  }} />

                  {/* Teaser */}
                  <p style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {dim.teaser}
                  </p>
                </article>
              ))}
            </div>

            {/* CTA under cards */}
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link href="/calculator" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                minHeight: 56, padding: '16px 40px', borderRadius: 13,
                background: 'linear-gradient(135deg, var(--gold-soft), var(--gold) 55%, #b8931f)',
                color: 'var(--obsidian)', fontWeight: 700,
                fontSize: 'clamp(0.95rem,1.8vw,1.05rem)',
                textDecoration: 'none',
                animation: 'goldPulse 2.8s var(--ease) infinite',
                transition: 'transform 0.2s var(--ease)',
              }}>
                <span aria-hidden>✦</span>
                Calculate My Three Dimensions
                <span aria-hidden>✦</span>
              </Link>
              <p style={{ marginTop: 12, color: 'var(--ink-faint)', fontSize: '0.78rem' }}>
                Free · Takes 60 seconds · Instant results
              </p>
            </div>
          </div>
        </section>

        {/* ── REPORT / OFFER ───────────────────────────────────────────────── */}
        <section id="report" aria-labelledby="report-title" style={{
          padding: 'clamp(56px,9vh,104px) 0',
        }}>
          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>
            <div style={{
              borderRadius: 24,
              border: '1px solid var(--purple-line)',
              background: 'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(46,26,71,.6), transparent 70%), var(--obsidian)',
              padding: 'clamp(40px,6vw,72px) clamp(24px,5vw,64px)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>
                Your Full Picture
              </p>
              <h2
                id="report-title"
                className="font-display"
                style={{ fontSize: 'clamp(1.9rem,4.2vw,3rem)', fontWeight: 500, maxWidth: '18ch', margin: '0 auto', lineHeight: 1.08 }}
              >
                100 pages, mapped entirely to you
              </h2>
              <p style={{ color: 'var(--ink-dim)', maxWidth: '52ch', margin: '16px auto 0', fontSize: '1.05rem' }}>
                The free calculator shows the headline. The Sovereign Report walks the whole
                route — every center, every number, every gate, drawn from your exact birth data.
              </p>

              {/* Includes grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14, maxWidth: 720, margin: '36px auto', textAlign: 'left',
              }}>
                {INCLUDES.map((item) => (
                  <div key={item.title} style={{
                    display: 'flex', gap: 13, alignItems: 'flex-start',
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(61,42,92,0.45)',
                    borderRadius: 13,
                  }}>
                    <span style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: 7,
                      display: 'grid', placeItems: 'center',
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      color: 'var(--gold)',
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" width={14} height={14} aria-hidden>
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.93rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--ink-dim)', lineHeight: 1.55 }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/calculator" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                minHeight: 60, padding: '18px clamp(28px,5vw,48px)',
                background: 'linear-gradient(135deg, var(--gold-soft), var(--gold) 55%, #b8931f)',
                color: 'var(--obsidian)', fontWeight: 700,
                fontSize: 'clamp(0.98rem,2vw,1.1rem)',
                borderRadius: 14, textDecoration: 'none',
                animation: 'goldPulse 2.8s var(--ease) infinite',
                transition: 'transform 0.2s var(--ease)',
              }}>
                <span aria-hidden>✦</span>
                Unlock Your Full 100-Page Sovereign Report
                <span aria-hidden>✦</span>
              </Link>
              <p style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                Built from your exact birth date, time &amp; place · Delivered instantly · $97
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
