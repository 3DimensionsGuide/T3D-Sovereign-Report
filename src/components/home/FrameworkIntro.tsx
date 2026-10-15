/**
 * FrameworkIntro: the plain-language section above "One journey, three lenses".
 * What Human Design, Numerology and Astrology each are, what T3D does with them, and what that is worth to a reader.
 * No hooks and no motion, so it renders on the server and reads the same with Reduce Motion on.
 * Each lens carries its colour AND a shape and a name, so colour is never the only signal.
 */

type Lens = {
  key: 'vehicle' | 'road' | 'stoplight';
  glyph: string;
  name: string;
  system: string;
  accent: string; // brand colour, used for the edge
  text: string; // lighter tint of the same colour for small text (7:1 on the page background)
  what: string;
  how: string;
  value: string;
};

const LENSES: readonly Lens[] = [
  {
    key: 'vehicle',
    glyph: '◆',
    name: 'The Vehicle',
    system: 'Human Design',
    accent: 'var(--amber)',
    text: 'var(--amber)',
    what: 'A map of how your energy is built, worked out from where the Sun, Moon and planets stood at your birth and again about three months before it.',
    how: 'T3D reads your Type, Strategy and Authority: the way you are designed to take in the world and make a decision.',
    value: 'You stop borrowing someone else’s way of deciding and start using your own.',
  },
  {
    key: 'road',
    glyph: '▲',
    name: 'The Road',
    system: 'Numerology',
    accent: 'var(--emerald)',
    text: '#4FBF7F',
    what: 'The Pythagorean system, which turns your birth date and full name into numbers: Life Path, Destiny, Soul Urge, and the Pinnacles and Challenges of each life stage.',
    how: 'T3D shows the stretch of road you are on now, and the Personal Day you are living today.',
    value: 'You can see the shape of the season you are in and what it asks of you.',
  },
  {
    key: 'stoplight',
    glyph: '●',
    name: 'The Stoplight',
    system: 'Astrology',
    accent: 'var(--crimson)',
    text: '#F58A87',
    what: 'Your birth chart, calculated from astronomical data (the Swiss Ephemeris), set against where the planets are right now.',
    how: 'T3D treats the sky as weather. It compares today with your chart and reads it as Go, Slow or Pause.',
    value: 'You know when conditions are open to act and when it is wiser to wait.',
  },
] as const;

const TOGETHER: readonly { lens: string; line: string }[] = [
  { lens: 'The Vehicle', line: 'tells you how you decide.' },
  { lens: 'The Road', line: 'tells you which chapter you are in.' },
  { lens: 'The Stoplight', line: 'tells you whether today is open.' },
];

export default function FrameworkIntro() {
  return (
    <section
      id="framework"
      aria-labelledby="framework-heading"
      style={{ padding: 'clamp(56px,10vh,120px) clamp(20px,4vw,64px)', background: 'var(--base)', position: 'relative' }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p className="t3d-label" style={{ marginBottom: 20 }}>The framework</p>
        <h2 id="framework-heading" className="t3d-h2" style={{ maxWidth: '24ch', marginBottom: 24 }}>
          Three ways of reading you. One way of using them.
        </h2>
        <p className="t3d-body" style={{ maxWidth: 640, marginBottom: 'clamp(32px,6vh,64px)' }}>
          Human Design, Numerology and Astrology each answer a different question about you. T3D calculates all three from
          the same birth moment and puts them to work on one thing: the decision in front of you.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
          {LENSES.map(l => (
            <article key={l.key} className="t3d-card" style={{ padding: 'clamp(20px,3vw,32px)', borderLeft: `3px solid ${l.accent}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <header>
                <p className="t3d-label" style={{ color: l.text, marginBottom: 10 }}>
                  <span aria-hidden="true">{l.glyph}</span> {l.name}
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(24px,2.4vw,30px)', fontWeight: 500, lineHeight: 1.15, color: 'var(--parchment)' }}>
                  {l.system}
                </h3>
              </header>
              <p className="t3d-body">{l.what}</p>
              <p className="t3d-body" style={{ color: 'var(--parchment)' }}>{l.how}</p>
              <p className="t3d-body" style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--grid-line)', fontStyle: 'italic' }}>
                {l.value}
              </p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 'clamp(40px,7vh,80px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(16px,3vw,48px)' }}>
          {TOGETHER.map((t, i) => (
            <p key={t.lens} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(20px,2vw,26px)', lineHeight: 1.3, color: 'var(--parchment)' }}>
              <span style={{ color: LENSES[i]!.text }}>{t.lens}</span> {t.line}
            </p>
          ))}
        </div>

        <p className="t3d-body" style={{ maxWidth: 640, marginTop: 'clamp(24px,4vh,40px)' }}>
          Together they give you one clear read, so you act on purpose instead of by habit. These are interpretive traditions
          for reflection. They do not predict events and are not medical, legal or financial advice.
        </p>
      </div>
    </section>
  );
}
