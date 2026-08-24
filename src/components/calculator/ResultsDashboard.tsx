'use client';

/**
 * T3D Results Dashboard — Design Polish · Surgical Upgrade
 *
 * UPGRADE 6 micro-interactions applied:
 *   — Entry Animation: cards stagger in at 0ms / 80ms / 160ms (CSS only)
 *   — Number Counters: Life Path and key numerology numbers count up 0→final (native JS, no library)
 *   — System Color Flash: left border animates from transparent to triad color on mount
 *
 * UPGRADE 4: sharp card borders, zero radius, no shadows
 * UPGRADE 1: DM Sans body, Playfair Display headlines
 * UPGRADE 2: Results section spacing 120px/160px
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT3DStore } from '@/store/useT3DStore';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtLon(lon: unknown): string {
  if (typeof lon !== 'number') return '—';
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const n   = ((lon % 360) + 360) % 360;
  const si  = Math.floor(n / 30);
  const deg = Math.floor(n - si * 30);
  const min = Math.floor((n - si * 30 - deg) * 60);
  return `${deg}°${String(min).padStart(2,'0')}' ${signs[si]}`;
}

// ─── UPGRADE 6 — Number Counter (native JS, no library) ──────────────────────
function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target || isNaN(target)) { setValue(target); return; }
    const start     = performance.now();
    const startVal  = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return <span>{value}</span>;
}

// ─── DATA ROW ─────────────────────────────────────────────────────────────────
function DataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 12, padding: '9px 0',
      borderTop: '1px solid rgba(245,245,243,0.08)',
    }}>
      <dt className="t3d-label" style={{ color: 'var(--parchment-40)', flexShrink: 0 }}>{label}</dt>
      <dd style={{
        fontFamily: mono ? "'DM Sans',monospace" : "'DM Sans',sans-serif",
        fontSize: '0.9rem', fontWeight: 400,
        color: 'var(--parchment)', textAlign: 'right',
      }}>
        {value}
      </dd>
    </div>
  );
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
/**
 * UPGRADE 4 — sharp border, zero radius, no shadow
 * UPGRADE 6 — flash-vehicle / flash-road / flash-stoplight CSS class drives left border animation
 */
function ResultCard({
  index, label, kicker, color, flashClass, children,
}: {
  index: number; label: string; kicker: string;
  color: string; flashClass: string; children: React.ReactNode;
}) {
  return (
    <article
      className={`results-card t3d-card ${flashClass}`}
      style={{
        padding: 'clamp(24px,3vw,36px) clamp(24px,3vw,36px) clamp(24px,3vw,36px) 20px',  // left pinned at 20px; border handled by flash animation
        animationDelay: `${index * 80}ms`,
        position: 'relative',
      }}
    >
      {/* UPGRADE 1 — system label: 10px DM Sans, tracking 0.15em, ALL CAPS */}
      <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 10 }}>
        {label}
      </p>
      {/* UPGRADE 1 — kicker: Playfair Display, weight 400 */}
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(20px,2.5vw,30px)',
        fontWeight: 400, color: color,
        lineHeight: 1.15, marginBottom: 16,
      }}>
        {kicker}
      </h3>
      {/* Thin triad-color rule */}
      <div style={{ height: 1, background: `linear-gradient(90deg, ${color}, transparent)`, marginBottom: 16, opacity: 0.5 }} />
      <dl style={{ margin: 0 }}>
        {children}
      </dl>
    </article>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ResultsDashboard() {
  const { results, reset } = useT3DStore();
  if (!results) return null;

  const { humanDesign: hd, numerology: num, astrology: ast } = results;

  // Astrology helpers
  const tropSun  = (ast?.tropicalSun  as { formatted?: string })?.formatted ?? fmtLon((ast?.tropicalSun  as { longitude?: number })?.longitude);
  const tropMoon = (ast?.tropicalMoon as { formatted?: string })?.formatted ?? fmtLon((ast?.tropicalMoon as { longitude?: number })?.longitude);
  const tropAsc  = typeof ast?.tropicalAscendant === 'number' ? fmtLon(ast.tropicalAscendant) : '—';
  const sidSun   = (ast?.siderealSun  as { formatted?: string })?.formatted ?? fmtLon((ast?.siderealSun  as { longitude?: number })?.longitude);
  const sidAsc   = typeof ast?.siderealAscendant === 'number' ? fmtLon(ast.siderealAscendant) : '—';

  const lifePath     = typeof num?.lifePath     === 'number' ? num.lifePath     : null;
  const destiny      = typeof num?.destiny      === 'number' ? num.destiny      : null;
  const personality  = typeof num?.personality  === 'number' ? num.personality  : null;
  const soulUrge     = typeof num?.soulUrge     === 'number' ? num.soulUrge     : null;
  const hiddenPassion= typeof num?.hiddenPassion=== 'number' ? num.hiddenPassion: null;
  const karmicLessons= Array.isArray(num?.karmicLessons)    ? num.karmicLessons as number[] : [];

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 40,
      }}>
        <div>
          <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 10 }}>
            SOVEREIGN PROFILE — CALCULATION COMPLETE
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 400, color: 'var(--parchment)',
            lineHeight: 1.1,
          }}>
            Your three dimensions.
          </h2>
        </div>
        <button
          onClick={reset}
          className="t3d-ghost"
          style={{ marginTop: 4, padding: '10px 18px' }}
        >
          RECALCULATE
        </button>
      </div>

      {/*
       * UPGRADE 6 — Three result cards
       *   · Entry Animation: staggered via CSS class (globals.css results-card)
       *   · Color Flash: flash-vehicle / flash-road / flash-stoplight on left border
       *   UPGRADE 4 — sharp card borders, zero radius
       */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))',
        gap: 0,
      }}>

        {/* ── VEHICLE — Human Design ──────────────────────────────────────── */}
        <ResultCard index={0} label="THE VEHICLE" kicker="Human Design"
          color="var(--amber)" flashClass="flash-vehicle">
          {/* Large type display for HD Type */}
          <div style={{ padding: '12px 0 16px' }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.5rem,2.5vw,2.2rem)',
              fontWeight: 400, color: 'var(--amber)',
              lineHeight: 1.1, marginBottom: 4,
            }}>
              {String(hd?.type ?? '—')}
            </p>
            <p className="t3d-body" style={{ fontSize: 13, color: 'var(--parchment-40)' }}>Energy Type</p>
          </div>
          <DataRow label="AUTHORITY" value={String(hd?.authority ?? '—')} />
          <DataRow label="PROFILE"   value={String(hd?.profile   ?? '—')} mono />
          <DataRow label="STRATEGY"  value={String(hd?.strategy  ?? '—')} />
        </ResultCard>

        {/* ── ROAD — Numerology ───────────────────────────────────────────── */}
        <ResultCard index={1} label="THE ROAD" kicker="Numerology"
          color="var(--emerald)" flashClass="flash-road">
          {/*
           * UPGRADE 6 — Number Counter: Life Path counts up 0 → final value
           * Native JS requestAnimationFrame, no library
           */}
          <div style={{ padding: '12px 0 16px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(2.4rem,4vw,3.6rem)',
              fontWeight: 700, color: 'var(--emerald)', lineHeight: 1,
            }}>
              {lifePath !== null ? <CountUp target={lifePath} duration={800} /> : '—'}
            </span>
            <p className="t3d-label" style={{ color: 'var(--parchment-40)' }}>LIFE PATH</p>
          </div>
          <DataRow label="DESTINY"        value={destiny      !== null ? String(destiny)      : '—'} mono />
          <DataRow label="PERSONALITY"    value={personality  !== null ? String(personality)  : '—'} mono />
          <DataRow label="SOUL URGE"      value={soulUrge     !== null ? String(soulUrge)     : '—'} mono />
          <DataRow label="HIDDEN PASSION" value={hiddenPassion!== null ? String(hiddenPassion): '—'} mono />
          {karmicLessons.length > 0 && (
            <DataRow label="KARMIC LESSONS" value={karmicLessons.join(', ')} mono />
          )}
        </ResultCard>

        {/* ── STOPLIGHT — Astrology ───────────────────────────────────────── */}
        <ResultCard index={2} label="THE STOPLIGHT" kicker="Astrology"
          color="var(--crimson)" flashClass="flash-stoplight">
          <div style={{ padding: '12px 0 16px' }}>
            <p className="t3d-label" style={{ color: 'var(--parchment-40)', marginBottom: 6 }}>TROPICAL SUN</p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(1rem,1.8vw,1.3rem)',
              fontWeight: 500, color: 'var(--crimson-hi)', lineHeight: 1.2,
            }}>
              {tropSun}
            </p>
          </div>
          <DataRow label="TROPICAL MOON" value={tropMoon} mono />
          <DataRow label="TROPICAL ASC"  value={tropAsc}  mono />
          <DataRow label="SIDEREAL SUN"  value={sidSun}   mono />
          <DataRow label="SIDEREAL ASC"  value={sidAsc}   mono />
          <DataRow label="HOUSE SYSTEM"  value="Whole Sign" />
        </ResultCard>
      </div>

      {/* ── DIVIDER ────────────────────────────────────────────────────────── */}
      <div className="t3d-divider" style={{ marginTop: 48 }} />

      {/* ── UPGRADE 5 CTA — Crimson banner with report offer ───────────────── */}
      <div style={{
        paddingTop:    'var(--results-pt)',
        paddingBottom: 'var(--results-pb)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <p className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
          SOVEREIGN REPORT — COMPLETE NATAL ANALYSIS
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(28px,4vw,52px)',
          fontWeight: 400, color: 'var(--parchment)',
          lineHeight: 1.1, maxWidth: '18ch',
        }}>
          Your profile is just the surface.
        </h3>
        <p className="t3d-body" style={{ maxWidth: '50ch' }}>
          100 pages built from your exact birth data — every gate, every number,
          every transit. One integrated guide for every decision that matters.
        </p>

        {/* UPGRADE 5 — CTA: crimson, zero radius, ALL CAPS 11px DM Sans */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <Link href="/checkout" className="t3d-cta" style={{ maxWidth: 320, width: 'auto', padding: '16px 40px' }}>
            UNLOCK FULL REPORT — $97
          </Link>
          <button onClick={reset} className="t3d-ghost">
            RECALCULATE
          </button>
        </div>
        <p className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
          ONE-TIME PURCHASE · INSTANT DELIVERY · BUILT FROM YOUR BIRTH DATA
        </p>
      </div>
    </div>
  );
}
