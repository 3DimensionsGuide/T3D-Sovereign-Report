'use client';

/**
 * TriadStory — the scroll-driven "one trip, three lenses" section.
 *
 * Desktop: a tall section with a pinned stage. Scroll progress (0–1) moves
 * through three scenes: Vehicle (amber), Road (emerald), Stoplight (crimson).
 * Scene 1 builds an illustrative bodygraph centre by centre.
 * Scene 2 draws a winding road toward a rising horizon, with four pinnacle markers switching on.
 * Scene 3 turns a zodiac wheel until a moving planet meets a natal point, then the signal goes red, amber, green.
 * Mobile / reduced motion: the same content as static stacked scenes, with every drawing fully built.
 * Only transform, opacity and SVG paint (stroke and fill) are animated; nothing that moves layout.
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


// ── The Road: a winding road to the horizon, four pinnacle markers ──────────
const ROAD_SEGMENTS: readonly { d: string; width: number }[] = [
  { d: 'M150 435 C60 380 240 330 150 280', width: 38 },
  { d: 'M150 280 C70 235 220 190 150 150', width: 22 },
  { d: 'M150 150 C140 138 150 128 150 118', width: 10 },
];
const ROAD_CENTRE = 'M150 435 C60 380 240 330 150 280 C70 235 220 190 150 150 C140 138 150 128 150 118';
// Where the four pinnacles sit along the road (x, y, size), with how far the road must be drawn before each lights.
const PINNACLES: readonly { x: number; y: number; r: number; at: number }[] = [
  { x: 142, y: 365, r: 15, at: 0.2 },
  { x: 162, y: 288, r: 13, at: 0.44 },
  { x: 143, y: 216, r: 11, at: 0.68 },
  { x: 155, y: 153, r: 9,  at: 0.9 },
];

function RoadDrawing({ build, dim }: { build: number; dim: number }) {
  const drawn = clamp01(build / 0.95);
  const rise = clamp01((build - 0.05) / 0.6);
  return (
    <svg
      viewBox="0 0 300 445"
      role="img"
      aria-label="Illustration of a winding road leading to a glowing horizon, with four pinnacle markers lighting up along the way"
      style={{ width: '100%', maxWidth: 360, height: 'auto', opacity: dim, transition: 'opacity 0.5s var(--ease)' }}
    >
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `scale(${0.7 + 0.3 * rise})`, opacity: 0.15 + 0.85 * rise, transition: 'opacity 0.4s var(--ease), transform 0.4s var(--ease)' }}>
        <circle cx="150" cy="112" r="34" fill="var(--emerald)" fillOpacity="0.14" />
        <circle cx="150" cy="112" r="16" fill="var(--emerald)" fillOpacity="0.3" />
        <circle cx="150" cy="112" r="5" fill="var(--emerald)" />
      </g>
      <line x1="30" y1="118" x2="270" y2="118" stroke="var(--emerald)" strokeWidth="1" strokeOpacity="0.35" />
      <g fill="none" stroke="var(--emerald)" strokeLinecap="round" strokeOpacity={0.1 + 0.14 * drawn} style={{ transition: 'stroke-opacity 0.4s var(--ease)' }}>
        {ROAD_SEGMENTS.map(seg => <path key={seg.d} d={seg.d} strokeWidth={seg.width} />)}
      </g>
      <path
        d={ROAD_CENTRE}
        fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - drawn} pathLength={1}
        style={{ transition: 'stroke-dashoffset 0.35s var(--ease)' }}
      />
      {PINNACLES.map((m, i) => {
        const on = clamp01((build - m.at) / 0.08);
        return (
          <g key={i} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `scale(${0.6 + 0.4 * on})`, opacity: 0.12 + 0.88 * on, transition: 'opacity 0.35s var(--ease), transform 0.35s var(--ease)' }}>
            <circle cx={m.x} cy={m.y} r={m.r} fill="var(--base)" stroke="var(--emerald)" strokeWidth="2" />
            <text x={m.x} y={m.y + m.r * 0.36} textAnchor="middle" fontSize={m.r * 1.05} fontWeight="700" fill="var(--emerald)" style={{ fontFamily: 'inherit' }}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── The Stoplight: a zodiac wheel, a moving planet, and a signal that changes ─
const WHEEL = { cx: 150, cy: 125, r: 100 };
const NATAL_ANGLE = 60; // degrees clockwise from the top
const wheelPoint = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: WHEEL.cx + radius * Math.sin(a), y: WHEEL.cy - radius * Math.cos(a) };
};
const LAMPS: readonly { cy: number; color: string; label: string }[] = [
  { cy: 297, color: 'var(--signal-red)', label: 'Pause' },
  { cy: 345, color: 'var(--amber)', label: 'Slow' },
  { cy: 393, color: 'var(--emerald)', label: 'Go' },
];

function SignalDrawing({ build, dim }: { build: number; dim: number }) {
  const ring = clamp01(build / 0.3);
  const travel = clamp01((build - 0.3) / 0.55);
  const eased = 1 - Math.pow(1 - travel, 3);
  const angle = NATAL_ANGLE - 360 * (1 - eased);
  const meet = travel >= 1;
  const lit = build < 0.3 ? -1 : build < 0.62 ? 0 : build < 0.85 ? 1 : 2;
  const natal = wheelPoint(NATAL_ANGLE, WHEEL.r);
  return (
    <svg
      viewBox="0 0 300 445"
      role="img"
      aria-label="Illustration of a zodiac wheel where a moving planet meets a fixed point, while a signal light changes from red to amber to green"
      style={{ width: '100%', maxWidth: 360, height: 'auto', opacity: dim, transition: 'opacity 0.5s var(--ease)' }}
    >
      <circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r} fill="none" stroke="var(--signal-red)" strokeWidth="2" strokeDasharray="1" strokeDashoffset={1 - ring} pathLength={1} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.35s var(--ease)' }} />
      <circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r - 22} fill="none" stroke="var(--signal-red)" strokeWidth="1" strokeOpacity={0.45 * ring} style={{ transition: 'stroke-opacity 0.4s var(--ease)' }} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = wheelPoint(i * 30, WHEEL.r);
        const b = wheelPoint(i * 30, WHEEL.r - 22);
        const on = clamp01((ring - i / 14) * 6);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--signal-red)" strokeWidth="1.5" strokeOpacity={0.12 + 0.7 * on} style={{ transition: 'stroke-opacity 0.3s var(--ease)' }} />;
      })}
      <circle cx={natal.x} cy={natal.y} r="7" fill="none" stroke="var(--signal-red)" strokeWidth="2" strokeOpacity={0.3 + 0.7 * ring} />
      <circle cx={natal.x} cy={natal.y} r="16" fill="var(--signal-red)" fillOpacity={meet ? 0.22 : 0} style={{ transition: 'fill-opacity 0.4s var(--ease)' }} />
      <g style={{ transformOrigin: `${WHEEL.cx}px ${WHEEL.cy}px`, transform: `rotate(${angle}deg)`, transition: 'transform 0.25s linear', opacity: clamp01((build - 0.22) / 0.08) }}>
        <circle cx={WHEEL.cx} cy={WHEEL.cy - WHEEL.r} r="7" fill="var(--signal-red)" />
      </g>
      <rect x="112" y="258" width="76" height="180" rx="22" fill="var(--base)" stroke="var(--signal-red)" strokeWidth="2" strokeOpacity="0.7" />
      {LAMPS.map((l, i) => {
        const on = lit === i;
        return (
          <g key={l.label}>
            <circle cx="150" cy={l.cy} r="27" fill={l.color} fillOpacity={on ? 0.22 : 0} style={{ transition: 'fill-opacity 0.4s var(--ease)' }} />
            <circle cx="150" cy={l.cy} r="18" fill={l.color} fillOpacity={on ? 1 : 0.1} stroke={l.color} strokeWidth="1.5" strokeOpacity={on ? 1 : 0.4} style={{ transition: 'fill-opacity 0.4s var(--ease), stroke-opacity 0.4s var(--ease)' }} />
          </g>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              {i === 0 ? <Bodygraph build={1} dim={1} /> : i === 1 ? <RoadDrawing build={1} dim={1} /> : <SignalDrawing build={1} dim={1} />}
            </div>
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
  const roadBuild = clamp01((progress - 0.34) / 0.26);
  const signalBuild = clamp01((progress - 0.67) / 0.26);
  // The drawing for the lens you are on is bright; ones already passed stay as a faint ghost; ones ahead are hidden.
  const dimFor = (i: number) => (active === i ? 1 : active > i ? 0.16 : 0);
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
        <div style={{ position: 'relative', width: '100%', maxWidth: 'min(360px, calc((100vh - 140px) * 300 / 445))', justifySelf: 'center', aspectRatio: '300 / 445' }}>
          <div aria-hidden={active !== 0} style={{ position: 'absolute', inset: 0 }}>
            <Bodygraph build={vehicleBuild} dim={dimFor(0)} />
          </div>
          <div aria-hidden={active !== 1} style={{ position: 'absolute', inset: 0 }}>
            <RoadDrawing build={roadBuild} dim={dimFor(1)} />
          </div>
          <div aria-hidden={active !== 2} style={{ position: 'absolute', inset: 0 }}>
            <SignalDrawing build={signalBuild} dim={dimFor(2)} />
          </div>
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
