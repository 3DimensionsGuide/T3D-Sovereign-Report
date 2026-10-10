'use client';

/**
 * TriadStory — the scroll-driven "one trip, three lenses" section.
 *
 * Desktop: a tall section with a pinned stage. Scroll progress (0–1) moves
 * through three scenes: Vehicle (amber), Road (emerald), Stoplight (crimson).
 * Scene 1 builds an illustrative bodygraph centre by centre.
 * Mobile / reduced motion: the same content as static stacked scenes.
 * Only transform and opacity are animated.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Scene = {
  key: 'vehicle' | 'road' | 'stoplight';
  label: string;
  system: string;
  headline: string;
  body: string;
  color: string;
};

const SCENES: readonly Scene[] = [
  {
    key: 'vehicle',
    label: 'The Vehicle',
    system: 'Human Design',
    headline: 'Start with the machine you drive.',
    body: 'Your energy type, strategy, authority and defined centers: the precision machinery beneath every decision.',
    color: 'var(--amber)',
  },
  {
    key: 'road',
    label: 'The Road',
    system: 'Numerology',
    headline: 'Then read the road ahead.',
    body: 'Your life path, destiny and active pinnacle: the geometric trajectory your numbers have been tracing.',
    color: 'var(--emerald)',
  },
  {
    key: 'stoplight',
    label: 'The Stoplight',
    system: 'Astrology',
    headline: 'Move when the signal says go.',
    body: 'Your natal chart, current transits and timing gates: the sky\'s precise signal for when to move.',
    color: 'var(--signal-red)',
  },
] as const;

// Nine energy centres of the bodygraph, drawn as the standard shapes.
// Order = the order they switch on while scrolling.
const CENTERS: readonly { name: string; shape: string }[] = [
  { name: 'Root',          shape: 'M130 380 H170 V425 H130 Z' },
  { name: 'Sacral',        shape: 'M130 300 H170 V345 H130 Z' },
  { name: 'Spleen',        shape: 'M62 252 L108 284 L62 316 Z' },
  { name: 'Solar Plexus',  shape: 'M238 252 L192 284 L238 316 Z' },
  { name: 'Heart',         shape: 'M192 214 L222 232 L192 250 Z' },
  { name: 'G Center',      shape: 'M150 195 L180 225 L150 255 L120 225 Z' },
  { name: 'Throat',        shape: 'M130 130 H170 V172 H130 Z' },
  { name: 'Ajna',          shape: 'M125 76 H175 L150 112 Z' },
  { name: 'Head',          shape: 'M150 18 L176 62 H124 Z' },
];

const CHANNELS: readonly string[] = [
  'M150 62 V76', 'M150 112 V130', 'M150 172 V195', 'M150 255 V300',
  'M150 345 V380', 'M108 284 L130 316', 'M192 284 L170 316', 'M180 225 L192 232',
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function Bodygraph({ build, dim }: { build: number; dim: number }) {
  return (
    <svg
      viewBox="0 0 300 445"
      role="img"
      aria-label="Illustration of the nine energy centers of a Human Design bodygraph, lighting up one by one"
      style={{ width: '100%', maxWidth: 360, height: 'auto', opacity: dim, transition: 'opacity 0.5s var(--ease)' }}
    >
      <g stroke="var(--amber)" strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.5 * clamp01((build - 0.1) / 0.5)} style={{ transition: 'opacity 0.4s var(--ease)' }}>
        {CHANNELS.map(d => <path key={d} d={d} />)}
      </g>
      {CENTERS.map((c, i) => {
        const on = clamp01((build - i * 0.09) / 0.09);
        return (
          <path
            key={c.name}
            d={c.shape}
            fill="var(--amber)"
            fillOpacity={0.08 + 0.82 * on}
            stroke="var(--amber)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: `scale(${0.9 + 0.1 * on})`,
              transition: 'fill-opacity 0.35s var(--ease), transform 0.35s var(--ease)',
            }}
          />
        );
      })}
    </svg>
  );
}

function SceneText({ scene, index }: { scene: Scene; index: number }) {
  return (
    <>
      <p className="t3d-label" style={{ color: scene.color, marginBottom: 14 }}>
        Lens {index + 1} of 3: {scene.label}
      </p>
      <h3 className="t3d-h2" style={{ marginBottom: 16 }}>{scene.headline}</h3>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(20px,2vw,26px)', color: scene.color, marginBottom: 14 }}>
        {scene.system}
      </p>
      <p className="t3d-body" style={{ maxWidth: 480 }}>{scene.body}</p>
    </>
  );
}

export default function TriadStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { setIsMobile(mqMobile.matches); setReduced(mqReduce.matches); };
    sync();
    mqMobile.addEventListener('change', sync);
    mqReduce.addEventListener('change', sync);
    return () => { mqMobile.removeEventListener('change', sync); mqReduce.removeEventListener('change', sync); };
  }, []);

  const static_ = isMobile || reduced;

  useEffect(() => {
    if (static_) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(r.height - window.innerHeight, 1);
      const p = clamp01(-r.top / span);
      setProgress(prev => (Math.abs(prev - p) > 0.004 ? p : prev));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [static_]);

  const cta = (
    <Link href="/calculator" className="t3d-cta" style={{ width: 'auto', display: 'inline-flex', padding: '16px 40px', marginTop: 32 }}>
      BEGIN CALCULATION
    </Link>
  );

  // ── Static layout: phones and reduced-motion ───────────────────────────────
  if (static_) {
    return (
      <section id="system" aria-labelledby="triad-heading" style={{ padding: 'clamp(48px,8vh,96px) clamp(20px,4vw,64px)', background: 'var(--base)', position: 'relative' }}>
        <h2 id="triad-heading" className="t3d-h2" style={{ marginBottom: 40 }}>One journey, three lenses.</h2>
        {SCENES.map((scene, i) => (
          <article key={scene.key} className={`t3d-card flash-${scene.key}`} style={{ padding: 'clamp(20px,4vw,32px)', marginBottom: 16 }}>
            {i === 0 && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Bodygraph build={1} dim={1} /></div>}
            <SceneText scene={scene} index={i} />
          </article>
        ))}
        {cta}
      </section>
    );
  }

  // ── Pinned scroll story ────────────────────────────────────────────────────
  const active = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;
  const vehicleBuild = clamp01(progress / 0.26);
  const bodyDim = active === 0 ? 1 : 0.16;
  const scene = SCENES[active];

  return (
    <section id="system" ref={sectionRef} aria-labelledby="triad-heading" style={{ height: '340vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        background: `radial-gradient(90% 80% at 25% 50%, ${active === 0 ? 'rgba(229,169,60,0.10)' : active === 1 ? 'rgba(31,138,77,0.12)' : 'rgba(217,83,83,0.10)'} 0%, var(--base) 70%)`,
        transition: 'background 0.6s var(--ease)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
        padding: '80px clamp(24px,5vw,80px) 40px', gap: 'clamp(24px,4vw,64px)',
      }}>
        <div aria-hidden={active !== 0} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Bodygraph build={vehicleBuild} dim={bodyDim} />
        </div>

        <div>
          <h2 id="triad-heading" className="t3d-label" style={{ marginBottom: 28 }}>One journey, three lenses</h2>
          <div aria-live="polite" key={scene.key} style={{ animation: 'sceneIn 0.5s var(--ease) both' }}>
            <SceneText scene={scene} index={active} />
          </div>
          <div role="presentation" style={{ display: 'flex', gap: 8, marginTop: 36 }}>
            {SCENES.map((s, i) => (
              <span key={s.key} style={{ width: 48, height: 3, background: i <= active ? s.color : 'var(--step-off)', transition: 'background 0.4s var(--ease)' }} />
            ))}
          </div>
          {progress > 0.6 && cta}
        </div>
      </div>
    </section>
  );
}
