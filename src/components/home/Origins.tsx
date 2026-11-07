'use client';

/**
 * Origins — the primer for someone who has never met any of this before.
 *
 * What each system is, where it actually came from, what it was traditionally used for,
 * and why it became the metaphor it did in T3D. It sits after the calculator, because the
 * question "where does this come from" arrives once somebody has seen a result, and the
 * honest answer is what earns the report that follows.
 *
 * The device is a time axis the three traditions are drawn onto, filling as the section
 * passes. It carries the argument by itself: astrology runs the whole width, numerology
 * most of it, Human Design is a mark at the far right. Nothing is dressed up, because the
 * comparison is more persuasive than any adjective would be.
 *
 * Every date here is from the project's own knowledge base, and the two things those
 * sources will not support are not claimed: no date is given for the codification of
 * modern numerology, and Human Design is stated as modern, which is how its own founder
 * described it.
 *
 * Scroll drives one custom property on one element; the bars are scaleX, which the
 * compositor handles. Nothing travels sideways, so there is nothing for a touch scroll to
 * chase. Reduce Motion draws the axis complete and still.
 */

import { useEffect, useRef, useState } from 'react';

/** The axis runs from 2000 BCE to now. */
const AXIS_START = -2000;
const AXIS_END = 2026;
const SPAN = AXIS_END - AXIS_START;

const pct = (year: number) => ((year - AXIS_START) / SPAN) * 100;

type System = {
  key: 'vehicle' | 'road' | 'stoplight';
  lens: string;
  glyph: string;
  system: string;
  /** Year the tradition starts on the axis. */
  from: number;
  /** What is shown under the bar. */
  age: string;
  tint: string;
  accent: string;
  what: string;
  origin: string;
  used: string;
  /** Why this tradition became this metaphor. */
  why: string;
  /** The thing people get wrong, said plainly. */
  note: string;
};

const SYSTEMS: readonly System[] = [
  {
    key: 'vehicle',
    lens: 'The Vehicle',
    glyph: '◆',
    system: 'Human Design',
    from: 1987,
    age: 'Ibiza, 1987',
    tint: '#E5A93C',
    accent: 'var(--amber)',
    what: 'A map of how your energy is built: which parts of you run consistently, which parts take their charge from the people around you, and how you are put together to make a decision.',
    origin: 'The newest of the three by a very long way. Ra Uru Hu, born Alan Robert Krakower, set it down over eight days in January 1987 on the island of Ibiza.',
    used: 'It combines four older bodies of work: Western astrology, the sixty-four hexagrams of the I Ching, the nine-centre chakra model, and the channels of the Kabbalah.',
    why: 'It describes the machine rather than the journey, which is why it is the Vehicle. Before you ask where you are going, it tells you what you are driving.',
    note: 'It does not claim to be ancient, and neither do we. Its own founder described it as a modern system.',
  },
  {
    key: 'road',
    lens: 'The Road',
    glyph: '▲',
    system: 'Numerology',
    from: -500,
    age: 'Greece, around 500 BCE',
    tint: '#4FBF7F',
    accent: 'var(--emerald)',
    what: 'Your birth date and your full name turned into numbers, and those numbers read as a shape: a Life Path, an Expression, a Soul Urge, and the Pinnacles and Challenges of each stage of a life.',
    origin: 'The root is Pythagorean Greece, where number was treated as the structure underneath things rather than a way of counting them.',
    used: 'It was a way of reading pattern and proportion, in music, in form, and in a life. The calculations in use today are the modern practice of that older idea.',
    why: 'Numbers lay a life out in stages, each with its own length and its own task, which is a road. It tells you which stretch you are on and what that stretch asks of you.',
    note: 'We will not put a date on when the modern system was assembled, because we cannot source one.',
  },
  {
    key: 'stoplight',
    lens: 'The Stoplight',
    glyph: '●',
    system: 'Astrology',
    from: -2000,
    age: 'Mesopotamia and Egypt, around 2000 BCE',
    tint: '#F58A87',
    accent: 'var(--signal-red)',
    what: 'Where the planets stood at the moment you were born, and where they are standing now, read against each other.',
    origin: 'About four thousand years old. The twelve signs were standardised in Mesopotamia around the fifth century BCE, the earliest surviving chart for a single person dates to 410 BCE, and the full system of planets, signs, houses and aspects came together in Alexandria around 100 BCE.',
    used: 'For most of its history it was not about personality. It was used for harvests, weather and the fortunes of a state, for keeping a calendar, and then for choosing the moment to act.',
    why: 'A tradition built to answer "is now the time" is a signal, which is why it is the Stoplight. Go, slow, or wait.',
    note: 'The star sign in a newspaper column is a twentieth-century invention, and it is not this.',
  },
];

/**
 * One marked moment, not several. Two marks a few decades apart collide at this scale, and
 * an unlabelled tick is decoration. The rest of the dates are in the cards.
 */
const MARK = { year: -410, label: 'First surviving birth chart for one person, 410 BCE' };

export default function Origins() {
  const ref = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--t', '1');
      setDrawn(true);
      return;
    }
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const r = el.getBoundingClientRect();
      // Fills across the first screen and a half of the section's travel.
      const t = Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (window.innerHeight * 0.9)));
      el.style.setProperty('--t', t.toFixed(3));
      if (t > 0.98) setDrawn(true);
    };
    const tick = () => { if (!frame) frame = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => { visible = Boolean(e?.isIntersecting); if (visible) tick(); });
    io.observe(el);
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="origins" ref={ref} className="origins" aria-labelledby="origins-heading">
      <header className="origins__head">
        <p className="t3d-label" style={{ marginBottom: 20 }}>Where this comes from</p>
        <h2 id="origins-heading" className="t3d-h2" style={{ maxWidth: '20ch', marginBottom: 24 }}>
          Three old questions, asked three different ways.
        </h2>
        <p className="t3d-body" style={{ maxWidth: 660 }}>
          If you have never met any of this before, start here. Each of the three is a real
          tradition with a real history, and they are not the same age as each other. One of them
          is four thousand years old. One of them is younger than the compact disc.
        </p>
      </header>

      {/* The axis. The comparison is the argument, so it is drawn to scale. */}
      <figure className="origins__axis">
        <figcaption className="sr-only">
          A time axis from 2000 BCE to today. Astrology spans the whole of it, numerology begins
          around 500 BCE, and Human Design begins in 1987.
        </figcaption>
        <div className="origins__scale" aria-hidden>
          <span style={{ left: '0%' }}>2000 BCE</span>
          <span style={{ left: `${pct(0)}%` }}>0</span>
          <span style={{ left: `${pct(1000)}%` }}>1000 CE</span>
          <span style={{ left: '100%' }}>today</span>
        </div>

        <div className="origins__track">
          <span className="origins__mark" style={{ left: `${pct(MARK.year)}%` }} aria-hidden />
          <span className="origins__marklabel" style={{ left: `${pct(MARK.year)}%` }}>{MARK.label}</span>
        </div>

        {SYSTEMS.map((s) => (
          <div key={s.key} className="origins__row">
            <p className="origins__rowname" style={{ color: s.tint }}>
              <span aria-hidden>{s.glyph}</span> {s.system}
            </p>
            <div className="origins__barwrap" aria-hidden>
              <span
                className="origins__bar"
                style={{
                  left: `${pct(s.from)}%`,
                  width: `max(6px, ${100 - pct(s.from)}%)`,
                  background: s.accent,
                }}
              />
            </div>
            <p className="origins__rowage">{s.age}</p>
          </div>
        ))}
        <p className={`origins__caption${drawn ? ' is-in' : ''}`}>
          Drawn to scale. Human Design is the mark at the right-hand end.
        </p>
      </figure>

      <div className="origins__grid">
        {SYSTEMS.map((s) => (
          <article key={s.key} className="origins__card" style={{ borderTopColor: s.accent }}>
            <p className="origins__lens" style={{ color: s.tint }}>
              <span aria-hidden>{s.glyph}</span> {s.lens}
            </p>
            <h3 className="origins__system">{s.system}</h3>
            <p className="origins__what">{s.what}</p>

            <dl className="origins__facts">
              <dt>Where it began</dt>
              <dd>{s.origin}</dd>
              <dt>What it was used for</dt>
              <dd>{s.used}</dd>
              <dt>Why it is {s.lens.toLowerCase()}</dt>
              <dd>{s.why}</dd>
            </dl>

            <p className="origins__note">{s.note}</p>
          </article>
        ))}
      </div>

      <p className="origins__close">
        Three traditions, three different questions. What you are, where you are, and whether now
        is the time. T3D runs all three from the same birth moment so the answers can be read
        together instead of one at a time.
      </p>
    </section>
  );
}
