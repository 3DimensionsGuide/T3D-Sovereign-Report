'use client';

/**
 * T3D Results Dashboard
 * Renders after the API responds. Reads from Zustand store.
 * Three side-by-side cards: Vehicle (amber), Road (emerald), Stoplight (crimson).
 */
import { useState } from 'react';
import Link from 'next/link';
import { useT3DStore } from '@/store/useT3DStore';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatLongitude(lon: unknown): string {
  if (typeof lon !== 'number') return '—';
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const norm = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(norm / 30);
  const deg = Math.floor(norm - signIdx * 30);
  const min = Math.floor((norm - signIdx * 30 - deg) * 60);
  return `${deg}°${String(min).padStart(2,'0')}' ${signs[signIdx]}`;
}

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <dt style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>{label}</dt>
      <dd style={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit' }}>
        {value}
      </dd>
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function DimCard({
  id, kicker, title, meta, color, colorText, colorBg, colorBorder, colorGlow, icon, children,
}: {
  id: string; kicker: string; title: string; meta: string;
  color: string; colorText: string; colorBg: string; colorBorder: string; colorGlow: string;
  icon: React.ReactNode; children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      id={id}
      style={{
        position: 'relative',
        background: 'var(--obsidian)',
        border: `1.5px solid ${hovered ? color : 'var(--purple)'}`,
        borderRadius: 18, padding: '28px 24px 26px',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 50px ${colorGlow}, 0 0 0 1px ${colorBorder}` : 'none',
        transition: 'transform 0.4s var(--spring), border-color 0.3s var(--ease), box-shadow 0.3s var(--ease)',
        willChange: 'transform',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 160, height: 160, borderRadius: '50%',
        background: `radial-gradient(circle, ${colorGlow}, transparent 70%)`,
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.4s var(--ease)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
        <span style={{
          flexShrink: 0, width: 56, height: 56, borderRadius: 14,
          display: 'grid', placeItems: 'center',
          background: colorBg, border: `1px solid ${colorBorder}`,
          boxShadow: hovered ? `0 0 22px ${colorGlow}` : 'none',
          transition: 'box-shadow 0.35s var(--ease)',
        }}>
          {icon}
        </span>
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: colorText, marginBottom: 3 }}>
            {kicker}
          </p>
          <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.1 }}>
            {title}
          </h3>
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', marginTop: 2 }}>{meta}</p>
        </div>
      </div>

      {/* Rule */}
      <div style={{
        height: 1, marginBottom: 18,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: hovered ? 1 : 0.55,
        transition: 'opacity 0.3s var(--ease)',
      }} />

      {/* Data */}
      <dl style={{ margin: 0 }}>
        {children}
      </dl>
    </article>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ResultsDashboard() {
  const { results, reset } = useT3DStore();

  if (!results) return null;

  const { humanDesign: hd, numerology: num, astrology: ast } = results;

  // Safe accessors
  const tropSun  = (ast?.tropicalSun  as { formatted?: string })?.formatted ?? formatLongitude((ast?.tropicalSun  as { longitude?: number })?.longitude);
  const tropAsc  = typeof ast?.tropicalAscendant === 'number' ? formatLongitude(ast.tropicalAscendant) : '—';
  const sidSun   = (ast?.siderealSun  as { formatted?: string })?.formatted ?? formatLongitude((ast?.siderealSun  as { longitude?: number })?.longitude);
  const sidAsc   = typeof ast?.siderealAscendant === 'number' ? formatLongitude(ast.siderealAscendant) : '—';

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>
          Your Sovereign T3D Profile
        </p>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 500, lineHeight: 1.1 }}>
          Your three dimensions, revealed
        </h2>
        <p style={{ color: 'var(--ink-dim)', marginTop: 12, fontSize: '0.95rem', maxWidth: '52ch', margin: '12px auto 0' }}>
          Hover each card to explore the details. Scroll down to unlock the full 100-page report.
        </p>
      </div>

      {/* Three cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20, marginBottom: 40,
      }}>

        {/* ── VEHICLE (Human Design) ─────────────────────────────────────── */}
        <DimCard
          id="vehicle"
          kicker="Human Design" title="The Vehicle" meta="How you're built to move"
          color="var(--amber)" colorText="var(--amber-text)"
          colorBg="rgba(229,169,60,0.08)" colorBorder="rgba(229,169,60,0.3)"
          colorGlow="rgba(229,169,60,0.15)"
          icon={
            <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
              <circle cx="20" cy="20" r="17" stroke="#E5A93C" strokeWidth="1.5" opacity=".35" />
              <circle cx="20" cy="20" r="12.5" stroke="#E5A93C" strokeWidth="1" opacity=".18" />
              <polygon points="20,5 23,20 20,17.5 17,20" fill="#E5A93C" />
              <polygon points="20,35 23,20 20,22.5 17,20" fill="#E5A93C" opacity=".4" />
              <circle cx="20" cy="20" r="2.4" fill="#E5A93C" />
            </svg>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--amber-text)', fontFamily: 'var(--font-display, serif)', lineHeight: 1.1 }}>
              {String(hd?.type ?? '—')}
            </p>
            <p style={{ color: 'var(--ink-dim)', fontSize: '0.84rem', marginTop: 2 }}>
              Energy Type
            </p>
          </div>
          <DataRow label="Authority" value={String(hd?.authority ?? '—')} />
          <DataRow label="Profile"   value={String(hd?.profile ?? '—')} mono />
          <DataRow label="Strategy"  value={String(hd?.strategy ?? '—')} />
        </DimCard>

        {/* ── ROAD (Numerology) ──────────────────────────────────────────── */}
        <DimCard
          id="road"
          kicker="Numerology" title="The Road" meta="Where the numbers lead"
          color="var(--emerald)" colorText="var(--emerald-text)"
          colorBg="rgba(31,138,77,0.08)" colorBorder="rgba(31,138,77,0.3)"
          colorGlow="rgba(31,138,77,0.15)"
          icon={
            <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
              <path d="M8 36 Q10 27 16 23 Q22 19 20 13 Q18 7 24 5" stroke="#1F8A4D" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 36 Q15 27 21 23 Q27 19 25 13 Q23 7 29 5" stroke="#1F8A4D" strokeWidth="2" strokeLinecap="round" opacity=".35" />
              <circle cx="26" cy="5" r="3" fill="#1F8A4D" />
            </svg>
          }
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--emerald-text)', fontFamily: 'var(--font-mono, monospace)', lineHeight: 1 }}>
              {num?.lifePath ?? '—'}
            </span>
            <span style={{ color: 'var(--ink-dim)', fontSize: '0.88rem', fontWeight: 600 }}>
              Life Path
            </span>
          </div>
          <DataRow label="Destiny"       value={String(num?.destiny ?? '—')} mono />
          <DataRow label="Personality"   value={String(num?.personality ?? '—')} mono />
          <DataRow label="Soul Urge"     value={String(num?.soulUrge ?? '—')} mono />
          <DataRow label="Hidden Passion" value={String(num?.hiddenPassion ?? '—')} mono />
          {num?.karmicLessons?.length > 0 && (
            <DataRow label="Karmic Lessons" value={(num.karmicLessons as number[]).join(', ')} mono />
          )}
        </DimCard>

        {/* ── STOPLIGHT (Astrology) ──────────────────────────────────────── */}
        <DimCard
          id="stoplight"
          kicker="Astrology" title="The Stoplight" meta="When the timing is right"
          color="var(--crimson)" colorText="var(--crimson-text)"
          colorBg="rgba(200,62,62,0.08)" colorBorder="rgba(200,62,62,0.3)"
          colorGlow="rgba(200,62,62,0.15)"
          icon={
            <svg viewBox="0 0 40 40" fill="none" width={30} height={30}>
              <rect x="13" y="3" width="14" height="34" rx="7" fill="#161519" stroke="#C83E3E" strokeWidth="1.3" />
              <circle cx="20" cy="11" r="4.2" fill="#C83E3E" opacity=".22" />
              <circle cx="20" cy="20" r="4.2" fill="#E5A93C" opacity=".22" />
              <circle cx="20" cy="29" r="4.2" fill="#1F8A4D" />
            </svg>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
              Tropical Sun
            </p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--crimson-text)', fontFamily: 'var(--font-mono, monospace)', marginTop: 2 }}>
              {tropSun}
            </p>
          </div>
          <DataRow label="Tropical ASC"  value={tropAsc} mono />
          <DataRow label="Sidereal Sun"  value={sidSun}  mono />
          <DataRow label="Sidereal ASC"  value={sidAsc}  mono />
          <DataRow label="House System"  value={String(ast?.houseSystem ?? 'Whole Sign')} />
        </DimCard>
      </div>

      {/* ── GOLD CTA ──────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 24, textAlign: 'center',
        border: '1px solid var(--purple-line)',
        background: 'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(46,26,71,.6), transparent 70%), var(--obsidian)',
        padding: 'clamp(36px,5vw,60px) clamp(20px,5vw,56px)',
      }}>
        <p style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
          Go deeper
        </p>
        <h3 className="font-display" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 500, maxWidth: '20ch', margin: '0 auto', lineHeight: 1.1 }}>
          Your profile is just the surface
        </h3>
        <p style={{ color: 'var(--ink-dim)', maxWidth: '50ch', margin: '14px auto 0', fontSize: '0.95rem', lineHeight: 1.65 }}>
          The full Sovereign Report gives you 100 pages of your complete Human Design
          bodygraph, all numerology cycles, 12-month transit calendar, and an integrated
          decision-making guide — all from your exact birth data.
        </p>

        <Link
          href="/checkout"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            minHeight: 60, padding: '18px clamp(28px,5vw,48px)', marginTop: 28,
            background: 'linear-gradient(135deg, var(--gold-soft), var(--gold) 55%, #b8931f)',
            color: 'var(--obsidian)', fontWeight: 700,
            fontSize: 'clamp(0.95rem,1.8vw,1.1rem)',
            borderRadius: 14, textDecoration: 'none',
            animation: 'goldPulse 2.8s var(--ease) infinite',
          }}
        >
          <span aria-hidden>✦</span>
          Unlock Your Full 100-Page Sovereign Report — $97
          <span aria-hidden>✦</span>
        </Link>
        <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
          One-time purchase · Instant delivery · Built from your exact birth data
        </p>
      </div>

      {/* Reset */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={reset}
          style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Start over with different details
        </button>
      </div>
    </div>
  );
}
