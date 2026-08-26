import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';

export const metadata = {
  title: 'Update Your Birth Time — T3D Sovereign Report',
  description: 'Request an updated report with a confirmed birth time.',
};

const S = {
  wrap:  { maxWidth: 680, margin: '0 auto', padding: 'clamp(28px,4vw,48px)' },
  h1:    { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: 'var(--parchment)', marginBottom: 20, lineHeight: 1.1 },
  p:     { fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.75, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 20 },
  box:   { padding: 'clamp(24px,3vw,36px)', border: '1px solid var(--card-border, rgba(245,245,243,0.12))', marginTop: 36, marginBottom: 36 },
  label: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--parchment-40)', marginBottom: 12 },
  li:    { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.8, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 8 },
  cta:   {
    display: 'inline-block', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' as const,
    color: 'var(--base)', background: 'var(--crimson)',
    padding: '16px 32px', textDecoration: 'none', marginTop: 8,
  },
};

export default function UpdateTimePage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={S.wrap}>
          <h1 style={S.h1}>Update Your Birth Time</h1>

          <p style={S.p}>
            If your Sovereign Report noted that your birth time was uncertain or unavailable,
            some placements — primarily your Rising sign, chart ruler, and anything derived
            from house positions — were limited rather than estimated. We do this
            intentionally: a confident-looking wrong answer is worse than an honest gap.
          </p>

          <p style={S.p}>
            If you&apos;ve since found your exact birth time — from a birth certificate,
            hospital record, or a parent&apos;s memory you now trust — we can generate an
            updated report with your complete, accurate chart.
          </p>

          <div style={S.box}>
            <p style={S.label}>To request an update, email us with:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li style={S.li}>The name and email address used on your original order</li>
              <li style={S.li}>Your confirmed birth time (as precisely as you have it)</li>
              <li style={S.li}>The source of that time, if you have it (birth certificate, hospital record, etc.) — not required, but helpful</li>
            </ul>
          </div>

          <p style={S.p}>
            We&apos;ll recalculate your chart with the corrected time and send your updated
            report directly to the email on file — there&apos;s no charge for this correction.
          </p>

          <a href="mailto:privacy@3dimensions.guide?subject=Birth%20Time%20Update%20Request" style={S.cta}>
            Email Your Corrected Birth Time
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
