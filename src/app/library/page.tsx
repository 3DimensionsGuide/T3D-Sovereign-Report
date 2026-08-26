import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';

export const metadata = {
  title: 'Field Library — T3D Sovereign Report',
  description: 'Reference material for the systems behind your Sovereign Report.',
};

const S = {
  wrap:  { maxWidth: 760, margin: '0 auto', padding: 'clamp(28px,4vw,48px)' },
  h1:    { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: 'var(--parchment)', marginBottom: 8, lineHeight: 1.1 },
  meta:  { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--parchment-40)', marginBottom: 20, maxWidth: '60ch', lineHeight: 1.6 },
  h2:    { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontStyle: 'italic', fontWeight: 400, marginTop: 52, marginBottom: 14 },
  p:     { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.75, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 16 },
  note:  { fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, color: 'var(--parchment-40)', fontStyle: 'italic', marginTop: 8 },
  divider: { height: 1, background: 'var(--card-border, rgba(245,245,243,0.1))', margin: '44px 0' },
  link:  { color: 'var(--emerald)' },
};

export default function LibraryPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={S.wrap}>
          <h1 style={S.h1}>The Field Library</h1>
          <p style={S.meta}>
            Your Sovereign Report is a curated selection — chosen for behavioral and
            navigational usefulness, not exhaustive technical coverage. This page holds the
            reference material behind that curation: how each system works, what was left
            out of the core report and why, and where to go for the complete technical data
            behind your specific chart.
          </p>

          <div style={S.divider} />

          <h2 style={{ ...S.h2, color: 'var(--amber)' }}>Why Do My Tropical and Sidereal Placements Differ?</h2>
          <p style={S.p}>
            Your report shows two versions of your Sun, Moon, and Rising — one Tropical, one
            Sidereal. Astrology measures where the planets sit against the zodiac, and the
            question is: measured from what starting point?
          </p>
          <p style={S.p}>
            <strong>Tropical astrology</strong> — the system most familiar in the West —
            measures from the Spring Equinox, a seasonal reference point. <strong>Sidereal
            astrology</strong> — used in Vedic and several classical traditions — measures
            from the actual, visible position of the fixed stars. Over roughly twenty-six
            thousand years, the two have drifted apart by a gap called the ayanamsha —
            currently a little over 24 degrees. Your report calculates Sidereal placements
            using the Lahiri ayanamsha, the most widely used reference point in that tradition.
          </p>
          <p style={S.p}>
            Neither system is more &quot;real&quot; than the other — they are two different,
            equally valid coordinate systems layered onto the same birth moment. Tropical
            tends to describe the pattern you already recognize in lived, everyday experience.
            Sidereal tends to offer a second angle of reflection — often adjacent, not
            contradictory. Your report treats both as information, not a verdict, and never
            asks you to choose a winner.
          </p>
          <p style={S.note}>
            If your birth time was uncertain or unavailable when you completed your report,
            your Rising sign in both systems may have been limited rather than estimated —
            see &quot;Updating an Uncertain Birth Time&quot; below.
          </p>

          <div style={S.divider} />

          <h2 style={{ ...S.h2, color: 'var(--amber)' }}>Human Design — What&apos;s in the Report vs. the Full Chart</h2>
          <p style={S.p}>
            Your report includes your Type, Strategy, Authority, Profile, and the centers most
            relevant to daily decision-making. It does not include every one of your 64 gates,
            every active channel with its full technical name, your Incarnation Cross, or your
            Variable (arrows) — these are precise, technical layers that matter most to readers
            already deep into Human Design study, and including all of them in a navigational
            report would bury the parts most people actually use day to day.
          </p>
          <p style={S.p}>
            Your Bodygraph is calculated using the Swiss Ephemeris, at the traditional 88° solar
            arc prior to birth for your Design (unconscious) activations, combined with your
            exact birth moment for your Personality (conscious) activations.
          </p>

          <div style={S.divider} />

          <h2 style={{ ...S.h2, color: 'var(--emerald)' }}>Numerology — Calculation Method</h2>
          <p style={S.p}>
            All numerology in your report uses the Pythagorean method. Life Path, Personal
            Year, Pinnacles, and Challenges are calculated from your date of birth. Expression
            (Destiny), Soul Urge, Personality, Hidden Passion, and Karmic Lessons require your
            full birth name and only appear if that was provided. Master numbers (11, 22, 33)
            are preserved at every stage of calculation rather than reduced further.
          </p>

          <div style={S.divider} />

          <h2 style={{ ...S.h2, color: 'var(--crimson)' }}>Astrology — Calculation Method</h2>
          <p style={S.p}>
            Both Tropical and Sidereal charts use Whole Sign house placement and are calculated
            from the Swiss Ephemeris using your exact birth date, time, and coordinates. Your
            report presents a curated set of placements — Big Three, chart ruler, one key
            life arena, and the most behaviorally significant Sun-Moon dynamic — rather than a
            full twelve-house inventory or complete aspect table.
          </p>

          <div style={S.divider} />

          <h2 style={S.h2}>Updating an Uncertain Birth Time</h2>
          <p style={S.p}>
            If your birth time was unknown or approximate, some placements in your report —
            primarily your Rising sign and anything derived from it — were limited rather than
            calculated from a guess, since a confident-looking wrong answer is worse than an
            honest gap. If you&apos;ve since confirmed your exact birth time, visit{' '}
            <a href="/update-time" style={S.link}>3dimensions.guide/update-time</a> to request
            an updated report.
          </p>

          <div style={S.divider} />

          <h2 style={S.h2}>Full Technical Data for Your Specific Chart</h2>
          <p style={S.p}>
            This page covers general methodology across all readers. If you&apos;d like the
            complete technical breakdown specific to your own chart — every gate, every house
            cusp, every aspect and its orb — email{' '}
            <a href="mailto:privacy@3dimensions.guide" style={S.link}>privacy@3dimensions.guide</a>{' '}
            with the name and email used on your order, and we&apos;ll follow up directly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
