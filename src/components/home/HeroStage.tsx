'use client';

/**
 * HeroStage — the seal, given depth.
 *
 * Five planes, each moving at its own rate, so the hero reads as a space rather than a
 * picture: the armillary sphere in the page's background video sits furthest back, then a
 * glow that separates the subject from it, then a ring of degree ticks, then the seal, and
 * finally a near arc that crosses in front of the seal and is blurred because it is close.
 * Occlusion and different travel rates are what make it depth; stacked elements moving as
 * one image would not.
 *
 * One scroll value and one pointer value drive everything, written as custom properties on
 * the stage, so a scroll tick restyles one element instead of re-rendering the page. The
 * rings keep a slow rotation of their own, paused when the hero is off screen.
 *
 * Reduce Motion: no entrance, no rotation, no parallax. The composition keeps its layers,
 * its overlaps and its shadows, so nothing is lost but the movement.
 * Phones: the stage sits above the headline at its own size, and the near arc is pulled in
 * so it cannot push anything sideways.
 */

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/** Fixed, not random: the server and the browser have to draw the same field. */
const STARS: readonly { x: number; y: number; r: number; o: number }[] = [
  { x: 84, y: 128, r: 1.6, o: 0.55 }, { x: 512, y: 96, r: 1.2, o: 0.4 },
  { x: 296, y: 48, r: 1.1, o: 0.35 }, { x: 548, y: 300, r: 1.7, o: 0.5 },
  { x: 60, y: 384, r: 1.3, o: 0.42 }, { x: 468, y: 520, r: 1.5, o: 0.46 },
  { x: 148, y: 548, r: 1.1, o: 0.32 }, { x: 352, y: 566, r: 1.4, o: 0.38 },
  { x: 36, y: 248, r: 1.0, o: 0.3 },  { x: 574, y: 176, r: 1.2, o: 0.34 },
  { x: 232, y: 112, r: 0.9, o: 0.28 }, { x: 420, y: 196, r: 1.0, o: 0.3 },
];

const SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const C = 300;

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded: full-precision trig differs between the server and the browser.
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { x: r2(C + r * Math.cos(a)), y: r2(C + r * Math.sin(a)) };
};

/** An arc path between two angles at one radius. */
function arc(from: number, to: number, r: number): string {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

const LENS_ARCS = [
  { d: arc(4, 112, 248), stroke: 'var(--amber)' },
  { d: arc(124, 232, 248), stroke: 'var(--emerald)' },
  { d: arc(244, 352, 248), stroke: 'var(--signal-red)' },
];

export default function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let visible = true;
    // Pointer is eased toward its target so the planes settle instead of snapping.
    let px = 0, py = 0, tx = 0, ty = 0;

    const write = () => {
      frame = 0;
      if (!visible) return;
      const y = window.scrollY;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      stage.style.setProperty('--sy', String(Math.min(y, 900)));
      stage.style.setProperty('--mx', px.toFixed(3));
      stage.style.setProperty('--my', py.toFixed(3));
      if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) {
        frame = requestAnimationFrame(write);
      }
    };
    const tick = () => { if (!frame) frame = requestAnimationFrame(write); };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      tick();
    };

    // Ambient work stops when the hero is not on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      stage.classList.toggle('is-still', !visible);
      if (visible) tick();
    });
    io.observe(stage);

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    tick();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      window.removeEventListener('pointermove', onPointer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={stageRef} className="hero-stage" aria-hidden>
      {/* Plane 1. Atmosphere: separates the subject from the sphere in the page background. */}
      <div className="hero-plane hero-plane--glow" />

      {/* Plane 2. The far field and the degree ring. */}
      <svg className="hero-plane hero-plane--rings" viewBox="0 0 600 600" focusable="false">
        {STARS.map((s) => (
          <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill="var(--parchment)" opacity={s.o} />
        ))}
        <g className="hero-spin">
          <circle cx={C} cy={C} r={272} fill="none" stroke="var(--grid-line)" strokeWidth="1" />
          <circle cx={C} cy={C} r={262} fill="none" stroke="var(--grid-line)" strokeWidth="0.5" />
          {Array.from({ length: 72 }, (_, i) => {
            const deg = i * 5;
            const major = deg % 30 === 0;
            const a = polar(deg, 272);
            const b = polar(deg, major ? 254 : 264);
            return (
              <line
                key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="var(--parchment)" strokeWidth={major ? 1 : 0.6}
                opacity={major ? 0.36 : 0.16}
              />
            );
          })}
          {SIGNS.map((g, i) => {
            const at = polar(i * 30 + 15, 285);
            return (
              <text
                key={g} x={at.x} y={at.y} fill="var(--parchment)" opacity="0.3"
                fontSize="13" textAnchor="middle" dominantBaseline="middle"
              >
                {g}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Plane 3. The three lenses, as arcs, turning the other way. */}
      <svg className="hero-plane hero-plane--arcs" viewBox="0 0 600 600" focusable="false">
        <g className="hero-spin hero-spin--back">
          {LENS_ARCS.map((a) => (
            <path key={a.stroke} d={a.d} fill="none" stroke={a.stroke} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
          ))}
          <circle cx={C} cy={C} r={196} fill="none" stroke="var(--grid-line)" strokeWidth="1" strokeDasharray="3 9" />
        </g>
      </svg>

      {/* Plane 4. The subject. */}
      <div className="hero-plane hero-plane--seal">
        <Image
          src="/logos/T3D_seal_translucent.png"
          alt=""
          width={560}
          height={560}
          priority
          sizes="(max-width: 900px) 56vw, 34vw"
          // The LCP element on the page everything funnels into. See the
          // qualities list in next.config.ts for why 50 rather than the default.
          quality={50}
        />
      </div>

      {/* Plane 5. Nearest, so it crosses the seal and carries the most blur and travel. */}
      <svg className="hero-plane hero-plane--near" viewBox="0 0 600 600" focusable="false">
        <path d={arc(96, 214, 318)} fill="none" stroke="var(--amber)" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
        <circle cx={polar(150, 318).x} cy={polar(150, 318).y} r="5" fill="var(--amber)" opacity="0.65" />
      </svg>
    </div>
  );
}
