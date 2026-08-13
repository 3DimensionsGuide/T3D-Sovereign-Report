'use client';

/**
 * VideoBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed fullscreen looping video that sits behind all page content.
 * A dark overlay keeps text and UI readable above the video.
 *
 * z-index: -1 — behind the Spline compass (z:0) and page content (z:10)
 *
 * Video file: /public/videos/3dimeback.mp4
 */

export default function VideoBackground() {
  return (
    <>
      {/* Looping background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        style={{
          position:   'fixed',
          inset:      0,
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          objectPosition: 'center',
          zIndex:     -2,
          opacity:    0.45,
          pointerEvents: 'none',
        }}
      >
        <source src="/videos/3dimeback.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay — keeps content readable over the video */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset:    0,
          zIndex:   -1,
          background: `
            linear-gradient(
              to bottom,
              rgba(13,13,14,0.55) 0%,
              rgba(13,13,14,0.35) 40%,
              rgba(13,13,14,0.55) 100%
            )
          `,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
