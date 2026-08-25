#!/usr/bin/env python3
"""
T3D Mobile Video Autoplay Fix (v2)
=====================================
The v1 fix called .play() immediately on mount — but on a mobile
network, the video's actual data may not have downloaded yet at that
exact moment, so the play attempt can fail simply because there's
nothing to play, independent of any autoplay policy. That attempt was
never retried.

This version keeps the original mount-time attempt (harmless, may
succeed on fast connections) and ADDS listeners for 'loadedmetadata'
and 'canplay' that also attempt playback once the browser confirms it
actually has data — giving the video multiple real chances to start
once it's genuinely ready, rather than one single early attempt.

Also adds preload="auto" to encourage the browser to fetch video data
sooner rather than waiting.

Run from project root:
  python3 fix_video_background_mobile_v2.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'components', 'VideoBackground.tsx'
)

NEW_CONTENT = """'use client';

/**
 * VideoBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed fullscreen looping video that sits behind all page content.
 * A dark overlay keeps text and UI readable above the video.
 *
 * Video file: /public/videos/3dimeback.mp4
 *
 * MOBILE AUTOPLAY FIX (v2):
 * Two separate mobile-specific issues are addressed here:
 *
 *   1. React/SSR timing — `muted` set via JSX doesn't always reach the
 *      browser in time for iOS Safari's autoplay check. Fixed by
 *      forcing `.muted = true` imperatively via a ref.
 *
 *   2. Data readiness — calling .play() the instant the component
 *      mounts can fail on mobile networks if the video hasn't actually
 *      downloaded any data yet. Fixed by ALSO attempting playback on
 *      the 'loadedmetadata' and 'canplay' events, giving it multiple
 *      real chances once the browser confirms data is genuinely ready
 *      — not just one early guess.
 */

import { useEffect, useRef } from 'react';

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const attemptPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // Still blocked or not ready — later events below will retry.
        });
      }
    };

    // Attempt immediately (works fine on fast connections / desktop).
    attemptPlay();

    // Retry once the browser confirms it actually has video data —
    // covers the case where the immediate attempt above had nothing
    // to play yet on a slower mobile connection.
    video.addEventListener('loadedmetadata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);

    return () => {
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
    };
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
        preload="auto"
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

print('✓ VideoBackground.tsx updated with retry-on-data-ready logic')
print()
print('─' * 56)
print('Restart: rm -rf .next && npm run dev')
print('Then: npm run build, commit, push, and test on your phone again')
print('AFTER checking the two device settings mentioned in chat.')
