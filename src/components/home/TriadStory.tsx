'use client';

/**
 * TriadStory — the scroll-driven "one trip, three lenses" section.
 *
 * Desktop: a tall section with a pinned stage. Scroll progress (0–1) moves
 * through three scenes: Vehicle (amber), Road (emerald), Stoplight (crimson).
 * Scene 1 builds an illustrative bodygraph centre by centre.
 * Scene 2 draws a winding road toward a rising horizon, with four pinnacle markers switching on.
 * Scene 3 turns a zodiac wheel until a moving planet meets a natal point, then the signal goes red, amber, green.
 * Phones: the same pinned scroll story, stacked (drawing above, words below) and sized to the screen height.
 * Reduce Motion: the same content as static stacked scenes, with every drawing fully built.
 * Only transform, opacity and SVG paint (stroke and fill) are animated; nothing that moves layout.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Scene = {
  key: 'vehicle' | 'road' | 'stoplight';
  label: string;
  system: string;
  headline: string;
  /** What the system is, in plain words. Carried over from the framework cards this section replaced. */
  what: string;
  /** What T3D does with it. */
  body: string;
  /** One line on what it is for. These three read as a set at the end of the section. */
  payoff: string;
  /** The lens colour, for the drawing and the progress marks. */
  color: string;
  /** A lighter tint of the same colour, for text. Reaches 7:1 on the page ground; the
      graphic colours do not, and small text in them was failing AAA. */
  textColor: string;
};

const SCENES: readonly Scene[] = [
  {
    key: 'vehicle',
    label: 'The Vehicle',
    system: 'Human Design',
    headline: 'Start with the machine you drive.',
    what: 'A map of how your energy is built, worked out from where the Sun, Moon and planets stood at your birth and again about three months before it.',
    body: 'T3D reads your Type, Strategy and Authority, plus your defined centers: the precision machinery beneath every decision.',
    payoff: 'tells you how you decide.',
    color: 'var(--amber)',
    textColor: '#E5A93C',
  },
  {
    key: 'road',
    label: 'The Road',
    system: 'Numerology',
    headline: 'Then read the road ahead.',
    what: 'The Pythagorean system, which turns your birth date and full name into numbers: Life Path, Destiny, Soul Urge, and the Pinnacles and Challenges of each life stage.',
    body: 'T3D shows the stretch of road you are on now, and the Personal Day you are living today.',
    payoff: 'tells you which chapter you are in.',
    color: 'var(--emerald)',
    textColor: '#4FBF7F',
  },
  {
    key: 'stoplight',
    label: 'The Stoplight',
    system: 'Astrology',
    headline: 'Move when the signal says go.',
    what: 'Your birth chart, calculated from astronomical data (the Swiss Ephemeris), set against where the planets are right now.',
    body: 'T3D treats the sky as weather. It compares today with your chart and reads it as Go, Slow or Pause.',
    payoff: 'tells you whether today is open.',
    color: 'var(--signal-red)',
    textColor: '#F58A87',
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
  // Rounded so the server and the browser print identical numbers (full-precision trig differs in the last digit).
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { x: r2(WHEEL.cx + radius * Math.sin(a)), y: r2(WHEEL.cy - radius * Math.cos(a)) };
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

function SceneText({ scene, index, compact = false }: { scene: Scene; index: number; compact?: boolean }) {
  return (
    <>
      <p className="t3d-label" style={{ color: scene.textColor, marginBottom: compact ? 8 : 14 }}>
        Lens {index + 1} of 3: {scene.label}
      </p>
      <h3 className="t3d-h2" style={{ marginBottom: compact ? 8 : 16, ...(compact ? { fontSize: 'clamp(22px,6.4vw,28px)' } : {}) }}>{scene.headline}</h3>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: compact ? 17 : 'clamp(20px,2vw,26px)', color: scene.textColor, marginBottom: compact ? 8 : 14 }}>
        {scene.system}
      </p>
      <p className="t3d-body" style={{ maxWidth: 480, marginBottom: compact ? 10 : 14, ...(compact ? { fontSize: 13.5, lineHeight: 1.5 } : {}) }}>{scene.what}</p>
      <p className="t3d-body" style={{ maxWidth: 480, color: 'var(--parchment)', ...(compact ? { fontSize: 14, lineHeight: 1.5 } : {}) }}>{scene.body}</p>
    </>
  );
}

/** The section header. The framework cards used to say this, above a second explanation of the same three lenses. */
function Header() {
  return (
    <header style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,10vh,120px) clamp(20px,4vw,64px) clamp(28px,5vh,56px)' }}>
      <p className="t3d-label" style={{ marginBottom: 20 }}>The framework</p>
      <h2 id="framework-heading" className="t3d-h2" style={{ maxWidth: '24ch', marginBottom: 24 }}>
        Three ways of reading you. One way of using them.
      </h2>
      <p className="t3d-body" style={{ maxWidth: 640 }}>
        Human Design, Numerology and Astrology each answer a different question about you. T3D calculates all three from
        the same birth moment and puts them to work on one thing: the decision in front of you.
      </p>
    </header>
  );
}

/** The resolution: the three lenses read as one set, then the honest limits, then the ask. */
function Close({ cta }: { cta: React.ReactNode }) {
  return (
    <footer style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(40px,7vh,80px) clamp(20px,4vw,64px) clamp(56px,10vh,120px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(16px,3vw,48px)' }}>
        {SCENES.map((s) => (
          <p key={s.key} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(20px,2vw,26px)', lineHeight: 1.3, color: 'var(--parchment)', margin: 0 }}>
            <span style={{ color: s.textColor }}>{s.label}</span> {s.payoff}
          </p>
        ))}
      </div>
      <p className="t3d-body" style={{ maxWidth: 640, marginTop: 'clamp(24px,4vh,40px)' }}>
        Together they give you one clear read, so you act on purpose instead of by habit. These are interpretive traditions
        for reflection. They do not predict events and are not medical, legal or financial advice.
      </p>
      {cta}
    </footer>
  );
}

export default function TriadStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
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

  const static_ = reduced;

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
    <Link href="/#calculator" className="t3d-cta" style={{ width: 'auto', display: 'inline-flex', padding: isMobile ? '14px 28px' : '16px 40px', marginTop: isMobile ? 16 : 32 }}>
      BEGIN CALCULATION
    </Link>
  );

  // ── Static layout: Reduce Motion only ───────────────────────────────
  if (static_) {
    return (
      <section id="framework" aria-labelledby="framework-heading" style={{ background: 'var(--base)', position: 'relative' }}>
        <Header />
        <div id="system" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px,4vw,64px)' }}>
          {SCENES.map((scene, i) => (
            <article key={scene.key} className={`t3d-card flash-${scene.key}`} style={{ padding: 'clamp(20px,4vw,32px)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                {i === 0 ? <Bodygraph build={1} dim={1} /> : i === 1 ? <RoadDrawing build={1} dim={1} /> : <SignalDrawing build={1} dim={1} />}
              </div>
              <SceneText scene={scene} index={i} />
            </article>
          ))}
        </div>
        <Close cta={cta} />
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
    <section id="framework" aria-labelledby="framework-heading" style={{ background: 'var(--base)', position: 'relative' }}>
      <Header />
      <div id="system" ref={sectionRef} style={{ height: isMobile ? '320svh' : '340vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: isMobile ? '100svh' : '100vh', overflow: 'hidden',
        background: `radial-gradient(90% 80% at 25% 50%, ${active === 0 ? 'rgba(229,169,60,0.10)' : active === 1 ? 'rgba(31,138,77,0.12)' : 'rgba(217,83,83,0.10)'} 0%, var(--base) 70%)`,
        transition: 'background 0.6s var(--ease)',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gridTemplateRows: isMobile ? 'auto 1fr' : undefined, alignItems: 'center',
        padding: isMobile ? '72px 20px 76px' : '80px clamp(24px,5vw,80px) 40px', gap: isMobile ? 14 : 'clamp(24px,4vw,64px)',
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? 'max(125px, min(300px, calc((100svh - 430px) * 300 / 445)))' : 'min(360px, calc((100vh - 140px) * 300 / 445))', justifySelf: 'center', aspectRatio: '300 / 445' }}>
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
          <p className="t3d-label" style={{ marginBottom: isMobile ? 12 : 28 }}>One journey, three lenses</p>
          <div aria-live="polite" key={scene.key} style={{ animation: 'sceneIn 0.5s var(--ease) both' }}>
            <SceneText scene={scene} index={active} compact={isMobile} />
          </div>
          <div role="presentation" style={{ display: 'flex', gap: 8, marginTop: isMobile ? 18 : 36 }}>
            {SCENES.map((s, i) => (
              <span key={s.key} style={{ width: 48, height: 3, background: i <= active ? s.color : 'var(--step-off)', transition: 'background 0.4s var(--ease)' }} />
            ))}
          </div>
        </div>
      </div>
      </div>
      <Close cta={cta} />
    </section>
  );
}
