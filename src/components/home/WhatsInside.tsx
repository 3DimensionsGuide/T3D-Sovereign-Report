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
import { PRODUCT_DISPLAY, PRODUCT_ORDER } from '@/lib/products/catalog';

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

/** One clause each. The pricing page carries the full copy; this is the arrival, not the catalogue. */
const DEPTH: Record<string, string> = {
  'base-report': 'All three systems, woven into one guide.',
  'advanced-sovereign-report': 'The same three at full depth: every gate, every Pinnacle, every transit.',
  'sovereign-report': 'Both of them together, for what the two cost separately.',
};

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

  // Pinning is the enhancement, not the content, which is why this starts false.
  // It is only worth doing with a mouse on a wide screen. On a touch screen the rail is
  // swiped directly, which is the native gesture and cannot stutter: scroll events arrive
  // in bursts during a touch scroll, so a rail driven from them always chases the finger.
  useEffect(() => {
    const ok = window.matchMedia('(min-width: 901px) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPinned(ok.matches && !reduce.matches);
    sync();
    ok.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    return () => {
      ok.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
    };
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
            sizes="(max-width: 900px) 82vw, 34vw"
            className="inside-page__img"
            /* All six load up front. They come to 240 KB in total, and lazy loading
               inside a clipped rail means a card arrives blank as it travels in. */
            loading="eager"
            priority={i < 2}
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
    <footer className="inside-close">
      <p className="t3d-label" style={{ marginBottom: 18 }}>Three depths</p>
      <h3 className="inside-close__h">Pick how far in you want to go.</h3>
      <p className="t3d-body" style={{ maxWidth: 620, marginBottom: 'clamp(28px,4vh,44px)' }}>
        Every report is built from the one birth moment you enter in the calculator. What changes
        between them is how deep the reading goes, not how carefully it was worked out.
      </p>

      <dl className="inside-tiers">
        {PRODUCT_ORDER.map((slug) => {
          const p = PRODUCT_DISPLAY[slug];
          if (!p) return null;
          return (
            <div key={slug} className="inside-tier">
              <dt className="inside-tier__name">{p.name}</dt>
              <dd className="inside-tier__price">{p.priceLabel}</dd>
              <dd className="inside-tier__what">{DEPTH[slug]}</dd>
            </div>
          );
        })}
      </dl>

      <div className="inside-actions">
        <Link href="/pricing" className="t3d-cta inside-cta">SEE THE THREE REPORTS</Link>
        <p className="inside-close__note">
          Each one is a PDF you download the moment you pay, and a copy is emailed to you.
          The calculator is free, and it is the place to start:{' '}
          <Link href="/#calculator" className="inside-close__link">run it first</Link>.
        </p>
      </div>
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
