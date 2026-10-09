import Nav from '@/components/navigation/Nav';
import Footer from '@/components/navigation/Footer';

export const metadata = {
  title: 'Privacy Policy — T3D',
  description: 'How T3D collects, uses, and protects your data on the website and in the app.',
};

const S = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: 'clamp(28px,4vw,48px)' },
  h1:   { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: 'var(--parchment)', marginBottom: 8, lineHeight: 1.1 },
  meta: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--parchment-40)', marginBottom: 48 },
  h2:   { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: 'var(--parchment)', marginTop: 44, marginBottom: 14 },
  p:    { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 16 },
  li:   { fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--parchment-70, rgba(245,245,243,0.75))', marginBottom: 8 },
  link: { color: 'var(--emerald)' },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={S.wrap}>
          <h1 style={S.h1}>Privacy Policy</h1>
          <p style={S.meta}>Last updated: October 2026 · The 3 Dimensions (T3D) · 3dimensions.guide</p>

          <p style={S.p}>
            This policy explains what information T3D collects when you use the Sovereign
            Calculator, purchase a report, or use the T3D iPhone app, how that information
            is used, and how you can request its removal.
          </p>

          <h2 style={S.h2}>What We Collect</h2>
          <p style={S.p}>To generate your report, we collect:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li style={S.li}>Your first and last name (and middle name, if provided)</li>
            <li style={S.li}>Your email address</li>
            <li style={S.li}>Your date of birth, birth time, and birth location</li>
            <li style={S.li}>Payment information, processed directly by Stripe — we never see or store your card details ourselves</li>
            <li style={S.li}>Your internet address (IP address), used briefly to limit abuse. It is kept in short-lived counters that expire within an hour, and it is not linked to your chart</li>
          </ul>

          <h2 style={S.h2}>In the T3D App</h2>
          <p style={S.p}>
            The app asks for the same details as the website. When you create or update your
            chart, they are saved on your phone and also sent to and saved on our server, so
            your readings can be calculated and shown. Each time you calculate a chart, a record
            of it is saved on our server.
          </p>
          <p style={S.p}>
            Some things stay on your phone only: your decision log and practice entries, your
            choice of date on the Today screen, and the saved details of another person if you
            use Decide Together or the relationship views.
          </p>

          <h2 style={S.h2}>Another Person&apos;s Details</h2>
          <p style={S.p}>
            If you add another person in the app, you enter a name or nickname, their birth date,
            birth time (if known) and birth place. These details are saved only on your phone. They
            are sent to our server each time we need to calculate the reading, used for that
            calculation, and then discarded. We do not save them in our database and we do not
            write them to our logs. You can remove them from your phone at any time in the app.
            Please add someone only if you are comfortable doing so.
          </p>

          <h2 style={S.h2}>How We Use It</h2>
          <p style={S.p}>
            Your birth data is used exclusively to calculate your Human Design, Numerology,
            and Astrology placements, and to generate your personalized synthesis paragraphs.
            Your name and email are used to deliver your report and, if you&apos;ve opted in,
            occasional follow-up communication from T3D. In the app, your details are also used
            to show your readings, your daily view, and the relationship views.
          </p>
          <p style={S.p}>
            We do not sell your data. We do not share it with advertisers. We do not use it
            for any purpose beyond generating and delivering the product you purchased.
          </p>

          <h2 style={S.h2}>Third-Party Services We Use</h2>
          <p style={S.p}>
            A small number of trusted service providers process parts of your data on our
            behalf, strictly to run the service:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li style={S.li}><strong>Stripe</strong> — processes payment. We never receive or store your full card number.</li>
            <li style={S.li}><strong>Anthropic (Claude)</strong> — writes the personalized synthesis paragraphs in your report. It receives your first name, your birth date and your calculated placements. It does not receive your email address, last name, birth time or birth place.</li>
            <li style={S.li}><strong>GeoNames</strong> — receives the birth city and country you enter, and returns coordinates and time zone data needed for accurate calculations.</li>
            <li style={S.li}><strong>Google Maps (Places)</strong> — on the website calculator, suggests places as you type your birth city. This runs in your browser.</li>
            <li style={S.li}><strong>Resend</strong> — delivers the emails we send you, including your report.</li>
            <li style={S.li}><strong>Vercel</strong> — runs the website and the app&apos;s server.</li>
            <li style={S.li}><strong>Neon</strong> — hosts the database where your records are saved (servers in the US West region).</li>
            <li style={S.li}><strong>Upstash</strong> — holds the short-lived request counters described above.</li>
          </ul>
          <p style={S.p}>
            Each of these providers has its own privacy practices governing how they handle
            data passed to them for processing.
          </p>

          <h2 style={S.h2}>How Long We Keep It</h2>
          <p style={S.p}>
            Your birth data and calculated results are retained on our server so you can
            re-download your report, keep using the app, or request corrections (for example, if
            your birth time was uncertain and you later confirm it). They stay until you ask us
            to delete them. We do not retain payment card details — that is handled entirely by
            Stripe under their own retention practices. Data stored only on your phone stays
            there until you remove it in the app or delete the app.
          </p>

          <h2 style={S.h2}>Children</h2>
          <p style={S.p}>
            T3D is not directed to children under 13, and you must be at least 13 to use the
            website or the app. We do not knowingly collect personal information from anyone
            under 13. If you believe a child under 13 has given us their details, contact us
            and we will delete them promptly.
          </p>

          <h2 style={S.h2}>Your Rights</h2>
          <p style={S.p}>
            You can request a copy of the data we hold about you, or request that it be
            permanently deleted from our systems, at any time. This includes every chart record
            saved under your email address. To do either, email:
          </p>
          <p style={S.p}>
            <a href="mailto:privacy@3dimensions.guide" style={S.link}>privacy@3dimensions.guide</a>
          </p>
          <p style={S.p}>
            We will respond to deletion requests within a reasonable timeframe and confirm
            once your data has been removed.
          </p>

          <h2 style={S.h2}>Cookies &amp; Analytics</h2>
          <p style={S.p}>
            We use minimal, standard web analytics to understand how visitors use the site.
            We do not use tracking cookies for advertising purposes, and we do not sell
            browsing data to third parties.
          </p>

          <h2 style={S.h2}>Changes to This Policy</h2>
          <p style={S.p}>
            If this policy changes in a way that affects how your data is used, we will
            update the date at the top of this page. Continued use of the site after changes
            are posted constitutes acceptance of the updated policy.
          </p>

          <h2 style={S.h2}>Contact</h2>
          <p style={S.p}>
            Questions about this policy or your data can be sent to{' '}
            <a href="mailto:privacy@3dimensions.guide" style={S.link}>privacy@3dimensions.guide</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
