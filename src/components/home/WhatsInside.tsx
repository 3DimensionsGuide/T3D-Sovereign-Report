'use client';

/**
 * WhatsInside — the report, shown rather than listed.
 *
 * Six real pages travel sideways while the section is pinned. Lateral movement reads as
 * a collection you are walking past, which is what this is: you are not meant to read
 * these pages, you are meant to see that they exist and that somebody made them properly.
 * Each one carries a museum label, a fact rather than a pitch.
 *
 * The pages are genuine output of this site's own report generator, run for an invented
 * chart, so nothing here is a mockup and nobody's reading is on display. Only spreads and
 * chart pages are shown; no page of written interpretation appears.
 *
 * Reduce Motion and phones that cannot pin: the same rail becomes an ordinary swipeable
 * strip with snap points, so the content and the order are identical without the pinning.
 * Only transform and opacity are animated.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Page = {
  src: string;
  title: string;
  /** The label: what this page is, stated as fact. */
  spec: string;
  lens: 'vehicle' | 'road' | 'stoplight';
  alt: string;
};

const PAGES: readonly Page[] = [
  {
    src: '/report/vehicle-spread.webp',
    title: 'Beneath the Surface',
    spec: 'The Vehicle. Section opener.',
    lens: 'vehicle',
    alt: 'A dark full-page section opener headed Beneath the Surface, opening the Vehicle section of the report.',
  },
  {
    src: '/report/vehicle-chart.webp',
    title: 'Your Bodygraph',
    spec: 'Nine centers, drawn from the chart. Defined, open, and the gates that connect them.',
    lens: 'vehicle',
    alt: 'A report page showing a Human Design bodygraph, with four filled centers in amber, five open centers outlined, and a list of defined and open centers beside it.',
  },
  {
    src: '/report/road-spread.webp',
    title: 'Beneath the Terrain',
    spec: 'The Road. Section opener.',
    lens: 'road',
    alt: 'A dark full-page section opener headed Beneath the Terrain, opening the Road section of the report.',
  },
  {
    src: '/report/road-chart.webp',
    title: 'Your Four Pinnacles',
    spec: 'Each life stage, its number, and the years it covers.',
    lens: 'road',
    alt: 'A report page laying out four numbered life pinnacles in sequence, each with its age range and a short reading.',
  },
  {
    src: '/report/stoplight-spread.webp',
    title: 'Beneath the Sky',
    spec: 'The Stoplight. Section opener.',
    lens: 'stoplight',
    alt: 'A dark full-page section opener headed Beneath the Sky, opening the Stoplight section of the report.',
  },
  {
    src: '/report/stoplight-chart.webp',
    title: 'Your Personal Planets',
    spec: 'Mercury, Venus and Mars by sign, each with its gift and its friction.',
    lens: 'stoplight',
    alt: 'A report page tabulating the personal planets by sign, each row marked with a gift and a friction.',
  },
];

const TINT: Record<Page['lens'], string> = {
  vehicle: 'var(--amber)',
  road: '#4FBF7F',
  stoplight: '#F58A87',
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function WhatsInside() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Pinning is the enhancement, not the content. Anything that cannot or should not pin
  // keeps the rail as a plain swipeable strip, which is why this starts false.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPinned(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(r.height - window.innerHeight, 1);
      const p = clamp01(-r.top / span);
      setProgress((prev) => (Math.abs(prev - p) > 0.003 ? p : prev));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pinned]);

  // How far the rail has to travel: its own width, less one screen of it.
  const [travel, setTravel] = useState(0);
  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const rail = railRef.current;
      if (!rail) return;
      setTravel(Math.max(0, rail.scrollWidth - rail.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [pinned]);

  const active = Math.min(PAGES.length - 1, Math.round(progress * (PAGES.length - 1)));

  const header = (
    <header style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,10vh,120px) clamp(20px,4vw,64px) clamp(24px,4vh,44px)' }}>
      <p className="t3d-label" style={{ marginBottom: 20 }}>Inside your report</p>
      <h2 id="inside-heading" className="t3d-h2" style={{ maxWidth: '22ch', marginBottom: 24 }}>
        It is a book about one person, and that person is you.
      </h2>
      <p className="t3d-body" style={{ maxWidth: 640 }}>
        Every page below is a real page, generated by this site for an invented chart. These are
        the openers and the charts. The written sections are not shown, because those belong to
        whoever the report was made for.
      </p>
    </header>
  );

  const rail = (
    <div
      ref={railRef}
      className={pinned ? 'inside-rail' : 'inside-rail inside-rail--swipe'}
      role="list"
      aria-label="Pages from a sample report"
      /* As a swipe strip this is a scroll container, so it has to be reachable and
         scrollable from the keyboard as well as by touch. */
      tabIndex={pinned ? undefined : 0}
      style={pinned ? { transform: `translate3d(${-progress * travel}px,0,0)` } : undefined}
    >
      {PAGES.map((page, i) => (
        <figure
          key={page.src}
          role="listitem"
          className="inside-page"
          style={{ opacity: pinned ? (i === active ? 1 : 0.55) : 1 }}
        >
          <Image
            src={page.src}
            alt={page.alt}
            width={1020}
            height={1320}
            sizes="(max-width: 640px) 70vw, 32vw"
            className="inside-page__img"
            loading={i < 2 ? 'eager' : 'lazy'}
          />
          <figcaption className="inside-page__cap">
            <span className="inside-page__title" style={{ color: TINT[page.lens] }}>{page.title}</span>
            <span className="inside-page__spec">{page.spec}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );

  const close = (
    <footer style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(32px,5vh,56px) clamp(20px,4vw,64px) clamp(56px,10vh,120px)' }}>
      <p className="t3d-body" style={{ maxWidth: 640 }}>
        The pages here are from the Advanced Report. Whichever depth you choose, it arrives as a
        PDF you download straight after paying, and a copy is emailed to you.{' '}
        <Link href="/pricing" style={{ color: 'var(--parchment)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
          See the three reports side by side
        </Link>
        .
      </p>
    </footer>
  );

  if (!pinned) {
    return (
      <section id="inside" aria-labelledby="inside-heading" style={{ background: 'var(--base)', position: 'relative' }}>
        {header}
        {rail}
        {close}
      </section>
    );
  }

  return (
    <section id="inside" aria-labelledby="inside-heading" style={{ background: 'var(--base)', position: 'relative' }}>
      {header}
      <div ref={trackRef} className="inside-track">
        <div className="inside-stage">
          {rail}
          <div role="presentation" className="inside-dots">
            {PAGES.map((p, i) => (
              <span key={p.src} style={{ background: i <= active ? TINT[p.lens] : 'var(--step-off)' }} />
            ))}
          </div>
        </div>
      </div>
      {close}
    </section>
  );
}
