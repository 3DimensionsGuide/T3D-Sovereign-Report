'use client';

/**
 * SovereignCompassCanvas.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-driven 3D Sovereign Compass for T3D scrollytelling homepage.
 *
 * ─ HOW THIS WORKS ────────────────────────────────────────────────────────────
 * This component has two modes:
 *
 *   DEMO MODE  (SPLINE_SCENE_URL = '')
 *   A high-quality animated SVG compass with full scroll-driven behaviour.
 *   Use this immediately — it works right now without any Spline account.
 *
 *   SPLINE MODE  (SPLINE_SCENE_URL = 'https://prod.spline.design/...')
 *   Replaces the SVG with your actual 3D WebGL scene from spline.design.
 *   The scroll logic drives real Spline object properties.
 *
 * ─ CREATING YOUR SPLINE SCENE ────────────────────────────────────────────────
 *   1. Go to spline.design and create a free account.
 *   2. Create a new 3D scene.
 *   3. Build three concentric ring objects and name them EXACTLY:
 *        "OuterRing"   — Amber Gold  #E5A93C  (Vehicle / Human Design)
 *        "MiddleRing"  — Emerald     #1F8A4D  (Road / Numerology)
 *        "InnerRing"   — Crimson     #991B1B  (Stoplight / Astrology)
 *        "SovereignCompass" — the parent group containing all three
 *   4. Set the scene background to transparent.
 *   5. Publish the scene and copy the .splinecode URL.
 *   6. Paste the URL into SPLINE_SCENE_URL below.
 *
 * ─ SETUP ─────────────────────────────────────────────────────────────────────
 *   npm install @splinetool/react-spline @splinetool/runtime
 */

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import type { Application, SPEObject } from '@splinetool/runtime';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

/**
 * Your Spline scene URL from spline.design → Publish → Copy URL.
 * Leave empty ('') to use the built-in SVG demo compass.
 */
const SPLINE_SCENE_URL = 'https://prod.spline.design/9g215995HTIeE37S/scene.splinecode';

/** Spline object names — must match exactly what you name them in spline.design */
const SPLINE_OBJECTS = {
  COMPASS: 'SovereignCompass',
  OUTER:   'OuterRing',   // Amber Gold  — Vehicle
  MIDDLE:  'MiddleRing',  // Emerald     — Road
  INNER:   'InnerRing',   // Crimson     — Stoplight
} as const;

/** Scroll progress breakpoints (0–1 = top to bottom of scroll container) */
const SCROLL = {
  HERO_END:     0.25,
  ALIGN_START:  0.26,
  ALIGN_END:    0.65,
  CALC_START:   0.66,
  CALC_END:     1.00,
} as const;

/** Mobile breakpoint — WebGL disabled below this width to save battery */
const MOBILE_BREAKPOINT = 768;

// ─── DYNAMIC SPLINE IMPORT (SSR-safe) ────────────────────────────────────────
const SplineComponent = dynamic(
  () => import('@splinetool/react-spline'),
  {
    ssr: false,
    loading: () => <SplineSkeleton />,
  }
);

// ─── HANDLE EXPOSED TO PARENT ─────────────────────────────────────────────────
export interface SovereignCompassHandle {
  /** Call when "Calculate My Profile" is clicked — triggers particle beam */
  triggerCalculation: () => void;
  /** Call when results are ready — fades out compass */
  triggerResultsTransition: () => void;
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface SovereignCompassProps {
  /** Scroll progress 0–1, provided by the parent scrollytelling page */
  scrollProgress: number;
}

// ─── MATH HELPERS ─────────────────────────────────────────────────────────────

/** Linear interpolation between a and b by factor t (0–1) */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

/** Map a value in [inMin, inMax] to a 0–1 progress value */
function invLerp(inMin: number, inMax: number, value: number): number {
  return Math.min(Math.max((value - inMin) / (inMax - inMin), 0), 1);
}

/** Smooth ease-in-out (cubic) */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── SVG SKELETON LOADER ──────────────────────────────────────────────────────
function SplineSkeleton() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 200 200" width={160} height={160} aria-hidden>
        <circle cx="100" cy="100" r="80" stroke="rgba(245,245,243,0.06)" strokeWidth="1" fill="none"
          strokeDasharray="4 8" style={{ animation: 'spin 6s linear infinite' }} />
        <circle cx="100" cy="100" r="60" stroke="rgba(153,27,27,0.12)" strokeWidth="1" fill="none" />
        <circle cx="100" cy="100" r="40" stroke="rgba(245,245,243,0.04)" strokeWidth="1" fill="none"
          strokeDasharray="2 6" style={{ animation: 'spin 4s linear infinite reverse' }} />
        <circle cx="100" cy="100" r="6" fill="rgba(245,245,243,0.08)" />
      </svg>
    </div>
  );
}

// ─── SVG DEMO COMPASS (active when no Spline URL is set) ─────────────────────
interface SVGCompassProps {
  scrollProgress: number;
  opacity: number;
  isMobile: boolean;
  isCalculating: boolean;
}

function SVGDemoCompass({ scrollProgress: p, opacity, isMobile, isCalculating }: SVGCompassProps) {

  // Derive transform values from scroll progress
  const heroT   = invLerp(0, SCROLL.HERO_END, p);
  const alignT  = ease(invLerp(SCROLL.ALIGN_START, SCROLL.ALIGN_END, p));
  const calcT   = ease(invLerp(SCROLL.CALC_START, SCROLL.CALC_END, p));

  // Horizontal position: right → center-left → center-right
  let translateX: number;
  if (p <= SCROLL.HERO_END) {
    translateX = isMobile ? 0 : lerp(0, 0, heroT); // stays right (handled by parent)
  } else if (p <= SCROLL.ALIGN_END) {
    translateX = lerp(0, -60, alignT);
  } else {
    translateX = lerp(-60, 40, calcT);
  }

  // Scale: normal → 1.5x → 1x
  let scale: number;
  if (p <= SCROLL.HERO_END) scale = 1;
  else if (p <= SCROLL.ALIGN_END) scale = lerp(1, 1.5, alignT);
  else scale = lerp(1.5, 1, calcT);

  // Y-axis visual tilt (represented as skew in SVG)
  const tiltDeg = p <= SCROLL.ALIGN_END
    ? lerp(0, 45, alignT)
    : lerp(45, 0, calcT);

  // Outer ring Z-separation (exploded view in calculator section)
  const outerOffsetY = lerp(0, -30, calcT);
  const innerOffsetY = lerp(0, 30, calcT);

  // Spin speeds
  const outerSpeed = isCalculating ? '0.4s' : '48s';
  const middleSpeed = isCalculating ? '0.3s' : '32s';
  const innerSpeed = isCalculating ? '0.25s' : '20s';

  const containerStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity,
    transition: 'opacity 0.6s var(--ease)',
    pointerEvents: 'none',
  };

  const svgStyle: React.CSSProperties = {
    transform: `translateX(${translateX}px) scale(${scale}) perspective(800px) rotateY(${tiltDeg}deg)`,
    transition: 'transform 0.1s linear',
    willChange: 'transform',
    filter: isCalculating ? 'drop-shadow(0 0 24px rgba(153,27,27,0.8))' : 'drop-shadow(0 0 12px rgba(153,27,27,0.2))',
  };

  return (
    <div style={containerStyle} aria-hidden>
      <svg
        viewBox="0 0 280 280"
        width={isMobile ? 360 : 560}
        height={isMobile ? 360 : 560}
        fill="none"
        style={svgStyle}
      >
        {/* ── OUTER RING — Amber Gold (Vehicle / Human Design) ─────────────── */}
        <g style={{ transformOrigin: '140px 140px', transform: `translateY(${outerOffsetY}px)` }}>
          <g style={{ transformOrigin: '140px 140px', animation: `spin ${outerSpeed} linear infinite` }}>
            <circle cx="140" cy="140" r="124" stroke="#E5A93C" strokeWidth="2" opacity="0.3" strokeDasharray="6 10" />
            <circle cx="140" cy="140" r="116" stroke="#E5A93C" strokeWidth="0.5" opacity="0.15" />
            {/* Cardinal tick marks */}
            {[0, 90, 180, 270].map(deg => (
              <line key={deg}
                x1="140" y1="18" x2="140" y2="30"
                stroke="#E5A93C" strokeWidth="2" opacity="0.6"
                style={{ transformOrigin: '140px 140px', transform: `rotate(${deg}deg)` }}
              />
            ))}
            {/* Amber node */}
            <circle cx="140" cy="20" r="5" fill="#E5A93C"
              style={{ transformOrigin: '140px 140px', filter: 'drop-shadow(0 0 6px #E5A93C)' }}
            />
          </g>
        </g>

        {/* ── MIDDLE RING — Emerald Green (Road / Numerology) ──────────────── */}
        <g style={{ transformOrigin: '140px 140px' }}>
          <g style={{ transformOrigin: '140px 140px', animation: `spin ${middleSpeed} linear infinite reverse` }}>
            <circle cx="140" cy="140" r="90" stroke="#1F8A4D" strokeWidth="1.5" opacity="0.4" />
            <circle cx="140" cy="140" r="82" stroke="#1F8A4D" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 8" />
            {/* Emerald node */}
            <circle cx="140" cy="52" r="4.5" fill="#1F8A4D"
              style={{ transformOrigin: '140px 140px', filter: 'drop-shadow(0 0 6px #1F8A4D)' }}
            />
            {/* Road path lines */}
            <path d="M 115 200 Q 130 160 140 140 Q 150 120 165 90"
              stroke="#1F8A4D" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
          </g>
        </g>

        {/* ── INNER RING — Sovereign Crimson (Stoplight / Astrology) ───────── */}
        <g style={{ transformOrigin: '140px 140px', transform: `translateY(${innerOffsetY}px)` }}>
          <g style={{ transformOrigin: '140px 140px', animation: `spin ${innerSpeed} linear infinite` }}>
            <circle cx="140" cy="140" r="58" stroke="#991B1B" strokeWidth="1.5"
              opacity={isCalculating ? 1 : 0.5}
              style={{ filter: isCalculating ? 'drop-shadow(0 0 12px #991B1B)' : 'none' }}
            />
            <circle cx="140" cy="140" r="50" stroke="#991B1B" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 6" />
            {/* Crimson node */}
            <circle cx="140" cy="84" r="4" fill="#991B1B"
              style={{ transformOrigin: '140px 140px', filter: 'drop-shadow(0 0 8px #991B1B)' }}
            />
          </g>
        </g>

        {/* ── PARTICLE BEAM — fires during calculation ──────────────────────── */}
        {isCalculating && (
          <line
            x1="140" y1="140" x2="140" y2="-20"
            stroke="#991B1B" strokeWidth="2" opacity="0.8"
            style={{
              filter: 'drop-shadow(0 0 8px #991B1B)',
              animation: 'pulse 0.3s ease-in-out infinite',
            }}
          />
        )}

        {/* ── COMPASS NEEDLE ────────────────────────────────────────────────── */}
        <g style={{ transformOrigin: '140px 140px', animation: 'pulse 3.5s ease-in-out infinite' }}>
          <polygon points="140,64 148,140 140,128 132,140" fill="#F5F5F3" opacity="0.9" />
          <polygon points="140,216 148,140 140,152 132,140" fill="rgba(245,245,243,0.25)" />
        </g>

        {/* ── STRUCTURAL LINES ──────────────────────────────────────────────── */}
        <g stroke="rgba(245,245,243,0.12)" strokeWidth="0.5">
          <line x1="140" y1="10" x2="140" y2="270" />
          <line x1="10" y1="140" x2="270" y2="140" />
        </g>

        {/* ── HUB ──────────────────────────────────────────────────────────── */}
        <circle cx="140" cy="140" r="9"
          fill="#0D0D0E" stroke="#991B1B" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 6px rgba(153,27,27,0.5))' }}
        />
        <circle cx="140" cy="140" r="3" fill="#991B1B" />
      </svg>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SovereignCompassCanvas = forwardRef<SovereignCompassHandle, SovereignCompassProps>(
  function SovereignCompassCanvas({ scrollProgress }, ref) {

    const splineRef       = useRef<Application | null>(null);
    const rafRef          = useRef<number | null>(null);
    const lastProgressRef = useRef(0);
    const [opacity,       setOpacity]       = useState(1);
    const [isMobile,      setIsMobile]      = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [splineLoaded,  setSplineLoaded]  = useState(false);

    // ── Mobile detection ────────────────────────────────────────────────────
    useEffect(() => {
      function check() { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); }
      check();
      window.addEventListener('resize', check, { passive: true });
      return () => window.removeEventListener('resize', check);
    }, []);

    // ── Handle Spline onLoad ────────────────────────────────────────────────
    const onSplineLoad = useCallback((spline: Application) => {
      splineRef.current = spline;
      setSplineLoaded(true);// Continuous ring rotation loop using requestAnimationFrame
let angle = 0;
function rotateRings() {
  const outer  = spline.findObjectByName('OuterRing');
  const middle = spline.findObjectByName('MiddleRing');
  const inner  = spline.findObjectByName('InnerRing');

  angle += 0.014;

  if (outer) {
  outer.rotation.y =  angle * 0.4;
  outer.rotation.z =  angle * 0.8;
}
if (middle) {
  middle.rotation.y = -angle * 0.6;
  middle.rotation.z = -angle * 1.2;
}
if (inner) {
  inner.rotation.y =  angle * 1.0;
  inner.rotation.z =  angle * 1.8;
}

  requestAnimationFrame(rotateRings);
}
rotateRings();

      // Set transparent background
      if (typeof spline.setBackgroundColor === 'function') {
        spline.setBackgroundColor('transparent');
      }

      // Initial position — right-aligned for hero section
      const compass = spline.findObjectByName(SPLINE_OBJECTS.COMPASS);
      if (compass) {
        compass.position.x = 3;
        compass.position.y = 0;
        compass.position.z = 0;
    compass.scale.x = 2;
    compass.scale.y = 2;
    compass.scale.z = 2;
      }
    }, []);

    // ── Update Spline object properties from scroll progress ────────────────
    const updateSplineObjects = useCallback((p: number) => {
      const spline = splineRef.current;
      if (!spline) return;

      const compass = spline.findObjectByName(SPLINE_OBJECTS.COMPASS);
      const outer   = spline.findObjectByName(SPLINE_OBJECTS.OUTER);
      const middle  = spline.findObjectByName(SPLINE_OBJECTS.MIDDLE);
      const inner   = spline.findObjectByName(SPLINE_OBJECTS.INNER);

      if (!compass) return;

      // ── Hero Section (0.00 – 0.25) ────────────────────────────────────────
      // Compass sits right-aligned, ambient Y rotation handled by Spline behavior
      if (p <= SCROLL.HERO_END) {
        compass.position.x = 3;
        compass.position.y = 0;
        compass.position.z = 0;
    compass.scale.x = 2;
    compass.scale.y = 2;
    compass.scale.z = 2;
        compass.scale.x = compass.scale.y = compass.scale.z = 1;
        compass.rotation.y = 0;
      }

      // ── Alignment Section (0.26 – 0.65) ──────────────────────────────────
      // Compass moves center-left, scales up 1.5x, tilts 45°, rings spin
      else if (p <= SCROLL.ALIGN_END) {
        const t = ease(invLerp(SCROLL.ALIGN_START, SCROLL.ALIGN_END, p));
        compass.position.x = lerp(3, -3, t);
        compass.position.y = 0;
        compass.position.z = 0;
    compass.scale.x = 2;
    compass.scale.y = 2;
    compass.scale.z = 2;
        compass.scale.x = compass.scale.y = compass.scale.z = lerp(1, 1.5, t);
        compass.rotation.y = lerp(0, Math.PI / 4, t);

        // Rings start spinning independently (emitting their states)
        if (outer)  outer.rotation.z  = t * Math.PI * 0.5;
        if (middle) middle.rotation.z = t * Math.PI * -0.3;
        if (inner)  inner.rotation.z  = t * Math.PI * 0.7;
      }

      // ── Calculator Section (0.66 – 1.00) ─────────────────────────────────
      // Flat facing camera, center-right, rings explode along Z-axis
      else {
        const t = ease(invLerp(SCROLL.CALC_START, SCROLL.CALC_END, p));
        compass.position.x = lerp(-3, 2, t);
        compass.position.y = 0;
        compass.rotation.y = lerp(Math.PI / 4, 0, t);
        compass.scale.x = compass.scale.y = compass.scale.z = lerp(1.5, 1, t);

        // Exploded view — rings separate along Z-axis
        if (outer)  outer.position.z  = lerp(0,  2, t);
        if (middle) middle.position.z = lerp(0,  0, t);
        if (inner)  inner.position.z  = lerp(0, -2, t);
      }
    }, []);

    // ── RAF-throttled scroll update for Spline ──────────────────────────────
    useEffect(() => {
      if (!SPLINE_SCENE_URL || !splineLoaded) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (Math.abs(scrollProgress - lastProgressRef.current) > 0.001) {
          updateSplineObjects(scrollProgress);
          lastProgressRef.current = scrollProgress;
        }
      });

      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [scrollProgress, splineLoaded, updateSplineObjects]);

    // ── Expose control methods to parent ────────────────────────────────────
    useImperativeHandle(ref, () => ({
      /**
       * Triggered when user clicks "Calculate My Profile".
       * In Spline mode: emits 'CALCULATE' event → particle beam fires.
       * In demo mode:   activates isCalculating state → SVG animation.
       */
      triggerCalculation() {
        setIsCalculating(true);

        if (splineRef.current) {
          // Emit the custom Spline event you set up in your scene as "CALCULATE"
          // The event triggers:
          //   — Rings spin at high frequency on respective axes
          //   — Particle beam of crimson light fires along Z-axis toward camera
          try {
            splineRef.current.emitEvent('mouseDown', SPLINE_OBJECTS.OUTER);
            splineRef.current.emitEvent('mouseDown', SPLINE_OBJECTS.MIDDLE);
            splineRef.current.emitEvent('mouseDown', SPLINE_OBJECTS.INNER);
          } catch (e) {
            // Event names may differ depending on your Spline setup
            console.warn('[T3D] Spline calculate event not found — check event names in scene', e);
          }
        }
      },

      /**
       * Triggered when server returns results.
       * Fades out the 3D compass, revealing the Bento-Grid Results Dashboard.
       */
      triggerResultsTransition() {
        setOpacity(0);
        setTimeout(() => setIsCalculating(false), 600);
      },
    }), []);

    // ── Mobile layout — fixed, non-interactive header ────────────────────────
    if (isMobile) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 240, zIndex: 0, pointerEvents: 'none',
          opacity, transition: 'opacity 0.6s var(--ease)',
          background: 'linear-gradient(to bottom, transparent, var(--base))',
        }}>
          {SPLINE_SCENE_URL ? (
            <SplineComponent scene={SPLINE_SCENE_URL} onLoad={onSplineLoad} />
          ) : (
            <SVGDemoCompass
              scrollProgress={scrollProgress}
              opacity={1}
              isMobile={true}
              isCalculating={isCalculating}
            />
          )}
        </div>
      );
    }

    // ── Desktop layout — fixed full-viewport canvas ───────────────────────────
    return (
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0,
          zIndex: 0, pointerEvents: SPLINE_SCENE_URL ? 'auto' : 'none',
          opacity, transition: 'opacity 0.6s var(--ease)',
        }}
      >
        {SPLINE_SCENE_URL ? (
          /**
           * SPLINE MODE — live 3D WebGL scene
           * The scene must have:
           *   - Objects named: SovereignCompass, OuterRing, MiddleRing, InnerRing
           *   - Transparent background
           *   - A "CALCULATE" interaction event on the rings
           */
          <SplineComponent
            scene={SPLINE_SCENE_URL}
            onLoad={onSplineLoad}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          /**
           * DEMO MODE — animated SVG compass
           * Full scroll-driven behaviour. Use while building your Spline scene.
           */
          <SVGDemoCompass
            scrollProgress={scrollProgress}
            opacity={1}
            isMobile={false}
            isCalculating={isCalculating}
          />
        )}
      </div>
    );
  }
);

SovereignCompassCanvas.displayName = 'SovereignCompassCanvas';
export default SovereignCompassCanvas;
