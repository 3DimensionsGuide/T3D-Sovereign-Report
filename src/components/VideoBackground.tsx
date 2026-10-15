'use client';

/**
 * VideoBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed fullscreen looping video that sits behind all page content.
 * A dark overlay keeps text and UI readable above the video.
 *
 * Video file: /public/videos/3dimeback.mp4
 *
 * Speed: the loop plays only on larger screens for visitors who have not asked for less motion or less data.
 * Everyone else gets a still frame of the same scene (see shouldPlayVideo below).
 */

import { useEffect, useRef, useState } from 'react';

const POSTER = '/videos/3dimeback-poster.jpg';

/**
 * The loop only plays on larger screens when the visitor has not asked for less motion or less data.
 * Everyone else sees a still frame of the same scene, which costs about 70 KB instead of 1 MB.
 */
function shouldPlayVideo(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 767px)').matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return true;
}

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setPlay(shouldPlayVideo());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPlay(shouldPlayVideo());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !play) return;
    video.muted = true;
    const attemptPlay = () => {
      video.play()?.catch(() => {
        // Not ready yet: the events below try again.
      });
    };
    attemptPlay();
    video.addEventListener('loadedmetadata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);
    return () => {
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
    };
  }, [play]);

  const fill = {
    position: 'fixed' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    objectPosition: 'center',
    zIndex: -2,
    opacity: 0.45,
    pointerEvents: 'none' as const,
  };

  return (
    <>
      {play ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER}
          aria-hidden
          style={fill}
        >
          <source src="/videos/3dimeback.mp4" type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER} alt="" aria-hidden width={1280} height={720} fetchPriority="low" decoding="async" style={fill} />
      )}

      {/* Dark overlay keeps content readable over the background */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: 'linear-gradient(to bottom, rgba(13,13,14,0.55) 0%, rgba(13,13,14,0.35) 40%, rgba(13,13,14,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
