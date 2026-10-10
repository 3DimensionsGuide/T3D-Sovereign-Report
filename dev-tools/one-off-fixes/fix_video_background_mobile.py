#!/usr/bin/env python3
"""
T3D Mobile Video Autoplay Fix
================================
The background video worked on desktop but not mobile — the classic
signature of a React/SSR autoplay timing bug.

Root cause: in server-rendered React apps, the `muted` JSX attribute
doesn't always make it into the actual initial HTML sent to the
browser — React can instead set it as a live JS property only after
the page hydrates on the client. iOS Safari (and often mobile Chrome)
checks whether a video is genuinely muted at the exact moment it
decides whether to allow autoplay, and that check can happen before
hydration finishes setting `.muted = true`. Once blocked, it doesn't
retry. Desktop browsers are far more lenient about this timing gap,
which is exactly why it worked there and not on mobile.

Fix: attach a ref to the video element and, in a useEffect, explicitly
set videoRef.current.muted = true and call videoRef.current.play()
right after mount — this guarantees correct muted state before
attempting playback, regardless of any SSR/hydration timing.

Also adds the legacy `webkit-playsinline` attribute as a defensive
addition for older iOS Safari versions that predate the standard
`playsInline` prop.

This REPLACES the entire VideoBackground.tsx file content — it's short
enough that a full rewrite is cleaner and safer than a partial patch.

Run from project root:
  python3 fix_video_background_mobile.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'components', 'VideoBackground.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

NEW_CONTENT = """'use client';

/**
 * VideoBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed fullscreen looping video that sits behind all page content.
 * A dark overlay keeps text and UI readable above the video.
 *
 * z-index: -1 — behind the Spline compass (z:0) and page content (z:10)
 *
 * Video file: /public/videos/3dimeback.mp4
 *
 * MOBILE AUTOPLAY FIX:
 * iOS Safari (and often mobile Chrome) checks whether a video is
 * genuinely muted at the exact moment it decides whether to allow
 * autoplay. In server-rendered React apps, the `muted` JSX attribute
 * doesn't always make it into the actual initial HTML — React can set
 * it as a live JS property only after hydration, which can happen a
 * beat too late for mobile Safari's stricter, earlier check. Once
 * blocked, it does not retry.
 *
 * Fix: explicitly set `.muted = true` and call `.play()` via a ref in
 * useEffect, right after mount — this guarantees correct muted state
 * before attempting playback, regardless of hydration timing. The JSX
 * attributes are kept too, as a correct baseline/fallback.
 */

import { useEffect, useRef } from 'react';

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted as a live JS property — belt-and-suspenders alongside
    // the JSX `muted` attribute, to guarantee mobile Safari sees it in
    // time for its autoplay check.
    video.muted = true;

    // Attempt playback explicitly. play() returns a promise that can
    // reject (e.g. if the browser still blocks it for some reason) —
    // caught silently so it never surfaces as an unhandled error.
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay was blocked despite our best effort — the video
        // will simply stay on its poster frame / first frame rather
        // than throwing. No user-facing error, nothing to recover.
      });
    }
  }, []);

  return (
    <>
      {/* Looping background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        // Legacy attribute for older iOS Safari versions that predate
        // the standardized `playsInline` prop.
        {...{ 'webkit-playsinline': 'true' }}
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
"""

with open(path, 'w') as f:
    f.write(NEW_CONTENT)

print('✓ VideoBackground.tsx rewritten with mobile autoplay fix')
print()
print('─' * 56)
print('Restart: rm -rf .next && npm run dev')
print('Test on your actual phone (not just desktop responsive mode)')
print('after this deploys — desktop dev tools cannot reproduce this')
print('exact bug since it is specific to real mobile Safari behavior.')
